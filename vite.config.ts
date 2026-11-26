import tailwindcss from "@tailwindcss/vite";
import solidPlugin from "@solidjs/vite-plugin";
import netlify from "@netlify/vite-plugin";
import { fileURLToPath } from "node:url";
import { fileRoutes } from "filesystem-routing/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    solidPlugin({
      start: {
        middleware: "./src/middleware.ts",
      },
      ssr: true,
      serverFunctions: true,
      extensions: [".jsx", ".tsx"],
    }),
    fileRoutes({ httpMethods: true }),
    tailwindcss(),
    netlify({ build: { enabled: true } }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
});
