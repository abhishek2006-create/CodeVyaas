import { useEffect, useRef, useState } from "react";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import WebContainerService from "../service/webContainerService";
import { transformToWebContainerFormat } from "./transformer";
import type { TemplateFolder, TemplateItem } from "../../components/types";

const generatedDirectories = new Set(["node_modules", ".git", ".next", ".angular", "dist"]);

async function readFiles(container: WebContainer, dir = ""): Promise<TemplateItem[]> {
  const entries = await container.fs.readdir(dir || ".", { withFileTypes: true });
  const items: TemplateItem[] = [];
  for (const entry of entries) {
    if (generatedDirectories.has(entry.name)) continue;
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      items.push({ type: "folder", folderName: entry.name, path: dir, items: await readFiles(container, path) });
    } else if (entry.isFile()) {
      const dot = entry.name.lastIndexOf(".");
      items.push({
        type: "file",
        filename: dot > 0 ? entry.name.slice(0, dot) : entry.name,
        fileExtension: dot > 0 ? entry.name.slice(dot + 1) : "",
        path: dir,
        content: await container.fs.readFile(path, "utf-8"),
      });
    }
  }
  return items;
}

function getStartArguments(scripts: Record<string, string>) {
  const script = scripts.dev ? "dev" : scripts.start ? "start" : null;
  if (!script) throw new Error("Add a dev or start script to package.json to run the preview.");
  const command = scripts[script];
  const args = ["run", script];
  if (/^next\s+dev\b/.test(command)) args.push("--", "--hostname", "0.0.0.0");
  if (/^ng\s+serve\b/.test(command) && !command.includes("--host")) args.push("--", "--host", "0.0.0.0");
  if (/^vite(?:\s|$)/.test(command) && !command.includes("--host")) args.push("--", "--host", "0.0.0.0");
  return args;
}

export function useWebContainer(
  templateData: TemplateFolder | null,
  onFilesChanged: (data: TemplateFolder) => void,
) {
  const latestTemplate = useRef(templateData);
  latestTemplate.current = templateData;
  const onFilesChangedRef = useRef(onFilesChanged);
  onFilesChangedRef.current = onFilesChanged;
  const [attempt, setAttempt] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting the browser runtime…");
  const [error, setError] = useState<string | null>(null);
  const hasTemplate = templateData !== null;

  // File edits are synced through WebContainerService. Only a new project or
  // an explicit retry should mount a template and start another server.
  useEffect(() => {
    const template = latestTemplate.current;
    if (!hasTemplate || !template) return;

    let active = true;
    let process: WebContainerProcess | undefined;
    let unsubscribe: (() => void) | undefined;
    let closeWatcher: (() => void) | undefined;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let timeout: ReturnType<typeof setTimeout>;
    let output = "";

    function stop() {
      if (!active) return;
      active = false;
      clearTimeout(timeout);
      clearTimeout(debounce);
      unsubscribe?.();
      closeWatcher?.();
      process?.kill();
    }

    function fail(message: string) {
      if (!active) return;
      stop();
      setPreviewUrl(null);
      setError(message);
    }

    function showStatus(message: string, timeoutMs: number) {
      setStatus(message);
      clearTimeout(timeout);
      timeout = setTimeout(() => fail(`${message.replace(/…$/, "")} timed out. Retry the preview.`), timeoutMs);
    }

    function trackOutput(currentProcess: WebContainerProcess) {
      output = "";
      return currentProcess.output.pipeTo(new WritableStream<string>({
        write(chunk) { output = (output + chunk).slice(-1200); },
      })).catch(() => undefined);
    }

    async function start() {
      try {
        setError(null);
        setPreviewUrl(null);
        showStatus("Starting the browser runtime…", 60000);
        const container = await WebContainerService.getInstance();
        if (!active) return;
        await container.mount(transformToWebContainerFormat(latestTemplate.current ?? template!));
        if (!active) return;

        const manifest = JSON.parse(await container.fs.readFile("package.json", "utf-8"));
        const args = getStartArguments(manifest.scripts ?? {});
        if (!active) return;
        showStatus("Installing project dependencies…", 120000);
        const install = await container.spawn("npm", ["install"]);
        if (!active) { install.kill(); return; }
        process = install;
        const installOutput = trackOutput(install);
        const installCode = await install.exit;
        if (!active) return;
        if (installCode !== 0) {
          await installOutput;
          fail(output.trim() || `Dependency installation exited with code ${installCode}.`);
          return;
        }

        showStatus("Starting the project server…", 60000);
        unsubscribe = container.on("server-ready", (_port, url) => {
          if (!active) return;
          clearTimeout(timeout);
          unsubscribe?.();
          setPreviewUrl(url);
        });
        const server = await container.spawn("npm", args, {
          env: { HOST: "0.0.0.0" },
        });
        if (!active) { server.kill(); return; }
        process = server;
        const serverOutput = trackOutput(server);

        const watcher = container.fs.watch(".", { recursive: true }, (_event, filename) => {
          if (!active || (typeof filename === "string" &&
            filename.split("/").some((part) => generatedDirectories.has(part)))) return;
          clearTimeout(debounce);
          debounce = setTimeout(async () => {
            try {
              const items = await readFiles(container);
              if (active) onFilesChangedRef.current({ ...template!, items });
            } catch (err) {
              console.warn("Could not refresh playground files:", err);
            }
          }, 800);
        });
        closeWatcher = () => watcher.close();

        const exitCode = await server.exit;
        if (active) {
          await serverOutput;
          fail(output.trim() || `The project server exited with code ${exitCode}.`);
        }
      } catch (err) {
        fail(err instanceof Error ? err.message : String(err));
      }
    }

    void start();
    return stop;
  }, [hasTemplate, attempt]);

  return {
    previewUrl,
    status,
    error,
    retry: () => setAttempt((current) => current + 1),
  };
}
