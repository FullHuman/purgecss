import { Command } from "commander";
import * as fs from "fs";
import packageJson from "./../package.json";
import {
  defaultOptions,
  PurgeCSS,
  setOptions,
  standardizeSafelist,
} from "./index";
import { Options } from "./types";

async function writeCSSToFile(filePath: string, css: string) {
  try {
    await fs.promises.writeFile(filePath, css);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
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
  rejectedCss?: boolean;
  safelist?: string[];
  blocklist?: string[];
  skippedContentGlobs: string[];
};

export function parseCommandOptions(program: Command): Command {
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
    .option("-rejected-css, --rejected-css", "option to output rejected css")
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

  return program;
}

export async function getOptions(program: Command): Promise<Options> {
  const {
    config,
    css,
    content,
    output,
    fontFace,
    keyframes,
    variables,
    rejected,
    rejectedCss,
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
  if (rejectedCss) options.rejectedCss = rejectedCss;
  if (variables) options.variables = variables;
  if (safelist) options.safelist = standardizeSafelist(safelist);
  if (blocklist) options.blocklist = blocklist;
  if (skippedContentGlobs) options.skippedContentGlobs = skippedContentGlobs;
  if (output) options.output = output;

  return options;
}

export async function run(program: Command) {
  const options = await getOptions(program);
  const purged = await new PurgeCSS().purge(options);

  // output results in specified directory
  if (options.output) {
    if (purged.length === 1 && options.output.endsWith(".css")) {
      await writeCSSToFile(options.output, purged[0].css);
      return;
    }

    for (const purgedResult of purged) {
      const fileName = purgedResult?.file?.split("/").pop();
      await writeCSSToFile(`${options.output}/${fileName}`, purgedResult.css);
    }
  } else {
    console.log(JSON.stringify(purged));
  }
}

export async function main() {
  try {
    const program = parseCommandOptions(new Command());
    program.parse(process.argv);
    run(program);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}
