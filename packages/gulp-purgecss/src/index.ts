import glob from "fast-glob";
import PluginError from "plugin-error";
import { PurgeCSS } from "purgecss";
import * as internal from "stream";
import { objectTransform, transform } from "through2";
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

// generate a separate source map describing only this step, without any
// annotation in the css, so that it can be chained with gulp-sourcemaps
function getSourceMapOptions(file: VinylFile): UserDefinedOptions["sourceMap"] {
  return file.sourceMap
    ? { inline: false, annotation: false, prev: false }
    : false;
}

function applyPurgedSourceMap(file: VinylFile, sourceMap?: string): void {
  if (!file.sourceMap || !sourceMap) return;
  const map = JSON.parse(sourceMap);
  // the css is purged as a raw string, so the source map has no file name
  map.file = file.relative;
  map.sources = map.sources.map(() => file.relative);
  applySourceMap(file, map);
}

function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let css = "";
    stream
      .on("data", (buffer: string | Buffer) => {
        css += buffer.toString();
      })
      .on("end", () => resolve(css))
      .on("error", reject);
  });
}

function toPluginError(e: unknown): unknown {
  return e instanceof Error ? new PluginError(PLUGIN_NAME, e.message) : e;
}

/**
 *
 * @param options - options
 * @returns
 *
 * @public
 */
function gulpPurgeCSS(options: UserDefinedOptions): internal.Transform {
  // through2 v5 dispatches on the function kind: an async transform receives
  // no callback, pushes its resolved value and turns a rejection into a
  // stream error
  return objectTransform(async function (file: VinylFile) {
    // empty
    if (file.isNull()) return file;
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
          sourceMap: getSourceMapOptions(file),
        };
        const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
        const purge = purgedCSSResults[0];
        const result =
          optionsGulp.rejected && purge.rejected
            ? purge.rejected.join(" {}\n") + " {}"
            : purge.css;
        file.contents = Buffer.from(result, "utf-8");

        // apply source map to the chain
        applyPurgedSourceMap(file, purge.sourceMap);
        return file;
      } catch (e: unknown) {
        throw toPluginError(e);
      }
    }
    // stream
    if (file.isStream()) {
      try {
        const css = await readStream(file.contents);
        const optionsGulp = {
          ...options,
          css: [
            {
              raw: css,
            },
          ],
          sourceMap: getSourceMapOptions(file),
        };

        const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
        const purge = purgedCSSResults[0];
        const result =
          optionsGulp.rejected && purge.rejected
            ? purge.rejected.join(" {}\n") + " {}"
            : purge.css;

        const streamResult = transform();
        streamResult.write(Buffer.from(result, "utf-8"));
        file.contents = file.contents.pipe(streamResult);
        // apply source map to the chain
        applyPurgedSourceMap(file, purge.sourceMap);
        return file;
      } catch (e: unknown) {
        throw toPluginError(e);
      }
    }
  });
}

export default gulpPurgeCSS;
