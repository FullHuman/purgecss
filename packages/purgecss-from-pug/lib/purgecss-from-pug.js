"use strict";
function _interopDefault(e) {
  return e && "object" == typeof e && "default" in e ? e.default : e;
}
var lex = _interopDefault(require("pug-lexer"));
const purgeFromPug = e => {
  const t = lex(e),
    a = [];
  for (const e of t)
    switch (e.type) {
      case "tag":
      case "id":
      case "class":
        a.push(e.val);
        break;
      case "attribute":
        ("class" !== e.name && "id" !== e.name) ||
          a.push(e.mustEscape ? e.val.replace(/"/g, "") : e.val);
    }
  return a;
};
module.exports = purgeFromPug;
