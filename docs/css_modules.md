---
title: CSS modules | PurgeCSS
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with CSS modules by modifying the webpack configuration.
  - itemprop: description
    content: PurgeCSS can be used with CSS modules by modifying the webpack configuration.
  - property: og:url
    content:  https://purgecss.com/css_modules
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS can be used with CSS modules by modifying the webpack configuration.
---

# How to use with CSS modules

::: tip
The content of this page comes from [this issue](https://github.com/FullHuman/purgecss/issues/163#issuecomment-526607181).
You can refer to the answer by [@goldmont](https://github.com/goldmont) for more details.
:::

PurgeCSS works by comparing the selectors in your content files with the ones on your CSS files. When using CSS modules, the names of your classes are replaced by a hash. For this reason, working with CSS modules and PurgeCSS might not be as straightforward as you would want it to be.

Below is a way to use PurgeCSS with CSS modules and React.
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