# Whitelisting

You can whitelist selectors to avoid purgecss to remove them from your css files. You can do it with the purgecss options `whitelist` and `whitelistPatterns` or directly in the css file with a special comment.

## Specific selector

You can whitelist selectors with `whitelist`.

```js
const purgecss = new Purgecss({
    content: [], // content
    css: [], // css
    whitelist: ['random', 'yep', 'button']
})
```

In the example, the selectors`.random`, `#yep`, `button` will be left in the final css.

## Patterns

You can whitelist selectors based on a regular expression with `whitelistPatterns`.

```js
const purgecss = new Purgecss({
    content: [], // content
    css: [], // css
    whitelistPatterns: [/red$/]
})
```

In the example, selectors ending with `red` such as `.bg-red` will be left in the final css.

Patterns are regular expressions, you can use [regexr](https://regexr.com) to verify the regular expressions correspond to what you are looking for.

## In the css file

You can whitelist directly in your css files with a special comment.

```css
/* purgecss ignore */
h1 {
    color: blue;
}
```



