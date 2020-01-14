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

- [Configuration](configuration)
- [Command Line Interface](CLI)
- [Programmatic API](api)
- [Whitelisting](whitelisting)
- [Extractors](extractors)
- [Comparison](comparison)

### Plugins

- [PostCSS](plugins/postcss)
- [Webpack](plugins/webpack)
- [Gulp](plugins/gulp)
- [Grunt](plugins/grunt)
- [Gatsby](plugins/gatsby)

### Guides

- [Vue.js](guides/vue)
- [Nuxt.js](guides/nuxt)
- [React.js](guides/react)
- [Next.js](guides/next)
- [Razzle](guides/razzle)
- [WordPress](guides/wordpress)