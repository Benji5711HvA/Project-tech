/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    indentation: 2,
    "string-quotes": "double",
    "block-no-empty": true,
    "max-nesting-depth": 3,
    "declaration-block-no-duplicate-properties": true,
    "declaration-block-trailing-semicolon": "always",
    "property-no-unknown": true
  }
}