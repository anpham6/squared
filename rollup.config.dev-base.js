import { version } from './package.json';

export default [
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.js',
            name: 'squared.base',
            format: 'umd',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        }
    }
];