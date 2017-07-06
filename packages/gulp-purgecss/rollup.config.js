import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"

export default {
    entry: "src/index.js",
    targets: [
        {
            dest: "lib/gulpPurgecss.es.js",
            format: "es"
        },
        {
            dest: "lib/gulpPurgecss.js",
            format: "cjs"
        }
    ],
    plugins: [resolve(), commonjs(), babel()],
    external: ["through2", "gulp-util", "purgecss"],
    sourceMap: false
}