import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-pascal-case': ['error', { allowAllCaps: true }],
      'react/no-unescaped-entities': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      boundaries,
      import: importPlugin,
      prettier: prettierPlugin,
      unicorn,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-relative-parent-imports': 'error',
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/shared',
              from: './src/{app,pages,widgets,features,entities}',
              message:
                'Layer violation: shared must not depend on upper layers.',
            },
            {
              target: './src/entities',
              from: './src/{app,pages,widgets,features}',
              message:
                'Layer violation: entities must not depend on app/pages/widgets/features.',
            },
            {
              target: './src/features',
              from: './src/{app,pages,widgets}',
              message:
                'Layer violation: features must not depend on app/pages/widgets.',
            },
            {
              target: './src/widgets',
              from: './src/{app,pages}',
              message: 'Layer violation: widgets must not depend on app/pages.',
            },
            {
              target: './src/pages',
              from: './src/app',
              message: 'Layer violation: pages must not depend on app.',
            },
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: [
                'app',
                'pages',
                'widgets',
                'features',
                'entities',
                'shared',
              ],
            },
            {
              from: 'pages',
              allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
            },
            {
              from: 'widgets',
              allow: ['widgets', 'features', 'entities', 'shared'],
            },
            {
              from: 'features',
              allow: ['features', 'entities', 'shared'],
            },
            {
              from: 'entities',
              allow: ['entities', 'shared'],
            },
            {
              from: 'shared',
              allow: ['shared'],
            },
          ],
        },
      ],
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
          ignore: [
            '^index\\.(ts|tsx)$',
            '^vite\\.config\\.ts$',
            '^eslint\\.config\\.ts$',
            '^vite-env\\.d\\.ts$',
            '^react-syntax-highlighter\\.d\\.ts$',
            '^prismjs-components\\.d\\.ts$',
            '^UKFlagIcon\\.tsx$',
          ],
        },
      ],
      'import/no-default-export': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-useless-escape': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['widgets', 'widgets/*', '@/widgets', '@/widgets/*'],
              message:
                'Features must not import widgets. Use app/providers, shared, entities, or feature public APIs.',
            },
          ],
        },
      ],
    },
  },

  {
    files: [
      'eslint.config.ts',
      'vite.config.ts',
      'server/**/*.ts',
      'src/shared/types/**/*.d.ts',
    ],
    rules: {
      'import/no-default-export': 'off',
      'unicorn/filename-case': 'off',
    },
  },

  {
    ignores: [
      'dist/**',
      'dist-server/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
    ],
  },
];
