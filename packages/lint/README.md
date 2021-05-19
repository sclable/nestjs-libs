# @sclable/lint

This package is a convenient wrapper of the ESLint configuration found in
`@sclable/eslint-config` which also brings with it supported versions of ESLint
and Prettier by default.

To inspect the specific linting rules you can check the
[rules of `@sclable/eslint-config`][eslint-config-mainjs], since `@sclable/lint`
just re-exports that configuration.

## Usage

To make use of this package, you must create an ESLint configuration file that
references it. This is commonly done with the `extends` field in a file named
`.eslintrc.js` found in your repository's root directory:

```js
module.exports = {
  extends: ['@sclable'],
}
```

It's recommended to start with a config that looks like this:

```js
module.exports = {
  extends: ['@sclable'],
  root: true,
  ignorePatterns: ['!.eslintrc.js', 'dist'],
  rules: {
    // override or extend rules coming from `@sclable/lint` as needed
  },
}
```

Now, `eslint` can be invoked as usual for all supported file extensions:

```shell
npx eslint . --ext .js,.ts,.jsx,.tsx,.vue
```

## Prettier

Note that this linter configuration comes with [Prettier][prettier] built-in and running from within ESLint.
As a result, code formatting can produce linting warnings and fixing them
is as easy as running ESLint with the `--fix` option.

For this reason, please ensure no dedicated prettier extensions/scripts are running in your IDE to avoid conflicts!
The section [Enable fix-on-save for VS Code users](#enable-fix-on-save-for-vs-code-users)
will automatically take care of this for you on the IDE level.

Prettier's configuration lives in [`@sclable/prettier-config`][sclable-prettier-config] and is _non-extendable_.
In case we want to _overwrite_ prettier's config with our own [configuration file](https://prettier.io/docs/en/configuration.html),
we need to extend our `.eslintrc.js` with the following:

```js
module.exports = {
  // ...
  rules: {
    // ...
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
  },
}
```

[More info on custom prettier rules](https://github.com/prettier/eslint-plugin-prettier#options)

## Bonus: Linting Recipies 📝

### Use as npm scripts

You can copy-paste the following scripts in your `package.json` to "lint-only"
(for pipelines) and "lint-and-fix" (for repo-wide clean-up):

```json
{
  "scripts": {
    // ...
    "lint": "eslint . --ext .js,.ts,.tsx,.vue --max-warnings 0 --cache --cache-location 'node_modules/.cache/.eslintcache'",
    "lintfix": "npm run lint -- --fix"
  },
}
```

The above scripts also disallow warnings and utilize caching (strongly advised).

### Enable linting as a Git pre-commit hook

#### For non-vue projects

Install the necessary dependencies ([`husky`][husky] is a Git hook manager):

```shell
npm install --save-dev husky lint-staged
```

In your `package.json` append the following

```json
{
  "scripts": {
    // ...
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx,vue}": "eslint --fix --max-warnings 0 --cache --cache-location 'node_modules/.cache/.eslintcache'"
  }
}
```

#### For Vue projects

A vue-cli generated project has the dependency `@vue/cli-service` which comes
with [`Yorkie`][yorkie] pre-installed. Yorkie is a fork of Husky mentioned
in the above general example so we can just use it directly with the following
`package.json` configuration:

```json
{
  "scripts": {
    // ...
  },
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx,vue}": "eslint --fix --max-warnings 0 --cache --cache-location 'node_modules/.cache/.eslintcache'"
  }
}
```

### Enable realtime in-editor linting for VS Code users

Make sure you have [ESLint extension][vscode-eslint-ext] installed from the VS Code Marketplace.

In your repository root, create a file `.vscode/settings.json` with the following
contents:

```json
{
  // Eslint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue"
  ],
}
```

It is recommended that this file is checked-in to Git.

### Enable fix-on-save for VS Code users

Make sure you have [ESLint extension][vscode-eslint-ext] installed from the VS Code Marketplace.

In your repository root, create a file `.vscode/settings.json` with the following
contents:

```json
{
  // VSCode
  "[javascript]": {
    "editor.formatOnSave": false
  },
  "[typescript]": {
    "editor.formatOnSave": false
  },

  // Eslint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },

  // Prettier
  // In case `prettier` extension is additionally enabled,
  // we switch it off since we are running prettier through eslint already
  "prettier.disableLanguages": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html",
    "vue"
  ],
}
```

It is recommended that this file is checked-in to Git.

[prettier]: https://prettier.io
[sclable-prettier-config]: https://git.sclable.com/sclable-platform/ts-monorepo/blob/master/packages/prettier-config/index.json
[husky]: https://npmjs.com/package/husky
[yorkie]: https://github.com/yyx990803/yorkie
[vscode-eslint-ext]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[eslint-config-mainjs]: https://git.sclable.com/sclable-platform/ts-monorepo/blob/master/packages/eslint-config/index.js
