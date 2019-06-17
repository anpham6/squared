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