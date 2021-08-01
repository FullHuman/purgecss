import { program } from "commander";
import fs from "fs";
import packageJson from "./../package.json";
import {
  defaultOptions,
  PurgeCSS,
  setOptions,
  standardizeSafelist,
} from "./index";

async function writeCSSToFile(filePath: string, css: string) {
  try {
    await fs.promises.writeFile(filePath, css);
  } catch (err) {
    console.error(err.message);
  }
}

type CommandOptions = {
  config?: string;
  css?: string[];
  content?: string[];
  output?: string;
  fontFace?: boolean;
  keyframes?: boolean;
  variables?: boolean;
  rejected?: boolean;
  safelist?: string[];
  blocklist?: string[];
  skippedContentGlobs: string[];
};

function parseCommandOptions() {
  program
    .description(packageJson.description)
    .version(packageJson.version)
    .usage("--css <css...> --content <content...> [options]");

  program
    .option("-con, --content <files...>", "glob of content files")
    .option("-css, --css <files...>", "glob of css files")
    .option("-c, --config <path>", "path to the configuration file")
    .option(
      "-o, --output <path>",
      "file path directory to write purged css files to"
    )
    .option("-font, --font-face", "option to remove unused font-faces")
    .option("-keyframes, --keyframes", "option to remove unused keyframes")
    .option("-v, --variables", "option to remove unused variables")
    .option("-rejected, --rejected", "option to output rejected selectors")
    .option(
      "-s, --safelist <list...>",
      "list of classes that should not be removed"
    )
    .option(
      "-b, --blocklist <list...>",
      "list of selectors that should be removed"
    )
    .option(
      "-k, --skippedContentGlobs <list...>",
      "list of glob patterns for folders/files that should not be scanned"
    );

  program.parse(process.argv);
}

async function run() {
  parseCommandOptions();
  // config file is not specified or the content and css are not,
  // PurgeCSS will not run
  const {
    config,
    css,
    content,
    output,
    fontFace,
    keyframes,
    variables,
    rejected,
    safelist,
    blocklist,
    skippedContentGlobs,
  } = program.opts<CommandOptions>();

  // config file is not specified or the content and css are not,
  // PurgeCSS will not run
  if (!config && !(content && css)) {
    program.help();
  }

  // if the config file is present, use it
  // other options specified will override
  let options = defaultOptions;
  if (config) {
    options = await setOptions(config);
  }
  if (content) options.content = content;
  if (css) options.css = css;
  if (fontFace) options.fontFace = fontFace;
  if (keyframes) options.keyframes = keyframes;
  if (rejected) options.rejected = rejected;
  if (variables) options.variables = variables;
  if (safelist) options.safelist = standardizeSafelist(safelist);
  if (blocklist) options.blocklist = blocklist;
  if (skippedContentGlobs) options.skippedContentGlobs = skippedContentGlobs;

  const purged = await new PurgeCSS().purge(options);
  const resultOutput = options.output || output;
  // output results in specified directory
  if (resultOutput) {
    if (purged.length === 1 && resultOutput.endsWith(".css")) {
      await writeCSSToFile(resultOutput, purged[0].css);
      return;
    }

    for (const purgedResult of purged) {
      const fileName = purgedResult?.file?.split("/").pop();
      await writeCSSToFile(`${output}/${fileName}`, purgedResult.css);
    }
  } else {
    console.log(JSON.stringify(purged));
  }
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
