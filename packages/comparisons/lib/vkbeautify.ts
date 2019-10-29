// credit: https://github.com/vkiryukhin/vkBeautify/blob/master/vkbeautify.js
function createShiftArr(step: number): string[] {
  const space = " ".repeat(step);
  const shift = ["\n"]; // array of shifts
  for (let ix = 0; ix < 100; ix++) {
    shift.push(shift[ix] + space);
  }
  return shift;
}

function vkbeautify(text: string, step: number): any {
  let ar = text
      .replace(/\s{1,}/g, " ")
      .replace(/\{/g, "{~::~")
      .replace(/\}/g, "~::~}~::~")
      .replace(/\;/g, ";~::~")
      .replace(/\/\*/g, "~::~/*")
      .replace(/\*\//g, "*/~::~")
      .replace(/~::~\s{0,}~::~/g, "~::~")
      .split("~::~"),
    len = ar.length,
    deep = 0,
    str = "",
    ix = 0,
    shift = createShiftArr(step);

  for (ix; ix < len; ix++) {
    if (/\{/.exec(ar[ix])) {
      str += shift[deep++] + ar[ix];
    } else if (/\}/.exec(ar[ix])) {
      str += shift[--deep] + ar[ix];
    } else if (/\*\\/.exec(ar[ix])) {
      str += shift[deep] + ar[ix];
    } else {
      str += shift[deep] + ar[ix];
    }
  }
  return str.replace(/^\n{1,}/, "");
}

export default vkbeautify;
