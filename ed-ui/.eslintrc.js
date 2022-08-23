module.exports = {
	root: true,
	env: {
		node: true
	},
	plugins: ['@typescript-eslint'],
	extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/typescript/recommended', '@vue/prettier'],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/component-name-in-template-casing': ['error', 'PascalCase'],
		'prettier/prettier': [
			'warn',
			{
				singleQuote: true,
				semi: true,
				useTabs: true,
				trailingComma: 'none',
				bracketSpacing: true,
				arrowParens: 'avoid',
				printWidth: 120
			}
		]
	}
};
