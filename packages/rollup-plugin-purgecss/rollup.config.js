import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"

export default {
    input: "./src/index.js",
    output: [
        {
            file: "./lib/rollup-plugin-purgecss.es.js",
            format: "es"
        },
        {
            file: "./lib/rollup-plugin-purgecss.js",
            format: "cjs"
        }
    ],
    plugins: [
        resolve(), commonjs(), babel()
    ],
    external: [
        "purgecss",
        "rollup-pluginutils",
        "fs"
    ]
}