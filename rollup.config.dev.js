import { version } from './package.json';

export default [
    {
        input: './build/src/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.js',
            name: 'squared',
            format: 'umd',
            banner: `/* squared ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/base/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.base.js',
            name: 'squared.base',
            format: 'umd',
            banner: `/* squared.base ${version}\n   https://github.com/anpham6/squared */\n`
        }
    },
    {
        input: './build/src/svg/main.js',
        treeshake: false,
        output: {
            file: './dist/squared.svg.js',
            name: 'squared.svg',
            format: 'umd',
            banner: `/* squared.svg ${version}\n   https://github.com/anpham6/squared */\n`
        }
    }
];