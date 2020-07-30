export default {
    input: './build/framework/vdom-lite/src/main.js',
    treeshake: true,
    output: {
        file: './dist/vdom-lite.framework.js',
        name: 'vdom',
        format: 'iife'
    }
};