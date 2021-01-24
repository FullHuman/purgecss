import { ExtractorResult } from "./types";

function mergeSets(into: Set<string>, from?: string[] | Set<string>): void {
  if (from) {
    from.forEach(into.add, into);
  }
}

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
      this.someAttrValue((value) => value.includes(word))
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
}

export default ExtractorResultSets;
