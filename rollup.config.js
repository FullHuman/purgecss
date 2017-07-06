import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import flow from "rollup-plugin-flow"

export default {
    entry: "src/index.js",
    targets: [
        {
            dest: "lib/purgecss.es.js",
            format: "es"
        },
        {
            dest: "lib/purgecss.js",
            format: "cjs"
        }
    ],
    plugins: [builtins(), resolve(), flow(), commonjs(), babel()],
    external: ["postcss", "postcss-selector-parser", "fs"],
    sourceMap: false
}
