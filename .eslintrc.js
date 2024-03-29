// @ts-check
/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  env: {
    es6: true,
    node: true
  },
  globals: {
    MyGlobal: true
  },
  ignorePatterns: [
    '**/lib/**/*.ts'
  ],
  rules: {
    'template-curly-spacing': [ 'error', 'always' ],
    'space-infix-ops': 'error',
    'array-bracket-newline': 'off',
    'array-bracket-spacing': [ 'error', 'always' ],
    'array-element-newline': 'off',
    'block-spacing': [ 'error', 'always' ],
    'brace-style': [ 'error', '1tbs', {
      'allowSingleLine': true
    } ],
    'camelcase': [ 'error', {
      'properties': 'never'
    } ],
    'comma-dangle': [ 'error', 'never' ],
    'comma-spacing': [ 'error', {
      'after': true,
      'before': false
    } ],
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'curly': [ 'error', 'multi-line' ],
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'indent': [ 'error', 2, {
      'CallExpression': {
        'arguments': 1
      },
      'FunctionDeclaration': {
        'body': 1,
        'parameters': 1
      },
      'FunctionExpression': {
        'body': 1,
        'parameters': 1
      },
      'ignoredNodes': [ 'ConditionalExpression' ],
      'MemberExpression': 1,
      'ObjectExpression': 1,
      'SwitchCase': 1
    } ],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'max-len': [ 'error', {
      code: 120,
      ignoreComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      tabWidth: 2
    } ],
    'new-cap': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-invalid-this': 'error',
    'no-irregular-whitespace': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',

    'no-multiple-empty-lines': [ 'error', {
      max: 2
    } ],
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-tabs': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-unused-vars': [ 'error', {
      args: 'none'
    } ],

    'no-with': 'error',
    'object-curly-spacing': [ 'error', 'always' ],
    'one-var': [ 'error', {
      const: 'never',
      let: 'never',
      var: 'never'
    } ],
    'operator-linebreak': [ 'error', 'after' ],
    'padded-blocks': [ 'error', 'never' ],
    'prefer-promise-reject-errors': 'error',
    'quotes': [ 'error', 'single', {
      allowTemplateLiterals: true
    } ],
    'semi': [ 'error' ],
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': [ 'error', {
      asyncArrow: 'always',
      anonymous: 'never',
      named: 'never'
    } ],
    'spaced-comment': [ 'error', 'always' ],
    'switch-colon-spacing': 'error',
    'arrow-parens': [ 'error', 'always' ],
    'constructor-super': 'error', // eslint:recommended
    'generator-star-spacing': [ 'error', 'after' ],
    'no-new-symbol': 'error', // eslint:recommended
    'no-this-before-super': 'error', // eslint:recommended
    'no-var': 'error',
    'prefer-const': [ 'error', { destructuring: 'all' } ],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'rest-spread-spacing': 'error',
    'yield-star-spacing': [ 'error', 'after' ],
    // 'no-await-in-loop': 'warn',
    'no-unreachable-loop': 'error',
    // 'require-atomic-updates': 'error',
    'dot-notation': 'error',
    // 'require-await': 'warn',
    // 'no-shadow': 'warn',
    'no-undefined': 'error',
    'line-comment-position': [ 'error', { position: 'above' } ],
    'arrow-spacing': [ 'error', { 'before': true, 'after': true } ],
    'no-process-env': 'error'
  },
  overrides: [
    {
      files: [ '*.ts', '*.tsx' ],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint/eslint-plugin',
        'unused-imports',
        'simple-import-sort',
        'import'
      ],
      parserOptions: {
        project: [
          './tsconfig.eslint.json'
        ],
        sourceType: 'module'
      },
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      env: {
        node: true,
        jest: true
      },
      /**
     * Typescript Rules
     * https://github.com/bradzacher/eslint-plugin-typescript
     * Enable your own typescript rules.
     */
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'new-cap': 'off',
        'unused-imports/no-unused-imports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'eol-last': [ 2, 'windows' ],
        'comma-dangle': [ 'error', 'never' ],
        'quotes': [ 'error', 'single' ],
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/member-delimiter-style': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            'selector': 'interface',
            'format': [ 'PascalCase' ],
            'custom': {
              'regex': '^I[A-Z]',
              'match': true
            }
          }
        ],
        'semi': 'off',
        '@typescript-eslint/semi': [ 'error' ],
        'space-infix-ops': 'error',
        'array-bracket-newline': 'off',
        'array-bracket-spacing': [ 'error', 'always' ],
        'array-element-newline': 'off',
        'block-spacing': [ 'error', 'always' ],
        'brace-style': [ 'error', '1tbs', {
          'allowSingleLine': true
        } ],
        'camelcase': [ 'error', {
          'properties': 'never'
        } ],
        'comma-spacing': [ 'error', {
          'after': true,
          'before': false
        } ],
        'comma-style': 'error',
        'computed-property-spacing': 'error',
        'curly': [ 'error', 'multi-line' ],
        'func-call-spacing': 'error',
        'indent': [ 'error', 2, {
          'CallExpression': {
            'arguments': 1
          },
          'FunctionDeclaration': {
            'body': 1,
            'parameters': 1
          },
          'FunctionExpression': {
            'body': 1,
            'parameters': 1
          },
          'ignoredNodes': [ 'ConditionalExpression' ],
          'MemberExpression': 1,
          'ObjectExpression': 1,
          'SwitchCase': 1
        } ],
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'linebreak-style': 'error',
        'no-array-constructor': 'error',
        'no-caller': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-invalid-this': 'error',
        'no-irregular-whitespace': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-spaces': 'error',
        'no-multi-str': 'error',

        'no-multiple-empty-lines': [ 'error', {
          max: 2
        } ],
        'no-new-object': 'error',
        'no-new-wrappers': 'error',
        'no-tabs': 'error',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-unused-vars': [ 'error', {
          args: 'none'
        } ],

        'no-with': 'error',
        'object-curly-spacing': [ 'error', 'always' ],
        'one-var': [ 'error', {
          const: 'never',
          let: 'never',
          var: 'never'
        } ],
        'operator-linebreak': [ 'error', 'after' ],
        'padded-blocks': [ 'error', 'never' ],
        'prefer-promise-reject-errors': 'error',
        'semi-spacing': 'error',
        'space-before-blocks': 'error',
        'space-before-function-paren': [ 'error', {
          asyncArrow: 'always',
          anonymous: 'never',
          named: 'never'
        } ],
        'spaced-comment': [ 'error', 'always' ],
        'switch-colon-spacing': 'error',
        'arrow-parens': [ 'error', 'always' ],
        'constructor-super': 'error', // eslint:recommended
        'generator-star-spacing': [ 'error', 'after' ],
        'no-new-symbol': 'error', // eslint:recommended
        'no-this-before-super': 'error', // eslint:recommended
        'no-var': 'error',
        'prefer-const': [ 'error', { destructuring: 'all' } ],
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'rest-spread-spacing': 'error',
        'yield-star-spacing': [ 'error', 'after' ],
        'no-await-in-loop': 'warn',
        'no-unreachable-loop': 'error',
        'require-atomic-updates': 'warn',
        'dot-notation': 'error',
        'require-await': 'warn',
        'no-undefined': 'error',
        'line-comment-position': [ 'error', { position: 'above' } ],
        'template-curly-spacing': [ 'error', 'always' ],
        '@typescript-eslint/type-annotation-spacing': [
          'error', {
            'before': false,
            'after': true,
            overrides: {
              arrow: {
                before: true,
                after: true
              }
            }
          }
        ]
      }
    },
    {
      files: [
        '**/*.mjs'
      ],
      env: {
        node: true
      },
      plugins: [
        'unused-imports',
        'simple-import-sort',
        'import'
      ],
      rules: {
        'unused-imports/no-unused-imports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error'
      }
    }
  ]
};

module.exports = config;
