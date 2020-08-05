---
title: PurgeCSS - Remove unused CSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
  - itemprop: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
  - property: og:url
    content:  https://purgecss.com
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.

  
---

# About PurgeCSS

PurgeCSS is a tool to remove unused CSS. It can be part of your development workflow.  
When you are building a website, you might decide to use a CSS framework like TailwindCSS, Bootstrap, MaterializeCSS, Foundation, etc... But you will only use a small set of the framework, and a lot of unused CSS styles will be included.

This is where PurgeCSS comes into play. PurgeCSS analyzes your content and your CSS files. Then it matches the selectors used in your files with the one in your content files. It removes unused selectors from your CSS, resulting in smaller CSS files.

## Table of Contents

### PurgeCSS

- [Configuration](configuration.md)
- [Command Line Interface](CLI.md)
- [Programmatic API](api.md)
- [Safelisting](safelisting.md)
- [Extractors](extractors.md)
- [Comparison](comparison.md)

### Plugins

- [PostCSS](plugins/postcss.md)
- [Webpack](plugins/webpack.md)
- [Gulp](plugins/gulp.md)
- [Grunt](plugins/grunt.md)
- [Gatsby](plugins/gatsby.md)

### Guides

- [Vue.js](guides/vue.md)
- [Nuxt.js](guides/nuxt.md)
- [React.js](guides/react.md)
- [Next.js](guides/next.md)
- [Razzle](guides/razzle.md)
- [WordPress](guides/wordpress.md)

### Common Questions

- [How to use with CSS modules?](css_modules.md)
- [How to use with Ant Design?](ant_design.md)