import { create } from "zustand";
import { toast } from "sonner";
import { TemplateFile, TemplateFolder, OpenFile } from "../components/types";
import { generateFileId } from "../libs";
import WebContainerService from "../webcontainers/service/webContainerService";

interface FileExplorerState {
  playgroundId: string;
  templateData: TemplateFolder | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  editorContent: string;

  // Actions
  setPlaygroundId: (id: string) => void;
  setTemplateData: (data: TemplateFolder | null) => void;
  setEditorContent: (content: string) => void;
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFileId: (fileId: string | null) => void;
  openFile: (file: TemplateFile) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;
  handleAddFile: (
    newFile: TemplateFile,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleAddFolder: (
    newFolder: TemplateFolder,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleDeleteFile: (
    file: TemplateFile,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>,
  ) => Promise<void>;
  updateFileContent: (fileId: string, content: string) => void;
}

export const useFileExplorer = create<FileExplorerState>((set, get) => ({
  templateData: null,
  playgroundId: "",
  openFiles: [] satisfies OpenFile[],
  activeFileId: null,
  editorContent: "",

  setTemplateData: (data) => set({ templateData: data }),
  setPlaygroundId: (id) => set({ playgroundId: id }),
  setEditorContent: (content) => set({ editorContent: content }),
  setOpenFiles: (files) => set({ openFiles: files }),
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),

  openFile: (file) => {
    const fileId = generateFileId(file, get().templateData!);
    const { openFiles } = get();
    const existingFile = openFiles.find((f) => f.id === fileId);

    if (existingFile) {
      set({ activeFileId: fileId, editorContent: existingFile.content });
      return;
    }

    const newOpenFile: OpenFile = {
      ...file,
      type: "file",
      id: fileId,
      hasUnsavedChanges: false,
      originalContent: file.content,
    };

    set((state) => ({
      openFiles: [...state.openFiles, newOpenFile],
      activeFileId: fileId,
      editorContent: file.content || "",
    }));
  },

  closeFile: (fileId) => {
    const { openFiles, activeFileId } = get();
    const newFiles = openFiles.filter((f) => f.id !== fileId);

    let newActiveFileId = activeFileId;
    let newEditorContent = get().editorContent;

    if (activeFileId === fileId) {
      if (newFiles.length > 0) {
        const lastFile = newFiles[newFiles.length - 1];
        newActiveFileId = lastFile.id;
        newEditorContent = lastFile.content;
      } else {
        newActiveFileId = null;
        newEditorContent = "";
      }
    }

    set({
      openFiles: newFiles,
      activeFileId: newActiveFileId,
      editorContent: newEditorContent,
    });
  },

  closeAllFiles: () => {
    set({
      openFiles: [],
      activeFileId: null,
      editorContent: "",
    });
  },

  handleAddFile: async (newFile, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      currentFolder.items.push(newFile);
      set({ templateData: updatedTemplateData });

      await saveTemplateData(updatedTemplateData);

      const filePath = parentPath
        ? `${parentPath}/${newFile.filename}.${newFile.fileExtension}`
        : `${newFile.filename}.${newFile.fileExtension}`;

      await WebContainerService.writeFile(filePath, newFile.content || "");

      toast.success(
        `Created file: ${newFile.filename}.${newFile.fileExtension}`,
      );
      get().openFile(newFile);
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to create file");
    }
  },

  handleAddFolder: async (newFolder, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      currentFolder.items.push(newFolder);
      set({ templateData: updatedTemplateData });

      await saveTemplateData(updatedTemplateData);

      const folderPath = parentPath
        ? `${parentPath}/${newFolder.folderName}`
        : newFolder.folderName;

      await WebContainerService.mkdir(folderPath);

      toast.success(`Created folder: ${newFolder.folderName}`);
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  },

  handleDeleteFile: async (file, parentPath, saveTemplateData) => {
    const { templateData, openFiles } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          item.type !== "file" ||
          item.filename !== file.filename ||
          item.fileExtension !== file.fileExtension,
      );

      const fileId = generateFileId(file, templateData);
      const openFile = openFiles.find((f) => f.id === fileId);

      if (openFile) {
        get().closeFile(fileId);
      }

      set({ templateData: updatedTemplateData });
      await saveTemplateData(updatedTemplateData);

      const filePath = parentPath
        ? `${parentPath}/${file.filename}.${file.fileExtension}`
        : `${file.filename}.${file.fileExtension}`;

      await WebContainerService.rm(filePath);

      toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  },

  handleDeleteFolder: async (folder, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          item.type !== "folder" || item.folderName !== folder.folderName,
      );

      const closeFilesInFolder = (folderItem: TemplateFolder) => {
        folderItem.items.forEach((item) => {
          if (item.type === "file") {
            const fileId = generateFileId(item, templateData);
            get().closeFile(fileId);
          } else if (item.type === "folder") {
            closeFilesInFolder(item);
          }
        });
      };

      closeFilesInFolder(folder);
      set({ templateData: updatedTemplateData });

      await saveTemplateData(updatedTemplateData);

      const folderPath = parentPath
        ? `${parentPath}/${folder.folderName}`
        : folder.folderName;

      await WebContainerService.rm(folderPath);

      toast.success(`Deleted folder: ${folder.folderName}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  },

  handleRenameFile: async (
    file,
    newFilename,
    newExtension,
    parentPath,
    saveTemplateData,
  ) => {
    const { templateData, openFiles, activeFileId } = get();
    if (!templateData) return;

    const oldFileId = generateFileId(file, templateData);
    const newFile: TemplateFile = {
      ...file,
      filename: newFilename,
      fileExtension: newExtension,
    };
    const newFileId = generateFileId(newFile, templateData);

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      const fileIndex = currentFolder.items.findIndex(
        (item) =>
          item.type === "file" &&
          item.filename === file.filename &&
          item.fileExtension === file.fileExtension,
      );

      if (fileIndex !== -1) {
        const updatedFile = {
          ...currentFolder.items[fileIndex],
          filename: newFilename,
          fileExtension: newExtension,
        } as TemplateFile;
        currentFolder.items[fileIndex] = updatedFile;

        const updatedOpenFiles = openFiles.map((f) =>
          f.id === oldFileId
            ? {
                ...f,
                id: newFileId,
                filename: newFilename,
                fileExtension: newExtension,
              }
            : f,
        );

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          activeFileId: activeFileId === oldFileId ? newFileId : activeFileId,
        });

        await saveTemplateData(updatedTemplateData);

        const oldPath = parentPath
          ? `${parentPath}/${file.filename}.${file.fileExtension}`
          : `${file.filename}.${file.fileExtension}`;
        const newPath = parentPath
          ? `${parentPath}/${newFilename}.${newExtension}`
          : `${newFilename}.${newExtension}`;

        await WebContainerService.writeFile(newPath, file.content || "");
        await WebContainerService.rm(oldPath);

        toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  },

  handleRenameFolder: async (
    folder,
    newFolderName,
    parentPath,
    saveTemplateData,
  ) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData),
      ) as TemplateFolder;
      const pathParts = parentPath.split("/").filter(Boolean);
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        const nextFolder = currentFolder.items.find(
          (item) => item.type === "folder" && item.folderName === part,
        ) as TemplateFolder;
        if (nextFolder) currentFolder = nextFolder;
      }

      const folderIndex = currentFolder.items.findIndex(
        (item) =>
          item.type === "folder" && item.folderName === folder.folderName,
      );

      if (folderIndex !== -1) {
        const updatedFolder = {
          ...currentFolder.items[folderIndex],
          folderName: newFolderName,
        } as TemplateFolder;
        currentFolder.items[folderIndex] = updatedFolder;

        set({ templateData: updatedTemplateData });

        await saveTemplateData(updatedTemplateData);

        const oldPath = parentPath
          ? `${parentPath}/${folder.folderName}`
          : folder.folderName;
        const newPath = parentPath
          ? `${parentPath}/${newFolderName}`
          : newFolderName;

        await WebContainerService.mkdir(newPath);
        await WebContainerService.rm(oldPath);

        toast.success(`Renamed folder to: ${newFolderName}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  },

  // Update updateFileContent inside use-file-explorer.ts

  updateFileContent: (fileId, content) => {
    const { openFiles } = get();
    const targetFile = openFiles.find((f) => f.id === fileId);

    set((state) => ({
      openFiles: state.openFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              content,
              hasUnsavedChanges: content !== file.originalContent,
            }
          : file,
      ),
      editorContent:
        fileId === state.activeFileId ? content : state.editorContent,
    }));

    // Direct sync to WebContainer live FS for instant dev-server updates
    if (targetFile) {
      const filePath = targetFile.path
        ? `${targetFile.path}/${targetFile.filename}.${targetFile.fileExtension}`
        : `${targetFile.filename}.${targetFile.fileExtension}`;

      WebContainerService.writeFile(filePath, content).catch((err) =>
        console.error("Error writing to WebContainer live FS:", err),
      );
    }
  },
}));
