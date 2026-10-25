import { execFileSync } from "child_process";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { parseCommandOptions, getOptions } from "../../src/bin";
import { setOptions } from "../../src";

describe("PurgeCSS CLI config file loading", () => {
  const testDir = path.join(__dirname, "../test_examples/config-loading");
  const cjsConfigPath = path.join(testDir, "purgecss.config.cjs");
  const cssPath = path.join(testDir, "test.css");
  const htmlPath = path.join(testDir, "test.html");

  beforeAll(() => {
    // Create test directory and files
    fs.mkdirSync(testDir, { recursive: true });

    // CommonJS config with module.exports
    // This tests the fix for: https://github.com/FullHuman/purgecss/issues/XXX
    // When using `await import()` with CommonJS, Node.js wraps the export in
    // `{ default: {...} }`, which needs to be properly extracted.
    fs.writeFileSync(
      cjsConfigPath,
      'module.exports = { blocklist: ["blocked"], fontFace: true };',
    );

    // Test CSS file
    fs.writeFileSync(
      cssPath,
      ".used { color: red; } .blocked { color: blue; }",
    );

    // Test HTML file
    fs.writeFileSync(htmlPath, '<div class="used"></div>');
  });

  afterAll(() => {
    // Clean up test files
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe("setOptions", () => {
    it("should correctly load CommonJS config with module.exports", async () => {
      const originalCwd = process.cwd();
      process.chdir(testDir);

      try {
        const options = await setOptions("purgecss.config.cjs");
        expect(options.blocklist).toEqual(["blocked"]);
        expect(options.fontFace).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe("getOptions with config file", () => {
    it("should load and merge CommonJS config from --config flag", async () => {
      const program = parseCommandOptions(new Command());
      program.parse([
        "purgecss",
        "",
        "--css",
        cssPath,
        "--content",
        htmlPath,
        "--config",
        cjsConfigPath,
      ]);

      const options = await getOptions(program);
      expect(options.blocklist).toEqual(["blocked"]);
      expect(options.fontFace).toBe(true);
    });

    it("should allow CLI options to override config file options", async () => {
      const program = parseCommandOptions(new Command());
      program.parse([
        "purgecss",
        "",
        "--css",
        cssPath,
        "--content",
        htmlPath,
        "--config",
        cjsConfigPath,
        "--blocklist",
        "overridden",
      ]);

      const options = await getOptions(program);
      // CLI blocklist should override config file blocklist
      expect(options.blocklist).toEqual(["overridden"]);
      // Config file fontFace should still be applied
      expect(options.fontFace).toBe(true);
    });
  });

  // Uses the built CLI: ts-jest compiles `import()` to `require()`, which takes
  // any file path. Node's `import()` takes a URL, so a Windows drive letter or
  // a `#` in a folder name made the config file fail to load.
  describe("built CLI", () => {
    const binPath = path.join(__dirname, "../../bin/purgecss.js");
    const configDir = path.join(testDir, "c#");
    const configPath = path.join(configDir, "purgecss.config.js");

    beforeAll(() => {
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(
        configPath,
        `module.exports = {
          content: [{ raw: '<div class="used"></div>', extension: "html" }],
          css: [{ raw: ".used { color: red; } .unused { color: blue; }" }],
        };`,
      );
    });

    it("should load a config file whose path is not a valid URL", () => {
      const output = execFileSync(
        process.execPath,
        [binPath, "--config", configPath],
        { encoding: "utf8" },
      );
      const [result] = JSON.parse(output);
      expect(result.css).toContain(".used");
      expect(result.css).not.toContain(".unused");
    });
  });
});
