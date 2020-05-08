import { IChrome, ICompress, IFileManager, IExpress, IImage, INode, Settings } from './@types/node';
import { DataMap, Environment, RequestAsset, ResultOfFileAction, Routing } from './@types/express';
import { CompressFormat, Exclusions, External } from './@types/content';

import path = require('path');
import zlib = require('zlib');
import fs = require('fs-extra');
import express = require('express');
import body_parser = require('body-parser');
import cors = require('cors');
import request = require('request');
import uuid = require('uuid');
import archiver = require('archiver');
import decompress = require('decompress');
import jimp = require('jimp');
import html_minifier = require('html-minifier');
import clean_css = require('clean-css');
import js_beautify = require('js-beautify');
import prettier = require('prettier');
import terser = require('terser');
import tinify = require('tinify');
import chalk = require('chalk');

const app = express();

let Node: INode;
let Express: IExpress;
let Compress: ICompress;
let Chrome: IChrome;
let Image: IImage;

{
    let DISK_READ = false;
    let DISK_WRITE = false;
    let UNC_READ = false;
    let UNC_WRITE = false;
    let GZIP_LEVEL = 9;
    let BROTLI_QUALITY = 11;
    let JPEG_QUALITY = 100;
    let TINIFY_API_KEY = false;

    let ROUTING: Undef<Routing>;
    let CORS: Undef<cors.CorsOptions>;
    let ENV: Environment = process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? 'production' : 'development';
    let PORT = '3000';

    let EXTERNAL: Undef<External>;

    try {
        const { disk_read, disk_write, unc_read, unc_write, cors: cors_options, request_post_limit, gzip_level, brotli_quality, jpeg_quality, tinypng_api_key, env, port, routing, external } = <Settings> require('./squared.settings.json');
        DISK_READ = disk_read === true || disk_read === 'true';
        DISK_WRITE = disk_write === true || disk_write === 'true';
        UNC_READ = unc_read === true || unc_read === 'true';
        UNC_WRITE = unc_write === true || unc_write === 'true';
        if (cors_options) {
            CORS = cors_options;
        }
        if (external) {
            EXTERNAL = external;
        }
        ROUTING = routing;
        const gzip = parseInt(gzip_level as string);
        const brotli = parseInt(brotli_quality as string);
        const jpeg = parseInt(jpeg_quality as string);
        if (!process.env.NODE_ENV && env?.startsWith('prod')) {
            ENV = 'production';
        }
        if (port) {
            const value = parseInt(port[ENV] as string);
            if (!isNaN(value) && value >= 0) {
                PORT = value.toString();
            }
        }
        if (!isNaN(gzip)) {
            GZIP_LEVEL = gzip;
        }
        if (!isNaN(brotli)) {
            BROTLI_QUALITY = brotli;
        }
        if (!isNaN(jpeg)) {
            JPEG_QUALITY = jpeg;
        }
        if (tinypng_api_key) {
            tinify.key = tinypng_api_key;
            tinify.validate(err => {
                if (!err) {
                    TINIFY_API_KEY = true;
                }
            });
        }
        app.use(body_parser.json({ limit: request_post_limit || '100mb' }));
    }
    catch (err) {
        console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: ${err}`);
    }

    try {
        if (ROUTING) {
            console.log('');
            let mounted = 0;
            for (const routes of [ROUTING.shared, ROUTING[ENV]]) {
                if (Array.isArray(routes)) {
                    for (const route of routes) {
                        const { path: dirname, mount } = route;
                        if (dirname && mount) {
                            const pathname = path.join(__dirname, mount);
                            app.use(dirname, express.static(pathname));
                            console.log(`${chalk.yellow('MOUNT')}: ${chalk.bgGrey(pathname)} ${chalk.yellow('->')} ${chalk.bold(dirname)}`);
                            ++mounted;
                        }
                    }
                }
            }
            console.log(`\n${chalk.bold(mounted)} directories were mounted.\n`);
        }
        else {
            throw new Error('Routing not defined.');
        }
    }
    catch (err) {
        app.use(body_parser.json({ limit: '100mb' }));
        app.use('/', express.static(path.join(__dirname, 'html')));
        app.use('/dist', express.static(path.join(__dirname, 'dist')));
        if (ENV === 'development') {
            app.use('/common', express.static(path.join(__dirname, 'html/common')));
            app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
        }
        console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: ${err}`);
    }

    PORT = process.env.PORT || PORT;
    let CORS_origin: Undef<string | boolean>;

    const ARGV = process.argv;
    let i = 2;
    while (i < ARGV.length) {
        switch (ARGV[i++]) {
            case '--access-all':
                DISK_READ = true;
                DISK_WRITE = true;
                UNC_READ = true;
                UNC_WRITE = true;
                break;
            case '--access-disk':
                DISK_READ = true;
                DISK_WRITE = true;
                break;
            case '--disk-read':
                DISK_READ = true;
                break;
            case '--disk-write':
                DISK_WRITE = true;
                break;
            case '--access-unc':
                UNC_READ = true;
                UNC_WRITE = true;
                break;
            case '--unc-read':
                UNC_READ = true;
                break;
            case '--unc-write':
                UNC_WRITE = true;
                break;
            case '-e':
            case '--env':
                switch (ARGV[i++]) {
                    case 'prod':
                    case 'production':
                        ENV = 'production';
                        break;
                    case 'dev':
                    case 'development':
                        ENV = 'development';
                        break;
                }
                break;
            case '-p':
            case '--port': {
                const port = parseInt(ARGV[i++]);
                if (!isNaN(port)) {
                    PORT = port.toString();
                }
                break;
            }
            case '-c':
            case '--cors': {
                CORS_origin = ARGV[i] && !ARGV[i].startsWith('-') ? ARGV[i++] : true;
                break;
            }
        }
    }

    console.log(`${chalk.blue('DISK')}: ${DISK_READ ? chalk.green('+') : chalk.red('-')}r ${DISK_WRITE ? chalk.green('+') : chalk.red('-')}w`);
    console.log(`${chalk.blue(' UNC')}: ${UNC_READ ? chalk.green('+') : chalk.red('-')}r ${UNC_WRITE ? chalk.green('+') : chalk.red('-')}w`);

    if (CORS_origin) {
        app.use(cors({ origin: CORS_origin }));
        app.options('*', cors());
    }
    else if (CORS && CORS.origin) {
        app.use(cors(CORS));
        app.options('*', cors());
        CORS_origin = typeof CORS.origin === 'string' ? CORS.origin : 'true';
    }

    console.log(`${chalk.blue('CORS')}: ${CORS_origin ? chalk.green(CORS_origin) : chalk.grey('disabled')}`);

    app.use(body_parser.urlencoded({ extended: true }));
    app.listen(PORT, () => console.log(`\n${chalk[ENV === 'production' ? 'green' : 'yellow'](ENV.toUpperCase())}: Express server listening on port ${chalk.bold(PORT)}\n`));

    Node = new class implements INode {
        public major: number;
        public minor: number;
        public patch: number;

        constructor(
            public readonly disk_read = false,
            public readonly disk_write = false,
            public readonly unc_read = false,
            public readonly unc_write = false)
        {
            [this.major, this.minor, this.patch] = process.version.substring(1).split('.').map(value => parseInt(value));
        }

        checkVersion(major: number, minor: number, patch = 0) {
            if (this.major < major) {
                return false;
            }
            else if (this.major === major) {
                if (this.minor < minor) {
                    return false;
                }
                else if (this.minor === minor) {
                    return this.patch >= patch;
                }
                return true;
            }
            return true;
        }
        checkPermissions(res: express.Response<any>, dirname: string) {
            if (this.isDirectoryUNC(dirname)) {
                if (!this.unc_write) {
                    res.json({ application: 'OPTION: --unc-write', system: 'Writing to UNC shares is not enabled.' });
                    return false;
                }
            }
            else if (!this.disk_write) {
                res.json({ application: 'OPTION: --disk-write', system: 'Writing to disk is not enabled.' });
                return false;
            }
            try {
                if (!fs.existsSync(dirname)) {
                    fs.mkdirpSync(dirname);
                }
                else if (!fs.lstatSync(dirname).isDirectory()) {
                    throw new Error('Root is not a directory.');
                }
            }
            catch (system) {
                res.json({ application: `DIRECTORY: ${dirname}`, system });
                return false;
            }
            return true;
        }
        isFileURI(value: string) {
            return /^[A-Za-z]{3,}:\/\/[^/]/.test(value) && !value.startsWith('file:');
        }
        isFileUNC(value: string) {
            return /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);
        }
        isDirectoryUNC(value: string) {
            return /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
        }
        writeError(description: string, message: any) {
            return console.log(`${chalk.bgRed.bold.white('FAIL')}: ${description} (${message})`);
        }
    }
    (DISK_READ, DISK_WRITE, UNC_READ, UNC_WRITE);

    Express = new class implements IExpress {
        public PATTERN_URL = /^([A-Za-z]+:\/\/[A-Za-z\d.-]+(?::\d+)?)(\/.*)/;

        fromSameOrigin(base: string, other: string) {
            const baseMatch = this.PATTERN_URL.exec(base);
            const otherMatch = this.PATTERN_URL.exec(other);
            return !!baseMatch && !!otherMatch && baseMatch[1] === otherMatch[1];
        }
        getBaseDirectory(location: string, asset: string): [string[], string[]] {
            const locationDir = location.split(/[\\/]/);
            const assetDir = asset.split(/[\\/]/);
            while (locationDir.length && assetDir.length) {
                if (locationDir[0] === assetDir[0]) {
                    locationDir.shift();
                    assetDir.shift();
                }
                else {
                    break;
                }
            }
            return [locationDir, assetDir];
        }
        getAbsoluteUrl(value: string, href: string) {
            value = value.replace(/\\/g, '/');
            let moveTo = '';
            if (value.charAt(0) === '/') {
                moveTo = '__serverroot__';
            }
            else if (value.startsWith('../')) {
                moveTo = '__serverroot__';
                value = this.resolvePath(value, href, false) || ('/' + value.replace(/\.\.\//g, ''));
            }
            else if (value.startsWith('./')) {
                value = value.substring(2);
            }
            return moveTo + value;
        }
        getFullUri(file: RequestAsset, filename?: string) {
            return path.join(file.moveTo || '', file.pathname, filename || file.filename).replace(/\\/g, '/');
        }
        resolvePath(value: string, href: string, hostname = true) {
            const match = this.PATTERN_URL.exec(href.replace(/\\/g, '/'));
            if (match) {
                const origin = hostname ? match[1] : '';
                const pathname = match[2].split('/');
                pathname.pop();
                value = value.replace(/\\/g, '/');
                if (value.charAt(0) === '/') {
                    return origin + value;
                }
                else if (value.startsWith('../')) {
                    const trailing: string[] = [];
                    value.split('/').forEach(dir => {
                        if (dir === '..') {
                            if (trailing.length === 0) {
                                pathname.pop();
                            }
                            else {
                                trailing.pop();
                            }
                        }
                        else {
                            trailing.push(dir);
                        }
                    });
                    value = trailing.join('/');
                }
                return origin + pathname.join('/') + '/' + value;
            }
            return undefined;
        }
    }();

    Compress = new class implements ICompress {
        constructor(
            public gzip_level: number,
            public brotli_quality: number,
            public jpeg_quality: number)
        {
        }

        createGzipWriteStream(source: string, filepath: string, level?: number) {
            const o = fs.createWriteStream(filepath);
            fs.createReadStream(source)
                .pipe(zlib.createGzip({ level: level || this.gzip_level }))
                .pipe(o);
            return o;
        }
        createBrotliWriteStream(source: string, filepath: string, quality?: number, mimeType = '') {
            const o = fs.createWriteStream(filepath);
            fs.createReadStream(source)
                .pipe(
                    zlib.createBrotliCompress({
                        params: {
                            [zlib.constants.BROTLI_PARAM_MODE]: mimeType.includes('text/') ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
                            [zlib.constants.BROTLI_PARAM_QUALITY]: quality || this.brotli_quality,
                            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: this.getFileSize(source)
                        }
                    })
                )
                .pipe(o);
            return o;
        }
        getFileSize(filepath: string) {
            return fs.statSync(filepath).size;
        }
        getFormat(compress: Undef<CompressFormat[]>, format: string) {
            return compress?.find(item => item.format === format);
        }
        removeFormat(compress: Undef<CompressFormat[]>, format: string) {
            if (compress) {
                const index = compress.findIndex(value => value.format === format);
                if (index !== -1) {
                    compress.splice(index, 1);
                }
            }
        }
        getSizeRange(value: string): [number, number] {
            const match = /\(\s*(\d+)\s*,\s*(\d+|\*)\s*\)/.exec(value);
            return match ? [parseInt(match[1]), match[2] === '*' ? Infinity : parseInt(match[2])] : [0, Infinity];
        }
        withinSizeRange(filepath: string, value: Undef<string>) {
            if (!value) {
                return true;
            }
            const [greaterThan, smallerThan] = Compress.getSizeRange(value);
            if (greaterThan > 0 || smallerThan < Infinity) {
                const fileSize = Compress.getFileSize(filepath);
                if (fileSize < greaterThan || fileSize > smallerThan) {
                    return false;
                }
            }
            return true;
        }
    }
    (GZIP_LEVEL, BROTLI_QUALITY, JPEG_QUALITY);

    Chrome = new class implements IChrome {
        constructor(
            public external: Undef<External>,
            public prettier_plugins: {}[])
        {
        }

        findExternalPlugin(data: ObjectMap<StandardMap>, format: string): [string, {}] {
            for (const name in data) {
                const plugin = data[name];
                for (const custom in plugin) {
                    if (custom === format) {
                        let options = plugin[custom];
                        if (!options || typeof options !== 'object') {
                            options = {};
                        }
                        return [name, options];
                    }
                }
            }
            return ['', {}];
        }
        minifyHtml(format: string, value: string) {
            const html = this.external?.html;
            if (html) {
                let valid = false;
                const formatters = format.split('+');
                const length = formatters.length;
                for (let j = 0; j < length; ++j) {
                    const name = formatters[j].trim();
                    let [module, options] = this.findExternalPlugin(html, name);
                    if (!module) {
                        switch (name) {
                            case 'beautify':
                                module = 'prettier';
                                options = <prettier.Options> {
                                    parser: 'html',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'html_minifier';
                                options = <html_minifier.Options> {
                                    collapseWhitespace: true,
                                    collapseBooleanAttributes: true,
                                    removeEmptyAttributes: true,
                                    removeRedundantAttributes: true,
                                    removeScriptTypeAttributes: true,
                                    removeStyleLinkTypeAttributes: true,
                                    removeComments: true
                                };
                                break;
                        }
                    }
                    try {
                        switch (module) {
                            case 'prettier': {
                                (<prettier.Options> options).plugins = this.prettier_plugins;
                                const result = prettier.format(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'html_minifier': {
                                const result = html_minifier.minify(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'js_beautify': {
                                const result = js_beautify.html_beautify(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                        }
                    }
                    catch (err) {
                        Node.writeError(`External: ${module}`, err);
                    }
                }
                if (valid) {
                    return value;
                }
            }
            return undefined;
        }
        minifyCss(format: string, value: string) {
            const css = this.external?.css;
            if (css) {
                let valid = false;
                const formatters = format.split('+');
                const length = formatters.length;
                for (let j = 0; j < length; ++j) {
                    const name = formatters[j].trim();
                    let [module, options] = this.findExternalPlugin(css, name);
                    if (!module) {
                        switch (name) {
                            case 'beautify':
                                module = 'prettier';
                                options = <prettier.Options> {
                                    parser: 'css',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'clean_css';
                                options = <clean_css.OptionsOutput> {
                                    level: 1,
                                    inline: ['none']
                                };
                                break;
                        }
                    }
                    try {
                        switch (module) {
                            case 'prettier': {
                                (<prettier.Options> options).plugins = this.prettier_plugins;
                                const result = prettier.format(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'clean_css': {
                                const result = new clean_css(options).minify(value).styles;
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'js_beautify': {
                                const result = js_beautify.css_beautify(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                        }
                    }
                    catch (err) {
                        Node.writeError(`External: ${module}`, err);
                    }
                }
                if (valid) {
                    return value;
                }
            }
            return undefined;
        }
        minifyJs(format: string, value: string) {
            const js = this.external?.js;
            if (js) {
                let valid = false;
                const formatters = format.split('+');
                const length = formatters.length;
                for (let j = 0; j < length; ++j) {
                    const name = formatters[j].trim();
                    let [module, options] = this.findExternalPlugin(js, name);
                    if (!module) {
                        switch (name) {
                            case 'beautify':
                                module = 'prettier';
                                options = <prettier.Options> {
                                    parser: 'babel',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'terser';
                                options = <terser.MinifyOptions> {
                                    toplevel: true,
                                    keep_classnames: true
                                };
                                break;
                        }
                    }
                    try {
                        switch (module) {
                            case 'prettier': {
                                (<prettier.Options> options).plugins = this.prettier_plugins;
                                const result = prettier.format(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'terser': {
                                const result = terser.minify(value, options).code;
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                            case 'js_beautify': {
                                const result = js_beautify.js_beautify(value, options);
                                if (result) {
                                    if (j === length - 1) {
                                        return result;
                                    }
                                    value = result;
                                    valid = true;
                                }
                                break;
                            }
                        }
                    }
                    catch (err) {
                        Node.writeError(`External: ${module}`, err);
                    }
                }
                if (valid) {
                    return value;
                }
            }
            return undefined;
        }
        getTrailingContent(file: RequestAsset, mimeType?: string, format?: string) {
            let result: Undef<string>;
            const trailingContent = file.trailingContent;
            if (trailingContent) {
                if (!mimeType) {
                    mimeType = file.mimeType;
                }
                for (const item of trailingContent) {
                    const formatter = item.format || format || file.format;
                    if (mimeType && formatter) {
                        const content = this.formatContent(item.value, mimeType, formatter);
                        if (content) {
                            result += '\n' + content;
                            continue;
                        }
                    }
                    result += '\n' + item.value;
                }
            }
            return result;
        }
        formatContent(value: string, mimeType: string, format: string) {
            if (mimeType.endsWith('text/html') || mimeType.endsWith('application/xhtml+xml')) {
                return this.minifyHtml(format, value);
            }
            else if (mimeType.endsWith('text/css')) {
                return this.minifyCss(format, value);
            }
            else if (mimeType.endsWith('text/javascript')) {
                return this.minifyJs(format, value);
            }
            return undefined;
        }
        removeCss(source: string, styles: string[]) {
            let result: Undef<string>;
            let pattern: Undef<RegExp>;
            let match: Null<RegExpExecArray>;
            for (let value of styles) {
                value = value.replace(/\./g, '\\.');
                let found = false;
                pattern = new RegExp(`^\\s*${value}[\\s\\n]*\\{[\\s\\S]*?\\}\\n*`, 'gm');
                while ((match = pattern.exec(source)) !== null) {
                    if (result === undefined) {
                        result = source;
                    }
                    result = result.replace(match[0], '');
                    found = true;
                }
                if (found) {
                    source = result!;
                }
                pattern = new RegExp(`^[^,]*(,?[\\s\\n]*${value}[\\s\\n]*[,{](\\s*)).*?\\{?`, 'gm');
                while ((match = pattern.exec(source)) !== null) {
                    if (result === undefined) {
                        result = source;
                    }
                    const segment = match[1];
                    let replaceWith = '';
                    if (segment.trim().endsWith('{')) {
                        replaceWith = ' {' + match[2];
                    }
                    else if (segment.startsWith(',')) {
                        replaceWith = ', ';
                    }
                    result = result.replace(match[0], match[0].replace(segment, replaceWith));
                    found = true;
                }
                if (found) {
                    source = result!;
                }
            }
            return result;
        }
        replacePath(source: string, segment: string, value: string, base64?: boolean) {
            if (!base64) {
                segment = segment.replace(/[\\/]/g, '[\\\\/]');
            }
            let result: Undef<string>;
            let pattern = new RegExp(`([sS][rR][cC]|[hH][rR][eE][fF])=(["'])\\s*${(base64 ? '.+?' : '') + segment}\\s*\\2`, 'g');
            let match: RegExpExecArray | null;
            while ((match = pattern.exec(source)) !== null) {
                if (result === undefined) {
                    result = source;
                }
                result = result.replace(match[0], match[1].toLowerCase() + `="${value}"`);
            }
            pattern = new RegExp(`[uU][rR][lL]\\(\\s*(["'])?\\s*${(base64 ? '.+?' : '') + segment}\\s*\\1?\\s*\\)`, 'g');
            while ((match = pattern.exec(source)) !== null) {
                if (result === undefined) {
                    result = source;
                }
                result = result.replace(match[0], `url(${value})`);
            }
            return result;
        }
    }
    (EXTERNAL, [require('prettier/parser-html'), require('prettier/parser-postcss'), require('prettier/parser-babel'), require('prettier/parser-typescript')]);

    Image = new class implements IImage {
        constructor(public tinify_api_key: boolean) {}

        getFormat(compress: Undef<CompressFormat[]>) {
            return this.tinify_api_key ? Compress.getFormat(compress, 'png') : undefined;
        }
        isJpeg(file: RequestAsset, filepath?: string) {
            if (file.mimeType?.endsWith('image/jpeg')) {
                return true;
            }
            switch (path.extname(filepath || file.filename).toLowerCase()) {
                case '.jpg':
                case '.jpeg':
                    return true;
            }
            return false;
        }
        parseResizeMode(value: string) {
            let width = 0, height = 0;
            let mode = '';
            const match = /\((\d+)x(\d+)#?(contain|cover)?\)/.exec(value);
            if (match) {
                width = parseInt(match[1]);
                height = parseInt(match[2]);
                mode = match[3];
            }
            return { width, height, mode };
        }
        resize(image: jimp, width: Undef<number>, height: Undef<number>, mode?: string) {
            if (width && height) {
                switch (mode) {
                    case 'contain':
                        image.contain(width, height);
                        break;
                    case 'cover':
                        image.cover(width, height);
                        break;
                    case 'scale':
                        image.scaleToFit(width, height);
                        break;
                    default:
                        image.resize(width, height);
                        break;
                }
            }
            return image;
        }
    }
    (TINIFY_API_KEY);
}

function promisify<T = unknown>(fn: FunctionType<any>): FunctionType<Promise<T>> {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            try {
                const result: T = fn.call(null, ...args);
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        });
    };
}

class FileManager implements IFileManager {
    public archiving = false;
    public delayed = 0;
    public files = new Set<string>();
    public filesToRemove = new Set<string>();
    public filesToCompare = new Map<RequestAsset, string[]>();
    public contentToAppend = new Map<string, string[]>();
    public readonly requestMain?: RequestAsset;
    public readonly dataMap?: DataMap;

    constructor(
        public dirname: string,
        public assets: RequestAsset[])
    {
        this.requestMain = assets.find(item => item.requestMain);
        this.dataMap = assets[0].dataMap;
    }

    add(value: string) {
        this.files.add(value.substring(this.dirname.length + 1));
    }
    delete(value: string) {
        this.files.delete(value.substring(this.dirname.length + 1));
    }
    check(file: RequestAsset, exclusions: Exclusions) {
        const pathname = file.pathname.replace(/[\\/]$/, '');
        const filename = file.filename;
        const winOS = path.sep === '/' ? '' : 'i';
        if (exclusions.pathname) {
            for (const value of exclusions.pathname) {
                const directory = value.trim().replace(/[\\/]/g, '[\\\\/]').replace(/[\\/]$/, '');
                if (new RegExp(`^${directory}$`, winOS).test(pathname) || new RegExp(`^${directory}[\\\\/]`, winOS).test(pathname)) {
                    return false;
                }
            }
        }
        if (exclusions.filename) {
            for (const value of exclusions.filename) {
                if (value === filename || winOS && value.toLowerCase() === filename.toLowerCase()) {
                    return false;
                }
            }
        }
        if (exclusions.extension) {
            const ext = path.extname(filename).substring(1).toLowerCase();
            for (const value of exclusions.extension) {
                if (ext === value.toLowerCase()) {
                    return false;
                }
            }
        }
        if (exclusions.pattern) {
            const filepath = path.join(pathname, filename);
            const filepath_opposing = winOS ? filepath.replace(/\\/g, '/') : filepath.replace(/\//g, '\\');
            for (const value of exclusions.pattern) {
                const pattern = new RegExp(value);
                if (pattern.test(filepath) || pattern.test(filepath_opposing)) {
                    return false;
                }
            }
        }
        return true;
    }
    getFileOutput(file: RequestAsset) {
        const pathname = path.join(this.dirname, file.moveTo || '', file.pathname);
        const filepath = path.join(pathname, file.filename);
        file.filepath = filepath;
        return { pathname, filepath };
    }
    replaceFileOutput(file: RequestAsset, replaceWith: string) {
        const filepath = file.filepath;
        if (filepath) {
            this.filesToRemove.add(filepath);
            this.delete(filepath);
            if (!file.originalName) {
                file.originalName = file.filename;
            }
            file.filename = path.basename(replaceWith);
            this.add(replaceWith);
        }
    }
    getRelativeUrl(file: RequestAsset, url: string) {
        let asset = this.assets.find(item => item.uri === url);
        let origin: Undef<string> = file.uri;
        if (!asset && origin) {
            const location = Express.resolvePath(url, origin);
            if (location) {
                asset = this.assets.find(item => item.uri === location);
            }
        }
        if (asset?.uri) {
            const requestMain = this.requestMain;
            if (requestMain) {
                origin = Express.resolvePath(path.join(file.moveTo === '__serverroot__' ? '' : (file.rootDir || ''), file.pathname, file.filename), requestMain.uri!);
            }
            if (origin) {
                const pattern = Express.PATTERN_URL;
                const uri = asset.uri;
                const uriMatch = pattern.exec(uri);
                const originMatch = pattern.exec(origin);
                if (uriMatch && originMatch && uriMatch[1] === originMatch[1]) {
                    const rootDir = file.rootDir || '';
                    const baseDir = rootDir + file.pathname;
                    if (asset.moveTo === '__serverroot__') {
                        if (file.moveTo === '__serverroot__') {
                            return asset.pathname + '/' + asset.filename;
                        }
                        else if (requestMain) {
                            const requestMatch = pattern.exec(requestMain.uri!);
                            if (requestMatch && requestMatch[1] === originMatch[1]) {
                                const [originDir] = Express.getBaseDirectory(baseDir + '/' + file.filename, requestMatch[2]);
                                return '../'.repeat(originDir.length - 1) + Express.getFullUri(asset);
                            }
                        }
                    }
                    else if (asset.rootDir) {
                        if (baseDir === asset.rootDir + asset.pathname) {
                            return asset.filename;
                        }
                        else if (baseDir === asset.rootDir) {
                            return asset.pathname + '/' + asset.filename;
                        }
                    }
                    else {
                        const [originDir, uriDir] = Express.getBaseDirectory(originMatch[2], uriMatch[2]);
                        return '../'.repeat(originDir.length - 1) + uriDir.join('/');
                    }
                }
            }
        }
        return undefined;
    }
    appendContent(file: RequestAsset, content: string) {
        const filepath = file.filepath || this.getFileOutput(file).filepath;
        if (filepath && file.bundleIndex) {
            const value = this.contentToAppend.get(filepath) || [];
            const trailing = Chrome.getTrailingContent(file);
            if (trailing) {
                content += trailing;
            }
            value.splice(file.bundleIndex - 1, 0, content);
            this.contentToAppend.set(filepath, value);
        }
    }
    compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void) {
        const compress = file.compress;
        const gzip = Compress.getFormat(compress, 'gz');
        const brotli = Compress.getFormat(compress, 'br');
        const jpeg = Image.isJpeg(file, filepath) && Compress.getFormat(compress, 'jpeg');
        const resumeThread = () => {
            this.transformBuffer(assets, file, filepath, finalize);
            if (gzip && Compress.withinSizeRange(filepath, gzip.condition)) {
                ++this.delayed;
                const gz = `${filepath}.gz`;
                Compress.createGzipWriteStream(filepath, gz, gzip.level)
                    .on('finish', () => {
                        if (gzip.condition?.includes('%') && Compress.getFileSize(gz) >= Compress.getFileSize(filepath)) {
                            try {
                                fs.unlinkSync(gz);
                            }
                            catch (err) {
                                Node.writeError(gz, err);
                            }
                            finalize('');
                        }
                        else {
                            finalize(gz);
                        }
                    })
                    .on('error', err => {
                        Node.writeError(gz, err);
                        finalize('');
                    });
            }
            if (brotli && Node.checkVersion(11, 7) && Compress.withinSizeRange(filepath, brotli.condition)) {
                ++this.delayed;
                const br = `${filepath}.br`;
                Compress.createBrotliWriteStream(filepath, br, brotli.level, file.mimeType)
                    .on('finish', () => {
                        if (brotli.condition?.includes('%') && Compress.getFileSize(br) >= Compress.getFileSize(filepath)) {
                            try {
                                fs.unlinkSync(br);
                            }
                            catch (err) {
                                Node.writeError(br, err);
                            }
                            finalize('');
                        }
                        else {
                            finalize(br);
                        }
                    })
                    .on('error', err => {
                        Node.writeError(br, err);
                        finalize('');
                    });
            }
        };
        if (jpeg && Compress.withinSizeRange(filepath, jpeg.condition)) {
            ++this.delayed;
            let jpg = filepath;
            if (jpeg.condition?.includes('%')) {
                jpg = `${filepath}.jpg`;
            }
            jimp.read(filepath)
                .then(image => {
                    image.quality(jpeg.level || Compress.jpeg_quality).write(jpg, err => {
                        if (err) {
                            Node.writeError(filepath, err);
                        }
                        else if (jpg !== filepath) {
                            try {
                                if (Compress.getFileSize(jpg) >= Compress.getFileSize(filepath)) {
                                    fs.unlinkSync(jpg);
                                }
                                else {
                                    fs.renameSync(jpg, filepath);
                                }
                            }
                            catch (error) {
                                Node.writeError(jpg, error);
                            }
                        }
                        finalize('');
                        resumeThread();
                    });
                })
                .catch(err => {
                    Node.writeError(filepath, err);
                    finalize('');
                    resumeThread();
                });
        }
        else {
            resumeThread();
        }
    }
    transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void) {
        let mimeType = file.mimeType as string;
        if (!mimeType) {
            return;
        }
        const format = file.format;
        switch (mimeType) {
            case '@text/html':
            case '@application/xhtml+xml': {
                const getOuterHTML = (script: boolean, value: string) => script ? `<script type="text/javascript" src="${value}"></script>` : `<link rel="stylesheet" type="text/css" href="${value}" />`;
                const minifySpace = (value: string) => value.replace(/[\s\n]+/g, '');
                const baseUri = file.uri!;
                const saved = new Set<string>();
                let html = fs.readFileSync(filepath).toString('utf8');
                let source: Undef<string>;
                let pattern = /(\s*)<(script|link|style).*?(\s+data-chrome-file="\s*(save|export)As:\s*((?:[^"]|\\")+)").*?\/?>(?:[\s\S]*?<\/\2>\n*)?/ig;
                let match: Null<RegExpExecArray>;
                while ((match = pattern.exec(html)) !== null) {
                    if (source === undefined) {
                        source = html;
                    }
                    const segment = match[0];
                    const script = match[2].toLowerCase() === 'script';
                    const location = Express.getAbsoluteUrl(match[5].split('::')[0].trim(), baseUri);
                    if (saved.has(location)) {
                        source = source.replace(segment, '');
                    }
                    else if (match[4] === 'save') {
                        const content = segment.replace(match[3], '');
                        const src = new RegExp(`\\s+${script ? 'src' : 'href'}=(["']).+\\1`, 'i').exec(content);
                        if (src) {
                            source = source.replace(segment, content.replace(src[0], `${script ? ' src' : ' href'}="${location}"`));
                            saved.add(location);
                        }
                    }
                    else {
                        source = source.replace(segment, match[1] + getOuterHTML(script, location));
                        saved.add(location);
                    }
                }
                if (saved.size) {
                    html = source!;
                }
                pattern = /(\s*)<(script|style).*?>([\s\S]*?)<\/\2>\n*/ig;
                for (const item of assets) {
                    const { bundleIndex, trailingContent } = item;
                    if (bundleIndex !== undefined) {
                        let outerHTML = item.outerHTML;
                        if (outerHTML) {
                            if (source === undefined) {
                                source = html;
                            }
                            const length = source.length;
                            let replaceWith = '';
                            if (bundleIndex === 0) {
                                replaceWith = getOuterHTML(item.mimeType === 'text/javascript', Express.getFullUri(item));
                                source = source.replace(outerHTML, replaceWith);
                            }
                            else {
                                source = source.replace(new RegExp(`\\s*${outerHTML}\\n*`), '');
                            }
                            if (source.length === length) {
                                pattern.lastIndex = 0;
                                const content = minifySpace(item.content || '');
                                outerHTML = minifySpace(outerHTML);
                                while ((match = pattern.exec(html)) !== null) {
                                    if (outerHTML === minifySpace(match[0]) || content && content === minifySpace(match[3])) {
                                        source = source.replace(match[0], (replaceWith ? match[1] : '') + replaceWith);
                                        html = source;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (trailingContent) {
                        pattern.lastIndex = 0;
                        const content = [];
                        for (const trailing of trailingContent) {
                            content.push(minifySpace(trailing.value));
                        }
                        let modified = false;
                        while ((match = pattern.exec(html)) !== null) {
                            if (source === undefined) {
                                source = html;
                            }
                            const value = minifySpace(match[3]);
                            if (content.includes(value)) {
                                source = source.replace(match[0], '');
                                modified = true;
                            }
                        }
                        if (modified) {
                            html = source!;
                        }
                    }
                }
                if (source === undefined) {
                    source = html;
                }
                for (const item of assets) {
                    if (item.base64) {
                        const replacement = Chrome.replacePath(source, item.base64.replace(/\+/g, '\\+'), Express.getFullUri(item), true);
                        if (replacement) {
                            source = replacement;
                        }
                        continue;
                    }
                    else if (item === file || item.content || !item.uri) {
                        continue;
                    }
                    const value = Express.getFullUri(item);
                    const replacement = Chrome.replacePath(source, item.uri, value);
                    if (replacement) {
                        source = replacement;
                    }
                    if (item.rootDir || Express.fromSameOrigin(baseUri, item.uri)) {
                        let modified = false;
                        pattern = new RegExp(`((?:\\.\\.)?(?:[\\\\/]\\.\\.|\\.\\.[\\\\/]|[\\\\/])*)?(${path.join(item.pathname, item.filename).replace(/[\\/]/g, '[\\\\/]')})`, 'g');
                        while ((match = pattern.exec(html)) !== null) {
                            const pathname = match[0];
                            if (pathname !== value && item.uri === Express.resolvePath(pathname, baseUri)) {
                                source = source.replace(pathname, value);
                                modified = true;
                            }
                        }
                        if (modified) {
                            html = source;
                        }
                    }
                }
                source = source
                    .replace(/\s*<(script|link|style).+?data-chrome-file="exclude".*?>[\s\S]*?<\/\1>\n*/ig, '')
                    .replace(/\s*<(script|link).+?data-chrome-file="exclude".*?\/?>\n*/ig, '')
                    .replace(/\s+data-(?:use|chrome-[\w-]+)="([^"]|\\")+?"/g, '');
                fs.writeFileSync(filepath, format && Chrome.minifyHtml(format, source) || source);
                break;
            }
            case '@text/css': {
                const output = this.transformCss(file, filepath) || fs.readFileSync(filepath).toString('utf8');
                let source: Undef<string>;
                if (format) {
                    source = Chrome.minifyCss(format, output);
                }
                if (file.trailingContent) {
                    const content = Chrome.getTrailingContent(file, mimeType, format);
                    const result = this.transformCss(file, undefined, content);
                    if (result) {
                        if (source) {
                            source += result;
                        }
                        else {
                            source = result;
                        }
                    }
                    else {
                        if (source) {
                            source += content;
                        }
                        else {
                            source = content;
                        }
                    }
                }
                const unusedStyles = this.dataMap?.unusedStyles;
                fs.writeFileSync(filepath, unusedStyles && !file.preserve && Chrome.removeCss(source || output, unusedStyles) || source || output);
                break;
            }
            case 'text/html':
            case 'application/xhtml+xml': {
                if (format) {
                    const output = Chrome.minifyHtml(format, fs.readFileSync(filepath).toString('utf8'));
                    if (output) {
                        fs.writeFileSync(filepath, output);
                    }
                }
                break;
            }
            case 'text/css':
            case 'text/javascript': {
                if (format) {
                    let output = Chrome[mimeType === 'text/css' ? 'minifyCss' : 'minifyJs'](format, fs.readFileSync(filepath).toString('utf8'));
                    if (output) {
                        const trailing = Chrome.getTrailingContent(file, mimeType, format);
                        if (trailing) {
                            output += trailing;
                        }
                        fs.writeFileSync(filepath, output);
                        break;
                    }
                }
                const trailing = Chrome.getTrailingContent(file, mimeType, format);
                if (trailing) {
                    try {
                        fs.appendFileSync(filepath, trailing);
                    }
                    catch (err) {
                        Node.writeError(filepath, err);
                    }
                }
                break;
            }
            default:
                if (mimeType.includes('image/')) {
                    const replaceExtension = (value: string, ext: string) => {
                        const index = value.lastIndexOf('.');
                        return value.substring(0, index !== -1 ? index : value.length) + '.' + ext;
                    };
                    const afterConvert = (transformed: string, condition: string) => {
                        if (condition.includes('@')) {
                            this.replaceFileOutput(file, transformed);
                        }
                        else if (condition.includes('%')) {
                            if (this.filesToCompare.has(file)) {
                                this.filesToCompare.get(file)!.push(transformed);
                            }
                            else {
                                this.filesToCompare.set(file, [transformed]);
                            }
                        }
                    };
                    const compressImage = (location: string) => {
                        try {
                            tinify.fromBuffer(fs.readFileSync(location)).toBuffer((err, resultData) => {
                                if (!err) {
                                    fs.writeFileSync(location, resultData);
                                }
                                finalize(location);
                            });
                        }
                        catch (err) {
                            finalize('');
                            Node.writeError(location, err);
                        }
                    };
                    const convert = mimeType.split(':');
                    convert.pop();
                    convert.forEach(value => {
                        const removeValue = () => mimeType = mimeType.replace(value + ':', '');
                        if (!Compress.withinSizeRange(filepath, value)) {
                            removeValue();
                            return;
                        }
                        const { width, height, mode } = Image.parseResizeMode(value);
                        if (value.startsWith('png')) {
                            if (!mimeType.endsWith('/png')) {
                                removeValue();
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const png = replaceExtension(filepath, 'png');
                                        Image.resize(image, width, height, mode).write(png, err => {
                                            if (err) {
                                                Node.writeError(png, err);
                                            }
                                            else {
                                                afterConvert(png, value);
                                                if (Image.getFormat(file.compress)) {
                                                    compressImage(png);
                                                    return;
                                                }
                                            }
                                            finalize(png);
                                        });
                                    })
                                    .catch(err => {
                                        finalize('');
                                        Node.writeError(filepath, err);
                                    });
                                return;
                            }
                        }
                        else if (value.startsWith('jpeg')) {
                            if (!mimeType.endsWith('/jpeg')) {
                                removeValue();
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const jpg = replaceExtension(filepath, 'jpg');
                                        Image.resize(image, width, height, mode).quality(Compress.jpeg_quality).write(jpg, err => {
                                            if (err) {
                                                Node.writeError(jpg, err);
                                            }
                                            else {
                                                afterConvert(jpg, value);
                                                if (Image.getFormat(file.compress)) {
                                                    compressImage(jpg);
                                                    return;
                                                }
                                            }
                                            finalize(jpg);
                                        });
                                    })
                                    .catch(err => {
                                        finalize('');
                                        Node.writeError(filepath, err);
                                    });
                                return;
                            }
                        }
                        else if (value.startsWith('bmp')) {
                            if (!mimeType.endsWith('/bmp')) {
                                removeValue();
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const bmp = replaceExtension(filepath, 'bmp');
                                        Image.resize(image, width, height, mode).write(bmp, err => {
                                            if (err) {
                                                Node.writeError(bmp, err);
                                            }
                                            else {
                                                afterConvert(bmp, value);
                                            }
                                            finalize(bmp);
                                        });
                                    })
                                    .catch(err => {
                                        finalize('');
                                        Node.writeError(filepath, err);
                                    });
                                return;
                            }
                        }
                    });
                    if (/\/(png|jpeg|bmp)$/.test(mimeType)) {
                        const { width, height, mode } = Image.parseResizeMode(mimeType);
                        if (width && height) {
                            ++this.delayed;
                            jimp.read(filepath)
                                .then(image => {
                                    const resizepath = filepath + path.extname(filepath);
                                    Image.resize(image, width, height, mode).write(resizepath, err => {
                                        if (err) {
                                            Node.writeError(resizepath, err);
                                        }
                                        else {
                                            fs.renameSync(resizepath, filepath);
                                        }
                                        finalize('');
                                    });
                                });
                        }
                    }
                }
                break;
        }
    }
    transformCss(file: RequestAsset, filepath: Undef<string>, content?: string) {
        const baseUrl = file.uri!;
        const sameOrigin = this.requestMain !== undefined && Express.fromSameOrigin(this.requestMain.uri!, baseUrl);
        const unusedStyles = this.dataMap?.unusedStyles;
        if (sameOrigin || unusedStyles) {
            if (filepath) {
                content = fs.readFileSync(filepath).toString('utf8');
            }
            else if (!content) {
                return undefined;
            }
            if (unusedStyles && !file.preserve) {
                const result = Chrome.removeCss(content, unusedStyles);
                if (result) {
                    content = result;
                }
            }
            if (sameOrigin) {
                const assets = this.assets;
                for (const item of assets) {
                    if (item.base64 && item.uri) {
                        const url = this.getRelativeUrl(file, item.uri);
                        if (url) {
                            const replacement = Chrome.replacePath(content, item.base64.replace(/\+/g, '\\+'), url, true);
                            if (replacement) {
                                content = replacement;
                            }
                        }
                    }
                }
                let source: Undef<string>;
                const pattern = /[uU][rR][lL]\(\s*(["'])?\s*((?:[^"')]|\\"|\\')+)\s*\1?\s*\)/g;
                let match: Null<RegExpExecArray>;
                while ((match = pattern.exec(content)) !== null) {
                    if (source === undefined) {
                        source = content;
                    }
                    const url = match[2];
                    if (!Node.isFileURI(url) || Express.fromSameOrigin(baseUrl, url)) {
                        let location = this.getRelativeUrl(file, url);
                        if (location) {
                            source = source.replace(match[0], `url(${location})`);
                        }
                        else {
                            location = Express.resolvePath(match[2], this.requestMain!.uri!);
                            if (location) {
                                const asset = assets.find(item => item.uri === location);
                                if (asset) {
                                    location = this.getRelativeUrl(file, location);
                                    if (location) {
                                        source = source.replace(match[0], `url(${location})`);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        const asset = assets.find(item => item.uri === url);
                        if (asset) {
                            const count = file.pathname.split(/[\\/]/).length;
                            source = source.replace(match[0], `url(${(count > 0 ? '../'.repeat(count) : '') + Express.getFullUri(asset)})`);
                        }
                    }
                }
                if (file.format) {
                    source = Chrome.minifyCss(file.format, source || content) || source || content;
                }
                file.mimeType = '&text/css';
                return source || content;
            }
        }
        return undefined;
    }
    writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void) {
        const png = Image.getFormat(file.compress);
        if (png && Compress.withinSizeRange(filepath, png.condition)) {
            try {
                tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
                    if (!err) {
                        fs.writeFileSync(filepath, resultData);
                    }
                    if (Image.isJpeg(file)) {
                        Compress.removeFormat(file.compress, 'jpeg');
                    }
                    this.compressFile(assets, file, filepath, finalize);
                });
            }
            catch (err) {
                this.compressFile(assets, file, filepath, finalize);
                Node.writeError(filepath, err);
            }
        }
        else {
            this.compressFile(assets, file, filepath, finalize);
        }
    }
    processAssetsAsync(empty: boolean, finalize: (filepath?: string) => void) {
        const emptyDir = new Set<string>();
        const notFound: ObjectMap<boolean> = {};
        const processing: ObjectMap<RequestAsset[]> = {};
        const appending: ObjectMap<RequestAsset[]> = {};
        const completed: string[] = [];
        const assets = this.assets;
        const exclusions = assets[0].exclusions;
        const unusedStyles = this.dataMap?.unusedStyles;
        const checkQueue = (file: RequestAsset, filepath: string) => {
            if (file.bundleIndex !== undefined) {
                const queue = appending[filepath];
                if (queue) {
                    queue.push(file);
                    return true;
                }
                else {
                    appending[filepath] = [];
                    return false;
                }
            }
            else if (completed.includes(filepath)) {
                this.writeBuffer(assets, file, filepath, finalize);
                finalize('');
                return true;
            }
            else {
                const queue = processing[filepath];
                if (queue) {
                    ++this.delayed;
                    queue.push(file);
                    return true;
                }
                else {
                    processing[filepath] = [file];
                    return false;
                }
            }
        };
        const processQueue = (file: RequestAsset, filepath: string, bundleMain?: RequestAsset) => {
            const bundleIndex = file.bundleIndex;
            if (bundleIndex !== undefined) {
                const queue = appending[filepath]?.shift();
                if (queue) {
                    const uri = queue.uri;
                    if (!uri) {
                        processQueue(queue, filepath, bundleMain || file);
                        return;
                    }
                    request(uri, (err, response) => {
                        if (err) {
                            notFound[uri] = true;
                            Node.writeError(uri, err);
                        }
                        else {
                            const statusCode = response.statusCode;
                            if (statusCode >= 300) {
                                notFound[uri] = true;
                                Node.writeError(uri, statusCode + ' ' + response.statusMessage);
                            }
                            else {
                                const { mimeType, format } = queue;
                                let content = response.body as string;
                                if (mimeType && format) {
                                    const source = Chrome.formatContent(content, mimeType, format);
                                    if (source) {
                                        content = source;
                                    }
                                }
                                if (mimeType === '@text/css') {
                                    const trailing = Chrome.getTrailingContent(queue);
                                    if (trailing) {
                                        content += trailing;
                                    }
                                    if (unusedStyles && !queue.preserve) {
                                        const source = Chrome.removeCss(content, unusedStyles);
                                        if (source) {
                                            content = source;
                                        }
                                    }
                                    const result = this.transformCss(queue, undefined, content);
                                    if (result) {
                                        content = result;
                                    }
                                }
                                if (queue.bundleIndex) {
                                    this.appendContent(queue, content);
                                }
                                else {
                                    try {
                                        fs.writeFileSync(filepath, content);
                                    }
                                    catch (error) {
                                        Node.writeError(filepath, error);
                                    }
                                }
                            }
                        }
                        processQueue(queue, filepath, bundleMain || file);
                    });
                    return;
                }
            }
            completed.push(filepath);
            for (const item of (processing[filepath] || [bundleMain || file])) {
                this.writeBuffer(assets, item, filepath, finalize);
                finalize(filepath);
            }
            delete processing[filepath];
        };
        const errorRequest = (uri: string, filepath: string, message: Error | string, stream?: fs.WriteStream) => {
            if (!notFound[uri]) {
                finalize('');
                notFound[uri] = true;
            }
            if (stream) {
                try {
                    stream.close();
                    fs.unlinkSync(filepath);
                }
                catch {
                }
            }
            Node.writeError(uri, message);
            delete processing[filepath];
        };
        for (let i = 0; i < assets.length; ++i) {
            const file = assets[i];
            if (exclusions && !this.check(file, exclusions)) {
                assets.splice(i--, 1);
                continue;
            }
            const { pathname, filepath } = this.getFileOutput(file);
            if (!emptyDir.has(pathname)) {
                if (empty) {
                    try {
                        fs.emptyDirSync(pathname);
                    }
                    catch (err) {
                        Node.writeError(pathname, err);
                    }
                }
                if (!fs.existsSync(pathname)) {
                    fs.mkdirpSync(pathname);
                }
                emptyDir.add(pathname);
            }
            if (file.content) {
                if (file.bundleIndex === 0) {
                    appending[filepath] = [];
                }
                ++this.delayed;
                fs.writeFile(
                    filepath,
                    file.content,
                    'utf8',
                    err => {
                        if (!err) {
                            this.writeBuffer(assets, file, filepath, finalize);
                        }
                        finalize(filepath);
                    }
                );
            }
            else if (file.base64) {
                ++this.delayed;
                fs.writeFile(
                    filepath,
                    file.base64,
                    'base64',
                    err => {
                        if (!err) {
                            this.writeBuffer(assets, file, filepath, finalize);
                        }
                        finalize(filepath);
                    }
                );
            }
            else {
                const uri = file.uri;
                if (!uri || notFound[uri]) {
                    continue;
                }
                try {
                    if (Node.isFileURI(uri)) {
                        if (checkQueue(file, filepath)) {
                            continue;
                        }
                        const stream = fs.createWriteStream(filepath);
                        stream.on('finish', () => {
                            if (!notFound[uri]) {
                                processQueue(file, filepath);
                            }
                        });
                        ++this.delayed;
                        request(uri)
                            .on('response', response => {
                                const statusCode = response.statusCode;
                                if (statusCode >= 300) {
                                    errorRequest(uri, filepath, statusCode + ' ' + response.statusMessage, stream);
                                }
                            })
                            .on('error', err => errorRequest(uri, filepath, err, stream))
                            .pipe(stream);
                    }
                    else {
                        const copyUri = (from: string, to: string) => {
                            ++this.delayed;
                            fs.copyFile(
                                from,
                                to,
                                err => {
                                    if (!err) {
                                        processQueue(file, filepath);
                                    }
                                    else {
                                        finalize('');
                                    }
                                }
                            );
                        };
                        if (Node.isFileUNC(uri)) {
                            if (Node.unc_read) {
                                if (checkQueue(file, filepath)) {
                                    continue;
                                }
                                copyUri(uri, filepath);
                            }
                        }
                        else if (Node.disk_read && path.isAbsolute(uri)) {
                            if (checkQueue(file, filepath)) {
                                continue;
                            }
                            copyUri(uri, filepath);
                        }
                    }
                }
                catch (err) {
                    errorRequest(uri, filepath, err);
                }
            }
        }
    }
    finalizeAssetsAsync(release: boolean) {
        const filesToRemove = this.filesToRemove;
        for (const [file, output] of this.filesToCompare) {
            const originalPath = file.filepath!;
            let minFile = originalPath;
            let minSize = Compress.getFileSize(minFile);
            for (const filepath of output) {
                const size = Compress.getFileSize(filepath);
                if (size < minSize) {
                    filesToRemove.add(minFile);
                    minFile = filepath;
                    minSize = size;
                }
                else {
                    filesToRemove.add(filepath);
                }
            }
            if (minFile !== originalPath) {
                this.replaceFileOutput(file, minFile);
            }
        }
        const length = this.dirname.length;
        for (const value of this.filesToRemove) {
            try {
                fs.unlinkSync(value);
                this.files.delete(value.substring(length + 1));
            }
            catch (err) {
                Node.writeError(value, err);
            }
        }
        for (const [filepath, content] of this.contentToAppend.entries()) {
            let output = '';
            for (const value of content) {
                if (value) {
                    output += '\n' + value;
                }
            }
            if (fs.existsSync(filepath)) {
                fs.appendFileSync(filepath, output);
            }
            else {
                fs.writeFileSync(filepath, output);
            }
        }
        return promisify<void>(() => {
            const replaced = this.assets.filter(file => file.originalName);
            if (replaced.length || release) {
                for (const asset of this.assets) {
                    const { filepath, mimeType } = asset;
                    if (filepath) {
                        switch (mimeType) {
                            case '@text/html':
                            case '@application/xhtml+xml':
                            case '@text/css':
                            case '&text/css':
                                fs.readFile(filepath, (err, data) => {
                                    if (!err) {
                                        let html = data.toString('utf-8');
                                        for (const item of replaced) {
                                            html = html.replace(new RegExp(Express.getFullUri(item, item.originalName).replace(/[\\/]/g, '[\\\\/]'), 'g'), Express.getFullUri(item));
                                        }
                                        if (release) {
                                            html = html.replace(/(\.\.\/)*__serverroot__/g, '');
                                        }
                                        fs.writeFileSync(filepath, html);
                                    }
                                });
                                break;
                        }
                    }
                }
            }
        })();
    }
}

app.post('/api/assets/copy', (req, res) => {
    let dirname = req.query.to as string;
    if (dirname) {
        dirname = path.normalize(dirname);
        if (!Node.checkPermissions(res, dirname)) {
            return;
        }
        const status = new FileManager(dirname, <RequestAsset[]> req.body);
        let cleared = false;
        const finalize = (filepath?: string) => {
            if (status.delayed === Infinity) {
                return;
            }
            if (filepath) {
                status.add(filepath);
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                status.finalizeAssetsAsync(req.query.release === '1').then(() => {
                    res.json(<ResultOfFileAction> { success: status.files.size > 0, files: Array.from(status.files) });
                    status.delayed = Infinity;
                });
            }
        };
        try {
            status.processAssetsAsync(req.query.empty === '1', finalize);
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (system) {
            res.json({ application: 'FILE: Unknown', system });
        }
    }
});

app.post('/api/assets/archive', (req, res) => {
    let copy_to = req.query.to as string;
    if (copy_to) {
        copy_to = path.normalize(copy_to);
    }
    const dirname = path.join(__dirname, 'temp' + path.sep + uuid.v4());
    let dirname_zip: string;
    try {
        fs.mkdirpSync(dirname);
        if (copy_to) {
            if (!Node.checkPermissions(res, copy_to)) {
                return;
            }
            dirname_zip = copy_to;
        }
        else {
            dirname_zip = dirname + '-zip';
            fs.mkdirpSync(dirname_zip);
        }
    }
    catch (system) {
        res.json({ application: `DIRECTORY: ${dirname}`, system });
        return;
    }
    const status = new FileManager(dirname, <RequestAsset[]> req.body);
    let cleared = false;
    let zipname = '';
    let format: archiver.Format;
    let formatGzip = false;
    let append_to = req.query.append_to as string;
    if (path.isAbsolute(append_to)) {
        append_to = path.normalize(append_to);
    }
    switch (req.query.format) {
        case 'gz':
        case 'tgz':
            formatGzip = true;
        case 'tar':
            format = 'tar';
            break;
        default:
            format = 'zip';
            break;
    }
    const resumeThread = (unzip_to = '') => {
        const archive = archiver(format, { zlib: { level: Compress.gzip_level } });
        zipname = path.join(dirname_zip, (req.query.filename || zipname || 'squared') + '.' + format);
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const success = status.files.size > 0;
            const bytes = archive.pointer();
            const response: ResultOfFileAction = { success, files: Array.from(status.files) };
            if (!copy_to) {
                response.zipname = zipname;
                response.bytes = bytes;
            }
            if (formatGzip && success) {
                const gz = req.query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                Compress.createGzipWriteStream(zipname, gz)
                    .on('finish', () => {
                        const gz_bytes = Compress.getFileSize(gz);
                        if (!copy_to) {
                            response.zipname = gz;
                            response.bytes = gz_bytes;
                        }
                        res.json(response);
                        console.log(`${chalk.blue('WRITE')}: ${gz} ${chalk.yellow('[') + chalk.grey(gz_bytes + ' bytes') + chalk.yellow(']')}`);
                    })
                    .on('error', err => {
                        response.success = false;
                        res.json(response);
                        Node.writeError(gz, err);
                    });
            }
            else {
                res.json(response);
            }
            status.delayed = Infinity;
            console.log(`${chalk.blue('WRITE')}: ${zipname} ${chalk.yellow('[') + chalk.grey(bytes + ' bytes') + chalk.yellow(']')}`);
        });
        archive.pipe(output);
        const finalize = (filepath?: string) => {
            if (status.delayed === Infinity) {
                return;
            }
            if (filepath) {
                status.add(filepath);
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                status.finalizeAssetsAsync(req.query.release === '1').then(() => {
                    archive.directory(dirname, false);
                    archive.finalize();
                });
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            status.processAssetsAsync(false, finalize);
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (system) {
            res.json({ application: 'FILE: Unknown', system });
        }
    };
    if (append_to) {
        const errorAppend = (name: string, err: Error) => {
            resumeThread();
            Node.writeError(name, err);
        };
        const match = /([^/\\]+)\.(zip|tar)$/i.exec(append_to);
        if (match) {
            const zippath = path.join(dirname_zip, match[0]);
            try {
                const copySuccess = () => {
                    zipname = match[1];
                    const unzip_to = path.join(dirname_zip, zipname);
                    decompress(zippath, unzip_to)
                        .then(() => {
                            format = <archiver.Format> match[2].toLowerCase();
                            resumeThread(unzip_to);
                        })
                        .catch(err => {
                            Node.writeError(zippath, err);
                            resumeThread();
                        });
                };
                if (Node.isFileURI(append_to)) {
                    const stream = fs.createWriteStream(zippath);
                    stream.on('finish', copySuccess);
                    request(append_to)
                        .on('response', response => {
                            const statusCode = response.statusCode;
                            if (statusCode >= 300) {
                                errorAppend(zippath, new Error(statusCode + ' ' + response.statusMessage));
                            }
                        })
                        .on('error', err => errorAppend(zippath, err))
                        .pipe(stream);
                }
                else if (fs.existsSync(append_to)) {
                    if (Node.isFileUNC(append_to)) {
                        if (!Node.unc_read) {
                            res.json({ application: 'OPTION: --unc-read', system: 'Reading from UNC shares is not enabled.' });
                            return;
                        }
                    }
                    else if (!Node.disk_read && path.isAbsolute(append_to)) {
                        res.json({ application: 'OPTION: --disk-read', system: 'Reading from disk is not enabled.' });
                        return;
                    }
                    fs.copyFileSync(append_to, zippath);
                    copySuccess();
                }
                else {
                    errorAppend(append_to, new Error('Archive not found.'));
                }
            }
            catch (err) {
                errorAppend(zippath, <Error> err);
            }
        }
        else {
            errorAppend(append_to, new Error('Invalid archive format.'));
        }
    }
    else {
        resumeThread();
    }
});

app.get('/api/browser/download', (req, res) => {
    const filepath = req.query.filepath as string;
    if (filepath) {
        res.sendFile(filepath, err => {
            if (err) {
                Node.writeError(filepath, err);
            }
        });
    }
    else {
        res.json(null);
    }
});