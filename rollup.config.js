import { terser } from 'rollup-plugin-terser';
import async from 'rollup-plugin-async';

export default [
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.min.js',
            name: 'squared',
            format: 'umd'
        },
        plugins: [
            async(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.min.js',
            name: 'squared.base',
            format: 'umd'
        },
        plugins: [
            async(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.min.js',
            name: 'squared.svg',
            format: 'umd'
        },
        plugins: [
            async(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    }
];