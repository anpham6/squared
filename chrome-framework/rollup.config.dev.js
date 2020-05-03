export default {
    input: '../build/chrome-framework/src/main.js',
    treeshake: false,
    output: {
        file: '../dist/chrome.framework.js',
        name: 'chrome',
        format: 'iife'
    }
};