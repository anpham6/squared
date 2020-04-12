import { CompressionFormat, RequestAsset, Settings } from '../@types/node-express/node';

import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');
import zlib = require('zlib');
import fs = require('fs-extra');
import archiver = require('archiver');
import decompress = require('decompress');
import request = require('request');
import uuid = require('uuid');
import jimp = require('jimp');
import tinify = require('tinify');

interface AsyncStatus {
    delayed: number;
}

interface CompressOutput {
    gzip?: number;
    brotli?: number;
}

let squared: Settings | undefined;
let DISK_READ = false;
let DISK_WRITE = false;
let UNC_READ = false;
let UNC_WRITE = false;
let GZIP_LEVEL = 9;
let BROTLI_QUALITY = 11;
let TINIFY_API_KEY = false;

try {
    squared = require('./squared.settings.json');
}
catch (err) {
    console.log(`FAIL: ${err}`);
}

if (squared) {
    const { disk_read, disk_write, unc_read, unc_write, gzip_level, brotli_quality, tinypng_api_key } = squared;
    DISK_READ = disk_read === true;
    DISK_WRITE = disk_write === true;
    UNC_READ = unc_read === true;
    UNC_WRITE = unc_write === true;
    const gzip = parseInt(gzip_level as string);
    const brotli = parseInt(brotli_quality as string);
    if (!isNaN(gzip)) {
        GZIP_LEVEL = gzip;
    }
    if (!isNaN(brotli)) {
        BROTLI_QUALITY = brotli;
    }
    if (tinypng_api_key) {
        tinify.key = tinypng_api_key;
        tinify.validate(err => {
            if (!err) {
                TINIFY_API_KEY = true;
            }
        });
    }
}
if (process.argv) {
    const argv = process.argv;
    const all = argv.indexOf('--access-all') !== -1;
    if (all || argv.indexOf('--disk-read') !== -1 || argv.indexOf('--access-disk') !== -1) {
        DISK_READ = true;
    }
    if (all || argv.indexOf('--disk-write') !== -1 || argv.indexOf('--access-disk') !== -1) {
        DISK_WRITE = true;
    }
    if (all || argv.indexOf('--unc-read') !== -1 || argv.indexOf('--access-unc') !== -1) {
        UNC_READ = true;
    }
    if (all || argv.indexOf('--unc-write') !== -1 || argv.indexOf('--access-unc') !== -1) {
        UNC_WRITE = true;
    }
}

const app = express();
const port = process.env.PORT || '3000';
const env: string = app.get('env');

app.set('port', port);
app.use(bodyParser.json({ limit: squared?.request_post_limit || '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));
app.use('/', express.static(path.join(__dirname, 'html')));

if (env === 'development') {
    app.use('/build', express.static(path.join(__dirname, 'build')));
    app.use('/books', express.static(path.join(__dirname, 'html/books')));
    app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
}

const [NODE_VERSION_MAJOR, NODE_VERSION_MINOR, NODE_VERSION_PATCH] = process.version.substring(1).split('.').map(value => parseInt(value));
const SEPARATOR = path.sep;

function getFileOutput(file: RequestAsset, dirname: string) {
    const pathname = path.join(dirname, file.copyTo || '', file.pathname);
    return {
        pathname,
        filepath: path.join(pathname, file.filename)
    };
}

function getCompressOutput(file: RequestAsset): CompressOutput {
    const compress = file.compress;
    const gz = getCompressFormat(compress, 'gz');
    const br = getCompressFormat(compress, 'br');
    return {
        gzip: gz ? (!isNaN(gz.level as number) ? gz.level : undefined) : -1,
        brotli: br ? (!isNaN(br.level as number) ? br.level : undefined) : -1
    };
}

function createGzipWriteStream(source: string, filename: string, level?: number) {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(zlib.createGzip({ level: level !== undefined ? level : GZIP_LEVEL }))
        .pipe(o);
    return o;
}

function createBrotliWriteStream(source: string, filename: string, quality?: number, mimeType = '') {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(
            zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_MODE]: /text\//.test(mimeType) ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
                    [zlib.constants.BROTLI_PARAM_QUALITY]: quality !== undefined ? quality : BROTLI_QUALITY,
                    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(source).size
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

function transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (result: boolean) => void, archive?: archiver.Archiver, entryName?: string) {
    const mimeType = file.mimeType;
    if (!mimeType) {
        return;
    }
    switch (mimeType) {
        case '@:text/html':
        case '@:application/xhtml+xml': {
            let html = fs.readFileSync(filepath).toString('utf8');
            assets.forEach(item => {
                if (item !== file && item.href) {
                    const separator = item.href.indexOf('\\') !== -1 ? '\\' : '/';
                    const location = appendSeparator(item.pathname, item.filename, separator);
                    const value = `"${pathJoinForward(item.copyTo || '', location)}"`;
                    if (item.rootDir) {
                        html = replacePathName(html, item.rootDir + location, value);
                    }
                    else {
                        html = replacePathName(html, item.href, value);
                        html = replacePathName(html, separator + location, value);
                    }
                }
            });
            fs.writeFileSync(filepath, html);
            return;
        }
    }
    if (mimeType.startsWith('png:image/')) {
        if (!mimeType.endsWith('/png')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const png = replaceExtension(filepath, 'png');
                    image.write(png, err => {
                        if (err) {
                            writeError(png, err);
                        }
                        else if (archive && entryName) {
                            entryName = replaceExtension(entryName, 'png');
                            if (hasCompressPng(file.compress)) {
                                compressImage(png, finalize, archive, entryName);
                                return;
                            }
                            else {
                                archive.file(png, { name: entryName });
                            }
                        }
                        finalize(true);
                    });
                })
                .catch(err => {
                    finalize(true);
                    writeError(filepath, err);
                });
        }
    }
    else if (mimeType.startsWith('jpeg:image/')) {
        if (!mimeType.endsWith('/jpeg')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const jpg = replaceExtension(filepath, 'jpg');
                    image.write(jpg, err => {
                        if (err) {
                            writeError(jpg, err);
                        }
                        else if (archive && entryName) {
                            entryName = replaceExtension(entryName, 'jpg');
                            if (hasCompressPng(file.compress)) {
                                compressImage(jpg, finalize, archive, entryName);
                                return;
                            }
                            else {
                                archive.file(jpg, { name: entryName });
                            }
                        }
                        finalize(true);
                    });
                })
                .catch(err => {
                    finalize(true);
                    writeError(filepath, err);
                });
        }
    }
    else if (mimeType.startsWith('bmp:image/')) {
        if (!mimeType.endsWith('/bmp')) {
            status.delayed++;
            jimp.read(filepath)
                .then(image => {
                    const bmp = replaceExtension(filepath, 'bmp');
                    image.write(bmp, err => {
                        if (err) {
                            writeError(bmp, err);
                        }
                        else if (archive && entryName) {
                            archive.file(bmp, { name: replaceExtension(entryName, 'bmp') });
                        }
                        finalize(true);
                    });
                })
                .catch(err => {
                    finalize(true);
                    writeError(filepath, err);
                });
        }
    }
}

function writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (result: boolean) => void, archive?: archiver.Archiver) {
    if (hasCompressPng(file.compress)) {
        try {
            tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
                if (!err) {
                    fs.writeFileSync(filepath, resultData);
                }
                compressFile(assets, file, filepath, status, finalize, archive);
            });
        }
        catch (err) {
            compressFile(assets, file, filepath, status, finalize, archive);
            writeError(filepath, err);
        }
    }
    else {
        compressFile(assets, file, filepath, status, finalize, archive);
    }
}

function compressImage(filepath: string, finalize: (result: boolean) => void, archive?: archiver.Archiver, entryName?: string) {
    const completed = () => {
        if (archive && entryName) {
            archive.file(filepath, { name: entryName });
        }
        finalize(true);
    };
    try {
        tinify.fromBuffer(fs.readFileSync(filepath)).toBuffer((err, resultData) => {
            if (!err) {
                fs.writeFileSync(filepath, resultData);
            }
            completed();
        });
    }
    catch (err) {
        completed();
        writeError(filepath, err);
    }
}

function compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, status: AsyncStatus, finalize: (result: boolean) => void, archive?: archiver.Archiver) {
    const { gzip, brotli } = getCompressOutput(file);
    const entryName = getEntryName(file);
    transformBuffer(assets, file, filepath, status, finalize, archive, entryName);
    if (gzip !== -1) {
        status.delayed++;
        const gz = `${filepath}.gz`;
        createGzipWriteStream(filepath, gz, gzip)
            .on('finish', () => {
                if (archive) {
                    archive.file(gz, { name: `${entryName}.gz` });
                }
                finalize(true);
            })
            .on('error', err => {
                writeError(gz, err);
                finalize(true);
            });
    }
    if (brotli !== -1 && checkVersion(11, 7)) {
        status.delayed++;
        const br = `${filepath}.br`;
        createBrotliWriteStream(filepath, br, brotli, file.mimeType)
            .on('finish', () => {
                if (archive) {
                    archive.file(br, { name: `${entryName}.br` });
                }
                finalize(true);
            })
            .on('error', err => {
                writeError(br, err);
                finalize(true);
            });
    }
}

function processAssets(dirname: string, assets: RequestAsset[], status: AsyncStatus, finalize: (result: boolean) => void, empty: boolean, archive?: archiver.Archiver) {
    const emptyDir = {};
    const notFound: ObjectMap<boolean> = {};
    const processing: ObjectMap<RequestAsset[]> = {};
    const completed: string[] = [];
    assets.forEach(file => {
        const { pathname, filepath } = getFileOutput(file, dirname);
        const { content, base64, uri } = file;
        if (archive) {
            fs.mkdirpSync(pathname);
        }
        else if (!emptyDir[pathname]) {
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
                        if (archive) {
                            archive.file(filepath, { name: getEntryName(file) });
                        }
                        writeBuffer(assets, file, filepath, status, finalize, archive);
                    }
                    finalize(true);
                }
            );
        }
        else if (uri) {
            if (notFound[uri]) {
                return;
            }
            const checkQueue = () => {
                if (completed.indexOf(filepath) !== -1) {
                    writeBuffer(assets, file, filepath, status, finalize, archive);
                    finalize(true);
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
                if (archive) {
                    archive.file(filepath, { name: getEntryName(file) });
                }
                for (const item of (processing[filepath] || [file])) {
                    writeBuffer(assets, item, filepath, status, finalize, archive);
                    finalize(true);
                }
                delete processing[filepath];
            };
            const errorRequest = () => {
                if (!notFound[uri]) {
                    finalize(true);
                    notFound[uri] = true;
                }
                delete processing[filepath];
            };
            try {
                if (isURIFile(uri)) {
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
                                errorRequest();
                                writeError(uri, statusCode + ' ' + response.statusMessage);
                            }
                        })
                        .on('error', errorRequest)
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
                                    finalize(true);
                                }
                            }
                        );
                    };
                    if (isUNCFile(uri)) {
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
                errorRequest();
                writeError(uri, err);
            }
        }
    });
}

function replaceExtension(value: string, ext: string) {
    const index = value.lastIndexOf('.');
    return value.substring(0, index !== -1 ? index : value.length) + '.' + ext;
}

const writeError = (description: string, message: any) => console.log(`FAIL: ${description} (${message})`);
const getEntryName = (file: RequestAsset) => path.join(file.copyTo || '', file.pathname, file.filename);
const replacePathName = (source: string, segment: string, value: string) => source.replace(new RegExp(`["']\\s*${segment}\\s*["']`, 'g'), value);
const appendSeparator = (leading: string, trailing: string, separator: string) => leading + (!leading || leading.endsWith(separator) || trailing.startsWith(separator) ? '' : separator) + trailing;
const pathJoinForward = (leading: string, trailing: string) => path.join(leading, trailing).replace(/\\/g, '/');
const getCompressFormat = (compress: CompressionFormat[] | undefined, format: string) => compress && compress.find(item => item.format === format);
const isURIFile = (value: string) => /^[A-Za-z]{3,}:\/\//.test(value);
const isUNCDirectory = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
const isUNCFile = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);
const hasCompressPng = (compress: CompressionFormat[] | undefined) => TINIFY_API_KEY && getCompressFormat(compress, 'png') !== undefined;

app.post('/api/assets/copy', (req, res) => {
    const dirname = path.normalize(req.query.to as string);
    if (dirname) {
        if (isUNCDirectory(dirname)) {
            if (!UNC_WRITE) {
                res.json({ application: 'OPTION: --unc-write', system: 'Writing to UNC shares is not enabled.' });
                return;
            }
        }
        else if (!DISK_WRITE) {
            res.json({ application: 'OPTION: --disk-write', system: 'Writing to disk is not enabled.' });
            return;
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
            return;
        }
        const status: AsyncStatus = { delayed: 0 };
        let cleared = false;
        const finalize = (running = false) => {
            if (status.delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --status.delayed === 0 && cleared) {
                res.json({ success: status.delayed === 0, directory: dirname });
                status.delayed = Number.POSITIVE_INFINITY;
            }
        };
        try {
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize, req.query.empty === '1');
            if (status.delayed === 0) {
                finalize(false);
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
    const dirname = path.join(__dirname, 'temp' + SEPARATOR + uuid.v4());
    try {
        fs.mkdirpSync(dirname);
    }
    catch (err) {
        res.json({ application: `DIRECTORY: ${dirname}`, system: err });
        return;
    }
    let append_to = req.query.append_to as string;
    if (path.isAbsolute(append_to)) {
        append_to = path.normalize(append_to);
    }
    let format: archiver.Format;
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
    const status: AsyncStatus = { delayed: 0 };
    let success = false;
    let cleared = false;
    let zipname = '';
    const resume = (unzip_to = '') => {
        const directory = unzip_to || dirname;
        try {
            fs.mkdirpSync(directory);
        }
        catch (err) {
            res.json({ application: `DIRECTORY: ${directory}`, system: err });
            return;
        }
        const archive = archiver(format, { zlib: { level: 9 } });
        if (!zipname) {
            zipname = path.join(dirname, (req.query.filename || 'squared') + '.' + format);
        }
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const bytes = archive.pointer();
            console.log(`WRITE: ${zipname} (${bytes} bytes)`);
            if (formatGzip) {
                const gz = req.query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                createGzipWriteStream(zipname, gz)
                    .on('finish', () => res.json({ success, directory: dirname, zipname: gz, bytes }))
                    .on('error', err => {
                        writeError(gz, err);
                        res.json({ success, directory: dirname, zipname, bytes });
                    });
            }
            else {
                res.json({ success, directory: dirname, zipname, bytes });
            }
            status.delayed = Number.POSITIVE_INFINITY;
        });
        archive.pipe(output);
        const finalize = (running = false) => {
            if (status.delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --status.delayed === 0 && cleared) {
                success = status.delayed === 0;
                archive.finalize();
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            processAssets(dirname, <RequestAsset[]> req.body, status, finalize, false, archive);
            if (status.delayed === 0) {
                finalize(false);
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
            zipname = '';
            resume();
            writeError(name, err);
        };
        const match = /([^/\\]+)\.(zip|tar)$/i.exec(append_to);
        if (match) {
            zipname = path.join(dirname, match[0]);
            try {
                const copied = () => {
                    format = <archiver.Format> match[2].toLowerCase();
                    const unzip_to = path.join(dirname, match[1]);
                    decompress(zipname, unzip_to)
                        .then(() => resume(unzip_to));
                };
                if (isURIFile(append_to)) {
                    const stream = fs.createWriteStream(zipname);
                    stream.on('finish', copied);
                    request(append_to)
                        .on('response', response => {
                            const statusCode = response.statusCode;
                            if (statusCode >= 300) {
                                errorAppend(zipname, new Error(statusCode + ' ' + response.statusMessage));
                            }
                        })
                        .on('error', err => errorAppend(zipname, err))
                        .pipe(stream);
                }
                else if (fs.existsSync(append_to)) {
                    if (isUNCFile(append_to)) {
                        if (!UNC_READ) {
                            res.json({ application: 'OPTION: --unc-read', system: 'Reading from UNC shares is not enabled.' });
                            return;
                        }
                    }
                    else if (!DISK_READ && path.isAbsolute(append_to)) {
                        res.json({ application: 'OPTION: --disk-read', system: 'Reading from disk is not enabled.' });
                        return;
                    }
                    fs.copyFileSync(append_to, zipname);
                    copied();
                }
                else {
                    errorAppend(append_to, new Error('Archive not found.'));
                }
            }
            catch (err) {
                errorAppend(zipname, <Error> err);
            }
        }
        else {
            errorAppend(append_to, new Error('Invalid archive format.'));
        }
    }
    else {
        resume();
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

app.listen(port, () => console.log(`${env.toUpperCase()}: Express server listening on port ${port}`));