---
title: Comparaison
lang: fr-FR
meta:
  - name: description
    content: Comparaison entre PurgeCSS et des outils similaires tels que UnCSS et PurifyCSS.
  - itemprop: description
    content: Comparaison entre PurgeCSS et des outils similaires tels que UnCSS et PurifyCSS.
  - property: og:url
    content:  https://purgecss.com/fr/comparison
  - property: og:site_name
    content: purgecss.com
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: fr_FR
  - property: og:title
    content: Supprimer le CSS inutilisé - PurgeCSS
  - property: og:description
    content: Comparaison entre PurgeCSS et des outils similaires tels que UnCSS et PurifyCSS.
---

# Comparaison

PurgeCSS n'est pas le seul outil permettant de supprimer le CSS inutilisé. Vous trouverez ci-dessous une comparaison entre PurgeCSS et les deux autres outils les plus utilisés pour supprimer le CSS inutilisé.

## UnCSS

Comme indiqué dans son README, UnCSS fonctionne de la manière suivante :

- Les fichiers HTML sont chargés par jsdom, et le JavaScript est exécuté.
- PostCSS analyse toutes les feuilles de style.
  document.querySelector filtre les sélecteurs qui ne sont pas trouvés dans les fichiers HTML.
- Les règles restantes sont reconverties en CSS.

Grâce à son émulation HTML et à l'exécution JavaScript, UnCSS est efficace pour supprimer les sélecteurs inutilisés des applications web.

Cependant, son émulation peut avoir un coût en termes de performance et de praticité. Pour supprimer le CSS inutilisé des fichiers de templates Pug, par exemple, vous devriez convertir le Pug en HTML et émuler la page dans jsdom. Après cette étape, UnCSS peut exécuter document.querySelector sur chaque sélecteur et effectuer l'étape 4.

À l'heure actuelle, UnCSS est probablement l'outil le plus précis pour supprimer le CSS inutilisé dans certaines situations. Si vous n'utilisez pas le rendu côté serveur et que vous avez un site web simple avec HTML et JavaScript, il devrait fonctionner correctement et surpasser PurgeCSS en termes de taille de CSS résultant.

PurgeCSS dispose d'un extractor pour les fichiers JavaScript. L'objectif est de fournir des résultats plus précis, ce qui permettra d'obtenir une taille de CSS inférieure à celle d'UnCSS. Grâce à la modularité de PurgeCSS, les développeurs peuvent créer un extractor pour des frameworks spécifiques (Vue, React, Aurelia) et des types de fichiers (pug, ejs). Ainsi, vous pouvez obtenir les résultats les plus précis sans avoir besoin d'émulation.

## PurifyCSS

La plus grande faiblesse de PurifyCSS est son manque de modularité. Cependant, c'est aussi son plus grand avantage. PurifyCSS peut fonctionner avec n'importe quel type de fichier, pas seulement HTML ou JavaScript.

PurifyCSS fonctionne en examinant tous les mots dans vos fichiers et en les comparant aux sélecteurs de votre CSS. Chaque mot est considéré comme un sélecteur, ce qui signifie que de nombreux sélecteurs peuvent être trouvés utilisés par erreur. Par exemple, vous pourriez avoir un mot dans un paragraphe qui correspond à un sélecteur dans votre CSS.

PurgeCSS résout ce problème en offrant la possibilité de créer un extractor. Un extractor est une fonction qui prend le contenu d'un fichier et en extrait la liste des sélecteurs CSS utilisés. Cela permet une suppression parfaite du CSS inutilisé.

L'extractor peut être utilisé comme un analyseur qui retourne un AST (arbre syntaxique abstrait) et le parcourt pour trouver tous les sélecteurs CSS. C'est ainsi que fonctionne purge-from-html.

Vous pouvez spécifier quels extractors vous souhaitez utiliser pour chaque type de fichier, ce qui vous permet d'obtenir les résultats les plus précis. Mais l'utilisation d'extractors spécifiques est optionnelle, et vous pouvez vous appuyer sur celui par défaut.
