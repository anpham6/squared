import { CompressionFormat, Environment, External, FormattableContent, RequestAsset, ResultOfFileAction, Routing, Settings } from './@types/node';

import path = require('path');
import util = require('util');
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
import terser = require('terser');
import tinify = require('tinify');

let THREAD_COUNT = 0;

interface AsyncStatus {
    archiving: boolean;
    delayed: number;
    dirname: string;
    filesExported: Set<string>;
    filesToRemove: Set<string>;
    filesToCompare: Map<RequestAsset, string[]>;
    contentToAppend: Map<string, string[]>;
}

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

const [NODE_VERSION_MAJOR, NODE_VERSION_MINOR, NODE_VERSION_PATCH] = process.version.substring(1).split('.').map(value => parseInt(value));
const SEPARATOR = path.sep;
const REGEX_URL = /^([A-Za-z]+:\/\/[A-Za-z\d.-]+(?::\d+)?)(\/.*)/;

function getFileOutput(file: RequestAsset, dirname: string) {
    const pathname = path.join(dirname, file.moveTo || '', file.pathname);
    const filepath = path.join(pathname, file.filename);
    file.filepath = filepath;
    return { pathname, filepath };
}

function getCompressOutput(file: RequestAsset): CompressOutput {
    const compress = file.compress;
    const gz = getCompressFormat(compress, 'gz');
    const br = getCompressFormat(compress, 'br');
    const jpeg = isJPEG(file) && getCompressFormat(compress, 'jpeg');
    return {
        gzip: gz ? gz.level : -1,
        brotli: br ? br.level : -1,
        jpeg: jpeg ? jpeg.level || JPEG_QUALITY : -1
    };
}

function createGzipWriteStream(source: string, filename: string, level?: number) {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(zlib.createGzip({ level: level || GZIP_LEVEL }))
        .pipe(o);
    return o;
}

function createBrotliWriteStream(source: string, filename: string, quality?: number, mimeType = '') {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(
            zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_MODE]: mimeType.includes('text/') ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
                    [zlib.constants.BROTLI_PARAM_QUALITY]: quality || BROTLI_QUALITY,
                    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: getFileSize(source)
                }
            })
        )
        .pipe(o);
    return o;
}

function checkVersion(major: number, minor: number, patch = 0) {
    if (NODE_VERSION_MAJOR < major) {
        return false;
    }
    else if (NODE_VERSION_MAJOR === major) {
        if (NODE_VERSION_MINOR < minor) {
            return false;
        }
        else if (NODE_VERSION_MINOR === minor) {
            return NODE_VERSION_PATCH >= patch;
        }
        return true;
    }
    return true;
}

function getUri(file: RequestAsset, uri: string) {
    const location = appendSeparator(file.pathname, file.filename, getSeparator(uri));
    return [(file.moveTo ? path.join(file.moveTo, location) : location).replace(/\\/g, '/'), location];
}

function convertAssetUrls(assets: RequestAsset[], file: RequestAsset, html: string) {
    for (const item of assets) {
        if (item === file) {
            continue;
        }
        const { uri, rootDir } = item;
        if (uri) {
            const [value, location] = getUri(item, uri);
            if (rootDir) {
                html = replacePathName(html, rootDir + location, value);
            }
            else {
                html = replacePathName(html, uri, value);
                html = replacePathName(html, getSeparator(uri) + location, value);
            }
        }
    }
    return html;
}

function minifyHtml(format: string, value: string) {
    const html = EXTERNAL?.html;
    if (html) {
        let [module, options] = findExternalPlugin(html, format);
        if (!module) {
            switch (format) {
                case 'beautify':
                    module = 'js_beautify';
                    options = <HTMLBeautifyOptions> {
                        wrap_line_length: 0
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
                case 'html_minifier':
                    return html_minifier.minify(value, options);
                case 'js_beautify':
                    return js_beautify.html_beautify(value, options);
            }
        }
        catch (err) {
            writeError(`External: ${module}`, err);
        }
    }
    return '';
}

function minifyCss(format: string, value: string) {
    const css = EXTERNAL?.css;
    if (css) {
        let [module, options] = findExternalPlugin(css, format);
        if (!module) {
            switch (format) {
                case 'beautify':
                    module = 'clean_css';
                    options = <clean_css.OptionsOutput> { level: 0, format: 'beautify' };
                    break;
                case 'minify':
                    module = 'clean_css';
                    options = <clean_css.OptionsOutput> { level: 1 };
                    break;
            }
        }
        try {
            switch (module) {
                case 'clean_css':
                    return new clean_css(options).minify(value).styles;
                case 'js_beautify':
                    return js_beautify.css_beautify(value, options);
            }
        }
        catch (err) {
            writeError(`External: ${module}`, err);
        }
    }
    return '';
}

function minifyJs(format: string, value: string) {
    const js = EXTERNAL?.js;
    if (js) {
        let [module, options] = findExternalPlugin(js, format);
        if (!module) {
            switch (format) {
                case 'beautify':
                    module = 'js_beautify';
                    options = <JsBeautifyOptions> {
                        break_chained_methods: true,
                        keep_array_indentation: true
                    };
                    break;
                case 'minify':
                    module = 'terser';
                    options = <terser.MinifyOptions> {
                        keep_classnames: true
                    };
                    break;
            }
        }
        try {
            switch (module) {
                case 'terser':
                    return terser.minify(value, options).code;
                case 'js_beautify':
                    return js_beautify.js_beautify(value, options);
            }
        }
        catch (err) {
            writeError(`External: ${module}`, err);
        }
    }
    return '';
}

function findExternalPlugin(data: ObjectMap<StandardMap>, format: string): [string, {}] {
    for (const name in data) {
        const plugin = data[name];
        for (const custom in plugin) {
            if (custom === format) {
                return [name, plugin[custom]];
            }
        }
    }
    return ['', {}];
}

function queueContentToAppend(status: AsyncStatus, filepath: string, content: string, trailingContent?: FormattableContent[], mimeType?: string, format?: string) {
    if (trailingContent) {
        content += getTrailingContent(trailingContent, mimeType, format);
    }
    const value = status.contentToAppend.get(filepath) || [];
    value.push(content);
    status.contentToAppend.set(filepath, value);
}

function writeTrailingContentSync(file: RequestAsset, filepath: string) {
    if (file.trailingContent) {
        try {
            fs.appendFileSync(filepath, getTrailingContent(file.trailingContent, file.mimeType, file.format));
        }
        catch (err) {
            writeError(filepath, err);
        }
    }
}

function getBaseDirectory(location: string, asset: string) {
    const locationDir = location.split('/');
    const assetDir = asset.split('/');
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

function getRelativeUrl(file: RequestAsset, url: string, assets: RequestAsset[], relocate?: string) {
    const origin = file.uri;
    if (origin) {
        let asset = assets.find(item => item.uri === url);
        if (asset) {
            if (relocate) {
                const [relocateMatch, originMatch] = [REGEX_URL.exec(relocate), REGEX_URL.exec(origin)];
                if (relocateMatch && originMatch && relocateMatch[1] === originMatch[1]) {
                    const [relocateDir] = getBaseDirectory(relocateMatch[2], originMatch[2]);
                    return '../'.repeat(relocateDir.length - 1) + getUri(asset, url)[0];
                }
            }
        }
        else {
            url = parseRelativeUrl(url, origin);
            if (url) {
                asset = assets.find(item => item.uri === url);
            }
            if (asset?.uri) {
                const uri = asset.uri;
                const uriMatch = REGEX_URL.exec(uri);
                const originMatch = REGEX_URL.exec(origin);
                if (uriMatch && originMatch && uriMatch[1] === originMatch[1]) {
                    if (relocate) {
                        if (path.dirname(relocate) === path.dirname(uri)) {
                            return asset.filename;
                        }
                        const relocateMatch = REGEX_URL.exec(relocate);
                        if (relocateMatch) {
                            if (asset.moveTo === '__serverroot__') {
                                const [relocateDir] = getBaseDirectory(relocateMatch[2], originMatch[2]);
                                return '../'.repeat(relocateDir.length - 1) + getUri(asset, url)[0];
                            }
                            else {
                                const [relocateDir, uriDir] = getBaseDirectory(relocateMatch[2], uriMatch[2]);
                                return '../'.repeat(relocateDir.length) + '/' + uriDir.join('/') + asset.filename;
                            }
                        }
                    }
                    else {
                        const rootDir = file.rootDir || '';
                        if (asset.moveTo === '__serverroot__') {
                            if (file.moveTo === '__serverroot__') {
                                return asset.pathname + '/' + asset.filename;
                            }
                            else {
                                const [originDir] = getBaseDirectory(originMatch[2], uriMatch[2]);
                                originDir.pop();
                                const rootParts = rootDir.split('/').filter(value => !!value);
                                for (let i = 0; i < rootParts.length; ++i) {
                                    if (rootParts[i] === originDir[i]) {
                                        originDir[i] = '';
                                    }
                                    else {
                                        break;
                                    }
                                }
                                return '../'.repeat(originDir.filter(value => !!value).length) + getUri(asset, url)[0];
                            }
                        }
                        else if (rootDir + file.pathname === asset.rootDir + asset.pathname) {
                            return asset.filename;
                        }
                        else if (rootDir === asset.rootDir) {
                            return asset.pathname + '/' + asset.filename;
                        }
                    }
                }
            }
        }
    }
    return '';
}

function transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (filepath?: string) => void) {
    const { format, mimeType } = file;
    if (!mimeType) {
        return;
    }
    switch (mimeType) {
        case '@text/html':
        case '@application/xhtml+xml': {
            let html = fs.readFileSync(filepath).toString('utf8');
            let source = html;
            const saved = new Set<string>();
            let pattern = /\s*<(script|link).*?(\s+data-chrome-file=(["'])\s*saveAs:([^"']+)\3).*?\/?>(?:[\s\S]*?<\/\1>\n*)?/ig;
            let match: Null<RegExpExecArray>;
            while ((match = pattern.exec(html)) !== null) {
                const value = match[0];
                const script = match[1].toLowerCase() === 'script';
                const saveAs = match[4].split('::')[0].trim();
                const [root, filename] = getSaveLocation(saveAs);
                const location = root + filename;
                if (saved.has(location)) {
                    source = source.replace(value, '');
                }
                else {
                    const content = value.replace(match[2], '');
                    const src = new RegExp(`\\s+${script ? 'src' : 'href'}=(["']).+\\1`, 'i').exec(content);
                    if (src) {
                        source = source.replace(value, content.replace(src[0], `${script ? ' src' : ' href'}="${location}"`));
                        saved.add(location);
                    }
                }
            }
            html = source;
            pattern = /(\s*)<(script|style).*?(\s+data-chrome-file=(["'])\s*exportAs:([^"']+)\4).*?>([\s\S]*?)<\/\2>\n*/ig;
            while ((match = pattern.exec(html)) !== null) {
                let content = match[6];
                if (!content) {
                    continue;
                }
                const script = match[2].toLowerCase() === 'script';
                const [exportAs, transform] = match[5].split('::').map(value => value.trim());
                const [root, filename] = getSaveLocation(exportAs);
                const location = root + filename;
                const pathname = path.join(status.dirname, location);
                if (script) {
                    if (transform) {
                        content = minifyJs(transform, content) || content;
                    }
                }
                else {
                    const levels = filename.split('/').length - 1;
                    if (levels > 0) {
                        const baseUrl = parseRelativeUrl(exportAs, file.uri!);
                        const urlPattern = /url\(\s*(["'])?(.+?)\1?\s*\)/g;
                        let urlMatch: Null<RegExpExecArray>;
                        while ((urlMatch = urlPattern.exec(match[6])) !== null) {
                            const url = getRelativeUrl(file, urlMatch[2].trim(), assets, baseUrl);
                            if (url) {
                                content = content.replace(urlMatch[0], `url(${url})`);
                            }
                        }
                    }
                    if (transform) {
                        content = minifyCss(transform, content) || content;
                    }
                }
                const asset = assets.find(item => (item.moveTo ? item.moveTo + '/' : '') + item.pathname + '/' + item.filename === location);
                let appending = true;
                if (asset) {
                    queueContentToAppend(status, asset.filepath!, content);
                }
                else {
                    appending = fs.existsSync(pathname);
                    if (appending) {
                        fs.appendFileSync(pathname, '\n' + content);
                    }
                    else {
                        fs.writeFileSync(pathname, content);
                        if (!script) {
                            status.filesExported.add(pathname);
                        }
                    }
                }
                source = source.replace(match[0], appending ? '' : match[1] + getFileOuterHTML(script, location));
            }
            source = convertAssetUrls(assets, file, source);
            pattern = /(\s*)<(script|style).*?>([\s\S]*?)<\/\2>\n*/ig;
            for (const item of assets) {
                const { bundleMain, trailingContent } = item;
                if (typeof bundleMain === 'boolean') {
                    let outerHTML = item.outerHTML;
                    if (outerHTML) {
                        const length = source.length;
                        let replacement = '';
                        if (bundleMain) {
                            const location = getUri(item, item.uri || '/')[0];
                            replacement = getFileOuterHTML(item.mimeType === 'text/javascript', location);
                            source = source.replace(outerHTML, replacement);
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
                                    source = source.replace(match[0], (replacement ? match[1] : '') + replacement);
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
                    const output = source;
                    while ((match = pattern.exec(output)) !== null) {
                        const value = minifySpace(match[3]);
                        if (content.includes(value)) {
                            source = source.replace(match[0], '');
                        }
                    }
                }
            }
            source = source
                .replace(/\s*<(script|link|style).+?data-chrome-file=(["'])exclude\2.*?>[\s\S]*?<\/\1>\n*/ig, '')
                .replace(/\s*<(script|link).+?data-chrome-file=(["'])exclude\2.*?\/?>\n*/ig, '')
                .replace(/\s+data-(?:use|chrome-[\w-]+)=(["']).+?\1/g, '');
            fs.writeFileSync(filepath, format && minifyHtml(format, source) || source);
            break;
        }
        case '@text/css': {
            const href = file.uri;
            if (href) {
                const html = fs.readFileSync(filepath).toString('utf8');
                let source = html;
                const pattern = /[uU][rR][lL]\(\s*(["'])?\s*(.+)\s*\1?\s*\)/g;
                let match: Null<RegExpMatchArray>;
                while ((match = pattern.exec(html)) !== null) {
                    let url = match[2];
                    if (!isFileURI(url)) {
                        url = getRelativeUrl(file, url, assets);
                        if (url) {
                            source = source.replace(match[0], `url(${url})`);
                        }
                    }
                }
                if (format) {
                    source = minifyCss(format, source) || source;
                }
                fs.writeFileSync(filepath, convertAssetUrls(assets, file, source));
            }
            break;
        }
        case 'text/html':
        case 'application/xhtml+xml': {
            if (format) {
                const output = minifyHtml(format, fs.readFileSync(filepath).toString('utf8'));
                if (output) {
                    fs.writeFileSync(filepath, output);
                }
            }
            break;
        }
        case 'text/javascript': {
            if (format) {
                const output = minifyJs(format, fs.readFileSync(filepath).toString('utf8'));
                if (output) {
                    fs.writeFileSync(filepath, output);
                }
            }
            writeTrailingContentSync(file, filepath);
            break;
        }
        case 'text/css': {
            if (format) {
                const output = minifyCss(format, fs.readFileSync(filepath).toString('utf8'));
                if (output) {
                    fs.writeFileSync(filepath, output);
                }
            }
            writeTrailingContentSync(file, filepath);
            break;
        }
        default:
            if (mimeType.includes('image/')) {
                const afterConvert = (fileoutput: string, command: string) => {
                    switch (command.charAt(0)) {
                        case '@':
                            file.originalName = path.basename(filepath);
                            file.filename = path.basename(fileoutput);
                            status.filesToRemove.add(filepath);
                            break;
                        case '%':
                            if (status.filesToCompare.has(file)) {
                                status.filesToCompare.get(file)!.push(fileoutput);
                            }
                            else {
                                status.filesToCompare.set(file, [fileoutput]);
                            }
                            break;
                    }
                };
                const convert = mimeType.split(':');
                convert.pop();
                convert.forEach(value => {
                    if (/^[@%]?png/.test(value)) {
                        if (!mimeType.endsWith('/png')) {
                            ++status.delayed;
                            jimp.read(filepath)
                                .then(image => {
                                    const png = replaceExtension(filepath, 'png');
                                    image.write(png, err => {
                                        if (err) {
                                            writeError(png, err);
                                        }
                                        else {
                                            afterConvert(png, value);
                                            if (hasCompressPng(file.compress)) {
                                                compressImage(png, finalize);
                                                return;
                                            }
                                        }
                                        finalize(png);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    writeError(filepath, err);
                                });
                        }
                    }
                    else if (/^[@%]?jpeg/.test(value)) {
                        if (!mimeType.endsWith('/jpeg')) {
                            ++status.delayed;
                            jimp.read(filepath)
                                .then(image => {
                                    const jpg = replaceExtension(filepath, 'jpg');
                                    image.quality(JPEG_QUALITY).write(jpg, err => {
                                        if (err) {
                                            writeError(jpg, err);
                                        }
                                        else {
                                            afterConvert(jpg, value);
                                            if (hasCompressPng(file.compress)) {
                                                compressImage(jpg, finalize);
                                                return;
                                            }
                                        }
                                        finalize(jpg);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    writeError(filepath, err);
                                });
                        }
                    }
                    else if (/^[@%]?bmp/.test(value)) {
                        if (!mimeType.endsWith('/bmp')) {
                            ++status.delayed;
                            jimp.read(filepath)
                                .then(image => {
                                    const bmp = replaceExtension(filepath, 'bmp');
                                    image.write(bmp, err => {
                                        if (err) {
                                            writeError(bmp, err);
                                        }
                                        else {
                                            afterConvert(bmp, value);
                                        }
                                        finalize(bmp);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    writeError(filepath, err);
                                });
                        }
                    }
                });
            }
            break;
    }
}

function writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (filepath?: string) => void) {
    if (hasCompressPng(file.compress)) {
        try {
            tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
                if (!err) {
                    fs.writeFileSync(filepath, resultData);
                }
                if (isJPEG(file)) {
                    removeCompressionFormat(file, 'jpeg');
                }
                compressFile(assets, file, filepath, status, finalize);
            });
        }
        catch (err) {
            compressFile(assets, file, filepath, status, finalize);
            writeError(filepath, err);
        }
    }
    else {
        compressFile(assets, file, filepath, status, finalize);
    }
}

function compressImage(filepath: string, finalize: (filepath?: string) => void) {
    try {
        tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
            if (!err) {
                fs.writeFileSync(filepath, resultData);
            }
            finalize(filepath);
        });
    }
    catch (err) {
        finalize('');
        writeError(filepath, err);
    }
}

function compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (filepath?: string) => void) {
    const { jpeg, gzip, brotli } = getCompressOutput(file);
    const resumeThread = () => {
        transformBuffer(assets, file, filepath, status, finalize);
        if (gzip !== -1) {
            ++status.delayed;
            const gz = `${filepath}.gz`;
            createGzipWriteStream(filepath, gz, gzip)
                .on('finish', () => finalize(gz))
                .on('error', err => {
                    writeError(gz, err);
                    finalize('');
                });
        }
        if (brotli !== -1 && checkVersion(11, 7)) {
            ++status.delayed;
            const br = `${filepath}.br`;
            createBrotliWriteStream(filepath, br, brotli, file.mimeType)
                .on('finish', () => finalize(br))
                .on('error', err => {
                    writeError(br, err);
                    finalize('');
                });
        }
    };
    if (jpeg !== -1) {
        ++status.delayed;
        jimp.read(filepath)
            .then(image => {
                image.quality(jpeg).write(filepath, err => {
                    if (err) {
                        writeError(filepath, err);
                    }
                    finalize('');
                    resumeThread();
                });
            })
            .catch(err => {
                writeError(filepath, err);
                finalize('');
                resumeThread();
            });
    }
    else {
        resumeThread();
    }
}

function formatContent(value: string, mimeType: string, format: string) {
    switch (mimeType) {
        case 'text/html':
        case 'application/xhtml+xml':
            return minifyHtml(format, value) || value;
        case 'text/css':
            return minifyCss(format, value) || value;
        case 'text/javascript':
            return minifyJs(format, value) || value;
    }
    return value;
}

function getTrailingContent(trailingContent: FormattableContent[], mimeType?: string, format?: string) {
    let result = '';
    for (const item of trailingContent) {
        const formatter = item.format || format;
        if (mimeType && formatter) {
            result += '\n' + formatContent(item.value, mimeType, formatter);
        }
        else {
            result += '\n' + item.value;
        }
    }
    return result;
}

function processAssets(dirname: string, assets: RequestAsset[], status: AsyncStatus, finalize: (filepath?: string) => void, empty?: boolean) {
    const emptyDir = {};
    const notFound: ObjectMap<boolean> = {};
    const processing: ObjectMap<RequestAsset[]> = {};
    const appending: ObjectMap<RequestAsset[]> = {};
    const completed: string[] = [];
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
        writeError(uri, message);
        delete processing[filepath];
    };
    const processQueue = (file: RequestAsset, filepath: string, original?: RequestAsset) => {
        if (file.append) {
            const queue = appending[filepath]?.shift();
            if (queue) {
                const uri = queue.uri;
                if (!uri) {
                    processQueue(queue, filepath, original || file);
                    return;
                }
                request(uri, (err, response) => {
                    if (err) {
                        notFound[uri] = true;
                        writeError(uri, err);
                    }
                    else {
                        const statusCode = response.statusCode;
                        if (statusCode >= 300) {
                            notFound[uri] = true;
                            writeError(uri, statusCode + ' ' + response.statusMessage);
                        }
                        else {
                            const { format, mimeType } = queue;
                            queueContentToAppend(status, filepath, format && mimeType && formatContent(response.body, mimeType, format) || response.body, queue.trailingContent, mimeType, format);
                        }
                    }
                    processQueue(queue, filepath, original || file);
                });
                return;
            }
        }
        completed.push(filepath);
        for (const item of (processing[filepath] || [original || file])) {
            writeBuffer(assets, item, filepath, status, finalize);
            finalize(filepath);
        }
        delete processing[filepath];
    };
    for (const file of assets) {
        const { pathname, filepath } = getFileOutput(file, dirname);
        if (!emptyDir[pathname]) {
            if (empty) {
                try {
                    fs.emptyDirSync(pathname);
                }
                catch (err) {
                    writeError(pathname, err);
                }
            }
            if (!fs.existsSync(pathname)) {
                fs.mkdirpSync(pathname);
            }
            emptyDir[pathname] = true;
        }
        const checkQueue = () => {
            if (file.append) {
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
                writeBuffer(assets, file, filepath, status, finalize);
                finalize('');
                return true;
            }
            else {
                const queue = processing[filepath];
                if (queue) {
                    ++status.delayed;
                    queue.push(file);
                    return true;
                }
                else {
                    processing[filepath] = [file];
                    return false;
                }
            }
        };
        if (file.content) {
            const { format, mimeType, trailingContent } = file;
            if (format && mimeType) {
                file.content = formatContent(file.content, mimeType, format);
            }
            if (trailingContent) {
                file.content += getTrailingContent(trailingContent, mimeType, format);
            }
            if (file.append && file.bundleMain) {
                appending[filepath] = [];
            }
            ++status.delayed;
            fs.writeFile(
                filepath,
                file.content,
                'utf8',
                err => {
                    if (!err) {
                        writeBuffer(assets, file, filepath, status, finalize);
                    }
                    finalize(filepath);
                }
            );
        }
        else if (file.base64) {
            ++status.delayed;
            fs.writeFile(
                filepath,
                file.base64,
                'base64',
                err => {
                    if (!err) {
                        writeBuffer(assets, file, filepath, status, finalize);
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
                if (isFileURI(uri)) {
                    if (checkQueue()) {
                        continue;
                    }
                    const stream = fs.createWriteStream(filepath);
                    stream.on('finish', () => {
                        if (!notFound[uri]) {
                            processQueue(file, filepath);
                        }
                    });
                    ++status.delayed;
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
                        ++status.delayed;
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
                    if (isFileUNC(uri)) {
                        if (UNC_READ) {
                            if (checkQueue()) {
                                continue;
                            }
                            copyUri(uri, filepath);
                        }
                    }
                    else if (DISK_READ && path.isAbsolute(uri)) {
                        if (checkQueue()) {
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

function replaceExtension(value: string, ext: string) {
    const index = value.lastIndexOf('.');
    return value.substring(0, index !== -1 ? index : value.length) + '.' + ext;
}

function isJPEG(file: RequestAsset) {
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

function removeCompressionFormat(file: RequestAsset, format: string) {
    const compress = file.compress;
    if (compress) {
        const index = compress.findIndex(value => value.format === format);
        if (index !== -1) {
            compress.splice(index, 1);
        }
    }
}

function finalizeAssetsAsync(dirname: string, assets: RequestAsset[], status: AsyncStatus, files: Set<string>) {
    const filesToRemove = status.filesToRemove;
    for (const [file, output] of status.filesToCompare) {
        const originalPath = file.filepath!;
        let minFile = originalPath;
        let minSize = getFileSize(minFile);
        for (const filepath of output) {
            const size = getFileSize(filepath);
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
            file.originalName = path.basename(originalPath);
            file.filename = path.basename(minFile);
        }
    }
    for (const value of filesToRemove) {
        try {
            fs.unlinkSync(value);
            files.delete(value.substring(dirname.length + 1));
        }
        catch (err) {
            writeError(value, err);
        }
    }
    for (const [filepath, content] of status.contentToAppend.entries()) {
        if (content.length) {
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, content.shift());
            }
            for (const value of content) {
                fs.appendFileSync(filepath, '\n' + value);
            }
        }
    }
    const replaced = assets.filter(file => file.originalName);
    if (replaced.length) {
        for (const item of assets) {
            switch (item.mimeType) {
                case '@text/html':
                case '@application/xhtml+xml':
                case '@text/css':
                    status.filesExported.add(item.filepath!);
                    break;
            }
        }
        for (const filepath of status.filesExported) {
            fs.readFile(filepath, (err, data) => {
                if (!err) {
                    let html = data.toString('utf-8');
                    let valid = false;
                    for (const item of replaced) {
                        const { pathname, originalName } = item;
                        try {
                            html = html.replace(new RegExp(pathname + getSeparator(pathname) + originalName, 'g'), pathname + '/' + item.filename);
                            valid = true;
                        }
                        catch (error) {
                            writeError(originalName!, error);
                        }
                    }
                    if (valid) {
                        fs.writeFileSync(filepath, html);
                    }
                }
            });
        }
    }
}

function replacePathName(source: string, segment: string, value: string) {
    let result = source;
    let pattern = new RegExp(`([sS][rR][cC]|[hH][rR][eE][fF])=(["'])\\s*${segment}\\s*\\2`, 'g');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
        result = result.replace(match[0], match[1].toLowerCase() + `="${value}"`);
    }
    pattern = new RegExp(`[uU][rR][lL]\\(\\s*(["'])?\\s*${segment}\\s*\\1?\\s*\\)`, 'g');
    while ((match = pattern.exec(source)) !== null) {
        result = result.replace(match[0], `url(${value})`);
    }
    return result;
}

function parseRelativeUrl(value: string, href: string) {
    const match = REGEX_URL.exec(href);
    if (match) {
        const origin = match[1];
        const pathname = match[2].split('/');
        pathname.pop();
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

function checkPermissions(res: express.Response<any>, dirname: string) {
    if (isDirectoryUNC(dirname)) {
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

const minifySpace = (value: string) => value.replace(/[\s\n]+/g, '');
const writeError = (description: string, message: any) => console.log(`FAIL: ${description} (${message})`);
const appendSeparator = (leading: string, trailing: string, separator: string) => leading + (!leading || leading.endsWith(separator) || trailing.startsWith(separator) ? '' : separator) + trailing;
const getSeparator = (uri: string) => uri.includes('\\') ? '\\' : '/';
const isFileURI = (value: string) => /^[A-Za-z]{3,}:\/\/[^/]/.test(value) && !value.startsWith('file:');
const isFileUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);
const isDirectoryUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
const hasCompressPng = (compress: Undef<CompressionFormat[]>) => TINIFY_API_KEY && getCompressFormat(compress, 'png') !== undefined;
const getCompressFormat = (compress: Undef<CompressionFormat[]>, format: string) => compress && compress.find(item => item.format === format);
const getFileSize = (filepath: string) => fs.statSync(filepath).size;
const getFileOuterHTML = (script: boolean, filepath: string) => script ? `<script src="${filepath}" type="text/javascript"></script>` : `<link href="${filepath}" type="stylesheet" />`;
const getSaveLocation = (value: string) => value.charAt(0) === '/' ? ['__serverroot__/', value.substring(1)] : ['', value];

app.post('/api/assets/copy', (req, res) => {
    let dirname = req.query.to as string;
    if (dirname) {
        dirname = path.normalize(dirname);
        if (!checkPermissions(res, dirname)) {
            return;
        }
        const files = new Set<string>();
        const status: AsyncStatus = {
            archiving: false,
            delayed: 0,
            dirname,
            filesExported: new Set(),
            filesToRemove: new Set(),
            filesToCompare: new Map(),
            contentToAppend: new Map()
        };
        let cleared = false;
        const finalize = (filepath?: string) => {
            if (status.delayed === Infinity) {
                return;
            }
            if (filepath) {
                files.add(filepath.substring(dirname.length + 1));
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                (async () => await util.promisify(finalizeAssetsAsync)(dirname, <RequestAsset[]> req.body, status, files))();
                --THREAD_COUNT;
                res.json(<ResultOfFileAction> { success: files.size > 0, files: Array.from(files) });
                status.delayed = Infinity;
            }
        };
        try {
            ++THREAD_COUNT;
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize, req.query.empty === '1');
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (system) {
            --THREAD_COUNT;
            res.json({ application: 'FILE: Unknown', system });
        }
    }
});

app.post('/api/assets/archive', (req, res) => {
    let copy_to = req.query.to as string;
    if (copy_to) {
        copy_to = path.normalize(copy_to);
    }
    const dirname = path.join(__dirname, 'temp' + SEPARATOR + uuid.v4());
    let dirname_zip: string;
    try {
        fs.mkdirpSync(dirname);
        if (copy_to) {
            if (!checkPermissions(res, copy_to)) {
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
    const files = new Set<string>();
    const status: AsyncStatus = {
        archiving: true,
        delayed: 0,
        dirname,
        filesExported: new Set(),
        filesToRemove: new Set(),
        filesToCompare: new Map(),
        contentToAppend: new Map()
    };
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
            const success = files.size > 0;
            const bytes = archive.pointer();
            const response: ResultOfFileAction = { success, files: Array.from(files) };
            if (!copy_to) {
                response.zipname = zipname;
                response.bytes = bytes;
            }
            if (formatGzip && success) {
                const gz = req.query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                createGzipWriteStream(zipname, gz)
                    .on('finish', () => {
                        const gz_bytes = getFileSize(gz);
                        if (!copy_to) {
                            response.zipname = gz;
                            response.bytes = gz_bytes;
                        }
                        --THREAD_COUNT;
                        res.json(response);
                        console.log(`WRITE: ${gz} (${gz_bytes} bytes)`);
                    })
                    .on('error', err => {
                        response.success = false;
                        --THREAD_COUNT;
                        res.json(response);
                        writeError(gz, err);
                    });
            }
            else {
                --THREAD_COUNT;
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
                files.add(filepath.substring(dirname.length + 1));
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                (async () => await util.promisify(finalizeAssetsAsync)(dirname, <RequestAsset[]> req.body, status, files))();
                archive.directory(dirname, false);
                archive.finalize();
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            ++THREAD_COUNT;
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize);
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (system) {
            --THREAD_COUNT;
            res.json({ application: 'FILE: Unknown', system });
        }
    };
    if (append_to) {
        const errorAppend = (name: string, err: Error) => {
            resumeThread();
            writeError(name, err);
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
                            writeError(zippath, err);
                            resumeThread();
                        });
                };
                if (isFileURI(append_to)) {
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
                    if (isFileUNC(append_to)) {
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
                writeError(filepath, err);
            }
        });
    }
    else {
        res.json(null);
    }
});

app.get('/api/thread/count', (req, res) => res.send(THREAD_COUNT.toString()));

app.listen(PORT, () => console.log(`${ENV.toUpperCase()}: Express server listening on port ${PORT}\n`));