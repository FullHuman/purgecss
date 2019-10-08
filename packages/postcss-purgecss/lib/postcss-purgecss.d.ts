import postcss from "postcss";
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
declare const purgeCSSPlugin: postcss.Plugin<Pick<UserDefinedOptions, "content" | "defaultExtractor" | "extractors" | "fontFace" | "keyframes" | "output" | "rejected" | "stdin" | "stdout" | "variables" | "whitelist" | "whitelistPatterns" | "whitelistPatternsChildren">>;
export default purgeCSSPlugin;
