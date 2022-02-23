import * as glob from "glob";
import PluginError from "plugin-error";
import { PurgeCSS } from "purgecss";
import * as internal from "stream";
import through from "through2";
import VinylFile from "vinyl";
import applySourceMap from "vinyl-sourcemaps-apply";
import { UserDefinedOptions } from "./types";

export { UserDefinedOptions };

const PLUGIN_NAME = "gulp-purgecss";

function getFiles(contentArray: string[], ignore?: string[]): string[] {
  return contentArray.reduce((acc: string[], content) => {
    return [...acc, ...glob.sync(content, { ignore })];
  }, []);
}

/**
 *
 * @param options - options
 * @returns
 *
 * @public
 */
function gulpPurgeCSS(options: UserDefinedOptions): internal.Transform {
  return through.obj(async function (file: VinylFile, _encoding, callback) {
    // empty
    if (file.isNull()) return callback(null, file);
    // buffer
    if (file.isBuffer()) {
      try {
        const optionsGulp = {
          ...options,
          content: getFiles(options.content, options.skippedContentGlobs),
          css: [
            {
              raw: file.contents.toString(),
            },
          ],
          stdin: true,
          sourceMap: !!file.sourceMap,
        };
        const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
        const purge = purgedCSSResults[0];
        const result =
          optionsGulp.rejected && purge.rejected
            ? purge.rejected.join(" {}\n") + " {}"
            : purge.css;
        file.contents = Buffer.from(result, "utf-8");

        // apply source map to the chain
        if (file.sourceMap) {
          applySourceMap(file, purge.sourceMap);
        }
        callback(null, file);
      } catch (e: unknown) {
        if (e instanceof Error) {
          this.emit("error", new PluginError(PLUGIN_NAME, e.message));
        }
      }
    }
    // stream
    if (file.isStream()) {
      let css = "";
      file.contents
        .on("data", (buffer: string | Buffer) => {
          css += buffer.toString();
        })
        .on("end", async () => {
          try {
            const optionsGulp = {
              ...options,
              css: [
                {
                  raw: css,
                },
              ],
              sourceMap: !!file.sourceMap,
            };

            const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
            const purge = purgedCSSResults[0];
            const result =
              optionsGulp.rejected && purge.rejected
                ? purge.rejected.join(" {}\n") + " {}"
                : purge.css;

            const streamResult = through();
            streamResult.write(Buffer.from(result, "utf-8"));
            file.contents = file.contents.pipe(streamResult);
            // apply source map to the chain
            if (file.sourceMap) {
              applySourceMap(file, purge.sourceMap);
            }
            callback(null, file);
          } catch (e: unknown) {
            if (e instanceof Error) {
              this.emit("error", new PluginError(PLUGIN_NAME, e.message));
            }
          }
        });
    }
  });
}

export default gulpPurgeCSS;
