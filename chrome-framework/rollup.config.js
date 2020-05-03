import prettier from 'rollup-plugin-prettier';
import options from '../rollup+terser.config';
import options_prettier from '../rollup+prettier.config';

import { terser } from 'rollup-plugin-terser'
import { version } from './package.json';

export default [
    {
        input: '../build/chrome-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/chrome.framework.min.js',
            name: 'chrome',
            format: 'umd'
        },
        plugins: [
            terser(options)
        ]
    },
    {
        input: '../build/chrome-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/chrome.framework.js',
            name: 'chrome',
            format: 'umd',
            banner: `/* chrome-framework ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(options_prettier)
        ]
    }
];