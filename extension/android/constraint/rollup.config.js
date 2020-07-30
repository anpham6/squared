import { terser_options, prettier_options } from '../../../config/rollup-options';
import { version } from './package.json';

import prettier from 'rollup-plugin-prettier';
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: './build/extension/android/constraint/guideline/main.js',
        treeshake: false,
        output: {
            file: './dist/extensions/android.constraint.guideline.min.js',
            name: 'android.constraint.guideline',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/extension/android/constraint/guideline/main.js',
        treeshake: false,
        output: {
            file: './dist/extensions/android.constraint.guideline.js',
            name: 'android.constraint.guideline',
            format: 'iife',
            banner: `/* android.constraint.guideline ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    }
];