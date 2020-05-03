import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: '../build/app.js',
        treeshake: false,
        output: {
            file: '../app.js',
            format: 'iife'
        },
        plugins: [
            terser({ toplevel: true })
        ]
    },
    {
        input: '../build/build.js',
        treeshake: false,
        output: {
            file: '../build.js',
            format: 'iife'
        }
    }
];