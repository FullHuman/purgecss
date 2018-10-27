# with-nuxt-module

> Nuxt.js project

## Using nuxt-purgecss module

The nuxt-purgecss module reduces the setup code for purgecss to a minimum.
It's default options will work for most starter projects.
You can easily add more folders to scan, custom extractors or whitelisted classes/patterns.

```
//in your nuxt.config.js
export default {
  modules: [
    'nuxt-purgecss',
  ],

  // Custom options with the purgeCSS key.
  purgeCSS: {
   whitelist: ['defaults-and-this-class']
  }
}
```

Further info [in the repo](https://github.com/Developmint/nuxt-purgecss#defaults)
