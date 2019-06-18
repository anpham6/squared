import { RawAsset, UserSettings } from './@types/application';

import Node from './node';
import Resource from './resource';

const {
    constant: $const,
    util: $util
} = squared.lib;

export interface ExpressResult {
    zipname: string;
    application: string;
    system: string;
}

export default abstract class File<T extends Node> implements squared.base.File<T> {
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

    public static downloadToDisk(data: Blob, filename: string, mime?: string) {
        const blob = new Blob([data], { type: mime || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.style.setProperty('display', $const.CSS.NONE);
        element.setAttribute('href', url);
        element.setAttribute('download', filename);
        if (!element.download) {
            element.setAttribute('target', '_blank');
        }
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => window.URL.revokeObjectURL(url), 1);
    }

    public resource!: Resource<T>;
    public readonly assets: RawAsset[] = [];

    public abstract get userSettings(): UserSettings;

    public saveAllToDisk() {
        if (this.assets.length) {
            this.saveToDisk(this.assets, this.userSettings.outputArchiveName);
        }
    }

    public addAsset(data: Optional<RawAsset>) {
        if (data.content || data.uri || data.base64) {
            const index = this.assets.findIndex(item => item.pathname === data.pathname && item.filename === data.filename);
            if (index !== -1) {
                Object.assign(this.assets[index], data);
            }
            else {
                this.assets.push(<RawAsset> data);
            }
        }
    }

    public reset() {
        this.assets.length = 0;
    }

    public saveToDisk(files: RawAsset[], filename?: string) {
        if (location.protocol.startsWith('http')) {
            if (files.length) {
                const settings = this.userSettings;
                files = files.concat(this.assets);
                fetch(
                    `/api/savetodisk` +
                    `?directory=${encodeURIComponent($util.trimString(settings.outputDirectory, '/'))}` +
                    (filename ? `&filename=${encodeURIComponent(filename.trim())}` : '') +
                    `&format=${settings.outputArchiveFormat.toLowerCase()}` +
                    `&timeout=${settings.outputArchiveTimeout.toString().trim()}`, {
                        method: 'POST',
                        headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' }),
                        body: JSON.stringify(files)
                    }
                )
                .then((response: Response) => response.json())
                .then((result: ExpressResult) => {
                    if (result) {
                        if (result.zipname) {
                            fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                                .then((response: Response) => response.blob())
                                .then((blob: Blob) => File.downloadToDisk(blob, $util.fromLastIndexOf(result.zipname, '/')));
                        }
                        else if (result.system && this.userSettings.showErrorMessages) {
                            alert(`${result.application}\n\n${result.system}`);
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
        else if (this.userSettings.showErrorMessages) {
            alert('SERVER (required): See README for instructions');
        }
    }
}