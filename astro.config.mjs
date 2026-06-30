// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

/** Dev/preview only — Netlify handles /admin → /admin/index.html in production. */
function adminIndexRewrite() {
  /** @param {import("http").IncomingMessage} req @param {import("http").ServerResponse} _res @param {() => void} next */
  const rewrite = (req, _res, next) => {
    const path = req.url?.split("?")[0] ?? "";
    if (path === "/admin" || path === "/admin/") {
      const query = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      req.url = `/admin/index.html${query}`;
    }
    next();
  };

  return {
    name: "admin-index-rewrite",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Do NOT add Astro /admin page routes — they generate an empty /admin/index.html
  // that overrides public/admin/index.html on deploy. Use adminIndexRewrite() for local dev.
  vite: {
    plugins: [tailwindcss(), adminIndexRewrite()],
  },
});
