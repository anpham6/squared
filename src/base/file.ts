type FileActionOptions = squared.base.FileActionOptions;
type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

const { frameworkNotInstalled } = squared.lib.session;
const { fromLastIndexOf, trimEnd } = squared.lib.util;

export default abstract class File<T extends squared.base.Node> implements squared.base.File<T> {
    public static downloadFile(data: Blob, filename: string, mimeType?: string) {
        const blob = new Blob([data], { type: mimeType || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.style.setProperty('display', 'none');
        element.setAttribute('href', url);
        element.setAttribute('download', filename);
        if (!element.download) {
            element.setAttribute('target', '_blank');
        }
        const body = document.body;
        body.appendChild(element);
        element.click();
        body.removeChild(element);
        setTimeout(() => window.URL.revokeObjectURL(url), 1);
    }

    private _hostname?: string;

    public readonly assets: RawAsset[] = [];
    public abstract resource: squared.base.Resource<T>;

    public abstract copyToDisk(directory: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    public abstract appendToArchive(pathname: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    public abstract saveToArchive(filename: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;

    public abstract get userSettings(): UserResourceSettings;

    public getDataMap(options: FileActionOptions) {
        return undefined;
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return '';
    }

    public getArchiveQueryParameters(options: FileArchivingOptions) {
        return '';
    }

    public createFrom(format: string, options: FileArchivingOptions) {
        return this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            format
        });
    }

    public appendFromArchive(filename: string, options: FileArchivingOptions) {
        return this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            appendTo: filename,
            format: filename.substring(filename.lastIndexOf('.') + 1)
        });
    }

    public addAsset(asset: Partial<RawAsset>) {
        if (asset.content || asset.bytes || asset.base64 || asset.uri) {
            const { pathname, filename } = asset;
            const append = this.assets.find(item => item.pathname === pathname && item.filename === filename);
            if (append) {
                Object.assign(append, asset);
            }
            else {
                this.assets.push(asset as RawAsset);
            }
        }
    }

    public reset() {
        this.assets.length = 0;
    }

    public copying(options: FileCopyingOptions) {
        if (this.hasHttpProtocol()) {
            const body = this.createRequestBody(options.assets, options);
            if (body && options.directory) {
                return fetch(
                    this.hostname +
                    '/api/assets/copy' +
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
                    }
                    return result;
                });
            }
        }
        else {
            (this.userSettings.showErrorMessages ? alert : console.log)('SERVER (required): See README for instructions');
        }
        return frameworkNotInstalled();
    }

    public archiving(options: FileArchivingOptions) {
        if (this.hasHttpProtocol()) {
            const body = this.createRequestBody(options.assets, options);
            if (body && options.filename) {
                return fetch(
                    this.hostname +
                    '/api/assets/archive' +
                    '?filename=' + encodeURIComponent(options.filename.trim()) +
                    '&format=' + (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase() +
                    '&to=' + encodeURIComponent((options.copyTo || '').trim()) +
                    '&append_to=' + encodeURIComponent((options.appendTo || '').trim()) +
                    this.getArchiveQueryParameters(options), {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(body)
                    }
                )
                .then(async (response: Response) => await response.json() as ResultOfFileAction)
                .then(result => {
                    if (result) {
                        if (typeof options.callback === 'function') {
                            options.callback(result);
                        }
                        const zipname = result.zipname;
                        if (zipname) {
                            fetch('/api/browser/download?filepath=' + encodeURIComponent(zipname))
                                .then(async download => File.downloadFile(await download.blob(), fromLastIndexOf(zipname, '/', '\\')));
                        }
                        else if (result.system) {
                            (this.userSettings.showErrorMessages ? alert : console.log)(result.application + '\n\n' + result.system);
                        }
                    }
                    return result;
                });
            }
        }
        else {
            (this.userSettings.showErrorMessages ? alert : console.log)('SERVER (required): See README for instructions');
        }
        return frameworkNotInstalled();
    }

    protected createRequestBody(assets: Undef<FileAsset[]>, options: FileCopyingOptions | FileArchivingOptions) {
        const body = (assets ? assets.concat(this.assets) : this.assets) as RequestAsset[];
        const asset = body[0];
        if (asset) {
            if (options.exclusions) {
                asset.exclusions = options.exclusions;
            }
            const dataMap = this.getDataMap(options);
            if (dataMap) {
                asset.dataMap = dataMap;
            }
            return body;
        }
        return undefined;
    }

    private hasHttpProtocol() {
        return (this._hostname || location.protocol).startsWith('http');
    }

    set hostname(value) {
        if (value?.startsWith('http')) {
            this._hostname = trimEnd(value, '/');
        }
    }
    get hostname() {
        return this._hostname || location.origin;
    }
}