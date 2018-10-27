# with-nuxt-manual

> Nuxt.js project

## create-nuxt-app and webpack plugin

This example shows how to set up Purgecss with `create-nuxt-app`
Once you initialized your project with

```text
npx create-nuxt-app <project-name>
```

and selected the options that fit your needs,
install the webpack plugin for purgecss together with `glob-all`:

```text
npm i --save-dev glob-all purgecss-webpack-plugin
```

You need to modify the file `nuxt.config.js` by adding he following code:

line 1

```javascript
import PurgecssPlugin from 'purgecss-webpack-plugin'
import glob from 'glob-all'
import path from 'path'
```

In your `build` segment

```javascript
extractCSS: true
```

in your `build.extend` function.

```javascript
if (!isDev) {
  // Remove unused CSS using purgecss. See https://github.com/FullHuman/purgecss
  // for more information about purgecss.
  config.plugins.push(
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, './pages/**/*.vue'),
        path.join(__dirname, './layouts/**/*.vue'),
        path.join(__dirname, './components/**/*.vue')
      ]),
      whitelist: ['html', 'body']
    })
  )
}
```

## Results

This example is importing the tachyons css framework. Without purgecss, the base css file size is **88.2 kB**. Using purgecss, the base css file is **1.56 kB**
