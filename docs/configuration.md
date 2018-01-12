# Configuration

Purgecss has  a list of options that allow you to customize its behavior. Customization can improve the performance or efficiency of Purgecss. You can create a configuration file with the options and use it with Purgecss.

## Configuration file

The configuration file is a simple js file. By default, the javascript api will look for `purgecss.config.js`.

```js
module.exports = {
    content: ['index.html'],
    css: ['style.css']
}
```

You can then use purgecss with the file:

```js
const purgecss = new Purgecss()
// or use the path to the file as the only parameter
const purgecss = new Purgecss('./purgecss.config.js')
```

## Options

```
{
  content: Array<string | RawContent>,
  css: Array<string>,
  extractors?: Array<ExtractorsObj>,
  whitelist?: Array<string>,
  whitelistPatterns?: Array<RegExp>,
  stdin?: boolean,
}
```

* #### content

You can specified the content with an array of filename or [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer) that should be analyized by purgecss. The files can be html, pug, blade, ... files.

```js
new Purgecss({
    content: ['index.html', `**/*.js`, '**/*.html', '**/*.vue'],
    css: [`css/app.css`]
}
```

Purgecss works also with raw content, you need to pass an object with the `raw`and `extension` properties instead of the filename.

```js
new Purgecss({
    content: [
        {
            raw: '<html><body><div class="app"></div></body></html>',
            extension: 'html'
        },
        `**/*.js`, '**/*.html', '**/*.vue'],
    css: [`css/app.css`]
}
```

* #### extractors

Purgecss can be adapted to suit your need. If you notice a lot of unused css is not being removed, you might want to use a specific extractor.

```js
new Purgecss({
    content: ['index.html', `**/*.js`, '**/*.html', '**/*.vue'],
    css: [`css/app.css`],
    extractors: {
        extractor: class {
            static extract(content) {
                content.match(/a-Z/) || []
            }
        },
        extension: ['html', 'blade']
    }
}
```

More information about extractors [here](/extractors.md).

* #### whitelist

You can whitelist selectors to avoid purgecss to remove them from your css files. You can do it with the purgecss options `whitelist` and `whitelistPatterns`.

```js
const purgecss = new Purgecss({
    content: [], // content
    css: [], // css
    whitelist: ['random', 'yep', 'button']
})
```

In the example, the selectors`.random`, `#yep`, `button` will be left in the final css.

* #### whitelistPatterns

You can whitelist selectors based on a regular expression with `whitelistPatterns`.

```js
const purgecss = new Purgecss({
    content: [], // content
    css: [], // css
    whitelistPatterns: [/red$/]
})
```

In the example, selectors ending with `red` such as `.bg-red` will be left in the final css.

* #### stdin

stdin allows you to set the css code itself in the css options directly.

```js
const purgecss = new Purgecss({
    content: ['index.html', `**/*.js`, '**/*.html', '**/*.vue'],
    css: ['html, body { width: 100%; height: 100%} fieldset { border: none; }']
})
```

* #### keyframes \(default: false\)

If you are using  an animation css library such as animate.css, you can remove unused keyframes by setting the `keyframes` option to `true`.

```js
new Purgecss({
    content: ['index.html', `**/*.js`, '**/*.html', '**/*.vue'],
    css: [`css/app.css`],
    keyframes: true
}
```



