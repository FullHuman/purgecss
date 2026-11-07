import type * as postcss from "postcss";
import type { ExtractorResultSets, StringRegExpArray } from "purgecss";

/**
 * Check if a PostCSS message is an export message of CSS modules, as
 * postcss-modules pushes with the type `export` and the scoped names of the
 * classes in `exportTokens`
 *
 * @param message - PostCSS message
 */
function isExportMessage(
  message: postcss.Message,
): message is postcss.Message & { exportTokens: Record<string, unknown> } {
  return (
    message.type === "export" &&
    typeof message.exportTokens === "object" &&
    message.exportTokens !== null
  );
}

/**
 * Class names and IDs of the rule selectors of a root, unescaped.
 * Approximate: it may hold names that are not classes or IDs, e.g. from a
 * keyframe selector `50.5%` or an attribute selector `[href="#top"]`.
 *
 * @param root - PostCSS root
 */
function getRootNames(root: postcss.Root): {
  classes: Set<string>;
  ids: Set<string>;
} {
  const names = { classes: new Set<string>(), ids: new Set<string>() };
  root.walkRules((rule) => {
    for (const match of rule.selector.matchAll(
      /([.#])((?:[^\s.#:[\]()>+~,*'"\\=|^$]|\\.)+)/g,
    )) {
      const name = match[2].replace(/\\(.)/g, "$1");
      (match[1] === "." ? names.classes : names.ids).add(name);
    }
  });
  return names;
}

/**
 * Names postcss-modules may export a value under, depending on its option
 * `localsConvention`: the name, its camelCase form (as lodash.camelcase
 * gives it for ASCII names) and its dashes form, e.g. `brand-color` gives
 * `brand-color` and `brandColor`
 *
 * @param name - name of a value
 */
function getConventionNames(name: string): string[] {
  const words =
    name.match(
      /[A-Z]{2,}(?=[A-Z][a-z]|[^A-Za-z]|$)|[A-Z]?[a-z]+|[A-Z]+|\d+/g,
    ) ?? [];
  const camelCase = words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
  const dashes = name.replace(/-+(\w)/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
  return [name, camelCase, dashes];
}

/**
 * Values defined or imported with `@value` in a CSS source: postcss-modules
 * exports them along with the classes, e.g. `@value brand: red` gives the
 * token `brand: "red"`, which is no class. The map has an entry for each name
 * postcss-modules may export a value under (see `getConventionNames`), with
 * the value it exports, or `undefined` when the value is unknown, e.g. for an
 * imported value.
 *
 * @param css - CSS source, before postcss-modules
 */
function getValueDefinitions(css: string): Map<string, string | undefined> {
  const definitions = new Map<string, string | undefined>();
  const add = (name: string, value: string | undefined): void => {
    for (const exportedName of getConventionNames(name)) {
      // two values exported under the same name: the value is unknown
      const isConflict =
        definitions.has(exportedName) &&
        definitions.get(exportedName) !== value;
      definitions.set(exportedName, isConflict ? undefined : value);
    }
  };
  // the values by their exact name: a value can refer to the values defined
  // before it, e.g. `@value border: 1px solid brand`
  const values = new Map<string, string | undefined>();
  for (const [, params] of css.matchAll(/@value\s+([^;{}]+)/g)) {
    // `@value a, b as c from "./colors.css"`
    const importMatch = /^([\s\S]+?)\s+from\s+\S+\s*$/.exec(params.trim());
    if (importMatch) {
      for (const item of importMatch[1].replace(/[()]/g, "").split(",")) {
        const alias = item
          .trim()
          .split(/\s+as\s+/)
          .pop();
        if (alias) {
          values.set(alias, undefined);
          add(alias, undefined);
        }
      }
      continue;
    }
    // `@value brand: red` or `@value brand red`
    const definitionMatch = /^([\w-]+):?([\s\S]*)$/.exec(params.trim());
    if (definitionMatch) {
      const [, name, rawValue] = definitionMatch;
      let isKnown = true;
      const value = rawValue.trim().replace(/[\w-]+/g, (word) => {
        if (!values.has(word)) return word;
        const referencedValue = values.get(word);
        if (referencedValue === undefined) isKnown = false;
        return referencedValue ?? word;
      });
      values.set(name, isKnown ? value : undefined);
      add(name, isKnown ? value : undefined);
    }
  }
  return definitions;
}

/**
 * Check if an exported token is a value defined with `@value` rather than a
 * class or an ID: its name is the name of a value, and its value is the one
 * of the value, if known. A class whose name only looks like the name of a
 * value, e.g. `.brand-color` next to `@value brandColor`, is no value.
 *
 * @param definitions - values of the CSS source, from `getValueDefinitions`
 * @param localName - name of the token
 * @param value - value of the token
 */
function isValueToken(
  definitions: Map<string, string | undefined>,
  localName: string,
  value: string,
): boolean {
  if (!definitions.has(localName)) return false;
  const definition = definitions.get(localName);
  return definition === undefined || definition === value.trim();
}

/**
 * Check if a name matches a pattern of the options, as PurgeCSS does: a
 * regular expression, or a string written between slashes like "/^btn-/", is
 * tested against the name, any other string matches the name exactly
 *
 * @param patterns - strings and regular expressions of an option
 * @param name - local name of a class
 */
function matchesAnyPattern(patterns: StringRegExpArray, name: string): boolean {
  return patterns.some((pattern) => {
    const match =
      typeof pattern === "string"
        ? /^\/(.+)\/([dgimsuvy]*)$/.exec(pattern)
        : undefined;
    const regExp = match ? new RegExp(match[1], match[2]) : pattern;
    if (typeof regExp === "string") return regExp === name;
    // a regex with the g or y flag keeps its lastIndex between calls
    regExp.lastIndex = 0;
    return regExp.test(name);
  });
}

/**
 * Options of PurgeCSS that select classes and IDs by name
 */
export interface CSSModulesNameOptions {
  safelist: {
    standard: StringRegExpArray;
    deep: StringRegExpArray;
    greedy: StringRegExpArray;
  };
  blocklist: StringRegExpArray;
}

/**
 * Scoped names of the classes and IDs of CSS modules, sorted by how PurgeCSS
 * must handle them
 */
export interface CSSModulesClassNames {
  /** scoped class names to consider as used */
  used: string[];
  /** scoped IDs to consider as used */
  usedIds: string[];
  /** scoped names to add to the safelists */
  safelist: { standard: string[]; deep: string[]; greedy: string[] };
  /** scoped names to add to the blocklist */
  blocklist: string[];
}

/**
 * Get the scoped names of the classes and IDs of the CSS modules whose local
 * name is used in the content, safelisted or blocklisted.
 *
 * When postcss-modules runs before this plugin, as in Vite, the CSS has
 * scoped (hashed) class names such as `_button_1x2y3_1` while the content
 * refers to the local name, e.g. `styles.button`, and the options name the
 * local name too, e.g. `safelist: ['button']`. postcss-modules gives the
 * mapping in its export message: `{ button: "_button_1x2y3_1" }`. A value can
 * hold several space-separated names when the class composes other classes:
 * the first one is the scoped name of the class, and all of them are kept
 * along with it. A blocklisted local name is not considered as used, and its
 * scoped name is blocklisted. IDs, e.g. `#main`, are scoped and exported the
 * same way.
 *
 * postcss-modules also exports the values defined with `@value`, e.g.
 * `{ brand: "red" }`: a token whose names are no class or ID of the root is
 * skipped. So is a token whose value names a class, e.g. a global class
 * `:global(.red)`, and that is a value of the source: same name (or a
 * `localsConvention` form of it) and same value, or any value for an
 * imported one. A token whose first name was generated by postcss-modules
 * (it is not in the source) is a class or an ID.
 *
 * @param root - PostCSS root, after postcss-modules
 * @param messages - messages of the PostCSS result, `result.messages`
 * @param selectors - selectors found in the content
 * @param options - safelist and blocklist of the options
 * @returns the scoped names to consider as used, safelist and blocklist
 */
export function getCSSModulesClassNames(
  root: postcss.Root,
  messages: postcss.Message[],
  selectors: ExtractorResultSets,
  { safelist, blocklist }: CSSModulesNameOptions,
): CSSModulesClassNames {
  const classNames: CSSModulesClassNames = {
    used: [],
    usedIds: [],
    safelist: { standard: [], deep: [], greedy: [] },
    blocklist: [],
  };
  const exportMessages = messages.filter(isExportMessage);
  if (exportMessages.length === 0) return classNames;
  const rootNames = getRootNames(root);
  const sourceCSS = root.source?.input.css ?? "";
  const valueDefinitions = getValueDefinitions(sourceCSS);
  for (const message of exportMessages) {
    for (const [localName, value] of Object.entries(message.exportTokens)) {
      if (typeof value !== "string") continue;
      const scopedNames = value.split(/\s+/).filter(Boolean);
      // the first name may be gone if its rule only composes others
      const isClass = scopedNames.some((scopedName) =>
        rootNames.classes.has(scopedName),
      );
      // an ID composes nothing
      const isId = scopedNames.length === 1 && rootNames.ids.has(value.trim());
      if (!isClass && !isId) continue;
      // a name generated by postcss-modules, e.g. `_button_1x2y3_1`, is not
      // in the source, unlike a value, or a global class named by a value
      const isGeneratedName =
        (rootNames.classes.has(scopedNames[0]) ||
          rootNames.ids.has(scopedNames[0])) &&
        !sourceCSS.includes(scopedNames[0]);
      if (
        !isGeneratedName &&
        isValueToken(valueDefinitions, localName, value)
      ) {
        continue;
      }
      // like in PurgeCSS, the safelists take precedence over the blocklist
      const [scopedName, ...composedNames] = scopedNames;
      let isSafelisted = false;
      for (const kind of ["standard", "deep", "greedy"] as const) {
        if (matchesAnyPattern(safelist[kind], localName)) {
          classNames.safelist[kind].push(scopedName);
          isSafelisted = true;
        }
      }
      if (isSafelisted) {
        // the classes it composes are kept as they are used with it
        classNames.safelist.standard.push(...composedNames);
        continue;
      }
      if (matchesAnyPattern(blocklist, localName)) {
        classNames.blocklist.push(scopedName);
        continue;
      }
      if (isClass && selectors.hasClass(localName)) {
        classNames.used.push(...scopedNames);
      }
      if (isId && selectors.hasId(localName)) {
        classNames.usedIds.push(scopedName);
      }
    }
  }
  return classNames;
}
