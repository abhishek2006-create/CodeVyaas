import { TemplateFolder } from "../components/types";
import { sanitizePackageName } from "./replaceProjectName";

export function injectProjectName(
  tree: TemplateFolder,
  projectName: string,
): TemplateFolder {
  const packageName = sanitizePackageName(projectName);

  function walk(folder: TemplateFolder): TemplateFolder {
    return {
      ...folder,
      items: folder.items.map((item) => {
        if (item.type === "folder") {
          return walk(item);
        }

        if (item.filename === "package" && item.fileExtension === "json") {
          return {
            ...item,
            content: item.content.replaceAll("__PROJECT_NAME__", packageName),
          };
        }

        return item;
      }),
    };
  }

  return walk(tree);
}
