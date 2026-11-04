---
"@fullhuman/vue-cli-plugin-purgecss": patch
---

Install the `@fullhuman/postcss-purgecss` version that matches the plugin. `vue add @fullhuman/purgecss` added `@fullhuman/postcss-purgecss@^4.0.0` to the project, so every project set up with the plugin got PurgeCSS 4.1.3. The README also showed `vue add purgecss`, which fails because it installs `vue-cli-plugin-purgecss` instead of `@fullhuman/vue-cli-plugin-purgecss`.
