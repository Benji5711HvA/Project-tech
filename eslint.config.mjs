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
      "no-var": "error",
      "prefer-const": "error",
      "camelcase": "error",
      "func-names": ["error", "always"],
      "indent": ["error", 2],
      "semi": ["error", "never"],
      "max-len": ["error", { code: 120 }],
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
])