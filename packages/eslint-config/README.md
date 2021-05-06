# @sclable/eslint-config

This is an ESLint [Shareable Config][eslint-config] specifying code quality and
formatting rules to which Sclable code repositories should comply.

Consider using the [`@sclable/lint`][sclable-lint] package instead, as it's a more high-level alternative.

## Installation

To install:

```shell
npm install --save-dev @sclable/eslint-config
```

Note that this package peer-depends on [`eslint`][eslint] and [`prettier`][prettier], so also install these:

```shell
npm install --save-dev eslint prettier
```

[eslint-config]: https://eslint.org/docs/developer-guide/shareable-configs
[sclable-lint]: https://git.sclable.com/sclable-platform/ts-monorepo/tree/master/packages/lint
[eslint]: https://eslint.org
[prettier]: https://prettier.io
