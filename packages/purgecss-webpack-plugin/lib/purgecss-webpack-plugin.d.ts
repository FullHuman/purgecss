// Type definitions for purgecss-webpack-plugin 0.22.0
// Project: https://github.com/FullHuman/purgecss-webpack-plugin
// Definitions by: JounQin https://github.com/JounQin

import { Options as PurgecssOptions } from 'purgecss'
import { Plugin } from 'webpack'

// workaround to override Options of purgecess
interface _Options extends Partial<PurgecssOptions> {
  css?: never
  content?: never
  whitelist?: any
  whitelistPatterns?: any
  whitelistPatternsChildren?: any
}

declare namespace PurgecssWebpackPlugin {
  interface Options extends _Options {
    paths: string[] | (() => string[])
    only?: string[]
    whitelist?: string[] | (() => string[])
    whitelistPatterns?: RegExp[] | (() => RegExp[]),
    whitelistPatternsChildren?: RegExp[] | (() => RegExp[]),
  }
}

declare class PurgecssWebpackPlugin extends Plugin {
  constructor(options: PurgecssWebpackPlugin.Options)
}

export = PurgecssWebpackPlugin
