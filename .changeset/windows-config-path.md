---
"purgecss": patch
---

Load the config file from a file URL, so that `purgecss --config` and `new PurgeCSS().purge(configFile)` work on Windows and with paths that contain `#`.
