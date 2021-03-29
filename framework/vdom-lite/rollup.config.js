import { terser } from 'rollup-plugin-terser';
import { terser_options } from '../../config/rollup-options';

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
            banner: `/* vdom-lite-framework\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    }
];