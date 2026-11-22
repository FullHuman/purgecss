import { ExtractorResult } from "./types";

function mergeSets(into: Set<string>, from?: string[] | Set<string>): void {
  if (from) {
    from.forEach(into.add, into);
  }
}

type LowercaseSetName = "attrNames" | "attrValues" | "tags" | "undetermined";

/**
 * @public
 */
class ExtractorResultSets {
  private undetermined = new Set<string>();
  private attrNames = new Set<string>();
  private attrValues = new Set<string>();
  private classes = new Set<string>();
  private ids = new Set<string>();
  private tags = new Set<string>();
  /**
   * Lowercase copies of the sets, for the case-insensitive lookups. Each is
   * built on its first lookup and dropped when selectors are merged.
   */
  private lowercase: Partial<Record<LowercaseSetName, Set<string>>> = {};

  constructor(er: ExtractorResult) {
    this.merge(er);
  }

  merge(that: ExtractorResult | ExtractorResultSets): this {
    this.lowercase = {};
    if (Array.isArray(that)) {
      mergeSets(this.undetermined, that);
    } else if (that instanceof ExtractorResultSets) {
      mergeSets(this.undetermined, that.undetermined);
      mergeSets(this.attrNames, that.attrNames);
      mergeSets(this.attrValues, that.attrValues);
      mergeSets(this.classes, that.classes);
      mergeSets(this.ids, that.ids);
      mergeSets(this.tags, that.tags);
    } else {
      // ExtractorResultDetailed:
      mergeSets(this.undetermined, that.undetermined);
      if (that.attributes) {
        mergeSets(this.attrNames, that.attributes.names);
        mergeSets(this.attrValues, that.attributes.values);
      }
      mergeSets(this.classes, that.classes);
      mergeSets(this.ids, that.ids);
      mergeSets(this.tags, that.tags);
    }
    return this;
  }

  private getLowercase(name: LowercaseSetName): Set<string> {
    let lowercase = this.lowercase[name];
    if (!lowercase) {
      lowercase = new Set<string>();
      for (const value of this[name]) {
        lowercase.add(value.toLowerCase());
      }
      this.lowercase[name] = lowercase;
    }
    return lowercase;
  }

  /**
   * Returns true if the set, or the undetermined selectors, has the value
   * written in any case
   *
   * @param name - name of the set
   * @param value - value to find
   */
  private hasLowercase(
    name: Exclude<LowercaseSetName, "undetermined">,
    value: string,
  ): boolean {
    const lowercaseValue = value.toLowerCase();
    return (
      this.getLowercase(name).has(lowercaseValue) ||
      this.getLowercase("undetermined").has(lowercaseValue)
    );
  }

  /**
   * Returns true if an attribute name is found. Attribute names are
   * case-insensitive in HTML, `[DATA-STATE]` matches `data-state`.
   *
   * @param name - attribute name
   */
  hasAttrName(name: string): boolean {
    return (
      this.attrNames.has(name) ||
      this.undetermined.has(name) ||
      this.hasLowercase("attrNames", name)
    );
  }

  private someAttrValue(
    predicate: (value: string) => boolean,
    insensitive: boolean,
  ): boolean {
    const values = insensitive
      ? [this.getLowercase("attrValues"), this.getLowercase("undetermined")]
      : [this.attrValues, this.undetermined];
    for (const set of values) {
      for (const val of set) {
        if (predicate(val)) return true;
      }
    }
    return false;
  }

  /**
   * @param prefix - start of the attribute value
   * @param insensitive - whether the value is matched case-insensitively,
   * as with the `i` flag of `[lang|="en" i]`
   */
  hasAttrPrefix(prefix: string, insensitive = false): boolean {
    const start = insensitive ? prefix.toLowerCase() : prefix;
    return this.someAttrValue((value) => value.startsWith(start), insensitive);
  }

  /**
   * @param suffix - end of the attribute value
   * @param insensitive - whether the value is matched case-insensitively,
   * as with the `i` flag of `[href$=".pdf" i]`
   */
  hasAttrSuffix(suffix: string, insensitive = false): boolean {
    const end = insensitive ? suffix.toLowerCase() : suffix;
    return this.someAttrValue((value) => value.endsWith(end), insensitive);
  }

  /**
   * @param substr - words of the attribute value
   * @param insensitive - whether the value is matched case-insensitively,
   * as with the `i` flag of `[title*="new" i]`
   */
  hasAttrSubstr(substr: string, insensitive = false): boolean {
    const wordSubstr = (insensitive ? substr.toLowerCase() : substr)
      .trim()
      .split(" ");
    return wordSubstr.every((word) =>
      this.someAttrValue((value) => value.includes(word), insensitive),
    );
  }

  /**
   * @param value - attribute value
   * @param insensitive - whether the value is matched case-insensitively,
   * as with the `i` flag of `[type="button" i]`
   */
  hasAttrValue(value: string, insensitive = false): boolean {
    return (
      this.attrValues.has(value) ||
      this.undetermined.has(value) ||
      (insensitive && this.hasLowercase("attrValues", value))
    );
  }

  hasClass(name: string): boolean {
    return this.classes.has(name) || this.undetermined.has(name);
  }

  hasId(id: string): boolean {
    return this.ids.has(id) || this.undetermined.has(id);
  }

  /**
   * Returns true if a tag is found. Type selectors are case-insensitive in
   * HTML, `TD` matches `td`.
   *
   * @param tag - tag name
   */
  hasTag(tag: string): boolean {
    return (
      this.tags.has(tag) ||
      this.undetermined.has(tag) ||
      this.hasLowercase("tags", tag)
    );
  }

  /**
   * Replace the selectors with the equal strings of a pool, adding the
   * missing ones to it, so that the selectors kept in memory for many files,
   * e.g. by a content cache, share one string per distinct selector. The
   * strings added are copies: the selectors extracted from a file can be
   * slices of its whole content, which they would keep in memory.
   *
   * @param pool - strings shared by the selectors, by value
   *
   * @internal
   */
  internSelectors(pool: Map<string, string>): void {
    const intern = (selectors: Set<string>): Set<string> => {
      const interned = new Set<string>();
      for (const selector of selectors) {
        let shared = pool.get(selector);
        if (shared === undefined) {
          // a new string, not a slice of the content of the file
          shared = (" " + selector).slice(1);
          pool.set(shared, shared);
        }
        interned.add(shared);
      }
      return interned;
    };
    this.lowercase = {};
    this.undetermined = intern(this.undetermined);
    this.attrNames = intern(this.attrNames);
    this.attrValues = intern(this.attrValues);
    this.classes = intern(this.classes);
    this.ids = intern(this.ids);
    this.tags = intern(this.tags);
  }
}

export default ExtractorResultSets;
