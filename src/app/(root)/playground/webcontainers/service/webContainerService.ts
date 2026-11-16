// service/webContainerService.ts
import { WebContainer } from "@webcontainer/api";

class WebContainerService {
  private static instance: WebContainer | null = null;
  private static bootPromise: Promise<WebContainer> | null = null;
  public static async getInstance(): Promise<WebContainer> {
    if (this.instance) {
      return this.instance;
    }

    if (!this.bootPromise) {
      if (!window.crossOriginIsolated) {
        throw new Error("The playground needs a secure, isolated tab. Reopen the project from Development.");
      }
      this.bootPromise = WebContainer.boot({ coep: "require-corp" }).then((container) => {
        this.instance = container;
        return container;
      }).catch((error: unknown) => {
        this.bootPromise = null;
        throw error;
      });
    }

    return this.bootPromise;
  }

  public static async readdir(dirPath: string = ""): Promise<string[]> {
    if (!this.instance) return [];
    const cleanPath = dirPath.replace(/^\/+/, "");
    try {
      const entries = await this.instance.fs.readdir(cleanPath, {
        withFileTypes: true,
      });
      return entries
        .filter(
          (entry) =>
            entry.name !== "node_modules" && !entry.name.startsWith("."),
        )
        .map((entry) => entry.name);
    } catch (err) {
      console.error("Failed to read directory from WebContainer:", err);
      return [];
    }
  }

  public static async writeFile(
    filePath: string,
    content: string,
  ): Promise<void> {
    if (!this.instance) return;
    const cleanPath = filePath.replace(/^\/+/, "");
    await this.instance.fs.writeFile(cleanPath, content);
  }

  public static async mkdir(dirPath: string): Promise<void> {
    if (!this.instance) return;
    const cleanPath = dirPath.replace(/^\/+/, "");
    await this.instance.fs.mkdir(cleanPath, { recursive: true });
  }

  public static async rm(targetPath: string): Promise<void> {
    if (!this.instance) return;
    const cleanPath = targetPath.replace(/^\/+/, "");
    await this.instance.fs.rm(cleanPath, { recursive: true, force: true });
  }
}

export default WebContainerService;
