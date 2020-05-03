export default [
    {
        input: '../build/app.js',
        treeshake: false,
        output: {
            file: '../app.js',
            format: 'iife'
        }
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