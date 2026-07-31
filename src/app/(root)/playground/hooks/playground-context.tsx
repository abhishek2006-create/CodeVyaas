import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import type {
  TemplateFile,
  TemplateFolder,
  PlaygroundData,
  OpenFile,
} from "../components/types";
import { generateFileId } from "../libs";
import WebContainerService from "../webcontainers/service/webContainerService";
import { populatePaths } from "../utils/fileTree";

interface PlaygroundContextType {
  playgroundData: PlaygroundData | null | undefined;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;

  // File state
  openFiles: OpenFile[];
  activeFileId: string | null;
  activeFile: OpenFile | null;

  // UI state
  isPreviewVisible: boolean;
  isTerminalVisible: boolean;
  isAISuggestionsEnabled: boolean;

  // Actions
  setActiveFileId: (id: string | null) => void;
  openFile: (file: TemplateFile) => void;
  closeFile: (id: string) => void;
  closeAllFiles: () => void;
  updateActiveFileContent: (content: string) => void;
  handleSave: () => Promise<void>;
  handleSaveAll: () => Promise<void>;

  // Unified File system operations
  handleAddFile: (file: TemplateFile, parentPath: string) => Promise<void>;
  handleAddFolder: (
    folder: TemplateFolder,
    parentPath: string,
  ) => Promise<void>;
  handleDeleteFile: (file: TemplateFile, parentPath: string) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newName: string,
    newExt: string,
    parentPath: string,
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newName: string,
    parentPath: string,
  ) => Promise<void>;

  setIsPreviewVisible: (visible: boolean) => void;
  setIsTerminalVisible: (visible: boolean) => void;
  setIsAISuggestionsEnabled: (enabled: boolean) => void;

  setTemplateData: (data: TemplateFolder | null) => void;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(
  undefined,
);

export function PlaygroundProvider({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const playgroundData = useQuery(api.playground.action.getPlayground, {
    id: id as Id<"playgrounds">,
  });
  const saveUpdatedCode = useMutation(api.playground.action.saveUpdatedCode);

  // 💡 FIX 1: Initialize templateData as TemplateFolder | null (starts as null while loading)
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File state
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // UI state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [isAISuggestionsEnabled, setIsAISuggestionsEnabled] = useState(false);

  const activeFile = useMemo(() => {
    return openFiles.find((f) => f.id === activeFileId) || null;
  }, [openFiles, activeFileId]);

  useEffect(() => {
    if (playgroundData === undefined) {
      setIsLoading(true);
      return;
    }

    if (playgroundData === null) {
      setError("Playground not found");
      setIsLoading(false);
      return;
    }

    const rawContent = playgroundData.templateFiles?.[0]?.content;
    if (typeof rawContent === "string") {
      try {
        const parsedContent: TemplateFolder = JSON.parse(rawContent);
        // 💡 FIX 2: Wrap parsed json with populatePaths before setting state
        setTemplateData(populatePaths(parsedContent));
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing template:", err);
        setError("Failed to parse playground data");
        setIsLoading(false);
      }
      return;
    }

    const loadTemplate = async () => {
      try {
        if (!playgroundData.template) {
          throw new Error("Playground template is missing");
        }
        const template = playgroundData.template.toLowerCase();

        const res = await fetch(
          `/api/template/${template}?title=${encodeURIComponent(
            playgroundData.title,
          )}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to load template (${res.status})`);
        }

        const { templateJson } = await res.json();
        // 💡 FIX 3: Wrap fetched template with populatePaths before setting state
        setTemplateData(populatePaths(templateJson));
      } catch (err) {
        console.error("Error loading template:", err);
        setError("Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [playgroundData, id]);

  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        // Ensure path hierarchy remains populated when updating
        const processedData = populatePaths(data);
        await saveUpdatedCode({
          playgroundId: id as Id<"playgrounds">,
          content: JSON.stringify(processedData),
        });
        setTemplateData(processedData);
        toast.success("Changes saved successfully");
      } catch (error) {
        console.error("Error saving template data:", error);
        toast.error("Failed to save changes");
        throw error;
      }
    },
    [id, saveUpdatedCode],
  );

  const openFile = useCallback(
    (file: TemplateFile) => {
      if (!templateData) return;
      const fileId = generateFileId(file, templateData);

      setOpenFiles((prev) => {
        const existing = prev.find((f) => f.id === fileId);
        if (existing) return prev;

        const newOpenFile: OpenFile = {
          type: "file",
          filename: file.filename,
          fileExtension: file.fileExtension,
          content: file.content,
          path: file.path,
          id: fileId,
          hasUnsavedChanges: false,
          originalContent: file.content,
        };

        return [...prev, newOpenFile];
      });

      setActiveFileId(fileId);
    },
    [templateData],
  );

  const closeFile = useCallback(
    (fileId: string) => {
      setOpenFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== fileId);
        if (activeFileId === fileId) {
          setActiveFileId(
            filtered.length > 0 ? filtered[filtered.length - 1].id : null,
          );
        }
        return filtered;
      });
    },
    [activeFileId],
  );

  const closeAllFiles = useCallback(() => {
    setOpenFiles([]);
    setActiveFileId(null);
  }, []);

  const updateActiveFileContent = useCallback(
    (content: string) => {
      if (!activeFileId || !templateData) return;

      const file = openFiles.find((f) => f.id === activeFileId);

      setOpenFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                content,
                hasUnsavedChanges: content !== f.originalContent,
              }
            : f,
        ),
      );

      if (file) {
        const parentPath = file.path || "";
        const filePath = parentPath
          ? `${parentPath}/${file.filename}.${file.fileExtension}`
          : `${file.filename}.${file.fileExtension}`;

        WebContainerService.writeFile(filePath, content).catch((err) =>
          console.error("Failed to hot-sync file to WebContainer:", err),
        );
      }
    },
    [activeFileId, openFiles, templateData],
  );

  const handleSaveAll = useCallback(async () => {
    if (!templateData) return;

    const updatedTemplate = JSON.parse(
      JSON.stringify(templateData),
    ) as TemplateFolder;

    const updateAndSync = async (
      items: (TemplateFile | TemplateFolder)[],
      currentFolder: TemplateFolder,
      currentPath: string,
    ) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === "file") {
          const fileId = generateFileId(item, currentFolder);
          const openFile = openFiles.find((f) => fileId === f.id);
          if (openFile) {
            item.content = openFile.content;
            const fullFilePath = currentPath
              ? `${currentPath}/${item.filename}.${item.fileExtension}`
              : `${item.filename}.${item.fileExtension}`;
            await WebContainerService.writeFile(fullFilePath, item.content);
          }
        } else {
          const folderPath = currentPath
            ? `${currentPath}/${item.folderName}`
            : item.folderName;
          await updateAndSync(item.items, item, folderPath);
        }
      }
    };

    await updateAndSync(updatedTemplate.items, updatedTemplate, "");
    await saveTemplateData(updatedTemplate);

    setOpenFiles((prev) =>
      prev.map((f) => ({
        ...f,
        hasUnsavedChanges: false,
        originalContent: f.content,
      })),
    );
  }, [templateData, openFiles, saveTemplateData]);

  const handleSave = useCallback(async () => {
    if (!activeFile || !templateData) return;
    await handleSaveAll();
  }, [activeFile, handleSaveAll, templateData]);

  const handleAddFile = useCallback(
    async (newFile: TemplateFile, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const addToFS = (folder: TemplateFolder, path: string): boolean => {
        if (folder.folderName === path || path === "") {
          folder.items.push(newFile);
          return true;
        }
        for (const item of folder.items) {
          if (item.type === "folder") {
            const subPath = path.startsWith(`${folder.folderName}/`)
              ? path.substring(folder.folderName.length + 1)
              : path;
            if (addToFS(item, subPath)) return true;
          }
        }
        return false;
      };

      addToFS(updated, parentPath);
      await saveTemplateData(updated);

      const filePath = parentPath
        ? `${parentPath}/${newFile.filename}.${newFile.fileExtension}`
        : `${newFile.filename}.${newFile.fileExtension}`;
      await WebContainerService.writeFile(filePath, newFile.content || "");
    },
    [templateData, saveTemplateData],
  );

  const handleAddFolder = useCallback(
    async (newFolder: TemplateFolder, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const addToFS = (folder: TemplateFolder, path: string): boolean => {
        if (folder.folderName === path || path === "") {
          folder.items.push(newFolder);
          return true;
        }
        for (const item of folder.items) {
          if (item.type === "folder") {
            const subPath = path.startsWith(`${folder.folderName}/`)
              ? path.substring(folder.folderName.length + 1)
              : path;
            if (addToFS(item, subPath)) return true;
          }
        }
        return false;
      };

      addToFS(updated, parentPath);
      await saveTemplateData(updated);

      const folderPath = parentPath
        ? `${parentPath}/${newFolder.folderName}`
        : newFolder.folderName;
      await WebContainerService.mkdir(folderPath);
    },
    [templateData, saveTemplateData],
  );

  const handleDeleteFile = useCallback(
    async (file: TemplateFile, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const deleteFromFS = (items: any[]): boolean => {
        const index = items.findIndex(
          (item) =>
            item.type === "file" &&
            item.filename === file.filename &&
            item.fileExtension === file.fileExtension,
        );
        if (index > -1) {
          items.splice(index, 1);
          return true;
        }
        for (const item of items) {
          if (item.type === "folder") {
            if (deleteFromFS(item.items)) return true;
          }
        }
        return false;
      };

      deleteFromFS(updated.items);
      await saveTemplateData(updated);

      const filePath = parentPath
        ? `${parentPath}/${file.filename}.${file.fileExtension}`
        : `${file.filename}.${file.fileExtension}`;
      await WebContainerService.rm(filePath);

      const fileId = generateFileId(file, templateData);
      closeFile(fileId);
    },
    [templateData, saveTemplateData, closeFile],
  );

  const handleDeleteFolder = useCallback(
    async (folder: TemplateFolder, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const deleteFolderFromFS = (items: any[]): boolean => {
        const index = items.findIndex(
          (item) =>
            item.type === "folder" && item.folderName === folder.folderName,
        );
        if (index > -1) {
          items.splice(index, 1);
          return true;
        }
        for (const item of items) {
          if (item.type === "folder") {
            if (deleteFolderFromFS(item.items)) return true;
          }
        }
        return false;
      };

      deleteFolderFromFS(updated.items);
      await saveTemplateData(updated);

      const folderPath = parentPath
        ? `${parentPath}/${folder.folderName}`
        : folder.folderName;
      await WebContainerService.rm(folderPath);
    },
    [templateData, saveTemplateData],
  );

  const handleRenameFile = useCallback(
    async (
      file: TemplateFile,
      newName: string,
      newExt: string,
      parentPath: string,
    ) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const oldPath = parentPath
        ? `${parentPath}/${file.filename}.${file.fileExtension}`
        : `${file.filename}.${file.fileExtension}`;
      const newPath = parentPath
        ? `${parentPath}/${newName}.${newExt}`
        : `${newName}.${newExt}`;

      const renameInFS = (items: any[]): boolean => {
        const target = items.find(
          (item) =>
            item.type === "file" &&
            item.filename === file.filename &&
            item.fileExtension === file.fileExtension,
        );
        if (target) {
          target.filename = newName;
          target.fileExtension = newExt;
          return true;
        }
        for (const item of items) {
          if (item.type === "folder") {
            if (renameInFS(item.items)) return true;
          }
        }
        return false;
      };

      renameInFS(updated.items);
      await saveTemplateData(updated);

      await WebContainerService.writeFile(newPath, file.content || "");
      await WebContainerService.rm(oldPath);
    },
    [templateData, saveTemplateData],
  );

  const handleRenameFolder = useCallback(
    async (folder: TemplateFolder, newName: string, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;

      const oldPath = parentPath
        ? `${parentPath}/${folder.folderName}`
        : folder.folderName;
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;

      const renameFolderInFS = (items: any[]): boolean => {
        const target = items.find(
          (item) =>
            item.type === "folder" && item.folderName === folder.folderName,
        );
        if (target) {
          target.folderName = newName;
          return true;
        }
        for (const item of items) {
          if (item.type === "folder") {
            if (renameFolderInFS(item.items)) return true;
          }
        }
        return false;
      };

      renameFolderInFS(updated.items);
      await saveTemplateData(updated);

      await WebContainerService.mkdir(newPath);
      await WebContainerService.rm(oldPath);
    },
    [templateData, saveTemplateData],
  );

  const value = {
    playgroundData,
    templateData,
    isLoading,
    error,
    openFiles,
    activeFileId,
    activeFile,
    isPreviewVisible,
    isTerminalVisible,
    isAISuggestionsEnabled,
    setActiveFileId,
    openFile,
    closeFile,
    closeAllFiles,
    updateActiveFileContent,
    handleSave,
    handleSaveAll,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    setIsPreviewVisible,
    setIsTerminalVisible,
    setIsAISuggestionsEnabled,
    setTemplateData,
    saveTemplateData,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }
  return context;
};
