import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { rollup, RollupCache, watch } from "rollup";
import purgecss from "./../src/";

/**
 * Writes a project whose entry imports, in this order: a large CSS file
 * (purged last), a JS module importing a CSS file, a small CSS file, and a
 * dynamically imported JS module importing a CSS file
 *
 * @param dir - directory of the project
 * @returns the path of the entry, and the content to purge it with
 */
function writeOrderFixture(dir: string) {
  const big = Array.from(
    { length: 3000 },
    (_, i) => `.big-${i} { color: red; }`,
  ).join("\n");
  const files: Record<string, string> = {
    "entry.js": [
      `import "./big.css";`,
      `import "./dep.js";`,
      `import "./b.css";`,
      `export const lazy = () => import("./lazy.js");`,
    ].join("\n"),
    "dep.js": `import "./c.css";\nexport const dep = 1;`,
    "lazy.js": `import "./d.css";\nexport default 1;`,
    "big.css": `${big}\n.big-used { color: red; }`,
    "b.css": `.b-used { color: red; }\n.b-unused { color: red; }`,
    "c.css": `.c-used { color: red; }\n.c-unused { color: red; }`,
    "d.css": `.d-used { color: red; }\n.d-unused { color: red; }`,
  };
  for (const [name, code] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), code);
  }
  return {
    input: path.join(dir, "entry.js"),
    content: [
      {
        raw: '<p class="big-used b-used c-used d-used"></p>',
        extension: "html",
      },
    ],
  };
}

/**
 * Names of the files of the order fixture, from their purged CSS
 *
 * @param styles - purged CSS of each file
 */
function styleNames(styles: string[]): string[] {
  return styles.map((css) => /\.(\w+)-used/.exec(css)?.[1] ?? css);
}

describe("rollup-plugin-purgecss", () => {
  it("remove unused css", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: path.resolve(__dirname, "assets/actual_a.css"),
        }),
      ],
    });
    await bundle.generate({ format: "cjs", exports: "auto" });

    const actualA = fs
      .readFileSync(path.resolve(__dirname, "assets/actual_a.css"))
      .toString();
    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(actualA).toEqual(expectA);
  });

  it("passes the PurgeCSS options to PurgeCSS", async () => {
    let output = "";
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          safelist: ["unused"],
          blocklist: ["there"],
          output: (css) => {
            output = css;
          },
        }),
      ],
    });
    await bundle.generate({ format: "cjs", exports: "auto" });

    expect(output).toContain(".used");
    expect(output).toContain(".unused");
    expect(output).not.toContain(".there");
  });

  it("exports the purged css as a string when no output is set", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(output[0].code).toContain(JSON.stringify(expectA));
    expect(output[0].code).not.toContain(".unused");
  });

  it("exports the purged css as a string when output is false", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: false,
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(output[0].code).toContain(JSON.stringify(expectA));
  });

  it("exports an empty string when the css is written to output", async () => {
    let written = "";
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output: (css) => {
            written = css;
          },
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "es" });

    expect(output[0].code).toMatch(/=\s*"";/);
    expect(output[0].code).not.toContain(".used");
    expect(written).toContain(".used");
    expect(written).not.toContain(".unused");
  });
});

describe("rollup-plugin-purgecss options", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rollup-plugin-purgecss-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates the directory of output when it does not exist", async () => {
    const output = path.join(tmpDir, "does", "not", "exist", "purged.css");
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          output,
        }),
      ],
    });
    await bundle.generate({ format: "es" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(fs.readFileSync(output).toString()).toEqual(expectA);
  });

  it("inserts the purged css in the document with insert", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          insert: true,
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "cjs" });

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    const style = { textContent: "" };
    const head = { appendChild: jest.fn() };
    const document = {
      head,
      createElement: jest.fn(() => style),
    };
    const module = { exports: {} as unknown };
    new Function("module", "exports", "document", output[0].code)(
      module,
      module.exports,
      document,
    );

    expect(document.createElement).toHaveBeenCalledWith("style");
    expect(head.appendChild).toHaveBeenCalledWith(style);
    expect(style.textContent).toEqual(expectA);
    expect(module.exports).toEqual(expectA);
  });

  it("does not insert the css when there is no document", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/export/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          insert: true,
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "cjs" });

    const module = { exports: {} as unknown };
    new Function("module", "exports", output[0].code)(module, module.exports);
    expect(module.exports).toContain(".used");
  });

  it("gets the content of each css file from contentFunction", async () => {
    const sourceFiles: string[] = [];
    let output = "";
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/test_a.html")],
          contentFunction: (sourceFile) => {
            sourceFiles.push(sourceFile);
            return [{ raw: '<div class="unused"></div>', extension: "html" }];
          },
          output: (css) => {
            output = css;
          },
        }),
      ],
    });
    await bundle.generate({ format: "es" });

    expect(sourceFiles).toEqual([path.resolve(__dirname, "assets/test_a.css")]);
    expect(output).toContain(".unused");
    expect(output).not.toContain(".used,");
  });

  it("outputs the css of each module once across rebuilds", async () => {
    const outputs: string[] = [];
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
      output: (css) => {
        outputs.push(css);
      },
    });
    const build = async (input: string, cache?: RollupCache) => {
      const bundle = await rollup({
        input: path.resolve(__dirname, input),
        plugins: [plugin],
        cache,
      });
      await bundle.generate({ format: "es" });
      return bundle.cache;
    };

    const cache = await build("fixtures/basic/index.js");
    await build("fixtures/basic/index.js");
    await build("fixtures/basic/index.js", cache);
    await build("fixtures/other/index.js");

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(outputs.slice(0, 3)).toEqual([expectA, expectA, expectA]);
    expect(outputs[3]).toContain(".there");
    expect(outputs[3]).not.toContain(".unused-b");
    expect(outputs[3]).not.toContain(".used");
  });

  it("outputs the css from a cache created by another instance", async () => {
    const outputs: string[] = [];
    const build = async (cache?: RollupCache) => {
      const bundle = await rollup({
        input: path.resolve(__dirname, "fixtures/basic/index.js"),
        plugins: [
          purgecss({
            content: [path.resolve(__dirname, "assets/test_a.html")],
            output: (css) => {
              outputs.push(css);
            },
          }),
        ],
        cache,
      });
      await bundle.generate({ format: "es" });
      return bundle.cache;
    };

    const cache = await build();
    await build(cache);

    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(outputs).toEqual([expectA, expectA]);
  });

  it("outputs the css in the order the files are imported", async () => {
    const { input, content } = writeOrderFixture(tmpDir);
    for (let i = 0; i < 3; i++) {
      let styles: string[] = [];
      const bundle = await rollup({
        input,
        plugins: [
          purgecss({
            content,
            output: (_css, purgedStyles) => {
              styles = purgedStyles;
            },
          }),
        ],
      });
      await bundle.generate({ format: "es" });

      expect(styleNames(styles)).toEqual(["big", "c", "b", "d"]);
    }
  });

  it("works without content, with a warning", async () => {
    let output: string | undefined;
    const warnings: string[] = [];
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          output: (css) => {
            output = css;
          },
        }),
      ],
      onwarn: (warning) => {
        warnings.push(warning.message);
      },
    });
    await bundle.generate({ format: "es" });

    expect(output).toBeDefined();
    expect(output).not.toContain(".used");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Neither `content` nor `contentFunction`");
  });

  it("only needs contentFunction", async () => {
    let output = "";
    const onwarn = jest.fn();
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          contentFunction: () => [
            { raw: '<div class="unused"></div>', extension: "html" },
          ],
          output: (css) => {
            output = css;
          },
        }),
      ],
      onwarn,
    });
    await bundle.generate({ format: "es" });

    expect(output).toContain(".unused");
    expect(onwarn).not.toHaveBeenCalled();
  });

  it("watches the content files", async () => {
    const bundle = await rollup({
      input: path.resolve(__dirname, "fixtures/basic/index.js"),
      plugins: [
        purgecss({
          content: [path.resolve(__dirname, "assets/*.html")],
        }),
      ],
    });

    expect(bundle.watchFiles).toContain(
      path.resolve(__dirname, "assets/test_a.html"),
    );
  });

  it("purges again with a cache when the content changed", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "entry.js"),
      'import "./a.css";\nexport const entry = 1;',
    );
    fs.writeFileSync(path.join(tmpDir, "a.css"), ".one{color:red}.two{}");
    const page = path.join(tmpDir, "page.html");
    fs.writeFileSync(page, '<p class="one"></p>');
    const outputs: string[] = [];
    const build = async (cache?: RollupCache) => {
      const bundle = await rollup({
        input: path.join(tmpDir, "entry.js"),
        plugins: [
          purgecss({
            content: [page],
            output: (css) => {
              outputs.push(css);
            },
          }),
        ],
        cache,
      });
      await bundle.generate({ format: "es" });
      return bundle.cache;
    };

    const cache = await build();
    fs.writeFileSync(page, '<p class="one two"></p>');
    await build(cache);

    expect(outputs).toEqual([".one{color:red}", ".one{color:red}.two{}"]);
  });

  it("purges again in watch mode when the content changes", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "entry.js"),
      'import "./a.css";\nexport const entry = 1;',
    );
    fs.writeFileSync(path.join(tmpDir, "a.css"), ".one{color:red}.two{}");
    const page = path.join(tmpDir, "page.html");
    fs.writeFileSync(page, '<p class="one"></p>');
    const outputs: string[] = [];

    const watcher = watch({
      input: path.join(tmpDir, "entry.js"),
      output: { dir: path.join(tmpDir, "dist"), format: "es" },
      plugins: [
        purgecss({
          content: [path.join(tmpDir, "*.html")],
          output: (css) => {
            outputs.push(css);
          },
        }),
      ],
      watch: { buildDelay: 50 },
    });
    try {
      await new Promise<void>((resolve, reject) => {
        watcher.on("event", (event) => {
          if (event.code === "ERROR") reject(event.error);
          if ("result" in event && event.result) event.result.close();
          if (event.code !== "END") return;
          if (outputs.length === 1) {
            fs.writeFileSync(page, '<p class="one two"></p>');
          } else if (outputs.length === 2) {
            resolve();
          }
        });
      });
    } finally {
      await watcher.close();
    }

    expect(outputs).toEqual([".one{color:red}", ".one{color:red}.two{}"]);
  });

  it("watches the content files when the purge fails", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "entry.js"),
      'import "./a.css";\nexport const entry = 1;',
    );
    fs.writeFileSync(path.join(tmpDir, "a.css"), ".one{color:red}.two{}");
    const page = path.join(tmpDir, "page.html");
    // the extractor fails on this content
    fs.writeFileSync(page, '<p class="one BOOM"></p>');
    const outputs: string[] = [];
    const errors: string[] = [];

    const watcher = watch({
      input: path.join(tmpDir, "entry.js"),
      output: { dir: path.join(tmpDir, "dist"), format: "es" },
      plugins: [
        purgecss({
          content: [path.join(tmpDir, "*.html")],
          extractors: [
            {
              extensions: ["html"],
              extractor: (content: string) => {
                if (content.includes("BOOM")) throw new Error("boom");
                return content.match(/[\w-]+/g) ?? [];
              },
            },
          ],
          output: (css) => {
            outputs.push(css);
          },
        }),
      ],
      watch: { buildDelay: 50 },
    });
    // the watcher may not be ready yet when the build ends: the content is
    // fixed until it rebuilds
    let fixContent: NodeJS.Timeout | undefined;
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("no rebuild after fixing the content")),
          8000,
        );
        watcher.on("event", (event) => {
          if ("result" in event && event.result) event.result.close();
          if (event.code === "ERROR") errors.push(event.error.message);
          if (event.code === "START") clearInterval(fixContent);
          if (event.code !== "END") return;
          if (outputs.length) {
            clearTimeout(timeout);
            resolve();
          } else {
            fixContent = setInterval(() => {
              fs.writeFileSync(page, '<p class="one"></p>');
            }, 200);
          }
        });
      });
    } finally {
      clearInterval(fixContent);
      await watcher.close();
    }

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("boom");
    expect(outputs).toEqual([".one{color:red}"]);
  }, 10000);

  it("inlines the source map in the css with sourceMap", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "entry.js"),
      'import css from "./a.css";\nexport default css;',
    );
    fs.writeFileSync(
      path.join(tmpDir, "a.css"),
      ".one{color:red}.two{}\n/*# sourceMappingURL=a.css.map */",
    );
    // a map next to the css, which no longer matches the purged css
    fs.writeFileSync(
      path.join(tmpDir, "a.css.map"),
      JSON.stringify({
        version: 3,
        sources: ["a.scss"],
        names: [],
        mappings: "AAAA",
      }),
    );
    const bundle = await rollup({
      input: path.join(tmpDir, "entry.js"),
      plugins: [
        purgecss({
          content: [{ raw: '<p class="one"></p>', extension: "html" }],
          sourceMap: true,
        }),
      ],
    });
    const { output } = await bundle.generate({ format: "cjs" });
    const module = { exports: "" };
    new Function("module", output[0].code)(module);
    const css = module.exports;

    const mapMatch =
      /\/\*# sourceMappingURL=data:application\/json;base64,(.+) \*\/$/.exec(
        css,
      );
    expect(mapMatch).not.toBeNull();
    const map = JSON.parse(Buffer.from(mapMatch![1], "base64").toString());
    expect(map.sources).toEqual(["a.scss"]);
    expect(css).not.toContain(".two");
  });

  it("gives the css without the source maps to output", async () => {
    fs.writeFileSync(
      path.join(tmpDir, "entry.js"),
      'import "./a.css";\nimport "./b.css";\nexport const entry = 1;',
    );
    fs.writeFileSync(path.join(tmpDir, "a.css"), ".one{color:red}.two{}");
    fs.writeFileSync(path.join(tmpDir, "b.css"), ".one{color:blue}.two{}");
    let output = "";
    let styles: string[] = [];
    const bundle = await rollup({
      input: path.join(tmpDir, "entry.js"),
      plugins: [
        purgecss({
          content: [{ raw: '<p class="one"></p>', extension: "html" }],
          sourceMap: true,
          output: (css, purgedStyles) => {
            output = css;
            styles = purgedStyles;
          },
        }),
      ],
    });
    await bundle.generate({ format: "es" });

    // the map of each file would not match the joined css
    expect(styles).toEqual([".one{color:red}", ".one{color:blue}"]);
    expect(output).toEqual(".one{color:red}.one{color:blue}");
  });

  it("empties output when the build no longer has css files", async () => {
    fs.writeFileSync(path.join(tmpDir, "no-css.js"), "export const a = 1;");
    const outputs: string[][] = [];
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
      output: (_css, styles) => {
        outputs.push(styles);
      },
    });
    for (const input of [
      path.resolve(__dirname, "fixtures/basic/index.js"),
      path.join(tmpDir, "no-css.js"),
      path.join(tmpDir, "no-css.js"),
    ]) {
      const bundle = await rollup({ input, plugins: [plugin] });
      await bundle.generate({ format: "es" });
    }

    // called once with no css, after the build that had css
    expect(outputs).toHaveLength(2);
    expect(outputs[0]).toHaveLength(1);
    expect(outputs[1]).toEqual([]);
  });

  it("does not purge the css of node_modules, wherever they are", async () => {
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
    }) as unknown as {
      transform: (code: string, id: string) => Promise<unknown>;
    };
    const code = ".unused{}";

    // e.g. hoisted to the root of a workspace, or pnpm's store
    for (const id of [
      path.resolve("node_modules/lib/a.css"),
      path.resolve("../../node_modules/lib/a.css"),
      "/elsewhere/node_modules/.pnpm/lib@1.0.0/node_modules/lib/a.css",
    ]) {
      expect(await plugin.transform(code, id)).toBeNull();
    }
  });

  it("does not purge the css files imported as something else", async () => {
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
      include: [/\.css/],
    }) as unknown as {
      transform: (code: string, id: string) => Promise<unknown>;
    };
    const code = 'export default ".unused{}"';

    expect(await plugin.transform(code, "/project/a.css?raw")).toBeNull();
    expect(await plugin.transform(code, "/project/a.css?url")).toBeNull();
  });
});

describe("rollup-plugin-purgecss with Vite", () => {
  type ViteConfig = {
    command: "build" | "serve";
    root?: string;
    consumer?: "client" | "server";
  };
  type Context = Record<string, unknown>;
  type VitePlugin = {
    configResolved: (config: ViteConfig) => void;
    buildStart: (this: Context) => void;
    transform: (
      this: Context,
      code: string,
      id: string,
    ) => Promise<{ code: string; map: unknown } | null>;
    generateBundle: (this: Context, options: object, bundle: object) => void;
  };

  const css = fs
    .readFileSync(path.resolve(__dirname, "assets/test_a.css"))
    .toString();
  const expectA = fs
    .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
    .toString();

  /**
   * Context of the hooks of a plugin run by Vite
   *
   * @param environment - Vite environment, `this.environment`
   */
  function createContext(environment?: object) {
    return {
      meta: { viteVersion: "8.3.6" },
      environment,
      warn: jest.fn(),
      addWatchFile: jest.fn(),
      error: (message: string) => {
        throw new Error(message);
      },
    };
  }

  function createVitePlugin(
    command: "build" | "serve",
    options: Parameters<typeof purgecss>[0] = {
      content: [path.resolve(__dirname, "assets/test_a.html")],
    },
  ) {
    const plugin = purgecss(options) as unknown as VitePlugin;
    plugin.configResolved({ command });
    const context = createContext();
    const transform = (code: string, id: string) =>
      plugin.transform.call(context, code, id);
    return { context, transform };
  }

  it("returns the purged css instead of a js module", async () => {
    const { context, transform } = createVitePlugin("build");
    const result = await transform(css, "/project/src/test_a.css");

    expect(result?.code).toEqual(expectA);
    expect(context.warn).not.toHaveBeenCalled();
    expect(context.addWatchFile).toHaveBeenCalledWith(
      path.resolve(__dirname, "assets/test_a.html"),
    );
  });

  it("leaves css modules untouched and warns once", async () => {
    const { context, transform } = createVitePlugin("build");

    expect(await transform(css, "/project/src/a.module.css")).toBeNull();
    expect(await transform(css, "/project/src/b.module.css")).toBeNull();
    expect(context.warn).toHaveBeenCalledTimes(1);
    expect(context.warn.mock.calls[0][0]).toContain("CSS modules");
  });

  it("does nothing with the dev server", async () => {
    const { transform } = createVitePlugin("serve");

    expect(await transform(css, "/project/src/test_a.css")).toBeNull();
  });

  it("purges the css imported with ?inline, not with ?raw", async () => {
    const { transform } = createVitePlugin("build");

    expect(
      (await transform(css, "/project/src/test_a.css?inline"))?.code,
    ).toEqual(expectA);
    expect(await transform(css, "/project/src/test_a.css?raw")).toBeNull();
    expect(await transform(css, "/project/src/test_a.css?url")).toBeNull();
  });

  it("returns the source map with sourceMap", async () => {
    const { transform } = createVitePlugin("build", {
      content: [path.resolve(__dirname, "assets/test_a.html")],
      sourceMap: true,
    });
    const result = await transform(css, "/project/src/test_a.css");

    expect(result?.code).toEqual(expectA);
    expect(JSON.parse(result?.map as string).sources).toEqual(["test_a.css"]);
  });

  it("fails when it is not in the top-level plugins of Vite", () => {
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
    }) as unknown as VitePlugin;

    expect(() => plugin.buildStart.call(createContext())).toThrow(
      "`plugins` array of the Vite config",
    );
  });

  it("fails when it runs after Vite's css plugins", () => {
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
    }) as unknown as VitePlugin;
    const context = createContext({
      config: { command: "build" },
      plugins: [{ name: "vite:css" }, { name: "vite:css-post" }, plugin],
    });

    expect(() => plugin.buildStart.call(context)).toThrow(
      "`plugins` array of the Vite config",
    );
  });

  it("does not fail in the top-level plugins of Vite", () => {
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
    }) as unknown as VitePlugin;
    plugin.configResolved({ command: "build" });

    expect(() => plugin.buildStart.call(createContext())).not.toThrow();
  });

  it("works for a single environment, e.g. with perEnvironmentPlugin", async () => {
    // Vite does not call configResolved for the plugins returned by
    // applyToEnvironment
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
    }) as unknown as VitePlugin;
    const context = createContext({
      config: { command: "build", consumer: "client" },
      plugins: [{ name: "vite:css" }, plugin, { name: "vite:css-post" }],
    });

    expect(() => plugin.buildStart.call(context)).not.toThrow();
    const result = await plugin.transform.call(
      context,
      css,
      "/project/src/test_a.css",
    );
    expect(result?.code).toEqual(expectA);
  });

  it("resolves the relative content and output from the root", async () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss (vite) "),
    );
    try {
      fs.mkdirSync(path.join(root, "src"));
      fs.copyFileSync(
        path.resolve(__dirname, "assets/test_a.html"),
        path.join(root, "src", "index.html"),
      );
      const plugin = purgecss({
        content: ["src/*.html"],
        output: "out/purged.css",
      }) as unknown as VitePlugin;
      const id = path.join(root, "src", "test_a.css");
      const context = {
        ...createContext({ config: { command: "build", root } }),
        getModuleIds: () => [id][Symbol.iterator](),
        getModuleInfo: () => ({
          isEntry: true,
          importedIds: [],
          dynamicallyImportedIds: [],
          meta: { purgecss: { css: result?.code } },
        }),
      };

      const result = await plugin.transform.call(context, css, id);
      plugin.generateBundle.call(context, {}, {});

      expect(result?.code).toEqual(expectA);
      expect(
        fs.readFileSync(path.join(root, "out", "purged.css")).toString(),
      ).toEqual(expectA);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("resolves the content from a root whose path has glob characters", async () => {
    // e.g. a package of a workspace, `packages/@acme/web`
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss @acme c++ (x) [y] "),
    );
    try {
      const files: Record<string, string> = {
        "index.html": '<p class="from-file"></p>',
        "src/a.html": '<p class="from-glob"></p>',
        "skip/b.html": '<p class="skipped"></p>',
      };
      for (const [name, code] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
        fs.writeFileSync(path.join(root, name), code);
      }
      const plugin = purgecss({
        content: ["index.html", "src/**/*.html", "skip/*.html"],
        skippedContentGlobs: ["./skip/**"],
      }) as unknown as VitePlugin;
      const context = createContext({ config: { command: "build", root } });

      const result = await plugin.transform.call(
        context,
        ".from-file{color:red}.from-glob{color:red}.skipped{color:red}.none{color:red}",
        path.join(root, "src", "a.css"),
      );

      expect(result?.code).toEqual(
        ".from-file{color:red}.from-glob{color:red}",
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("only outputs the css of the client environments", () => {
    const output = jest.fn();
    const plugin = purgecss({
      content: [path.resolve(__dirname, "assets/test_a.html")],
      output,
    }) as unknown as VitePlugin;
    const id = "/project/src/test_a.css";
    const createEnvironmentContext = (consumer: "client" | "server") => ({
      ...createContext({ config: { command: "build", consumer } }),
      getModuleIds: () => [id][Symbol.iterator](),
      getModuleInfo: () => ({
        isEntry: true,
        importedIds: [],
        dynamicallyImportedIds: [],
        meta: { purgecss: { css: `.${consumer}{}` } },
      }),
    });

    plugin.generateBundle.call(createEnvironmentContext("client"), {}, {});
    plugin.generateBundle.call(createEnvironmentContext("server"), {}, {});

    expect(output).toHaveBeenCalledTimes(1);
    expect(output).toHaveBeenCalledWith(".client{}", [".client{}"]);
  });
});

describe("rollup-plugin-purgecss with Rolldown", () => {
  // Rolldown is ESM only and the tests run as CommonJS: it runs in its own
  // process
  function buildWithRolldown(
    input: string,
    options: object,
  ): { chunks: string[]; logs: string[]; styles?: string[] } {
    const output = execFileSync(
      process.execPath,
      [
        path.resolve(__dirname, "rolldown/build.js"),
        path.resolve(__dirname, input),
        JSON.stringify(options),
      ],
      { encoding: "utf-8" },
    );
    return JSON.parse(output);
  }

  it("exports the purged css as a string", () => {
    const {
      chunks: [code],
      logs,
    } = buildWithRolldown("fixtures/export/index.js", {
      content: [path.resolve(__dirname, "assets/test_a.html")],
    });

    expect(logs).toEqual([]);
    const expectA = fs
      .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
      .toString();
    expect(code).toContain(JSON.stringify(expectA));
    expect(code).not.toContain(".unused");
  });

  it("writes the purged css to output", () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss-"),
    );
    try {
      const output = path.join(tmpDir, "css", "purged.css");
      const {
        chunks: [code],
        logs,
      } = buildWithRolldown("fixtures/export/index.js", {
        content: [path.resolve(__dirname, "assets/test_a.html")],
        output,
      });

      expect(logs).toEqual([]);
      const expectA = fs
        .readFileSync(path.resolve(__dirname, "assets/expect_a.css"))
        .toString();
      expect(fs.readFileSync(output).toString()).toEqual(expectA);
      expect(code).toMatch(/=\s*"";/);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("outputs the css in the order the files are imported", () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss-"),
    );
    try {
      const { input, content } = writeOrderFixture(tmpDir);
      for (let i = 0; i < 3; i++) {
        const { styles, logs } = buildWithRolldown(input, {
          content,
          captureOutput: true,
        });

        expect(logs).toEqual([]);
        expect(styleNames(styles ?? [])).toEqual(["big", "c", "b", "d"]);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("rollup-plugin-purgecss in a real Vite build", () => {
  // Vite is ESM only and the tests run as CommonJS: it runs in its own process
  function buildWithVite(
    root: string,
    options: object,
    placement:
      | "plugins"
      | "rolldownOptions"
      | "rolldownOptionsCopy"
      | "post" = "plugins",
    viteBuild: object = {},
  ): {
    css?: string[];
    cssMaps?: string[];
    assets?: string[];
    chunks?: string[];
    warnings: string[];
    styles?: string[];
    error?: string;
  } {
    const output = execFileSync(
      process.execPath,
      [
        path.resolve(__dirname, "vite/build.js"),
        root,
        JSON.stringify({ options, placement, viteBuild }),
      ],
      { encoding: "utf-8" },
    );
    return JSON.parse(output);
  }

  let root: string;
  beforeAll(() => {
    root = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss-vite-"),
    );
    const files: Record<string, string> = {
      "index.html": `<!doctype html><html><body><div class="used-html"></div><script type="module" src="/src/main.js"></script></body></html>`,
      "src/main.js": [
        `import "./styles.css";`,
        `import "./asset.css";`,
        `import inline from "./inline.css?inline";`,
        `import card from "./card.module.css";`,
        `document.body.className = "used-js " + card.modUsed;`,
        `document.body.dataset.css = inline;`,
      ].join("\n"),
      "src/styles.css": [
        `.used-html { color: red; }`,
        `.used-js { color: green; }`,
        `.unused-global { color: blue; }`,
      ].join("\n"),
      "src/inline.css": `.used-js { margin: 0; }\n.unused-inline { margin: 1px; }`,
      "src/card.module.css": `.modUsed { color: purple; }\n.modUnused { color: gray; }`,
      "src/asset.css": `.used-html { background: url(./bg.png); }\n.unused-asset { color: red; }`,
    };
    for (const [name, code] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
      fs.writeFileSync(path.join(root, name), code);
    }
    // larger than Vite's inline limit, so it is emitted as a file
    fs.writeFileSync(path.join(root, "src/bg.png"), Buffer.alloc(8192, 1));
  });
  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("writes the URLs of the assets to output, not Vite's placeholders", () => {
    const output = path.join(root, "out", "purged.css");
    const { error, assets = [] } = buildWithVite(root, {
      content: ["index.html", "src/**/*.js"],
      output,
    });

    expect(error).toBeUndefined();
    const image = assets.find((name) => /bg-.*\.png$/.test(name));
    expect(image).toBeDefined();
    const css = fs.readFileSync(output).toString();
    expect(css).not.toContain("__VITE_ASSET__");
    expect(css).toContain(`url(/${image})`);
    expect(css).not.toContain("unused-asset");
  });

  it("purges the global and ?inline css and leaves css modules untouched", () => {
    const {
      css = [],
      chunks = [],
      warnings,
      error,
    } = buildWithVite(root, {
      content: ["index.html", "src/**/*.js"],
    });

    expect(error).toBeUndefined();
    const allCss = css.join("\n");
    expect(allCss).toContain("used-html");
    expect(allCss).toContain("used-js");
    expect(allCss).not.toContain("unused-global");
    // css modules are renamed by Vite before the plugin runs, so they are kept
    expect(allCss).toMatch(/modUsed/);
    expect(allCss).toMatch(/modUnused/);
    expect(warnings.join("\n")).toMatch(/CSS modules are left untouched/);

    // the purged css of inline.css, the only one with a margin
    const code = chunks.join("\n");
    expect(code).toContain("margin: 0");
    expect(code).not.toContain("unused-inline");
  });

  it("fails with an explanation in build.rolldownOptions.plugins", () => {
    const { error } = buildWithVite(
      root,
      { content: ["index.html", "src/**/*.js"] },
      "rolldownOptions",
    );

    expect(error).toMatch(/must be in the `plugins` array of the Vite config/);
  });

  it("fails with an explanation for a copy of the plugin in build.rolldownOptions.plugins", () => {
    const { error } = buildWithVite(
      root,
      { content: ["index.html", "src/**/*.js"] },
      "rolldownOptionsCopy",
    );

    expect(error).toMatch(/must be in the `plugins` array of the Vite config/);
  });

  it("fails with an explanation with enforce: post", () => {
    const { error } = buildWithVite(
      root,
      { content: ["index.html", "src/**/*.js"] },
      "post",
    );

    expect(error).toMatch(/without `enforce: "post"`/);
  });

  it("only outputs the css that Vite bundles in its css files", () => {
    // the path of the root has glob characters, and is not the current
    // directory
    const outputRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "rollup-plugin-purgecss-vite @acme c++ "),
    );
    try {
      const files: Record<string, string> = {
        "index.html": [
          `<!doctype html><html><head>`,
          `<style>.used-html { font-weight: bold; } .unused-style { color: red; }</style>`,
          `</head><body>`,
          `<div class="used-html" style="background: url(./src/big.png)"></div>`,
          `<script type="module" src="/src/main.js"></script>`,
          `</body></html>`,
        ].join(""),
        "src/main.js": [
          `import "./a.css";`,
          `import inline from "./a.css?inline";`,
          `document.body.dataset.css = inline;`,
        ].join("\n"),
        "src/a.css": `.used-html { color: red; }\n.unused-a { color: blue; }`,
        // larger than Vite's limit to inline assets, so its url is resolved
        "src/big.png": "x".repeat(5000),
      };
      for (const [name, code] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(outputRoot, name)), {
          recursive: true,
        });
        fs.writeFileSync(path.join(outputRoot, name), code);
      }

      const {
        css = [],
        styles,
        error,
      } = buildWithVite(outputRoot, {
        content: ["index.html", "src/**/*.js"],
        captureOutput: true,
      });

      expect(error).toBeUndefined();
      expect(css.join("\n")).toContain("used-html");
      expect(css.join("\n")).not.toContain("unused-a");
      // not the css imported with ?inline a second time, nor the <style>
      // block and the style attribute of index.html
      expect(styles).toHaveLength(1);
      expect(styles?.[0]).toContain(".used-html");
      expect(styles?.[0]).not.toContain("unused-a");
    } finally {
      fs.rmSync(outputRoot, { recursive: true, force: true });
    }
  });
});
