---
title: Introduction | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS is a tool for removing CSS that you're not actually using in your project. It can be used as part of your development workflow. PurgeCSS comes with a JavaScript API, a CLI, and plugins for popular build tools.
  - name: keywords
    content: PurgeCSS remove unused CSS optimization web
---

# About PurgeCSS

PurgeCSS is a tool to remove unused CSS. It can be part of your development workflow.  
When you are building a website, you might decide to use a CSS framework like TailwindCSS, Bootstrap, MaterializeCSS, Foundation, etc... But you will only use a small set of the framework, and a lot of unused CSS styles will be included.

This is where PurgeCSS comes into play. PurgeCSS analyzes your content and your css files. Then it matches the selectors used in your files with the one in your content files. It removes unused selectors from your css, resulting in smaller css files.

## Table of Contents

### PurgeCSS

- [Configuration](configuration.md)
- [Command Line Interface](CLI.md)
- [Programmatic API](api.md)
- [Whitelisting](whitelisting.md)
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
