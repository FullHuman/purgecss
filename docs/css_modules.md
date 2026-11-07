---
title: CSS modules
description: "Use PurgeCSS with CSS modules: the webpack plugin and the PostCSS plugin in Vite keep the used CSS-module classes, and a postcss-loader setup for the other cases."
lang: en-US
---

# How to use with CSS modules

PurgeCSS works by comparing the selectors in your content files with the ones on your CSS files. When using CSS modules, the names of your classes are replaced by a hash, e.g. `.button` becomes `.card-module__button--VlNeS`, while the content refers to `styles.button`.

## Supported setups

Since 9.1.0, the following setups keep the used classes of CSS modules without any workaround:

- The [webpack plugin](plugins/webpack.md#css-modules), with webpack or Rspack: it reads the export maps of the CSS modules (mini-css-extract-plugin, `CssExtractRspackPlugin`, the native CSS support of Rspack 1.3 or later and of webpack 5.97 or later) and keeps the hashed classes whose export name is found in the content, along with the classes they compose.
- The [PostCSS plugin](plugins/postcss.md#css-modules) in Vite, where postcss-modules runs before it: it keeps the scoped classes and IDs whose local name is found in the content, along with the classes they compose.

Add the files that import the CSS modules (e.g. `./src/**/*.{js,jsx,ts,tsx}`) to the content. With these setups, the configuration below is no longer needed.

## What is not handled

- The [Rollup plugin](plugins/rollup.md) leaves the CSS modules untouched under Vite, with a warning, as Vite renames their classes before the plugin runs. Use the PostCSS plugin instead.
- When the PostCSS plugin runs in postcss-loader (webpack, Rspack), it runs before css-loader or the native CSS modules of Rspack and webpack hash the class names, so it sees the local names, as in the configuration below. A class that is only used through `composes`, e.g. `.base` in `.button { composes: base }`, is not found in the content and is removed: safelist it, or use the webpack plugin.
- With Rspack older than 1.1 (`CssExtractRspackPlugin`) or 1.3 (native CSS), the webpack plugin removes the hashed classes, as it did before 9.1.0. With the native CSS support of webpack older than 5.97 (`experiments.css`), used classes of the CSS modules may be removed.

## Running the PostCSS plugin before css-loader

::: tip
The content of this section comes from [this issue](https://github.com/FullHuman/purgecss/issues/163#issuecomment-526607181).
You can refer to the answer by [@goldmont](https://github.com/goldmont) for more details.
:::

Below is a way to use PurgeCSS with CSS modules and React in a setup not listed above. The PostCSS plugin runs in postcss-loader, before css-loader hashes the class names, so the classes still have the names used in the content (`styles.myCssClass`). Classes only used through `composes` are not kept (see above).
The project was created with create-react-app. Then, it was ejected running `npm run eject`.


```js
const glob = require('glob-all');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = function(webpackEnv) {

    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';
    const shouldUseRelativeAssetPaths = publicPath === './';

    const getStyleLoaders = (cssOptions, preProcessor) => {
		const loaders = [
			isEnvDevelopment && require.resolve('style-loader'),
			isEnvProduction && {
				loader: MiniCssExtractPlugin.loader,
				options: shouldUseRelativeAssetPaths ? { publicPath: '../../' } : {}
			},
			{
				loader: require.resolve('css-loader'),
				options: cssOptions
			},
			{
				loader: require.resolve('postcss-loader'),
				options: {
					ident: 'postcss',
					syntax: 'postcss-scss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						require('postcss-preset-env')({
							autoprefixer: {
								flexbox: 'no-2009'
							},
							stage: 3
						}),
						require('@fullhuman/postcss-purgecss')({
							content: [ paths.appHtml, ...glob.sync(path.join(paths.appSrc, '/**/*.{js,jsx}'), { nodir: true }) ],
						}),
						require('postcss-normalize')
					].filter(Boolean),
					sourceMap: isEnvProduction && shouldUseSourceMap
				}
			}
		].filter(Boolean);
		if (preProcessor) {
			loaders.push({
				loader: require.resolve(preProcessor),
				options: {
					sourceMap: isEnvProduction && shouldUseSourceMap
				}
			});
		}
		return loaders;
	};

    return {

        /* {...} */

        module: {
            rules: [

              /* {...} */
    
              {
                oneOf: [

                    /* {...} */
    
                    {
                        test: /\.module\.(scss|sass)$/,
                        use: getStyleLoaders(
                            {
                                importLoaders: 2,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                                modules: true,
                                getLocalIdent: getCSSModuleLocalIdent
                            },
                            'sass-loader'
                        )
                    }
    
                    /* {...} */

                ]
              }
    
              /* {...} */

            ]
        },

        /* {...} */
        
    };

};
```

You can use regular module syntax in your JSX just like this:

```js
// @flow

import styles from './Test.module.scss';

import * as React from 'react';

type Props = {};

type State = {};

export default class Test extends React.Component<Props, State> {

	render(): * {
		return (
			<div className={styles.myCssClass}></div>
		);
	}

}
```