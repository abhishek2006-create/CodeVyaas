import path from "path";

export const templatePaths = {
  react: path.join(process.cwd(), "src/templates/react"),
  nextjs: path.join(process.cwd(), "src/templates/nextjs"),
  express: path.join(process.cwd(), "src/templates/express"),
  vue: path.join(process.cwd(), "src/templates/vue"),
  hono: path.join(process.cwd(), "src/templates/hono"),
  angular: path.join(process.cwd(), "src/templates/angular"),
};
