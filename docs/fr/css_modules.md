---
title: Modules CSS
description: "Utilisez PurgeCSS avec les modules CSS : le plugin webpack et le plugin PostCSS dans Vite gardent les classes utilisées des modules CSS, et une configuration postcss-loader pour les autres cas."
lang: fr-FR
---

# Comment utiliser avec les modules CSS

PurgeCSS fonctionne en comparant les sélecteurs de vos fichiers de contenu avec ceux de vos fichiers CSS. Lors de l'utilisation des modules CSS, les noms de vos classes sont remplacés par un hash, par exemple `.button` devient `.card-module__button--VlNeS`, alors que le contenu fait référence à `styles.button`.

## Configurations prises en charge

Depuis la version 9.1.0, les configurations suivantes gardent les classes utilisées des modules CSS sans contournement :

- Le [plugin webpack](plugins/webpack.md#modules-css), avec webpack ou Rspack : il lit les tables des exports des modules CSS (mini-css-extract-plugin, `CssExtractRspackPlugin`, la prise en charge native du CSS de Rspack 1.3 ou ultérieur et de webpack 5.97 ou ultérieur) et garde les classes hashées dont le nom d'export se trouve dans le contenu, ainsi que les classes qu'elles composent.
- Le [plugin PostCSS](plugins/postcss.md#modules-css) dans Vite, où postcss-modules s'exécute avant lui : il garde les classes et ID à portée locale dont le nom local se trouve dans le contenu, ainsi que les classes qu'ils composent.

Ajoutez au contenu les fichiers qui importent les modules CSS (par exemple `./src/**/*.{js,jsx,ts,tsx}`). Avec ces configurations, la configuration ci-dessous n'est plus nécessaire.

## Ce qui n'est pas pris en charge

- Le [plugin Rollup](plugins/rollup.md) ne modifie pas les modules CSS sous Vite, avec un avertissement, car Vite renomme leurs classes avant l'exécution du plugin. Utilisez plutôt le plugin PostCSS.
- Lorsque le plugin PostCSS s'exécute dans postcss-loader (webpack, Rspack), il s'exécute avant que css-loader ou les modules CSS natifs de Rspack et webpack ne hashent les noms de classes, il voit donc les noms locaux, comme dans la configuration ci-dessous. Une classe qui n'est utilisée que par `composes`, par exemple `.base` dans `.button { composes: base }`, n'est pas trouvée dans le contenu et est supprimée : ajoutez-la à la liste blanche, ou utilisez le plugin webpack.
- Avec Rspack antérieur à 1.1 (`CssExtractRspackPlugin`) ou à 1.3 (CSS natif), le plugin webpack supprime les classes hashées, comme avant la version 9.1.0. Avec la prise en charge native du CSS de webpack antérieur à 5.97 (`experiments.css`), des classes utilisées des modules CSS peuvent être supprimées.

## Exécuter le plugin PostCSS avant css-loader

::: tip
Le contenu de cette section provient de [cette issue](https://github.com/FullHuman/purgecss/issues/163#issuecomment-526607181).
Vous pouvez vous référer à la réponse de [@goldmont](https://github.com/goldmont) pour plus de détails.
:::

Voici une façon d'utiliser PurgeCSS avec les modules CSS et React dans une configuration non listée ci-dessus. Le plugin PostCSS s'exécute dans postcss-loader, avant que css-loader ne hashe les noms de classes, si bien que les classes ont encore les noms utilisés dans le contenu (`styles.myCssClass`). Les classes utilisées uniquement par `composes` ne sont pas gardées (voir ci-dessus).
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
