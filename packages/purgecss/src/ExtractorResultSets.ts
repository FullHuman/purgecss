import { ExtractorResult } from "./types";

function mergeSets(into: Set<string>, from?: string[] | Set<string>): void {
  if (from) {
    from.forEach(into.add, into);
  }
}

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

  constructor(er: ExtractorResult) {
    this.merge(er);
  }

  merge(that: ExtractorResult | ExtractorResultSets): this {
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

  hasAttrName(name: string): boolean {
    return this.attrNames.has(name) || this.undetermined.has(name);
  }

  private someAttrValue(predicate: (value: string) => boolean): boolean {
    for (const val of this.attrValues) {
      if (predicate(val)) return true;
    }
    for (const val of this.undetermined) {
      if (predicate(val)) return true;
    }
    return false;
  }

  hasAttrPrefix(prefix: string): boolean {
    return this.someAttrValue((value) => value.startsWith(prefix));
  }

  hasAttrSuffix(suffix: string): boolean {
    return this.someAttrValue((value) => value.endsWith(suffix));
  }

  hasAttrSubstr(substr: string): boolean {
    const wordSubstr = substr.trim().split(" ");
    return wordSubstr.every((word) =>
      this.someAttrValue((value) => value.includes(word)),
    );
  }

  hasAttrValue(value: string): boolean {
    return this.attrValues.has(value) || this.undetermined.has(value);
  }

  hasClass(name: string): boolean {
    return this.classes.has(name) || this.undetermined.has(name);
  }

  hasId(id: string): boolean {
    return this.ids.has(id) || this.undetermined.has(id);
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag) || this.undetermined.has(tag);
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
    this.undetermined = intern(this.undetermined);
    this.attrNames = intern(this.attrNames);
    this.attrValues = intern(this.attrValues);
    this.classes = intern(this.classes);
    this.ids = intern(this.ids);
    this.tags = intern(this.tags);
  }
}

export default ExtractorResultSets;
