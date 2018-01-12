# Extractor

Purgecss can be adapted to suit your need. If you notice a lot of unused css is not being removed, you might want to use a specific extractor.

Purgecss relies on extractors to get the list of selector used in a file. There are multiples types of files that can contains selectors such as html files, templating files like pug, or even javascript file.

## Default extractor

Purgecss provides a default extractor that is working with all types of files but can be limited and not fit exactly the type of files or css framework that you are using.

The default extractor considers every word of a file as a selector. The default extractor has a few limitations:

* Do not consider special characters such as `@`, `:`, `/`

## Using an extractor

Using an extractor can be useful is you noticed that purgecss does not remove enough unused css or remove used ones.

Using an specific extractor for an extension should provide you with the best accuracy. If you want to purge exclusively html file, you might want to consider the `purge-from-html` extractor.

You can use an extractor by settings the extractors option in the purgecss config file.

```js
import purgeJs from 'purge-from-js'
import purgeHtml from 'purge-from-html'

const options = {
  content: [], // files to extract the selectors from
  css: [], // css
  extractors: [
    {
      extractor: purgeJs,
      extensions: ['js']
    },
    {
      extractor: purgeHtml,
      extensions: ['html']
    }
  ]
}
export default options
```

## Creating an extractor

An extractor is a simple class with one static method. The method \`extract\` takes the content of a file as a string and return an array of selectors[^1]. By convention, the name of the npm package is \`purge-from-\[typefile\]\` \(e.g. purge-from-pug\). Using this convention will allow users to look at the list of extractor on npm by searching \`purge-from\`

```js
class PurgeFromJs {
  static extract(content) {
    // return array of css selectors
  }
}
```

.



[^1]: Returning `null` from the extract method will throw an error, indicating that the extraction failed.

