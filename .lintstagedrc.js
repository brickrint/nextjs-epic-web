const buildEslintCommand = `yarn lint:fix`;

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
