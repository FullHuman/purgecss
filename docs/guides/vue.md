---
title: Vue
lang: en-US
meta:
  - name: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - itemprop: description
    content: PurgeCSS can be used with Vue with the webpack plugin.
  - property: og:url
    content:  https://purgecss.com/guides/vue
  - property: og:site_name
    content: purgecss.com
  - property: og:type
    content: website
  - property: og:image
    content: https://i.imgur.com/UEiUiJ0.png
  - property: og:locale
    content: en_US
  - property: og:title
    content: Remove unused CSS - PurgeCSS
  - property: og:description
    content: PurgeCSS can be used with Vue with the webpack plugin.
---

# Vue

## 通过 vue CLI 来安装

![vue cli plugin purgecss](https://i.imgur.com/ZYnJSin.png)

### 安装

如果你还没有安装 vue-cli 3, 首先，请按照此处的安装说明进行操作: https://github.com/vuejs/vue-cli

用 vue-cli 3.0 来生成一个项目:

```sh
vue create my-app
```

在安装 PurgeCSS 之前, 请你先提交或保存你已经更改的文件， 以防后续需要恢复.

安装 PurgeCSS 只需要用命令行工具打开你项目的文件夹，然后安装 PurgeCSS.

```sh
cd my-app

vue add @fullhuman/purgecss
```

### 用法

下面是 PurgeCSS 在Vue项目中的配置:

```js
{
  content: [ `./public/**/*.html`, `./src/**/*.vue` ],
  defaultExtractor (content) {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '')
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
  },
  safelist: [ /-(leave|enter|appear)(|-(to|from|active))$/, /^(?!(|.*?:)cursor-move).+-move$/, /^router-link(|-exact)-active$/, /data-v-.*/ ],
}
```
