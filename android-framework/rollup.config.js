import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

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