import { defineUserConfig } from "vuepress";
import localTheme from "./theme/index";
import { searchPlugin } from "@vuepress/plugin-search";
import { viteBundler } from "@vuepress/bundler-vite";
import { markdownTabPlugin } from "@vuepress/plugin-markdown-tab";

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
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
        src: "https://www.googletagmanager.com/gtag/js?id=G-G2R9DBD8HD",
      },
    ],
    [
      "script",
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-G2R9DBD8HD');
      `,
    ],
  ],
  theme: localTheme({
    logo: "https://i.imgur.com/UEiUiJ0.png",
    repo: "FullHuman/purgecss",
    navbar: [
      {
        text: "API Reference",
        link: "/api-reference/",
      },
    ],
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
            {
              text: "Hugo",
              link: "/guides/hugo",
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
  }),
  plugins: [
    searchPlugin(),
    markdownTabPlugin({
      // Enable code tabs
      codeTabs: true,
      // Enable tabs
      tabs: true,
    }),
  ],
});
