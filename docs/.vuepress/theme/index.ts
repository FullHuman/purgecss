import type { ThemeObject } from "@vuepress/core";
import { path } from "@vuepress/utils";
import { ThemeFunction, defaultTheme, DefaultThemeOptions } from "vuepress";

const localTheme = (themeOptions: DefaultThemeOptions) => {
  return {
    name: "vuepress-theme-local",
    extends: defaultTheme(themeOptions),
    layouts: {
      Layout: path.resolve(__dirname, "layouts/Layout.vue"),
    },
    alias: {
      "@theme/CarbonAds.vue": path.resolve(
        __dirname,
        "components/CarbonAds.vue"
      ),
    },
  };
};

export default localTheme;
