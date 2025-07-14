const tsEslint = await import('@typescript-eslint/eslint-plugin');
const tsParser = await import('@typescript-eslint/parser');

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser.default,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.default,
    },
    rules: {
      // All rules disabled
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];