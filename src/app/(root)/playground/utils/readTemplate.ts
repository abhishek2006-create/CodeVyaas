import fs from "fs/promises";
import path from "path";
import type {
  TemplateFolder,
  TemplateFile,
  TemplateItem,
} from "../components/types";

async function readDirectory(dir: string): Promise<TemplateItem[]> {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const items: TemplateItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const folder: TemplateFolder = {
        type: "folder",
        folderName: entry.name,
        items: await readDirectory(fullPath),
      };

      items.push(folder);
      continue;
    }

    const ext = path.extname(entry.name);

    const file: TemplateFile = {
      type: "file",
      filename: path.basename(entry.name, ext),
      fileExtension: ext.slice(1),
      content: await fs.readFile(fullPath, "utf8"),
    };

    items.push(file);
  }

  return items;
}

export async function readTemplate(
  templatePath: string,
): Promise<TemplateFolder> {
  return {
    type: "folder",
    folderName: "Root",
    items: await readDirectory(templatePath),
  };
}
