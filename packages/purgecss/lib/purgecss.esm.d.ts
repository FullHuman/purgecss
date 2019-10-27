import * as postcss_$0 from "postcss";
interface RawContent {
  extension: string;
  raw: string;
}
interface RawCSS {
  raw: string;
}
declare type ExtractorFunction = (content: string) => string[];
interface Extractors {
  extensions: string[];
  extractor: ExtractorFunction;
}
interface UserDefinedOptions {
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
interface Options {
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
interface ResultPurge {
  css: string;
  file?: string;
  rejected?: string[];
}
declare const defaultOptions: Options;
export declare const selectorsRemoved: Set<string>;
/**
 * Load the configuration file from the path
 * @param configFile Path of the config file
 */
export declare function setOptions(configFile?: string): Promise<Options>;
export declare function setPurgeCSSOptions(purgeCSSOptions: Options): void;
/**
 * Remove unused css
 * @param options PurgeCSS options
 */
declare function purge(
  userOptions: UserDefinedOptions | string | undefined
): Promise<ResultPurge[]>;
/**
 * Extract the selectors present in the files using a purgecss extractor
 * @param files Array of files path or glob pattern
 * @param extractors Array of extractors
 */
export declare function extractSelectorsFromFiles(
  files: string[],
  extractors: Extractors[]
): Promise<Set<string>>;
/**
 * Extract the selectors present in the passed string using a PurgeCSS extractor
 * @param content Array of content
 * @param extractors Array of extractors
 */
export declare function extractSelectorsFromString(
  content: RawContent[],
  extractors: Extractors[]
): Set<string>;
/**
 * Remove unused font-faces
 */
export declare function removeUnusedFontFaces(): void;
/**
 * Remove unused keyframes
 */
export declare function removeUnusedKeyframes(): void;
/**
 * Walk through the CSS AST and remove unused CSS
 * @param root root node of the postcss AST
 * @param selectors selectors used in content files
 */
export declare function walkThroughCSS(
  root: postcss_$0.Root,
  selectors: Set<string>
): void;
export default purge;
export { defaultOptions };
