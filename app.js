const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const decompress = require('decompress');
const zlib = require('zlib');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;
const env = app.get('env');

app.set('port', port);
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

if (env === 'development') {
    app.use('/build', express.static(path.join(__dirname, 'build')));
    app.use('/demos-dev', express.static(path.join(__dirname, 'html/demos-dev')));
}

const [NODE_VERSION_MAJOR, NODE_VERSION_MINOR, NODE_VERSION_PATCH] = process.version.substring(1).split('.').map(value => parseInt(value));
const SEPARATOR = process.platform === 'win32' ? '\\' : '/';

function getQueryData(req, directory) {
    const query = req.query;
    const timeout = Math.max(parseInt(query.timeout) || 60, 1) * 1000;
    if (query.directory) {
        directory = appendFilePart(directory, replaceSeparator(query.directory));
    }
    return {
        directory,
        timeout,
        finalizeTime: Date.now() + timeout
    };
}

function getFileData(file, directory) {
    const pathname = replaceSeparator(appendFilePart(directory, file.pathname));
    return {
        pathname,
        filename: appendFilePart(pathname, file.filename),
        gzipQuality: file.gzipQuality !== undefined ? Math.min(file.gzipQuality, 9) : -1,
        brotliQuality: file.brotliQuality !== undefined ? Math.min(file.brotliQuality, 11) : -1
    };
}

function createGzipWriteStream(source, filename, level = 9) {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(zlib.createGzip({ level }))
        .pipe(o);
    return o;
}

function createBrotliWriteStream(source, filename, quality = 11, mimeType = '') {
    const o = fs.createWriteStream(filename);
    fs.createReadStream(source)
        .pipe(
            zlib.createBrotliCompress({
                params: {
                    [zlib.constants.BROTLI_PARAM_MODE]: /^text\//.test(mimeType) ? zlib.constants.BROTLI_MODE_TEXT : zlib.constants.BROTLI_MODE_GENERIC,
                    [zlib.constants.BROTLI_PARAM_QUALITY]: quality,
                    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(source).size
                }
            })
        )
        .pipe(o);
    return o;
}

function checkVersion(major, minor, patch = 0) {
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

const appendFilePart = (value, append) => value + (value.endsWith(SEPARATOR) || value === '' ? '' : SEPARATOR) + append;
const replaceSeparator = value => value.replace(SEPARATOR === '/' ? '\\' : '/', SEPARATOR);
const isRemoteFile = value => /^[A-Za-z]{3,}:\/\//.test(value);

app.post('/api/assets/copy', (req, res) => {
    const dirname = replaceSeparator(req.query.to);
    if (dirname) {
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
        const { directory, timeout, finalizeTime } = getQueryData(req, dirname);
        const empty = req.query.empty === '1';
        let delayed = 0;
        let cleared = false;
        const finalize = (running = false) => {
            if (delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --delayed === 0 && cleared || Date.now() >= finalizeTime) {
                delayed = Number.POSITIVE_INFINITY;
                res.json({ success: delayed === 0, directory: dirname });
            }
        };
        try {
            const notFound = {};
            const emptyDir = {};
            for (const file of req.body) {
                if (delayed === Number.POSITIVE_INFINITY) {
                    break;
                }
                const { pathname, filename, gzipQuality, brotliQuality } = getFileData(file, directory);
                const { content, base64, uri } = file;
                const writeBuffer = () => {
                    if (gzipQuality !== -1) {
                        delayed++;
                        createGzipWriteStream(filename, `${filename}.gz`, gzipQuality)
                            .on('finish', () => finalize(true));
                    }
                    if (brotliQuality !== -1 && checkVersion(11, 7)) {
                        delayed++;
                        createBrotliWriteStream(filename, `${filename}.br`, brotliQuality, file.mimeType)
                            .on('finish', () => finalize(true));
                    }
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
                                writeBuffer();
                            }
                            finalize(true);
                        }
                    );
                }
                else if (uri) {
                    if (notFound[uri]) {
                        continue;
                    }
                    const errorRequest = () => {
                        if (!notFound[uri]) {
                            finalize(true);
                            notFound[uri] = true;
                        }
                    };
                    try {
                        delayed++;
                        if (isRemoteFile(uri)) {
                            const stream = fs.createWriteStream(filename);
                            stream.on('finish', () => {
                                if (!notFound[uri]) {
                                    writeBuffer();
                                    finalize(true);
                                }
                            });
                            request(uri)
                                .on('response', err => {
                                    const statusCode = err.statusCode;
                                    if (statusCode >= 300) {
                                        errorRequest();
                                        console.log(`FAIL: ${uri} (${statusCode} ${err.statusMessage})`);
                                    }
                                })
                                .on('error', errorRequest)
                                .pipe(stream);
                        }
                        else {
                            fs.copyFile(
                                uri,
                                filename,
                                err => {
                                    if (!err) {
                                        writeBuffer();
                                    }
                                    finalize(true);
                                }
                            );
                        }
                    }
                    catch (err) {
                        errorRequest();
                        console.log(`FAIL: ${uri} (${err})`);
                    }
                }
            }
            cleared = true;
            if (delayed === 0) {
                finalize();
            }
            else {
                setTimeout(finalize, timeout);
            }
        }
        catch (err) {
            res.json({ application: 'FILE: Unknown', system: err });
        }
    }
});

app.post('/api/assets/archive', (req, res) => {
    const dirname = appendFilePart(__dirname, 'temp' + SEPARATOR + uuidv4());
    try {
        fs.mkdirpSync(dirname);
    }
    catch (err) {
        res.json({ application: `DIRECTORY: ${directory}`, system: err });
        return;
    }
    const query = req.query;
    const append_to = query.append_to;
    const queryDirectory = replaceSeparator(query.directory);
    let format;
    let gzip = false;
    switch (query.format) {
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
        const { directory, timeout, finalizeTime } = getQueryData(req, unzip_to || dirname);
        try {
            fs.mkdirpSync(directory);
        }
        catch (err) {
            res.json({ application: `DIRECTORY: ${directory}`, system: err });
            return;
        }
        const archive = archiver(format, { zlib: { level: 9 } });
        if (!zipname) {
            zipname = appendFilePart(dirname, (query.filename || 'squared') + '.' + format);
        }
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const bytes = archive.pointer();
            console.log(`WRITE: ${zipname} (${bytes} bytes)`);
            if (gzip) {
                const filename_gz = query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                createGzipWriteStream(zipname, filename_gz, 9)
                    .on('finish', () => res.json({ success, directory: dirname, zipname: filename_gz, bytes }));
            }
            else {
                res.json({ success, directory: dirname, zipname, bytes });
            }
        });
        archive.pipe(output);
        const finalize = (running = false) => {
            if (delayed === Number.POSITIVE_INFINITY) {
                return;
            }
            if (!running || running && --delayed === 0 && cleared || Date.now() >= finalizeTime) {
                success = delayed === 0;
                delayed = Number.POSITIVE_INFINITY;
                archive.finalize();
            }
        };
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            const notFound = {};
            for (const file of req.body) {
                if (delayed === Number.POSITIVE_INFINITY) {
                    break;
                }
                const { pathname, filename, gzipQuality, brotliQuality } = getFileData(file, directory);
                const { content, base64, uri } = file;
                const data = { name: (queryDirectory ? appendFilePart(queryDirectory, '') : '') + appendFilePart(file.pathname, file.filename) };
                const writeBuffer = () => {
                    if (delayed !== Number.POSITIVE_INFINITY) {
                        if (gzipQuality !== -1) {
                            delayed++;
                            const filename_gz = `${filename}.gz`;
                            createGzipWriteStream(filename, filename_gz, gzipQuality)
                                .on('finish', () => {
                                    if (delayed !== Number.POSITIVE_INFINITY) {
                                        archive.file(filename_gz, { name: `${data.name}.gz` });
                                        finalize(true);
                                    }
                                });
                        }
                        if (brotliQuality !== -1 && checkVersion(11, 7)) {
                            delayed++;
                            const filename_br = `${filename}.br`;
                            createBrotliWriteStream(filename, filename_br, brotliQuality, file.mimeType)
                                .on('finish', () => {
                                    if (delayed !== Number.POSITIVE_INFINITY) {
                                        archive.file(filename_br, { name: `${data.name}.br` });
                                        finalize(true);
                                    }
                                });
                        }
                        archive.file(filename, data);
                    }
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
                                writeBuffer();
                            }
                            finalize(true);
                        }
                    );
                }
                else if (uri) {
                    if (notFound[uri]) {
                        continue;
                    }
                    const errorRequest = () => {
                        if (!notFound[uri]) {
                            finalize(true);
                            notFound[uri] = true;
                        }
                    };
                    try {
                        delayed++;
                        if (isRemoteFile(uri)) {
                            const stream = fs.createWriteStream(filename);
                            stream.on('finish', () => {
                                if (!notFound[uri]) {
                                    writeBuffer();
                                    finalize(true);
                                }
                            });
                            request(uri)
                                .on('response', err => {
                                    const statusCode = err.statusCode;
                                    if (statusCode >= 300) {
                                        errorRequest();
                                        console.log(`FAIL: ${uri} (${statusCode} ${err.statusMessage})`);
                                    }
                                })
                                .on('error', errorRequest)
                                .pipe(stream);
                        }
                        else {
                            fs.copyFile(
                                uri,
                                filename,
                                err => {
                                    if (!err) {
                                        writeBuffer();
                                    }
                                    finalize(true);
                                }
                            );
                        }
                    }
                    catch (err) {
                        errorRequest();
                        console.log(`FAIL: ${uri} (${err})`);
                    }
                }
            }
            cleared = true;
            if (delayed === 0) {
                finalize();
            }
            else {
                setTimeout(finalize, timeout);
            }
        }
        catch (err) {
            res.json({ application: 'FILE: Unknown', system: err });
        }
    };
    if (append_to) {
        const errorAppendTo = (name, err) => {
            zipname = '';
            resume();
            console.log(`FAIL: ${name} (${err})`);
        };
        const match = /([^/\\]+)\.(zip|tar)$/i.exec(append_to);
        if (match) {
            zipname = appendFilePart(dirname, replaceSeparator(match[0]));
            try {
                const copied = () => {
                    format = match[2].toLowerCase();
                    const unzip_to = appendFilePart(dirname, match[1]);
                    decompress(zipname, unzip_to)
                        .then(() => resume(unzip_to));
                };
                if (isRemoteFile(append_to)) {
                    const stream = fs.createWriteStream(zipname);
                    stream.on('finish', copied);
                    request(append_to)
                        .on('response', err => {
                            const statusCode = err.statusCode;
                            if (statusCode >= 300) {
                                errorAppendTo(zipname, statusCode + ' ' + err.statusMessage);
                            }
                        })
                        .on('error', err => errorAppendTo(zipname, err))
                        .pipe(stream);
                }
                else if (fs.existsSync(append_to)) {
                    fs.copyFileSync(append_to, zipname);
                    copied();
                }
                else {
                    errorAppendTo(append_to, 'Archive not found.');
                }
            }
            catch (err) {
                errorAppendTo(zipname, err);
            }
        }
        else {
            errorAppendTo(append_to, 'Invalid archive format.');
        }
    }
    else {
        resume();
    }
});

app.get('/api/browser/download', (req, res) => {
    const filename = req.query.filename;
    if (filename) {
        res.sendFile(filename, err => {
            if (err) {
                console.log(`FAIL: ${filename} (${err})`);
            }
        });
    }
    else {
        res.json(null);
    }
});

app.listen(port, () => console.log(`${env.toUpperCase()}: Express server listening on port ${port}`));