const prettier = require('rollup-plugin-prettier');

export default [
    {
        input: '../build/app.js',
        treeshake: false,
        output: {
            file: '../app.js',
            format: 'iife'
        },
        plugins: [
            prettier({
                parser: 'babel',
                tabWidth: 4
            })
        ]
    },
    {
        input: '../build/build.js',
        treeshake: false,
        output: {
            file: '../build.js',
            format: 'iife'
        },
        plugins: [
            prettier({
                parser: 'babel',
                tabWidth: 4
            })
        ]
    }
];