import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

import { version } from './package.json';

export default [
    {
        input: '../build/android-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/android.framework.js',
            name: 'android',
            format: 'iife',
            banner: `/* android-framework ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: '../build/android-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/android.framework.min.js',
            name: 'android',
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
    }
];