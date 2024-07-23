import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import plugin from 'eslint-plugin-solid'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'] },
  { ignores: ['wailsjs/*', 'dist/*'] },
  plugin.configs['flat/typescript'],
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintConfigPrettier,
]
