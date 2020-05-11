type FileActionOptions = squared.base.FileActionOptions;
type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

const { frameworkNotInstalled } = squared.lib.session;
const { fromLastIndexOf, isString, trimEnd } = squared.lib.util;

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

    public abstract get userSettings(): UserSettings;

    public abstract getDataMap(options: FileActionOptions): Undef<StandardMap>;
    public abstract getCopyQueryParameters(options: FileCopyingOptions): string;
    public abstract getArchiveQueryParameters(options: FileArchivingOptions): string;

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

    public addAsset(data: Partial<RawAsset>) {
        if (data.content || data.uri || data.base64) {
            const { pathname, filename } = data;
            const asset = this.assets.find(item => item.pathname === pathname && item.filename === filename);
            if (asset) {
                Object.assign(asset, data);
            }
            else {
                this.assets.push(data as RawAsset);
            }
        }
    }

    public reset() {
        this.assets.length = 0;
    }

    public copying(options: FileCopyingOptions) {
        if (this.hasHttpProtocol()) {
            const { assets, directory } = options;
            if (isString(directory)) {
                const body = (assets ? assets.concat(this.assets) : this.assets) as RequestAsset[];
                const asset = body[0];
                if (asset) {
                    asset.exclusions = options.exclusions;
                    asset.dataMap = this.getDataMap(options);
                    return fetch(
                        this.hostname +
                        '/api/assets/copy' +
                        '?to=' + encodeURIComponent(directory.trim()) +
                        '&empty=' + (this.userSettings.outputEmptyCopyDirectory ? '1' : '0') +
                        this.getCopyQueryParameters(options), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        }
                    )
                    .then((response: Response) => response.json())
                    .then((result: ResultOfFileAction) => {
                        if (result) {
                            if (typeof options.callback === 'function') {
                                options.callback(result);
                            }
                            if (this.userSettings.showErrorMessages) {
                                const { application, system } = result;
                                if (system) {
                                    alert(application + '\n\n' + system);
                                }
                            }
                        }
                        return result;
                    });
                }
            }
        }
        else if (this.userSettings.showErrorMessages) {
            alert('SERVER (required): See README for instructions');
        }
        return frameworkNotInstalled();
    }

    public archiving(options: FileArchivingOptions) {
        if (this.hasHttpProtocol()) {
            const { assets, filename } = options;
            if (isString(filename)) {
                const body = (assets ? assets.concat(this.assets) : this.assets) as RequestAsset[];
                const asset = body[0];
                if (asset) {
                    asset.exclusions = options.exclusions;
                    asset.dataMap = this.getDataMap(options);
                    return fetch(
                        this.hostname +
                        '/api/assets/archive' +
                        '?filename=' + encodeURIComponent(filename.trim()) +
                        '&format=' + (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase() +
                        '&to=' + encodeURIComponent((options.copyTo || '').trim()) +
                        '&append_to=' + encodeURIComponent((options.appendTo || '').trim()) +
                        this.getArchiveQueryParameters(options), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(body)
                        }
                    )
                    .then((response: Response) => response.json())
                    .then((result: ResultOfFileAction) => {
                        if (result) {
                            if (typeof options.callback === 'function') {
                                options.callback(result);
                            }
                            const zipname = result.zipname;
                            if (isString(zipname)) {
                                fetch('/api/browser/download?filepath=' + encodeURIComponent(zipname))
                                    .then(async (download: Response) => File.downloadFile(await download.blob(), fromLastIndexOf(zipname, '/', '\\')));
                            }
                            else if (this.userSettings.showErrorMessages) {
                                const { application, system } = result;
                                if (system) {
                                    alert(application + '\n\n' + system);
                                }
                            }
                        }
                        return result;
                    });
                }
            }
        }
        else if (this.userSettings.showErrorMessages) {
            alert('SERVER (required): See README for instructions');
        }
        return frameworkNotInstalled();
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