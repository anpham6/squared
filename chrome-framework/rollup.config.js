import { terser } from 'rollup-plugin-terser';
import async from 'rollup-plugin-async';
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
        async(),
        terser(options)
    ]
};