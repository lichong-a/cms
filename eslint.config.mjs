import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 忽略文件
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/*.d.ts',
      '**/*.d.ts.map',
      '**/*.js.map',
      '**/next-env.d.ts',
      '**/__tests__/**',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/scripts/**',
      'scripts/**',
      '**/test-*.{ts,tsx,js,jsx}',
      'apps/api/prisma/**',
      'packages/types/src/**/*.js',
      'packages/types/src/test.ts',
      '**/tests/e2e/**',
    ],
  },

  // 基础配置
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript 文件
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // TypeScript 特定规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // 通用规则
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  {
    files: ['apps/api/src/middleware/tenant.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // React 文件
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Import 规则
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // Next.js API 路由（允许 any）
  {
    files: ['apps/web/app/api/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 测试文件（宽松规则）
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // Prettier 兼容（必须放最后）
  prettier
);
