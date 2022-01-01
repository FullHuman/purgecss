import type { ThemeObject } from "@vuepress/core";
import { path } from "@vuepress/utils";

const localTheme: ThemeObject = {
  name: "vuepress-theme-local",
  extends: "@vuepress/theme-default",
  layouts: {
    Layout: path.resolve(__dirname, "layouts/Layout.vue"),
  },
  alias: {
    "@theme/CarbonAds.vue": path.resolve(__dirname, "components/CarbonAds.vue"),
  },
};

export default localTheme;
