import postcss from "postcss";

export interface AtRules {
  fontFace: Array<{
    name: string;
    node: postcss.AtRule;
  }>;

  keyframes: postcss.AtRule[];
}

export interface RawContent {
  extension: string;
  raw: string;
}

export interface RawCSS {
  raw: string;
}

export interface ExtractorResultDetailed {
  attributes: {
    names: string[];
    values: string[];
  };
  classes: string[];
  ids: string[];
  tags: string[];
  undetermined: string[];
}

function mergeSets(into: Set<string>, from?: string[] | Set<string>) {
  if (from) {
    from.forEach(into.add, into);
  }
}

export class ExtractorResultSets {
  private undetermined = new Set<string>();
  private attrNames = new Set<string>();
  private attrValues = new Set<string>();
  private classes = new Set<string>();
  private ids = new Set<string>();
  private tags = new Set<string>();

  constructor(er: ExtractorResult) {
    this.merge(er);
  }

  merge(that: ExtractorResult | ExtractorResultSets) {
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
    return this.someAttrValue((value) => value.includes(substr));
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

export type ExtractorResult = ExtractorResultDetailed | string[];

export type ExtractorFunction = (content: string) => ExtractorResult;

export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

export type IgnoreType = "end" | "start" | "next";

export interface UserDefinedOptions {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  whitelist?: string[];
  whitelistPatterns?: Array<RegExp>;
  whitelistPatternsChildren?: Array<RegExp>;
}

export interface Options {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor: ExtractorFunction;
  extractors: Array<Extractors>;
  fontFace: boolean;
  keyframes: boolean;
  output?: string;
  rejected: boolean;
  stdin: boolean;
  stdout: boolean;
  variables: boolean;
  whitelist: string[];
  whitelistPatterns: Array<RegExp>;
  whitelistPatternsChildren: Array<RegExp>;
}

export interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
}
