import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"

export default {
    entry: "./src/index.js",
    targets: [
        {
            dest: "./lib/rollup-plugin-purgecss.es.js",
            format: "es"
        },
        {
            dest: "./lib/rollup-plugin-purgecss.js",
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