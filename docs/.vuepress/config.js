module.exports = {
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
        src: "https://www.googletagmanager.com/gtag/js?id=UA-117085901-1",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'UA-117085901-1');`,
    ],
  ],
  themeConfig: {
    logo: "https://i.imgur.com/UEiUiJ0.png",
    searchPlaceholder: "Search...",
    repo: "FullHuman/purgecss",
    docsDir: "docs",
    docsBranch: "master",
    editLinks: true,
    editLinkText: "Help us improve this page!",
    evergreen: true,
    plugins: [
      [
        "@vuepress/google-analytics",
        {
          ga: "UA-117085901-1",
        },
      ],
    ],
    sidebar: {
      "/": [
        {
          title: "PurgeCSS",
          collapsable: false,
          children: [
            ["", "About PurgeCSS"],
            ["configuration", "Configuration"],
            ["CLI", "Command Line Interface"],
            ["api", "Programmatic API"],
            ["whitelisting", "Whitelisting"],
            ["extractors", "Extractors"],
          ],
        },
        {
          title: "Plugins",
          collapsable: false,
          children: [
            ["plugins/postcss", "PostCSS"],
            ["plugins/webpack", "Webpack"],
            ["plugins/gulp", "Gulp"],
            ["plugins/grunt", "Grunt"],
            ["plugins/gatsby", "Gatsby"],
          ],
        },
        {
          title: "Guides",
          collapsable: false,
          children: [
            ["guides/vue", "Vue"],
            ["guides/react", "React"],
            ["guides/next", "Next.js"],
            ["guides/nuxt", "Nuxt.js"],
            ["guides/razzle", "Razzle"],
            ["guides/wordpress", "WordPress"],
          ],
        },
        ["comparison", "Comparison"],
        {
          title: "Common Questions",
          collapsable: false,
          children: [
            // ["node_modules", "How to use with node modules"],
            ["css_modules", "How to use with CSS modules"],
            ["ant_design", "How to use with Ant Design"],
          ],
        },
      ],
    },
  },
};
