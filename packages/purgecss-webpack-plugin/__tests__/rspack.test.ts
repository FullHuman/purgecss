import { execFile } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface Build {
  name: string;
  css: "extract" | "native" | "native-defaults";
  mode: "production" | "development";
  devtool: string | false;
  /** the TypeScript source of the plugin, its built bundle or no plugin */
  plugin: boolean | "lib";
}

const libFile = path.resolve(
  __dirname,
  "..",
  "lib",
  "purgecss-webpack-plugin.js",
);
const sourceDirectory = path.resolve(__dirname, "..", "src");

const builds: Build[] = [
  {
    name: "extract",
    css: "extract",
    mode: "production",
    devtool: false,
    plugin: true,
  },
  {
    name: "native-production",
    css: "native",
    mode: "production",
    devtool: false,
    plugin: true,
  },
  {
    name: "native-development",
    css: "native",
    mode: "development",
    devtool: false,
    plugin: true,
  },
  {
    name: "native-defaults",
    css: "native-defaults",
    mode: "production",
    devtool: false,
    plugin: true,
  },
  {
    name: "source-map",
    css: "extract",
    mode: "development",
    devtool: "source-map",
    plugin: true,
  },
  {
    name: "source-map-control",
    css: "extract",
    mode: "development",
    devtool: "source-map",
    plugin: false,
  },
  {
    name: "lib",
    css: "native",
    mode: "development",
    devtool: false,
    plugin: "lib",
  },
];

function readOutput(name: string, file: string): Promise<string> {
  return fs.promises.readFile(
    path.resolve(__dirname, "js", `rspack-${name}`, file),
    "utf-8",
  );
}

// @rspack/core is an ES module, which Jest only loads on Node.js 24.9 and
// above: the builds run in a separate process, where `webpack` cannot be
// resolved
describe("Rspack", () => {
  beforeAll(async () => {
    // the built bundle is tested: build the package before its tests
    if (!fs.existsSync(libFile)) {
      throw new Error(
        `${libFile} does not exist, run \`pnpm run build\` before the tests`,
      );
    }
    await execFileAsync(process.execPath, [
      path.resolve(__dirname, "rspack", "build.cjs"),
      JSON.stringify(builds),
    ]);
  }, 60_000);

  describe.each([
    ["CssExtractRspackPlugin", "extract"],
    ["native CSS in production", "native-production"],
    ["native CSS in development", "native-development"],
  ])("with %s", (_, name) => {
    let css: string;
    beforeAll(async () => {
      css = await readOutput(name, "main.css");
    });

    it("purges the global css", () => {
      expect(css).toMatch(/\.used-global \{/);
      expect(css).not.toMatch(/unused-global/);
    });

    it("keeps the used classes of the CSS modules", () => {
      expect(css).toMatch(/\.modUsed__[\w-]+ \{/);
      expect(css).toMatch(/\.modComposed__[\w-]+ \{/);
      expect(css).toMatch(/\.base__[\w-]+ \{/);
      expect(css).toMatch(/\.namedUsed__[\w-]+ \{/);
    });

    it("keeps the classes composed from another file", () => {
      expect(css).toMatch(/\.modCrossFile__[\w-]+ \{/);
      expect(css).toMatch(/\.sharedBase__[\w-]+ \{/);
    });

    it("removes the unused classes of the CSS modules", () => {
      expect(css).not.toMatch(/modUnused__/);
      expect(css).not.toMatch(/namedUnused__/);
      expect(css).not.toMatch(/inner__/);
      expect(css).not.toMatch(/sharedUnused__/);
    });
  });

  // minimized, named exports and hashed class names: the declarations tell
  // the classes apart
  describe("with the default options of native CSS in production", () => {
    let css: string;
    beforeAll(async () => {
      css = await readOutput("native-defaults", "main.css");
    });

    it("purges the global css", () => {
      expect(css).toMatch(/\.used-global\{color:red\}/);
      expect(css).not.toMatch(/unused-global/);
    });

    it.each([
      ["modUsed", "color:green"],
      ["base", "padding:0"],
      ["modComposed", "margin:0"],
      ["modCrossFile", "color:teal"],
      ["sharedBase", "border:1px solid"],
      ["namedUsed", "color:purple"],
    ])("keeps the used class %s", (_, declaration) => {
      expect(css).toContain(`{${declaration}}`);
    });

    it.each([
      ["modUnused", /color:(black|#000)\b/],
      ["namedUnused", /color:orange/],
      ["inner", /color:pink/],
      ["sharedUnused", /color:olive/],
    ])("removes the unused class %s", (_, declaration) => {
      expect(css).not.toMatch(declaration);
    });
  });

  it("only imports the types of webpack in the source", async () => {
    const files = await fs.promises.readdir(sourceDirectory, {
      recursive: true,
    });
    for (const file of files.filter((f) => f.endsWith(".ts"))) {
      const source = await fs.promises.readFile(
        path.join(sourceDirectory, file),
        "utf-8",
      );
      const imports = source.match(
        /\bimport\b[^;]*?\bfrom\s*["']webpack(?:\/[^"']*)?["']/g,
      );
      for (const statement of imports ?? []) {
        expect(statement).toMatch(/^import\s+type\b/);
      }
      expect(source).not.toMatch(/\brequire\(\s*["']webpack/);
      expect(source).not.toMatch(/\bimport\(\s*["']webpack/);
    }
  });

  describe("with the built bundle", () => {
    it("is built from the current source", async () => {
      const files = await fs.promises.readdir(sourceDirectory, {
        recursive: true,
      });
      const { mtimeMs: built } = await fs.promises.stat(libFile);
      for (const file of files) {
        const { mtimeMs } = await fs.promises.stat(
          path.join(sourceDirectory, file),
        );
        // the source changed after the build: run `pnpm run build` again
        expect({ file, changedAfterBuild: mtimeMs > built }).toEqual({
          file,
          changedAfterBuild: false,
        });
      }
    });

    it("does not import webpack", async () => {
      const lib = await fs.promises.readFile(libFile, "utf-8");
      expect(lib).not.toMatch(/require\(["']webpack/);
    });

    it("purges the css without webpack installed", async () => {
      const css = await readOutput("lib", "main.css");
      expect(css).toMatch(/\.used-global \{/);
      expect(css).not.toMatch(/unused-global/);
      expect(css).toMatch(/\.modCrossFile__[\w-]+ \{/);
      expect(css).toMatch(/\.sharedBase__[\w-]+ \{/);
      expect(css).not.toMatch(/modUnused__/);
    });
  });

  it("purges the css again when a content file changes in watch mode", async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      path.resolve(__dirname, "rspack", "watch.cjs"),
    ]);
    const [first, second] = JSON.parse(stdout) as string[];
    expect(first).toMatch(/\.kept \{/);
    expect(first).not.toMatch(/removed-a/);
    expect(second).toMatch(/\.kept \{/);
    expect(second).toMatch(/\.removed-a \{/);
  }, 60_000);

  it("keeps the original sources in the source maps", async () => {
    const map = JSON.parse(await readOutput("source-map", "main.css.map"));
    const control = JSON.parse(
      await readOutput("source-map-control", "main.css.map"),
    );
    expect(control.sources).toEqual(
      expect.arrayContaining([expect.stringMatching(/card\.module\.css$/)]),
    );
    expect(map.sources).toEqual(control.sources);
    expect(map.mappings).not.toBe(control.mappings);
  });
});
