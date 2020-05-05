import { terser_options, prettier_options } from '../config/rollup-options';
import { version } from './package.json';

import prettier from 'rollup-plugin-prettier';
import { terser } from 'rollup-plugin-terser'

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
            terser(terser_options)
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
            prettier(prettier_options)
        ]
    }
];