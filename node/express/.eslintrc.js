module.exports = {
    "env": {
        "commonjs": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "../../config/.eslint-shared"
    ],
    "ignorePatterns": [],
    "rules": {
        "no-console": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off"
    }
};