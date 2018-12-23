import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

import { version } from './package.json';

export default [
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.js',
            name: 'squared',
            format: 'iife',
            banner: `/* squared ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/lib/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.lib.js',
            name: 'squared.lib',
            format: 'umd',
            banner: `/* squared.lib ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.js',
            name: 'squared.svg',
            format: 'umd',
            banner: `/* squared.svg ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.js',
            name: 'squared.base',
            format: 'umd',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.min.js',
            name: 'squared',
            format: 'iife'
        },
        plugins: [
            babel(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    },
    {
        input: './build/src/lib/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.lib.min.js',
            name: 'squared.lib',
            format: 'umd'
        },
        plugins: [
            babel(),
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
            babel(),
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
            babel(),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true
                }
            })
        ]
    },
];