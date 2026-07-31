import { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer, DirEnt } from "@webcontainer/api";
import WebContainerService from "../service/webContainerService";
import { transformToWebContainerFormat } from "../hooks/transformer";
import type { TemplateFolder, TemplateFile } from "../../components/types";
import { usePlayground } from "../../hooks/playground-context";

export interface UseWebContainerOptions {
  templateData: TemplateFolder | null;
  autoStart?: boolean;
}

export function useWebContainer({
  templateData,
  autoStart = true,
}: UseWebContainerOptions) {
  const { setTemplateData } = usePlayground();
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<string>("idle");

  const isInitializing = useRef(false);

  // Read WebContainer Virtual FS into React File Tree
  const readDirectoryRecursively = useCallback(
    async (
      instance: WebContainer,
      dirPath: string = "",
    ): Promise<(TemplateFile | TemplateFolder)[]> => {
      const items: (TemplateFile | TemplateFolder)[] = [];
      const entries = (await instance.fs.readdir(dirPath || ".", {
        withFileTypes: true,
      })) as DirEnt<string>[];

      for (const entry of entries) {
        // 🚨 Hidden files (.git, .vite) filter.
        // NOTE: Remove `entry.name === "node_modules"` if you REALLY want node_modules in explorer.
        if (entry.name.startsWith(".")) {
          continue;
        }

        const fullPath = dirPath ? `${dirPath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          const subItems = await readDirectoryRecursively(instance, fullPath);
          items.push({
            type: "folder",
            folderName: entry.name,
            path: dirPath,
            items: subItems,
          });
        } else if (entry.isFile()) {
          const lastDot = entry.name.lastIndexOf(".");
          const filename =
            lastDot > 0 ? entry.name.substring(0, lastDot) : entry.name;
          const fileExtension =
            lastDot > 0 ? entry.name.substring(lastDot + 1) : "";

          let content = "";
          try {
            content = await instance.fs.readFile(fullPath, "utf-8");
          } catch {
            content = "";
          }

          items.push({
            type: "file",
            filename,
            fileExtension,
            content,
            path: dirPath,
          });
        }
      }
      return items;
    },
    [],
  );

  const refreshFileSystem = useCallback(async () => {
    if (!container) return;
    try {
      const items = await readDirectoryRecursively(container, "");
      setTemplateData({
        type: "folder",
        folderName: templateData?.folderName || "root",
        path: "",
        items,
      });
    } catch (err) {
      console.error("Failed to refresh filesystem:", err);
    }
  }, [container, templateData, readDirectoryRecursively, setTemplateData]);

  useEffect(() => {
    if (!templateData || isInitializing.current) return;

    let isMounted = true;
    let watcherCleanup: (() => void) | null = null;
    isInitializing.current = true;

    async function initializeContainer() {
      try {
        setIsLoading(true);
        setError(null);
        setSetupStatus("mounting");

        const files = transformToWebContainerFormat(templateData!);
        const instance = await WebContainerService.setup(files);

        if (!isMounted) return;
        setContainer(instance);

        // 1. Capture live proxied URL from WebContainer
        instance.on("server-ready", (port, url) => {
          if (isMounted) {
            console.log(`[WebContainer] Server ready at port ${port}: ${url}`);
            setPreviewUrl(url);
            setSetupStatus("ready");
            setIsLoading(false);
          }
        });

        // 2. Initial File Tree Sync (passing instance directly)
        const initialItems = await readDirectoryRecursively(instance, "");
        if (isMounted) {
          setTemplateData({
            type: "folder",
            folderName: templateData?.folderName || "root",
            path: "",
            items: initialItems,
          });
        }

        // 3. Watch for live file edits
        let watchDebounce: NodeJS.Timeout;
        const watcher = instance.fs.watch("/", { recursive: true }, () => {
          clearTimeout(watchDebounce);
          watchDebounce = setTimeout(async () => {
            if (isMounted) {
              const updatedItems = await readDirectoryRecursively(instance, "");
              setTemplateData({
                type: "folder",
                folderName: templateData?.folderName || "root",
                path: "",
                items: updatedItems,
              });
            }
          }, 800);
        });

        watcherCleanup = () => {
          watcher.close();
          clearTimeout(watchDebounce);
        };

        // 4. Run `npm install`
        setSetupStatus("installing");
        const installProcess = await instance.spawn("npm", ["install"]);
        await installProcess.exit;

        // Force a tree refresh after npm install completes
        const postInstallItems = await readDirectoryRecursively(instance, "");
        if (isMounted) {
          setTemplateData({
            type: "folder",
            folderName: templateData?.folderName || "root",
            path: "",
            items: postInstallItems,
          });
        }

        // 5. Run Vite server
        setSetupStatus("starting");
        const devProcess = await instance.spawn("npx", [
          "vite",
          "--host",
          "0.0.0.0",
          "--port",
          "5173",
          "--strictPort",
        ]);

        devProcess.output
          .pipeTo(
            new WritableStream({
              write(data) {
                console.log("[Vite Console]:", data);
              },
            }),
          )
          .catch(() => {});
      } catch (err) {
        console.error("WebContainer Error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setSetupStatus("error");
          setIsLoading(false);
        }
      } finally {
        isInitializing.current = false;
      }
    }

    if (autoStart) {
      initializeContainer();
    }

    return () => {
      isMounted = false;
      if (watcherCleanup) watcherCleanup();
    };
  }, [templateData, autoStart]);

  const writeFile = useCallback(async (path: string, content: string) => {
    await WebContainerService.writeFile(path, content);
  }, []);

  return {
    container,
    previewUrl,
    isLoading,
    error,
    setupStatus,
    writeFile,
    refreshFileSystem,
  };
}

export default useWebContainer;
