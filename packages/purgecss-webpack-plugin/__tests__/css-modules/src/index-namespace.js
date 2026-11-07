// the same as index.js, for the native CSS of webpack and Rspack with named
// exports, which have no default export
import "./global.css";
import * as styles from "./card.module.css";
import * as named from "./named.module.css";

document.body.innerHTML = `
  <div class="used-global ${styles.modUsed} ${styles.modComposed}"></div>
  <div class="${styles.modCrossFile}"></div>
  <div class="${named.namedUsed}"></div>
`;
