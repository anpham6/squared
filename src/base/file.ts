import type Resource from './resource';
import type Node from './node';

import { appendSeparator, generateUUID, parseGlob, trimEnd } from './lib/util';

type FileActionResult = Promise<Void<ResponseData>>;
type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

const { DIRECTORY_NOT_PROVIDED, INVALID_ASSET_REQUEST, SERVER_REQUIRED } = squared.lib.error;

const { createElement } = squared.lib.dom;
const { escapePattern, fromLastIndexOf, lastItemOf, isPlainObject, replaceAll, splitPair, startsWith } = squared.lib.util;

function validateAsset(file: FileAsset, exclusions: Exclusions) {
    const { pathname, filename } = file;
    const glob = exclusions.glob as Undef<(string | IGlobExp)[]>;
    const url = appendSeparator(pathname, filename);
    if (glob) {
        for (let i = 0, length = glob.length; i < length; ++i) {
            let value = glob[i];
            if (typeof value === 'string') {
                value = parseGlob(value, { fromEnd: true });
                glob[i] = value;
            }
            if (value.test(url)) {
                return false;
            }
        }
    }
    if (exclusions.pathname) {
        for (const value of exclusions.pathname) {
            if (new RegExp(`^${escapePattern(trimEnd(replaceAll(value, '\\', '/'), '/'))}/?`).test(pathname)) {
                return false;
            }
        }
    }
    if (exclusions.filename) {
        for (const value of exclusions.filename) {
            if (value === filename) {
                return false;
            }
        }
    }
    if (exclusions.extension) {
        const ext = fromLastIndexOf(filename, '.').toLowerCase();
        for (const value of exclusions.extension) {
            if (ext === value.toLowerCase()) {
                return false;
            }
        }
    }
    if (exclusions.pattern) {
        for (const value of exclusions.pattern) {
            if (new RegExp(value).test(url)) {
                return false;
            }
        }
    }
    return true;
}

const getEndpoint = (hostname: string, endpoint: string) => startsWith(endpoint, 'http') ? endpoint : hostname + endpoint;

export default abstract class File<T extends Node> implements squared.base.File<T> {
    public static downloadFile(href: string | Blob, filename?: string, mimeType?: string) {
        if (typeof href !== 'string') {
            href = URL.createObjectURL(new Blob([href], { type: mimeType || 'application/octet-stream' }));
        }
        const element = createElement('a', { style: { display: 'none' }, attributes: { href } }) as HTMLAnchorElement;
        if (filename) {
            element.download = filename;
        }
        else {
            element.setAttribute('target', '_blank');
        }
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => URL.revokeObjectURL(href as string), 1);
    }

    public static copyDocument(value: StringOfArray) {
        return Array.isArray(value) ? value.slice(0) : value;
    }

    public static findConfigUri(options: Undef<squared.FileActionOptions>) {
        const config = options?.config;
        if (config) {
            if (config.uri) {
                return config.uri;
            }
            if (config.mimeType) {
                const pathname = location.pathname;
                return location.origin + pathname + (lastItemOf(pathname) === '/' ? 'index' : '') + '.' + config.mimeType;
            }
        }
    }

    public readonly archiveFormats = ['zip', 'tar', '7z', 'gz', 'tgz'];

    private _hostname = '';
    private _endpoints = {
        ASSETS_COPY: '/api/v1/assets/copy',
        ASSETS_ARCHIVE: '/api/v1/assets/archive',
        LOADER_DATA: '/api/v1/loader/data'
    };

    constructor(public resource: Resource<T>) {
        resource.fileHandler = this;
    }

    public abstract copyTo(pathname: string, options?: FileCopyingOptions): FileActionResult;
    public abstract appendTo(uri: string, options?: FileArchivingOptions): FileActionResult;
    public abstract saveAs(filename: string, options?: FileArchivingOptions): FileActionResult;

    public abstract get userSettings(): UserResourceSettings;

    public finalizeRequestBody(options: RequestData) {}
    public getCopyQueryParameters(options: FileCopyingOptions) { return ''; }
    public getArchiveQueryParameters(options: FileArchivingOptions) { return ''; }

    public saveFiles(filename: string, options: FileArchivingOptions) {
        return this.archiving('', { ...options, filename });
    }

    public appendFiles(target: string, options: FileArchivingOptions) {
        return this.archiving(target, { ...options });
    }

    public copyFiles(pathname: string, options: FileCopyingOptions) {
        return this.copying(pathname, { ...options });
    }

    public async loadConfig(uri: string, options?: squared.FileActionOptions) {
        let mimeType: Undef<string>,
            cache: Undef<boolean>;
        if (options) {
            let config: Undef<squared.FileActionConfig>;
            ({ config, cache } = options);
            if (config) {
                mimeType = config.mimeType;
            }
        }
        const config = await this.loadData(uri, { type: 'json', mimeType, cache }) as Null<ResponseData>;
        if (config) {
            if (config.success && Array.isArray(config.data)) {
                return config.data as OutputCommand[];
            }
            const error = config.error;
            if (error) {
                this.writeError(error.message, error.hint);
            }
        }
    }

    public loadData(value: string, options: LoadDataOptions): Promise<unknown> {
        const { type, mimeType, cache } = options;
        if (this.hasHttpProtocol() && type) {
            return fetch(getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + `/${type}?key=` + encodeURIComponent(value) + (typeof cache === 'boolean' ? '&cache=' + (cache ? '1' : '0') : '') + (mimeType ? '&mime=' + encodeURIComponent(mimeType) : ''), {
                method: 'GET',
                headers: new Headers({ Accept: options.accept || '*/*' })
            })
            .then(res => {
                switch (type) {
                    case 'json':
                        return res.json();
                    case 'blob':
                        return res.blob();
                    case 'text':
                    case 'document':
                        return res.text();
                    case 'arraybuffer':
                        return res.arrayBuffer();
                    default:
                        return null;
                }
            });
        }
        return Promise.resolve(null);
    }

    public copying(pathname = '', options: FileCopyingOptions) {
        if (this.hasHttpProtocol()) {
            if (pathname = pathname.trim()) {
                const body = this.createRequestBody(options);
                if (body) {
                    return fetch(
                        getEndpoint(this.hostname, this._endpoints.ASSETS_COPY) +
                        '?to=' + encodeURIComponent(pathname) +
                        '&empty=' + (options.emptyDir ? '2' : this.userSettings.outputEmptyCopyDirectory ? '1' : '0') +
                        this.getCopyQueryParameters(options), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        }
                    )
                    .then(async res => {
                        const result: ResponseData = await res.json();
                        if (typeof options.callback === 'function') {
                            options.callback.call(null, result);
                        }
                        const error = result.error;
                        if (error) {
                            this.writeError(error.message, error.hint);
                        }
                        return result;
                    });
                }
                return Promise.reject(INVALID_ASSET_REQUEST);
            }
            return Promise.reject(DIRECTORY_NOT_PROVIDED);
        }
        return Promise.reject(SERVER_REQUIRED);
    }

    public archiving(target = '', options: FileArchivingOptions) {
        if (this.hasHttpProtocol()) {
            const body = this.createRequestBody(options);
            if (body) {
                let { filename, format } = options;
                const setFilename = () => {
                    if (!format || !this.archiveFormats.includes(format = format.toLowerCase())) {
                        [filename, format] = splitPair(filename!, '.', false, true);
                        if (format && !this.archiveFormats.includes(format)) {
                            filename += '.' + format;
                            format = '';
                        }
                    }
                };
                if (!target) {
                    if (!filename) {
                        filename = this.userSettings.outputArchiveName;
                    }
                    else {
                        setFilename();
                    }
                }
                else {
                    filename ||= fromLastIndexOf(target, '/', '\\');
                    setFilename();
                }
                return fetch(
                    getEndpoint(this.hostname, this._endpoints.ASSETS_ARCHIVE) +
                    '?format=' + (format || this.userSettings.outputArchiveFormat) +
                    '&filename=' + encodeURIComponent(filename) +
                    '&to=' + encodeURIComponent(options.copyTo || '') +
                    '&append_to=' + encodeURIComponent(target || '') +
                    this.getArchiveQueryParameters(options), {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(body)
                    }
                )
                .then(async res => {
                    const result: ResponseData = await res.json();
                    if (typeof options.callback === 'function') {
                        options.callback.call(null, result);
                    }
                    const { downloadKey, filename: zipname, error } = result;
                    if (downloadKey && zipname) {
                        const cache = this.userSettings.outputArchiveCache;
                        const download = await this.loadData(downloadKey, { type: 'blob', cache }) as Null<Blob>;
                        if (download) {
                            File.downloadFile(download, zipname);
                        }
                        if (cache) {
                            result.downloadUrl = getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + '/blob?key=' + downloadKey;
                        }
                    }
                    if (error) {
                        this.writeError(error.message, error.hint);
                    }
                    delete result.downloadKey;
                    return result;
                });
            }
            return Promise.reject(INVALID_ASSET_REQUEST);
        }
        return Promise.reject(SERVER_REQUIRED);
    }

    public setEndpoint(name: string, value: string) {
        this._endpoints[name] = value;
    }

    public writeError(message: string, hint?: string) {
        (this.userSettings.showErrorMessages ? alert : console.log)((hint ? hint + '\n\n' : '') + message); // eslint-disable-line no-console
    }

    protected createRequestBody(body: FileCopyingOptions & FileArchivingOptions) {
        let assets = body.assets;
        if (assets && assets.length) {
            const exclusions = body.exclusions;
            if (exclusions) {
                if ((assets = assets.filter(item => validateAsset(item, exclusions))).length === 0) {
                    return;
                }
                body.assets = assets;
            }
            let socketId: Undef<string>;
            const documentName = new Set(body.document);
            const taskName = new Set<string>();
            const setSocketId = (watch: WatchInterval) => {
                socketId ||= generateUUID();
                if (watch.reload === true) {
                    watch.reload = { socketId };
                }
                else if (watch.reload) {
                    watch.reload.socketId ||= socketId;
                }
            };
            for (let i = 0, length = assets.length; i < length; ++i) {
                const { tasks, watch, document } = assets[i];
                if (tasks) {
                    tasks.forEach(item => taskName.add(item.handler));
                }
                if (body.watch && isPlainObject<WatchInterval>(watch)) {
                    setSocketId(watch);
                }
                if (document) {
                    if (Array.isArray(document)) {
                        document.forEach(value => documentName.add(value));
                    }
                    else {
                        documentName.add(document);
                    }
                }
            }
            const { outputTasks, outputWatch } = this.userSettings;
            for (let i = 0; i < 2; ++i) {
                if (i === 1 && !body.watch) {
                    break;
                }
                const [output, attr] = i === 0 ? [outputTasks, 'tasks'] : [outputWatch, 'watch'];
                let unassigned: Undef<FileAsset[]>,
                    length: number;
                for (const module in output) {
                    unassigned ||= assets.filter(item => !item[attr]);
                    if (length = unassigned.length) {
                        const glob = parseGlob(module, { fromEnd: true });
                        for (let j = 0; j < length; ++j) {
                            const item = unassigned[j];
                            if (glob.test(appendSeparator(item.pathname, item.filename))) {
                                if (i === 0) {
                                    const value = output[module] as TaskAction | TaskAction[];
                                    const addTask = (task: TaskAction) => {
                                        item.tasks!.push(task);
                                        taskName.add(task.handler);
                                    };
                                    item.tasks ||= [];
                                    if (Array.isArray(value)) {
                                        value.forEach(task => addTask(task));
                                    }
                                    else if (isPlainObject(value)) {
                                        addTask(value);
                                    }
                                }
                                else {
                                    const value = output[module] as WatchValue;
                                    if (value === true) {
                                        item.watch = true;
                                    }
                                    else if (isPlainObject<WatchInterval>(value)) {
                                        setSocketId(item.watch = { ...value });
                                    }
                                    else {
                                        continue;
                                    }
                                    unassigned.splice(j--, 1);
                                    --length;
                                }
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            body.document = Array.from(documentName);
            if (taskName.size) {
                body.task = Array.from(taskName);
            }
            this.finalizeRequestBody(body);
            delete body.config;
            return body;
        }
    }

    private hasHttpProtocol() {
        return startsWith(this._hostname || location.protocol, 'http');
    }

    set hostname(value) {
        try {
            const url = new URL(value);
            this._hostname = startsWith(url.origin, 'http') ? url.origin : '';
        }
        catch {
        }
    }
    get hostname() {
        return this._hostname || location.origin;
    }
}