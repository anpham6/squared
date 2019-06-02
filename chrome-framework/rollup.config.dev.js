import { version } from './package.json';

export default [
    {
        input: '../build/chrome-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/chrome.framework.js',
            name: 'chrome',
            format: 'iife',
            banner: `/* chrome-framework ${version}\n   https://github.com/anpham6/squared */\n`
        }
    }
];