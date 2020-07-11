const parentConfig = require('../.eslintrc');

const OFF = 'off';

module.exports = {
	rules: {
		'@typescript-eslint/no-explicit-any': OFF,
		'@typescript-eslint/no-extra-parens': OFF,
		'@typescript-eslint/no-invalid-this': OFF,
		'@typescript-eslint/no-var-requires': OFF,
		'@typescript-eslint/require-await':   OFF,
	},
};
