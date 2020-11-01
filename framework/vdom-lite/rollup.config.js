import { terser_options, prettier_options } from '../../config/rollup-options';
import { version } from './package.json';

import prettier from 'rollup-plugin-prettier';
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './build/framework/vdom-lite/src/main.js',
        treeshake: true,
        output: {
            file: './dist/vdom-lite.framework.min.js',
            name: 'vdom',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/framework/vdom-lite/src/main.js',
        treeshake: true,
        output: {
            file: './dist/vdom-lite.framework.js',
            name: 'vdom',
            format: 'iife',
            banner: `/* vdom-lite-framework ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    }
];