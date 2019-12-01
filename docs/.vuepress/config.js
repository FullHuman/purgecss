module.exports = {
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
          ga: "UA-117085901-1"
        }
      ]
    ],
    sidebar: {
      "/": [
        {
          title: "PurgeCSS",
          collapsable: false,
          children: [
            "",
            ["configuration", "Configuration"],
            ["CLI", "Command Line Interface"],
            ["whitelisting", "Whitelisting"],
            ["extractors", "Extractors"]
          ]
        },
        {
          title: "Plugins",
          collapsable: false,
          children: [
            ["plugins/postcss", "PostCSS"],
            ["plugins/webpack", "Webpack"],
            ["plugins/gulp", "Gulp"],
            ["plugins/grunt", "Grunt"],
            ["plugins/gatsby", "Gatsby"]
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
