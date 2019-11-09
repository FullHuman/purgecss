'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lex = _interopDefault(require('pug-lexer'));

const purgeFromPug = (content) => {
    const tokens = lex(content);
    const selectors = [];
    for (const token of tokens) {
        switch (token.type) {
            case "tag":
            case "id":
            case "class":
                selectors.push(token.val);
                break;
            case "attribute":
                if (token.name === "class" || token.name === "id") {
                    selectors.push(token.mustEscape ? token.val.replace(/"/g, "") : token.val);
                }
        }
    }
    return selectors;
};

module.exports = purgeFromPug;
