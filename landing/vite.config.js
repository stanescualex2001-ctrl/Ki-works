import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        mainEn: resolve(__dirname, "en/index.html"),
        mainRo: resolve(__dirname, "ro/index.html"),
        impressum: resolve(__dirname, "impressum.html"),
        datenschutz: resolve(__dirname, "datenschutz.html"),
        kontakt: resolve(__dirname, "kontakt.html"),
        kontaktEn: resolve(__dirname, "en/kontakt.html"),
        kontaktRo: resolve(__dirname, "ro/kontakt.html"),
      },
    },
  },
});
