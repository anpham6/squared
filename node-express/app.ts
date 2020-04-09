import { CompressionFormat, RawAsset, Settings } from '../@types/node-express/node';

import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');
import zlib = require('zlib');
import fs = require('fs-extra');
import archiver = require('archiver');
import decompress = require('decompress');
import request = require('request');
import uuid = require('uuid');
import tinify = require('tinify');

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

function getFileData(file: RawAsset, dirname: string) {
    const pathname = path.join(dirname, file.pathname);
    const compress = file.compress;
    const gz = getCompressFormat(compress, 'gz');
    const br = getCompressFormat(compress, 'br');
    return {
        pathname,
        filename: path.join(pathname, file.filename),
        pngCompress: getCompressFormat(compress, 'png') ? 1 : -1,
        gzipLevel: gz ? (!isNaN(gz.level as number) ? gz.level : undefined) : -1,
        brotliQuality: br ? (!isNaN(br.level as number) ? br.level : undefined) : -1
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
                    [zlib.constants.BROTLI_PARAM_MODE]: /^text\//.test(mimeType) ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
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

function writeBuffer(filename: string, compress: number, callback: () => void) {
    if (TINIFY_API_KEY && compress !== -1) {
        try {
            tinify.fromBuffer(fs.readFileSync(filename)).toBuffer((err, resultData) => {
                if (!err) {
                    fs.writeFileSync(filename, resultData);
                }
                callback();
            });
        }
        catch (err) {
            callback();
            console.log(`FAIL: ${filename} (${err})`);
        }
    }
    else {
        callback();
    }
}

const getCompressFormat = (compress: CompressionFormat[] | undefined, format: string) => compress && compress.find(item => item.format === format);
const isURIFile = (value: string) => /^[A-Za-z]{3,}:\/\//.test(value);
const isUNCDirectory = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$|[\w-]+\$\\.+|[\w-]+\\.*)$/.test(value);
const isUNCFile = (value: string) => /^\\\\([\w.-]+)\\([\w-]+\$?)((?<=\$)(?:[^\\]*|\\.+)|\\.+)$/.test(value);

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
        const empty = req.query.empty === '1';
        let delayed = 0;
        let cleared = false;
        const finalize = (running = false) => {
            if (delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --delayed === 0 && cleared) {
                res.json({ success: delayed === 0, directory: dirname });
                delayed = Number.POSITIVE_INFINITY;
            }
        };
        try {
            const notFound = {};
            const emptyDir = {};
            (req.body as RawAsset[]).forEach(file => {
                const { pathname, filename, pngCompress, gzipLevel, brotliQuality } = getFileData(file, dirname);
                const { content, base64, uri } = file;
                const compressFile = () => {
                    if (gzipLevel !== -1) {
                        delayed++;
                        createGzipWriteStream(filename, `${filename}.gz`, gzipLevel)
                            .on('finish', () => finalize(true));
                    }
                    if (brotliQuality !== -1 && checkVersion(11, 7)) {
                        delayed++;
                        createBrotliWriteStream(filename, `${filename}.br`, brotliQuality, file.mimeType)
                            .on('finish', () => finalize(true));
                    }
                    finalize(true);
                };
                if (!emptyDir[pathname]) {
                    if (empty) {
                        try {
                            fs.emptyDirSync(pathname);
                        }
                        catch (err) {
                            console.log(`FAIL: ${pathname} (${err})`);
                        }
                    }
                    if (!fs.existsSync(pathname)) {
                        fs.mkdirpSync(pathname);
                    }
                    emptyDir[pathname] = true;
                }
                if (content || base64) {
                    delayed++;
                    fs.writeFile(
                        filename,
                        base64 || content,
                        base64 ? 'base64' : 'utf8',
                        err => {
                            if (!err) {
                                writeBuffer(filename, pngCompress, compressFile);
                            }
                            else {
                                finalize(true);
                            }
                        }
                    );
                }
                else if (uri) {
                    if (notFound[uri]) {
                        return;
                    }
                    const errorRequest = () => {
                        if (!notFound[uri]) {
                            finalize(true);
                            notFound[uri] = true;
                        }
                    };
                    try {
                        if (isURIFile(uri)) {
                            delayed++;
                            const stream = fs.createWriteStream(filename);
                            stream.on('finish', () => {
                                if (!notFound[uri]) {
                                    writeBuffer(filename, pngCompress, compressFile);
                                }
                            });
                            request(uri)
                                .on('response', response => {
                                    const statusCode = response.statusCode;
                                    if (statusCode >= 300) {
                                        errorRequest();
                                        console.log(`FAIL: ${uri} (${statusCode} ${response.statusMessage})`);
                                    }
                                })
                                .on('error', errorRequest)
                                .pipe(stream);
                        }
                        else {
                            const copyUri = () => {
                                delayed++;
                                fs.copyFile(
                                    uri,
                                    filename,
                                    err => {
                                        if (!err) {
                                            writeBuffer(filename, pngCompress, compressFile);
                                        }
                                        else {
                                            finalize(true);
                                        }
                                    }
                                );
                            };
                            if (isUNCFile(uri)) {
                                if (UNC_READ) {
                                    copyUri();
                                }
                            }
                            else if (DISK_READ && path.isAbsolute(uri)) {
                                copyUri();
                            }
                        }
                    }
                    catch (err) {
                        errorRequest();
                        console.log(`FAIL: ${uri} (${err})`);
                    }
                }
            });
            if (delayed === 0) {
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
    let gzip = false;
    switch (req.query.format) {
        case 'gz':
        case 'tgz':
            gzip = true;
        case 'tar':
            format = 'tar';
            break;
        default:
            format = 'zip';
            break;
    }
    let success = false;
    let delayed = 0;
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
            if (gzip) {
                const gz = req.query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                createGzipWriteStream(zipname, gz, 9)
                    .on('finish', () => res.json({ success, directory: dirname, zipname: gz, bytes }));
            }
            else {
                res.json({ success, directory: dirname, zipname, bytes });
            }
            delayed = Number.POSITIVE_INFINITY;
        });
        archive.pipe(output);
        const finalize = (running = false) => {
            if (delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --delayed === 0 && cleared) {
                success = delayed === 0;
                archive.finalize();
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            const notFound = {};
            (req.body as RawAsset[]).forEach(file => {
                const { pathname, filename, pngCompress, gzipLevel, brotliQuality } = getFileData(file, dirname);
                const { content, base64, uri } = file;
                const data = { name: path.join(file.pathname, file.filename) };
                const compressFile = () => {
                    if (gzipLevel !== -1) {
                        delayed++;
                        const gz = `${filename}.gz`;
                        createGzipWriteStream(filename, gz, gzipLevel)
                            .on('finish', () => {
                                if (delayed !== Number.POSITIVE_INFINITY) {
                                    archive.file(gz, { name: `${data.name}.gz` });
                                    finalize(true);
                                }
                            });
                    }
                    if (brotliQuality !== -1 && checkVersion(11, 7)) {
                        delayed++;
                        const br = `${filename}.br`;
                        createBrotliWriteStream(filename, br, brotliQuality, file.mimeType)
                            .on('finish', () => {
                                if (delayed !== Number.POSITIVE_INFINITY) {
                                    archive.file(br, { name: `${data.name}.br` });
                                    finalize(true);
                                }
                            });
                    }
                    archive.file(filename, data);
                    finalize(true);
                };
                fs.mkdirpSync(pathname);
                if (content || base64) {
                    delayed++;
                    fs.writeFile(
                        filename,
                        base64 || content,
                        base64 ? 'base64' : 'utf8',
                        err => {
                            if (!err) {
                                writeBuffer(filename, pngCompress, compressFile);
                            }
                            else {
                                finalize(true);
                            }
                        }
                    );
                }
                else if (uri) {
                    if (notFound[uri]) {
                        return;
                    }
                    const errorRequest = () => {
                        if (!notFound[uri]) {
                            finalize(true);
                            notFound[uri] = true;
                        }
                    };
                    try {
                        if (isURIFile(uri)) {
                            delayed++;
                            const stream = fs.createWriteStream(filename);
                            stream.on('finish', () => {
                                if (!notFound[uri]) {
                                    writeBuffer(filename, pngCompress, compressFile);
                                }
                            });
                            request(uri)
                                .on('response', response => {
                                    const statusCode = response.statusCode;
                                    if (statusCode >= 300) {
                                        errorRequest();
                                        console.log(`FAIL: ${uri} (${statusCode} ${response.statusMessage})`);
                                    }
                                })
                                .on('error', errorRequest)
                                .pipe(stream);
                        }
                        else {
                            const copyUri = () => {
                                delayed++;
                                fs.copyFile(
                                    uri,
                                    filename,
                                    err => {
                                        if (!err) {
                                            writeBuffer(filename, pngCompress, compressFile);
                                        }
                                        else {
                                            finalize(true);
                                        }
                                    }
                                );
                            };
                            if (isUNCFile(uri)) {
                                if (UNC_READ) {
                                    copyUri();
                                }
                            }
                            else if (DISK_READ && path.isAbsolute(uri)) {
                                copyUri();
                            }
                        }
                    }
                    catch (err) {
                        errorRequest();
                        console.log(`FAIL: ${uri} (${err})`);
                    }
                }
            });
            if (delayed === 0) {
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
        const errorAppendTo = (name: string, err: Error) => {
            zipname = '';
            resume();
            console.log(`FAIL: ${name} (${err})`);
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
                                errorAppendTo(zipname, new Error(statusCode + ' ' + response.statusMessage));
                            }
                        })
                        .on('error', err => errorAppendTo(zipname, err))
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
                    errorAppendTo(append_to, new Error('Archive not found.'));
                }
            }
            catch (err) {
                errorAppendTo(zipname, <Error> err);
            }
        }
        else {
            errorAppendTo(append_to, new Error('Invalid archive format.'));
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
                console.log(`FAIL: ${filepath} (${err})`);
            }
        });
    }
    else {
        res.json(null);
    }
});

app.listen(port, () => console.log(`${env.toUpperCase()}: Express server listening on port ${port}`));