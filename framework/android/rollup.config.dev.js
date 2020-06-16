export default {
    input: '../../build/framework/android/src/main.js',
    treeshake: false,
    output: {
        file: '../../dist/android.framework.js',
        name: 'android',
        format: 'iife'
    }
};