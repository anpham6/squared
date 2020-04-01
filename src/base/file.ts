import type { FileArchivingOptions, FileCopyingOptions, RawAsset, UserSettings } from '../../@types/base/application';

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
    public static getMimeType(value: string) {
        switch (value.toLowerCase()) {
            case 'aac':
                return 'audio/aac';
            case 'abw':
                return 'application/x-abiword';
            case 'arc':
                return 'application/x-freearc';
            case 'avi':
                return 'video/x-msvideo';
            case 'azw':
                return 'application/vnd.amazon.ebook';
            case 'bin':
                return 'application/octet-stream';
            case 'bmp':
                return 'image/bmp';
            case 'bz':
                return 'application/x-bzip';
            case 'bz2':
                return 'application/x-bzip2';
            case 'csh':
                return 'application/x-csh';
            case 'css':
                return 'text/css';
            case 'csv':
                return 'text/csv';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'eot':
                return 'application/vnd.ms-fontobject';
            case 'epub':
                return 'application/epub+zip';
            case 'gif':
                return 'image/gif';
            case 'htm':
            case 'html':
                return 'text/html';
            case 'ico':
                return 'image/vnd.microsoft.icon';
            case 'ics':
                return 'text/calendar';
            case 'jar':
                return 'application/java-archive';
            case 'jpeg':
            case 'jpg':
                return 'image/jpeg';
            case 'js':
            case 'mjs':
                return 'text/javascript';
            case 'json':
                return 'application/json';
            case 'jsonld':
                return 'application/ld+json';
            case 'mid':
            case 'midi':
                return 'audio/midi';
            case 'mp3':
                return 'audio/mpeg';
            case 'mpeg':
                return 'video/mpeg';
            case 'mpkg':
                return 'application/vnd.apple.installer+xml';
            case 'odp':
                return 'application/vnd.oasis.opendocument.presentation';
            case 'ods':
                return 'application/vnd.oasis.opendocument.spreadsheet';
            case 'odt':
                return 'application/vnd.oasis.opendocument.text';
            case 'oga':
                return 'audio/ogg';
            case 'ogv':
                return 'video/ogg';
            case 'ogx':
                return 'application/ogg';
            case 'otf':
                return 'font/otf';
            case 'png':
                return 'image/png';
            case 'pdf':
                return 'application/pdf';
            case 'ppt':
                return 'application/vnd.ms-powerpoint';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            case 'rar':
                return 'application/x-rar-compressed';
            case 'rtf':
                return 'application/rtf';
            case 'sh':
                return 'application/x-sh';
            case 'svg':
                return 'image/svg+xml';
            case 'swf':
                return 'application/x-shockwave-flash';
            case 'tar':
                return 'application/x-tar';
            case 'tif':
            case 'tiff':
                return 'image/tiff';
            case 'ts':
                return 'video/mp2t';
            case 'ttf':
                return 'font/ttf';
            case 'txt':
                return 'text/plain';
            case 'vsd':
                return 'application/vnd.visio';
            case 'wav':
                return 'audio/wav';
            case 'weba':
                return 'audio/webm';
            case 'webm':
                return 'video/webm';
            case 'webp':
                return 'image/webp';
            case 'woff':
                return 'font/woff';
            case 'woff2':
                return 'font/woff2';
            case 'xhtml':
                return 'application/xhtml+xml';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'xml':
                return 'text/xml';
            case 'xul':
                return 'application/vnd.mozilla.xul+xml';
            case 'zip':
                return 'application/zip';
            case '3gp':
                return 'video/3gpp';
            case '.3g2':
                return 'video/3gpp2';
            case '.7z':
                return 'application/x-7z-compressed';
            default:
                return '';
        }
    }

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

    public addAsset(data: Optional<RawAsset>) {
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
                            alert('ERROR: ' + err);
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
                                fetch('/api/browser/download?filename=' + encodeURIComponent(zipname))
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
                            alert('ERROR: ' + err);
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