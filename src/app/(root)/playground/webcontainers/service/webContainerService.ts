import { WebContainer } from "@webcontainer/api";
import type { FileSystemTree } from "@webcontainer/api";

class WebContainerService {
  private static instance: WebContainer | null = null;
  private static bootPromise: Promise<WebContainer> | null = null;
  private static previewUrl: string | null = null;
  private static serverReadyCallbacks: Array<
    (port: number, url: string) => void
  > = [];

  public static async getInstance(): Promise<WebContainer> {
    if (this.instance) {
      return this.instance;
    }

    if (!this.bootPromise) {
      this.bootPromise = (async () => {
        const container = await WebContainer.boot();
        this.instance = container;

        container.on("server-ready", (port, url) => {
          console.log(
            `[WebContainerService] Server ready at port ${port}: ${url}`,
          );
          this.previewUrl = url;
          this.serverReadyCallbacks.forEach((cb) => cb(port, url));
        });

        return container;
      })();
    }

    return this.bootPromise;
  }

  public static async setup(files: FileSystemTree): Promise<WebContainer> {
    const container = await this.getInstance();
    await container.mount(files);
    return container;
  }

  public static getPreviewUrl(): string | null {
    return this.previewUrl;
  }

  public static onServerReady(
    callback: (port: number, url: string) => void,
  ): () => void {
    this.serverReadyCallbacks.push(callback);
    if (this.previewUrl) {
      callback(5173, this.previewUrl);
    }
    return () => {
      this.serverReadyCallbacks = this.serverReadyCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  public static async writeFile(
    filePath: string,
    content: string,
  ): Promise<void> {
    if (!this.instance) return;
    const cleanPath = filePath.replace(/^\/+/, "");
    await this.instance.fs.writeFile(cleanPath, content);
  }
}

export default WebContainerService;
