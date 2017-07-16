import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"

export default {
    entry: "./src/index.js",
    targets: [
        {
            dest: "./lib/purgecss-webpack-plugin.es.js",
            format: "es"
        },
        {
            dest: "./lib/purgecss-webpack-plugin.js",
            format: "cjs"
        }
    ],
    plugins: [
        resolve(), commonjs(), babel()
    ],
    external: [
        "purgecss"
    ]
}