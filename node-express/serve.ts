import path = require('path');
import zlib = require('zlib');
import fs = require('fs-extra');
import yargs = require('yargs');
import express = require('express');
import body_parser = require('body-parser');
import cors = require('cors');
import request = require('request');
import uuid = require('uuid');
import archiver = require('archiver');
import decompress = require('decompress');
import jimp = require('jimp');
import tinify = require('tinify');
import chalk = require('chalk');

const app = express();

let Node: serve.INode;
let Express: serve.IExpress;
let Compress: serve.ICompress;
let Chrome: serve.IChrome;
let Image: serve.IImage;

{
    let DISK_READ = false;
    let DISK_WRITE = false;
    let UNC_READ = false;
    let UNC_WRITE = false;
    let GZIP_LEVEL = 9;
    let BROTLI_QUALITY = 11;
    let JPEG_QUALITY = 100;
    let TINIFY_API_KEY = false;

    let ROUTING: Undef<serve.Routing>;
    let CORS: Undef<cors.CorsOptions>;
    let ENV: serve.Environment = process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? 'production' : 'development';
    let PORT = process.env.PORT || '3000';

    let EXTERNAL: Undef<ExternalModules>;

    try {
        const settings = require('./squared.settings.json') as serve.Settings;
        const {
            disk_read,
            disk_write,
            unc_read,
            unc_write,
            request_post_limit,
            gzip_level,
            brotli_quality,
            jpeg_quality,
            tinypng_api_key,
            env,
            port,
        } = settings;

        CORS = settings.cors;
        EXTERNAL = settings.external;
        ROUTING = settings.routing;

        DISK_READ = disk_read === true || disk_read === 'true';
        DISK_WRITE = disk_write === true || disk_write === 'true';
        UNC_READ = unc_read === true || unc_read === 'true';
        UNC_WRITE = unc_write === true || unc_write === 'true';

        const gzip = parseInt(gzip_level as string);
        const brotli = parseInt(brotli_quality as string);
        const jpeg = parseInt(jpeg_quality as string);
        if (!process.env.NODE_ENV && env?.startsWith('prod')) {
            ENV = 'production';
        }
        if (!process.env.PORT && port) {
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

    const argv = (yargs
        .usage('$0 [args]')
        .option('access-all', {
            type: 'boolean',
            description: 'Grant full disk and UNC privileges'
        })
        .option('access-disk', {
            alias: 'd',
            type: 'boolean',
            description: 'Grant full disk privileges'
        })
        .option('access-unc', {
            alias: 'u',
            type: 'boolean',
            description: 'Grant full UNC privileges'
        })
        .option('disk-read', {
            alias: 'r',
            type: 'boolean',
            description: 'Grant disk +r (read only)'
        })
        .option('disk-write', {
            alias: 'w',
            type: 'boolean',
            description: 'Grant disk +w (write only)'
        })
        .option('unc-read', {
            alias: 'y',
            type: 'boolean',
            description: 'Grant UNC +r (read only)'
        })
        .option('unc-write', {
            alias: 'z',
            type: 'boolean',
            description: 'Grant UNC +w (write only)'
        })
        .option('env', {
            alias: 'e',
            type: 'string',
            description: 'Set environment <prod|dev>',
            default: ENV,
            nargs: 1
        })
        .option('port', {
            alias: 'p',
            type: 'number',
            description: 'Port number for HTTP',
            default: parseInt(PORT),
            nargs: 1
        })
        .option('cors', {
            alias: 'c',
            type: 'string',
            description: 'Enable CORS access to <origin>',
            nargs: 1
        })
        .epilogue('For more information and source: https://github.com/anpham6/squared')
        .argv as unknown) as serve.Arguments;

    if (argv.accessAll) {
        DISK_READ = true;
        DISK_WRITE = true;
        UNC_READ = true;
        UNC_WRITE = true;
    }
    else {
        if (argv.accessDisk) {
            DISK_READ = true;
            DISK_WRITE = true;
        }
        else {
            if (argv.diskRead) {
                DISK_READ = true;
            }
            if (argv.diskWrite) {
                DISK_WRITE = true;
            }
        }
        if (argv.accessUnc) {
            UNC_READ = true;
            UNC_WRITE = true;
        }
        else {
            if (argv.uncRead) {
                UNC_READ = true;
            }
            if (argv.uncWrite) {
                UNC_WRITE = true;
            }
        }
    }
    ENV = argv.env.startsWith('prod') ? 'production' : 'development';

    if (ROUTING) {
        console.log('');
        let mounted = 0;
        for (const routes of [ROUTING.shared, ROUTING[ENV]]) {
            if (Array.isArray(routes)) {
                for (const route of routes) {
                    const { path: dirname, mount } = route;
                    if (dirname && mount) {
                        const pathname = path.join(__dirname, mount);
                        try {
                            app.use(dirname, express.static(pathname));
                            console.log(`${chalk.yellow('MOUNT')}: ${chalk.bgGrey(pathname)} ${chalk.yellow('->')} ${chalk.bold(dirname)}`);
                            ++mounted;
                        }
                        catch (err) {
                            console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: ${dirname} -> ${err}`);
                        }
                    }
                }
            }
        }
        console.log(`\n${chalk.bold(mounted)} directories were mounted.\n`);
    }
    else {
        app.use(body_parser.json({ limit: '100mb' }));
        app.use('/', express.static(path.join(__dirname, 'html')));
        app.use('/dist', express.static(path.join(__dirname, 'dist')));
        if (ENV === 'development') {
            app.use('/common', express.static(path.join(__dirname, 'html/common')));
            app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
        }
        console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: Routing not defined.`);
    }

    console.log(`${chalk.blue('DISK')}: ${DISK_READ ? chalk.green('+') : chalk.red('-')}r ${DISK_WRITE ? chalk.green('+') : chalk.red('-')}w`);
    console.log(`${chalk.blue(' UNC')}: ${UNC_READ ? chalk.green('+') : chalk.red('-')}r ${UNC_WRITE ? chalk.green('+') : chalk.red('-')}w`);

    if (argv.cors) {
        app.use(cors({ origin: argv.cors }));
        app.options('*', cors());
    }
    else if (CORS && CORS.origin) {
        app.use(cors(CORS));
        app.options('*', cors());
        argv.cors = typeof CORS.origin === 'string' ? CORS.origin : 'true';
    }
    if (isNaN(argv.port)) {
        argv.port = parseInt(PORT);
    }

    console.log(`${chalk.blue('CORS')}: ${argv.cors ? chalk.green(argv.cors) : chalk.grey('disabled')}`);

    app.use(body_parser.urlencoded({ extended: true }));
    app.listen(argv.port, () => console.log(`\n${chalk[ENV === 'production' ? 'green' : 'yellow'](ENV.toUpperCase())}: Express server listening on port ${chalk.bold(argv.port)}\n`));

    Node = new class implements serve.INode {
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
        checkPermissions(res: express.Response, dirname: string) {
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
        writeFail(description: string, message: any) {
            return console.log(`${chalk.bgRed.bold.white('FAIL')}: ${description} (${message})`);
        }
    }
    (DISK_READ, DISK_WRITE, UNC_READ, UNC_WRITE);

    Express = new class implements serve.IExpress {
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
        getFullUri(file: ExpressAsset, filename?: string) {
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
                    for (const dir of value.split('/')) {
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
                    }
                    value = trailing.join('/');
                }
                return origin + pathname.join('/') + '/' + value;
            }
            return undefined;
        }
    }();

    Compress = new class implements serve.ICompress {
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
            try {
                return fs.statSync(filepath).size;
            }
            catch {
            }
            return 0;
        }
        findFormat(compress: Undef<CompressFormat[]>, format: string) {
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
            const [largerThan, smallerThan] = Compress.getSizeRange(value);
            if (largerThan > 0 || smallerThan < Infinity) {
                const fileSize = Compress.getFileSize(filepath);
                if (fileSize < largerThan || fileSize > smallerThan) {
                    return false;
                }
            }
            return true;
        }
    }
    (GZIP_LEVEL, BROTLI_QUALITY, JPEG_QUALITY);

    Chrome = new class implements serve.IChrome {
        constructor(public external: Undef<ExternalModules>) {}

        findExternalPlugin(data: ObjectMap<StandardMap>, format: string): [string, StandardMap] {
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
        getPrettierParser(name: string): NodeModule[] {
            switch (name.toLowerCase()) {
                case 'babel':
                case 'babel-flow':
                case 'babel-ts':
                case 'json':
                case 'json-5':
                case 'json-stringify':
                    return [require('prettier/parser-babel')];
                case 'css':
                case 'scss':
                case 'less':
                    return [require('prettier/parser-postcss')];
                case 'flow':
                    return [require('prettier/parser-flow')];
                case 'html':
                case 'angular':
                case 'lwc':
                case 'vue':
                    return [require('prettier/parser-html')];
                case 'graphql':
                    return [require('prettier/parser-graphql')];
                case 'markdown':
                    return [require('prettier/parser-markdown')];
                case 'typescript':
                    return [require('prettier/parser-typescript')];
                case 'yaml':
                    return [require('prettier/parser-yaml')];
            }
            return [];
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
                                options = {
                                    parser: 'html',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'html_minifier';
                                options = {
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
                                options.plugins = this.getPrettierParser(options.parser);
                                const result = require('prettier').format(value, options);
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
                                const result = require('html-minifier').minify(value, options);
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
                                const result = require('js-beautify').html_beautify(value, options);
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
                        Node.writeFail(`External: ${module} [npm run install-chrome]`, err);
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
                                options = {
                                    parser: 'css',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'clean_css';
                                options = {
                                    level: 1,
                                    inline: ['none']
                                };
                                break;
                        }
                    }
                    try {
                        switch (module) {
                            case 'prettier': {
                                options.plugins = this.getPrettierParser(options.parser);
                                const result = require('prettier').format(value, options);
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
                                const clean_css = require('clean-css');
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
                                const result = require('js-beautify').css_beautify(value, options);
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
                        Node.writeFail(`External: ${module} [npm run install-chrome]`, err);
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
                                options = {
                                    parser: 'babel',
                                    tabWidth: 4
                                };
                                break;
                            case 'minify':
                                module = 'terser';
                                options = {
                                    toplevel: true,
                                    keep_classnames: true
                                };
                                break;
                        }
                    }
                    try {
                        switch (module) {
                            case 'prettier': {
                                options.plugins = this.getPrettierParser(options.parser);
                                const result = require('prettier').format(value, options);
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
                                const result = require('terser').minify(value, options).code;
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
                                const result = require('js-beautify').js_beautify(value, options);
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
                        Node.writeFail(`External: ${module} [npm run install-chrome]`, err);
                    }
                }
                if (valid) {
                    return value;
                }
            }
            return undefined;
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
            let pattern = new RegExp(`([sS][rR][cC]|[hH][rR][eE][fF]|[dD][aA][tT][aA]|[pP][oO][sS][tT][eE][rR])=(["'])\\s*${(base64 ? '.+?' : '') + segment}\\s*\\2`, 'g');
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
    (EXTERNAL);

    Image = new class implements serve.IImage {
        constructor(public tinify_api_key: boolean) {}

        findCompress(compress: Undef<CompressFormat[]>) {
            return this.tinify_api_key ? Compress.findFormat(compress, 'png') : undefined;
        }
        isJpeg(file: ExpressAsset, filepath?: string) {
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
            const match = /\(\s*(\d+)\s*x\s*(\d+)(?:\s*#\s*(contain|cover|scale))?\s*\)/.exec(value);
            if (match) {
                width = parseInt(match[1]);
                height = parseInt(match[2]);
                mode = match[3];
            }
            return { width, height, mode };
        }
        parseOpacity(value: string) {
            let result: Undef<number>;
            const match = /|\s*([\d.]+)\s*|/.exec(value);
            if (match) {
                const opacity = parseFloat(match[1]);
                if (!isNaN(opacity)) {
                    result = Math.min(Math.max(opacity, 0), 1);
                }
            }
            return result;
        }
        parseRotation(value: string) {
            const result = new Set<number>();
            const match = /\{\s*([\d\s,]+)\s*\}/.exec(value);
            if (match) {
                for (const segment of match[1].split(',')) {
                    const angle = parseInt(segment);
                    if (!isNaN(angle)) {
                        result.add(angle);
                    }
                }
            }
            return Array.from(result);
        }
        resize(self: jimp, width: Undef<number>, height: Undef<number>, mode?: string) {
            if (width && height) {
                switch (mode) {
                    case 'contain':
                        return self.contain(width, height);
                    case 'cover':
                        return self.cover(width, height);
                    case 'scale':
                        return self.scaleToFit(width, height);
                    default:
                        return self.resize(width, height);
                }
            }
            return self;
        }
        rotate(self: jimp, filepath: string, values: number[]) {
            const length = values.length;
            if (length > 1) {
                const first = values.shift() as number;
                values.push(first);
            }
            for (let i = 0; i < length; ++i) {
                const value = values[i];
                if (i > 0) {
                    self.rotate(-values[i - 1]);
                }
                self.rotate(value);
                if (i < length - 1) {
                    const index = filepath.lastIndexOf('.');
                    self.write(filepath.substring(0, index) + '_' + value + filepath.substring(index));
                }
            }
            return self;
        }
        opacity(self: jimp, value: Undef<number>) {
            return value !== undefined && value >= 0 && value <= 1 ? self.opacity(value) : self;
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

class FileManager implements serve.IFileManager {
    public delayed = 0;
    public readonly files = new Set<string>();
    public readonly filesToRemove = new Set<string>();
    public readonly filesToCompare = new Map<ExpressAsset, string[]>();
    public readonly contentToAppend = new Map<string, string[]>();
    public readonly requestMain?: ExpressAsset;
    public readonly dataMap?: DataMap;

    constructor(
        public readonly dirname: string,
        public readonly assets: ExpressAsset[])
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
    replace(file: ExpressAsset, replaceWith: string) {
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
    validate(file: ExpressAsset, exclusions: Exclusions) {
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
    getFileOutput(file: ExpressAsset) {
        const pathname = path.join(this.dirname, file.moveTo || '', file.pathname);
        const filepath = path.join(pathname, file.filename);
        file.filepath = filepath;
        return { pathname, filepath };
    }
    getRelativeUrl(file: ExpressAsset, url: string) {
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
                            return path.join(asset.pathname, asset.filename).replace(/\\/g, '/');
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
                            return path.join(asset.pathname, asset.filename).replace(/\\/g, '/');
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
    appendContent(file: ExpressAsset, content: string, outputOnly = false) {
        const filepath = file.filepath || this.getFileOutput(file).filepath;
        if (filepath && file.bundleIndex !== undefined) {
            const { mimeType, format } = file;
            if (mimeType) {
                if (mimeType.endsWith('text/css')) {
                    const unusedStyles = this.dataMap?.unusedStyles;
                    if (unusedStyles && !file.preserve) {
                        const result = Chrome.removeCss(content, unusedStyles);
                        if (result) {
                            content = result;
                        }
                    }
                    if (mimeType.charAt(0) === '@') {
                        const result = this.transformCss(file, content);
                        if (result) {
                            content = result;
                        }
                    }
                }
                if (format) {
                    const result = Chrome.formatContent(content, mimeType, format);
                    if (result) {
                        content = result;
                    }
                }
                file.mimeType = '&' + mimeType.replace('@', '');
            }
            const trailing = this.getTrailingContent(file);
            if (trailing) {
                content += trailing;
            }
            if (outputOnly || file.bundleIndex === 0) {
                return content;
            }
            const items = this.contentToAppend.get(filepath) || [];
            items.splice(file.bundleIndex - 1, 0, content);
            this.contentToAppend.set(filepath, items);
        }
        return undefined;
    }
    compressFile(assets: ExpressAsset[], file: ExpressAsset, filepath: string, finalize: (filepath?: string) => void) {
        const compress = file.compress;
        const jpeg = Image.isJpeg(file, filepath) && Compress.findFormat(compress, 'jpeg');
        const resumeThread = () => {
            this.transformBuffer(assets, file, filepath, finalize);
            const gzip = Compress.findFormat(compress, 'gz');
            const brotli = Compress.findFormat(compress, 'br');
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
                                Node.writeFail(gz, err);
                            }
                            finalize('');
                        }
                        else {
                            finalize(gz);
                        }
                    })
                    .on('error', err => {
                        Node.writeFail(gz, err);
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
                                Node.writeFail(br, err);
                            }
                            finalize('');
                        }
                        else {
                            finalize(br);
                        }
                    })
                    .on('error', err => {
                        Node.writeFail(br, err);
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
                            Node.writeFail(filepath, err);
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
                                Node.writeFail(jpg, error);
                            }
                        }
                        finalize('');
                        resumeThread();
                    });
                })
                .catch(err => {
                    Node.writeFail(filepath, err);
                    finalize('');
                    resumeThread();
                });
        }
        else {
            resumeThread();
        }
    }
    transformBuffer(assets: ExpressAsset[], file: ExpressAsset, filepath: string, finalize: (filepath?: string) => void) {
        const mimeType = file.mimeType as string;
        if (!mimeType || mimeType.charAt(0) === '&') {
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
                let pattern = /(\s*)<(script|link|style)[\s\S]*?([\s\n]+data-chrome-file="\s*(save|export)As:\s*((?:[^"]|\\")+)")[\s\S]*?\/?>(?:[\s\S]*?<\/\2>\n*)?/ig;
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
                if (source) {
                    html = source;
                }
                pattern = /(\s*)<(script|style)[\s\S]*?>([\s\S]*?)<\/\2>\n*/ig;
                for (const item of assets) {
                    if (item.excluded) {
                        continue;
                    }
                    const { bundleIndex, trailingContent } = item;
                    if (bundleIndex !== undefined) {
                        const outerHTML = item.outerHTML;
                        if (outerHTML) {
                            if (source === undefined) {
                                source = html;
                            }
                            const length = source.length;
                            let replaceWith = '';
                            if (bundleIndex === 0 || bundleIndex === Infinity) {
                                replaceWith = getOuterHTML(item.mimeType === 'text/javascript', Express.getFullUri(item));
                                source = source.replace(outerHTML, replaceWith);
                            }
                            else {
                                source = source.replace(new RegExp(`\\s*${outerHTML}\\n*`), '');
                            }
                            if (source.length === length) {
                                pattern.lastIndex = 0;
                                const content = minifySpace(item.content || '');
                                const outerContent = minifySpace(outerHTML);
                                while ((match = pattern.exec(html)) !== null) {
                                    if (outerContent === minifySpace(match[0]) || content && content === minifySpace(match[3])) {
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
                        while ((match = pattern.exec(html)) !== null) {
                            if (source === undefined) {
                                source = html;
                            }
                            const value = minifySpace(match[3]);
                            if (content.includes(value)) {
                                source = source.replace(match[0], '');
                            }
                        }
                    }
                }
                if (source === undefined) {
                    source = html;
                }
                for (const item of assets) {
                    if (item.excluded) {
                        continue;
                    }
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
                    .replace(/\s*<(script|link|style)[\s\S]*?data-chrome-file="exclude"[\s\S]*?>[\s\S]*?<\/\1>\n*/ig, '')
                    .replace(/\s*<(script|link)[\s\S]*?data-chrome-file="exclude"[\s\S]*?\/?>\n*/ig, '')
                    .replace(/\s+data-(?:use|chrome-[\w-]+)="([^"]|\\")+?"/g, '');
                fs.writeFileSync(filepath, format && Chrome.minifyHtml(format, source) || source);
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
            case '@text/css': {
                const unusedStyles = this.dataMap?.unusedStyles;
                const removeStyles = !!unusedStyles && file.preserve !== true;
                const transforming = mimeType.charAt(0) === '@';
                const trailing = this.getTrailingContent(file);
                if (!removeStyles && !transforming && !format) {
                    if (trailing) {
                        try {
                            fs.appendFileSync(filepath, trailing);
                        }
                        catch (err) {
                            Node.writeFail(filepath, err);
                        }
                    }
                    break;
                }
                const content = fs.readFileSync(filepath).toString('utf8');
                let source: Undef<string>;
                if (removeStyles) {
                    const result = Chrome.removeCss(content, unusedStyles!);
                    if (result) {
                        source = result;
                    }
                }
                if (transforming) {
                    const result = this.transformCss(file, source || content);
                    if (result) {
                        source = result;
                    }
                }
                if (format) {
                    const result = Chrome.minifyCss(format, source || content);
                    if (result) {
                        source = result;
                    }
                }
                if (trailing) {
                    if (source) {
                        source += trailing;
                    }
                    else {
                        source = content + trailing;
                    }
                }
                if (source) {
                    try {
                        fs.writeFileSync(filepath, source);
                    }
                    catch (err) {
                        Node.writeFail(filepath, err);
                    }
                }
                break;
            }
            case 'text/javascript':
            case '@text/javascript': {
                const trailing = this.getTrailingContent(file);
                if (!format) {
                    if (trailing) {
                        try {
                            fs.appendFileSync(filepath, trailing);
                        }
                        catch (err) {
                            Node.writeFail(filepath, err);
                        }
                    }
                    break;
                }
                const content = fs.readFileSync(filepath).toString('utf8');
                let source: Undef<string>;
                if (format) {
                    const result = Chrome.minifyJs(format, content);
                    if (result) {
                        source = result;
                    }
                }
                if (trailing) {
                    if (source) {
                        source += trailing;
                    }
                    else {
                        source = content + trailing;
                    }
                }
                if (source) {
                    try {
                        fs.writeFileSync(filepath, source);
                    }
                    catch (err) {
                        Node.writeFail(filepath, err);
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
                            this.replace(file, transformed);
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
                                if (!err && resultData) {
                                    fs.writeFileSync(location, resultData);
                                }
                                finalize(location);
                            });
                        }
                        catch (err) {
                            finalize('');
                            Node.writeFail(location, err);
                        }
                    };
                    const convert = mimeType.split(':');
                    convert.pop();
                    for (const value of convert) {
                        if (!Compress.withinSizeRange(filepath, value)) {
                            continue;
                        }
                        const { width, height, mode } = Image.parseResizeMode(value);
                        const opacity = Image.parseOpacity(value);
                        const rotation = Image.parseRotation(value);
                        if (value.startsWith('png')) {
                            ++this.delayed;
                            jimp.read(filepath)
                                .then(img => {
                                    const png = replaceExtension(filepath, 'png');
                                    Image.rotate(Image.opacity(Image.resize(img, width, height, mode), opacity), png, rotation).write(png, err => {
                                        if (err) {
                                            Node.writeFail(png, err);
                                        }
                                        else {
                                            afterConvert(png, value);
                                            if (Image.findCompress(file.compress)) {
                                                compressImage(png);
                                                return;
                                            }
                                        }
                                        finalize(png);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    Node.writeFail(filepath, err);
                                });
                        }
                        else if (value.startsWith('jpeg')) {
                            ++this.delayed;
                            jimp.read(filepath)
                                .then(img => {
                                    const jpg = replaceExtension(filepath, 'jpg');
                                    img.quality(Compress.jpeg_quality);
                                    Image.rotate(Image.opacity(Image.resize(img, width, height, mode), opacity), jpg, rotation).write(jpg, err => {
                                        if (err) {
                                            Node.writeFail(jpg, err);
                                        }
                                        else {
                                            afterConvert(jpg, value);
                                            if (Image.findCompress(file.compress)) {
                                                compressImage(jpg);
                                                return;
                                            }
                                        }
                                        finalize(jpg);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    Node.writeFail(filepath, err);
                                });
                        }
                        else if (value.startsWith('bmp')) {
                            ++this.delayed;
                            jimp.read(filepath)
                                .then(img => {
                                    const bmp = replaceExtension(filepath, 'bmp');
                                    Image.rotate(Image.opacity(Image.resize(img, width, height, mode), opacity), bmp, rotation).write(bmp, err => {
                                        if (err) {
                                            Node.writeFail(bmp, err);
                                        }
                                        else {
                                            afterConvert(bmp, value);
                                        }
                                        finalize(bmp);
                                    });
                                })
                                .catch(err => {
                                    finalize('');
                                    Node.writeFail(filepath, err);
                                });
                        }
                    }
                }
                break;
        }
    }
    getTrailingContent(file: ExpressAsset) {
        let output = '';
        const trailingContent = file.trailingContent;
        if (trailingContent) {
            const unusedStyles = this.dataMap?.unusedStyles;
            const mimeType = file.mimeType;
            for (const item of trailingContent) {
                let value = item.value;
                if (mimeType?.endsWith('text/css')) {
                    if (unusedStyles && !item.preserve) {
                        const result = Chrome.removeCss(value, unusedStyles);
                        if (result) {
                            value = result;
                        }
                    }
                    if (mimeType.charAt(0) === '@') {
                        const result = this.transformCss(file, value);
                        if (result) {
                            value = result;
                        }
                    }
                }
                if (mimeType && item.format) {
                    const result = Chrome.formatContent(value, mimeType, item.format);
                    if (result) {
                        output += '\n' + result;
                        continue;
                    }
                }
                output += '\n' + value;
            }
        }
        return output || undefined;
    }
    transformCss(file: ExpressAsset, content: string) {
        const baseUrl = file.uri!;
        if (this.requestMain && Express.fromSameOrigin(this.requestMain.uri!, baseUrl)) {
            const assets = this.assets;
            for (const item of assets) {
                if (item.base64 && item.uri && !item.excluded) {
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
                        location = Express.resolvePath(match[2], this.requestMain.uri!);
                        if (location) {
                            const asset = assets.find(item => item.uri === location && !item.excluded);
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
                    const asset = assets.find(item => item.uri === url && !item.excluded);
                    if (asset) {
                        const count = file.pathname.split(/[\\/]/).length;
                        source = source.replace(match[0], `url(${(count > 0 ? '../'.repeat(count) : '') + Express.getFullUri(asset)})`);
                    }
                }
            }
            return source || content;
        }
        return undefined;
    }
    writeBuffer(assets: ExpressAsset[], file: ExpressAsset, filepath: string, finalize: (filepath?: string) => void) {
        const png = Image.findCompress(file.compress);
        if (png && Compress.withinSizeRange(filepath, png.condition)) {
            try {
                tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
                    if (!err && resultData) {
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
                Node.writeFail(filepath, err);
            }
        }
        else {
            this.compressFile(assets, file, filepath, finalize);
        }
    }
    processAssetsSync(empty: boolean, finalize: (filepath?: string) => void) {
        const emptyDir = new Set<string>();
        const notFound: ObjectMap<boolean> = {};
        const processing: ObjectMap<ExpressAsset[]> = {};
        const appending: ObjectMap<ExpressAsset[]> = {};
        const completed: string[] = [];
        const assets = this.assets;
        const exclusions = assets[0].exclusions;
        const checkQueue = (file: ExpressAsset, filepath: string, content = false) => {
            const bundleIndex = file.bundleIndex;
            if (bundleIndex !== undefined) {
                if (appending[filepath] === undefined) {
                    appending[filepath] = [];
                }
                if (bundleIndex === 0) {
                    return false;
                }
                else {
                    appending[filepath].push(file);
                    return true;
                }
            }
            else if (!content) {
                if (completed.includes(filepath)) {
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
            }
            return false;
        };
        const processQueue = (file: ExpressAsset, filepath: string, bundleMain?: ExpressAsset) => {
            if (file.bundleIndex !== undefined) {
                if (file.bundleIndex === 0) {
                    if (Compress.getFileSize(filepath) > 0 && !file.excluded) {
                        const content = this.appendContent(file, fs.readFileSync(filepath).toString('utf8'), true);
                        if (content) {
                            try {
                                fs.writeFileSync(filepath, content, 'utf8');
                            }
                            catch (err) {
                                Node.writeFail(filepath, err);
                            }
                        }
                    }
                    else {
                        file.excluded = true;
                        const content = this.getTrailingContent(file);
                        if (content) {
                            try {
                                fs.writeFileSync(filepath, content, 'utf8');
                                file.excluded = false;
                            }
                            catch (err) {
                                Node.writeFail(filepath, err);
                            }
                        }
                    }
                }
                const queue = appending[filepath]?.shift();
                if (queue) {
                    const uri = queue.uri;
                    const verifyBundle = (value: string) => {
                        if (Compress.getFileSize(filepath) > 0) {
                            this.appendContent(queue, value);
                        }
                        else {
                            const content = this.appendContent(queue, value, true);
                            if (content) {
                                try {
                                    fs.writeFileSync(filepath, content, 'utf8');
                                    queue.bundleIndex = Infinity;
                                    bundleMain = queue;
                                }
                                catch (err) {
                                    queue.excluded = true;
                                    Node.writeFail(filepath, err);
                                }
                            }
                        }
                    };
                    if (queue.content) {
                        verifyBundle(queue.content);
                    }
                    else if (uri) {
                        request(uri, (err, response) => {
                            if (err) {
                                notFound[uri] = true;
                                queue.excluded = true;
                                Node.writeFail(uri, err);
                            }
                            else {
                                const statusCode = response.statusCode;
                                if (statusCode >= 300) {
                                    notFound[uri] = true;
                                    queue.excluded = true;
                                    Node.writeFail(uri, statusCode + ' ' + response.statusMessage);
                                }
                                else {
                                    verifyBundle(response.body);
                                }
                            }
                        });
                    }
                    processQueue(queue, filepath, !bundleMain || bundleMain.excluded ? !file.excluded && file || queue : bundleMain);
                }
                else if (Compress.getFileSize(filepath) > 0) {
                    this.compressFile(assets, bundleMain || file, filepath, finalize);
                    finalize(filepath);
                }
                else {
                    (bundleMain || file).excluded = true;
                    finalize('');
                }
            }
            else if (Array.isArray(processing[filepath])) {
                completed.push(filepath);
                for (const item of processing[filepath]) {
                    if (item.excluded) {
                        finalize('');
                    }
                    else {
                        this.writeBuffer(assets, item, filepath, finalize);
                        finalize(filepath);
                    }
                }
                delete processing[filepath];
            }
            else {
                this.writeBuffer(assets, file, filepath, finalize);
                finalize(filepath);
            }
        };
        const errorRequest = (file: ExpressAsset, filepath: string, message: Error | string, stream?: fs.WriteStream) => {
            const uri = file.uri!;
            if (!notFound[uri]) {
                if (appending[filepath]?.length) {
                    processQueue(file, filepath);
                }
                else {
                    finalize('');
                }
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
            file.excluded = true;
            Node.writeFail(uri, message);
            delete processing[filepath];
        };
        for (const file of assets) {
            if (exclusions && !this.validate(file, exclusions)) {
                file.excluded = true;
                continue;
            }
            const { pathname, filepath } = this.getFileOutput(file);
            if (!emptyDir.has(pathname)) {
                if (empty) {
                    try {
                        fs.emptyDirSync(pathname);
                    }
                    catch (err) {
                        Node.writeFail(pathname, err);
                    }
                }
                if (!fs.existsSync(pathname)) {
                    try {
                        fs.mkdirpSync(pathname);
                    }
                    catch (err) {
                        file.excluded = true;
                        Node.writeFail(pathname, err);
                    }
                }
                emptyDir.add(pathname);
            }
            if (file.content) {
                if (checkQueue(file, filepath, true)) {
                    continue;
                }
                ++this.delayed;
                fs.writeFile(
                    filepath,
                    file.content,
                    'utf8',
                    err => {
                        if (err) {
                            file.excluded = true;
                        }
                        if (!err || appending[filepath]?.length) {
                            processQueue(file, filepath);
                        }
                        else {
                            finalize('');
                        }
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
                            finalize(filepath);
                        }
                        else {
                            file.excluded = true;
                            finalize('');
                        }
                    }
                );
            }
            else {
                const uri = file.uri;
                if (!uri || notFound[uri]) {
                    file.excluded = true;
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
                                    errorRequest(file, filepath, statusCode + ' ' + response.statusMessage, stream);
                                }
                            })
                            .on('error', err => errorRequest(file, filepath, err, stream))
                            .pipe(stream);
                    }
                    else {
                        const copyUri = (from: string, to: string) => {
                            ++this.delayed;
                            fs.copyFile(
                                from,
                                to,
                                err => {
                                    if (err) {
                                        file.excluded = true;
                                    }
                                    if (!err || appending[filepath]?.length) {
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
                        else {
                            file.excluded = true;
                        }
                    }
                }
                catch (err) {
                    errorRequest(file, filepath, err);
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
                this.replace(file, minFile);
            }
        }
        const length = this.dirname.length;
        for (const value of this.filesToRemove) {
            try {
                fs.unlinkSync(value);
                this.files.delete(value.substring(length + 1));
            }
            catch (err) {
                Node.writeFail(value, err);
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
            const replaced = this.assets.filter(item => item.originalName);
            if (replaced.length || release) {
                for (const item of this.assets) {
                    if (item.excluded) {
                        continue;
                    }
                    const { filepath, mimeType } = item;
                    if (filepath) {
                        switch (mimeType) {
                            case '@text/html':
                            case '@application/xhtml+xml':
                            case '@text/css':
                            case '&text/css':
                                fs.readFile(filepath, (err, data) => {
                                    if (!err) {
                                        let html = data.toString('utf-8');
                                        for (const asset of replaced) {
                                            html = html.replace(new RegExp(Express.getFullUri(asset, asset.originalName).replace(/[\\/]/g, '[\\\\/]'), 'g'), Express.getFullUri(asset));
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
        let cleared = false;
        const manager = new FileManager(dirname, req.body as ExpressAsset[]);
        const finalize = (filepath?: string) => {
            if (manager.delayed === Infinity) {
                return;
            }
            if (filepath) {
                manager.add(filepath);
            }
            if (filepath === undefined || --manager.delayed === 0 && cleared) {
                manager.finalizeAssetsAsync(req.query.release === '1').then(() => {
                    res.json({ success: manager.files.size > 0, files: Array.from(manager.files) } as ResultOfFileAction);
                    manager.delayed = Infinity;
                });
            }
        };
        try {
            manager.processAssetsSync(req.query.empty === '1', finalize);
            if (manager.delayed === 0) {
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
    let append_to = req.query.append_to as string;
    if (path.isAbsolute(append_to)) {
        append_to = path.normalize(append_to);
    }
    let zipname = '';
    let format: archiver.Format;
    let cleared = false;
    let formatGzip = false;
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
    const manager = new FileManager(dirname, req.body as ExpressAsset[]);
    const resumeThread = (unzip_to = '') => {
        const archive = archiver(format, { zlib: { level: Compress.gzip_level } });
        zipname = path.join(dirname_zip, (req.query.filename || zipname || uuid.v4()) + '.' + format);
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const success = manager.files.size > 0;
            const bytes = archive.pointer();
            const response: ResultOfFileAction = { success, files: Array.from(manager.files) };
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
                        Node.writeFail(gz, err);
                    });
            }
            else {
                res.json(response);
            }
            manager.delayed = Infinity;
            console.log(`${chalk.blue('WRITE')}: ${zipname} ${chalk.yellow('[') + chalk.grey(bytes + ' bytes') + chalk.yellow(']')}`);
        });
        archive.pipe(output);
        const finalize = (filepath?: string) => {
            if (manager.delayed === Infinity) {
                return;
            }
            if (filepath) {
                manager.add(filepath);
            }
            if (filepath === undefined || --manager.delayed === 0 && cleared) {
                manager.finalizeAssetsAsync(req.query.release === '1').then(() => {
                    archive.directory(dirname, false);
                    archive.finalize();
                });
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            manager.processAssetsSync(false, finalize);
            if (manager.delayed === 0) {
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
        const match = /([^/\\]+)\.(zip|tar)$/i.exec(append_to);
        if (match) {
            const zippath = path.join(dirname_zip, match[0]);
            const copySuccess = () => {
                zipname = match[1];
                const unzip_to = path.join(dirname_zip, zipname);
                decompress(zippath, unzip_to)
                    .then(() => {
                        format = match[2].toLowerCase() as archiver.Format;
                        resumeThread(unzip_to);
                    })
                    .catch(err => {
                        Node.writeFail(zippath, err);
                        resumeThread();
                    });
            };
            try {
                if (Node.isFileURI(append_to)) {
                    const stream = fs.createWriteStream(zippath);
                    stream.on('finish', copySuccess);
                    request(append_to)
                        .on('response', response => {
                            const statusCode = response.statusCode;
                            if (statusCode >= 300) {
                                Node.writeFail(zippath, new Error(statusCode + ' ' + response.statusMessage));
                                resumeThread();
                            }
                        })
                        .on('error', err => {
                            Node.writeFail(zippath, err);
                            resumeThread();
                        })
                        .pipe(stream);
                    return;
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
                    fs.copyFile(append_to, zippath, copySuccess);
                    return;
                }
                else {
                    Node.writeFail(append_to, new Error('Archive not found.'));
                }
            }
            catch (err) {
                Node.writeFail(zippath,  err as Error);
            }
        }
        else {
            Node.writeFail(append_to, new Error('Invalid archive format.'));
        }
    }
    resumeThread();
});

app.get('/api/browser/download', (req, res) => {
    const filepath = req.query.filepath as string;
    if (filepath) {
        res.sendFile(filepath, err => {
            if (err) {
                Node.writeFail(filepath, err);
            }
        });
    }
    else {
        res.json(null);
    }
});