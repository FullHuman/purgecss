import postcss from "postcss";
import { createPurgeCSSPlugin } from "./postCSSPurgeCSS";

export default createPurgeCSSPlugin(postcss);
