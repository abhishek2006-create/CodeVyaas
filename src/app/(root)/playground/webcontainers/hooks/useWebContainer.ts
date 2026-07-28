import { useState, useEffect, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "../../components/types";
import WebContainerService from "../service/webContainerService";

interface UseWebContainerProps {
  templateData: TemplateFolder | null;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;
    WebContainerService.useInstance();

    async function initializeWebContainer() {
      try {
        const webcontainerInstance =
          await WebContainerService.getWebContainer();

        if (!mounted) return;

        setInstance(webcontainerInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize WebContainer:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to initialize WebContainer",
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mounted = false;
      WebContainerService.releaseInstance();
    };
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      try {
        await WebContainerService.writeToFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [],
  );

  const destroy = useCallback(() => {
    WebContainerService.teardown();
    setInstance(null);
    setServerUrl(null);
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};
