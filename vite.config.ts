import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Serve the app shell with no-store so browsers can never reuse an older
 * index.html that points to chunk filenames from a previous build.
 * Hashed assets remain safely cacheable.
 */
function noStoreShell(): Plugin {
  return {
    name: "no-store-shell",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/" || req.url === "/index.html" || !req.url?.includes(".")) {
          res.setHeader("Cache-Control", "no-store, must-revalidate");
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/" || req.url === "/index.html" || !req.url?.includes(".")) {
          res.setHeader("Cache-Control", "no-store, must-revalidate");
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), noStoreShell()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
  },
});
