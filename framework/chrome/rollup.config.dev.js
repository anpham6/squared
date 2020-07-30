export default {
    input: './build/framework/chrome/src/main.js',
    treeshake: false,
    output: {
        file: './dist/chrome.framework.js',
        name: 'chrome',
        format: 'iife'
    }
};