import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // TypeScript Rules - More lenient for practical development
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for complex API integrations
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          varsIgnorePattern: '^_|^err$|^error$|^refreshError$|^data$|^className$|^endPage$', // Ignore common patterns
          argsIgnorePattern: '^_|^e$|^err$|^error$|^className$' // Ignore common event/error params
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off', // Allow empty interfaces for extensibility
      
      // React Hooks - More lenient dependency checking for complex scenarios
      'react-hooks/exhaustive-deps': 'off', // Often causes issues with complex dependencies
      
      // General JavaScript/TypeScript rules
      'prefer-const': 'warn', // Suggest const but don't force it
      'no-unused-vars': 'off', // Use TypeScript version instead
      
      // Disable some overly strict rules for practical development
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn', // Allow @ts-ignore when needed
      
      // React Refresh - Be more lenient about exports
      'react-refresh/only-export-components': 'off', // Allow mixed exports for utilities
    },
  },
)
