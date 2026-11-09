import { fileURLToPath } from "node:url";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [tailwind()],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  build: {
    outDir: "dist/assets/gallery",
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: "src/gallery.tsx",
      output: {
        entryFileNames: "gallery.js",
        assetFileNames: ({ names }) => names.some((name) => name.endsWith(".css"))
          ? "gallery.css"
          : "fonts/[name]-[hash][extname]",
      },
    },
  },
});
