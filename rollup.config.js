import prettier from 'rollup-plugin-prettier';
import options from './rollup+terser.config';
import options_prettier from './rollup+prettier.config';

import { terser } from 'rollup-plugin-terser'
import { version } from './package.json';

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
            terser(options)
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
            terser(options)
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
            terser(options)
        ]
    },
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.js',
            name: 'squared',
            format: 'umd',
            banner: `/* squared ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(options_prettier)
        ]
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.js',
            name: 'squared.base',
            format: 'umd',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(options_prettier)
        ]
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.js',
            name: 'squared.svg',
            format: 'umd',
            banner: `/* squared.svg ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(options_prettier)
        ]
    }
];