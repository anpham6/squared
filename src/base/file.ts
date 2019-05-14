import { FileAsset, RawAsset, UserSettings } from './@types/application';

import Node from './node';
import Resource from './resource';

const $util = squared.lib.util;

export interface ExpressResult {
    zipname: string;
    application: string;
    system: string;
}

export default abstract class File<T extends Node> implements squared.base.File<T> {
    public static downloadToDisk(data: Blob, filename: string, mime = '') {
        const blob = new Blob([data], { type: mime || 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.style.setProperty('display', 'none');
        element.setAttribute('href', url);
        element.setAttribute('download', filename);
        if (typeof element.download === 'undefined') {
            element.setAttribute('target', '_blank');
        }
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => window.URL.revokeObjectURL(url), 1);
    }

    public appName = '';
    public readonly assets: RawAsset[] = [];

    protected constructor(public resource: Resource<T>) {
        resource.fileHandler = this;
    }

    public abstract saveAllToDisk(layouts: FileAsset[]): void;
    public abstract get userSettings(): UserSettings;

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

    public saveToDisk(files: RawAsset[], appName?: string) {
        if (!location.protocol.startsWith('http')) {
            alert('SERVER (required): See README for instructions');
            return;
        }
        if (files.length) {
            const settings = this.userSettings;
            $util.concatArray(files, this.assets);
            fetch(
                `/api/savetodisk` +
                `?directory=${encodeURIComponent($util.trimString(settings.outputDirectory, '/'))}` +
                (appName ? `&appname=${encodeURIComponent(appName.trim())}` : '') +
                `&filetype=${settings.outputArchiveFileType.toLowerCase()}` +
                `&processingtime=${settings.outputMaxProcessingTime.toString().trim()}`, {
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
                    else if (result.system) {
                        alert(`${result.application}\n\n${result.system}`);
                    }
                }
            })
            .catch(err => alert(`ERROR: ${err}`));
        }
    }

    get stored() {
        return this.resource.stored;
    }
}