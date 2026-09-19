import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

const featureNames = [
  'attendance',
  'authentication',
  'certificates',
  'convicteds',
  'dashboard',
  'documents',
  'institutions',
  'not-found',
  'reflection-group',
  'settings',
  'users',
]

const sharedImportRestrictions = [
  {
    group: ['@/components/ui/*'],
    message: 'Use componentes Shadcn por meio de @/shared/ui/.',
  },
  {
    group: ['@/lib/utils', '@/lib/validadorCpf'],
    message: 'Use utilitários compartilhados por meio de @/shared/lib/.',
  },
]

const restrictedImports = (patterns) => ['error', { patterns }]

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-restricted-imports': restrictedImports(sharedImportRestrictions),
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    files: ['src/app/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        ...sharedImportRestrictions,
        {
          group: ['@/features/*/**'],
          message: 'app/ deve consumir features somente pela API pública @/features/<feature>.',
        },
      ]),
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': restrictedImports([
        ...sharedImportRestrictions,
        {
          group: ['@/features/**'],
          message: 'shared/ não pode depender de features.',
        },
      ]),
    },
  },
  ...featureNames.map((featureName) => ({
    files: [`src/features/${featureName}/**/*.{js,jsx}`],
    rules: {
      'no-restricted-imports': restrictedImports([
        ...sharedImportRestrictions,
        {
          group: featureNames
            .filter((name) => name !== featureName)
            .map((name) => `@/features/${name}/**`),
          message:
            'Features só podem consumir outra feature pela API pública @/features/<feature>.',
        },
      ]),
    },
  })),
  eslintConfigPrettier,
]
