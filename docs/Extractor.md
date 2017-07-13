# Extractor

PurifyCss relies on extractors to get the list of selector used in a file.
There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.

### Using an extractor

You can use an extractor by settings the extractors option in the purgecss config file.
```js
import purgeJs from "purgecss-from-js"
import purgeHtml from "purgecss-from-html"

const options = {
    content: [],// files to extract the selectors from
    css: [],// css
    extractors: [
        {
            extractor: purgeJs,
            extensions: ["js"]
        },
        {
            extractor: purgeHtml,
            extensions: ["html"]
        }
    ]
}
export default options
```

### Default extractor

Purgecss provides a default extractor that is working with all types of files but can be limited and not fit exactly the type of files that you are using.  
The default extractor considers every word of a file as a selector.

### Create an extractor

An extractor is a simple class with one method. The method `extract` takes the content of a file as a string and return an array of selectors.
By convention, the name of the npm package is `purgecss-from-[typefile]` (e.g. purgecss-from-pug). You can look at the list of extractor on npm by searching `purgecss-from`.

```js

class PurgeFromJs {
    static extract(content) {

    }
}

```