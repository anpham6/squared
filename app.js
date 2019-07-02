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

app.set('port', port);
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/demos', express.static(path.join(__dirname, 'html/demos')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

if (app.get('env') === 'development') {
    app.use('/build', express.static(path.join(__dirname, 'build')));
    app.use('/demos-dev', express.static(path.join(__dirname, 'html/demos-dev')));
}

function getQueryData(req, dirname) {
    const timeout = Math.max(parseInt(req.query.timeout) || 60, 1) * 1000;
    return {
        directory: dirname + (req.query.directory ? `/${req.query.directory}` : ''),
        timeout,
        finalizeTime: Date.now() + timeout
    };
}

function getFileData(file, directory) {
    const pathname = `${directory}/${file.pathname}`;
    return {
        pathname,
        filename: `${pathname}/${file.filename}`,
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

app.post('/api/assets/copy', (req, res) => {
    const dirname = req.query.to && req.query.to.trim();
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
        const { directory, timeout, finalizeTime } = getQueryData(req, dirname);
        let delayed = 0;
        let fileerror = '';
        function finalize() {
            if (delayed !== -1 && (--delayed === 0 || Date.now() >= finalizeTime)) {
                delayed = -1;
            }
        }
        try {
            for (const file of req.body) {
                const { pathname, filename, level, quality } = getFileData(file, directory);
                function writeBuffer() {
                    if (delayed !== -1) {
                        if (level > 0) {
                            delayed++;
                            const filename_gz = filename + '.gz';
                            createGzipWriteStream(level, filename, filename_gz).on('finish', () => {
                                finalize();
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
                                    finalize();
                                }
                            );
                        }
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
                            finalize();
                        }
                    );
                }
                else if (file.uri) {
                    delayed++;
                    const stream = fs.createWriteStream(filename);
                    stream.on('finish', () => {
                        writeBuffer();
                        finalize();
                    });
                    request(file.uri)
                        .on('response', res => {
                            if (res.statusCode !== 200) {
                                finalize();
                            }
                        })
                        .on('error', finalize)
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
    const append_to = req.query.append_to && req.query.append_to.trim();
    let format = req.query.format.toLowerCase() === 'tar' ? 'tar' : 'zip';
    let delayed = 0;
    let fileerror = '';
    let zipname = '';
    function resume(unzip_to = '') {
        const { directory, timeout, finalizeTime } = getQueryData(req, unzip_to || dirname);
        try {
            mkdirp.sync(directory);
        }
        catch (err) {
            res.json({ application: `DIRECTORY: ${directory}`, system: err });
            return;
        }
        const archive = archiver(format, { zlib: { level: 9 } });
        if (!zipname) {
            zipname = `${dirname}/${req.query.filename || 'squared'}.${format}`;
        }
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            delayed = -1;
            console.log(`WRITE: ${zipname} (${archive.pointer()} bytes)`);
            res.json({
                directory: dirname,
                zipname,
                bytes: archive.pointer()
            });
        });
        archive.pipe(output);
        function finalize() {
            if (delayed !== -1 && (--delayed === 0 || Date.now() >= finalizeTime)) {
                delayed = -1;
                archive.finalize();
            }
        }
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            for (const file of req.body) {
                const { pathname, filename, level, quality } = getFileData(file, directory);
                const data = { name: `${(req.query.directory ? `${req.query.directory}/` : '') + file.pathname}/${file.filename}` };
                function writeBuffer() {
                    if (delayed !== -1) {
                        if (level > 0) {
                            delayed++;
                            const filename_gz = filename + '.gz';
                            createGzipWriteStream(level, filename, filename_gz).on('finish', () => {
                                if (delayed !== -1) {
                                    archive.file(filename_gz, { name: data.name + '.gz' });
                                    finalize();
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
                                    if (delayed !== -1) {
                                        archive.file(filename_br, { name: data.name + '.br' });
                                        finalize();
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
                            finalize();
                        }
                    );
                }
                else if (file.uri) {
                    delayed++;
                    const stream = fs.createWriteStream(filename);
                    stream.on('finish', () => {
                        writeBuffer();
                        finalize();
                    });
                    request(file.uri)
                        .on('response', res => {
                            if (res.statusCode !== 200) {
                                finalize();
                            }
                        })
                        .on('error', finalize)
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

app.listen(port, () => console.log(`Express server listening on port ${port}`));