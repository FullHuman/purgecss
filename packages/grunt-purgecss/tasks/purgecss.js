"use strict";
var t,
  e = require("purgecss"),
  s = (t = e) && "object" == typeof t && "default" in t ? t.default : t;
function i(t, e = []) {
  return e.filter(
    (e) =>
      !!t.file.exists(e) || (t.log.warn(`Source file "${e}" not found.`), !1)
  );
}
module.exports = function (t) {
  t.registerMultiTask("purgecss", "Grunt plugin for PurgeCSS", function () {
    const n = this.async(),
      o = this.options(e.defaultOptions);
    for (const e of this.files) {
      const r = i(t, e.src);
      new s()
        .purge({ ...o, css: r })
        .then((s) => {
          if (void 0 === e.dest) throw new Error("Destination file not found");
          t.file.write(e.dest, s[0].css),
            t.log.writeln(`File "${e.dest}" created.`),
            n();
        })
        .catch(() => {
          n(!1);
        });
    }
  });
};
