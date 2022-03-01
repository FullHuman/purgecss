import * as fs from "fs";
import postcss from "postcss";

import purgeCSSPlugin from "../src/";

describe("Purgecss postcss plugin", () => {
  const files = ["simple", "font-keyframes"];
  const fileContents = files.map((file) => {
    return {
      name: file,
      input: fs
        .readFileSync(`${__dirname}/fixtures/src/${file}/${file}.css`)
        .toString(),
      output: fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}.css`)
        .toString(),
    };
  });

  it.each(fileContents)(
    "remove unused css with content option successfully: $name",
    async ({ name, input, output }) => {
      const result = await postcss([
        purgeCSSPlugin({
          content: [`${__dirname}/fixtures/src/${name}/${name}.html`],
          fontFace: true,
          keyframes: true,
        }),
      ]).process(input, { from: undefined });

      expect(result.css).toBe(output);
      expect(result.warnings().length).toBe(0);
    }
  );

  it.each(fileContents)(
    "remove unused css with contentFunction option successfully: $name",
    async ({ name, input, output }) => {
      const sourceFileName = `src/${name}/${name}.css`;
      const contentFunction = jest
        .fn()
        .mockReturnValue([`${__dirname}/fixtures/src/${name}/${name}.html`]);

      const result = await postcss([
        purgeCSSPlugin({
          contentFunction,
          fontFace: true,
          keyframes: true,
        }),
      ]).process(input, { from: sourceFileName });

      expect(result.css).toBe(output);
      expect(result.warnings().length).toBe(0);
      expect(contentFunction).toHaveBeenCalledTimes(1);
      expect(contentFunction.mock.calls[0][0]).toContain(sourceFileName);
    }
  );

  it(`queues messages when using reject flag: simple`, async () => {
    const result = await postcss([
      purgeCSSPlugin({
        content: [`${__dirname}/fixtures/src/simple/simple.html`],
        rejected: true,
      }),
    ])
      .process(fileContents[0].input, { from: undefined });

      expect(result.css).toBe(fileContents[0].output);
      expect(result.warnings().length).toBe(0);
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages[0].text).toMatch(/unused-class/);
      expect(result.messages[0].text).toMatch(/another-one-not-found/);
  });

  it(`lets other plugins transform selectors before purging`, async () => {
    const input = fs
      .readFileSync(`${__dirname}/fixtures/src/other-plugins/other-plugins.css`)
      .toString();
    const expected = fs
      .readFileSync(`${__dirname}/fixtures/expected/other-plugins.css`)
      .toString();
    const result = await postcss([
      {
        postcssPlugin: "postcss-test-prefixer",
        Rule(rule) {
          if (rule.selector.startsWith(".")) {
            rule.selector = ".prefixed-" + rule.selector.slice(1);
          }
        },
      },
      purgeCSSPlugin({
        content: [`${__dirname}/fixtures/src/other-plugins/other-plugins.html`],
        fontFace: true,
        keyframes: true,
      }),
    ]).process(input, { from: undefined });

    expect(result.css).toBe(expected);
    expect(result.warnings().length).toBe(0);
  });

  it('should work with a purgecss config file', async () => {
    const cwd = process.cwd();
    const configTestDirectory = `${__dirname}/fixtures/src/config-test/`;
    process.chdir(configTestDirectory);

    const input = fs
      .readFileSync(`${configTestDirectory}index.css`)
      .toString();
    const output = fs
      .readFileSync(`${configTestDirectory}expected.css`)
      .toString();

    const result = await postcss([
      purgeCSSPlugin({
        keyframes: true,
      }),
    ]).process(input, { from: undefined });

    expect(result.css).toBe(output);
    expect(result.warnings().length).toBe(0);

    process.chdir(cwd);
  })
});
