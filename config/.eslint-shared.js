module.exports = {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "arrow-parens": ["error", "as-needed"],
        "comma-dangle": "off",
        "comma-style": "error",
        "comma-spacing": "error",
        "complexity": "off",
        "constructor-super": "error",
        "dot-notation": "off",
        "eol-last": "off",
        "eqeqeq": ["error", "always"],
        "explicit-function-return-type": "off",
        "for-direction": "error",
        "getter-return": "error",
        "guard-for-in": "off",
        "id-blacklist": "off",
        "id-match": "error",
        "max-classes-per-file": "off",
        "max-len": "off",
        "multiline-ternary": ["error", "always-multiline"],
        "new-parens": "error",
        "object-shorthand": "error",
        "one-var": "off",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-spread": "error",
        "quote-props": "off",
        "radix": "off",
        "require-yield": "error",
        "semi": "error",
        "semi-spacing": "error",
        "semi-style": "error",
        "sort-imports": ["error", {
            "ignoreDeclarationSort": true,
            "memberSyntaxSortOrder": ["none", "single", "all", "multiple"]
        }],
        "spaced-comment": "off",
        "use-isnan": "error",
        "valid-typeof": "error",
        "no-async-promise-executor": "error",
        "no-bitwise": "off",
        "no-caller": "error",
        "no-case-declarations": "error",
        "no-class-assign": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": "off",
        "no-console": "warn",
        "no-const-assign": "error",
        "no-constant-condition": "off",
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-delete-var": "error",
        "no-dupe-args": "error",
        "no-dupe-class-members": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty": "off",
        "no-empty-character-class": "error",
        "no-empty-pattern": "error",
        "no-eval": "error",
        "no-ex-assign": "error",
        "no-extra-boolean-cast": "error",
        "no-extra-parens": "off",
        "no-extra-semi": "error",
        "no-fallthrough": "off",
        "no-func-assign": "error",
        "no-global-assign": "error",
        "no-implicit-globals": "error",
        "no-inner-declarations": "error",
        "no-invalid-regexp": "error",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "error",
        "no-lonely-if": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-mixed-spaces-and-tabs": "error",
        "no-new-symbol": "error",
        "no-new-wrappers": "error",
        "no-obj-calls": "error",
        "no-octal": "error",
        "no-prototype-builtins": "error",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-self-assign": "error",
        "no-shadow": "error",
        "no-shadow-restricted-names": "error",
        "no-sparse-arrays": "error",
        "no-this-before-super": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef": "off",
        "no-undef-init": "error",
        "no-underscore-dangle": ["error", { "allowAfterThis": true }],
        "no-unexpected-multiline": "error",
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unused-expressions": "off",
        "no-unused-labels": "error",
        "no-unused-vars": "off",
        "no-useless-backreference": "error",
        "no-useless-catch": "error",
        "no-useless-escape": "error",
        "no-var": "warn",
        "no-with": "error",
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-ordering": ["error", {
            "default": [
                "static-field",
                "static-method",
                "public-method",
                "protected-method",
                "private-method"
            ]
        }],
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/no-extra-parens": ["error", "all", {
            "conditionalAssign": true,
            "returnAssign": true,
            "nestedBinaryExpressions": false
        }],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-extra-non-null-assertion": "error",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-unused-vars": "off"
    }
};
