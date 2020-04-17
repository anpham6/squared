import { terser } from 'rollup-plugin-terser';
import options from '../rollup+terser.config';

export default {
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
};