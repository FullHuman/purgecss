import { defineClientConfig, resolveRoute } from "vuepress/client";

export default defineClientConfig({
  enhance({ router }) {
    // Vercel serves `fr/index.html` at `/fr` (`trailingSlash: false`), but
    // VuePress resolves `/fr` to `/fr.html`, which does not exist, and renders
    // its 404 page. Send folder URLs without a trailing slash to the folder's
    // index page (`/fr/`, `/api-reference/`) before VuePress resolves them.
    router.beforeEach((to) => {
      if (to.path === "/" || to.path.endsWith("/") || to.path.endsWith(".html"))
        return;
      if (!resolveRoute(to.path).notFound) return;
      const folder = `${to.path}/`;
      if (resolveRoute(folder).notFound) return;
      return { path: folder, query: to.query, hash: to.hash, replace: true };
    });
  },
  setup() {},
  rootComponents: [],
});
