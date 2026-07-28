import { NextRequest } from "next/server";
import { readTemplate } from "@/app/(root)/playground/utils/readTemplate";
import { templatePaths } from "@/app/(root)/playground/utils/templatePaths";

function renameProject(tree: any, projectTitle: string) {
  const walk = (items: any[]) => {
    for (const item of items) {
      if (item.type === "file") {
        if (item.filename === "package" && item.fileExtension === "json") {
          const pkg = JSON.parse(item.content);

          pkg.name = projectTitle.toLowerCase().replace(/\s+/g, "-");

          item.content = JSON.stringify(pkg, null, 2);
        }

        if (item.filename === "App" && item.fileExtension === "jsx") {
          item.content = item.content.replace("Vite + React", projectTitle);
        }
      }

      if (item.type === "folder") {
        walk(item.items);
      }
    }
  };

  walk(tree.items);

  return tree;
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ template: string }>;
  },
) {
  try {
    const { template } = await params;

    const projectTitle =
      request.nextUrl.searchParams.get("title") ?? "My React App";

    const templatePath = templatePaths[template as keyof typeof templatePaths];

    if (!templatePath) {
      return Response.json({ error: "Unknown template" }, { status: 404 });
    }

    let tree = await readTemplate(templatePath);

    tree = renameProject(tree, projectTitle);

    return Response.json({
      success: true,
      templateJson: tree,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to load template",
      },
      {
        status: 500,
      },
    );
  }
}
