module.exports = {
    "env": {
        "browser": true,
        "es2017": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "ignorePatterns": [],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "globals": {
        "squared": "readonly"
    },
    "rules": {
        "constructor-super": "error",
        "for-direction": [
            "error"
        ],
        "getter-return": [
            "error"
        ],
        "no-async-promise-executor": [
            "error"
        ],
        "no-case-declarations": [
            "error"
        ],
        "no-class-assign": [
            "error"
        ],
        "no-compare-neg-zero": [
            "error"
        ],
        "no-const-assign": [
            "error"
        ],
        "no-control-regex": [
            "error"
        ],
        "no-delete-var": [
            "error"
        ],
        "no-dupe-args": [
            "error"
        ],
        "no-dupe-class-members": [
            "error"
        ],
        "no-dupe-keys": [
            "error"
        ],
        "no-duplicate-case": [
            "error"
        ],
        "no-empty-character-class": [
            "error"
        ],
        "no-empty-pattern": [
            "error"
        ],
        "no-ex-assign": [
            "error"
        ],
        "no-extra-boolean-cast": [
            "error"
        ],
        "no-extra-semi": [
            "error"
        ],
        "no-func-assign": [
            "error"
        ],
        "no-global-assign": [
            "error"
        ],
        "no-inner-declarations": [
            "error"
        ],
        "no-invalid-regexp": [
            "error"
        ],
        "no-irregular-whitespace": [
            "error"
        ],
        "no-misleading-character-class": [
            "error"
        ],
        "no-mixed-spaces-and-tabs": [
            "error"
        ],
        "no-new-symbol": [
            "error"
        ],
        "no-obj-calls": [
            "error"
        ],
        "no-octal": [
            "error"
        ],
        "no-prototype-builtins": [
            "error"
        ],
        "no-redeclare": [
            "error"
        ],
        "no-regex-spaces": [
            "error"
        ],
        "no-self-assign": [
            "error"
        ],
        "no-shadow-restricted-names": [
            "error"
        ],
        "no-sparse-arrays": [
            "error"
        ],
        "no-this-before-super": [
            "error"
        ],
        "no-unexpected-multiline": [
            "error"
        ],
        "no-unreachable": [
            "error"
        ],
        "no-unsafe-finally": [
            "error"
        ],
        "no-unsafe-negation": [
            "error"
        ],
        "no-useless-catch": [
            "error"
        ],
        "no-useless-escape": [
            "error"
        ],
        "no-with": [
            "error"
        ],
        "require-yield": [
            "error"
        ],
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "eqeqeq": [
            "error",
            "always"
        ],
        "no-caller": "error",
        "no-eval": "error",
        "no-new-wrappers": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-debugger": "error",
        "no-cond-assign": "error",
        "no-unused-labels": "error",
        "no-underscore-dangle": ["error", {
            "allowAfterThis": true
        }],
        "prefer-arrow-callback": "error",
        "object-shorthand": "error",
        "one-var": [
            "error",
            "never"
        ],
        "use-isnan": "error",
        "id-match": "error",
        "new-parens": "error",
        "spaced-comment": "error",
        "valid-typeof": "error",
        "max-classes-per-file": "off",
        "max-len": "off",
        "no-bitwise": "off",
        "no-console": "off",
        "comma-dangle": "off",
        "complexity": "off",
        "dot-notation": "off",
        "eol-last": "off",
        "guard-for-in": "off",
        "id-blacklist": "off",
        "explicit-function-return-type": "off",
        "quote-props": "off",
        "radix": "off",
        "no-unused-expressions": "off",
        "no-constant-condition": "off",
        "no-shadow": "off",
        "no-empty": "off",
        "no-fallthrough": "off",
        "no-undef": "off",
        "no-unused-vars": "off",
        "no-invalid-this": "off",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-assertions": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/prefer-string-starts-ends-with": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-unused-vars": "off"
    },
    "settings": {}
};
