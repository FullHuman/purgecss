import fastGlob from "fast-glob";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import postcss from "postcss";

import purgeCSSPlugin, { UserDefinedOptions } from "../src/";

/**
 * Dependency messages of a PostCSS result
 */
function getDependencies(result: postcss.Result): postcss.Message[] {
  return result.messages.filter((message) =>
    ["dependency", "dir-dependency", "missing-dependency"].includes(
      message.type,
    ),
  );
}

describe("Purgecss postcss plugin dependency messages", () => {
  let directory: string;
  const cwd = process.cwd();

  beforeAll(() => {
    // realpath: the temporary directory of macOS is behind a symlink
    directory = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "postcss-purgecss-deps-")),
    );
    const files = [
      "index.html",
      "src/app.js",
      "src/components/button.jsx",
      "src/styles.css",
      "lib/util.js",
      "pages/about.html",
      "app/(group)/page.tsx",
    ];
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(directory, file), "<div></div>");
    }
    process.chdir(directory);
  });

  afterAll(() => {
    process.chdir(cwd);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  async function run(
    content: UserDefinedOptions["content"],
    from: string | null = "/project/src/style.css",
  ): Promise<postcss.Message[]> {
    const result = await postcss([purgeCSSPlugin({ content })]).process(
      ".a{color:red}",
      { from: from ?? undefined },
    );
    return getDependencies(result);
  }

  it("adds a dependency message for a content file", async () => {
    expect(await run(["index.html", `${directory}/pages/about.html`])).toEqual([
      {
        type: "dependency",
        plugin: "postcss-purgecss",
        file: path.join(directory, "index.html"),
        parent: "/project/src/style.css",
      },
      {
        type: "dependency",
        plugin: "postcss-purgecss",
        file: path.join(directory, "pages/about.html"),
        parent: "/project/src/style.css",
      },
    ]);
  });

  it.each([
    ["src/**/*.{js,jsx}", [["src", "**/*.{js,jsx}"]]],
    ["./pages/*.html", [["pages", "*.html"]]],
    ["src//**/*.{js,jsx}", [["src", "**/*.{js,jsx}"]]],
    [".//src/**/*.js", [["src", "**/*.js"]]],
    ["./src/./components/*.jsx", [["src/components", "*.jsx"]]],
    ["./src/../lib/*.js", [["lib", "*.js"]]],
    [
      "{src,lib}/**/*.js",
      [
        ["src", "**/*.js"],
        ["lib", "**/*.js"],
      ],
    ],
    ["src/[a-z]*.js", [["src", "[a-z]*.js"]]],
    ["app/\\(group\\)/*.tsx", [["app/(group)", "*.tsx"]]],
  ])(
    "adds a dir-dependency message for the glob %s",
    async (glob, expected) => {
      const messages = await run([glob]);
      expect(messages).toEqual(
        expected.map(([dir, pattern]) => ({
          type: "dir-dependency",
          plugin: "postcss-purgecss",
          dir: path.resolve(directory, dir),
          glob: pattern,
          parent: "/project/src/style.css",
        })),
      );
      // the directories and globs match the files of the content glob
      const files = messages.flatMap((message) =>
        fastGlob.sync(message.glob, { cwd: message.dir, absolute: true }),
      );
      expect(files.sort()).toEqual(
        fastGlob.sync(glob, { absolute: true }).sort(),
      );
      expect(files.length).toBeGreaterThan(0);
    },
  );

  it.each(["/src/**/*.js", "//src//**/*.js"])(
    "adds a dir-dependency message for the absolute glob <directory>%s",
    async (glob) => {
      expect(await run([`${directory}${glob}`])).toEqual([
        {
          type: "dir-dependency",
          plugin: "postcss-purgecss",
          dir: path.join(directory, "src"),
          glob: "**/*.js",
          parent: "/project/src/style.css",
        },
      ]);
    },
  );

  it.each([
    ["./*.html", ["index.html"]],
    ["*.html", ["index.html"]],
    ["**/*.html", ["index.html", "pages/about.html"]],
    [".//**/*.html", ["index.html", "pages/about.html"]],
    ["{.,src}/*.{html,js}", ["index.html", "src/app.js"]],
  ])(
    "adds a dependency message for each file of the glob %s based at the working directory",
    async (glob, files) => {
      // webpack and Rspack watch the whole directory of a dir-dependency,
      // the output of the build included
      expect(await run([glob])).toEqual(
        files.map((file) => ({
          type: "dependency",
          plugin: "postcss-purgecss",
          file: path.join(directory, file),
          parent: "/project/src/style.css",
        })),
      );
    },
  );

  it("adds a dependency message for each file of a glob based above the working directory", async () => {
    process.chdir(path.join(directory, "src"));
    try {
      expect(await run(["../*.html", "../src/*.js"])).toEqual(
        ["index.html", "src/app.js"].map((file) => ({
          type: "dependency",
          plugin: "postcss-purgecss",
          file: path.join(directory, file),
          parent: "/project/src/style.css",
        })),
      );
    } finally {
      process.chdir(directory);
    }
  });

  it.each([
    [
      "{src/**/*.js,index.html}",
      [
        ["dependency", "index.html"],
        ["dir-dependency", "src", "**/*.js"],
      ],
    ],
    [
      "{index.html,lib/util.js,not-created.html}",
      [
        ["dependency", "index.html"],
        ["dependency", "lib/util.js"],
        ["missing-dependency", "not-created.html"],
      ],
    ],
  ])(
    "adds a dependency message for the static paths of the braces of %s",
    async (glob, expected) => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const messages = await run([glob]);
      warn.mockRestore();
      const sortKey = (message: postcss.Message): string =>
        `${message.type} ${message.file ?? message.dir}`;
      expect(
        [...messages].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1)),
      ).toEqual(
        expected.map(([type, file, pattern]) =>
          type === "dir-dependency"
            ? {
                type,
                plugin: "postcss-purgecss",
                dir: path.join(directory, file),
                glob: pattern,
                parent: "/project/src/style.css",
              }
            : {
                type,
                plugin: "postcss-purgecss",
                file: path.join(directory, file),
                parent: "/project/src/style.css",
              },
        ),
      );
    },
  );

  describe("outside the working directory", () => {
    let outside: string;

    beforeAll(() => {
      outside = fs.realpathSync(
        fs.mkdtempSync(path.join(os.tmpdir(), "postcss-purgecss-outside-")),
      );
      fs.writeFileSync(path.join(outside, "shared.js"), "a");
    });

    afterAll(() => {
      fs.rmSync(outside, { recursive: true, force: true });
      delete process.env.TURBOPACK;
    });

    it("adds the messages of the paths outside the working directory", async () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const messages = await run([
        `${outside}/**/*.js`,
        `${outside}/shared.js`,
        `${outside}/not-created.js`,
      ]);
      warn.mockRestore();
      expect(messages.map(({ type }) => type)).toEqual([
        "dir-dependency",
        "dependency",
        "missing-dependency",
      ]);
    });

    it.each(["1", "auto"])(
      "leaves out the paths outside the working directory with TURBOPACK=%s",
      async (value) => {
        // Turbopack stops with an error for a path outside its root
        process.env.TURBOPACK = value;
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        const messages = await run([
          `${outside}/**/*.js`,
          `${outside}/shared.js`,
          `${outside}/not-created.js`,
          `../${path.basename(outside)}/*.js`,
          "src/**/*.js",
          "index.html",
          "*.html",
        ]);
        warn.mockRestore();
        delete process.env.TURBOPACK;
        expect(messages).toEqual([
          expect.objectContaining({
            type: "dir-dependency",
            dir: path.join(directory, "src"),
          }),
          expect.objectContaining({
            type: "dependency",
            file: path.join(directory, "index.html"),
          }),
          // the content files read in the directory of *.html
          expect.objectContaining({
            type: "dependency",
            file: path.join(directory, "src/app.js"),
          }),
        ]);
      },
    );
  });

  it("adds no message with the option dependencies set to false", async () => {
    const result = await postcss([
      purgeCSSPlugin({
        content: ["index.html", "src/**/*.js", "*.html"],
        dependencies: false,
      }),
    ]).process(".a{color:red}", { from: undefined });
    expect(getDependencies(result)).toEqual([]);
  });

  it.each([
    ["null", null],
    ["an object", { root: undefined }],
  ])("accepts the option dependencies set to %s", async (_, dependencies) => {
    const result = await postcss([
      purgeCSSPlugin({
        content: ["index.html"],
        // null may come from a JSON config
        dependencies: dependencies as UserDefinedOptions["dependencies"],
      }),
    ]).process(".a{color:red}", { from: undefined });
    expect(getDependencies(result).length).toBe(dependencies === null ? 0 : 1);
  });

  it("reports the error alone when the extraction of the content fails", async () => {
    let pluginResult: postcss.Result | undefined;
    const processing = postcss([
      {
        postcssPlugin: "get-result",
        Once(_, { result }) {
          pluginResult = result;
        },
      },
      purgeCSSPlugin({
        content: ["index.html", "src/**/*.js"],
        extractors: [
          {
            extensions: ["html"],
            extractor: () => {
              throw new Error("syntax error");
            },
          },
        ],
      }),
    ]).process(".a{color:red}", { from: undefined });
    await expect(processing).rejects.toThrow("syntax error");
    // the bundlers do not read the messages of a failed run
    expect(getDependencies(pluginResult!)).toEqual([]);
  });

  it("adds a missing-dependency message for a content file not created yet", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(await run(["not-created-yet.html"])).toEqual([
      {
        type: "missing-dependency",
        plugin: "postcss-purgecss",
        file: path.join(directory, "not-created-yet.html"),
        parent: "/project/src/style.css",
      },
    ]);
    warn.mockRestore();
  });

  it("skips the negated patterns, the raw content and the duplicates", async () => {
    const messages = await run([
      "!src/app.js",
      { raw: '<div class="a"></div>', extension: "html" },
      "index.html",
      "./index.html",
      "src/**/*.js",
      "src/**/*.js",
    ]);
    expect(messages.map(({ type }) => type)).toEqual([
      "dependency",
      "dir-dependency",
    ]);
  });

  it("adds the messages of the content given by contentFunction", async () => {
    const result = await postcss([
      purgeCSSPlugin({
        contentFunction: (sourceFile) => [
          sourceFile.replace(/\.css$/, ".js"),
          "pages/*.html",
        ],
      }),
    ]).process(".a{color:red}", { from: path.join(directory, "src/app.css") });
    expect(getDependencies(result)).toEqual([
      {
        type: "dependency",
        plugin: "postcss-purgecss",
        file: path.join(directory, "src/app.js"),
        parent: path.join(directory, "src/app.css"),
      },
      {
        type: "dir-dependency",
        plugin: "postcss-purgecss",
        dir: path.join(directory, "pages"),
        glob: "*.html",
        parent: path.join(directory, "src/app.css"),
      },
    ]);
  });

  it("adds the messages without a css file path", async () => {
    const [message] = await run(["index.html"], null);
    expect(message.parent).toBeUndefined();
    expect(message.file).toBe(path.join(directory, "index.html"));
  });

  it("adds the dependency messages after the rejected selectors", async () => {
    const result = await postcss([
      purgeCSSPlugin({ content: ["index.html"], rejected: true }),
    ]).process(".a{color:red}", { from: undefined });
    expect(result.messages.map(({ type }) => type)).toEqual([
      "purgecss",
      "dependency",
    ]);
  });
});

describe("Purgecss postcss plugin dependency messages under Turbopack", () => {
  let workspace: string;
  const cwd = process.cwd();

  /**
   * Create the files of a directory, with empty content
   */
  function createFiles(dir: string, files: string[]): void {
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), "");
    }
  }

  /**
   * Dependency messages of the plugin run from a directory under Turbopack
   */
  async function runFrom(
    dir: string,
    options: UserDefinedOptions,
  ): Promise<postcss.Message[]> {
    process.chdir(dir);
    process.env.TURBOPACK = "1";
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = await postcss([purgeCSSPlugin(options)]).process(
        ".a{color:red}",
        { from: undefined },
      );
      return getDependencies(result);
    } finally {
      warn.mockRestore();
      delete process.env.TURBOPACK;
      process.chdir(cwd);
    }
  }

  /**
   * Type and absolute path of the messages, relative to the workspace
   */
  function summarize(messages: postcss.Message[]): string[] {
    return messages.map((message) =>
      [
        message.type,
        path.relative(workspace, message.file ?? message.dir),
        message.glob,
      ]
        .filter((part) => part !== undefined)
        .join(" "),
    );
  }

  beforeAll(() => {
    workspace = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "postcss-purgecss-turbopack-")),
    );
  });

  afterAll(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
  });

  it.each([
    ["the lock file", "lock", ["package-lock.json"]],
    ["the pnpm workspace", "pnpm", ["pnpm-workspace.yaml", "pnpm-lock.yaml"]],
  ])(
    "keeps the paths inside the root inferred from %s of a parent directory",
    async (_, name, rootFiles) => {
      const mono = path.join(workspace, name);
      createFiles(mono, [
        ...rootFiles,
        "packages/ui/src/button.tsx",
        "apps/web/app/page.tsx",
        "apps/web/package-lock.json",
      ]);
      createFiles(workspace, ["outside/shared.tsx"]);
      const messages = await runFrom(path.join(mono, "apps/web"), {
        content: [
          "../../packages/ui/src/**/*.tsx",
          "../../packages/ui/src/button.tsx",
          "./app/**/*.tsx",
          "../../../outside/*.tsx",
          "../../../outside/shared.tsx",
        ],
      });
      expect(summarize(messages)).toEqual([
        `dir-dependency ${name}/packages/ui/src **/*.tsx`,
        `dependency ${name}/packages/ui/src/button.tsx`,
        `dir-dependency ${name}/apps/web/app **/*.tsx`,
      ]);
    },
  );

  it("prefers a workspace marker to the lock files above it", async () => {
    const mono = path.join(workspace, "marker", "repo");
    createFiles(path.join(workspace, "marker"), ["package-lock.json"]);
    createFiles(mono, ["lerna.json", "shared/a.tsx", "web/app/page.tsx"]);
    fs.writeFileSync(
      path.join(mono, "web/package.json"),
      JSON.stringify({ name: "web" }),
    );
    const messages = await runFrom(path.join(mono, "web"), {
      content: ["../shared/*.tsx", "../../package-lock.json"],
    });
    expect(summarize(messages)).toEqual([
      "dir-dependency marker/repo/shared *.tsx",
    ]);
  });

  it("uses the root option instead of the inferred root", async () => {
    const mono = path.join(workspace, "option");
    createFiles(mono, [
      "pnpm-lock.yaml",
      "packages/ui/src/button.tsx",
      "packages/other/a.tsx",
      "apps/web/app/page.tsx",
    ]);
    const options = {
      content: ["../../packages/ui/src/**/*.tsx", "../../packages/other/*.tsx"],
    };
    expect(
      summarize(
        await runFrom(path.join(mono, "apps/web"), {
          ...options,
          dependencies: { root: "../../packages/ui" },
        }),
      ),
    ).toEqual(["dir-dependency option/packages/ui/src **/*.tsx"]);
    // the root option applies outside of Turbopack too
    process.chdir(path.join(mono, "apps/web"));
    try {
      const result = await postcss([
        purgeCSSPlugin({
          ...options,
          dependencies: { root: path.join(mono, "packages/other") },
        }),
      ]).process(".a{color:red}", { from: undefined });
      expect(summarize(getDependencies(result))).toEqual([
        "dir-dependency option/packages/other *.tsx",
      ]);
    } finally {
      process.chdir(cwd);
    }
  });

  it.each([
    ["./app/**/*.@(tsx|ts)", "**"],
    ["./app/**/*.+(tsx)", "**"],
    ["./app/**/!(*.test).tsx", "**"],
    ["./app/**/*.[jt]sx", "**/*.[jt]sx"],
    ["./app/**/*.{tsx,ts}", "**/*.{tsx,ts}"],
  ])(
    "gives a glob Turbopack supports for the extended glob %s",
    async (glob, expected) => {
      const project = path.join(workspace, "extglob");
      createFiles(project, ["app/page.tsx"]);
      const [message] = await runFrom(project, { content: [glob] });
      expect(message).toMatchObject({ type: "dir-dependency", glob: expected });
    },
  );
});
