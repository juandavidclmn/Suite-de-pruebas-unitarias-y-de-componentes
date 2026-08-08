// Configuración mínima para correr eslint-plugin-jsx-a11y sobre los componentes
// de src/ (React Native). No sustituye un linter de estilo general del proyecto.
const jsxA11y = require('eslint-plugin-jsx-a11y');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
];
