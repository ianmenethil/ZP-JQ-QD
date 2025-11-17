import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		ignores: ['dist', 'build', 'coverage', 'node_modules'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { projectService: true },
		},
		plugins: { '@typescript-eslint': ts },
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^$',
					varsIgnorePattern: '^$',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^$',
				},
			],
			'no-constant-condition': 'error',
			'no-duplicate-case': 'error',
			'no-empty': ['error', { allowEmptyCatch: false }],
			eqeqeq: ['error', 'always'],
			'prefer-const': 'error',
			'no-var': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
		},
	},
];
