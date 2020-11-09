import type Resource from './resource';
import type Node from './node';

import { appendSeparator, createFileMatch } from './lib/util';

type FileActionOptions = squared.FileActionOptions;
type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

const { SERVER_REQUIRED } = squared.lib.error;

const { fromLastIndexOf, trimEnd } = squared.lib.util;
const { createElement } = squared.lib.dom;

export default abstract class File<T extends Node> implements squared.base.File<T> {
    public static downloadFile(data: Blob, filename: string, mimeType?: string) {
        const blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
        const href = window.URL.createObjectURL(blob);
        const element = createElement('a', {
            style: { display: 'none' },
            attrs: { href, download: filename }
        }) as HTMLAnchorElement;
        if (!element.download) {
            element.setAttribute('target', '_blank');
        }
        const body = document.body;
        body.appendChild(element);
        element.click();
        body.removeChild(element);
        setTimeout(() => window.URL.revokeObjectURL(href), 1);
    }

    public resource!: Resource<T>;
    public assets: RawAsset[] = [];
    public readonly archiveFormats = new Set(['zip', 'tar', 'gz', 'tgz']);

    private _hostname = '';
    private _endpoints = {
        ASSETS_COPY: '/api/assets/copy',
        ASSETS_ARCHIVE: '/api/assets/archive',
        BROWSER_DOWNLOAD: '/api/browser/download?filepath=',
        LOADER_JSON: '/api/loader/json?filepath='
    };

    public abstract copyTo(directory: string, options?: FileCopyingOptions): FileActionResult;
    public abstract appendTo(pathname: string, options?: FileArchivingOptions): FileActionResult;
    public abstract saveAs(filename: string, options?: FileArchivingOptions): FileActionResult;

    public abstract get userSettings(): UserResourceSettings;

    public getDataMap(options: FileActionOptions): Void<PlainObject> {}
    public getCopyQueryParameters(options: FileCopyingOptions) { return ''; }
    public getArchiveQueryParameters(options: FileArchivingOptions) { return ''; }

    public saveFiles(format: string, options: FileArchivingOptions) {
        return this.archiving({ filename: this.userSettings.outputArchiveName, ...options, format });
    }

    public appendFiles(filename: string, options: FileArchivingOptions) {
        return this.archiving({ ...options, appendTo: filename });
    }

    public copyFiles(directory: string, options: FileCopyingOptions) {
        return this.copying({ ...options, directory });
    }

    public addAsset(asset: RawAsset) {
        if (asset.content || asset.uri || asset.base64) {
            const { pathname, filename } = asset;
            const append = this.assets.find(item => item.pathname === pathname && item.filename === filename);
            if (append) {
                Object.assign(append, asset);
            }
            else {
                this.assets.push(asset);
            }
        }
    }

    public reset() {
        this.assets = [];
    }

    public loadJSON<U = unknown>(value: string) {
        if (this.hasHttpProtocol()) {
            return fetch(this.hostname + this._endpoints.LOADER_JSON + encodeURIComponent(value), {
                method: 'GET',
                headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' })
            })
            .then(response => (response.json() as unknown) as U);
        }
        return Promise.resolve();
    }

    public copying(options: FileCopyingOptions) {
        if (this.hasHttpProtocol()) {
            const body = this.createRequestBody(options.assets, options);
            if (body && options.directory) {
                return fetch(
                    this.hostname + this._endpoints.ASSETS_COPY +
                    '?to=' + encodeURIComponent(options.directory.trim()) +
                    '&empty=' + (this.userSettings.outputEmptyCopyDirectory ? '1' : '0') +
                    this.getCopyQueryParameters(options), {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(body)
                    }
                )
                .then(async response => await response.json() as ResultOfFileAction)
                .then(result => {
                    if (result) {
                        if (typeof options.callback === 'function') {
                            options.callback(result);
                        }
                        if (result.system) {
                            (this.userSettings.showErrorMessages ? alert : console.log)(result.application + '\n\n' + result.system);
                        }
                        return result;
                    }
                });
            }
        }
        else {
            (this.userSettings.showErrorMessages ? alert : console.log)(SERVER_REQUIRED);
        }
        return Promise.resolve();
    }

    public archiving(options: FileArchivingOptions) {
        if (this.hasHttpProtocol()) {
            const body = this.createRequestBody(options.assets, options);
            let filename = options.filename?.trim();
            if (body && filename) {
                const index = filename.lastIndexOf('.');
                let format: string;
                if (index !== -1) {
                    format = filename.substring(index + 1).toLowerCase();
                    if (this.archiveFormats.has(format)) {
                        filename = filename.substring(0, index);
                    }
                    else {
                        format = '';
                    }
                }
                format ||= (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase();
                return fetch(
                    this.hostname + this._endpoints.ASSETS_ARCHIVE +
                    '?filename=' + encodeURIComponent(filename) +
                    '&format=' + format +
                    '&to=' + encodeURIComponent((options.copyTo || '').trim()) +
                    '&append_to=' + encodeURIComponent((options.appendTo || '').trim()) +
                    this.getArchiveQueryParameters(options), {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(body)
                    }
                )
                .then(async response => await response.json() as ResultOfFileAction)
                .then(result => {
                    if (result) {
                        if (typeof options.callback === 'function') {
                            options.callback(result);
                        }
                        const zipname = result.zipname;
                        if (zipname) {
                            fetch(this.hostname + this._endpoints.BROWSER_DOWNLOAD + encodeURIComponent(zipname))
                                .then(async download => File.downloadFile(await download.blob(), fromLastIndexOf(zipname, '/', '\\')));
                        }
                        else if (result.system) {
                            (this.userSettings.showErrorMessages ? alert : console.log)(result.application + '\n\n' + result.system);
                        }
                        return result;
                    }
                });
            }
        }
        else {
            (this.userSettings.showErrorMessages ? alert : console.log)(SERVER_REQUIRED);
        }
        return Promise.resolve();
    }

    public setAPIEndpoint(name: string, value: string) {
        this._endpoints[name] = value;
    }

    protected createRequestBody(assets: Undef<FileAsset[]>, options: FileCopyingOptions | FileArchivingOptions) {
        const body = (assets ? assets.concat(this.assets) : this.assets) as RequestAsset[];
        const asset = body[0];
        if (asset) {
            const taskMap = this.userSettings.outputTasksMap;
            let unassigned: Undef<FileAsset[]>;
            for (const task in taskMap) {
                const pattern = createFileMatch(task);
                unassigned ||= body.filter(item => !item.tasks);
                for (const item of unassigned) {
                    if (pattern.test(appendSeparator(item.pathname, item.filename))) {
                        (item.tasks ||= []).push(...taskMap[task]);
                    }
                }
            }
            if (options.exclusions) {
                asset.exclusions = options.exclusions;
            }
            const dataMap = this.getDataMap(options);
            if (dataMap) {
                asset.dataMap = dataMap;
            }
            return body;
        }
    }

    private hasHttpProtocol() {
        return (this._hostname || location.protocol).startsWith('http');
    }

    set hostname(value) {
        this._hostname = value.startsWith('http') ? trimEnd(value, '/') : '';
    }
    get hostname() {
        return this._hostname || location.origin;
    }
}