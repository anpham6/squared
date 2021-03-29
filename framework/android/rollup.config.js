import { terser } from 'rollup-plugin-terser';
import { terser_options } from '../../config/rollup-options';

export default [
    {
        input: './build/framework/android/src/main.js',
        treeshake: false,
        output: {
            file: './dist/android.framework.min.js',
            name: 'android',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: './build/framework/android/src/main.js',
        treeshake: false,
        output: {
            file: './dist/android.framework.js',
            name: 'android',
            format: 'iife',
            banner: `/* android-framework\n   https://github.com/anpham6/squared */\n`
        },
        plugins: []
    }
];