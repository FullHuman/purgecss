---
title: Modules CSS
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS peut être utilisé avec les modules CSS en modifiant la configuration webpack.
  - itemprop: description
    content: PurgeCSS peut être utilisé avec les modules CSS en modifiant la configuration webpack.
  - property: og:url
    content:  https://purgecss.com/fr/css_modules
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS peut être utilisé avec les modules CSS en modifiant la configuration webpack.
---

# Comment utiliser avec les modules CSS

::: tip
Le contenu de cette page provient de [cette issue](https://github.com/FullHuman/purgecss/issues/163#issuecomment-526607181).
Vous pouvez vous référer à la réponse de [@goldmont](https://github.com/goldmont) pour plus de détails.
:::

PurgeCSS fonctionne en comparant les sélecteurs de vos fichiers de contenu avec ceux de vos fichiers CSS. Lors de l'utilisation des modules CSS, les noms de vos classes sont remplacés par un hash. Pour cette raison, travailler avec les modules CSS et PurgeCSS peut ne pas être aussi simple que vous le souhaiteriez.

Voici une façon d'utiliser PurgeCSS avec les modules CSS et React.
Le projet a été créé avec create-react-app. Ensuite, il a été éjecté en exécutant `npm run eject`.


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

Vous pouvez utiliser la syntaxe de module habituelle dans votre JSX comme ceci :

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
