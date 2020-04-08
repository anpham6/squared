module.exports = {
    "env": {
        'commonjs': true,
        'node': true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "../.eslint-config"
    ],
    "rules": {
        "no-console": "off",
        "@typescript-eslint/prefer-includes": "off",
        "@typescript-eslint/no-var-requires": "off"
    }
};