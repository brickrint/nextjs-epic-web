const buildEslintCommand = `yarn lint:fix`;

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
