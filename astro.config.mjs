// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Do NOT add /admin redirects here — they cause Astro to generate an empty
  // /admin/index.html route that can override public/admin/index.html on deploy.
  vite: {
    plugins: [tailwindcss()],
  },
});
