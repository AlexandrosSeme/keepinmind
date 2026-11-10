import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/maileroo": {
        target: "https://smtp.maileroo.com/api/v2",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Remove /api/maileroo prefix and keep the rest
          const newPath = path.replace(/^\/api\/maileroo/, "");
          console.log("Proxy rewrite:", path, "->", newPath);
          return newPath;
        },
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Forward all headers including X-Api-Key
            if (req.headers["x-api-key"]) {
              proxyReq.setHeader(
                "X-Api-Key",
                req.headers["x-api-key"] as string,
              );
            }
            if (req.headers["authorization"]) {
              proxyReq.setHeader(
                "Authorization",
                req.headers["authorization"] as string,
              );
            }
            console.log("Proxying request to Maileroo:", req.url);
          });
          proxy.on("error", (err) => {
            console.error("Proxy error:", err);
          });
        },
      },
    },
  },
});
