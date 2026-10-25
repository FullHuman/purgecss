---
"grunt-purgecss": patch
---

Write the purged output of every source file in a `files` entry, not only the first one. The task now fails with a clear error when none of the source files of an entry exist, and task errors are logged instead of being silently dropped.
