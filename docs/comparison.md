# Comparison with other tools

Purgecss is not the only tool to remove unused css. Below you will find a list of some of the tools available as well as a comparison with Purgecss.

## Purifycss

The biggest flaw with purifycss is its lack of modularity. It is also is biggest benefit, purifycss can work with any files, not just html or javascript. But purifycss works by looking at all the words in the files and comparing them with the selectors in the css. Every words is consider a selector, which means that a lot of selectors can be consider used because you have the selector name in a paragraph or somewhere in your files.

Purgecss fixes this problem by providing the possibility to create an _extractor_. An extractor is a function that takes the content of a file and extract the list of css selectors in it. It allows a perfect removal of unused css. The extractor can used a parser that returns an ast and then looks through it to select the css selectors.

That is the way `purge-from-html` works. You can specified which selectors you want to use for each types of files, and so, get the most accurate results. You can still use the default or the legacy extractor that will act the same way as purifycss.

## Uncss

As indicated in its Readme, Uncss works the following way:

1. The HTML files are loaded by jsdom and JavaScript is executed.
2. All the stylesheets are parsed by PostCSS.

3. document.querySelector filters out selectors that are not found in the HTML files.

4. The remaining rules are converted back to CSS.



Because of the emulation of html, and the execution of javascript, uncss is effective at removing unused selectors from web application. But the emulation can have a cost in term of performance and practicality. Uncss works by emulating the html files. To remove unused css from pug template files, you will need to convert pug to html and then emulate the page inside jsdom and uncss will run `document.querySelector` on each selectors and step 4.

Uncss by its design is probably the most accurate tool to remove css out of a simple web application at this moment if you do not use server side rendering.

Purgecss does not have an extractor right now for javascript files. But because of its modularity, developers can create an extractor for specific framework \(vue, react, aurelia\) and files \(pug, ejs\) and get the most accurate result without the need of emulation.



