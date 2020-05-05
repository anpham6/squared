import { terser_options, prettier_options } from '../config/rollup-options';
import { version } from './package.json';

import prettier from 'rollup-plugin-prettier';
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: '../build/android-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/android.framework.min.js',
            name: 'android',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/android.framework.js',
            name: 'android',
            format: 'iife',
            banner: `/* android-framework ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    }
];