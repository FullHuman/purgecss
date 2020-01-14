const fs = require("fs");
const postcss = require("postcss");

import purgeCSSPlugin from "../src";

describe("Purgecss postcss plugin", () => {
  const files = ["simple", "font-keyframes"];

  for (const file of files) {
    it(`remove unused css successfully: ${file}`, done => {
      const input = fs
        .readFileSync(`${__dirname}/fixtures/src/${file}/${file}.css`)
        .toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}.css`)
        .toString();
      postcss([
        purgeCSSPlugin({
          content: [`${__dirname}/fixtures/src/${file}/${file}.html`],
          fontFace: true,
          keyframes: true
        })
      ])
        .process(input, { from: undefined })
        .then((result: any) => {
          expect(result.css).toBe(expected);
          expect(result.warnings().length).toBe(0);
          done();
        });
    });
  }

  for (const file of ["simple"]) {
    it(`queues messages when using reject flag: ${file}`, done => {
      const input = fs
        .readFileSync(`${__dirname}/fixtures/src/${file}/${file}.css`)
        .toString();
      const expected = fs
        .readFileSync(`${__dirname}/fixtures/expected/${file}.css`)
        .toString();
      postcss([
        purgeCSSPlugin({
          content: [`${__dirname}/fixtures/src/${file}/${file}.html`],
          rejected: true
        })
      ])
        .process(input, { from: undefined })
        .then((result: any) => {
          expect(result.css).toBe(expected);
          expect(result.warnings().length).toBe(0);
          expect(result.messages.length).toBeGreaterThan(0);
          expect(result.messages[0].text).toMatch(/unused-class/);
          expect(result.messages[0].text).toMatch(/another-one-not-found/);
          done();
        });
    });
  }
});
