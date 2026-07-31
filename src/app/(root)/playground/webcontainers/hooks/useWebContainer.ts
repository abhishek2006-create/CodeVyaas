"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer, DirEnt } from "@webcontainer/api";
import WebContainerService from "../service/webContainerService";
import { transformToWebContainerFormat } from "./transformer";
import type { TemplateFolder, TemplateFile } from "../../components/types";
import { usePlayground } from "../../hooks/playground-context";

export interface UseWebContainerOptions {
  templateData: TemplateFolder | null;
  autoStart?: boolean;
  onTerminalData?: (data: string) => void;
}

const TEMPLATE_RUN_COMMANDS: Record<string, { cmd: string; args: string[] }> = {
  react: {
    cmd: "npm",
    args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"],
  },
  vue: {
    cmd: "npm",
    args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"],
  },
  express: { cmd: "npm", args: ["start"] },
  hono: { cmd: "npm", args: ["run", "dev"] },
  nextjs: {
    cmd: "npm",
    args: ["run", "dev", "--", "-h", "0.0.0.0", "-p", "5173"],
  },
  angular: {
    cmd: "npm",
    args: ["start", "--", "--host", "0.0.0.0", "--port", "5173"],
  },
};

export function useWebContainer({
  templateData,
  autoStart = true,
  onTerminalData,
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
  const watcherCleanupRef = useRef<(() => void) | null>(null);

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
        if (entry.name.startsWith(".") || entry.name === "node_modules") {
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

  useEffect(() => {
    if (!templateData || isInitializing.current) return;

    let isMounted = true;
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

        const initialItems = await readDirectoryRecursively(instance, "");
        if (isMounted) {
          setTemplateData({
            type: "folder",
            folderName: templateData?.folderName || "root",
            path: "",
            items: initialItems,
          });
        }

        // File Watcher Setup
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

        watcherCleanupRef.current = () => {
          watcher.close();
          clearTimeout(watchDebounce);
        };

        // Install dependencies
        setSetupStatus("installing");
        if (onTerminalData)
          onTerminalData("\r\n📦 Installing dependencies...\r\n");

        const installProcess = await instance.spawn("npm", [
          "install",
          "--no-audit",
          "--no-fund",
        ]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (onTerminalData) onTerminalData(data);
            },
          }),
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(
            `npm install failed with exit code ${installExitCode}`,
          );
        }

        // Run framework dev server via npm script
        const templateKey = (templateData?.folderName || "react").toLowerCase();
        const runConfig =
          TEMPLATE_RUN_COMMANDS[templateKey] || TEMPLATE_RUN_COMMANDS.react;

        setSetupStatus("starting");
        if (onTerminalData)
          onTerminalData(
            `\r\n⚡ Starting ${templateKey.toUpperCase()} dev server...\r\n`,
          );

        const devProcess = await instance.spawn(runConfig.cmd, runConfig.args);

        devProcess.output
          .pipeTo(
            new WritableStream({
              write(data) {
                if (onTerminalData) {
                  onTerminalData(data);
                }
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
      if (watcherCleanupRef.current) {
        watcherCleanupRef.current();
        watcherCleanupRef.current = null;
      }
    };
  }, [
    templateData,
    autoStart,
    onTerminalData,
    readDirectoryRecursively,
    setTemplateData,
  ]);

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
  };
}

export default useWebContainer;
