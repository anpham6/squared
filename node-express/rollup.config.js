import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: '../build/app.js',
        treeshake: false,
        output: {
            file: '../app.js',
            format: 'cjs'
        },
        plugins: [
            terser()
        ]
    }
];