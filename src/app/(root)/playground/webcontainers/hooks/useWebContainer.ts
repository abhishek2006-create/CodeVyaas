// hooks/useWebContainer.ts
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    WebContainerService.getPreviewUrl(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(!previewUrl);
  const [error, setError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<string>("idle");

  const isInitializing = useRef(false);

  // Listen to server-ready events globally via service
  useEffect(() => {
    const unsubscribe = WebContainerService.onServerReady((_port, url) => {
      setPreviewUrl(url);
      setSetupStatus("ready");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

        // Initial File Tree Sync
        const initialItems = await readDirectoryRecursively(instance, "");
        if (isMounted) {
          setTemplateData({
            type: "folder",
            folderName: templateData?.folderName || "root",
            path: "",
            items: initialItems,
          });
        }

        // Watch for live file edits
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

        // Run `npm install`
        setSetupStatus("installing");
        const installProcess = await instance.spawn("npm", ["install"]);
        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error("npm install failed");
        }

        // Run Vite dev server
        setSetupStatus("starting");
        const devProcess = await instance.spawn("npx", [
          "vite",
          "--host",
          "0.0.0.0",
          "--port",
          "5173",
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
