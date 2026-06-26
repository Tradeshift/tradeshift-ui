'use strict';

const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const jasmine = require('eslint-plugin-jasmine');
const babelParser = require('@babel/eslint-parser');

// Stub plugins for rules referenced in inline eslint-disable comments across
// the codebase. These plugins were removed (eslint-plugin-standard,
// eslint-plugin-node) because they don't support eslint@9. Without stubs,
// eslint errors on "Definition for rule '...' was not found" in those comments.
const standardPlugin = {
	rules: {
		'no-callback-literal': { create: () => ({}) }
	}
};
const nodePlugin = {
	rules: {
		'no-deprecated-api': { create: () => ({}) }
	}
};

module.exports = [
	// Suppress warnings about eslint-disable comments that became unnecessary
	// after the eslint@9 migration (rules turned off, plugins removed, etc.)
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'off'
		}
	},

	// Ignore patterns (replaces .eslintignore)
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/public/**',
			'src/third-party/**',
			'**/temp/**',
			'**/*-*.*.*.js',
			'**/*.edbml',
			'**/*.html',
			'**/*.xhtml',
			'**/*.min.js',
			'**/*.DISABLED.js',
			'**/setup/**',
			'spec/jasmine/**',
			'docs/src/js/dox-api@tradeshift.com/search/lunr.js',
			'docs/tasks/prism.js',
			'src/runtime/js/ts.ui/core/core-gui@tradeshift.com/dependencies/fastclick.js',
			'edbml/tasks/things/compiler.js'
		]
	},

	// ESLint core recommended rules
	js.configs.recommended,

	// Disable rules that conflict with prettier
	prettier,

	// Project configuration
	{
		languageOptions: {
			parser: babelParser,
			parserOptions: {
				requireConfigFile: false,
				ecmaVersion: 5
			},
			globals: {
				// Project-specific globals (from former .eslintrc.json)
				ActiveXObject: 'readonly',
				chrome: 'readonly',
				edb: 'readonly',
				edbml: 'readonly',
				gui: 'readonly',
				ts: 'readonly',
				helper: 'readonly',
				sometime: 'readonly',
				$: 'readonly',
				angular: 'readonly',
				lunr: 'readonly',
				Mark: 'readonly',
				server: 'readonly'
			}
		},
		plugins: {
			jasmine,
			standard: standardPlugin,
			node: nodePlugin
		},
		rules: {
			// Tradeshift rules (from eslint-config-tradeshift@9.1.0/index.js)
			'block-scoped-var': 'error',
			'dot-notation': 'error',
			'handle-callback-err': 'error',
			'no-empty': ['error', { allowEmptyCatch: true }],
			'no-loop-func': 'error',
			'no-tabs': 'off',
			'no-prototype-builtins': 'off',
			'no-restricted-imports': [
				'error',
				{ paths: [{ name: 'q', message: 'Use native Promises instead' }] }
			],
			// Project-level overrides (from former .eslintrc.json)
			camelcase: 'off',
			'guard-for-in': 'off',
			'one-var': 'off',
			'no-new-func': 'off',
			'no-script-url': 'off',
			'no-template-curly-in-string': 'off',
			'no-unsafe-finally': 'off',
			'no-useless-call': 'off',
			'no-useless-escape': 'off',
			'quote-props': 'off',
			quotes: 'off',
			'no-undef': 'off',
			// args:'none' — don't flag unused function parameters
			// caughtErrors:'none' — don't flag unused catch clause variables (e, exception, etc.)
			'no-unused-vars': [
				'error',
				{ vars: 'all', args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }
			],
			// getter-return: legacy code has getters without explicit returns
			'getter-return': 'off'
		}
	}
];
