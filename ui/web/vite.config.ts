import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendPort = env.VITE_BACKEND_PORT || "9600";
  const backendHost = env.VITE_BACKEND_HOST || "localhost";

  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
      checker({
        typescript: true,
      }),
    ],
    resolve: {},
    server: {
      port: 5173,
      proxy: {
        "/ws": {
          target: `http://${backendHost}:${backendPort}`,
          ws: true,
          changeOrigin: true,
        },
        "/v1": {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true,
        },
        "/health": {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
