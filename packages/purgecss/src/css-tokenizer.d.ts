// Bridge the package's exports-only types for this repository's legacy
// TypeScript moduleResolution: "node" setting.
declare module "@csstools/css-tokenizer" {
  export * from "@csstools/css-tokenizer/dist/index";
}
