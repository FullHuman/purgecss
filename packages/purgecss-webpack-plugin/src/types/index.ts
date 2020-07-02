import {
  ComplexSafelist,
  StringRegExpArray,
} from "./../../../purgecss/src/types/index";

export interface RawContent<T = string> {
  extension: string;
  raw: T;
}
export interface RawCSS {
  raw: string;
}
type ExtractorFunction<T = string> = (content: T) => string[];
export interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}

type PathFunction = () => string[];

type SafelistFunction = () => ComplexSafelist;

export interface UserDefinedOptions {
  paths: string[] | PathFunction;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  moduleExtensions?: string[];
  output?: string;
  rejected?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  verbose?: boolean;
  safelist?: StringRegExpArray | ComplexSafelist | SafelistFunction;
  only?: string[];
}

export type PurgedStats = {
  [index: string]: string[];
};

export interface PurgeAsset {
  asset: {
    source: () => string;
  };
  name: string;
}

export interface File {
  resource?: string;
}
