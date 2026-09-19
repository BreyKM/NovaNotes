import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Electron code imports "./x.cjs", the file tsc will emit. When the compiled
// file already exists next to the source, Vite would load that possibly stale
// output instead of the .cts source, so resolve to the source first.
const preferElectronSources = {
  name: "prefer-electron-sources",
  enforce: "pre",
  resolveId(source, importer) {
    if (!importer || !source.startsWith(".") || !source.endsWith(".cjs")) {
      return null;
    }
    const tsSource = resolve(dirname(importer), source.replace(/cjs$/, "cts"));
    return existsSync(tsSource) ? tsSource : null;
  },
};

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
  plugins: [preferElectronSources, svelte(), tailwindcss()],
});
