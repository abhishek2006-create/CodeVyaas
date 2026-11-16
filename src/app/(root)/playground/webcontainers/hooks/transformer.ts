import type { FileSystemTree } from "@webcontainer/api";
import type { TemplateFolder } from "../../components/types";

export function transformToWebContainerFormat(
  folder: TemplateFolder,
): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const item of folder.items) {
    if (item.type === "file") {
      const fileName = item.fileExtension
        ? `${item.filename}.${item.fileExtension}`
        : item.filename;

      tree[fileName] = {
        file: {
          contents: item.content || "",
        },
      };
    } else if (item.type === "folder") {
      tree[item.folderName] = {
        directory: transformToWebContainerFormat(item),
      };
    }
  }

  return tree;
}
