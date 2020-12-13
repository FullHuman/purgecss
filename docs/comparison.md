---
title: Comparison | PurgeCSS
lang: en-US
meta:
  - name: description
    content: Comparison between PurgeCSS and similar tools such as UnCSS and PurifyCSS.
  - itemprop: description
    content: Comparison between PurgeCSS and similar tools such as UnCSS and PurifyCSS.
  - property: og:url
    content:  https://purgecss.com/comparison
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: Comparison between PurgeCSS and similar tools such as UnCSS and PurifyCSS.
---

# Comparison

PurgeCSS is not the only tool to remove unused CSS. Below you will find a comparison between PurgeCSS and the other two most used tools to remove unused CSS.

## UnCSS

As indicated in its README, UnCSS works in the following way:

- The HTML files are loaded by jsdom, and JavaScript is executed.
- PostCSS parses all the stylesheets.
  document.querySelector filters out selectors that are not found in the HTML files.
- The remaining rules are converted back to CSS.

Because of its HTML emulation and JavaScript execution, UnCSS is effective at removing unused selectors from web applications.

However, its emulation can have a cost in terms of performance and practicality. To remove unused CSS from Pug template files, for example, you would need to convert Pug to HTML and emulate the page inside jsdom. After this step, UnCSS can run document.querySelector on each selector and perform Step 4.

At the moment, UnCSS is probably the most accurate tool to remove unused CSS for a few situations. If you do not use server-side rendering, and you have a simple website with HTML and javascript, it should work correctly and outperform PurgeCSS in terms of CSS size result.

PurgeCSS has an extractor for JavaScript files. The goal is to provide more accurate results, which will make the CSS size result better than UnCSS. Thanks to PurgeCSS modularity, developers can create an extractor for specific frameworks (Vue, React, Aurelia) and file types (pug, ejs). This way, you can get the most accurate results without the need for emulation.

## PurifyCSS

The biggest flaw with PurifyCSS is its lack of modularity. However, this is also its biggest benefit. PurifyCSS can work with any file type, not just HTML or JavaScript.

PurifyCSS works by looking at all of the words in your files and comparing them with the selectors in your CSS. Every word is considered a selector, which means that a lot of selectors can be erroneously find used. For example, you may happen to have a word in a paragraph that matches a selector in your CSS.

PurgeCSS fixes this problem by providing the possibility to create an extractor. An extractor is a function that takes the content of a file and extracts the list of CSS selectors used in it. It allows a perfect removal of unused CSS.

The extractor can be used as a parser that returns an AST (abstract syntax tree) and looks through it to find any CSS selectors. This is the way purge-from-html works.

You can specify which extractors you want to use for each file type, allowing you to get the most accurate results. But using specific extractors is optional, and you can rely on the default one.
