import { defineUserConfig } from "vuepress";
import { path } from "@vuepress/utils";
import type { DefaultThemeOptions } from "vuepress";

export default defineUserConfig<DefaultThemeOptions>({
  lang: "en-US",
  title: "PurgeCSS",
  description: "PurgeCSS is a tool to remove unused CSS from your project",
  head: [
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    [
      "link",
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
    [
      "link",
      {
        rel: "mask-icon",
        href: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
    [
      "meta",
      {
        name: "msapplication-TileColor",
        content: "#ffffff",
      },
    ],
    [
      "meta",
      {
        name: "theme-color",
        content: "#ffffff",
      },
    ],
    [
      "script",
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-G2R9DBD8HD"
      }
    ],
    [
      "script",
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-G2R9DBD8HD');
      `
    ]
  ],
  theme: path.resolve(__dirname, "./theme/index.ts"),
  themeConfig: {
    logo: "https://i.imgur.com/UEiUiJ0.png",
    repo: "FullHuman/purgecss",
    sidebar: {
      "/": [
        {
          text: "PurgeCSS",
          children: [
            {
              text: "About PurgeCSS",
              link: "/introduction",
            },
            {
              text: "Getting Started",
              link: "/getting-started",
            },
            {
              text: "Configuration",
              link: "/configuration",
            },
            {
              text: "Command Line Interface",
              link: "/CLI",
            },
            {
              text: "Programmatic API",
              link: "/api",
            },
            {
              text: "Safelisting",
              link: "/safelisting",
            },
            {
              text: "Extractors",
              link: "/extractors",
            },
          ],
        },
        {
          text: "Plugins",
          children: [
            {
              text: "PostCSS",
              link: "/plugins/postcss",
            },
            {
              text: "Webpack",
              link: "/plugins/webpack",
            },
            {
              text: "Gulp",
              link: "/plugins/gulp",
            },
            {
              text: "Grunt",
              link: "/plugins/grunt",
            },
            {
              text: "Gatsby",
              link: "/plugins/gatsby",
            },
          ],
        },
        {
          text: "Guides",
          children: [
            {
              text: "Vue",
              link: "/guides/vue",
            },
            {
              text: "React",
              link: "/guides/react",
            },
            {
              text: "Next.js",
              link: "/guides/next",
            },
            {
              text: "Nuxt.js",
              link: "/guides/nuxt",
            },
            {
              text: "Razzle",
              link: "/guides/razzle",
            },
            {
              text: "WordPress",
              link: "/guides/wordpress",
            },
          ],
        },
        {
          text: "Comparison",
          link: "/comparison",
        },
        {
          text: "Common Questions",
          children: [
            {
              text: "How to use with CSS modules",
              link: "/css_modules",
            },
            {
              text: "How to use with Ant Design",
              link: "/ant_design",
            },
          ],
        },
      ],
    },
  },
  plugins: ["@vuepress/plugin-search"],
});
