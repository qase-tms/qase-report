import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import legacy from "@vitejs/plugin-legacy"
import tailwindcss from "@tailwindcss/vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inline all JS/CSS assets into single HTML file
    viteSingleFile(),
    // Generate non-module build for file:// protocol support
    legacy({
      targets: ["defaults"],
      // Generate legacy chunks for browsers without ES module support
      renderLegacyChunks: true,
    }),
  ],
  // Use relative paths for static HTML export (file:// protocol)
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
