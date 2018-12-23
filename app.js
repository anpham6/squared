const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const uuid = require('uuid/v1');
const archiver = require('archiver');
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

app.post('/api/savetodisk', (req, res) => {
    const dirname = `${__dirname.replace(/\\/g, '/')}/temp/${uuid()}`;
    const directory = dirname + (req.query.directory ? `/${req.query.directory}` : '');
    const processingTime = !isNaN(parseInt(req.query.processingtime) ? parseInt(req.query.processingtime) : 30) * 1000;
    const finalizeTime = Date.now() + processingTime;
    try {
        mkdirp.sync(directory);
        const compression = req.query.compression === 'tar' ? 'tar' : 'zip';
        const archive = archiver(compression, { zlib: { level: 9 } });
        const zipname = `${dirname}/${req.query.appname || 'squared'}.${compression}`;
        const output = fs.createWriteStream(zipname);
        let delayed = 0;
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
            if (delayed !== -1 && (delayed === 0 || Date.now() >= finalizeTime)) {
                delayed = -1;
                archive.finalize();
            }
        }
        let fileerror = '';
        try {
            for (const file of req.body) {
                const pathname = `${directory}/${file.pathname}`;
                const filename = `${pathname}/${file.filename}`;
                fileerror = filename;
                mkdirp.sync(pathname);
                const data = { name: `${(req.query.directory ? `${req.query.directory}/` : '') + file.pathname}/${file.filename}` };
                if (file.content && file.content.trim() !== '') {
                    delayed++;
                    fs.writeFile(filename, file.content, (err) => {
                        if (delayed !== -1) {
                            if (!err) {
                                archive.file(filename, data);
                            }
                            delayed--;
                            finalize();
                        }
                    });
                }
                else if (file.uri) {
                    delayed++;
                    const stream = fs.createWriteStream(filename);
                    stream.on('finish', () => {
                        if (delayed !== -1) {
                            archive.file(filename, data);
                            delayed--;
                            finalize();
                        }
                    });
                    request(file.uri).on('response', (response) => {
                        if (response.statusCode !== 200) {
                            if (delayed !== -1) {
                                delayed--;
                                finalize();
                            }
                        }
                    })
                    .on('error', () => {
                        if (delayed !== -1) {
                            delayed--;
                            finalize();
                        }
                    })
                    .pipe(stream);
                }
            }
            setTimeout(finalize, processingTime);
        }
        catch (err) {
            res.json({ application: `FILE: ${fileerror}`, system: err });
        }
    }
    catch (err) {
        res.json({ application: `DIRECTORY: ${directory}`, system: err });
    }
});

app.get('/api/downloadtobrowser', (req, res) => {
    if (req.query.filename && req.query.filename.trim() !== '') {
        res.sendFile(req.query.filename, (err) => {
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