---
"purgecss": patch
---

Fail with a clear error instead of writing a file named `undefined` when the CLI writes a CSS without a file name to an `--output` folder. The CSS read from stdin (`--css -`) and a raw CSS without a `name` in the configuration file were written to `<folder>/undefined`, and several of them overwrote each other. Use an `--output` path ending with `.css`, or give the raw CSS a `name`.
