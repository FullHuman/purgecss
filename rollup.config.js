import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import flow from "rollup-plugin-flow"
import uglify from "rollup-plugin-uglify"
import { minify } from "uglify-es"

export default {
    input: "src/index.js",
    output: [
        {
            file: "lib/purgecss.es.js",
            format: "es"
        },
        {
            file: "lib/purgecss.js",
            format: "cjs"
        }
    ],
    plugins: [builtins(), resolve(), flow(), commonjs(), babel(), uglify({}, minify)],
    external: ["postcss", "postcss-selector-parser", "fs"]
}
