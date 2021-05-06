# DEPRECATED: tsconfig

This package bundles a `tsconfig.json` to be extended by Sclable projects.
It is deprecated and you should use ESLint in conjunction with
`@sclable/lint` instead.

## Usage

Install this package via NPM:

```shell
npm install @sclable/tsconfig
```

Create `tsconfig.json` extending the one provided by this package:

```shell
echo '{ "extends": "./node_modules/@sclable/tsconfig/tsconfig.json" }' \
  > tsconfig.json
```

For more information, see [configuration inheritance with `extends`][more]

[more]: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#configuration-inheritance-with-extends
