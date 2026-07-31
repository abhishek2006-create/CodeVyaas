import { TemplateFolder, TemplateFile } from "../components/types";

/**
 * Recursively populates path properties throughout the entire template tree.
 */
export function populatePaths(
  folder: TemplateFolder,
  currentPath: string = "",
): TemplateFolder {
  return {
    ...folder,
    path: currentPath,
    items: folder.items.map((item) => {
      if (item.type === "file") {
        return {
          ...item,
          path: currentPath,
        } as TemplateFile;
      } else {
        const nextPath = currentPath
          ? `${currentPath}/${item.folderName}`
          : item.folderName;
        return populatePaths(item, nextPath);
      }
    }),
  };
}
