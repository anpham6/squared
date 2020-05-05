import { terser_options, prettier_options } from '../config/rollup-options';
import { version } from './package.json';

import prettier from 'rollup-plugin-prettier';
import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: '../build/android-widget/bottomnavigation/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.bottomnavigation.min.js',
            name: 'android.widget.bottomnavigation',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/coordinator/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.coordinator.min.js',
            name: 'android.widget.coordinator',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/drawer/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.drawer.min.js',
            name: 'android.widget.drawer',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/floatingactionbutton/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.floatingactionbutton.min.js',
            name: 'android.widget.floatingactionbutton',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/menu/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.menu.min.js',
            name: 'android.widget.menu',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/toolbar/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.toolbar.min.js',
            name: 'android.widget.toolbar',
            format: 'iife'
        },
        plugins: [
            terser(terser_options)
        ]
    },
    {
        input: '../build/android-widget/bottomnavigation/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.bottomnavigation.js',
            name: 'android.widget.bottomnavigation',
            format: 'iife',
            banner: `/* android.widget.bottomnavigation ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    },
    {
        input: '../build/android-widget/coordinator/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.coordinator.js',
            name: 'android.widget.coordinator',
            format: 'iife',
            banner: `/* android.widget.coordinator ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    },
    {
        input: '../build/android-widget/drawer/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.drawer.js',
            name: 'android.widget.drawer',
            format: 'iife',
            banner: `/* android.widget.drawer ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    },
    {
        input: '../build/android-widget/floatingactionbutton/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.floatingactionbutton.js',
            name: 'android.widget.floatingactionbutton',
            format: 'iife',
            banner: `/* android.widget.floatingactionbutton ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    },
    {
        input: '../build/android-widget/menu/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.menu.js',
            name: 'android.widget.menu',
            format: 'iife',
            banner: `/* android.widget.menu ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    },
    {
        input: '../build/android-widget/toolbar/main.js',
        treeshake: false,
        output: {
            file: '../dist/extensions/android.widget.toolbar.js',
            name: 'android.widget.toolbar',
            format: 'iife',
            banner: `/* android.widget.toolbar ${version}\n   https://github.com/anpham6/squared */\n`
        },
        plugins: [
            prettier(prettier_options)
        ]
    }
];