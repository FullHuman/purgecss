# rollup-plugin-purgecss  
![David](https://img.shields.io/david/FullHuman/purgecss?path=packages%2Frollup-plugin-purgecss&style=for-the-badge)
![David](https://img.shields.io/david/dev/FullHuman/purgecss?path=packages%2Frollup-plugin-purgecss&style=for-the-badge)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-%23024ea4?style=for-the-badge)
![npm](https://img.shields.io/npm/v/rollup-plugin-purgecss?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/rollup-plugin-purgecss?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/FullHuman/purgecss?style=for-the-badge)

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

Please read [CONTRIBUTING.md](./../../CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details