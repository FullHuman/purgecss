import * as fs from "fs";
import * as path from "path";
import { ContentCache, PurgeCSS } from "purgecss";
import type {
  ContentCacheEntry,
  ContentFileStats,
  ExtractorFunction,
  ExtractorResultSets,
  RawContent,
  ResultPurge,
} from "purgecss";
import type {
  OutputBundle,
  Plugin,
  PluginContext,
  SourceDescription,
  TransformPluginContext,
  TransformResult,
} from "rollup";
import { createFilter } from "@rollup/pluginutils";
import { UserDefinedOptions } from "./types";

export * from "./types";

/**
 * Part of Vite's resolved config, of the whole app or of an environment,
 * read by the plugin
 */
interface ViteConfig {
  command: "build" | "serve";
  /** directory the relative paths of the config are resolved from */
  root?: string;
  /** Vite 6 and later: whether the environment runs in a browser */
  consumer?: "client" | "server";
  build?: { ssr?: boolean | string };
}

/**
 * Part of the Vite environment, `this.environment` in the hooks of Vite 6
 * and later, read by the plugin
 */
interface ViteEnvironment {
  config?: ViteConfig;
  /** plugins of the environment, in the order they run */
  plugins?: readonly unknown[];
}

/**
 * Module ids of CSS modules, as Vite detects them
 */
const CSS_MODULE_RE = /\.module\.\w+(?:$|[?#])/;

/**
 * Module ids whose query turns the CSS file into something else than CSS,
 * e.g. Vite's `import css from "./a.css?raw"`
 */
const NOT_CSS_QUERY_RE = /[?&](?:raw|url)(?:[&=#]|$)/;

/**
 * Module ids of CSS files imported as a string with Vite, e.g.
 * `import css from "./a.css?inline"`
 */
const INLINE_QUERY_RE = /[?&]inline(?:[&=#]|$)/;

/**
 * Module ids of Vite's proxy modules for the `<style>` blocks and `style`
 * attributes of the HTML files, whose CSS stays in the HTML
 */
const HTML_PROXY_QUERY_RE = /[?&]html-proxy(?:[&=#]|$)/;

/**
 * Source map inlined at the end of the CSS by PostCSS
 */
const INLINE_SOURCE_MAP_RE = /\r?\n?\/\*# sourceMappingURL=data:[^*]*\*\/\s*$/;

/**
 * Characters of a POSIX path with a meaning in a glob pattern, as escaped by
 * fast-glob's `convertPathToPattern`: `()*?[]{|}`, `!+@` before `(`, a
 * leading `!`, and a backslash not escaping one of them. `+` and `@` alone
 * must not be escaped, as fast-glob then no longer matches them.
 */
const POSIX_GLOB_SPECIAL_CHARS_RE =
  /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;

/**
 * Same as {@link POSIX_GLOB_SPECIAL_CHARS_RE} for a Windows path, whose
 * backslashes are separators
 */
const WINDOWS_GLOB_SPECIAL_CHARS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;

/**
 * Backslashes of a Windows path that are separators, not escaping a
 * character
 */
const WINDOWS_SEPARATORS_RE = /\\(?![!()+@[\]{}])/g;

/**
 * Purged CSS of a module, kept in the module's `meta` so that it survives
 * Rollup's cache
 */
interface PurgeCSSModuleMeta {
  css: string;
}

/**
 * Remove the query and hash of a module id, e.g. `/src/a.css?inline`
 *
 * @param id - module id
 */
function cleanId(id: string): string {
  return id.replace(/[?#].*$/, "");
}

/**
 * Glob pattern matching a directory, like fast-glob's `convertPathToPattern`:
 * forward slashes, and the characters with a meaning in a glob escaped
 *
 * @param dir - absolute path of the directory
 */
function convertPathToPattern(dir: string): string {
  if (path.sep === "\\") {
    return dir
      .replace(WINDOWS_GLOB_SPECIAL_CHARS_RE, "\\$2")
      .replace(/^\\\\([.?])/, "//$1")
      .replace(WINDOWS_SEPARATORS_RE, "/");
  }
  return dir.replace(POSIX_GLOB_SPECIAL_CHARS_RE, "\\$2");
}

/**
 * Resolve a relative glob from a directory
 *
 * @param root - absolute path of the directory to resolve from
 * @param pattern - glob pattern
 */
function resolveGlob(root: string, pattern: string): string {
  if (path.isAbsolute(pattern)) return pattern;
  return path.posix.join(
    convertPathToPattern(root),
    pattern.replace(/^\.\//, ""),
  );
}

/**
 * Resolve a relative path or glob of the content from a directory
 *
 * @param root - absolute path of the directory to resolve from
 * @param pattern - path or glob pattern
 */
function resolveContentPattern(root: string, pattern: string): string {
  if (path.isAbsolute(pattern)) return pattern;
  // like PurgeCSS, which checks that the path exists before using it as a
  // glob, e.g. for `src/[id].html`
  const file = path.resolve(root, pattern);
  if (fs.existsSync(file)) return file;
  return resolveGlob(root, pattern);
}

/**
 * Content cache recording the content files that PurgeCSS reads, while
 * sharing the selectors of the plugin's cache. PurgeCSS gets the selectors
 * of every content file it resolved from the cache before reading it.
 */
class ContentFilesRecorder extends ContentCache {
  /** absolute paths of the content files */
  readonly files = new Set<string>();

  constructor(private readonly cache: ContentCache) {
    super();
  }

  get(
    filePath: string,
    stats: ContentFileStats,
    extractor: ExtractorFunction,
  ): Promise<ExtractorResultSets> | undefined {
    this.files.add(filePath);
    return this.cache.get(filePath, stats, extractor);
  }

  set(filePath: string, entry: ContentCacheEntry): void {
    this.cache.set(filePath, entry);
  }
}

/**
 * Code of the JS module that inserts the purged CSS in the `<head>` of the
 * document, used with the `insert` option
 *
 * @param css - purged CSS
 */
function insertCode(css: string): string {
  return [
    `const css = ${JSON.stringify(css)};`,
    `if (typeof document !== "undefined") {`,
    `  const style = document.createElement("style");`,
    `  style.textContent = css;`,
    `  document.head.appendChild(style);`,
    `}`,
    `export default css;`,
  ].join("\n");
}

/**
 * Purged CSS of the CSS modules of the build, in the order the modules are
 * imported: depth-first through the static imports from the entries, then
 * through the dynamic imports. The order of the CSS is the order of the
 * cascade, so it does not depend on the order in which the files were purged.
 *
 * @param context - plugin context
 * @param bundle - generated bundle
 * @param getCSS - purged CSS of a module, `undefined` if it was not purged
 */
function getStylesInImportOrder(
  context: PluginContext,
  bundle: OutputBundle,
  getCSS: (id: string) => string | undefined,
): string[] {
  const moduleIds = Array.from(context.getModuleIds());
  // the entry chunks are in a deterministic order, unlike the module ids
  const entries: string[] = [];
  for (const output of Object.values(bundle)) {
    if (output.type === "chunk" && output.isEntry && output.facadeModuleId) {
      entries.push(output.facadeModuleId);
    }
  }
  entries.push(
    ...moduleIds.filter((id) => context.getModuleInfo(id)?.isEntry).sort(),
  );

  const visited = new Set<string>();
  const styles: string[] = [];
  const dynamicImports: string[] = [];
  const visit = (id: string): void => {
    if (visited.has(id)) return;
    visited.add(id);
    const info = context.getModuleInfo(id);
    if (!info) return;
    for (const importedId of info.importedIds) visit(importedId);
    dynamicImports.push(...info.dynamicallyImportedIds);
    const css = getCSS(id);
    if (css !== undefined) styles.push(css);
  };
  for (const id of entries) visit(id);
  for (let i = 0; i < dynamicImports.length; i++) visit(dynamicImports[i]);
  // modules not reachable from an entry, e.g. with a plugin emitting chunks
  for (const id of moduleIds.sort()) visit(id);
  return styles;
}

/**
 * Rollup plugin removing the unused CSS of the imported CSS files.
 *
 * @remarks
 * Works with Rollup, Rolldown and Vite.
 *
 * With Rollup and Rolldown, each imported CSS file becomes a JS module. Its
 * default export is the purged CSS, an empty string when the CSS is written
 * to `output`, and the CSS is inserted in the page with `insert`. The content
 * files are watched: in watch mode, a change to one of them purges the CSS
 * again.
 *
 * With Vite, the plugin must be in the `plugins` array of the Vite config,
 * not in `build.rolldownOptions.plugins`. The purged CSS is handed back to
 * Vite's CSS pipeline, which bundles and minifies it. Relative paths of
 * `content` and `output` are resolved from Vite's `root`. The plugin does
 * nothing with `vite serve`, and leaves CSS modules (`*.module.css`)
 * untouched as Vite has already renamed their classes.
 *
 * @param options - options
 * @returns the plugin
 *
 * @public
 */
function pluginPurgeCSS(options: UserDefinedOptions = {}): Plugin {
  const filter = createFilter(
    options.include || ["**/*.css"],
    // `**/` matches the `node_modules` of the parent directories too, e.g. in
    // a workspace, and Vite's root when it is not the current directory
    options.exclude || "**/node_modules/**",
  );

  // content files are only read and extracted again when they changed,
  // instead of once per CSS file and per rebuild
  const contentCache = new ContentCache();
  // content files read during the current build, to prune the cache of the
  // files no longer used
  let buildContentFiles = new Set<string>();
  // set by Vite for the plugins of the top-level `plugins` array
  let viteConfig: ViteConfig | undefined;
  let warnedAboutCSSModules = false;
  let warnedAboutContent = false;
  // whether the last CSS given to `output` was not empty, to empty it when
  // the build no longer has CSS files, e.g. in watch mode
  let outputHasCSS = false;

  /**
   * Vite config of the environment the hook runs in, `undefined` outside of
   * Vite
   *
   * @param context - plugin context
   */
  function getViteConfig(context: PluginContext): ViteConfig | undefined {
    // `this.environment` is also set for the plugins returned by a plugin's
    // `applyToEnvironment`, e.g. with `perEnvironmentPlugin`, whose
    // `configResolved` is not called
    const environment = (context as { environment?: ViteEnvironment })
      .environment;
    return environment?.config ?? viteConfig;
  }

  /**
   * Whether the module is a CSS file to purge
   *
   * @param id - module id
   * @param inVite - whether the plugin runs in Vite
   */
  function shouldPurge(id: string, inVite: boolean): boolean {
    // the module is JS (e.g. Vite's `?raw`), even if `include` matches it
    if (NOT_CSS_QUERY_RE.test(id)) return false;
    if (filter(id)) return true;
    // Vite's CSS pipeline handles `a.css?inline` like `a.css`
    return inVite && INLINE_QUERY_RE.test(id) && filter(cleanId(id));
  }

  /**
   * Directory the relative paths of the content are resolved from, when it
   * is not the current directory that PurgeCSS resolves them from
   *
   * @param root - Vite's root, `undefined` outside of Vite
   */
  function getContentRoot(root: string | undefined): string | undefined {
    if (root === undefined) return undefined;
    const resolved = path.resolve(root);
    return resolved === process.cwd() ? undefined : resolved;
  }

  /**
   * Content to purge a CSS file with, its relative paths resolved from
   * Vite's root
   *
   * @param sourceFile - path of the CSS file
   * @param root - Vite's root, `undefined` outside of Vite
   */
  function getContent(
    sourceFile: string,
    root: string | undefined,
  ): Array<string | RawContent> {
    const content =
      typeof options.contentFunction === "function"
        ? options.contentFunction(sourceFile)
        : options.content || [];
    const contentRoot = getContentRoot(root);
    if (contentRoot === undefined) return content;
    return content.map((entry) =>
      typeof entry === "string"
        ? resolveContentPattern(contentRoot, entry)
        : entry,
    );
  }

  /**
   * Globs of the content files to skip, resolved from Vite's root like the
   * content, as PurgeCSS does not match relative globs against the files of
   * an absolute glob
   *
   * @param globs - globs of the `skippedContentGlobs` option
   * @param root - Vite's root, `undefined` outside of Vite
   */
  function getSkippedContentGlobs(
    globs: string[],
    root: string | undefined,
  ): string[] {
    const contentRoot = getContentRoot(root);
    if (contentRoot === undefined) return globs;
    return globs.map((glob) => resolveGlob(contentRoot, glob));
  }

  /**
   * Source map option given to PurgeCSS
   *
   * @param inVite - whether the plugin runs in Vite
   */
  function getSourceMapOption(
    inVite: boolean,
  ): UserDefinedOptions["sourceMap"] {
    if (!options.sourceMap) return false;
    const sourceMap = options.sourceMap === true ? {} : options.sourceMap;
    // Vite gets the map with the CSS. With Rollup and Rolldown, the module is
    // JS: the map can only be kept inline, in the purged CSS.
    return inVite
      ? { ...sourceMap, inline: false, annotation: false }
      : { ...sourceMap, inline: true };
  }

  const plugin: Plugin & {
    configResolved: (config: ViteConfig) => void;
  } = {
    name: "purgecss",
    // only called by Vite, for the plugins of the top-level `plugins` array
    configResolved(config) {
      viteConfig = config;
    },
    buildStart(this: PluginContext) {
      buildContentFiles = new Set();

      const { viteVersion } = this.meta as { viteVersion?: string };
      if (!viteVersion) return;
      const environment = (this as { environment?: ViteEnvironment })
        .environment;
      const plugins = environment?.plugins;
      // a copy of the plugin, e.g. `{ ...purgecss(), apply: "build" }`, has
      // the same hooks
      const index = plugins
        ? plugins.findIndex(
            (p) =>
              p === plugin ||
              (p as { transform?: unknown }).transform === plugin.transform,
          )
        : -1;
      const cssPostIndex = plugins
        ? plugins.findIndex(
            (p) => (p as { name?: string }).name === "vite:css-post",
          )
        : -1;
      // in `build.rolldownOptions.plugins` or `build.rollupOptions.plugins`,
      // or with `enforce: "post"`, the plugin runs after Vite has replaced
      // the CSS files with JS modules, and would purge nothing. Vite 6 and
      // earlier do not set `viteVersion`.
      const misplaced =
        index !== -1 && cssPostIndex !== -1
          ? index > cssPostIndex
          : getViteConfig(this) === undefined;
      if (misplaced) {
        this.error(
          'rollup-plugin-purgecss must run before the CSS plugins of Vite, which turn the CSS files into JS modules: it must be in the `plugins` array of the Vite config, without `enforce: "post"`, not in `build.rolldownOptions.plugins` or `build.rollupOptions.plugins`.',
        );
      }
    },
    // purged modules are transformed again on every build, as the content
    // may have changed. The content cache only reads the changed files.
    shouldTransformCachedModule({ meta }) {
      return meta?.purgecss !== undefined;
    },
    async transform(
      this: TransformPluginContext,
      code: string,
      id: string,
    ): Promise<TransformResult> {
      const vite = getViteConfig(this);
      if (!shouldPurge(id, vite !== undefined)) return null;

      if (vite) {
        // the dev server would not purge the CSS again when the content
        // changes, leaving out the classes added to it
        if (vite.command === "serve") return null;
        if (CSS_MODULE_RE.test(id)) {
          if (!warnedAboutCSSModules) {
            warnedAboutCSSModules = true;
            this.warn(
              `CSS modules are left untouched: Vite renames their classes before rollup-plugin-purgecss runs, so they cannot be found in the content (${id}). Exclude them with the \`exclude\` option to silence this warning.`,
            );
          }
          return null;
        }
      }

      if (
        !options.content &&
        typeof options.contentFunction !== "function" &&
        !warnedAboutContent
      ) {
        warnedAboutContent = true;
        this.warn(
          "Neither `content` nor `contentFunction` is set: no selector is used, so all the CSS is removed.",
        );
      }

      const sourceFile = cleanId(id);
      const purgeCSS = new PurgeCSS();
      const recorder = new ContentFilesRecorder(contentCache);
      purgeCSS.contentCache = recorder;
      let result: ResultPurge;
      try {
        [result] = await purgeCSS.purge({
          ...options,
          // `content` is optional for the plugin, not for PurgeCSS
          content: getContent(sourceFile, vite?.root),
          // PurgeCSS needs an array, `undefined` would replace its default
          ...(options.skippedContentGlobs && {
            skippedContentGlobs: getSkippedContentGlobs(
              options.skippedContentGlobs,
              vite?.root,
            ),
          }),
          // `output` is an option of the plugin, not of PurgeCSS
          output: undefined,
          sourceMap: getSourceMapOption(vite !== undefined),
          css: [
            {
              raw: code,
              name: sourceFile,
            },
          ],
        });
      } finally {
        // a change to a content file purges the css again in watch mode,
        // also when it made the purge fail, e.g. in an extractor
        for (const file of recorder.files) {
          buildContentFiles.add(file);
          this.addWatchFile(file);
        }
      }

      // the inline map of a file does not match the CSS of all the files
      // joined for `output`
      const css =
        options.sourceMap && !vite
          ? result.css.replace(INLINE_SOURCE_MAP_RE, "")
          : result.css;
      const meta = { purgecss: { css } satisfies PurgeCSSModuleMeta };

      if (vite) {
        // Vite's CSS pipeline expects CSS, not a JS module
        return {
          code: css,
          map: result.sourceMap ?? { mappings: "" },
          meta,
        };
      }

      let moduleCode: string;
      if (options.insert) {
        moduleCode = insertCode(result.css);
      } else if (!options.output) {
        moduleCode = `export default ${JSON.stringify(result.css)};`;
      } else {
        moduleCode = `export default "";`;
      }

      // `moduleType` tells Rolldown, which handles `.css` files as CSS, that
      // the module is now JS. Rollup ignores it.
      const transformResult: SourceDescription & { moduleType: "js" } = {
        code: moduleCode,
        map: { mappings: "" },
        meta,
        moduleType: "js",
      };
      return transformResult;
    },
    buildEnd() {
      // the files of the previous builds no longer used, e.g. deleted
      contentCache.prune(buildContentFiles);
    },
    closeWatcher() {
      contentCache.clear();
    },
    generateBundle(this: PluginContext, _outputOptions, bundle) {
      if (
        typeof options.output !== "string" &&
        typeof options.output !== "function"
      ) {
        return;
      }
      const vite = getViteConfig(this);
      // the server environments of Vite, e.g. for SSR, import the same CSS
      // as the client: the CSS of the client is the one output
      if (
        vite &&
        (vite.consumer ? vite.consumer === "server" : !!vite.build?.ssr)
      ) {
        return;
      }
      // only the modules of this build are visited, leaving out the ones
      // no longer part of it in watch mode
      const purgedStyles = getStylesInImportOrder(this, bundle, (id) => {
        // with Vite, the CSS imported with `?inline` and the CSS of the HTML
        // files is not part of the CSS files Vite emits
        if (
          vite &&
          (INLINE_QUERY_RE.test(id) || HTML_PROXY_QUERY_RE.test(id))
        ) {
          return undefined;
        }
        const meta = this.getModuleInfo(id)?.meta.purgecss as
          PurgeCSSModuleMeta | undefined;
        return meta?.css;
      });
      // the CSS of an earlier build is emptied, e.g. in watch mode once the
      // last CSS file is no longer imported
      if (!purgedStyles.length && !outputHasCSS) return;
      outputHasCSS = purgedStyles.length > 0;

      const css = purgedStyles.join("");
      if (typeof options.output === "string") {
        const output = path.resolve(vite?.root ?? "", options.output);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, css);
        return;
      }
      options.output(css, purgedStyles);
    },
  };

  return plugin;
}

export default pluginPurgeCSS;
