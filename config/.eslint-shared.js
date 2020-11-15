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
        "block-scoped-var": "error",
        "comma-dangle": "error",
        "comma-spacing": "error",
        "comma-style": "error",
        "eqeqeq": "error",
        "id-match": "error",
        "multiline-ternary": ["error", "always-multiline"],
        "new-parens": "error",
        "no-caller": "error",
        "no-cond-assign": "off",
        "no-console": "warn",
        "no-constant-condition": "off",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-empty": "off",
        "no-extra-bind": "error",
        "no-eval": "error",
        "no-fallthrough": "off",
        "no-implicit-globals": "error",
        "no-lonely-if": "error",
        "no-loss-of-precision": "error",
        "no-multi-spaces": "error",
        "no-new-wrappers": "error",
        "no-shadow": ["error", {
            "allow": [
                "EXT_NAME",
                "EXT_ANDROID",
                "EXT_CHROME",
                "DIR_FUNCTIONS",
                "NODE_ALIGNMENT",
                "BOX_STANDARD",
                "NODE_TRAVERSE",
                "NODE_TEMPLATE",
                "APP_FRAMEWORK",
                "APP_SECTION",
                "NODE_RESOURCE",
                "NODE_PROCEDURE",
                "PLATFORM",
                "USER_AGENT",
                "CSS_UNIT",
                "CSS_TRAITS",
                "INSTANCE_TYPE",
                "SYNCHRONIZE_MODE",
                "SYNCHRONIZE_STATE",
                "FILL_MODE",
                "REGION_UNIT",
                "CREATE_NODE",
                "LAYOUT_TABLE",
                "LAYOUT_TABLETYPE",
                "LAYOUT_TABLECELL",
                "LAYOUT_GRIDCELL",
                "LAYOUT_CSSGRID",
                "STYLE_STATE",
                "LAYOUT_STRING",
                "BUILD_VERSION",
                "CONTAINER_NODE",
                "SCREEN_DENSITY",
                "WIDGET_NAME"
            ]
        }],
        "no-sparse-arrays": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-unmodified-loop-condition": "error",
        "no-underscore-dangle": ["error", { "allowAfterThis": true }],
        "no-unused-expressions": "error",
        "no-unused-vars": "off",
        "no-unreachable-loop": "error",
        "no-useless-backreference": "error",
        "no-useless-call": "error",
        "no-useless-escape": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "object-shorthand": ["error", "always", { "avoidQuotes": true }],
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-regex-literals": "error",
        "prefer-spread": "error",
        "require-atomic-updates": "error",
        "semi": "error",
        "semi-spacing": "error",
        "semi-style": "error",
        "sort-imports": ["error", {
            "ignoreDeclarationSort": true,
            "memberSyntaxSortOrder": ["none", "single", "all", "multiple"]
        }],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/member-delimiter-style": "error",
        "@typescript-eslint/member-ordering": ["error", {
            "default": [
                "static-field",
                "static-method",
                "public-method",
                "protected-method",
                "private-method"
            ]
        }],
        "@typescript-eslint/no-extra-parens": ["error", "all", {
            "conditionalAssign": true,
            "returnAssign": true,
            "nestedBinaryExpressions": false
        }],
        "@typescript-eslint/no-redeclare": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unnecessary-type-constraint": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/unified-signatures": "error"
    }
};
