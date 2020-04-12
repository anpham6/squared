import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: '../build/android-framework/src/main.js',
        treeshake: false,
        output: {
            file: '../dist/android.framework.min.js',
            name: 'android',
            format: 'iife'
        },
        plugins: [
            terser({
                compress: {
                    loops: false,
                    booleans: false,
                    keep_classnames: true
                }
            })
        ]
    }
];