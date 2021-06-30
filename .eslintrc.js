module.exports = {
    "env": {
        "browser": true,
        "es2017": true
    },
    "extends": [
        "./config/.eslint-shared",
        "plugin:promise/recommended"
    ],
    "plugins": [
        "promise"
    ],
    "rules": {
        "promise/param-names": "off"
    },
    "ignorePatterns": [
        "index.d.ts"
    ],
    "globals": {
        "squared": "readonly"
    }
};