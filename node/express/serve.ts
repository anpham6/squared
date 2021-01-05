import type { Arguments, ExtendedSettings, IFileManager, Settings as ISettings, ImageConstructor, RequestBody } from '@squared-functions/types';
import type { ResponseData } from '@squared-functions/types/lib/squared';
import type { CorsOptions } from 'cors';
import type { IRoute } from 'express';

import path = require('path');
import fs = require('fs-extra');
import yargs = require('yargs');
import express = require('express');
import cors = require('cors');
import body_parser = require('body-parser');
import request = require('request');
import uuid = require('uuid');
import archiver = require('archiver');
import _7z = require('7zip-min');
import yaml = require('js-yaml');
import chalk = require('chalk');

import FileManager = require('@squared-functions/file-manager');

type RouteHandler = { [K in keyof Omit<IRoute, "path" | "stack"> | "connect" | "propfind" | "proppatch"]: string };

interface Route extends Partial<RouteHandler> {
    mount?: string;
    path?: string;
    handler?: string | string[];
}

interface RoutingModule {
    [key: string]: Route[];
}

interface Settings extends ISettings {
    cors?: CorsOptions;
    env?: string;
    port?: StringMap;
    routing?: RoutingModule;
    request_post_limit?: string;
}

const app = express();
app.use(body_parser.urlencoded({ extended: true }));

const Node = FileManager.moduleNode();

let Image: Undef<ImageConstructor>,
    chromeModule: Undef<ExtendedSettings.ChromeModule>,
    gulpModule: Undef<ExtendedSettings.GulpModule>,
    cloudModule: Undef<ExtendedSettings.CloudModule>,
    compressModule: Undef<ExtendedSettings.CompressModule>,
    watchInterval: Undef<number>;

function installModules(manager: IFileManager, query: StringMap) {
    const { chrome, watch, release } = query;
    if (Image) {
        manager.install('image', Image);
    }
    if (gulpModule) {
        manager.install('gulp', gulpModule);
    }
    if (cloudModule) {
        manager.install('cloud', cloudModule);
    }
    if (chrome === '1') {
        if (chromeModule) {
            manager.install('chrome', chromeModule, release === '1');
        }
        if (compressModule) {
            manager.install('compress', compressModule);
        }
    }
    if (watch === '1') {
        manager.install('watch', watchInterval);
    }
}

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
        .argv as Arguments;

    let { NODE_ENV: ENV, PORT } = process.env,
        ignorePermissions = false;
    if (argv.accessAll) {
        Node.setDiskRead();
        Node.setDiskWrite();
        Node.setUNCRead();
        Node.setUNCWrite();
        ignorePermissions = true;
    }
    else {
        if (argv.accessDisk) {
            Node.setDiskRead();
            Node.setDiskWrite();
            ignorePermissions = true;
        }
        else {
            if (argv.diskRead) {
                Node.setDiskRead();
                ignorePermissions = true;
            }
            if (argv.diskWrite) {
                Node.setDiskWrite();
                ignorePermissions = true;
            }
        }
        if (argv.accessUnc) {
            Node.setUNCRead();
            Node.setUNCWrite();
            ignorePermissions = true;
        }
        else {
            if (argv.uncRead) {
                Node.setUNCRead();
                ignorePermissions = true;
            }
            if (argv.uncWrite) {
                Node.setUNCWrite();
                ignorePermissions = true;
            }
        }
    }

    let settings: Settings = {};
    try {
        settings = fs.existsSync('./squared.settings.yml') && yaml.safeLoad(fs.readFileSync(path.resolve('./squared.settings.yml'), 'utf8')) as Settings || require('./squared.settings.json');
        ({ compress: compressModule, cloud: cloudModule, gulp: gulpModule, chrome: chromeModule } = settings);
        FileManager.loadSettings(settings, ignorePermissions);

        Image = require(settings.image?.command || '@squared-functions/image/jimp');
    }
    catch (err) {
        Image = require('@squared-functions/image/jimp');
        Node.writeFail('Unable to load settings', err);
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
        const expressMethods: (keyof RouteHandler)[] = [
            'all',
            'get',
            'post',
            'put',
            'delete',
            'patch',
            'options',
            'head',
            'checkout',
            'connect',
            'copy',
            'lock',
            'merge',
            'mkactivity',
            'mkcol',
            'move',
            'm-search',
            'notify',
            'propfind',
            'proppatch',
            'purge',
            'report',
            'search',
            'subscribe',
            'trace',
            'unlock',
            'unsubscribe'
        ];
        let mounts = 0,
            routes = 0;
        for (const item of [settings.routing['__SHARED__'], settings.routing[ENV]]) {
            if (Array.isArray(item)) {
                for (const route of item) {
                    const { path: dirname, mount } = route;
                    if (dirname && mount) {
                        const pathname = path.join(__dirname, mount);
                        try {
                            app.use(dirname, express.static(pathname));
                            Node.formatMessage(Node.logType.SYSTEM, 'MOUNT', `${chalk.bgGrey(pathname)} ${chalk.yellow('->')} ${chalk.bold(dirname)}`, '', { titleColor: 'yellow' });
                            ++mounts;
                        }
                        catch (err) {
                            Node.writeFail(['Unable to mount directory', dirname], err);
                        }
                    }
                    else {
                        let handler = route.handler;
                        if (handler) {
                            if (typeof handler === 'string') {
                                handler = [handler];
                            }
                            let callback: FunctionType<string>[] | FunctionType<string> = [];
                            for (const content of handler) {
                                const method = Node.parseFunction(content);
                                if (method) {
                                    callback.push(method);
                                }
                            }
                            switch (callback.length) {
                                case 0:
                                    continue;
                                case 1:
                                    callback = callback[0];
                                    break;
                            }
                            let found = false;
                            for (const attr of expressMethods) {
                                const pathname = route[attr];
                                if (pathname && typeof pathname === 'string') {
                                    try {
                                        app[attr](pathname, callback);
                                        Node.formatMessage(Node.logType.SYSTEM, 'ROUTE', chalk.bgGrey(pathname), '', { titleColor: 'yellow' });
                                        ++routes;
                                    }
                                    catch (err) {
                                        Node.writeFail(['Unable to create route', pathname], err);
                                    }
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                app.use(callback);
                            }
                        }
                    }
                }
            }
        }
        if (mounts) {
            console.log(`\n${chalk.bold(mounts)} ${mounts === 1 ? 'directory was' : 'directories were'} mounted.${routes ? '' : '\n'}`);
        }
        if (routes) {
            console.log(`\n${chalk.bold(routes)} ${routes === 1 ? 'route was' : 'routes were'} created.\n`);
        }
    }
    else {
        ENV ||= 'development';
        app.use('/', express.static(path.join(__dirname, 'html')));
        app.use('/dist', express.static(path.join(__dirname, 'dist')));
        Node.writeFail('Routing not defined');
    }

    Node.formatMessage(Node.logType.SYSTEM, 'DISK', (Node.hasDiskRead() ? chalk.green('+') : chalk.red('-')) + 'r ' + (Node.hasDiskWrite() ? chalk.green('+') : chalk.red('-')) + 'w', '', { titleColor: 'blue' });
    Node.formatMessage(Node.logType.SYSTEM, 'UNC', (Node.hasUNCRead() ? chalk.green('+') : chalk.red('-')) + 'r ' + (Node.hasUNCWrite() ? chalk.green('+') : chalk.red('-')) + 'w', '', { titleColor: 'blue' });

    if (argv.cors) {
        app.use(cors({ origin: argv.cors }));
        app.options('*', cors());
    }
    else if (settings.cors && settings.cors.origin) {
        app.use(cors(settings.cors));
        app.options('*', cors());
        argv.cors = typeof settings.cors.origin === 'string' ? settings.cors.origin : 'true';
    }

    Node.formatMessage(Node.logType.SYSTEM, 'CORS', argv.cors ? chalk.green(argv.cors) : chalk.grey('disabled'), '', { titleColor: 'blue' });

    if (argv.port) {
        PORT = argv.port.toString();
    }
    else if (!PORT && settings.port) {
        PORT = settings.port[ENV];
    }

    PORT = +PORT! >= 0 && PORT || '3000';

    app.use(body_parser.json({ limit: settings.request_post_limit || '250mb' }));
    app.listen(PORT, () => {
        console.log('');
        Node.formatMessage(Node.logType.SYSTEM, ENV!.toUpperCase(), 'Express server listening on port ' + chalk.bold(PORT), '', { titleColor: ENV!.startsWith('prod') ? 'green' : 'yellow' });
        console.log('');
    });
    process.env.NODE_ENV = ENV;
    process.env.PORT = PORT;
}

app.post('/api/v1/assets/copy', (req, res) => {
    const query = req.query;
    const dirname = path.normalize(query.to as string);
    if (dirname && FileManager.hasPermissions(dirname, res)) {
        try {
            const manager = new FileManager(
                dirname,
                req.body as RequestBody,
                function(this: IFileManager) {
                    res.json({ success: this.files.size > 0, files: Array.from(this.files) } as ResponseData);
                    manager.formatMessage(Node.logType.NODE, 'WRITE', [dirname, this.files.size + ' files'], '');
                }
            );
            installModules(manager, query as StringMap);
            manager.processAssets(query.empty === '1');
        }
        catch (err) {
            res.json({ success: false, error: { hint: 'FILE: Unknown', message: (err as Error).toString() } } as ResponseData);
        }
    }
});

app.post('/api/v1/assets/archive', (req, res) => {
    const query = req.query;
    const copy_to = query.to && path.normalize(query.to as string);
    const dirname = path.join(__dirname, 'tmp' + path.sep + uuid.v4());
    let dirname_zip: string;
    try {
        fs.mkdirpSync(dirname);
        if (copy_to && FileManager.hasPermissions(copy_to, res)) {
            dirname_zip = copy_to;
        }
        else {
            dirname_zip = dirname + '-zip';
            fs.mkdirpSync(dirname_zip);
        }
    }
    catch (err) {
        res.json({ success: false, error: { hint: `DIRECTORY: ${dirname}`, message: (err as Error).toString() } } as ResponseData);
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
        const archive = archiver(format, { zlib: { level: FileManager.moduleCompress().gzipLevel } });
        const manager = new FileManager(
            dirname,
            req.body as RequestBody,
            () => {
                archive.directory(dirname, false);
                archive.finalize();
            }
        );
        installModules(manager, query as StringMap);
        zipname = path.join(dirname_zip, (query.filename || zipname || uuid.v4()) + '.' + format);
        const output = fs.createWriteStream(zipname);
        output.on('close', () => {
            const success = manager.files.size > 0;
            const response: ResponseData = {
                success,
                zipname,
                files: Array.from(manager.files),
                bytes: archive.pointer()
            };
            if (formatGzip && success) {
                const gz = query.format === 'tgz' ? zipname.replace(/tar$/, 'tgz') : zipname + '.gz';
                FileManager.moduleCompress().createWriteStreamAsGzip(zipname, gz)
                    .on('finish', () => {
                        response.zipname = gz;
                        response.bytes = FileManager.getFileSize(gz);
                        manager.formatMessage(Node.logType.NODE, 'WRITE', [path.basename(gz), response.bytes + ' bytes'], '');
                        res.json(response);
                    })
                    .on('error', err => {
                        response.success = false;
                        manager.writeFail(['Unable to compress file', gz], err);
                        res.json(response);
                    });
            }
            else {
                res.json(response);
                manager.formatMessage(Node.logType.NODE, 'WRITE', [path.basename(zipname), response.bytes + ' bytes'], '');
            }
        });
        archive.pipe(output);
        try {
            if (unzip_to) {
                archive.directory(unzip_to, false);
            }
            manager.processAssets();
        }
        catch (err) {
            res.json({ success: false, error: { hint: 'FILE: Unknown', message: (err as Error).toString() } } as ResponseData);
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
                        Node.writeFail(['Unable to decompress file', zippath], err);
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
                                Node.writeFail(['Unable to download file', append_to], statusCode + ' ' + response.statusMessage);
                            }
                        })
                        .on('error', () => resumeThread())
                        .pipe(stream);
                    return;
                }
                else if (fs.existsSync(append_to)) {
                    if (Node.isFileUNC(append_to)) {
                        if (!Node.hasUNCRead()) {
                            res.json({ success: false, error: { hint: 'OPTION: --unc-read', message: 'Reading from UNC shares is not enabled.' } } as ResponseData);
                            return;
                        }
                    }
                    else if (!Node.hasDiskRead() && path.isAbsolute(append_to)) {
                        res.json({ success: false, error: { hint: 'OPTION: --disk-read', message: 'Reading from disk is not enabled.' } } as ResponseData);
                        return;
                    }
                    fs.copyFile(append_to, zippath, decompress);
                    return;
                }
                Node.writeFail('Archive not found', append_to);
            }
            catch (err) {
                Node.writeFail(zippath, err);
            }
        }
        else {
            Node.writeFail('Invalid archive format', append_to);
        }
    }
    resumeThread();
});

app.get('/api/v1/browser/download', (req, res) => {
    const uri = req.query.uri as string;
    if (uri) {
        res.sendFile(uri, err => {
            if (err) {
                Node.writeFail(['Unable to send file', uri], err);
            }
        });
    }
});

app.get('/api/v1/loader/json', (req, res) => {
    const uri = req.query.uri as string;
    let valid = true;
    if (uri) {
        const loadContent = (message: unknown, body: string) => {
            let data: Undef<string | object>;
            if (!message) {
                try {
                    switch (path.extname(uri).toLowerCase()) {
                        case '.json':
                        case '.js':
                            data = JSON.parse(body);
                            break;
                        case '.yaml':
                        case '.yml':
                            data = yaml.load(body);
                            break;
                    }
                }
                catch (err) {
                    message = err;
                }
            }
            if (typeof data === 'object') {
                res.json({ success: true, data } as ResponseData);
            }
            else {
                res.json({ success: false, error: { hint: `FILE: Unable to download (${uri})`, message } } as ResponseData);
            }
        };
        if (Node.isFileURI(uri)) {
            request(uri, (err, response) => loadContent(err, response.body));
        }
        else if (fs.existsSync(uri)) {
            if (Node.isFileUNC(uri)) {
                if (!Node.hasUNCRead()) {
                    valid = false;
                }
            }
            else if (!Node.hasDiskRead()) {
                valid = false;
            }
            if (valid) {
                fs.readFile(uri, 'utf8', (err, data) => loadContent(err, data));
            }
        }
    }
    if (!valid) {
        res.json({ success: false, error: { hint: 'FILE: Unknown', message: uri } } as ResponseData);
    }
});