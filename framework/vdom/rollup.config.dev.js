export default {
    input: './build/framework/vdom/src/main.js',
    treeshake: false,
    output: {
        file: './dist/vdom.framework.js',
        name: 'vdom',
        format: 'iife'
    }
};