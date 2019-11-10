// Invoked on the commit-msg git hook by yorkie.

const msgPath = process.env.HUSKY_GIT_PARAMS;
const msg = require("fs")
  .readFileSync(msgPath, "utf-8")
  .trim();

const commitRE = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(`invalid commit message format.`);
  process.exit(1);
}
