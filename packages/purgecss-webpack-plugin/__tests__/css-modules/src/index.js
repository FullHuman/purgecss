import "./global.css";
import styles from "./card.module.css";
import * as named from "./named.module.css";

document.body.innerHTML = `
  <div class="used-global ${styles.modUsed} ${styles.modComposed}"></div>
  <div class="${styles.modCrossFile}"></div>
  <div class="${named.namedUsed}"></div>
`;
