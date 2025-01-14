/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
  },
  {
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // Disable rule for file names
      "vue/multi-word-component-names": "off",
    },
  },
  {
    ignorePatterns: [
      // Ignore multi-word file names in specific directories or globally
      "**/*-*.*",
    ],
  },
];
