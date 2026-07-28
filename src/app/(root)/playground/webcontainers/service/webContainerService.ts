import { WebContainer } from "@webcontainer/api";

// Singleton class to manage WebContainer instance
class WebContainerService {
  private static instance: WebContainerService | null = null;
  private webcontainerInstance: WebContainer | null = null;
  private bootPromise: Promise<WebContainer> | null = null;
  private activeUsers = 0;

  private constructor() {}

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async getWebContainer(): Promise<WebContainer> {
    if (this.webcontainerInstance) {
      return this.webcontainerInstance;
    }

    if (this.bootPromise) {
      return this.bootPromise;
    }

    this.bootPromise = (async () => {
      try {
        console.log("Booting WebContainer...");
        const instance = await WebContainer.boot();
        console.log("WebContainer booted");
        this.webcontainerInstance = instance;
        return instance;
      } catch (error) {
        this.bootPromise = null;
        throw error;
      }
    })();

    return this.bootPromise;
  }

  public async mountFiles(files: any): Promise<void> {
    const instance = await this.getWebContainer();
    await instance.mount(files);
  }

  public async writeToFile(path: string, content: string): Promise<void> {
    const instance = await this.getWebContainer();

    // Ensure parent directory exists
    const pathParts = path.split("/");
    if (pathParts.length > 1) {
      const dirPath = pathParts.slice(0, -1).join("/");
      await instance.fs.mkdir(dirPath, { recursive: true });
    }

    await instance.fs.writeFile(path, content);
  }

  public async readFile(path: string): Promise<string> {
    const instance = await this.getWebContainer();
    return await instance.fs.readFile(path, "utf-8");
  }

  public async spawn(
    command: string,
    args: string[] = [],
    options?: any,
  ): Promise<any> {
    const instance = await this.getWebContainer();
    return instance.spawn(command, args, options);
  }

  public onServerReady(
    callback: (port: number, url: string) => void,
  ): () => void {
    let cleanup: (() => void) | undefined;

    this.getWebContainer().then((instance) => {
      const listener = instance.on("server-ready", callback);
      cleanup = () => {
        // Unfortunately @webcontainer/api doesn't return a clear off() method
        // for "server-ready" in all versions, but we can manage it if needed.
        // In the current API, it's a standard EventEmitter style or a callback.
      };
    });

    return () => cleanup?.();
  }

  public useInstance(): void {
    this.activeUsers++;
  }

  public releaseInstance(): void {
    this.activeUsers--;
    if (this.activeUsers <= 0) {
      // We might want to keep it alive for a while to speed up subsequent loads
      // For now, let's keep it simple.
    }
  }

  public teardown(): void {
    if (this.webcontainerInstance) {
      this.webcontainerInstance.teardown();
      this.webcontainerInstance = null;
    }
    this.bootPromise = null;
    this.activeUsers = 0;
  }
}

export default WebContainerService.getInstance();
