import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { solidStart } from "@solidjs/start/config";

export default defineConfig({
  plugins: [solidStart(), tailwindcss()],
});
