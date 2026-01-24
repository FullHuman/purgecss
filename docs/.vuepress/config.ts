import { defineUserConfig } from "vuepress";
import localTheme from "./theme/index";
import { searchPlugin } from "@vuepress/plugin-search";
import { viteBundler } from "@vuepress/bundler-vite";
import { markdownTabPlugin } from "@vuepress/plugin-markdown-tab";
import { sitemapPlugin } from "@vuepress/plugin-sitemap";

// Sidebar configuration for reuse across locales
const getEnglishSidebar = () => [
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
];

const getFrenchSidebar = () => [
  {
    text: "PurgeCSS",
    children: [
      {
        text: "À propos de PurgeCSS",
        link: "/fr/introduction",
      },
      {
        text: "Démarrage rapide",
        link: "/fr/getting-started",
      },
      {
        text: "Configuration",
        link: "/fr/configuration",
      },
      {
        text: "Interface en ligne de commande",
        link: "/fr/CLI",
      },
      {
        text: "API programmatique",
        link: "/fr/api",
      },
      {
        text: "Liste blanche",
        link: "/fr/safelisting",
      },
      {
        text: "Extracteurs",
        link: "/fr/extractors",
      },
    ],
  },
  {
    text: "Plugins",
    children: [
      {
        text: "PostCSS",
        link: "/fr/plugins/postcss",
      },
      {
        text: "Webpack",
        link: "/fr/plugins/webpack",
      },
      {
        text: "Gulp",
        link: "/fr/plugins/gulp",
      },
      {
        text: "Grunt",
        link: "/fr/plugins/grunt",
      },
      {
        text: "Gatsby",
        link: "/fr/plugins/gatsby",
      },
    ],
  },
  {
    text: "Guides",
    children: [
      {
        text: "Vue",
        link: "/fr/guides/vue",
      },
      {
        text: "React",
        link: "/fr/guides/react",
      },
      {
        text: "Next.js",
        link: "/fr/guides/next",
      },
      {
        text: "Nuxt.js",
        link: "/fr/guides/nuxt",
      },
      {
        text: "Razzle",
        link: "/fr/guides/razzle",
      },
      {
        text: "WordPress",
        link: "/fr/guides/wordpress",
      },
      {
        text: "Hugo",
        link: "/fr/guides/hugo",
      },
    ],
  },
  {
    text: "Comparaison",
    link: "/fr/comparison",
  },
  {
    text: "Questions fréquentes",
    children: [
      {
        text: "Utilisation avec les modules CSS",
        link: "/fr/css_modules",
      },
      {
        text: "Utilisation avec Ant Design",
        link: "/fr/ant_design",
      },
    ],
  },
];

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  locales: {
    "/": {
      lang: "en-US",
      title: "PurgeCSS",
      description: "PurgeCSS is a tool to remove unused CSS from your project",
    },
    "/fr/": {
      lang: "fr-FR",
      title: "PurgeCSS",
      description:
        "PurgeCSS est un outil pour supprimer le CSS inutilisé de votre projet",
    },
  },
  head: [
    // Canonical URL
    ["link", { rel: "canonical", href: "https://purgecss.com" }],
    // Open Graph meta tags
    ["meta", { property: "og:site_name", content: "PurgeCSS" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      { property: "og:image", content: "https://purgecss.com/og-image.png" },
    ],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    [
      "meta",
      { property: "og:image:alt", content: "PurgeCSS - Remove unused CSS" },
    ],
    // Twitter Card meta tags
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@paborodulin" }],
    [
      "meta",
      {
        name: "twitter:title",
        content: "PurgeCSS - Remove unused CSS from your project",
      },
    ],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "PurgeCSS analyzes your content and CSS files, removing unused selectors for smaller CSS files.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://purgecss.com/og-image.png",
      },
    ],
    // Additional SEO meta tags
    ["meta", { name: "author", content: "Full Human" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "purgecss, css, unused css, remove css, optimize css, tailwindcss, postcss, webpack, purge",
      },
    ],
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
    logo: "/logo.png",
    repo: "FullHuman/purgecss",
    locales: {
      "/": {
        selectLanguageName: "English",
        selectLanguageText: "Languages",
        navbar: [
          {
            text: "API Reference",
            link: "/api-reference/",
          },
        ],
        sidebar: {
          "/": getEnglishSidebar(),
        },
      },
      "/fr/": {
        selectLanguageName: "Français",
        selectLanguageText: "Langues",
        navbar: [
          {
            text: "Référence API",
            link: "/api-reference/",
          },
        ],
        sidebar: {
          "/fr/": getFrenchSidebar(),
        },
      },
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
    sitemapPlugin({
      hostname: "https://purgecss.com",
      changefreq: "weekly",
    }),
  ],
});
