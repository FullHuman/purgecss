import fs from "fs";
import Purgecss, { PurgeCSS } from "purgecss";
import { Plugin } from "rollup";
import { createFilter } from "rollup-pluginutils";
import { UserDefinedOptions } from "./types";

function pluginPurgeCSS(options: UserDefinedOptions): Plugin {
  return {
    name: "purgecss",
    transform: async (code, id) => {
      const v = await new PurgeCSS().purge();
    },
  };
}

const pluginPurgecss = function (options = {}) {
  const filter = createFilter(
    options.include || ["**/*.css"],
    options.exclude || "node_modules/**"
  );
  const styles = [];
  let dest = "";

  return {
    name: "purgecss",
    transform(code, id) {
      if (!filter(id)) return null;

      const purgecss = new Purgecss({
        content: options.content,
        css: [
          {
            raw: code,
          },
        ],
      });
      let css = purgecss.purge()[0].css;
      styles.push(css);

      css = JSON.stringify(css);
      if (options.insert) {
        // do thing
      } else if (!options.output) {
        code = css;
      } else {
        code = `"";`;
      }

      return {
        code: `export default ${code}`,
        map: { mappings: "" },
      };
    },
    generateBundle() {
      if (!options.insert && (!styles.length || options.output === false)) {
        return;
      }
      const css = styles.reduce((acc, value) => {
        return acc + value;
      }, "");
      if (typeof options.output === "string") {
        return fs.writeFileSync(options.output, css);
      }
      if (typeof options.output === "function") {
        return options.output(css, styles);
      }
      if (!options.insert && dest) {
        if (dest.endsWith(".js") || dest.endsWith(".ts")) {
          dest = dest.slice(0, -3);
        }
        dest = `${dest}.css`;
        return fs.writeFileSync(dest, css);
      }
    },
  };
};

export default pluginPurgecss;
