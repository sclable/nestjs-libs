module.exports = {
  root: true,
  env: {
    'browser': true,
    'node': true,
    'mocha': true,
    'cypress/globals': true,
  },
  extends: [
    'plugin:cypress/recommended',
    'plugin:vue/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue',
  ],
  plugins: ['no-only-tests', 'eslint-plugin-import', '@typescript-eslint', 'prettier'],
  rules: {
    /*
     * Disable native ESLint rules that don't work well with TypeScript
     * =======================================================================================
     */

    // no-undef does not know about types that are available in TypeScript
    'no-undef': 'off',

    // no-dupe-class-members cannot handle function overloading
    'no-dupe-class-members': 'off',

    /*
     * Rules native to ESLint follow
     * =======================================================================================
     */
    'no-console': 'warn',
    'no-debugger': 'warn',
    'arrow-parens': ['warn', 'as-needed', { requireForBlockBody: false }],
    'space-before-function-paren': [
      'warn',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'consistent-return': 'error',
    'no-confusing-arrow': 'error',
    'no-unused-expressions': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'spaced-comment': 'warn',
    'no-extra-boolean-cast': 'error',
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],

    /*
     * Rules implemented by `no-only-tests` follow
     * =======================================================================================
     */

    'no-only-tests/no-only-tests': 'warn',

    /*
     * Rules implemented by `eslint-plugin-import` follow
     * =======================================================================================
     */
    'import/order': [
      'warn',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'unknown',
        ],
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
    'import/default': 'error',
    'import/export': 'error',
    'import/no-commonjs': 'error',
    'import/no-amd': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-duplicates': 'error',
    'import/no-default-export': 'error',
    'import/no-useless-path-segments': 'warn',
    'import/dynamic-import-chunkname': 'warn',

    /*
     * Rules implemented by `eslint-plugin-prettier` follow
     * =======================================================================================
     */
    'prettier/prettier': ['warn', require('@sclable/prettier-config')],

    /*
     * Rules implemented by `@typescript-eslint` follow
     * =======================================================================================
     */
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/prefer-for-of': 'error',
    '@typescript-eslint/interface-name-prefix': ['error', 'never'],
    '@typescript-eslint/member-delimiter-style': [
      'warn',
      {
        multiline: { delimiter: 'none', requireLast: true },
        singleline: { delimiter: 'semi', requireLast: false },
      },
    ],
    '@typescript-eslint/member-ordering': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '_' },
    ],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/consistent-type-assertions': ['warn'],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/unified-signatures': 'error',
    '@typescript-eslint/no-extraneous-class': 'error',
  },
  overrides: [
    {
      files: ['*.vue', '*.tsx'],
      plugins: ['react'],
      rules: {
        /*
         * Disable rules that don't work well with vue files
         * ===================================================================================
         */
        'import/no-default-export': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',

        /*
         * Rules implemented by `eslint-plugin-react` follow
         * ===================================================================================
         */
        'react/jsx-max-props-per-line': ['warn', { when: 'multiline' }],
        'react/self-closing-comp': 'warn',
        'react/jsx-key': 'warn',
        'react/jsx-max-depth': ['warn', { max: 6 }],
        'react/jsx-no-comment-textnodes': 'error',
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-pascal-case': 'warn',
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        /*
         * Disable rules that don't work well with d.ts files
         * ===================================================================================
         */
        'import/no-default-export': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['.*.js', '*.config.js'],
      rules: {
        /*
         * Disable rules that don't work well with common js config files
         * ===================================================================================
         */
        'import/no-commonjs': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        /*
         * Disable rules that don't work with standard js files
         * ===================================================================================
         */
        'import/no-commonjs': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2019,
    ecmaFeatures: {
      jsx: true,
    },
  },
}
