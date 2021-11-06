import glob from "glob";
import PluginError from "plugin-error";
import PurgeCSS from "purgecss";
import internal from "stream";
import through from "through2";
import * as VinylFile from "vinyl";
import { UserDefinedOptions } from "./types";

const PLUGIN_NAME = "gulp-purgecss";

function getFiles(contentArray: string[]): string[] {
  return contentArray.reduce((acc: string[], content) => {
    return [...acc, ...glob.sync(content)];
  }, []);
}

function gulpPurgeCSS(options: UserDefinedOptions): internal.Transform {
  return through.obj(async function (file: VinylFile, _encoding, callback) {
    // empty
    if (file.isNull()) return callback(null, file);
    // buffer
    if (file.isBuffer()) {
      try {
        const optionsGulp = {
          ...options,
          content: getFiles(options.content),
          css: [
            {
              raw: file.contents.toString(),
            },
          ],
          stdin: true,
        };
        const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
        const purge = purgedCSSResults[0];
        const result =
          optionsGulp.rejected && purge.rejected
            ? purge.rejected.join(" {}\n") + " {}"
            : purge.css;
        file.contents = Buffer.from(result, "utf-8");
        callback(null, file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        this.emit("error", new PluginError(PLUGIN_NAME, e.message));
      }
    }
    // stream
    if (file.isStream()) {
      const streamFile = file as VinylFile.StreamFile;
      let css = "";
      streamFile
        .on("readable", (buffer: NodeJS.ReadableStream) => {
          css += buffer.read().toString();
        })
        .on("end", async () => {
          try {
            const optionsGulp = { ...options, css: [css] };
            const purgedCSSResults = await new PurgeCSS().purge(optionsGulp);
            const purge = purgedCSSResults[0];
            const result =
              optionsGulp.rejected && purge.rejected
                ? purge.rejected.join(" {}\n") + " {}"
                : purge.css;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            streamFile.contents = Buffer.from(result, "utf-8");
            callback(null, file);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            this.emit("error", new PluginError(PLUGIN_NAME, e.message));
          }
        });
    }
  });
}

export default gulpPurgeCSS;
