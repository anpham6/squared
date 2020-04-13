import { terser } from 'rollup-plugin-terser';
import async from 'rollup-plugin-async';

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
        terser({
            compress: {
                loops: false,
                booleans: false,
                keep_classnames: true
            }
        })
    ]
};