import { CompressionFormat, Environment, External, RequestAsset, ResultOfFileAction, Routing, Settings } from './@types/node';

import path = require('path');
import zlib = require('zlib');
import fs = require('fs-extra');
import express = require('express');
import body_parser = require('body-parser');
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

const PRETTIER_PLUGINS = [require('prettier/parser-html'), require('prettier/parser-postcss'), require('prettier/parser-babel'), require('prettier/parser-typescript')];

interface CompressOutput {
    jpeg: number;
    gzip?: number;
    brotli?: number;
}

const app = express();

let DISK_READ = false;
let DISK_WRITE = false;
let UNC_READ = false;
let UNC_WRITE = false;
let GZIP_LEVEL = 9;
let BROTLI_QUALITY = 11;
let JPEG_QUALITY = 100;
let TINIFY_API_KEY = false;
let ENV: Environment = process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? 'production' : 'development';
let PORT = '3000';
let EXTERNAL: External = {};
let ROUTING: Undef<Routing>;

try {
    const { disk_read, disk_write, unc_read, unc_write, request_post_limit, gzip_level, brotli_quality, jpeg_quality, tinypng_api_key, env, port, routing, external } = <Settings> require('./squared.settings.json');
    DISK_READ = disk_read === true || disk_read === 'true';
    DISK_WRITE = disk_write === true || disk_write === 'true';
    UNC_READ = unc_read === true || unc_read === 'true';
    UNC_WRITE = unc_write === true || unc_write === 'true';
    ROUTING = routing;
    if (external) {
        EXTERNAL = external;
    }
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
    console.log(`FAIL: ${err}`);
}
{
    PORT = process.env.PORT || PORT;
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
        }
    }
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
                        console.log(`MOUNT: ${pathname} -> ${dirname}`);
                        ++mounted;
                    }
                }
            }
        }
        console.log(`\n${mounted} directories were mounted.\n`);
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
    console.log(`FAIL: ${err}`);
}

app.set('port', PORT);
app.use(body_parser.urlencoded({ extended: true }));

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

const Node = new class {
    public major: number;
    public minor: number;
    public patch: number;

    constructor() {
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
            if (!UNC_WRITE) {
                res.json({ application: 'OPTION: --unc-write', system: 'Writing to UNC shares is not enabled.' });
                return false;
            }
        }
        else if (!DISK_WRITE) {
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
    getFileSize = (filepath: string) => fs.statSync(filepath).size;
    isFileURI = (value: string) => /^[A-Za-z]{3,}:\/\/[^/]/.test(value) && !value.startsWith('file:');
    isFileUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);
    isDirectoryUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
    writeError = (description: string, message: any) => console.log(`FAIL: ${description} (${message})`);
}();

const Chrome = new class {
    formatContent(value: string, mimeType: string, format: string) {
        if (mimeType.endsWith('text/html') || mimeType.endsWith('application/xhtml+xml')) {
            return this.minifyHtml(format, value) || value;
        }
        else if (mimeType.endsWith('text/css')) {
            return this.minifyCss(format, value) || value;
        }
        else if (mimeType.endsWith('text/javascript')) {
            return this.minifyJs(format, value) || value;
        }
        return value;
    }
    getTrailingContent(file: RequestAsset, mimeType?: string, format?: string) {
        if (!mimeType) {
            mimeType = file.mimeType;
        }
        const trailingContent = file.trailingContent;
        let result = '';
        if (trailingContent) {
            for (const item of trailingContent) {
                const formatter = item.format || format || file.format;
                if (mimeType && formatter) {
                    result += '\n' + this.formatContent(item.value, mimeType, formatter);
                }
                else {
                    result += '\n' + item.value;
                }
            }
        }
        return result;
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
        const html = EXTERNAL?.html;
        if (html) {
            let valid = false;
            for (const name of format.split('::')) {
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
                            (<prettier.Options> options).plugins = PRETTIER_PLUGINS;
                            const result = prettier.format(value, options);
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'html_minifier': {
                            const result = html_minifier.minify(value, options);
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'js_beautify': {
                            const result = js_beautify.html_beautify(value, options);
                            if (result) {
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
        return '';
    }
    minifyCss(format: string, value: string) {
        const css = EXTERNAL?.css;
        if (css) {
            let valid = false;
            for (const name of format.split('::')) {
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
                            (<prettier.Options> options).plugins = PRETTIER_PLUGINS;
                            const result = prettier.format(value, options);
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'clean_css': {
                            const result = new clean_css(options).minify(value).styles;
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'js_beautify': {
                            const result = js_beautify.css_beautify(value, options);
                            if (result) {
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
        return '';
    }
    minifyJs(format: string, value: string) {
        const js = EXTERNAL?.js;
        if (js) {
            let valid = false;
            for (const name of format.split('::')) {
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
                            (<prettier.Options> options).plugins = PRETTIER_PLUGINS;
                            const result = prettier.format(value, options);
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'terser': {
                            const result = terser.minify(value, options).code;
                            if (result) {
                                value = result;
                                valid = true;
                            }
                            break;
                        }
                        case 'js_beautify': {
                            const result = js_beautify.js_beautify(value, options);
                            if (result) {
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
        return '';
    }
    replacePathName(source: string, segment: string, value: string, base64?: boolean) {
        if (!base64) {
            segment = segment.replace(/[\\/]/g, '[\\\\/]');
        }
        let result = source;
        let pattern = new RegExp(`([sS][rR][cC]|[hH][rR][eE][fF])=(["'])\\s*${(base64 ? '.+?' : '') + segment}\\s*\\2`, 'g');
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(source)) !== null) {
            result = result.replace(match[0], match[1].toLowerCase() + `="${value}"`);
        }
        pattern = new RegExp(`[uU][rR][lL]\\(\\s*(["'])?\\s*${(base64 ? '.+?' : '') + segment}\\s*\\1?\\s*\\)`, 'g');
        while ((match = pattern.exec(source)) !== null) {
            result = result.replace(match[0], `url(${value})`);
        }
        return result;
    }
}();

const Express = new class {
    public PATTERN_URL = /^([A-Za-z]+:\/\/[A-Za-z\d.-]+(?::\d+)?)(\/.*)/;

    fromSameOrigin(base: string, other: string) {
        const baseMatch = this.PATTERN_URL.exec(base);
        const otherMatch = this.PATTERN_URL.exec(other);
        return !!baseMatch && !!otherMatch && baseMatch[1] === otherMatch[1];
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
        return '';
    }
    getBaseDirectory(location: string, asset: string) {
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
    toAbsoluteUrl(value: string, href: string): string {
        value = value.replace(/\\/g, '/');
        let moveTo = '';
        if (value.charAt(0) === '/') {
            moveTo = '__serverroot__';
        }
        else if (value.startsWith('../')) {
            moveTo = '__serverroot__';
            value = this.resolvePath(value, href, false);
        }
        else if (value.startsWith('./')) {
            value = value.substring(2);
        }
        return moveTo + value;
    }
    toRelativeUrl(status: FileManager, file: RequestAsset, url: string) {
        let asset = status.assets.find(item => item.uri === url);
        let origin = file.uri!;
        if (!asset) {
            url = this.resolvePath(url, origin);
            if (url) {
                asset = status.assets.find(item => item.uri === url);
            }
        }
        if (asset?.uri) {
            const requestMain = status.requestMain;
            if (requestMain) {
                origin = this.resolvePath((file.moveTo === '__serverroot__' ? '/' : (file.rootDir || '')) + file.pathname + '/' + file.filename, requestMain.uri!);
            }
            const uri = asset.uri;
            const uriMatch = this.PATTERN_URL.exec(uri);
            const originMatch = this.PATTERN_URL.exec(origin);
            if (uriMatch && originMatch && uriMatch[1] === originMatch[1]) {
                const rootDir = file.rootDir || '';
                const baseDir = rootDir + file.pathname;
                if (asset.moveTo === '__serverroot__') {
                    if (file.moveTo === '__serverroot__') {
                        return asset.pathname + '/' + asset.filename;
                    }
                    else if (requestMain) {
                        const requestMatch = this.PATTERN_URL.exec(requestMain.uri!);
                        if (requestMatch && requestMatch[1] === originMatch[1]) {
                            const [originDir] = this.getBaseDirectory(baseDir + '/' + file.filename, requestMatch[2]);
                            return '../'.repeat(originDir.length - 1) + this.getFullUri(asset);
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
                    const [originDir, uriDir] = this.getBaseDirectory(originMatch[2], uriMatch[2]);
                    return '../'.repeat(originDir.length - 1) + uriDir.join('/');
                }
            }
        }
        return '';
    }
    getFullUri = (file: RequestAsset, filename?: string) => path.join(file.moveTo || '', file.pathname, filename || file.filename).replace(/\\/g, '/');
}();

const Compress = new class {
    removeFormat(file: RequestAsset, format: string) {
        const compress = file.compress;
        if (compress) {
            const index = compress.findIndex(value => value.format === format);
            if (index !== -1) {
                compress.splice(index, 1);
            }
        }
    }
    createGzipWriteStream(source: string, filename: string, level?: number) {
        const o = fs.createWriteStream(filename);
        fs.createReadStream(source)
            .pipe(zlib.createGzip({ level: level || GZIP_LEVEL }))
            .pipe(o);
        return o;
    }
    createBrotliWriteStream(source: string, filename: string, quality?: number, mimeType = '') {
        const o = fs.createWriteStream(filename);
        fs.createReadStream(source)
            .pipe(
                zlib.createBrotliCompress({
                    params: {
                        [zlib.constants.BROTLI_PARAM_MODE]: mimeType.includes('text/') ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
                        [zlib.constants.BROTLI_PARAM_QUALITY]: quality || BROTLI_QUALITY,
                        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: Node.getFileSize(source)
                    }
                })
            )
            .pipe(o);
        return o;
    }
    isJpeg(file: RequestAsset) {
        if (file.mimeType?.endsWith('image/jpeg')) {
            return true;
        }
        switch (path.extname(file.filename).toLowerCase()) {
            case '.jpg':
            case '.jpeg':
                return true;
        }
        return false;
    }
    getOutput(file: RequestAsset, level: number): CompressOutput {
        const compress = file.compress;
        const gz = this.getFormat(compress, 'gz');
        const br = this.getFormat(compress, 'br');
        const jpeg = this.isJpeg(file) && this.getFormat(compress, 'jpeg');
        return {
            gzip: gz ? gz.level : -1,
            brotli: br ? br.level : -1,
            jpeg: jpeg ? jpeg.level || level : -1
        };
    }
    getFormat = (compress: Undef<CompressionFormat[]>, format: string) => compress?.find(item => item.format === format);
    hasPng = (compress: Undef<CompressionFormat[]>) => TINIFY_API_KEY && this.getFormat(compress, 'png') !== undefined;
}();

class FileManager {
    public archiving = false;
    public delayed = 0;
    public files = new Set<string>();
    public filesToRemove = new Set<string>();
    public filesToCompare = new Map<RequestAsset, string[]>();
    public contentToAppend = new Map<string, string[]>();
    public readonly requestMain?: RequestAsset;

    constructor(
        public dirname: string,
        public assets: RequestAsset[],
        public external: Undef<External>)
    {
        this.requestMain = this.assets.find(item => item.requestMain);
    }

    add(value: string) {
        this.files.add(value.substring(this.dirname.length + 1));
    }
    delete(value: string) {
        this.files.delete(value.substring(this.dirname.length + 1));
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
    appendContent(file: RequestAsset, content: string) {
        const filepath = file.filepath || this.getFileOutput(file).filepath;
        if (filepath && file.bundleIndex) {
            const value = this.contentToAppend.get(filepath) || [];
            value.splice(file.bundleIndex - 1, 0, content);
            this.contentToAppend.set(filepath, value);
        }
    }
    compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void) {
        const { jpeg, gzip, brotli } = Compress.getOutput(file, JPEG_QUALITY);
        const resumeThread = () => {
            this.transformBuffer(assets, file, filepath, finalize);
            if (gzip !== -1) {
                ++this.delayed;
                const gz = `${filepath}.gz`;
                Compress.createGzipWriteStream(filepath, gz, gzip)
                    .on('finish', () => finalize(gz))
                    .on('error', err => {
                        Node.writeError(gz, err);
                        finalize('');
                    });
            }
            if (brotli !== -1 && Node.checkVersion(11, 7)) {
                ++this.delayed;
                const br = `${filepath}.br`;
                Compress.createBrotliWriteStream(filepath, br, brotli, file.mimeType)
                    .on('finish', () => finalize(br))
                    .on('error', err => {
                        Node.writeError(br, err);
                        finalize('');
                    });
            }
        };
        if (jpeg !== -1) {
            ++this.delayed;
            jimp.read(filepath)
                .then(image => {
                    image.quality(jpeg).write(filepath, err => {
                        if (err) {
                            Node.writeError(filepath, err);
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
        const { format, mimeType } = file;
        if (!mimeType) {
            return;
        }
        const writeTrailingContent = () => {
            if (file.trailingContent) {
                try {
                    fs.appendFileSync(filepath, Chrome.getTrailingContent(file));
                }
                catch (err) {
                    Node.writeError(filepath, err);
                }
            }
        };
        switch (mimeType) {
            case '@text/html':
            case '@application/xhtml+xml': {
                const getFileOuterHTML = (script: boolean, value: string) => script ? `<script type="text/javascript" src="${value}"></script>` : `<link rel="stylesheet" type="text/css" href="${value}" />`;
                const minifySpace = (value: string) => value.replace(/[\s\n]+/g, '');
                const baseUri = file.uri!;
                const saved = new Set<string>();
                let html = fs.readFileSync(filepath).toString('utf8');
                let source = html;
                let pattern = /(\s*)<(script|link|style).*?(\s+data-chrome-file="\s*(save|export)As:\s*((?:[^"]|\\")+)").*?\/?>(?:[\s\S]*?<\/\2>\n*)?/ig;
                let match: Null<RegExpExecArray>;
                while ((match = pattern.exec(html)) !== null) {
                    const segment = match[0];
                    const script = match[2].toLowerCase() === 'script';
                    const location = Express.toAbsoluteUrl(match[5].split('::')[0].trim(), baseUri);
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
                        source = source.replace(segment, match[1] + getFileOuterHTML(script, location));
                        saved.add(location);
                    }
                }
                pattern = /(\s*)<(script|style).*?>([\s\S]*?)<\/\2>\n*/ig;
                for (const item of assets) {
                    const { bundleIndex, trailingContent } = item;
                    if (bundleIndex !== undefined) {
                        let outerHTML = item.outerHTML;
                        if (outerHTML) {
                            const length = source.length;
                            let replaceWith = '';
                            if (bundleIndex === 0) {
                                replaceWith = getFileOuterHTML(item.mimeType === 'text/javascript', Express.getFullUri(item));
                                source = source.replace(outerHTML, replaceWith);
                            }
                            else {
                                source = source.replace(new RegExp(`\\s*${outerHTML}\\n*`), '');
                            }
                            if (source.length === length) {
                                pattern.lastIndex = 0;
                                const content = minifySpace(item.content || '');
                                outerHTML = minifySpace(outerHTML);
                                while ((match = pattern.exec(source)) !== null) {
                                    if (outerHTML === minifySpace(match[0]) || content && content === minifySpace(match[3])) {
                                        source = source.replace(match[0], (replaceWith ? match[1] : '') + replaceWith);
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
                        html = source;
                        while ((match = pattern.exec(html)) !== null) {
                            const value = minifySpace(match[3]);
                            if (content.includes(value)) {
                                source = source.replace(match[0], '');
                            }
                        }
                    }
                }
                html = source;
                for (const item of assets) {
                    if (item.base64) {
                        source = Chrome.replacePathName(source, item.base64.replace(/\+/g, '\\+'), Express.getFullUri(item), true);
                        continue;
                    }
                    else if (item === file || item.content || !item.uri) {
                        continue;
                    }
                    const value = Express.getFullUri(item);
                    source = Chrome.replacePathName(source, item.uri, value);
                    if (item.rootDir || Express.fromSameOrigin(baseUri, item.uri)) {
                        pattern = new RegExp(`((?:\\.\\.)?(?:[\\\\/]\\.\\.|\\.\\.[\\\\/]|[\\\\/])*)?(${path.join(item.pathname, item.filename).replace(/[\\/]/g, '[\\\\/]')})`, 'g');
                        while ((match = pattern.exec(html)) !== null) {
                            const pathname = match[0];
                            if (pathname !== value && item.uri === Express.resolvePath(pathname, baseUri)) {
                                source = source.replace(pathname, value);
                            }
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
                let output = this.transformCss(file, filepath);
                if (format && !output) {
                    output = fs.readFileSync(filepath).toString('utf8');
                    output = Chrome.minifyCss(format, output) || output;
                }
                if (file.trailingContent) {
                    let result = Chrome.getTrailingContent(file, mimeType, format);
                    result = this.transformCss(file, undefined, result);
                    if (result) {
                        output += result;
                    }
                }
                fs.writeFileSync(filepath, output);
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
            case 'text/css': {
                if (format) {
                    let output = Chrome.minifyCss(format, fs.readFileSync(filepath).toString('utf8'));
                    if (output) {
                        if (file.trailingContent) {
                            output += Chrome.getTrailingContent(file, mimeType, format);
                        }
                        fs.writeFileSync(filepath, output);
                        break;
                    }
                }
                writeTrailingContent();
                break;
            }
            case 'text/javascript': {
                if (format) {
                    let output = Chrome.minifyJs(format, fs.readFileSync(filepath).toString('utf8'));
                    if (output) {
                        if (file.trailingContent) {
                            output += Chrome.getTrailingContent(file, mimeType, format);
                        }
                        fs.writeFileSync(filepath, output);
                        break;
                    }
                }
                writeTrailingContent();
                break;
            }
            default:
                if (mimeType.includes('image/')) {
                    const replaceExtension = (value: string, ext: string) => {
                        const index = value.lastIndexOf('.');
                        return value.substring(0, index !== -1 ? index : value.length) + '.' + ext;
                    };
                    const afterConvert = (transformed: string, command: string) => {
                        switch (command.charAt(0)) {
                            case '@':
                                this.replaceFileOutput(file, transformed);
                                break;
                            case '%':
                                if (this.filesToCompare.has(file)) {
                                    this.filesToCompare.get(file)!.push(transformed);
                                }
                                else {
                                    this.filesToCompare.set(file, [transformed]);
                                }
                                break;
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
                        if (/^[@%]?png/.test(value)) {
                            if (!mimeType.endsWith('/png')) {
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const png = replaceExtension(filepath, 'png');
                                        image.write(png, err => {
                                            if (err) {
                                                Node.writeError(png, err);
                                            }
                                            else {
                                                afterConvert(png, value);
                                                if (Compress.hasPng(file.compress)) {
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
                            }
                        }
                        else if (/^[@%]?jpeg/.test(value)) {
                            if (!mimeType.endsWith('/jpeg')) {
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const jpg = replaceExtension(filepath, 'jpg');
                                        image.quality(JPEG_QUALITY).write(jpg, err => {
                                            if (err) {
                                                Node.writeError(jpg, err);
                                            }
                                            else {
                                                afterConvert(jpg, value);
                                                if (Compress.hasPng(file.compress)) {
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
                            }
                        }
                        else if (/^[@%]?bmp/.test(value)) {
                            if (!mimeType.endsWith('/bmp')) {
                                ++this.delayed;
                                jimp.read(filepath)
                                    .then(image => {
                                        const bmp = replaceExtension(filepath, 'bmp');
                                        image.write(bmp, err => {
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
                            }
                        }
                    });
                }
                break;
        }
    }
    transformCss(file: RequestAsset, filepath: Undef<string>, content?: string) {
        const baseUrl = file.uri!;
        if (this.requestMain && Express.fromSameOrigin(this.requestMain.uri!, baseUrl)) {
            const assets = this.assets;
            if (filepath) {
                content = fs.readFileSync(filepath).toString('utf8');
            }
            else if (!content) {
                return '';
            }
            for (const item of assets) {
                if (item.base64 && item.uri) {
                    const url = Express.toRelativeUrl(this, file, item.uri);
                    if (url) {
                        content = Chrome.replacePathName(content, item.base64.replace(/\+/g, '\\+'), url, true);
                    }
                }
            }
            let source = content;
            const pattern = /[uU][rR][lL]\(\s*(["'])?\s*((?:[^"')]|\\"|\\')+)\s*\1?\s*\)/g;
            let match: Null<RegExpExecArray>;
            while ((match = pattern.exec(content)) !== null) {
                let url = match[2];
                if (!Node.isFileURI(url) || Express.fromSameOrigin(baseUrl, url)) {
                    url = Express.toRelativeUrl(this, file, url);
                    if (url) {
                        source = source.replace(match[0], `url(${url})`);
                    }
                    else {
                        url = Express.resolvePath(match[2], baseUrl);
                        const asset = assets.find(item => item.uri === url);
                        if (asset) {
                            source = source.replace(match[0], `url(${url})`);
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
                source = Chrome.minifyCss(file.format, source) || source;
            }
            file.mimeType = '&text/css';
            return source;
        }
        return '';
    }
    writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void) {
        if (Compress.hasPng(file.compress)) {
            try {
                tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
                    if (!err) {
                        fs.writeFileSync(filepath, resultData);
                    }
                    if (Compress.isJpeg(file)) {
                        Compress.removeFormat(file, 'jpeg');
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
                                let content = response.body as string;
                                let source: Undef<string>;
                                if (queue.mimeType === '@text/css') {
                                    if (queue.trailingContent) {
                                        content += Chrome.getTrailingContent(queue);
                                    }
                                    source = this.transformCss(queue, undefined, content);
                                    if (source) {
                                        queue.trailingContent = undefined;
                                    }
                                }
                                if (!source) {
                                    const { format, mimeType } = queue;
                                    source = format && mimeType && Chrome.formatContent(content, mimeType, format);
                                }
                                this.appendContent(queue, source || content);
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
        for (const file of assets) {
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
                const { format, mimeType } = file;
                if (format && mimeType) {
                    file.content = Chrome.formatContent(file.content, mimeType, format);
                }
                if (file.trailingContent) {
                    file.content += Chrome.getTrailingContent(file, mimeType, format);
                }
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
                            if (UNC_READ) {
                                if (checkQueue(file, filepath)) {
                                    continue;
                                }
                                copyUri(uri, filepath);
                            }
                        }
                        else if (DISK_READ && path.isAbsolute(uri)) {
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
            let minSize = Node.getFileSize(minFile);
            for (const filepath of output) {
                const size = Node.getFileSize(filepath);
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
        return promisify(() => {
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
        const status = new FileManager(dirname, <RequestAsset[]> req.body, EXTERNAL);
        let cleared = false;
        const finalize = (filepath?: string) => {
            if (status.delayed === Infinity) {
                return;
            }
            if (filepath) {
                status.add(filepath);
            }
            if (!filepath || --status.delayed === 0 && cleared) {
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
    const status = new FileManager(dirname, <RequestAsset[]> req.body, EXTERNAL);
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
        const archive = archiver(format, { zlib: { level: GZIP_LEVEL } });
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
                        const gz_bytes = Node.getFileSize(gz);
                        if (!copy_to) {
                            response.zipname = gz;
                            response.bytes = gz_bytes;
                        }
                        res.json(response);
                        console.log(`WRITE: ${gz} (${gz_bytes} bytes)`);
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
            console.log(`WRITE: ${zipname} (${bytes} bytes)`);
        });
        archive.pipe(output);
        const finalize = (filepath?: string) => {
            if (status.delayed === Infinity) {
                return;
            }
            if (filepath) {
                status.add(filepath);
            }
            if (!filepath || --status.delayed === 0 && cleared) {
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
                        if (!UNC_READ) {
                            res.json({ application: 'OPTION: --unc-read', system: 'Reading from UNC shares is not enabled.' });
                            return;
                        }
                    }
                    else if (!DISK_READ && path.isAbsolute(append_to)) {
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

app.listen(PORT, () => console.log(`${ENV.toUpperCase()}: Express server listening on port ${PORT}\n`));