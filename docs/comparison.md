# Comparison with other tools

Purgecss is not the only tool to remove unused CSS. Below you will find a list of some of the tools available as well as a comparison with Purgecss.

## PurifyCSS

The biggest flaw with PurifyCSS is its lack of modularity. However, this is also its biggest benefit. PurifyCSS can work with any file type, not just HTML or JavaScript. PurifyCSS works by looking at all of the words in your files and comparing them with the selectors in your CSS. Every word is considered a selector, which means that a lot of selectors can be erroneously consider used. For example, you may happen to have a word in a paragraph that matches a selector in your CSS.

Purgecss fixes this problem by providing the possibility to create an _extractor_. An extractor is a function that takes the content of a file and extracts the list of CSS selectors used in it. It allows a perfect removal of unused CSS.

The extractor can be used as a parser that returns an AST (abstract syntax tree) and looks through it to find any CSS selectors. This is the way `purge-from-html` works. You can specify which selectors you want to use for each file type, allowing you to get the most accurate results. Additionally, you can use the default or legacy extractor, which will mimic PurifyCSS's behavior.

## UnCSS

As indicated in its Readme, UnCSS works in the following way:

1. The HTML files are loaded by jsdom and JavaScript is executed.
2. All the stylesheets are parsed by PostCSS.
3. document.querySelector filters out selectors that are not found in the HTML files.
4. The remaining rules are converted back to CSS.

Because of its HTML emulation and JavaScript execution, UnCSS is effective at removing unused selectors from web applications. However, its emulation can have a cost in terms of performance and practicality.

To remove unused CSS from Pug template files, for example, you would need to convert Pug to HTML and emulate the page inside jsdom. Only after this can UnCSS run `document.querySelector` on each selector and perform Step 4.

At the moment, UnCSS is probably the most accurate tool to remove unused CSS if you do not use server-side rendering.

Purgecss does not have an extractor right now for JavaScript files. But because of its modularity, developers can create an extractor for specific frameworks \(Vue, React, Aurelia\) and file types \(pug, ejs\). This way, you can get the most accurate results without the need of emulation.



