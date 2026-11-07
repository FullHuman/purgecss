// Builds a small Vite app with rollup-plugin-purgecss (from src) and prints as
// JSON the emitted CSS files, the code of the chunks, the warnings of the
// build, the styles given to the `output` function when the `captureOutput`
// option is set and, if the build failed, its error message.
// Vite is ESM only and Jest runs the tests as CommonJS, so the test runs this
// script in its own process.
//
// usage: node build.js <root> <JSON of { options, placement }>
//   placement: "plugins" (default), "rolldownOptions", "rolldownOptionsCopy"
//   (a copy of the plugin in `build.rolldownOptions.plugins`) or "post" (in
//   `plugins` with `enforce: "post"`)
//   viteBuild: options merged into the `build` options of Vite
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS" },
});
const purgecss = require("../../src").default;

(async () => {
  const [root, json] = process.argv.slice(2);
  const { options, placement = "plugins", viteBuild = {} } = JSON.parse(json);
  const { captureOutput, ...pluginOptions } = options;
  let styles;
  if (captureOutput) {
    pluginOptions.output = (_css, purgedStyles) => {
      styles = purgedStyles;
    };
  }
  const warnings = [];
  const { build, createLogger } = await import("vite");
  const logger = createLogger("warn", { allowClearScreen: false });
  logger.warn = (message) => warnings.push(message);
  logger.warnOnce = (message) => warnings.push(message);
  logger.info = () => {};
  // the error is returned below, not printed
  logger.error = () => {};

  const plugin = purgecss(pluginOptions);
  const plugins = {
    plugins: [plugin],
    rolldownOptions: [],
    rolldownOptionsCopy: [],
    post: [{ ...plugin, enforce: "post" }],
  }[placement];
  const rolldownPlugins = {
    rolldownOptions: [plugin],
    rolldownOptionsCopy: [{ ...plugin }],
  }[placement];
  let result;
  try {
    result = await build({
      root,
      configFile: false,
      logLevel: "warn",
      customLogger: logger,
      plugins,
      build: {
        write: false,
        minify: false,
        rolldownOptions: rolldownPlugins
          ? { plugins: rolldownPlugins }
          : undefined,
        ...viteBuild,
      },
    });
  } catch (error) {
    process.stdout.write(
      JSON.stringify({ error: String(error && error.message), warnings }),
    );
    return;
  }
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(
    (r) => r.output,
  );
  process.stdout.write(
    JSON.stringify({
      css: outputs
        .filter((o) => o.type === "asset" && o.fileName.endsWith(".css"))
        .map((o) => String(o.source)),
      cssMaps: outputs
        .filter((o) => o.type === "asset" && o.fileName.endsWith(".css.map"))
        .map((o) => String(o.source)),
      assets: outputs.filter((o) => o.type === "asset").map((o) => o.fileName),
      chunks: outputs.filter((o) => o.type === "chunk").map((o) => o.code),
      warnings,
      styles,
    }),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
