import fs from "fs";
import postcss from "postcss";

import purgeCSSPlugin from "../src/";

describe("Purgecss postcss plugin", () => {
  const files = ["simple", "font-keyframes"];

  for (const file of files) {
    it(`remove unused css with content option successfully: ${file}`, async () => {
      const input = fs
        .readFileSync(`${__dirname}/fixtures/src/${file}/${file}.css`)
        .toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}.css`)
        .toString();
      const result = await postcss([
        purgeCSSPlugin({
          content: [`${__dirname}/fixtures/src/${file}/${file}.html`],
          fontFace: true,
          keyframes: true,
        }),
      ]).process(input, { from: undefined });

      expect(result.css).toBe(expected);
      expect(result.warnings().length).toBe(0);
    });
  }

  for (const file of files) {
    it(`remove unused css with contentFunction option successfully: ${file}`, (done) => {
      const input = fs
        .readFileSync(`${__dirname}/fixtures/src/${file}/${file}.css`)
        .toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}.css`)
        .toString();

      const sourceFileName = `src/${file}/${file}.css`;
      const contentFunction = jest
        .fn()
        .mockReturnValue([`${__dirname}/fixtures/src/${file}/${file}.html`]);

      postcss([
        purgeCSSPlugin({
          contentFunction,
          fontFace: true,
          keyframes: true,
        }),
      ])
        .process(input, { from: sourceFileName })
        .then((result) => {
          expect(result.css).toBe(expected);
          expect(result.warnings().length).toBe(0);
          expect(contentFunction).toHaveBeenCalledTimes(1);
          expect(contentFunction.mock.calls[0][0]).toContain(sourceFileName);
          done();
        });
    });
  }

  it(`queues messages when using reject flag: simple`, (done) => {
    const input = fs
      .readFileSync(`${__dirname}/fixtures/src/simple/simple.css`)
      .toString();
    const expected = fs
      .readFileSync(`${__dirname}/fixtures/expected/simple.css`)
      .toString();
    postcss([
      purgeCSSPlugin({
        content: [`${__dirname}/fixtures/src/simple/simple.html`],
        rejected: true,
      }),
    ])
      .process(input, { from: undefined })
      .then((result) => {
        expect(result.css).toBe(expected);
        expect(result.warnings().length).toBe(0);
        expect(result.messages.length).toBeGreaterThan(0);
        expect(result.messages[0].text).toMatch(/unused-class/);
        expect(result.messages[0].text).toMatch(/another-one-not-found/);
        done();
      });
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
});
