// a regular expression written as a string, e.g. "/^btn-/" or "/^btn-/i", for
// configuration files that cannot contain regular expressions, such as JSON
const REGEXP_STRING = /^\/(.+)\/([dgimsuvy]*)$/;
const regExpStrings = new Map<string, RegExp | undefined>();

/**
 * Get the regular expression written in a string between slashes, e.g.
 * "/^btn-/", or undefined if the string is not written like this
 *
 * @param pattern - string of the options
 */
function toRegExp(pattern: string): RegExp | undefined {
  if (!regExpStrings.has(pattern)) {
    const match = REGEXP_STRING.exec(pattern);
    regExpStrings.set(
      pattern,
      match ? new RegExp(match[1], match[2]) : undefined,
    );
  }
  return regExpStrings.get(pattern);
}

/**
 * Check if a value matches a pattern of the options: a regular expression,
 * or a string written between slashes like "/^btn-/", is tested against the
 * value, any other string matches the value exactly
 *
 * @param pattern - string or regular expression
 * @param value - value to match, e.g. a selector or a variable name
 */
export function matchesPattern(
  pattern: string | RegExp,
  value: string,
): boolean {
  const regExp = typeof pattern === "string" ? toRegExp(pattern) : pattern;
  if (!regExp) {
    return pattern === value;
  }
  // a regex with the g or y flag keeps its lastIndex between calls
  regExp.lastIndex = 0;
  return regExp.test(value);
}
