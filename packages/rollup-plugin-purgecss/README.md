# rollup-plugin-purgecss  
[![Build Status](https://travis-ci.org/FullHuman/rollup-plugin-purgecss.svg?branch=master)](https://travis-ci.org/FullHuman/rollup-plugin-purgecss) [![CircleCi](https://circleci.com/gh/FullHuman/rollup-plugin-purgecss/tree/master.svg?style=shield)]() [![dependencies Status](https://david-dm.org/fullhuman/rollup-plugin-purgecss/status.svg)](https://david-dm.org/fullhuman/rollup-plugin-purgecss) [![devDependencies Status](https://david-dm.org/fullhuman/rollup-plugin-purgecss/dev-status.svg)](https://david-dm.org/fullhuman/rollup-plugin-purgecss?type=dev)

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