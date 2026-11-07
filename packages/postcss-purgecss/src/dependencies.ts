import * as fs from "fs";
import { promises as asyncFs, Stats } from "fs";
import fastGlob from "fast-glob";
import * as os from "os";
import * as path from "path";
import type * as postcss from "postcss";
import { RawContent } from "purgecss";

/**
 * Dependency message of a content file, for the bundlers and dev servers to
 * run the plugin again when the file changes
 */
interface FileDependencyMessage extends postcss.Message {
  type: "dependency" | "missing-dependency";
  file: string;
  parent?: string;
}

/**
 * Dependency message of a content glob: the files matching `glob` in the
 * directory `dir`, including the files created later for the bundlers that
 * watch the directory (webpack, Rspack, Parcel, Turbopack). Vite only watches
 * the files that match when PostCSS runs.
 */
interface DirDependencyMessage extends postcss.Message {
  type: "dir-dependency";
  dir: string;
  glob: string;
  parent?: string;
}

type DependencyMessage = FileDependencyMessage | DirDependencyMessage;

/**
 * Part of a content glob, after its braces are expanded where needed:
 * - `glob`: the files matching `glob` in the directory `dir`;
 * - `file`: a static path, as in `{src/**\/*.js,index.html}`;
 * - `files`: the content files read in the directory `dir`, for a glob that
 *   cannot be given as a directory and a pattern relative to it.
 */
type GlobPart =
  | { type: "glob"; dir: string; glob: string }
  | { type: "file"; file: string }
  | { type: "files"; dir: string };

/**
 * Check if a path is a directory or a path inside it
 *
 * @param filePath - absolute path
 * @param dir - absolute path of the directory
 */
function isInside(filePath: string, dir: string): boolean {
  const relativePath = path.relative(dir, filePath);
  return (
    relativePath === "" ||
    (relativePath.split(path.sep)[0] !== ".." && !path.isAbsolute(relativePath))
  );
}

/**
 * Normalize the slashes of a glob: repeated slashes are collapsed (except
 * leading ones, for UNC paths) and the `.` segments are removed, e.g.
 * `.//src//**\/*.js` gives `src/**\/*.js`. The escapes are kept.
 *
 * @param pattern - glob, or base directory of a glob
 * @returns the normalized pattern, an empty string for `.`
 */
function normalizePattern(pattern: string): string {
  return pattern
    .replace(/(?<!^)\/{2,}/g, "/")
    .split("/")
    .filter((segment) => segment !== ".")
    .join("/");
}

/**
 * Number of segments of the base directory of a glob, e.g. 0 for `.`, 1 for
 * `/` and 2 for `./src/components`
 *
 * @param base - static base directory of a glob, as given by fast-glob
 */
function countBaseSegments(base: string): number {
  const normalizedBase = normalizePattern(base);
  if (normalizedBase === "") return 0;
  // a trailing slash, as in the base `/` of `/*.html`, is no segment
  return normalizedBase.replace(/\/+$/, "").split("/").length;
}

/**
 * The part of a pattern after its base directory, e.g. `**\/*.js` for
 * `./src/**\/*.js` and the base `./src`
 *
 * @param pattern - glob
 * @param base - static base directory of the glob, as given by fast-glob
 * @returns the rest of the pattern, or `undefined` if it cannot be split
 * this way, e.g. when the leading segments of the pattern contain braces
 */
function getRestOfPattern(pattern: string, base: string): string | undefined {
  // the base is unescaped, so count its segments rather than its characters
  const segments = normalizePattern(pattern).split("/");
  const baseSegmentsCount = countBaseSegments(base);
  const baseSegments = segments.slice(0, baseSegmentsCount);
  if (baseSegments.some((segment) => /[{}]/.test(segment))) return undefined;
  // the leading segments, unescaped, must be the base
  const unescapedBase = baseSegments.join("/").replace(/\\(.)/g, "$1");
  if (
    path.resolve(unescapedBase === "" ? "." : unescapedBase) !==
    path.resolve(base)
  ) {
    return undefined;
  }
  const glob = segments.slice(baseSegmentsCount).join("/");
  // never an absolute glob: the bundler would search the whole file system
  if (glob === "" || glob.startsWith("/") || !fastGlob.isDynamicPattern(glob)) {
    return undefined;
  }
  return glob;
}

/**
 * Split a glob in the static directory it starts from and the pattern that
 * remains, relative to that directory.
 *
 * The braces in the directory part are expanded, e.g. `{src,lib}/**\/*.js`
 * gives a directory `src` and a directory `lib` rather than the whole working
 * directory. The braces in the rest of the pattern are kept.
 *
 * @param pattern - glob, as given in the `content` option
 * @returns the parts of the glob, with absolute paths
 */
function splitGlob(pattern: string): GlobPart[] {
  const normalizedPattern = normalizePattern(pattern);
  const tasks = fastGlob.generateTasks([normalizedPattern]);
  // a single base: the original pattern can be kept as is after the base,
  // braces included, as long as the base itself has none
  const singleTask = tasks.length === 1 ? tasks[0] : undefined;
  if (singleTask?.dynamic) {
    const glob = getRestOfPattern(normalizedPattern, singleTask.base);
    if (glob !== undefined) {
      return [{ type: "glob", dir: path.resolve(singleTask.base), glob }];
    }
  }
  // the braces were expanded: one part per expanded pattern
  const parts: GlobPart[] = [];
  for (const task of tasks) {
    for (const expandedPattern of task.positive) {
      if (!fastGlob.isDynamicPattern(expandedPattern)) {
        parts.push({ type: "file", file: path.resolve(expandedPattern) });
        continue;
      }
      const glob = getRestOfPattern(expandedPattern, task.base);
      const dir = path.resolve(task.base);
      parts.push(
        glob === undefined
          ? { type: "files", dir }
          : { type: "glob", dir, glob },
      );
    }
  }
  return parts;
}

/**
 * Lock files that Next.js looks for to infer the root of the workspace
 */
const LOCK_FILES = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];

/**
 * Files that declare the root of a workspace, for pnpm and Lerna
 */
const WORKSPACE_MARKERS = ["pnpm-workspace.yaml", "lerna.json"];

/**
 * Real path of a path, the path itself if it cannot be resolved
 *
 * @param filePath - path to resolve
 */
function toRealPath(filePath: string): string {
  try {
    return fs.realpathSync.native(filePath);
  } catch {
    return filePath;
  }
}

/**
 * Check if a directory declares the root of a workspace: a workspace marker
 * file, or a `package.json` with a `workspaces` field (npm, Yarn, Bun)
 *
 * @param dir - absolute path of the directory
 */
function isWorkspaceRoot(dir: string): boolean {
  if (WORKSPACE_MARKERS.some((name) => fs.existsSync(path.join(dir, name)))) {
    return true;
  }
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(dir, "package.json"), "utf8"),
    );
    return packageJson?.workspaces != null;
  } catch {
    return false;
  }
}

/**
 * Directory of the git repository or worktree that contains a directory.
 * Unlike Next.js, the `.git` file of a submodule stops the search too: the
 * root found can only be narrower than the one of Next.js, never wider.
 *
 * @param cwd - absolute path of the directory
 */
function findGitRoot(cwd: string): string | undefined {
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return toRealPath(dir);
    if (path.dirname(dir) === dir) return undefined;
  }
}

/**
 * Infer the root directory of Turbopack, as Next.js does when neither
 * `turbopack.root` nor `outputFileTracingRoot` is set: the outermost
 * directory with a workspace marker (`pnpm-workspace.yaml`, `lerna.json`,
 * `package.json` with `workspaces`) or, if there is none, with a lock file,
 * within the git repository and below the home directory. Turbopack stops
 * with an error for a path outside this root.
 *
 * @param cwd - absolute path of the project, the working directory
 * @returns the absolute path of the root, `cwd` if none is found
 */
function inferTurbopackRoot(cwd: string): string {
  const fromEnv = process.env.NEXT_PRIVATE_OUTPUT_TRACE_ROOT;
  if (fromEnv) return path.resolve(fromEnv);
  const workspaceRoots: string[] = [];
  const lockFileRoots: string[] = [];
  for (let dir = cwd; ; dir = path.dirname(dir)) {
    if (isWorkspaceRoot(dir)) workspaceRoots.push(dir);
    if (LOCK_FILES.some((name) => fs.existsSync(path.join(dir, name)))) {
      lockFileRoots.push(dir);
    }
    if (path.dirname(dir) === dir) break;
  }
  // a workspace marker takes precedence over the lock files
  const candidates = workspaceRoots.length > 0 ? workspaceRoots : lockFileRoots;
  const gitRoot = findGitRoot(cwd);
  let homeDir: string | undefined;
  try {
    homeDir = toRealPath(os.homedir()) || undefined;
  } catch {
    homeDir = undefined;
  }
  let root = cwd;
  // from the innermost to the outermost candidate
  for (const dir of candidates) {
    if (dir !== cwd) {
      const realDir = toRealPath(dir);
      // never above the git repository, nor the home directory or above it
      if (gitRoot && realDir !== gitRoot && isInside(gitRoot, realDir)) break;
      if (homeDir && isInside(homeDir, realDir)) break;
    }
    root = dir;
  }
  return root;
}

/**
 * Turbopack roots inferred, by working directory
 */
const turbopackRoots = new Map<string, string>();

/**
 * Root directory of the bundler: the paths outside it get no message.
 * Under Turbopack, which stops with an error for a path outside its root,
 * the root Next.js infers when the option `root` is not set. Otherwise, no
 * limit.
 *
 * @param cwd - absolute path of the working directory
 * @param root - `root` option
 * @returns the absolute path of the root, `undefined` for no limit
 */
function getBundlerRoot(cwd: string, root?: string): string | undefined {
  if (root !== undefined) return path.resolve(cwd, root);
  // Turbopack sets the environment variable TURBOPACK, to "1" or "auto"
  if (!process.env.TURBOPACK) return undefined;
  let turbopackRoot = turbopackRoots.get(cwd);
  if (turbopackRoot === undefined) {
    turbopackRoot = inferTurbopackRoot(cwd);
    turbopackRoots.set(cwd, turbopackRoot);
  }
  return turbopackRoot;
}

/**
 * Check if a glob uses the extended glob syntax, e.g. `*.@(js|ts)`, which
 * the glob engine of Turbopack does not support
 *
 * @param glob - glob
 */
function hasExtglob(glob: string): boolean {
  return /(?<!\\)[@+!?*]\(/.test(glob);
}

/**
 * Stats of a path, `undefined` if it does not exist
 *
 * @param filePath - path to check
 */
async function statOrUndefined(filePath: string): Promise<Stats | undefined> {
  try {
    return await asyncFs.stat(filePath);
  } catch {
    return undefined;
  }
}

/**
 * Options of the dependency messages
 */
export interface ContentDependenciesOptions {
  /**
   * Root directory of the bundler, relative to the working directory: the
   * paths outside it get no message. By default, under Turbopack, the root
   * Next.js infers, otherwise no limit.
   */
  root?: string;
}

/**
 * Dependencies of the content, found before the content is extracted
 */
export interface ContentDependencies {
  /**
   * Get the dependency messages, once the content files are read
   *
   * @param parent - path of the CSS file being processed, `result.opts.from`
   * @param contentFiles - absolute paths of the content files read
   */
  getMessages(
    parent: string | undefined,
    contentFiles: Iterable<string>,
  ): DependencyMessage[];
}

/**
 * Get the dependencies of the content, following the PostCSS guidelines for
 * plugins
 * (https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md#3-dependencies),
 * so that the bundlers and dev servers (Vite, webpack and Rspack with
 * postcss-loader, Turbopack, Parcel) run the plugin again when a content file
 * changes or is removed. webpack, Rspack, Turbopack and Parcel also run it
 * again when a file matching a content glob is added; Vite turns a glob into
 * the files that match it when PostCSS runs, so it picks up a new file at the
 * next run of PostCSS for the CSS file only, e.g. once a file that imports
 * the new one is edited:
 *
 * - an existing file gives a `dependency` message with its absolute path;
 * - a glob gives a `dir-dependency` message with the absolute path of the
 *   static directory it starts from and the rest of the pattern;
 * - a file that does not exist (yet) gives a `missing-dependency` message.
 *
 * A glob that starts from the working directory or one of its parents, e.g.
 * `./*.html`, gives a `dependency` message for each content file read in its
 * directory instead: postcss-loader makes webpack and Rspack watch the whole
 * directory of a `dir-dependency`, whatever its glob, and the output of the
 * build written there would build it again and again.
 *
 * The paths outside the root of the bundler are left out: the `root` option,
 * or under Turbopack (Next.js), which stops with an error for a path outside
 * its root, the root Next.js infers from the workspace markers and lock files.
 * Turbopack does not support the extended glob syntax, e.g. `*.@(js|ts)`: a
 * glob that uses it gives the directory it starts from, with the glob `**`.
 *
 * Paths and globs are resolved from the current working directory, like
 * PurgeCSS does. Negated patterns and raw content are skipped.
 *
 * @param content - content option of PurgeCSS
 * @param options - options of the dependency messages
 * @returns the dependencies of the content
 */
export async function getContentDependencies(
  content: Array<string | RawContent>,
  { root }: ContentDependenciesOptions = {},
): Promise<ContentDependencies> {
  const cwd = process.cwd();
  const bundlerRoot = getBundlerRoot(cwd, root);
  const isTurbopack = Boolean(process.env.TURBOPACK);
  const entries = content.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry !== "" && !entry.startsWith("!"),
  );
  const stats = await Promise.all(
    entries.map((entry) => statOrUndefined(path.resolve(entry))),
  );
  const parts: GlobPart[] = [];
  entries.forEach((entry, index) => {
    const entryStats = stats[index];
    // checked first, like PurgeCSS does: an existing path is not a glob
    if (entryStats) {
      // a directory is not a content file: its files are not read
      if (entryStats.isFile()) {
        parts.push({ type: "file", file: path.resolve(entry) });
      }
      return;
    }
    if (fastGlob.isDynamicPattern(entry)) {
      for (const part of splitGlob(entry)) {
        if (part.type !== "glob") {
          parts.push(part);
        } else if (isInside(cwd, part.dir)) {
          // the working directory or a parent of it: its files, see above
          parts.push({ type: "files", dir: part.dir });
        } else if (isTurbopack && hasExtglob(part.glob)) {
          // wider, but Turbopack would never match the files
          parts.push({ type: "glob", dir: part.dir, glob: "**" });
        } else {
          parts.push(part);
        }
      }
      return;
    }
    parts.push({ type: "file", file: path.resolve(entry) });
  });
  // static paths from brace expansion, e.g. `{src/**/*.js,index.html}`
  const staticFiles = parts.flatMap((part) =>
    part.type === "file" ? [part.file] : [],
  );
  const existingFiles = new Set<string>();
  await Promise.all(
    staticFiles.map(async (file) => {
      if ((await statOrUndefined(file))?.isFile()) existingFiles.add(file);
    }),
  );
  const filesDirs = parts.flatMap((part) =>
    part.type === "files" ? [part.dir] : [],
  );
  const isAccepted =
    bundlerRoot !== undefined
      ? (filePath: string) => isInside(filePath, bundlerRoot)
      : () => true;

  return {
    getMessages(parent, contentFiles) {
      const messages = new Map<string, DependencyMessage>();
      const add = (key: string, message: DependencyMessage): void => {
        if (!messages.has(key)) messages.set(key, message);
      };
      const addFile = (file: string): void => {
        const type = existingFiles.has(file)
          ? "dependency"
          : "missing-dependency";
        add(`file:${file}`, {
          type,
          plugin: "postcss-purgecss",
          file,
          parent,
        });
      };
      for (const part of parts) {
        if (part.type === "file") {
          if (isAccepted(part.file)) addFile(part.file);
        } else if (part.type === "glob" && isAccepted(part.dir)) {
          add(`dir:${part.dir}\0${part.glob}`, {
            type: "dir-dependency",
            plugin: "postcss-purgecss",
            dir: part.dir,
            glob: part.glob,
            parent,
          });
        }
      }
      if (filesDirs.length > 0) {
        for (const file of [...contentFiles].sort()) {
          if (
            isAccepted(file) &&
            filesDirs.some((dir) => isInside(file, dir))
          ) {
            existingFiles.add(file);
            addFile(file);
          }
        }
      }
      return [...messages.values()];
    },
  };
}
