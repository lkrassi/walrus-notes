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
              target: './src/{app,pages,widgets,features,entities}',
              from: './src/shared',
              message:
                'Layer violation: shared must not depend on upper layers.',
            },
            {
              target: './src/{app,pages,widgets,features}',
              from: './src/entities',
              message:
                'Layer violation: entities must not depend on app/pages/widgets/features.',
            },
            {
              target: './src/{app,pages,widgets}',
              from: './src/features',
              message:
                'Layer violation: features must not depend on app/pages/widgets.',
            },
            {
              target: './src/{app,pages}',
              from: './src/widgets',
              message: 'Layer violation: widgets must not depend on app/pages.',
            },
            {
              target: './src/app',
              from: './src/pages',
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
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/pages/**/*.{ts,tsx}',
      'src/shared/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/shared/lib',
              message:
                'Shared lib barrel import is forbidden. Use @/shared/lib/core or @/shared/lib/react.',
            },
          ],
          patterns: [
            {
              group: ['@/shared/ui/components/**'],
              message: 'Use @/shared/ui instead of deep shared UI paths.',
            },
            {
              group: ['@/shared/lib/ws', '@/shared/lib/ws/*'],
              message:
                'Legacy ws imports are forbidden. Use @/shared/lib/core (or @/shared/lib/core/ws).',
            },
            {
              group: ['@/shared/lib/hooks', '@/shared/lib/hooks/*'],
              message:
                'Legacy hooks imports are forbidden. Use @/shared/lib/react/hooks.',
            },
            {
              group: [
                '@/features/*/ui/**',
                '@/features/*/model/**',
                '@/features/*/lib/**',
                '@/features/*/api/**',
                '@/features/*/hooks/**',
                '@/entities/*/ui/**',
                '@/entities/*/model/**',
                '@/entities/*/lib/**',
                '@/entities/*/api/**',
                '@/entities/*/hooks/**',
              ],
              message:
                'Direct import from feature/entity internals is forbidden. Use public API (@/features/<slice> or @/entities/<slice>).',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/shared/lib',
              message:
                'Shared lib barrel import is forbidden. Use @/shared/lib/core or @/shared/lib/react.',
            },
          ],
          patterns: [
            {
              group: ['@/shared/ui/components/**'],
              message: 'Use @/shared/ui instead of deep shared UI paths.',
            },
            {
              group: ['@/shared/lib/ws', '@/shared/lib/ws/*'],
              message:
                'Legacy ws imports are forbidden. Use @/shared/lib/core (or @/shared/lib/core/ws).',
            },
            {
              group: ['@/shared/lib/hooks', '@/shared/lib/hooks/*'],
              message:
                'Legacy hooks imports are forbidden. Use @/shared/lib/react/hooks.',
            },
            {
              group: [
                '@/features/*/ui/**',
                '@/features/*/model/**',
                '@/features/*/lib/**',
                '@/features/*/api/**',
                '@/features/*/config/**',
                '@/features/*/hooks/**',
              ],
              message:
                'Direct import from feature internals is forbidden. Use relative imports inside the same feature or public API (@/features/<slice>) outside.',
            },
            {
              group: [
                '@/entities/*/ui/**',
                '@/entities/*/model/**',
                '@/entities/*/lib/**',
                '@/entities/*/api/**',
                '@/entities/*/hooks/**',
              ],
              message:
                'Direct import from entity internals is forbidden. Use public API (@/entities/<slice>).',
            },
            {
              group: ['widgets/*/*', '@/widgets/*/*'],
              message:
                'Features may import widgets only through widgets public API.',
            },
            {
              group: ['@/app/*'],
              message:
                'Features should not import from app. Use widgets/features/entities/shared public APIs.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/shared/lib',
              message:
                'Shared lib barrel import is forbidden. Use @/shared/lib/core or @/shared/lib/react.',
            },
          ],
          patterns: [
            {
              group: ['@/shared/lib/ws', '@/shared/lib/ws/*'],
              message:
                'Legacy ws imports are forbidden. Use @/shared/lib/core (or @/shared/lib/core/ws).',
            },
            {
              group: ['@/shared/lib/hooks', '@/shared/lib/hooks/*'],
              message:
                'Legacy hooks imports are forbidden. Use @/shared/lib/react/hooks.',
            },
            {
              group: [
                '@/entities/*/ui/**',
                '@/entities/*/model/**',
                '@/entities/*/lib/**',
                '@/entities/*/api/**',
                '@/entities/*/config/**',
                '@/entities/*/hooks/**',
              ],
              message:
                'Direct import from entity internals is forbidden. Use relative imports inside the same entity or public API (@/entities/<slice>) outside.',
            },
            {
              group: ['@/app/*'],
              message:
                'Entities should not import from app. Use entities/shared public APIs.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/shared/lib',
              message:
                'Shared lib barrel import is forbidden. Use @/shared/lib/core or @/shared/lib/react.',
            },
          ],
          patterns: [
            {
              group: ['@/shared/ui/components/**'],
              message: 'Use @/shared/ui instead of deep shared UI paths.',
            },
            {
              group: ['@/shared/lib/ws', '@/shared/lib/ws/*'],
              message:
                'Legacy ws imports are forbidden. Use @/shared/lib/core (or @/shared/lib/core/ws).',
            },
            {
              group: [
                '@/features/*/ui/**',
                '@/features/*/model/**',
                '@/features/*/lib/**',
                '@/features/*/api/**',
                '@/features/*/hooks/**',
                '@/entities/*/ui/**',
                '@/entities/*/model/**',
                '@/entities/*/lib/**',
                '@/entities/*/api/**',
                '@/entities/*/hooks/**',
              ],
              message:
                'Direct import from feature/entity internals is forbidden. Use public API.',
            },
            {
              group: ['@/shared/lib/hooks', '@/shared/lib/hooks/*'],
              message:
                'Use shared hooks via public API: @/shared/lib/react/hooks.',
            },
            {
              group: ['@/app/*'],
              message:
                'Widgets should not import from app. Use local hooks/contexts or shared layer.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'app',
                'app/*',
                'pages',
                'pages/*',
                'widgets',
                'widgets/*',
                'features',
                'features/*',
                'entities',
                'entities/*',
                '@/app',
                '@/app/*',
                '@/pages',
                '@/pages/*',
                '@/widgets',
                '@/widgets/*',
                '@/features',
                '@/features/*',
                '@/entities',
                '@/entities/*',
              ],
              message:
                'Shared must not import app/pages/widgets/features/entities.',
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
    files: ['src/**/index.ts', 'src/**/index.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message:
            'Avoid "export *" in public API files. Re-export explicit symbols per FSD rules.',
        },
      ],
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
