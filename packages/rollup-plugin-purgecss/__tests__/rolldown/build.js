// Bundles a fixture with Rolldown and rollup-plugin-purgecss (from src), then
// prints as JSON the code of the chunks, the logs of the build and, when the
// `captureOutput` option is set, the styles given to the `output` function.
// Rolldown is ESM only and Jest runs the tests as CommonJS, so the test runs
// this script in its own process.
//
// usage: node build.js <input> <JSON of the plugin options>
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "CommonJS" },
});
const purgecss = require("../../src").default;

(async () => {
  const [input, json] = process.argv.slice(2);
  const { captureOutput, ...options } = JSON.parse(json);
  let styles;
  if (captureOutput) {
    options.output = (_css, purgedStyles) => {
      styles = purgedStyles;
    };
  }
  const logs = [];
  const { rolldown } = await import("rolldown");
  const bundle = await rolldown({
    input,
    plugins: [purgecss(options)],
    onLog(level, log) {
      logs.push(`${level}: ${log.message}`);
    },
  });
  const { output } = await bundle.generate({ format: "es" });
  await bundle.close();
  process.stdout.write(
    JSON.stringify({
      chunks: output.filter((o) => o.type === "chunk").map((o) => o.code),
      logs,
      styles,
    }),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
