import type Resource from './resource';
import type Node from './node';

import { appendSeparator, parseGlob, randomUUID } from './lib/util';

type FileActionResult = Promise<Void<ResponseData>>;
type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

const { DIRECTORY_NOT_PROVIDED, INVALID_ASSET_REQUEST, SERVER_REQUIRED } = squared.lib.error;

const { createElement } = squared.lib.dom;
const { fromLastIndexOf, isPlainObject, splitPair, startsWith, trimEnd } = squared.lib.util;

function validateAsset(file: FileAsset, exclusions: Exclusions) {
    const { pathname, filename } = file;
    const glob = exclusions.glob as (string | IGlobExp)[];
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
            const dirname = trimEnd(value.replace(/\\/g, '/'), '/');
            if (new RegExp(`^${dirname}/?`).test(pathname)) {
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
    public static downloadFile(data: Blob | string, filename?: string, mimeType?: string) {
        const href = typeof data ==='string' ? data : URL.createObjectURL(new Blob([data], { type: mimeType || 'application/octet-stream' }));
        const element = createElement('a', {
            style: { display: 'none' },
            attrs: { href, download: filename }
        }) as HTMLAnchorElement;
        if (!element.download) {
            element.setAttribute('target', '_blank');
        }
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => URL.revokeObjectURL(href), 1);
    }

    public resource!: Resource<T>;
    public readonly archiveFormats = ['zip', '7z', 'tar', 'gz', 'tgz'];

    private _hostname = '';
    private _endpoints = {
        ASSETS_COPY: '/api/v1/assets/copy',
        ASSETS_ARCHIVE: '/api/v1/assets/archive',
        LOADER_DATA: '/api/v1/loader/data'
    };

    public abstract copyTo(pathname: string, options?: FileCopyingOptions): FileActionResult;
    public abstract appendTo(uri: string, options?: FileArchivingOptions): FileActionResult;
    public abstract saveAs(filename: string, options?: FileArchivingOptions): FileActionResult;

    public abstract get userSettings(): UserResourceSettings;

    public finalizeRequestBody(data: RequestData, options: FileCopyingOptions & FileArchivingOptions) {}
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

    public loadData(value: string, options: LoadDataOptions): Promise<unknown> {
        const { type, mime, cache } = options;
        if (this.hasHttpProtocol() && type) {
            return fetch(getEndpoint(this.hostname, this._endpoints.LOADER_DATA) + `/${type}?key=` + encodeURIComponent(value) + (typeof cache === 'boolean' ? '&cache=' + (cache ? '1' : '0') : '') + (mime ? '&mime=' + encodeURIComponent(mime) : ''), {
                method: 'GET',
                headers: new Headers({ Accept: options.accept || '*/*' })
            })
            .then(response => {
                switch (type) {
                    case 'json':
                        return response.json();
                    case 'blob':
                        return response.blob();
                    case 'text':
                    case 'document':
                        return response.text();
                    case 'arraybuffer':
                        return response.arrayBuffer();
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
                const body = this.createRequestBody(options.assets, options);
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
                    .then(async response => {
                        const result: ResponseData = await response.json();
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
            const body = this.createRequestBody(options.assets, options);
            if (body) {
                let { filename, format } = options;
                const setFilename = () => {
                    if (!format || !this.archiveFormats.includes(format = format.toLowerCase())) {
                        [filename, format] = splitPair(filename!, '.', true, true);
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
                .then(async response => {
                    const result: ResponseData = await response.json();
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

    protected createRequestBody(assets: Undef<FileAsset[]>, options: FileCopyingOptions | FileArchivingOptions) {
        if (assets && assets.length) {
            const exclusions = options.exclusions;
            if (exclusions) {
                assets = assets.filter(item => validateAsset(item, exclusions));
                if (!assets.length) {
                    return;
                }
            }
            let socketId: Undef<string>;
            const documentName = new Set(options.document);
            const taskName = new Set<string>();
            const getSocketId = () => socketId ||= randomUUID();
            for (let i = 0, length = assets.length; i < length; ++i) {
                const { document, tasks, watch } = assets[i];
                if (document) {
                    if (Array.isArray(document)) {
                        document.forEach(value => documentName.add(value));
                    }
                    else {
                        documentName.add(document);
                    }
                }
                if (tasks) {
                    tasks.forEach(item => taskName.add(item.handler));
                }
                if (options.watch && isPlainObject<WatchInterval>(watch) && watch.reload === true) {
                    watch.reload = { socketId: getSocketId() };
                }
            }
            const { outputTasks, outputWatch } = this.userSettings;
            for (let i = 0; i < 2; ++i) {
                if (i === 1 && !options.watch) {
                    break;
                }
                const [output, attr] = i === 0 ? [outputTasks, 'tasks'] : [outputWatch, 'watch'];
                let unassigned: Undef<FileAsset[]>;
                for (const module in output) {
                    unassigned ||= assets.filter(item => !item[attr]);
                    let length = unassigned.length;
                    if (length) {
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
                                        for (const task of value) {
                                            addTask(task);
                                        }
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
                                        item.watch = { ...value };
                                        if (item.watch.reload === true) {
                                            item.watch.reload = { socketId: getSocketId() };
                                        }
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
            const data: RequestData = { assets, document: Array.from(documentName) };
            if (taskName.size) {
                data.task = Array.from(taskName);
            }
            this.finalizeRequestBody(data, options);
            return data;
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