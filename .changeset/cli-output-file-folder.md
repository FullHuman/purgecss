---
"purgecss": patch
---

Create the missing folders of the CLI `--output` path when it is a CSS file. `purgecss --css app.css --content index.html --output build/css/app.css` failed with `ENOENT` if `build/css` didn't exist, while an output directory such as `--output build/css` was already created.
