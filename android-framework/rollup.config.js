import prettier from 'rollup-plugin-prettier';
import options from '../rollup+terser.config';
import options_prettier from '../rollup+prettier.config';

import { terser } from 'rollup-plugin-terser'
import { version } from './package.json';

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
            terser(options)
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
            prettier(options_prettier)
        ]
    }
];