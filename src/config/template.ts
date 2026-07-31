// src/config/templates.ts
import path from "path";

export type TemplateKey =
  "react" | "nextjs" | "express" | "vue" | "hono" | "angular";

export interface TemplateConfig {
  name: string;
  installCmd: string;
  installArgs: string[];
  devCmd: string;
  devArgs: string[];
  port: number;
}

export const templatePaths: Record<TemplateKey, string> = {
  react: path.join(process.cwd(), "src/templates/react"),
  nextjs: path.join(process.cwd(), "src/templates/nextjs"),
  express: path.join(process.cwd(), "src/templates/express"),
  vue: path.join(process.cwd(), "src/templates/vue"),
  hono: path.join(process.cwd(), "src/templates/hono"),
  angular: path.join(process.cwd(), "src/templates/angular"),
};

export const templateRunConfigs: Record<TemplateKey, TemplateConfig> = {
  react: {
    name: "React (Vite)",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "npx",
    devArgs: ["vite", "--host", "0.0.0.0", "--port", "5173"],
    port: 5173,
  },
  vue: {
    name: "Vue (Vite)",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "npx",
    devArgs: ["vite", "--host", "0.0.0.0", "--port", "5173"],
    port: 5173,
  },
  express: {
    name: "Express.js",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "node",
    devArgs: ["server.js"],
    port: 5173,
  },
  hono: {
    name: "Hono",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "npx",
    devArgs: ["tsx", "index.ts"],
    port: 5173,
  },
  nextjs: {
    name: "Next.js",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "npx",
    devArgs: ["next", "dev", "-h", "0.0.0.0", "-p", "5173"],
    port: 5173,
  },
  angular: {
    name: "Angular",
    installCmd: "npm",
    installArgs: ["install"],
    devCmd: "npx",
    devArgs: [
      "ng",
      "serve",
      "--host",
      "0.0.0.0",
      "--port",
      "5173",
      "--disable-host-check",
    ],
    port: 5173,
  },
};
