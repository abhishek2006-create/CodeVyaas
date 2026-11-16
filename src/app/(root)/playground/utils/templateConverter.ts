// src/utils/templateConverter.ts
import type { FileSystemTree } from "@webcontainer/api";
import type { TemplateFolder } from "../components/types";

/**
 * Converts your TemplateFolder UI structure into WebContainer FileSystemTree
 */
export function convertToWebContainerTree(
  folder: TemplateFolder,
): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const item of folder.items) {
    if (item.type === "file") {
      // Build file entry with proper filename + extension
      const fileName = item.fileExtension
        ? `${item.filename}.${item.fileExtension}`
        : item.filename;

      tree[fileName] = {
        file: {
          contents: item.content,
        },
      };
    } else if (item.type === "folder") {
      // Recursively process subfolders
      tree[item.folderName] = {
        directory: convertToWebContainerTree(item), // Returns FileSystemTree directly
      };
    }
  }

  return tree; // Returns the clean FileSystemTree object
}
