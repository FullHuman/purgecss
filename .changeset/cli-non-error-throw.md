---
"purgecss": patch
---

Show the value thrown by a config file or an extractor when it is not an `Error`, for example `throw "oops"`. The CLI now prints `Error loading the config file oops` (or the thrown value, for an extractor) and exits with code 1, and the error from `setOptions` includes the value in its message instead of having an empty one.
