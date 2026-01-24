---
title: Configuration
lang: fr-FR
meta:
  - name: description
    content: PurgeCSS dispose d'une liste d'options qui vous permettent de personnaliser son comportement. La personnalisation peut améliorer les performances et l'efficacité de PurgeCSS. Détails sur la configuration de PurgeCSS et les options disponibles.
  - itemprop: description
    content: PurgeCSS dispose d'une liste d'options qui vous permettent de personnaliser son comportement. La personnalisation peut améliorer les performances et l'efficacité de PurgeCSS. Détails sur la configuration de PurgeCSS et les options disponibles.
  - property: og:url
    content:  https://purgecss.com/fr/configuration
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: PurgeCSS dispose d'une liste d'options qui vous permettent de personnaliser son comportement. La personnalisation peut améliorer les performances et l'efficacité de PurgeCSS. Détails sur la configuration de PurgeCSS et les options disponibles.
---

# Configuration

PurgeCSS dispose d'une liste d'options qui vous permettent de personnaliser son comportement. La personnalisation peut améliorer les performances et l'efficacité de PurgeCSS. Vous pouvez créer un fichier de configuration avec les options suivantes.

## Fichier de configuration

Le fichier de configuration est un simple fichier JavaScript. Par défaut, l'API JavaScript recherchera `purgecss.config.js`.

```js
module.exports = {
  content: ['index.html'],
  css: ['style.css']
}
```

Vous pouvez ensuite utiliser PurgeCSS avec le fichier de configuration :

```js
const purgecss = await new PurgeCSS().purge()
// ou utiliser le chemin vers le fichier comme seul paramètre
const purgecss = await new PurgeCSS().purge('./purgecss.config.js')
```

## Options

Les options sont définies par les types suivants :

```ts
interface UserDefinedOptions {
  content: Array<string | RawContent>;
  css: Array<string | RawCSS>;
  defaultExtractor?: ExtractorFunction;
  extractors?: Array<Extractors>;
  fontFace?: boolean;
  keyframes?: boolean;
  output?: string;
  rejected?: boolean;
  rejectedCss?: boolean;
  stdin?: boolean;
  stdout?: boolean;
  variables?: boolean;
  safelist?: UserDefinedSafelist;
  blocklist?: StringRegExpArray;
}

interface RawContent {
  extension: string
  raw: string
}

interface RawCSS {
  raw: string
}

type StringRegExpArray = Array<RegExp | string>;

type ComplexSafelist = {
  standard?: StringRegExpArray;
  deep?: RegExp[];
  greedy?: RegExp[];
  variables?: StringRegExpArray;
  keyframes?: StringRegExpArray;
};

type UserDefinedSafelist = StringRegExpArray | ComplexSafelist;
```

- **content**

Vous pouvez spécifier le contenu qui doit être analysé par PurgeCSS avec un tableau de noms de fichiers ou de [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer). Les fichiers peuvent être HTML, Pug, Blade, etc.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css']
})
```

PurgeCSS fonctionne également avec du contenu brut. Pour ce faire, vous devez passer un objet avec la propriété `raw` au lieu d'un nom de fichier. Pour fonctionner correctement avec des extracteurs personnalisés, vous devez passer la propriété `extension` avec le contenu brut.

```js
await new PurgeCSS().purge({
  content: [
    {
      raw: '<html><body><div class="app"></div></body></html>',
      extension: 'html'
    },
    '**/*.js',
    '**/*.html',
    '**/*.vue'
  ],
  css: [
    {
      raw: 'body { margin: 0 }'
    },
    'css/app.css'
  ]
})
```

- **css**

Similaire à `content`, vous pouvez spécifier le CSS qui doit être traité par PurgeCSS avec un tableau de noms de fichiers ou de [globs](https://github.com/isaacs/node-glob/blob/master/README.md#glob-primer).

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css']
})
```

PurgeCSS fonctionne également avec du CSS brut. Pour ce faire, vous devez passer un objet avec la propriété `raw` au lieu d'un nom de fichier.

```js
await new PurgeCSS().purge({
  content: [
    {
      raw: '<html><body><div class="app"></div></body></html>',
      extension: 'html'
    },
    '**/*.js',
    '**/*.html',
    '**/*.vue'
  ],
  css: [
    {
      raw: 'body { margin: 0 }'
    }
  ]
})
```

- **defaultExtractor**

PurgeCSS peut être adapté à vos besoins. Si vous remarquez que beaucoup de CSS inutilisé n'est pas supprimé, vous pouvez utiliser un extracteur personnalisé. Les extracteurs peuvent être utilisés en fonction des extensions de fichiers. Si vous souhaitez utiliser le même extracteur pour tous les types de fichiers, spécifiez votre extracteur dans `defaultExtractor`.

```js
await new PurgeCSS().purge({
  // ...
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})
```

- **extractors**

PurgeCSS peut être adapté à vos besoins. Si vous remarquez que beaucoup de CSS inutilisé n'est pas supprimé, vous pouvez utiliser un extracteur personnalisé. Vous pouvez trouver une liste d'extracteurs disponibles, ils peuvent fournir une meilleure précision et une meilleure optimisation, mais leur comportement leur est propre. Ce qui peut rendre les choses difficiles à comprendre.

Considérez l'utilisation des extracteurs comme une technique d'optimisation avancée qui n'est pas forcément nécessaire.

```js
import purgeFromHTML from 'purge-from-html'

await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  extractors: [
    {
      extractor: purgeFromHTML,
      extensions: ['html']
    },
    {
      extractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      extensions: ['vue', 'js']
    }
  ]
})
```

Vous pouvez en apprendre plus sur les extracteurs [ici](extractors.md).

- **fontFace \(par défaut : false\)**

S'il y a des règles @font-face inutilisées dans votre CSS, vous pouvez les supprimer en définissant l'option `fontFace` à `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  fontFace: true
})
```

- **keyframes \(par défaut : false\)**

Si vous utilisez une bibliothèque d'animations CSS telle que animate.css, vous pouvez supprimer les keyframes inutilisés en définissant l'option `keyframes` à `true`.

PurgeCSS détecte les keyframes utilisés en analysant les valeurs des propriétés `animation` et `animation-name`, ainsi que les valeurs des propriétés personnalisées CSS (variables). Cela signifie que les keyframes référencés via des variables CSS seront correctement préservés :

```css
.component {
  animation: var(--component-animation);
}
.component--animated {
  --component-animation: fadeIn 0.4s;
}
@keyframes fadeIn {
  /* Ce keyframe sera préservé car "fadeIn" apparaît dans --component-animation */
}
```

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  keyframes: true
})
```

- **variables \(par défaut : false\)**

Si vous utilisez des propriétés personnalisées (variables CSS), ou une bibliothèque qui les utilise comme Bootstrap, vous pouvez supprimer les variables CSS inutilisées en définissant l'option `variables` à `true`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  variables: true
})
```

- **rejected \(par défaut : false\)**

Il peut parfois être plus pratique de parcourir la liste des éléments supprimés pour voir s'il y a quelque chose d'évidemment incorrect. Si vous voulez le faire, utilisez l'option `rejected`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  rejected: true
})
```
- **rejectedCss \(par défaut : false\)**

Si vous souhaitez conserver le CSS supprimé, vous pouvez le faire en utilisant l'option `rejectedCss`.

```js
await new PurgeCSS().purge({
  content: ['index.html', '**/*.js', '**/*.html', '**/*.vue'],
  css: ['css/app.css'],
  rejectedCss: true
})
```

- **safelist**

Vous pouvez indiquer quels sélecteurs peuvent être laissés en toute sécurité dans le CSS final. Cela peut être accompli avec l'option `safelist`.

Deux formes sont disponibles pour cette option.

```js
safelist: ['random', 'yep', 'button', /^nav-/]
```

Sous cette forme, safelist est un tableau qui peut contenir une chaîne de caractères ou une expression régulière.

La forme _complexe_ est :

```js
safelist: {
    standard: ['random', 'yep', 'button', /^nav-/],
    deep: [],
    greedy: [],
    keyframes: [],
    variables: []
}
```

Exemple :

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: ['random', 'yep', 'button']
})
```

Dans cet exemple, les sélecteurs `.random`, `#yep`, `button` seront laissés dans le CSS final.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: [/red$/]
})
```

Dans cet exemple, les sélecteurs se terminant par `red` comme `.bg-red` seront laissés dans le CSS final.

- **safelist.deep**

Vous pouvez mettre en safelist des sélecteurs et leurs enfants basés sur une expression régulière avec `safelist.deep`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: {
    deep: [/red$/]
  }
})
```

Dans cet exemple, les sélecteurs tels que `.bg-red .child-of-bg` seront laissés dans le CSS final, même si `child-of-bg` n'est pas trouvé.

- **safelist.greedy**

Enfin, vous pouvez mettre en safelist des sélecteurs entiers si une partie de ce sélecteur correspond à une expression régulière avec `safelist.greedy`.

```js
const purgecss = await new PurgeCSS().purge({
  content: [],
  css: [],
  safelist: {
    greedy: [/red$/]
  }
})
```

Dans cet exemple, les sélecteurs tels que `button.bg-red.nonexistent-class` seront laissés dans le CSS final, même si `button` et `nonexistent-class` ne sont pas trouvés.

- **blocklist**

La blocklist bloquera les sélecteurs CSS pour qu'ils n'apparaissent pas dans le CSS final. Les sélecteurs seront supprimés même s'ils sont considérés comme utilisés par PurgeCSS.

```js
blocklist: ['usedClass', /^nav-/]
```
Même si nav-links et usedClass sont trouvés par un extracteur, ils seront supprimés.

- **skippedContentGlobs**

Si vous fournissez des globs pour le paramètre `content`, vous pouvez utiliser cette option pour exclure certains fichiers ou dossiers qui seraient autrement analysés. Passez un tableau de globs correspondant aux éléments qui doivent être exclus. (Note : cette option n'a aucun effet si `content` n'utilise pas de globs.)

```js
skippedContentGlobs: ['node_modules/**', 'components/**']
```
Ici, PurgeCSS n'analysera rien dans les dossiers "node_modules" et "components".

- **dynamicAttributes**

Option pour ajouter des sélecteurs d'attributs CSS personnalisés comme "aria-selected", "data-selected", etc.

```js
dynamicAttributes: ["aria-selected"]
```
