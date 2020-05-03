import fs from "fs";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const message = fs.readFileSync(process.env.HUSKY_GIT_PARAMS!, "utf-8").trim();

const commitRE = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,50}/;

if (!commitRE.test(message)) {
  console.log();
  console.error(`invalid commit message format.`);
  process.exit(1);
}
