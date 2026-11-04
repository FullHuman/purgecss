---
"purgecss": patch
---

Report CLI errors with their message and exit code 1. Errors such as a missing config file or invalid CSS ended the CLI with a full stack trace (for invalid CSS, it also printed the whole stylesheet). When the output file couldn't be written, the CLI printed the error but still exited with code 0, so scripts carried on without the purged CSS.
