import { FileArchivingOptions, FileCopyingOptions, UserSettings } from '../../@types/base/application';
import { RawAsset } from '../../@types/base/file';

const { fromLastIndexOf, isString } = squared.lib.util;

const isHttpProtocol = () => location.protocol.startsWith('http');

export interface ExpressResult {
    success: boolean;
    directory: string;
    zipname?: string;
    application?: string;
    system?: string;
}

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

    public readonly assets: RawAsset[] = [];
    public abstract resource: squared.base.Resource<T>;

    public abstract copyToDisk(directory: string, options?: FileCopyingOptions): void;
    public abstract appendToArchive(pathname: string, options?: FileArchivingOptions): void;
    public abstract saveToArchive(filename: string, options?: FileArchivingOptions): void;

    public abstract get userSettings(): UserSettings;

    public createFrom(format: string, options: FileArchivingOptions) {
        this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            format
        });
    }

    public appendFromArchive(filename: string, options: FileArchivingOptions) {
        this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            appendTo: filename,
            format: filename.substring(filename.lastIndexOf('.') + 1)
        });
    }

    public addAsset(data: Partial<RawAsset>) {
        if (data.content || data.uri || data.base64) {
            const assets = this.assets;
            const { pathname, filename } = data;
            const asset = assets.find(item => item.pathname === pathname && item.filename === filename);
             if (asset) {
                Object.assign(asset, data);
            }
            else {
                assets.push(<RawAsset> data);
            }
        }
    }

    public reset() {
        this.assets.length = 0;
    }

    public copying(options: FileCopyingOptions) {
        if (isHttpProtocol()) {
            const directory = options.directory;
            if (isString(directory)) {
                const assets = options.assets ? options.assets.concat(this.assets) : this.assets;
                if (assets.length) {
                    assets[0].exclusions = options.exclusions;
                    fetch(
                        '/api/assets/copy' +
                        '?to=' + encodeURIComponent(directory.trim()) +
                        '&empty=' + (this.userSettings.outputEmptyCopyDirectory === true ? '1' : '0'), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(assets)
                        }
                    )
                    .then((response: Response) => response.json())
                    .then((result: ExpressResult) => {
                        if (result) {
                            const callback = options.callback;
                            if (typeof callback === 'function') {
                                callback(result);
                            }
                            if (this.userSettings.showErrorMessages) {
                                const { application, system } = result;
                                if (system) {
                                    alert(application + '\n\n' + system);
                                }
                            }
                        }
                    })
                    .catch(err => {
                        if (this.userSettings.showErrorMessages) {
                            alert(`ERROR: ${err}`);
                        }
                    });
                }
            }
        }
        else if (this.userSettings.showErrorMessages) {
            alert('SERVER (required): See README for instructions');
        }
    }

    public archiving(options: FileArchivingOptions) {
        if (isHttpProtocol()) {
            const filename = options.filename;
            if (isString(filename)) {
                const assets = options.assets ? options.assets.concat(this.assets) : this.assets;
                if (assets.length) {
                    assets[0].exclusions = options.exclusions;
                    fetch(
                        '/api/assets/archive' +
                        '?filename=' + encodeURIComponent(filename.trim()) +
                        '&format=' + (options.format || this.userSettings.outputArchiveFormat).trim().toLowerCase() +
                        '&append_to=' + encodeURIComponent((options.appendTo || '').trim()), {
                            method: 'POST',
                            headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                            body: JSON.stringify(assets)
                        }
                    )
                    .then((response: Response) => response.json())
                    .then((result: ExpressResult) => {
                        if (result) {
                            const callback = options.callback;
                            if (typeof callback === 'function') {
                                callback(result);
                            }
                            const zipname = result.zipname;
                            if (isString(zipname)) {
                                fetch('/api/browser/download?filepath=' + encodeURIComponent(zipname))
                                    .then((response: Response) => response.blob())
                                    .then((blob: Blob) => File.downloadFile(blob, fromLastIndexOf(zipname, '/', '\\')));
                            }
                            else if (this.userSettings.showErrorMessages) {
                                const { application, system } = result;
                                if (system) {
                                    alert(application + '\n\n' + system);
                                }
                            }
                        }
                    })
                    .catch(err => {
                        if (this.userSettings.showErrorMessages) {
                            alert(`ERROR: ${err}`);
                        }
                    });
                }
            }
        }
        else if (this.userSettings.showErrorMessages) {
            alert('SERVER (required): See README for instructions');
        }
    }
}