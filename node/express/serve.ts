import path = require('path');
import fs = require('fs-extra');
import yargs = require('yargs');
import express = require('express');
import body_parser = require('body-parser');
import cors = require('cors');
import request = require('request');
import uuid = require('uuid');
import archiver = require('archiver');
import _7z = require('7zip-min');
import chalk = require('chalk');

import functions = require('@squared-functions/file-manager');

const FileManager = functions['default'] as functions.FileManagerConstructor;

const app = express();
app.use(body_parser.urlencoded({ extended: true }));

const Node = FileManager.moduleNode();
const Compress = FileManager.moduleCompress();

{
    const argv = yargs
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
            nargs: 1
        })
        .option('port', {
            alias: 'p',
            type: 'number',
            description: 'Set HTTP port number',
            nargs: 1
        })
        .option('cors', {
            alias: 'c',
            type: 'string',
            description: 'Enable CORS access to <origin|"*">',
            nargs: 1
        })
        .epilogue('For more information and source: https://github.com/anpham6/squared')
        .argv as functions.Arguments;

    let { NODE_ENV: ENV, PORT } = process.env,
        settings: functions.Settings,
        ignorePermissions = false;
    if (argv.accessAll) {
        Node.enableDiskRead();
        Node.enableDiskWrite();
        Node.enableUNCRead();
        Node.enableUNCWrite();
        ignorePermissions = true;
    }
    else {
        if (argv.accessDisk) {
            Node.enableDiskRead();
            Node.enableDiskWrite();
            ignorePermissions = true;
        }
        else {
            if (argv.diskRead) {
                Node.enableDiskRead();
                ignorePermissions = true;
            }
            if (argv.diskWrite) {
                Node.enableDiskWrite();
                ignorePermissions = true;
            }
        }
        if (argv.accessUnc) {
            Node.enableUNCRead();
            Node.enableUNCWrite();
            ignorePermissions = true;
        }
        else {
            if (argv.uncRead) {
                Node.enableUNCRead();
                ignorePermissions = true;
            }
            if (argv.uncWrite) {
                Node.enableUNCWrite();
                ignorePermissions = true;
            }
        }
    }

    try {
        settings = require('./squared.settings.json');
        FileManager.loadSettings(settings, ignorePermissions);
    }
    catch {
        settings = {};
    }

    if (settings.routing) {
        if (argv.env && settings.routing[argv.env.trim()]) {
            ENV = argv.env.trim();
        }
        else if (ENV && !settings.routing[ENV]) {
            ENV = settings.env;
        }
        if (!ENV || !settings.routing[ENV]) {
            ENV = 'development';
        }
        console.log('');
        let mounted = 0;
        for (const routes of [settings.routing['__SHARED__'], settings.routing[ENV]]) {
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
                            console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: ${dirname} -> ${err as string}`);
                        }
                    }
                }
            }
        }
        console.log(`\n${chalk.bold(mounted)} directories were mounted.\n`);
    }
    else {
        ENV ||= 'development';
        app.use('/', express.static(path.join(__dirname, 'html')));
        app.use('/dist', express.static(path.join(__dirname, 'dist')));
        console.log(`${chalk.bold.bgGrey.blackBright('FAIL')}: Routing not defined.`);
    }

    console.log(`${chalk.blue('DISK')}: ${Node.canReadDisk() ? chalk.green('+') : chalk.red('-')}r ${Node.canWriteDisk() ? chalk.green('+') : chalk.red('-')}w`);
    console.log(`${chalk.blue(' UNC')}: ${Node.canReadUNC() ? chalk.green('+') : chalk.red('-')}r ${Node.canWriteUNC() ? chalk.green('+') : chalk.red('-')}w`);

    if (argv.cors) {
        app.use(cors({ origin: argv.cors }));
        app.options('*', cors());
    }
    else if (settings.cors && settings.cors.origin) {
        app.use(cors(settings.cors));
        app.options('*', cors());
        argv.cors = typeof settings.cors.origin === 'string' ? settings.cors.origin : 'true';
    }

    console.log(`${chalk.blue('CORS')}: ${argv.cors ? chalk.green(argv.cors) : chalk.grey('disabled')}`);

    if (argv.port) {
        PORT = argv.port.toString();
    }
    else if (!PORT && settings.port) {
        PORT = settings.port[ENV];
    }
    const port = parseInt(PORT!);
    PORT = port >= 0 ? port.toString() : '3000';

    app.use(body_parser.json({ limit: settings.request_post_limit || '250mb' }));
    app.listen(PORT, () => console.log(`\n${chalk[ENV!.startsWith('prod') ? 'green' : 'yellow'](ENV!.toUpperCase())}: Express server listening on port ${chalk.bold(PORT)}\n`));
}

app.post('/api/assets/copy', (req, res) => {
    const query = req.query;
    const dirname = path.normalize(query.to as string);
    if (dirname && FileManager.checkPermissions(res, dirname)) {
        try {
            const manager = new FileManager(
                dirname,
                req.body as functions.ExpressAsset[],
                function(this: functions.IFileManager) {
                    res.json({ success: this.files.size > 0, files: Array.from(this.files) } as functions.ResultOfFileAction);
                }
            );
            manager.emptyDirectory = query.empty === '1';
            manager.productionRelease = query.release === '1';
            manager.processAssets();
        }
        catch (system) {
            res.json({ application: 'FILE: Unknown', system });
        }
    }
});

app.post('/api/assets/archive', (req, res) => {
    const query = req.query;
    const copy_to = query.to && path.normalize(query.to as string);
    const dirname = path.join(__dirname, 'temp' + path.sep + uuid.v4());
    let dirname_zip: string;
    try {
        fs.mkdirpSync(dirname);
        if (copy_to && FileManager.checkPermissions(res, copy_to)) {
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
    let append_to = query.append_to as string,
        zipname = '',
        format: archiver.Format,
        formatGzip: Undef<boolean>;
    if (path.isAbsolute(append_to)) {
        append_to = path.normalize(append_to);
    }
    switch (query.format) {
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
    const resumeThread = (unzip_to?: string) => {
        const archive = archiver(format, { zlib: { level: Compress.gzipLevel } });
        const manager = new FileManager(
            dirname,
            req.body as functions.ExpressAsset[],
            () => {
                archive.directory(dirname, false);
                archive.finalize();
            }
        );
        manager.emptyDirectory = query.empty === '1';
        manager.productionRelease = query.release === '1';
        zipname = path.join(dirname_zip, (query.filename || zipname || uuid.v4()) + '.' + format);
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const success = manager.files.size > 0;
            const response: functions.ResultOfFileAction = {
                success,
                zipname,
                files: Array.from(manager.files),
                bytes: archive.pointer()
            };
            if (formatGzip && success) {
                const gz = query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : `${zipname}.gz`;
                Compress.createWriteStreamAsGzip(zipname, gz)
                    .on('finish', () => {
                        response.zipname = gz;
                        response.bytes = manager.getFileSize(gz);
                        res.json(response);
                        console.log(`${chalk.blue('WRITE')}: ${gz} ${chalk.yellow('[') + chalk.grey(response.bytes + ' bytes') + chalk.yellow(']')}`);
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
            console.log(`${chalk.blue('WRITE')}: ${zipname} ${chalk.yellow('[') + chalk.grey(response.bytes + ' bytes') + chalk.yellow(']')}`);
        });
        archive.pipe(output);
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            manager.processAssets();
        }
        catch (system) {
            res.json({ application: 'FILE: Unknown', system });
        }
    };
    if (append_to) {
        const match = /([^/\\]+)\.\w+?$/i.exec(append_to);
        if (match) {
            const zippath = path.join(dirname_zip, match[0]);
            const decompress = () => {
                zipname = match[1];
                const unzip_to = path.join(dirname_zip, zipname);
                _7z.unpack(zippath, unzip_to, err => {
                    if (!err) {
                        resumeThread(unzip_to);
                    }
                    else {
                        Node.writeFail(zippath, err);
                        resumeThread();
                    }
                });
            };
            try {
                if (Node.isFileURI(append_to)) {
                    const stream = fs.createWriteStream(zippath);
                    stream.on('finish', decompress);
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
                        if (!Node.canReadUNC()) {
                            res.json({ application: 'OPTION: --unc-read', system: 'Reading from UNC shares is not enabled.' });
                            return;
                        }
                    }
                    else if (!Node.canReadDisk() && path.isAbsolute(append_to)) {
                        res.json({ application: 'OPTION: --disk-read', system: 'Reading from disk is not enabled.' });
                        return;
                    }
                    fs.copyFile(append_to, zippath, decompress);
                    return;
                }
                else {
                    Node.writeFail(append_to, new Error('Archive not found.'));
                }
            }
            catch (err) {
                Node.writeFail(zippath, err);
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