import Resource from './resource';

type NodeElement = squared.base.NodeElement;
type Extension = chrome.base.Extension<NodeElement>;
type BundleIndex = ObjectMap<ChromeAsset[]>;

const { FILE } = squared.lib.regex;
const { appendSeparator, convertWord, fromLastIndexOf, isString, iterateReverseArray, parseMimeType, partitionLastIndexOf, randomUUID, resolvePath, safeNestedArray, trimEnd } = squared.lib.util;

const STRING_SERVERROOT = '__serverroot__';

function parseFileAs(attr: string, value: Undef<string>): [string, Undef<string>, boolean] | undefined {
    if (value) {
        const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(value.replace(/\\/g, '/'));
        if (match) {
            const segments = match[1].split('::').map(item => item.trim());
            return [segments[0], segments[1] || undefined, segments[2] === 'preserve'];
        }
    }
    return undefined;
}

function getFilePath(value: string, saveTo?: boolean): [Undef<string>, string, string] {
    value = value.replace(/\\/g, '/');
    let moveTo: Undef<string>;
    if (value.charAt(0) === '/') {
        moveTo = STRING_SERVERROOT;
    }
    else if (value.startsWith('../')) {
        moveTo = STRING_SERVERROOT;
        const pathname = location.pathname.split('/');
        pathname.pop();
        for (let i = 0; i < value.length && pathname.length > 0; i += 3) {
            if (value.substring(i, i + 3) === '../') {
                pathname.pop();
            }
            else {
                break;
            }
        }
        value = pathname.join('/') + '/' + value.split('../').pop();
    }
    else if (value.startsWith('./')) {
        value = value.substring(2);
    }
    const result = partitionLastIndexOf(value, '/');
    if (saveTo) {
        const extension = getFileExt(result[1]);
        result[1] = randomUUID() + (extension ? '.' + extension : '');
    }
    return [moveTo, result[0], result[1]];
}

function resolveAssetSource(element: HTMLVideoElement | HTMLAudioElement | HTMLObjectElement | HTMLEmbedElement | HTMLSourceElement | HTMLTrackElement, data: Map<HTMLElement, string>) {
    const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
    if (value !== '') {
        data.set(element, value);
    }
}

function convertFileMatch(value: string) {
    value = value.trim()
        .replace(/([.|/\\{}()?])/g, (match, ...capture) => '\\' + capture[0])
        .replace(/\*/g, '.*?');
    return new RegExp(`${value}$`);
}

function getExtensions(element: Null<HTMLElement>) {
    if (element) {
        const dataset = element.dataset;
        const use = dataset.useChrome?.trim() || dataset.use?.trim();
        if (use) {
            return use.split(/\s*,\s*/);
        }
    }
    return [];
}

function processExtensions(this: chrome.base.File<NodeElement>, data: ChromeAsset, extensions: string[]) {
    const processed: Extension[] = [];
    for (const ext of this.application.extensions) {
        if (ext.processFile(data)) {
            processed.push(ext);
        }
    }
    for (const name of extensions) {
        const ext = this.application.extensionManager!.retrieve(name, true) as Extension;
        if (ext && !processed.includes(ext)) {
            ext.processFile(data, true);
        }
    }
}

function setBundleIndex(bundleIndex: BundleIndex) {
    for (const saveTo in bundleIndex) {
        const items = bundleIndex[saveTo];
        const length = items.length;
        if (length > 1) {
            let i = 0;
            while (i < length) {
                items[i].bundleIndex = i++;
            }
        }
    }
}

function createBundleAsset(bundles: ChromeAsset[], element: HTMLElement, saveTo: string, format?: string, preserve?: boolean) {
    const content = element.innerHTML.trim();
    if (content) {
        const [moveTo, pathname, filename] = getFilePath(saveTo);
        const index = iterateReverseArray(bundles, item => {
            if ((item.moveTo === moveTo || !item.moveTo && !moveTo) && item.pathname === pathname && item.filename === filename) {
                safeNestedArray(item as StandardMap, 'trailingContent').push({ value: content, format, preserve });
                return true;
            }
            return;
        });
        if (index !== Infinity) {
            return {
                uri: resolvePath(saveTo, location.href),
                pathname,
                filename,
                moveTo,
                content,
                format,
                preserve
            } as ChromeAsset;
        }
    }
    return undefined;
}

function sortBundle(a: ChromeAsset, b: ChromeAsset) {
    if (a.bundleIndex === 0) {
        return 1;
    }
    else if (b.bundleIndex === 0) {
        return -1;
    }
    return 0;
}

const getFileExt = (value: string) => value.includes('.') ? fromLastIndexOf(value, '.').toLowerCase() : '';
const getDirectory = (path: string, start: number) => path.substring(start, path.lastIndexOf('/'));

export default class File<T extends squared.base.NodeElement> extends squared.base.File<T> implements chrome.base.File<T> {
    public static parseUri(uri: string, options?: UriOptions): Undef<ChromeAsset> {
        let saveAs: Undef<string>,
            format: Undef<string>,
            saveTo: Undef<boolean>,
            preserve: Undef<boolean>;
        if (options) {
            ({ saveAs, format, saveTo, preserve } = options);
        }
        let value = trimEnd(uri, '/'),
            relocate: Undef<string>;
        const local = value.startsWith(trimEnd(location.origin, '/'));
        if (saveAs) {
            saveAs = trimEnd(saveAs.replace(/\\/g, '/'), '/');
            if (saveTo) {
                relocate = saveAs;
            }
            else {
                const data = parseFileAs('saveAs', saveAs);
                if (data) {
                    [relocate, format, preserve] = data;
                }
                else {
                    relocate = saveAs;
                }
            }
            if (local && relocate) {
                value = resolvePath(relocate, location.href);
            }
        }
        if (!local && !relocate && options?.preserveCrossOrigin) {
            return undefined;
        }
        const match = FILE.PROTOCOL.exec(value);
        if (match) {
            const host = match[2];
            const port = match[3];
            const path = match[4] || '';
            const extension = getFileExt(uri);
            let pathname = '',
                filename = '',
                prefix = '',
                rootDir: Undef<string>,
                moveTo: Undef<string>;
            if (!local) {
                if (saveTo && relocate) {
                    [moveTo, pathname, filename] = getFilePath(relocate + '/' + randomUUID() + (extension ? '.' + extension : ''));
                }
                else {
                    pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                }
            }
            else {
                prefix = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
                let length = path.length;
                if (length) {
                    let index = 0;
                    length = Math.min(length, prefix.length);
                    for (let i = 0; i < length; ++i) {
                        if (path.charAt(i) === prefix.charAt(i)) {
                            index = i;
                        }
                        else {
                            break;
                        }
                    }
                    rootDir = path.substring(0, index + 1);
                }
            }
            if (filename === '') {
                if (local && relocate) {
                    [moveTo, pathname, filename] = getFilePath(relocate, saveTo);
                }
                else if (path && path !== '/') {
                    filename = fromLastIndexOf(path, '/', '\\');
                    if (local) {
                        if (path.startsWith(prefix)) {
                            pathname = getDirectory(path, prefix.length);
                        }
                        else {
                            moveTo = STRING_SERVERROOT;
                            rootDir = '';
                            pathname = getDirectory(path, 0);
                        }
                    }
                    else {
                        pathname += getDirectory(path, 1);
                    }
                }
                else {
                    filename = 'index.html';
                }
            }
            return {
                uri,
                rootDir,
                moveTo,
                pathname: pathname.replace(/\\/g, '/'),
                filename,
                mimeType: extension && parseMimeType(extension),
                format,
                preserve
            };
        }
        return undefined;
    }

    public resource!: chrome.base.Resource<T>;

    private _outputFileExclusions?: RegExp[];

    public reset() {
        super.reset();
        this._outputFileExclusions = undefined;
    }

    public copyToDisk(directory: string, options?: ChromeFileCopyingOptions) {
        return this.copying({
            ...options,
            assets: this.combineAssets().concat(options?.assets || []) as FileAsset[],
            directory
        });
    }

    public appendToArchive(pathname: string, options?: ChromeFileArchivingOptions) {
        return this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: this.combineAssets(options).concat(options?.assets || []) as FileAsset[],
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: ChromeFileArchivingOptions) {
        return this.archiving({
            ...options,
            assets: this.combineAssets(options).concat(options?.assets || []) as FileAsset[],
            filename
        });
    }

    public getHtmlPage(options?: FileActionAttribute) {
        let name: Undef<string>,
            saveAs: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            ({ name, preserveCrossOrigin } = options);
            saveAs = options.saveAs?.html;
        }
        const result: ChromeAsset[] = [];
        const element = document.querySelector('html');
        const href = location.href;
        let file: Undef<string>,
            format: Undef<string>;
        if (element) {
            file = element.dataset.chromeFile;
        }
        if (!isString(file) && saveAs?.filename) {
            file = fromLastIndexOf(saveAs.filename, '/', '\\');
            format = saveAs.format;
        }
        const data = File.parseUri(href, { preserveCrossOrigin, saveAs: file, format });
        if (data) {
            if (name) {
                data.filename = name;
            }
            else {
                const filename = data.filename;
                if (!FILE.NAME.test(filename)) {
                    data.pathname = appendSeparator(data.pathname, filename);
                    data.filename = 'index.html';
                }
            }
            if (this.validFile(data)) {
                data.requestMain = true;
                data.mimeType = parseMimeType('html');
                processExtensions.call(this, data, getExtensions(document.querySelector('html')));
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(options?: FileActionAttribute) {
        let saveAs: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            preserveCrossOrigin = options.preserveCrossOrigin;
            saveAs = options.saveAs?.script;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll('script').forEach(element => {
            const src = element.src.trim();
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                let format: Undef<string>,
                    outerHTML: Undef<string>,
                    preserve: Undef<boolean>,
                    data: Undef<ChromeAsset>;
                if (!isString(file) && saveAs?.filename) {
                    file = appendSeparator(saveAs.pathname || '', saveAs.filename);
                    format = saveAs.format;
                    outerHTML = element.outerHTML;
                }
                if (src !== '') {
                    data = File.parseUri(resolvePath(src), { preserveCrossOrigin, saveAs: file, format });
                }
                else if (isString(file)) {
                    if (!outerHTML) {
                        const command = parseFileAs('exportAs', file);
                        if (command) {
                            [file, format, preserve] = command;
                        }
                    }
                    if (file) {
                        data = createBundleAsset(result, element, file, format, preserve);
                    }
                }
                if (this.validFile(data)) {
                    safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                    data.mimeType = element.type.trim() || data.uri && parseMimeType(data.uri) || 'text/javascript';
                    if (outerHTML) {
                        data.outerHTML = outerHTML;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                }
            }
        });
        setBundleIndex(bundleIndex);
        return result.sort(sortBundle);
    }

    public getLinkAssets(options?: FileActionAttribute) {
        let rel: Undef<string>,
            saveAs: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            ({ rel, preserveCrossOrigin } = options);
            saveAs = options.saveAs?.link;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll((rel ? `link[rel="${rel}"]` : 'link') + ', style').forEach((element: HTMLLinkElement | HTMLStyleElement) => {
            let file = element.dataset.chromeFile;
            if (file !== 'exclude') {
                let data: Undef<ChromeAsset>,
                    href: Undef<string>,
                    mimeType: Undef<string>,
                    format: Undef<string>,
                    preserve: Undef<boolean>,
                    outerHTML: Undef<string>;
                if (element instanceof HTMLLinkElement) {
                    href = element.href.trim();
                    if (href !== '') {
                        switch (element.rel.trim()) {
                            case 'stylesheet':
                                mimeType = 'text/css';
                                break;
                            case 'icon':
                                mimeType = 'image/x-icon';
                                break;
                            default:
                                mimeType = element.type.trim() || parseMimeType(href);
                                break;
                        }
                    }
                }
                if (!isString(file) && saveAs?.filename && (mimeType === 'text/css' || element instanceof HTMLStyleElement)) {
                    file = appendSeparator(saveAs.pathname || '', saveAs.filename);
                    format = saveAs.format;
                    preserve = saveAs.preserve;
                    outerHTML = element.outerHTML;
                }
                if (href) {
                    data = File.parseUri(resolvePath(href), { preserveCrossOrigin, saveAs: file, format, preserve });
                }
                else if (isString(file)) {
                    if (!outerHTML) {
                        const command = parseFileAs('exportAs', file);
                        if (command) {
                            [file, format, preserve] = command;
                        }
                    }
                    if (file) {
                        data = createBundleAsset(result, element, file, format, preserve);
                    }
                }
                if (this.validFile(data)) {
                    safeNestedArray(bundleIndex, (data.moveTo || '') + data.pathname + data.filename).push(data);
                    data.mimeType = mimeType || 'text/css';
                    if (outerHTML) {
                        data.outerHTML = outerHTML;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                }
            }
        });
        for (const [uri, rawData] of Resource.ASSETS.rawData.entries()) {
            const mimeType = rawData.mimeType;
            if (mimeType === 'text/css') {
                const data = File.parseUri(resolvePath(uri), { preserveCrossOrigin, format: saveAs?.format });
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.call(this, data, []);
                    result.push(data);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result.sort(sortBundle);
    }

    public getImageAssets(options?: FileActionAttribute) {
        let saveAs: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            preserveCrossOrigin = options.preserveCrossOrigin;
            saveAs = options.saveAs?.base64;
        }
        const result: ChromeAsset[] = [];
        const processUri = (element: Null<HTMLElement>, uri: string, mimeType?: string) => {
            uri = uri.trim();
            if (uri !== '') {
                let file: Undef<string>,
                    saveTo = false;
                if (element) {
                    const fileAs = parseFileAs('saveTo', element.dataset.chromeFile);
                    if (fileAs) {
                        [file, mimeType] = fileAs;
                        saveTo = true;
                    }
                }
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs: file, saveTo });
                if (this.validFile(data) && !result.find(item => item.uri === uri)) {
                    if (mimeType) {
                        data.mimeType = file ? mimeType + ':' + data.mimeType : mimeType;
                    }
                    processExtensions.call(this, data, getExtensions(element));
                    result.push(data);
                    return data;
                }
            }
            return undefined;
        };
        document.querySelectorAll('video').forEach((element: HTMLVideoElement) => processUri(null, resolvePath(element.poster)));
        document.querySelectorAll('picture > source').forEach((source: HTMLSourceElement) => {
            for (const uri of source.srcset.trim().split(',')) {
                processUri(source, resolvePath(uri.split(' ')[0]));
            }
        });
        document.querySelectorAll('img, input[type=image]').forEach((image: HTMLImageElement) => {
            const src = image.src.trim();
            if (!src.startsWith('data:image/')) {
                processUri(image, resolvePath(src));
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            const pattern = /[\s\n]*(.+?\.[^\s,]+)(\s+[\d.]+[wx]\s*)?,?/g;
            let match: Null<RegExpExecArray>;
            while (match = pattern.exec(element.srcset.trim())) {
                processUri(element, resolvePath(match[1]));
            }
        });
        for (const uri of Resource.ASSETS.image.keys()) {
            processUri(null, uri);
        }
        for (const rawData of Resource.ASSETS.rawData.values()) {
            if (rawData.pathname) {
                continue;
            }
            else {
                const { base64, filename } = rawData;
                let mimeType = rawData.mimeType,
                    data: Undef<ChromeAsset>;
                if (base64) {
                    if (saveAs) {
                        const format = saveAs.format;
                        if (format && mimeType?.startsWith('image/')) {
                            switch (format) {
                                case 'png':
                                case 'jpeg':
                                case 'bmp':
                                case 'gif':
                                case 'tiff':
                                    mimeType = `@${format}:${mimeType}`;
                                    break;
                            }
                        }
                        const pathname = trimEnd(saveAs.pathname || '', '/').replace(/\\/g, '/');
                        data = processUri(
                            null,
                            resolvePath(getFilePath(pathname + (pathname !== '' ? '/' : '') + filename)[1] + filename, location.href),
                            mimeType
                        );
                        if (data) {
                            data.base64 = base64;
                            continue;
                        }
                    }
                    data = { pathname: '__generated__/base64', filename, mimeType, base64 };
                }
                else if (mimeType && rawData.content) {
                    data = { pathname: `__generated__/${mimeType.split('/').pop()}`, filename, content: rawData.content };
                }
                else {
                    continue;
                }
                if (this.validFile(data)) {
                    data.mimeType = mimeType;
                    processExtensions.call(this, data, []);
                    result.push(data);
                }
            }
        }
        return result;
    }

    public getVideoAssets(options?: FileActionAttribute) {
        return this.getRawAssets('video', options);
    }

    public getAudioAssets(options?: FileActionAttribute) {
        return this.getRawAssets('audio', options);
    }

    public getFontAssets(options?: FileActionAttribute) {
        const preserveCrossOrigin = options?.preserveCrossOrigin;
        const result: ChromeAsset[] = [];
        for (const fonts of Resource.ASSETS.fonts.values()) {
            let i = 0;
            while (i < fonts.length) {
                const url = fonts[i++].srcUrl;
                if (url) {
                    const data = File.parseUri(url, { preserveCrossOrigin });
                    if (this.validFile(data)) {
                        processExtensions.call(this, data, []);
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public getDataMap(options: ChromeFileActionOptions) {
        if (options.removeUnusedStyles) {
            return { unusedStyles: Array.from(this.application.session.unusedStyles) };
        }
        return undefined;
    }

    public getCopyQueryParameters(options: ChromeFileCopyingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    public getArchiveQueryParameters(options: ChromeFileArchivingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    protected validFile(data: Undef<ChromeAsset>): data is ChromeAsset {
        if (data) {
            const fullpath = appendSeparator(data.pathname, data.filename);
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    protected getRawAssets(tagName: "video" | "audio" | "object" | "embed", options?: FileActionAttribute) {
        const preserveCrossOrigin = options?.preserveCrossOrigin;
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach(element => {
            const items = new Map<HTMLElement, string>();
            resolveAssetSource(element, items);
            switch (element.tagName) {
                case 'VIDEO':
                case 'AUDIO':
                    element.querySelectorAll('source, track').forEach((source: HTMLSourceElement | HTMLTrackElement) => resolveAssetSource(source, items));
                    break;
            }
            for (const [item, uri] of items.entries()) {
                const saveAs = parseFileAs('saveTo', item.dataset.chromeFile)?.[0];
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo: !!saveAs });
                if (this.validFile(data)) {
                    processExtensions.call(this, data, getExtensions(item));
                    result.push(data);
                }
            }
        });
        return result;
    }

    protected combineAssets(options?: ChromeFileArchivingOptions) {
        const result = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options?.saveAsWebPage) {
            let i = 0;
            while (i < result.length) {
                const item = result[i++];
                const mimeType = item.mimeType;
                switch (mimeType) {
                    case 'text/html':
                    case 'application/xhtml+xml':
                    case 'text/css':
                        item.mimeType = '@' + mimeType;
                        break;
                }
            }
        }
        return result.concat(this.getScriptAssets(options))
            .concat(this.getImageAssets(options))
            .concat(this.getVideoAssets(options))
            .concat(this.getAudioAssets(options))
            .concat(this.getRawAssets('object', options))
            .concat(this.getRawAssets('embed', options))
            .concat(this.getFontAssets(options));
    }

    get outputFileExclusions() {
        let result = this._outputFileExclusions;
        if (result === undefined) {
            result = this.userSettings.outputFileExclusions.map(value => convertFileMatch(value));
            this._outputFileExclusions = result;
        }
        return result;
    }

    get userSettings() {
        return this.resource.userSettings;
    }

    get application() {
        return this.resource.application;
    }
}