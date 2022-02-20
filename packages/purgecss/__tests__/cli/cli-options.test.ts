import { Command } from "commander";
import { defaultOptions, Options, standardizeSafelist } from "../../src";
import { parseCommandOptions, getOptions } from "../../src/bin";

describe("PurgeCSS CLI options", () => {
  const program = parseCommandOptions(new Command());

  it("should set the options correctly", async () => {
    program.parse([
      "purgecss",
      "",
      "--content",
      `expected-content`,
      "--css",
      `expected-css`,
      "--font-face",
      "--keyframes",
      "--variables",
      "--rejected",
      "--rejected-css",
      "--safelist",
      "expected-safelist",
      "--blocklist",
      "expected-blocklist",
      "--skippedContentGlobs",
      "expected-skipped-content-globs",
      "--output",
      "expected-output",
    ]);

    const options = await getOptions(program);
    const expectedOptions: Options = {
      ...defaultOptions,
      content: ["expected-content"],
      css: ["expected-css"],
      fontFace: true,
      keyframes: true,
      output: "expected-output",
      rejected: true,
      rejectedCss: true,
      stdin: false,
      variables: true,
      safelist: standardizeSafelist(["expected-safelist"]),
      blocklist: ["expected-blocklist"],
    };
    expect(options).toEqual(expectedOptions);
  });
});
