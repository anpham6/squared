import { CompressionFormat, ResultOfFileAction, RequestAsset, Settings } from './@types/node';

import path = require('path');
import fs = require('fs-extra');
import zlib = require('zlib');
import express = require('express');
import bodyParser = require('body-parser');
import request = require('request');
import archiver = require('archiver');
import decompress = require('decompress');
import uuid = require('uuid');
import jimp = require('jimp');
import tinify = require('tinify');

interface AsyncStatus {
    archiving: boolean;
    delayed: number;
    filesToRemove: string[];
    filesToCompare: string[];
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
let ENV: string = process.env.NODE_ENV?.toLowerCase().startsWith('prod') ? 'production' : 'development';
let PORT = '3000';

try {
    const { disk_read, disk_write, unc_read, unc_write, request_post_limit, gzip_level, brotli_quality, jpeg_quality, tinypng_api_key, env, port, routing } = <Settings> require('./squared.settings.json');
    DISK_READ = disk_read === true;
    DISK_WRITE = disk_write === true;
    UNC_READ = unc_read === true;
    UNC_WRITE = unc_write === true;
    const gzip = parseInt(gzip_level as string);
    const brotli = parseInt(brotli_quality as string);
    const jpeg = parseInt(jpeg_quality as string);
    if (!process.env.NODE_ENV && env?.startsWith('prod')) {
        ENV = 'production';
    }
    if (port) {
        const value = parseInt((ENV === 'production' ? port.production : port.development) as string);
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
    if (Array.isArray(routing)) {
        routing.forEach(route => {
            const { path: dirname, mount } = route;
            if (dirname && mount) {
                app.use(dirname, express.static(path.join(__dirname, mount)));
            }
        });
    }
    app.use(bodyParser.json({ limit: request_post_limit || '100mb' }));
}
catch (err) {
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use('/dist', express.static(path.join(__dirname, 'dist')));
    app.use('/', express.static(path.join(__dirname, 'html')));
    console.log(`FAIL: ${err}`);
}

PORT = process.env.PORT || PORT;

app.set('port', PORT);
app.use(bodyParser.urlencoded({ extended: true }));

if (ENV === 'development') {
    app.use('/build', express.static(path.join(__dirname, 'build')));
    app.use('/books', express.static(path.join(__dirname, 'html/books')));
    app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
    app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
}

if (process.argv) {
    const argv = process.argv;
    const all = argv.includes('--access-all');
    if (all || argv.includes('--disk-read') || argv.includes('--access-disk')) {
        DISK_READ = true;
    }
    if (all || argv.includes('--disk-write') || argv.includes('--access-disk')) {
        DISK_WRITE = true;
    }
    if (all || argv.includes('--unc-read') || argv.includes('--access-unc')) {
        UNC_READ = true;
    }
    if (all || argv.includes('--unc-write') || argv.includes('--access-unc')) {
        UNC_WRITE = true;
    }
}

const [NODE_VERSION_MAJOR, NODE_VERSION_MINOR, NODE_VERSION_PATCH] = process.version.substring(1).split('.').map(value => parseInt(value));
const SEPARATOR = path.sep;

function getFileOutput(file: RequestAsset, dirname: string) {
    const pathname = path.join(dirname, file.moveTo || '', file.pathname);
    return { pathname, filepath: path.join(pathname, file.filename) };
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

function transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (filepath?: string) => void) {
    const mimeType = file.mimeType;
    if (!mimeType) {
        return;
    }
    switch (mimeType) {
        case '@text/html':
        case '@text/css':
        case '@application/xhtml+xml': {
            let html = fs.readFileSync(filepath).toString('utf8');
            assets.forEach(item => {
                if (item === file) {
                    return;
                }
                const { uri, moveTo, rootDir } = item;
                if (uri) {
                    const separator = uri.includes('\\') ? '\\' : '/';
                    const location = appendSeparator(item.pathname, item.filename, separator);
                    const value = (moveTo ? path.join(moveTo, location) : location).replace(/\\/g, '/');
                    if (rootDir) {
                        html = replacePathName(html, rootDir + location, value);
                    }
                    else {
                        html = replacePathName(html, uri, value);
                        html = replacePathName(html, separator + location, value);
                    }
                }
            });
            fs.writeFileSync(filepath, html);
            return;
        }
    }
    const afterConvert = (output: string) => {
        switch (mimeType.charAt(0)) {
            case '@':
                status.filesToRemove.push(filepath);
                break;
            case '%':
                status.filesToCompare.push(filepath, output);
                break;
        }
    };
    if (/^[@%]?png:image\//.test(mimeType)) {
        if (!mimeType.endsWith('/png')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const png = replaceExtension(filepath, 'png');
                    image.write(png, err => {
                        if (err) {
                            writeError(png, err);
                        }
                        else {
                            afterConvert(png);
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
    else if (/^[@%]?jpeg:image\//.test(mimeType)) {
        if (!mimeType.endsWith('/jpeg')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const jpg = replaceExtension(filepath, 'jpg');
                    image.quality(JPEG_QUALITY).write(jpg, err => {
                        if (err) {
                            writeError(jpg, err);
                        }
                        else {
                            afterConvert(jpg);
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
    else if (/^[@%]?bmp:image\//.test(mimeType)) {
        if (!mimeType.endsWith('/bmp')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const bmp = replaceExtension(filepath, 'bmp');
                    image.write(bmp, err => {
                        if (err) {
                            writeError(bmp, err);
                        }
                        else {
                            afterConvert(bmp);
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
            status.delayed++;
            const gz = `${filepath}.gz`;
            createGzipWriteStream(filepath, gz, gzip)
                .on('finish', () => finalize(gz))
                .on('error', err => {
                    writeError(gz, err);
                    finalize('');
                });
        }
        if (brotli !== -1 && checkVersion(11, 7)) {
            status.delayed++;
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
        status.delayed++;
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

function processAssets(dirname: string, assets: RequestAsset[], status: AsyncStatus, finalize: (filepath?: string) => void, empty?: boolean) {
    const emptyDir = {};
    const notFound: ObjectMap<boolean> = {};
    const processing: ObjectMap<RequestAsset[]> = {};
    const completed: string[] = [];
    assets.forEach(file => {
        const { pathname, filepath } = getFileOutput(file, dirname);
        const { content, base64, uri } = file;
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
        if (content || base64) {
            status.delayed++;
            fs.writeFile(
                filepath,
                base64 || content,
                base64 ? 'base64' : 'utf8',
                err => {
                    if (!err) {
                        writeBuffer(assets, file, filepath, status, finalize);
                    }
                    finalize(filepath);
                }
            );
        }
        else if (uri) {
            if (notFound[uri]) {
                return;
            }
            const checkQueue = () => {
                if (completed.includes(filepath)) {
                    writeBuffer(assets, file, filepath, status, finalize);
                    finalize('');
                    return true;
                }
                else {
                    const queue = processing[filepath];
                    if (queue) {
                        status.delayed++;
                        queue.push(file);
                        return true;
                    }
                    else {
                        processing[filepath] = [file];
                        return false;
                    }
                }
            };
            const processQueue = () => {
                completed.push(filepath);
                for (const item of (processing[filepath] || [file])) {
                    writeBuffer(assets, item, filepath, status, finalize);
                    finalize(filepath);
                }
                delete processing[filepath];
            };
            const errorRequest = (message: Error | string, stream?: fs.WriteStream) => {
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
            try {
                if (isFileURI(uri)) {
                    if (checkQueue()) {
                        return;
                    }
                    const stream = fs.createWriteStream(filepath);
                    stream.on('finish', () => {
                        if (!notFound[uri]) {
                            processQueue();
                        }
                    });
                    status.delayed++;
                    request(uri)
                        .on('response', response => {
                            const statusCode = response.statusCode;
                            if (statusCode >= 300) {
                                errorRequest(statusCode + ' ' + response.statusMessage, stream);
                            }
                        })
                        .on('error', err => errorRequest(err, stream))
                        .pipe(stream);
                }
                else {
                    const copyUri = () => {
                        status.delayed++;
                        fs.copyFile(
                            uri,
                            filepath,
                            err => {
                                if (!err) {
                                    processQueue();
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
                                return;
                            }
                            copyUri();
                        }
                    }
                    else if (DISK_READ && path.isAbsolute(uri)) {
                        if (checkQueue()) {
                            return;
                        }
                        copyUri();
                    }
                }
            }
            catch (err) {
                errorRequest(err);
            }
        }
    });
}

function replaceExtension(value: string, ext: string) {
    const index = value.lastIndexOf('.');
    return value.substring(0, index !== -1 ? index : value.length) + '.' + ext;
}

function isJPEG(file: RequestAsset) {
    switch (path.extname(file.filename).toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            break;
        default:
            if (!file.mimeType || !file.mimeType.endsWith('image/jpeg')) {
                return false;
            }
            break;
    }
    return true;
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

function removeUnusedFiles(dirname: string, status: AsyncStatus, files: Set<string>) {
    const { filesToCompare, filesToRemove } = status;
    const length = filesToCompare.length;
    for (let i = 0; i < length; i += 2) {
        const original = filesToCompare[i];
        const transformed = filesToCompare[i + 1];
        const smaller = getFileSize(original) > getFileSize(transformed) ? original : transformed;
        if (!filesToRemove.includes(smaller)) {
            filesToRemove.push(smaller);
        }
    }
    filesToRemove.forEach(value => {
        try {
            fs.unlinkSync(value);
            files.delete(value.substring(dirname.length + 1));
        }
        catch (err) {
            writeError(value, err);
        }
    });
}

function replacePathName(source: string, segment: string, value: string) {
    let pattern = new RegExp(`([sS][rR][cC]|[hH][rR][eE][fF])\\s*=\\s*["']\\s*${segment}\\s*["']`, 'g');
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(source)) !== null) {
        source = source.replace(match[0], match[1].toLowerCase() + '="' + value + '"');
    }
    pattern = new RegExp(`url\\(\\s*["']?\\s*${segment}\\s*["']?\\s*\\)`, 'g');
    while ((match = pattern.exec(source)) !== null) {
        source = source.replace(match[0], `url(${value})`);
    }
    return source;
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
            throw new Error('Root is not a directory');
        }
    }
    catch (err) {
        res.json({ application: `DIRECTORY: ${dirname}`, system: err });
        return false;
    }
    return true;
}

const writeError = (description: string, message: any) => console.log(`FAIL: ${description} (${message})`);
const appendSeparator = (leading: string, trailing: string, separator: string) => leading + (!leading || leading.endsWith(separator) || trailing.startsWith(separator) ? '' : separator) + trailing;
const isFileURI = (value: string) => /^[A-Za-z]{3,}:\/\/[^/]/.test(value);
const isFileUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);
const isDirectoryUNC = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
const hasCompressPng = (compress: Undef<CompressionFormat[]>) => TINIFY_API_KEY && getCompressFormat(compress, 'png') !== undefined;
const getCompressFormat = (compress: Undef<CompressionFormat[]>, format: string) => compress && compress.find(item => item.format === format);
const getFileSize = (filepath: string) => fs.statSync(filepath).size;

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
            filesToRemove: [],
            filesToCompare: []
        };
        let cleared = false;
        const finalize = (filepath?: string) => {
            if (status.delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (filepath) {
                files.add(filepath.substring(dirname.length + 1));
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                removeUnusedFiles(dirname, status, files);
                res.json(<ResultOfFileAction> { success: files.size > 0, files: Array.from(files) });
                status.delayed = Number.POSITIVE_INFINITY;
            }
        };
        try {
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize, req.query.empty === '1');
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (err) {
            res.json({ application: 'FILE: Unknown', system: err });
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
    catch (err) {
        res.json({ application: `DIRECTORY: ${dirname}`, system: err });
        return;
    }
    const files = new Set<string>();
    const status: AsyncStatus = {
        archiving: true,
        delayed: 0,
        filesToRemove: [],
        filesToCompare: []
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
                        res.json(response);
                        console.log(`WRITE: ${gz} (${gz_bytes} bytes)`);
                    })
                    .on('error', err => {
                        response.success = false;
                        writeError(gz, err);
                        res.json(response);
                    });
            }
            else {
                res.json(response);
            }
            status.delayed = Number.POSITIVE_INFINITY;
            console.log(`WRITE: ${zipname} (${bytes} bytes)`);
        });
        archive.pipe(output);
        const finalize = (filepath?: string) => {
            if (status.delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (filepath) {
                files.add(filepath.substring(dirname.length + 1));
            }
            if (filepath === undefined || --status.delayed === 0 && cleared) {
                removeUnusedFiles(dirname, status, files);
                archive.directory(dirname, false);
                archive.finalize();
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize);
            if (status.delayed === 0) {
                finalize();
            }
            else {
                cleared = true;
            }
        }
        catch (err) {
            res.json({ application: 'FILE: Unknown', system: err });
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

app.listen(PORT, () => console.log(`${ENV.toUpperCase()}: Express server listening on port ${PORT}`));