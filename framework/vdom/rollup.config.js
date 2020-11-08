import { terser_options } from '../../config/rollup-options';
import { version } from './package.json';

import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './build/framework/vdom/src/main.js',
        treeshake: false,
        output: {
            file: './dist/vdom.framework.min.js',
            name: 'vdom',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/framework/vdom/src/main.js',
        treeshake: false,
        output: {
            file: './dist/vdom.framework.js',
            name: 'vdom',
            format: 'iife',
            banner: `/* vdom-framework ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    }
];