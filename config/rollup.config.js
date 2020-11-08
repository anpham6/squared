import { terser_options } from './rollup-options';
import { version } from '../package.json';

import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.min.js',
            name: 'squared',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.min.js',
            name: 'squared.base',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/src/base/main-dom.js',
        treeshake: false,
        output: {
            file: './dist/squared.base-dom.min.js',
            name: 'squared.base',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.min.js',
            name: 'squared.svg',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.js',
            name: 'squared',
            format: 'iife',
            banner: `/* squared ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.js',
            name: 'squared.base',
            format: 'iife',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    },
    {
        input: './build/src/base/main-dom.js',
        treeshake: false,
        output: {
            file: './dist/squared.base-dom.js',
            name: 'squared.base',
            format: 'iife',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.js',
            name: 'squared.svg',
            format: 'iife',
            banner: `/* squared.svg ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    },
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.umd.js',
            name: 'squared',
            format: 'umd',
            banner: `/* squared ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    },
];