import { terser } from 'rollup-plugin-terser';
import options from '../rollup+terser.config';

export default {
    input: '../build/chrome-framework/src/main.js',
    treeshake: false,
    output: {
        file: '../dist/chrome.framework.min.js',
        name: 'chrome',
        format: 'iife'
    },
    plugins: [
        terser(options)
    ]
};