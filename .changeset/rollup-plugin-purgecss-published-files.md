---
"rollup-plugin-purgecss": patch
---

Publish only the `lib` folder. The npm package shipped the source, the tests and the build files next to the built plugin. The deprecated `rollup-pluginutils` dependency is replaced with `@rollup/pluginutils`, and `rollup` is declared as a peer dependency.
