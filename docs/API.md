# API

PurifyCss can be used with the provided cli or programmaticaly via the API. You will find on this page the available methods of PurifyCss.

### PurifyCss(options)

Constructor of PurifyCss. Take an options object as a parameters.
```js
const options = {
    content: [],
    css: []
}
const PurifyCss = new PurifyCss(options)
```

### purify()

`purify()` is the method called to begin the process of purification of the css files. The methods removes the unused css of the files specified in the options. The result css will be written in the specified file. If no `output` is set in the options, `purify()` return the result as a string.

### 