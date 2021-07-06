import json from "@rollup/plugin-json";
import typescript from "@wessberg/rollup-plugin-ts";
import path from "path";
import { rollup } from "rollup";
import { terser } from "rollup-plugin-terser";

const packagesDirectory = path.resolve(__dirname, "./../packages");

const packages = [
  {
    name: "purgecss",
    external: [
      "postcss",
      "postcss-selector-parser",
      "glob",
      "path",
      "fs",
      "util",
    ],
  },
  {
    name: "postcss-purgecss",
    external: ["postcss", "purgecss"],
  },
  {
    name: "purgecss-webpack-plugin",
    external: ["fs", "path", "purgecss", "webpack", "webpack-sources"],
  },
  {
    name: "rollup-plugin-purgecss",
    external: ["fs", "rollup-pluginutils", "purgecss"],
  },
  {
    name: "gulp-purgecss",
    external: ["through2", "plugin-error", "purgecss", "glob"],
  },
  {
    name: "purgecss-from-html",
    external: ["parse5", "parse5-htmlparser2-tree-adapter"],
  },
  {
    name: "purgecss-from-pug",
    external: ["pug-lexer"],
  },
  {
    name: "purgecss-from-jsx",
    external: ["acorn", "acorn-walk", "acorn-jsx", "acorn-jsx-walk"],
  }
];

async function build(): Promise<void> {
  for (const pkg of packages) {
    const bundle = await rollup({
      input: path.resolve(packagesDirectory, `./${pkg.name}/src/index.ts`),
      plugins: [typescript({}), terser()],
      external: pkg.external,
    });

    await bundle.write({
      file: path.resolve(
        packagesDirectory,
        pkg.name,
        `./lib/${pkg.name}.esm.js`
      ),
      format: "esm",
    });

    await bundle.write({
      exports: "auto",
      file: path.resolve(packagesDirectory, pkg.name, `./lib/${pkg.name}.js`),
      format: "cjs",
    });
  }

  // grunt plugin
  const gruntBundle = await rollup({
    input: path.resolve(packagesDirectory, "./grunt-purgecss/src/index.ts"),
    plugins: [typescript({}), terser()],
    external: ["purgecss"],
  });
  await gruntBundle.write({
    exports: "auto",
    file: path.resolve(
      packagesDirectory,
      "grunt-purgecss",
      "./tasks/purgecss.js"
    ),
    format: "cjs",
  });

  // command line interface
  const cliBundle = await rollup({
    input: path.resolve(packagesDirectory, "./purgecss/src/bin.ts"),
    plugins: [json(), typescript({ transpileOnly: true }), terser()],
    external: [...packages[0].external, "commander"]
  });
  await cliBundle.write({
    banner: "#!/usr/bin/env node",
    exports: "auto",
    file: path.resolve(packagesDirectory, "purgecss", "./bin/purgecss.js"),
    format: "cjs"
  })
}

(async (): Promise<void> => {
  try {
    await build();
  } catch (e) {
    console.error(e);
  }
})();
