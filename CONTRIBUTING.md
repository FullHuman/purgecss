## [Code of Conduct](./.github/CODE_OF_CONDUCT.md)

FullHuman has adopted the Contributor Covenant Code of Conduct for all of its
project. Please read the text so that you understand how to conduct while
contributing to this project.

## Semantic Versioning

Purgecss use [SemVer](http://semver.org/) for versioning.

## Sending a Pull Request

**Before submitting a pull request,** please make sure the following is done:

1. Fork [the repository](https://github.com/FullHuman/purgecss)
   and create your branch from `main`.
2. If you've added code that should be tested, add tests!
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`pnpm test`).
5. Make sure your code lints (`pnpm run lint`).
6. If your change should be released, add a changeset (`pnpm changeset`).

### Development Workflow

PurgeCSS uses [pnpm](https://pnpm.io) workspaces. The pnpm version is pinned in the `packageManager` field of
`package.json`, run `corepack enable` to use it. After cloning PurgeCSS, run `pnpm install` to fetch its
dependencies. Then, you can run several commands:

* `pnpm run build` creates the cjs and es module of all PurgeCSS packages in their `lib` folder.
* `pnpm run lint` checks the code style.
* `pnpm test` runs the complete test suite. Packages are tested against the built output of the packages they depend on, so run `pnpm run build` first.
* `pnpm --filter <package> test` runs the tests of a single package, e.g. `pnpm --filter purgecss test -- --watch`.

### Releasing

Versions and changelogs are managed with [Changesets](https://github.com/changesets/changesets). All packages
share the same version.

1. `pnpm changeset` describes a change and the kind of version bump it needs. Commit the generated file with your pull request.
2. `pnpm run version-packages` consumes the pending changesets, bumps every package and updates the changelogs.
3. Once the version commit is on `main`, the "Publish to npm" workflow publishes the packages that are not on npm yet.

Make sure that your pull request contains unit tests for any new functionality.
This way we can ensure that we don't break your code in the future.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
