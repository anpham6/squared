import { terser } from 'rollup-plugin-terser';

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
    },
    {
        input: '../build/chrome-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/chrome.framework.min.js',
            name: 'chrome',
            format: 'iife'
        },
        plugins: [
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    }
];