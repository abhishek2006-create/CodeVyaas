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
// import ToggleAI from "../components/toggle-ai";

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

  // File system operations
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

  // File operations (needed for explorer)
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
        const parsedContent = JSON.parse(rawContent);
        setTemplateData(parsedContent);
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
        console.log(playgroundData.template);
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

        setTemplateData(templateJson);
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
        await saveUpdatedCode({
          playgroundId: id as Id<"playgrounds">,
          content: JSON.stringify(data),
        });
        setTemplateData(data);
        // Clear unsaved changes flag for all open files if needed,
        // but usually we save specific files.
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
          ...file,
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
      if (!activeFileId) return;
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
    },
    [activeFileId],
  );

  const handleSaveAll = useCallback(async () => {
    if (!templateData) return;

    // Deep copy templateData and update with content from openFiles
    const updatedTemplate = JSON.parse(
      JSON.stringify(templateData),
    ) as TemplateFolder;

    const updateItems = (
      items: (TemplateFile | TemplateFolder)[],
      currentFolder: TemplateFolder,
    ) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === "file") {
          const fileId = generateFileId(item, currentFolder); // FIXED
          const openFile = openFiles.find((f) => fileId === f.id);
          if (openFile) {
            item.content = openFile.content;
          }
        } else {
          updateItems(item.items, item);
        }
      }
    };

    updateItems(updatedTemplate.items, updatedTemplate);
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

      const findAndAdd = (folder: TemplateFolder, path: string) => {
        const currentPath = folder.folderName;
        if (currentPath === path || path === "") {
          folder.items.push(newFile);
          return true;
        }
        for (const item of folder.items) {
          if (item.type === "folder") {
            const fullPath =
              path === "" ? item.folderName : `${path}/${item.folderName}`;
            // This is a bit simplified, but parentPath is usually absolute from root
            // Let's assume parentPath is matched against folder names for now or full paths
            if (findAndAdd(item, path)) return true;
          }
        }
        return false;
      };

      // Need a better path matcher if parentPath is complex.
      // For now, let's just use the logic from useFileExplorer if possible or a simple version.
      // If parentPath is the root folder name:
      if (updated.folderName === parentPath) {
        updated.items.push(newFile);
      } else {
        // Recursive find
        const addToFileSystem = (
          items: (TemplateFile | TemplateFolder)[],
          targetPath: string,
        ): boolean => {
          for (const item of items) {
            if (item.type === "folder") {
              // simplified path matching
              if (item.folderName === targetPath.split("/").pop()) {
                item.items.push(newFile);
                return true;
              }
              if (addToFileSystem(item.items, targetPath)) return true;
            }
          }
          return false;
        };
        addToFileSystem(updated.items, parentPath);
      }

      await saveTemplateData(updated);
    },
    [templateData, saveTemplateData],
  );

  const handleAddFolder = useCallback(
    async (newFolder: TemplateFolder, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      // same logic as add file
      if (updated.folderName === parentPath) {
        updated.items.push(newFolder);
      } else {
        const addToFS = (items: any[], target: string): boolean => {
          for (const item of items) {
            if (item.type === "folder") {
              if (item.folderName === target.split("/").pop()) {
                item.items.push(newFolder);
                return true;
              }
              if (addToFS(item.items, target)) return true;
            }
          }
          return false;
        };
        addToFS(updated.items, parentPath);
      }
      await saveTemplateData(updated);
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

      // Also close if it was open
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
    },
    [templateData, saveTemplateData],
  );

  const handleRenameFolder = useCallback(
    async (folder: TemplateFolder, newName: string, parentPath: string) => {
      if (!templateData) return;
      const updated = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
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
