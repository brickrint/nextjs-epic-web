const buildEslintCommand = "yarn validate:all";

export default {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
