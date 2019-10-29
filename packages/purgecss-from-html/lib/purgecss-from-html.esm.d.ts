interface ExtractorResult {
  attributes: {
    names: Set<string>;
    values: Set<string>;
  };
  classes: Set<string>;
  ids: Set<string>;
  tags: Set<string>;
  undetermined: Set<string>;
}
declare const purgecssFromHtml: (content: string) => ExtractorResult;
export default purgecssFromHtml;
