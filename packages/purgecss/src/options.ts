import { Options, ExtractorResult } from "./types/";

export const emptyWhitelist = {
  attributes: {
    names: [],
    values: []
  },
  classes: [],
  ids: [],
  tags: [],
  undetermined: []
};

export const defaultOptions: Options = {
  css: [],
  content: [],
  defaultExtractor: (content: string): ExtractorResult =>
    content.match(/[A-Za-z0-9_-]+/g) || [],
  extractors: [],
  fontFace: false,
  keyframes: false,
  rejected: false,
  stdin: false,
  stdout: false,
  variables: false,
  whitelist: {...emptyWhitelist},
  whitelistPatterns: {...emptyWhitelist},
  whitelistPatternsChildren: {...emptyWhitelist}
};
