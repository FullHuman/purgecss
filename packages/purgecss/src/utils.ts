export function matchAll(str: string, regexp: RegExp): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];
  str.replace(regexp, function () {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const match: RegExpMatchArray = Array.prototype.slice.call(args, 0, -2);
    match.input = args[args.length - 1];
    match.index = args[args.length - 2];
    matches.push(match);
    return str;
  });
  return matches;
}
