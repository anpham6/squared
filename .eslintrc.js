module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
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
        "ecmaVersion": 2018,
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
        "no-cond-assign": "off",
        "no-const-assign": [
            "error"
        ],
        "no-constant-condition": "off",
        "no-control-regex": [
            "error"
        ],
        "no-debugger": "error",
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
        "no-empty": "off",
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
        "no-fallthrough": "off",
        "no-func-assign": [
            "error"
        ],
        "no-global-assign": [
            "error"
        ],
        "no-inner-declarations": "off",
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
        "no-undef": "off",
        "no-unexpected-multiline": [
            "error"
        ],
        "no-unreachable": [
            "error"
        ],
        "no-unsafe-finally": "error",
        "no-unsafe-negation": [
            "error"
        ],
        "no-unused-labels": "off",
        "no-unused-vars": "off",
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
        "use-isnan": "error",
        "valid-typeof": "off",
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "comma-dangle": "off",
        "complexity": "off",
        "dot-notation": "off",
        "eol-last": "off",
        "eqeqeq": [
            "error",
            "always"
        ],
        "guard-for-in": "off",
        "id-blacklist": "off",
        "id-match": "error",
        "import/order": "off",
        "max-classes-per-file": "off",
        "max-len": "off",
        "new-parens": "error",
        "no-bitwise": "off",
        "no-caller": "error",
        "no-console": "off",
        "no-eval": "error",
        "no-invalid-this": "off",
        "no-new-wrappers": "error",
        "no-shadow": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": [
            "error",
            {
                "allowAfterThis": true
            }
        ],
        "no-unused-expressions": "off",
        "object-shorthand": "error",
        "one-var": [
            "error",
            "never"
        ],
        "prefer-arrow-callback": "error",
        "quote-props": "off",
        "radix": "off",
        "spaced-comment": "error",
        "explicit-function-return-type": "off",
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
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/prefer-string-starts-ends-with": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-unused-vars": "off"
    },
    "settings": {}
};
