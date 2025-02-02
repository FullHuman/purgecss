import { getDirname, path } from "@vuepress/utils";
import { defaultTheme, DefaultThemeOptions } from "@vuepress/theme-default";

const __dirname = getDirname(import.meta.url);

const localTheme = (options: DefaultThemeOptions) => {
  return {
    name: "vuepress-theme-local",
    extends: defaultTheme(options),
    // path to the client config of your theme
    clientConfigFile: path.resolve(__dirname, "client.ts"),
  };
};

export default localTheme;
