module.exports = {
  themeConfig: {
    logo: "https://i.imgur.com/UEiUiJ0.png",
    searchPlaceholder: "Search...",
    repo: "FullHuman/purgecss",
    docsDir: "docs",
    docsBranch: "master",
    editLinks: true,
    editLinkText: "Help us improve this page!",
    sidebar: {
      "/": [
        {
          title: "PurgeCSS",
          collapsable: false,
          children: ["", "configuration", "whitelisting"]
        },
        {
          title: "Plugins",
          collapsable: false,
          children: [
            ["plugins/postcss", "PostCSS"],
            ["plugins/webpack", "Webpack"]
            // ['plugins/gulp', 'Gulp'],
            // ['plugins/gatsby', 'Gatsby'],
            // ['plugins/nuxt', 'Nuxt'],
            // ['plugins/next', 'Next'],
          ]
        },
        {
          title: "Guides",
          collapsable: false,
          children: [
            ["guides/react", "React"],
            ["guides/next", "Next.js"],
            ["guides/nuxt", "Nuxt.js"],
            ["guides/wordpress", "WordPress"]
          ]
        },
        ["comparison", "Comparison"]
      ]
    }
  }
};
