import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.DEV_ENV == "true" ? "/" : "./",
  build: {
    outDir: "electron/build",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        starter: resolve(import.meta.dirname, "starter.html"),
      },
    },
  },
  esbuild: {
    include: /\.[cm]?tsx?$/,
  },
  plugins: [svelte(), tailwindcss()],
});
