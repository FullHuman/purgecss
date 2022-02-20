import { rollup, RollupOptions } from "rollup";
import {
  Extractor,
  ExtractorConfig,
  ExtractorLogLevel,
  IExtractorConfigPrepareOptions,
} from "@microsoft/api-extractor";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import path from "path/posix";

const rollupBaseConfig: RollupOptions = {
  input: "./src/index.ts",
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: false,
    }),
    terser(),
  ],
};

export function createRollupConfig(
  packageName: string,
  external: RollupOptions["external"]
): RollupOptions {
  return {
    ...rollupBaseConfig,
    external,
    output: [
      {
        file: `./lib/${packageName}.esm.js`,
        format: "esm",
      },
      {
        exports: "auto",
        file: `./lib/${packageName}.js`,
        format: "cjs",
      },
    ],
  };
}

export async function buildRollup(rollupOptions: RollupOptions): Promise<void> {
  const bundle = await rollup(rollupOptions);
  if (rollupOptions.output) {
    if (Array.isArray(rollupOptions.output)) {
      for (const output of rollupOptions.output) {
        await bundle.write(output);
      }
    } else {
      await bundle.write(rollupOptions.output);
    }
  }
}

const extractorAPIBaseConfig: IExtractorConfigPrepareOptions = {
  configObjectFullPath: undefined,
  packageJsonFullPath: undefined,
  configObject: {
    projectFolder: "",
    compiler: {
      tsconfigFilePath: "tsconfig.json",
    },
    mainEntryPointFilePath:
      "<projectFolder>/lib/.temp/packages/<unscopedPackageName>/src/index.d.ts",
    apiReport: {
      enabled: false,
      reportFileName: "<unscopedPackageName>.api.md"
    },
    docModel: {
      enabled: true,
      apiJsonFilePath:
        "<projectFolder>/../../docs/.vuepress/.temp/api-reference/<unscopedPackageName>.api.json",
    },
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: "",
      publicTrimmedFilePath: "<projectFolder>/lib/<unscopedPackageName>.d.ts",
    },
    tsdocMetadata: {
      enabled: false,
    },
    messages: {
      compilerMessageReporting: {
        default: {
          logLevel: ExtractorLogLevel.Warning,
        },
      },
      extractorMessageReporting: {
        default: {
          logLevel: ExtractorLogLevel.Warning,
        },
        "ae-missing-release-tag": {
          logLevel: ExtractorLogLevel.Warning,
        },
      },
      tsdocMessageReporting: {
        default: {
          logLevel: ExtractorLogLevel.Warning,
        },
      },
    },
  },
};

export async function extractAPI(packageFolder: string): Promise<void> {
  const extractorAPIConfig = ExtractorConfig.prepare({
    ...extractorAPIBaseConfig,
    packageJsonFullPath: path.resolve(packageFolder, "package.json"),
    configObject: {
      ...extractorAPIBaseConfig.configObject,
      projectFolder: packageFolder,
    },
  });
  await Extractor.invoke(extractorAPIConfig);
}
