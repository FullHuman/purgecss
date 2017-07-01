# Extracter

PurifyCss relies on extracters to get the list of selector used in a file.
There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.

### Using an extracter

You can use an extracter by settings the extracters option in the purifycss config file.
```js
import PurifyExtracterJs from "purifycss-extracter-js"
import PurifyExtracterHtml from "purifycss-extracter-html"

const options = {
    content: [],// files to extract the selectors from
    css: [],// css
    extracters: [
        {
            extracter: PurifyExtracterJs,
            extensions: ["js"]
        },
        {
            extracter: PurifyExtracterHtml,
            extensions: ["html"]
        }
    ]
}
export default options
```

### Default extracter

PurifyCss provides a default extracter that is working with all types of files but can be limited and not fit exactly the type of files that you are using.  
The default extracter considers every word of a file as a selector.

### Create an extracter

An extracter is a simple class with one method. The method `extract` takes the content of a file as a string and return an array of selectors.
By convention, the name of the npm package is `purifycss-extracter-[typefile]` (e.g. purifycss-extracter-pug). You can look at the list of extracter on npm by searching `purifycss-extracter-`.

```js

class PurifyExtracterJs {
    static extract(content) {

    }
}

```