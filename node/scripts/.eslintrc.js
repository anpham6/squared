module.exports = {
    "env": {
        "commonjs": true,
        "es2017": true,
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
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off"
    }
};