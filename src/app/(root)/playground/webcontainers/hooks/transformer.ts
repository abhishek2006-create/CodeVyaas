import { TemplateFolder, TemplateItem } from "../../components/types";

import { FileSystemTree } from "@webcontainer/api";

export function transformToWebContainerFormat(
  template: TemplateFolder,
): FileSystemTree {
  function walk(items: TemplateItem[]): FileSystemTree {
    const tree: FileSystemTree = {};

    for (const item of items) {
      if (item.type === "file") {
        const name = item.fileExtension
          ? `${item.filename}.${item.fileExtension}`
          : item.filename;

        tree[name] = {
          file: {
            contents: item.content,
          },
        };
      } else {
        tree[item.folderName] = {
          directory: walk(item.items),
        };
      }
    }

    return tree;
  }

  return walk(template.items);
}
