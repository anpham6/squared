module.exports = {
    "env": {
        "browser": true,
        "es2017": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        ".eslint-shared"
    ],
    "ignorePatterns": [
        "index.d.ts"
    ],
    "globals": {
        "squared": "readonly"
    }
};
