import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import resolve from "rollup-plugin-node-resolve"

export default {
    input: "src/index.js",
    output: [
        {
            file: "lib/grunt-purgecss.js",
            format: "cjs"
        }
    ],
    plugins: [builtins(), resolve(), babel()],
    external: ['purgecss']
}
