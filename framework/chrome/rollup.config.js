import { terser_options } from '../../config/rollup-options';
import { version } from './package.json';

import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './build/framework/chrome/src/main.js',
        treeshake: false,
        output: {
            file: './dist/chrome.framework.min.js',
            name: 'chrome',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/framework/chrome/src/main.js',
        treeshake: false,
        output: {
            file: './dist/chrome.framework.js',
            name: 'chrome',
            format: 'iife',
            banner: `/* chrome-framework ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    }
];