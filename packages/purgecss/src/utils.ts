/**
 * Check if a value matches a pattern of the options: a string matches the
 * value exactly, a regular expression is tested against it
 *
 * @param pattern - string or regular expression
 * @param value - value to match, e.g. a selector or a variable name
 */
export function matchesPattern(
  pattern: string | RegExp,
  value: string,
): boolean {
  if (typeof pattern === "string") {
    return pattern === value;
  }
  // a regex with the g or y flag keeps its lastIndex between calls
  pattern.lastIndex = 0;
  return pattern.test(value);
}
