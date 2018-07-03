# rollup-plugin-purgecss  
[![Build Status](https://travis-ci.org/FullHuman/rollup-plugin-purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/rollup-plugin-purgecss) [![CircleCi](https://circleci.com/gh/FullHuman/rollup-plugin-purgecss/tree/master.svg?style=shield)]() [![dependencies Status](https://david-dm.org/fullhuman/rollup-plugin-purgecss/status.svg)](https://david-dm.org/fullhuman/rollup-plugin-purgecss) [![devDependencies Status](https://david-dm.org/fullhuman/rollup-plugin-purgecss/dev-status.svg)](https://david-dm.org/fullhuman/rollup-plugin-purgecss?type=dev)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8ae0379b223a459ca1b704648e924d55)](https://www.codacy.com/app/FullHuman/rollup-plugin-purgecss?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=FullHuman/rollup-plugin-purgecss&amp;utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/rollup-plugin-purgecss.svg)](https://www.npmjs.com/package/rollup-plugin-purgecss)
[![license](https://img.shields.io/github/license/fullhuman/rollup-plugin-purgecss.svg)]() [![Greenkeeper badge](https://badges.greenkeeper.io/FullHuman/rollup-plugin-purgecss.svg)](https://greenkeeper.io/)

[Rollup](https://github.com/rollup/rollup) plugin to remove unused css.

## Install

```sh
npm i rollup-plugin-purgecss -D
```

## Usage

```js
import { rollup } from 'rollup';
import purgecss from 'rollup-plugin-purgecss';

rollup({
    entry: 'main.js',
    plugins: [
        purgecss({
            content: ["index.html"]
        })
    ]
});
```

## Contributing

Please read [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details