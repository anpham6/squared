import { version } from './package.json';

export default {
    input: '../build/android-framework/src/main.js',
    treeshake: false,
    output: {
        file: '../dist/android.framework.js',
        name: 'android',
        format: 'iife',
        banner: `/* android-framework ${version}\n   https://github.com/anpham6/squared */\n`
    }
};