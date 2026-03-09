/** @type {import("stylelint").Config} */
export default {
  // Use the standard Stylelint rules as a base
  extends: ["stylelint-config-standard"],

  rules: {
    // Use 2 spaces for indentation
    indentation: 2,

    // Use double quotes in CSS
    "string-quotes": "double",

    // Do not allow empty CSS blocks
    "block-no-empty": true,

    // Limit nesting to 3 levels
    "max-nesting-depth": 3,

    // Do not allow duplicate CSS properties
    "declaration-block-no-duplicate-properties": true,

    // Always require a semicolon at the end of declarations
    "declaration-block-trailing-semicolon": "always",

    // Only allow valid CSS properties
    "property-no-unknown": true
  }
}