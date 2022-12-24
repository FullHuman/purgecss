import { getDirname, path } from '@vuepress/utils'
import { defaultTheme, DefaultThemeOptions } from "vuepress";

const __dirname = getDirname(import.meta.url);

const localTheme = (themeOptions: DefaultThemeOptions) => {
  return {
    name: "vuepress-theme-local",
    extends: defaultTheme(themeOptions),
    // path to the client config of your theme
    clientConfigFile: path.resolve(__dirname, 'client.ts'),
  };
};

export default localTheme;
