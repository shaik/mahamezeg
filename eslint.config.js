import js from '@eslint/js';
import globals from 'globals';

export default [
  // ES modules: app, services, config files
  {
    files: ['app.js', 'weatherService.js', 'phraseMatrix.js', 'locationConfig.js', 'demoMode.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },

  // Service worker runs as a classic script with SW globals
  {
    files: ['service-worker.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: globals.serviceworker,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },
];
