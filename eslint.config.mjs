import js from "@eslint/js"
import globals from "globals"
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Variabelen
      "no-var": "error",
      "prefer-const": "error",
      // Naamgeving
      "camelcase": "error",
      // Functies
      "func-names": ["error", "always"],
      // Formatting
      "indent": ["error", 2],
      "semi": ["error", "never"],
      "max-len": ["error", { code: 120 }],
      // Algemene kwaliteit
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
])