import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importX from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr', 'coverage', 'public']),

  // Archivos de configuracion del repositorio: entorno Node, sin reglas de React.
  {
    files: ['*.config.js', '.lintstagedrc.js', 'commitlint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },

  // Codigo de aplicacion.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      importX.flatConfigs.recommended,
    ],
    plugins: { 'unused-imports': unusedImports },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        // Los alias se declaran en tres sitios que deben coincidir: vite.config.js
        // (build), jsconfig.json (editor) y aqui (lint).
        alias: {
          extensions: ['.js', '.jsx'],
          map: [
            ['@', './src'],
            ['@app', './src/app'],
            ['@domain', './src/domain'],
            ['@features', './src/features'],
            ['@i18n', './src/i18n'],
            ['@services', './src/services'],
            ['@shared', './src/shared'],
            ['@styles', './src/styles'],
            ['@theme', './src/theme'],
          ],
        },
        node: { extensions: ['.js', '.jsx'] },
      },
    },
    rules: {
      // Sin TypeScript, la validacion de props la hace @domain/validation en runtime.
      'react/prop-types': 'off',

      // Imports muertos: se marcan como error y se autoarreglan con --fix.
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Orden de imports: un unico criterio, sin discusion en revision.
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@domain/**', group: 'internal', position: 'before' },
            { pattern: '@services/**', group: 'internal', position: 'before' },
            { pattern: '@shared/**', group: 'internal', position: 'before' },
            { pattern: '@theme/**', group: 'internal', position: 'before' },
            { pattern: '@i18n/**', group: 'internal', position: 'before' },
            { pattern: '@features/**', group: 'internal', position: 'after' },
            { pattern: '@app/**', group: 'internal', position: 'after' },
            { pattern: '@/**', group: 'internal', position: 'after' },
          ],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': ['error', { maxDepth: Infinity }],

      // Ninguna clave de almacenamiento ni acceso directo fuera de la capa de dominio.
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message: 'Accede al almacenamiento solo desde src/domain/storage.',
        },
      ],

      // Un catch vacio oculta una perdida de datos: prohibido.
      'no-empty': ['error', { allowEmptyCatch: false }],

      // Salir de la carpeta del componente con rutas relativas: siempre por alias.
      // '../algo' se permite: sigue siendo local y legible dentro de la feature.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../*', '../../../../*'],
              message: 'Usa un alias: tres niveles arriba siempre sale de la carpeta.',
            },
          ],
        },
      ],
    },
  },

  // Una feature solo se toca por su API publica. Importar su interior desde fuera
  // convierte cualquier renombrado interno en un cambio que rompe a otros.
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/*'],
              message: 'Importa solo la API publica de la feature: @features/<nombre>.',
            },
            {
              group: ['../../../*', '../../../../*'],
              message: 'Usa un alias: tres niveles arriba siempre sale de la feature.',
            },
          ],
        },
      ],
    },
  },

  // El dominio no conoce a nadie del proyecto salvo a si mismo.
  {
    files: ['src/domain/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*', '@shared/*', '@app/*'],
              message: 'src/domain no depende de ninguna otra capa.',
            },
          ],
          paths: [
            { name: 'react', message: 'src/domain no puede importar React.' },
            { name: 'react-dom', message: 'src/domain no puede importar React.' },
          ],
        },
      ],
    },
  },

  // La capa de dominio y los servicios son puros: no conocen React ni el DOM.
  {
    files: ['src/domain/**/*.js', 'src/services/**/*.js'],
    rules: {
      'import-x/no-restricted-paths': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'src/domain y src/services no pueden importar React.' },
            { name: 'react-dom', message: 'src/domain y src/services no pueden importar React.' },
          ],
        },
      ],
    },
  },

  // El driver es el unico modulo que puede tocar localStorage. Es el punto en el
  // que la regla deja de ser una prohibicion y pasa a ser el contrato.
  {
    files: ['src/domain/storage/driver.js'],
    rules: { 'no-restricted-properties': 'off' },
  },

  // Debe ir el ultimo: apaga las reglas de ESLint que chocan con Prettier.
  prettier,
]);
