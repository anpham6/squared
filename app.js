const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const uuid = require('uuid/v1');
const archiver = require('archiver');
const decompress = require('decompress');
const zlib = require('zlib');
const brotli = require('brotli');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;
const env = app.get('env');

app.set('port', port);
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

if (env === 'development') {
    app.use('/build', express.static(path.join(__dirname, 'build')));
    app.use('/demos-dev', express.static(path.join(__dirname, 'html/demos-dev')));
}

function getQueryData(req, directory) {
    const query = req.query;
    const timeout = Math.max(parseInt(query.timeout) || 60, 1) * 1000;
    if (query.directory) {
        if (!directory.endsWith('/')) {
            directory += '/';
        }
        directory += query.directory;
    }
    return {
        directory,
        timeout,
        finalizeTime: Date.now() + timeout
    };
}

function getFileData(file, directory) {
    if (!directory.endsWith('/')) {
        directory += '/';
    }
    const pathname = directory + file.pathname;
    return {
        pathname,
        filename: pathname + (!pathname.endsWith('/') ? '/' : '') + file.filename,
        level: file.gzipQuality > 0 ? Math.min(file.gzipQuality, 9) : 0,
        quality: file.brotliQuality > 0 ? Math.min(file.brotliQuality, 11) : 0
    };
}

function createGzipWriteStream(level, filename, filenameOut) {
    const gzip = zlib.createGzip({ level });
    const inp = fs.createReadStream(filename);
    const out = fs.createWriteStream(filenameOut);
    inp.pipe(gzip).pipe(out);
    return out;
}

function encodeString(value) {
    return value.replace(/[<>:"/\\|?*]/g, '_');
}

app.post('/api/assets/copy', (req, res) => {
    const dirname = req.query.to;
    if (dirname) {
        try {
            if (!fs.existsSync(dirname)) {
                mkdirp.sync(dirname);
            }
            else if (!fs.lstatSync(dirname).isDirectory()) {
                throw 'Path is not a directory.';
            }
        }
        catch (err) {
            res.json({ application: `DIRECTORY: ${dirname}`, system: err });
            return;
        }
        let { directory, timeout, finalizeTime } = getQueryData(req, dirname);
        let delayed = 0;
        let fileerror = '';
        function finalize(valid = false) {
            if (valid && --delayed === 0 || Date.now() >= finalizeTime) {
                delayed = Number.POSITIVE_INFINITY;
                finalizeTime = Number.POSITIVE_INFINITY;
                res.json({
                    success: delayed === 0,
                    directory: dirname
                });
            }
        }
        try {
            for (const file of req.body) {
                const { pathname, filename, level, quality } = getFileData(file, directory);
                function writeBuffer() {
                    if (level > 0) {
                        delayed++;
                        const filename_gz = filename + '.gz';
                        createGzipWriteStream(level, filename, filename_gz).on('finish', () => {
                            finalize(true);
                        });
                    }
                    if (quality > 0) {
                        delayed++;
                        const filename_br = filename + '.br';
                        fs.writeFile(
                            filename_br,
                            brotli.compress(
                                fs.readFileSync(filename),
                                { mode: file.mimeType && file.mimeType.startsWith('font/') ? 2 : 1, quality }
                            ),
                            () => finalize(true)
                        );
                    }
                }
                fileerror = filename;
                mkdirp.sync(pathname);
                if (file.content || file.base64) {
                    delayed++;
                    fs.writeFile(
                        filename,
                        file.base64 || file.content,
                        file.base64 ? 'base64' : 'utf8',
                        err => {
                            if (!err) {
                                writeBuffer();
                            } 
                            finalize(true);
                        }
                    );
                }
                else if (file.uri) {
                    delayed++;
                    const stream = fs.createWriteStream(filename);
                    stream.on('finish', () => {
                        writeBuffer();
                        finalize(true);
                    });
                    request(file.uri)
                        .on('response', res => {
                            if (res.statusCode !== 200) {
                                finalize(true);
                            }
                        })
                        .on('error', () => finalize(true))
                        .pipe(stream);
                }
            }
            setTimeout(finalize, timeout);
        }
        catch (err) {
            res.json({ application: `FILE: ${fileerror}`, system: err });
        }
    }
});

app.post('/api/assets/archive', (req, res) => {
    const dirname = `${__dirname.replace(/\\/g, '/')}/temp/${uuid()}`;
    try {
        mkdirp.sync(dirname);
    }
    catch (err) {
        res.json({ application: `DIRECTORY: ${directory}`, system: err });
        return;
    }
    const query = req.query;
    const append_to = query.append_to;
    let format = query.format.toLowerCase() === 'tar' ? 'tar' : 'zip';
    let success = false;
    let delayed = 0;
    let fileerror = '';
    let zipname = '';
    function resume(unzip_to = '') {
        let { directory, timeout, finalizeTime } = getQueryData(req, unzip_to || dirname);
        try {
            mkdirp.sync(directory);
        }
        catch (err) {
            res.json({ application: `DIRECTORY: ${directory}`, system: err });
            return;
        }
        const archive = archiver(format, { zlib: { level: 9 } });
        if (!zipname) {
            zipname = `${dirname}/${query.filename || 'squared'}.${format}`;
        }
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            console.log(`WRITE: ${zipname} (${archive.pointer()} bytes)`);
            res.json({
                success,
                directory: dirname,
                zipname,
                bytes: archive.pointer()
            });
        });
        archive.pipe(output);
        function finalize(valid = false) {
            if (valid && --delayed === 0 || Date.now() >= finalizeTime) {
                success = delayed === 0;
                delayed = Number.POSITIVE_INFINITY;
                finalizeTime = Number.POSITIVE_INFINITY;
                archive.finalize();
            }
        }
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            for (const file of req.body) {
                const { pathname, filename, level, quality } = getFileData(file, directory);
                const data = { name: `${(query.directory ? `${query.directory}/` : '') + file.pathname}/${file.filename}` };
                function writeBuffer() {
                    if (delayed !== Number.POSITIVE_INFINITY) {
                        if (level > 0) {
                            delayed++;
                            const filename_gz = filename + '.gz';
                            createGzipWriteStream(level, filename, filename_gz).on('finish', () => {
                                if (delayed !== Number.POSITIVE_INFINITY) {
                                    archive.file(filename_gz, { name: data.name + '.gz' });
                                    finalize(true);
                                }
                            });
                        }
                        if (quality > 0) {
                            delayed++;
                            const filename_br = filename + '.br';
                            fs.writeFile(
                                filename_br,
                                brotli.compress(
                                    fs.readFileSync(filename),
                                    { mode: file.mimeType && file.mimeType.startsWith('font/') ? 2 : 1, quality }
                                ),
                                () => {
                                    if (delayed !== Number.POSITIVE_INFINITY) {
                                        archive.file(filename_br, { name: data.name + '.br' });
                                        finalize(true);
                                    }
                                }
                            );
                        }
                        archive.file(filename, data);
                    }
                }
                fileerror = filename;
                mkdirp.sync(pathname);
                if (file.content || file.base64) {
                    delayed++;
                    fs.writeFile(
                        filename,
                        file.base64 || file.content,
                        file.base64 ? 'base64' : 'utf8',
                        err => {
                            if (!err) {
                                writeBuffer();
                            } 
                            finalize(true);
                        }
                    );
                }
                else if (file.uri) {
                    delayed++;
                    const stream = fs.createWriteStream(filename);
                    stream.on('finish', () => {
                        writeBuffer();
                        finalize(true);
                    });
                    request(file.uri)
                        .on('response', res => {
                            if (res.statusCode !== 200) {
                                finalize(true);
                            }
                        })
                        .on('error', () => finalize(true))
                        .pipe(stream);
                }
            }
            setTimeout(finalize, timeout);
        }
        catch (err) {
            res.json({ application: `FILE: ${fileerror}`, system: err });
        }
    }
    if (append_to) {
        const match = /([^/\\]+)\.(zip|tar)$/i.exec(append_to);
        if (match) {
            zipname = `${dirname}/${match[0]}`;
            try {
                function copied() {
                    format = match[2].toLowerCase();
                    const unzip_to = `${dirname}/${match[1]}`;
                    decompress(zipname, unzip_to).then(() => {
                        resume(unzip_to);
                    });
                }
                if (/^[A-Za-z]+:\/\//.test(append_to)) {
                    const stream = fs.createWriteStream(zipname);
                    stream.on('finish', copied);
                    request(append_to)
                        .on('error', () => {
                            zipname = '';
                            resume();
                        })
                        .pipe(stream);
                }
                else {
                    fs.copyFileSync(append_to, zipname);
                    copied();
                }
            }
            catch (err) {
                console.log(`FAIL: ${zipname} (${err})`);
                zipname = '';
                resume();
            }
        }
    }
    else {
        resume();
    }
});

app.get('/api/browser/download', (req, res) => {
    const filename = req.query.filename && req.query.filename.trim();
    if (filename) {
        res.sendFile(filename, err => {
            if (err) {
                console.log(`ERROR: ${err}`);
            }
        });
    }
    else {
        res.json(null);
    }
});

app.listen(port, () => console.log(`${env.toUpperCase()}: Express server listening on port ${port}`));