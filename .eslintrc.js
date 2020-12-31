module.exports = {
	env: {
		browser: true,
		es6: true,
		jest: true,
		mocha: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'prettier',
		'prettier/@typescript-eslint',
		'react-app'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint', 'react'],
	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/no-angle-bracket-type-assertion': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/no-useless-constructor': 'error',
		'no-console': 'warn',
		'no-useless-constructor': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'react/display-name': 0,
		'react/no-unescaped-entities': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/no-unused-vars': 0
	},
	overrides: [
		{
			// enable the rule specifically for TypeScript files
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/no-unused-vars': ['error']
			}
		}
	],
	settings: {
		react: {
			version: 'detect'
		}
	}
};
