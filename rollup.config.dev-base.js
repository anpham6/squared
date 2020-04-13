export default {
    input: './build/src/base/main.js',
    treeshake: false,
    output: {
        file: './dist/squared.base.js',
        name: 'squared.base',
        format: 'umd'
    }
};