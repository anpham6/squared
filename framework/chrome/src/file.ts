import type Application from './application';
import type Extension from './extension';

import Pattern = squared.lib.base.Pattern;

type BundleIndex = ObjectMap<ChromeAsset[]>;

const { FILE } = squared.lib.regex;

const ASSETS = squared.base.Resource.ASSETS;

const { convertWord, fromLastIndexOf, isString, iterateReverseArray, parseMimeType, resolvePath, splitPair, splitPairStart, trimEnd } = squared.lib.util;

const { appendSeparator, randomUUID } = squared.base.lib.util;

const STRING_SERVERROOT = '__serverroot__';
const REGEXP_ESCAPEPATH = /([.|/\\{}()?])/g;

const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx]\s*)?,?/g);

function parseFileAs(attr: string, value: Undef<string>, format = 'preserve'): Undef<[string, Undef<string>, boolean, boolean]> {
    if (value) {
        const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(normalizePath(value));
        if (match) {
            const segments = match[1].split('::').map(item => item.trim());
            const actions = segments[2] || '';
            return [segments[0], segments[1], actions.includes(format), actions.includes('compress')];
        }
    }
}

function getFilePath(value: string, saveTo?: boolean): [Undef<string>, string, string] {
    let moveTo: Undef<string>;
    value = normalizePath(value);
    if (!value.includes('/')) {
        return [moveTo, '', value];
    }
    else if (value[0] === '/') {
        moveTo = STRING_SERVERROOT;
    }
    else if (value.startsWith('../')) {
        moveTo = STRING_SERVERROOT;
        const pathname = location.pathname.split('/');
        if (--pathname.length) {
            for (let i = 0, length = value.length; i < length; i += 3) {
                if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                    break;
                }
            }
        }
        value = `${pathname.join('/')}/${value.split('../').pop()!}`;
    }
    else if (value.startsWith('./')) {
        value = value.substring(2);
    }
    const result = splitPair(value, '/', false, true);
    if (saveTo) {
        const extension = getFileExt(result[1]);
        result[1] = randomUUID() + (extension ? '.' + extension : '');
    }
    return [moveTo, result[0], result[1]];
}

function resolveAssetSource(element: HTMLVideoElement | HTMLAudioElement | HTMLObjectElement | HTMLEmbedElement | HTMLSourceElement | HTMLTrackElement | HTMLIFrameElement, data: Map<HTMLElement, string>) {
    const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
    if (value) {
        data.set(element, value);
    }
}

function convertFileMatch(value: string) {
    value = value
        .replace(REGEXP_ESCAPEPATH, (match, ...capture) => '\\' + capture[0])
        .replace(/\*/g, '.*?');
    return new RegExp(`${value}$`);
}

function getExtensions(element: Null<HTMLElement>) {
    if (element) {
        const dataset = element.dataset;
        const use = dataset.useChrome || dataset.use;
        if (use) {
            return use.trim().split(/\s*,\s*/);
        }
    }
    return [];
}

function setBundleIndex(bundleIndex: BundleIndex) {
    for (const saveTo in bundleIndex) {
        const items = bundleIndex[saveTo];
        const length = items.length;
        if (length > 1) {
            for (let i = 0; i < length; ++i) {
                items[i].bundleIndex = i;
            }
        }
    }
}

function createBundleAsset(bundles: ChromeAsset[], element: HTMLElement, saveTo: string, format?: string, preserve?: boolean): Null<ChromeAsset> {
    const content = element.innerHTML.trim();
    if (content) {
        const [moveTo, pathname, filename] = getFilePath(saveTo);
        const index = iterateReverseArray(bundles, item => {
            if ((item.moveTo === moveTo || !item.moveTo && !moveTo) && item.pathname === pathname && item.filename === filename) {
                (item.trailingContent ||= []).push({ value: content, format, preserve });
                return true;
            }
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
            };
        }
    }
    return null;
}

function setBundleData(bundleIndex: BundleIndex, data: ChromeAsset) {
    const name = (data.moveTo || '') + data.pathname + data.filename;
    (bundleIndex[name] ||= []).push(data);
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

const getFileExt = (value: string) => value.includes('.') ? fromLastIndexOf(value, '.').trim().toLowerCase() : '';
const getDirectory = (path: string, start: number) => path.substring(start, path.lastIndexOf('/'));
const normalizePath = (value: string) => value.replace(/\\/g, '/');
const excludeFile = (value: Undef<string>) => value === 'exclude' || value === 'ignore';

export default class File<T extends squared.base.Node> extends squared.base.File<T> implements chrome.base.File<T> {
    public static parseUri(uri: string, options?: UriOptions): Null<ChromeAsset> {
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
        if (saveAs !== '~') {
            if (saveAs) {
                saveAs = trimEnd(normalizePath(saveAs), '/');
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
                if (local && relocate && relocate !== '~') {
                    value = resolvePath(relocate, location.href);
                }
            }
            if (!local && !relocate && options && options.preserveCrossOrigin) {
                return null;
            }
            if (relocate === '~') {
                relocate = '';
            }
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
                    [moveTo, pathname, filename] = getFilePath(`${relocate}/${randomUUID() + (extension ? '.' + extension : '')}`);
                }
                else {
                    pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + '/';
                }
            }
            else {
                prefix = splitPairStart(location.pathname, '/', false, true) + '/';
                let length = path.length;
                if (length) {
                    let index = 0;
                    length = Math.min(length, prefix.length);
                    for (let i = 0; i < length; ++i) {
                        if (path[i] === prefix[i]) {
                            index = i;
                        }
                        else {
                            break;
                        }
                    }
                    rootDir = path.substring(0, index + 1);
                }
            }
            if (!filename) {
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
                pathname: normalizePath(pathname),
                filename,
                mimeType: extension && parseMimeType(extension),
                format,
                preserve
            };
        }
        return null;
    }

    private _outputFileExclusions?: RegExp[];

    public reset() {
        delete this._outputFileExclusions;
        super.reset();
    }

    public copyTo(directory: string, options: IFileCopyingOptions = {}) {
        options.directory = directory;
        return this.copying(this.processAssets(options));
    }

    public appendTo(pathname: string, options: IFileArchivingOptions = {}) {
        options.filename ||= this.userSettings.outputArchiveName;
        options.appendTo = pathname;
        return this.archiving(this.processAssets(options));
    }

    public saveAs(filename: string, options: IFileArchivingOptions = {}) {
        options.filename = filename;
        return this.archiving(this.processAssets(options));
    }

    public getHtmlPage(options?: FileActionAttribute) {
        let name: Undef<string>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsHtml: Undef<SaveAsOptions>;
        if (options) {
            ({ name, preserveCrossOrigin } = options);
            saveAsHtml = options.saveAs?.html;
        }
        const result: ChromeAsset[] = [];
        const element = document.querySelector('html');
        const href = location.href;
        let file: Undef<string>,
            format: Undef<string>;
        if (element) {
            file = element.dataset.chromeFile;
        }
        if (!isString(file) && saveAsHtml && saveAsHtml.filename) {
            file = fromLastIndexOf(saveAsHtml.filename, '/', '\\');
            format = saveAsHtml.format;
        }
        const data = File.parseUri(href, { preserveCrossOrigin, saveAs: file, format });
        if (data) {
            if (name) {
                data.filename = name;
            }
            else if (!FILE.NAME.test(data.filename)) {
                data.filename = 'index.html';
            }
            if (this.validFile(data)) {
                data.requestMain = true;
                data.mimeType = parseMimeType('html');
                this.processExtensions(data, getExtensions(document.querySelector('html')));
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(options?: FileActionAttribute): [ChromeAsset[], TranspileMap] {
        let preserveCrossOrigin: Undef<boolean>,
            saveAsScript: Undef<SaveAsOptions>;
        if (options) {
            preserveCrossOrigin = options.preserveCrossOrigin;
            saveAsScript = options.saveAs?.script;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        const transpileMap: TranspileMap = { html: {}, js: {}, css: {} };
        document.querySelectorAll('script').forEach(element => {
            const template = element.dataset.chromeTemplate;
            if (template) {
                if (element.type === 'text/template') {
                    const [category, module, name] = template.split('::').map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                    if (category && module && name) {
                        switch (category) {
                            case 'html':
                            case 'js':
                            case 'css':
                                (transpileMap[category][module] ||= {})[name] = element.textContent!.trim();
                                break;
                        }
                    }
                }
            }
            else {
                let file = element.dataset.chromeFile;
                if (!excludeFile(file)) {
                    const src = element.src.trim();
                    let data: Null<ChromeAsset> = null,
                        format: Undef<string>,
                        outerHTML: Undef<string>,
                        preserve: Undef<boolean>;
                    if (!isString(file) && saveAsScript && saveAsScript.filename) {
                        file = appendSeparator(saveAsScript.pathname, saveAsScript.filename);
                        format = saveAsScript.format;
                        outerHTML = element.outerHTML;
                    }
                    if (src) {
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
                        setBundleData(bundleIndex, data);
                        data.mimeType = element.type.trim() || data.uri && parseMimeType(data.uri) || 'text/javascript';
                        if (outerHTML) {
                            data.outerHTML = outerHTML;
                        }
                        this.processExtensions(data, getExtensions(element));
                        result.push(data);
                    }
                }
            }
        });
        setBundleIndex(bundleIndex);
        return [result.sort(sortBundle), transpileMap];
    }

    public getLinkAssets(options?: FileActionAttribute) {
        let rel: Undef<string>,
            saveAsLink: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            ({ rel, preserveCrossOrigin } = options);
            saveAsLink = options.saveAs?.link;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll(`${rel ? `link[rel="${rel}"]` : 'link'}, style`).forEach((element: HTMLLinkElement | HTMLStyleElement) => {
            let file = element.dataset.chromeFile;
            if (!excludeFile(file)) {
                let data: Null<ChromeAsset> = null,
                    href: Undef<string>,
                    mimeType: Undef<string>,
                    format: Undef<string>,
                    preserve: Undef<boolean>,
                    outerHTML: Undef<string>;
                if (element instanceof HTMLLinkElement && (href = element.href.trim())) {
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
                if (!isString(file) && saveAsLink && saveAsLink.filename && (mimeType === 'text/css' || element instanceof HTMLStyleElement)) {
                    file = appendSeparator(saveAsLink.pathname, saveAsLink.filename);
                    ({ format, preserve } = saveAsLink);
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
                    setBundleData(bundleIndex, data);
                    data.mimeType = mimeType || 'text/css';
                    if (outerHTML) {
                        data.outerHTML = outerHTML;
                    }
                    this.processExtensions(data, getExtensions(element));
                    result.push(data);
                }
            }
        });
        for (const data of ASSETS.rawData) {
            const item = data[1];
            if (item.mimeType === 'text/css') {
                const asset = File.parseUri(resolvePath(data[0]), { preserveCrossOrigin, format: saveAsLink && saveAsLink.format });
                if (this.validFile(asset)) {
                    asset.mimeType = item.mimeType;
                    this.processExtensions(asset, []);
                    result.push(asset);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result.sort(sortBundle);
    }

    public getImageAssets(options?: FileActionAttribute) {
        let transforms: Undef<TransformCommand[]>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>,
            saveAsBase64: Undef<SaveAsOptions>;
        if (options) {
            ({ transforms, preserveCrossOrigin } = options);
            if (options.saveAs) {
                ({ image: saveAsImage, base64: saveAsBase64 } = options.saveAs);
            }
        }
        const result: ChromeAsset[] = [];
        const format = saveAsImage && saveAsImage.format;
        document.querySelectorAll('video').forEach((element: HTMLVideoElement) => this.processImageUri(null, resolvePath(element.poster), result, format, transforms, preserveCrossOrigin));
        document.querySelectorAll('picture > source').forEach((element: HTMLSourceElement) => {
            for (const uri of element.srcset.trim().split(',')) {
                this.processImageUri(element, resolvePath(splitPairStart(uri, ' ')), result, format, transforms, preserveCrossOrigin);
            }
        });
        document.querySelectorAll('img, input[type=image]').forEach((element: HTMLImageElement) => {
            const src = element.src.trim();
            if (!src.startsWith('data:image/')) {
                this.processImageUri(element, resolvePath(src), result, format, transforms, preserveCrossOrigin);
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            RE_SRCSET.matcher(element.srcset.trim());
            while (RE_SRCSET.find()) {
                this.processImageUri(element, resolvePath(RE_SRCSET.group(1)!), result, format, transforms, preserveCrossOrigin);
            }
        });
        for (const uri of ASSETS.image.keys()) {
            this.processImageUri(null, uri, result, format, transforms, preserveCrossOrigin);
        }
        for (const rawData of ASSETS.rawData.values()) {
            if (rawData.pathname) {
                continue;
            }
            const { base64, filename } = rawData;
            let mimeType = rawData.mimeType,
                data: Undef<ChromeAsset>;
            if (base64) {
                if (saveAsBase64) {
                    if (mimeType && mimeType.startsWith('image/')) {
                        switch (saveAsBase64.format) {
                            case 'png':
                            case 'jpeg':
                            case 'bmp':
                            case 'gif':
                            case 'tiff':
                                mimeType = '@' + saveAsBase64.format + ':' + mimeType;
                                break;
                        }
                    }
                    data = this.processImageUri(
                        null,
                        resolvePath(getFilePath(appendSeparator(saveAsBase64.pathname, filename))[1] + '/' + filename, location.href),
                        result,
                        format,
                        transforms,
                        preserveCrossOrigin,
                        mimeType
                    );
                    if (data) {
                        data.base64 = base64;
                        continue;
                    }
                }
                data = {
                    pathname: '__generated__/base64',
                    filename,
                    mimeType,
                    base64
                };
            }
            else if (mimeType && rawData.content) {
                data = {
                    pathname: `__generated__/${mimeType.split('/').pop()!}`,
                    filename,
                    content: rawData.content
                };
            }
            else {
                continue;
            }
            if (this.validFile(data)) {
                data.mimeType = mimeType;
                this.processExtensions(data, []);
                result.push(data);
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
        const preserveCrossOrigin = options && options.preserveCrossOrigin;
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (let i = 0, length = fonts.length; i < length; ++i) {
                const url = fonts[i].srcUrl;
                if (url) {
                    const data = File.parseUri(url, { preserveCrossOrigin });
                    if (this.validFile(data)) {
                        this.processExtensions(data, []);
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public getDataMap(options: IFileActionOptions) {
        return {
            unusedStyles: options.unusedStyles,
            transpileMap: options.transpileMap
        };
    }

    public getCopyQueryParameters(options: IFileCopyingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    public getArchiveQueryParameters(options: IFileArchivingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    protected validFile(data: Null<ChromeAsset>): data is ChromeAsset {
        if (data) {
            const fullpath = appendSeparator(data.pathname, data.filename);
            return !this.outputFileExclusions.some(pattern => pattern.test(fullpath));
        }
        return false;
    }

    protected getRawAssets(tagName: "video" | "audio" | "object" | "embed" | "iframe", options?: FileActionAttribute) {
        let preserveCrossOrigin: Undef<boolean>,
            transforms: Undef<TransformCommand[]>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ transforms, preserveCrossOrigin } = options);
            if (options.saveAs) {
                saveAsImage = options.saveAs.image;
            }
        }
        const result: ChromeAsset[] = [];
        const format = saveAsImage && saveAsImage.format;
        document.querySelectorAll(tagName).forEach(element => {
            const items = new Map<HTMLElement, string>();
            const tagName = element.tagName;
            let type = '';
            switch (tagName) {
                case 'VIDEO':
                case 'AUDIO':
                    element.querySelectorAll('source, track').forEach((source: HTMLSourceElement | HTMLTrackElement) => resolveAssetSource(source, items));
                case 'OBJECT':
                case 'EMBED':
                    type = (element as HTMLObjectElement | HTMLEmbedElement).type;
                case 'IFRAME': {
                    const file = element.dataset.chromeFile;
                    if (tagName !== 'IFRAME' || file && file.startsWith('saveTo')) {
                        const src = (element instanceof HTMLObjectElement ? element.data : element.src).trim();
                        if (type.startsWith('image/') || parseMimeType(src).startsWith('image/')) {
                            this.processImageUri(element, src, result, format, transforms, preserveCrossOrigin);
                            return;
                        }
                    }
                    else if (tagName === 'IFRAME') {
                        return;
                    }
                }
            }
            resolveAssetSource(element, items);
            for (const [item, uri] of items) {
                const file = item.dataset.chromeFile;
                if (!excludeFile(file)) {
                    const saveAs = parseFileAs('saveTo', file)?.[0];
                    const asset = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo: !!saveAs });
                    if (this.validFile(asset)) {
                        this.processExtensions(asset, getExtensions(item));
                        result.push(asset);
                    }
                }
            }
        });
        return result;
    }

    private processAssets(options: IFileActionOptions) {
        const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            for (let i = 0, length = assets.length; i < length; ++i) {
                const item = assets[i];
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
        const [scriptAssets, transpileMap] = this.getScriptAssets(options);
        assets.push(
            ...scriptAssets,
            ...this.getImageAssets(options),
            ...this.getVideoAssets(options),
            ...this.getAudioAssets(options),
            ...this.getRawAssets('object', options),
            ...this.getRawAssets('embed', options),
            ...this.getRawAssets('iframe', options),
            ...this.getFontAssets(options)
        );
        options.assets = assets;
        options.transpileMap = transpileMap;
        console.log(assets);
        return options;
    }

    private processExtensions(data: ChromeAsset, extensions: string[]) {
        const extensionManager = this.application.extensionManager!;
        const processed: Extension<T>[] = [];
        for (const ext of this.application.extensions) {
            if (ext.processFile(data)) {
                processed.push(ext);
            }
        }
        for (const name of extensions) {
            const ext = extensionManager.get(name, true) as Undef<Extension<T>>;
            if (ext && !processed.includes(ext)) {
                ext.processFile(data, true);
            }
        }
    }

    private processImageUri(element: Null<HTMLElement>, uri: string, result: ChromeAsset[], format: Undef<string>, transforms: Undef<TransformCommand[]>, preserveCrossOrigin: Undef<boolean>, command?: string) {
        if (uri = uri.trim()) {
            let saveAs: Undef<string>,
                filename: Undef<string>,
                base64: Undef<boolean>,
                compress: Undef<boolean>,
                saveTo: Undef<boolean>;
            if (element) {
                let file = element.dataset.chromeFile;
                if (excludeFile(file)) {
                    return;
                }
                if (transforms) {
                    const id = element.id.trim();
                    if (id) {
                        const data = transforms.find(item => item.id === id);
                        if (data) {
                            ({ pathname: saveAs, filename, command, base64, compress } = data);
                            saveTo = true;
                            file = '';
                        }
                    }
                }
                if (file) {
                    const fileAs = parseFileAs('saveTo', file, 'base64');
                    if (fileAs) {
                        [saveAs, command, base64, compress] = fileAs;
                        saveTo = true;
                    }
                }
            }
            const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo });
            if (this.validFile(data) && (saveAs && element || !result.find(item => item.uri === uri))) {
                if (saveAs && element) {
                    data.outerHTML = element.outerHTML;
                }
                if (command !== '~') {
                    if (command) {
                        data.mimeType = saveAs && data.mimeType ? command + ':' + data.mimeType : command;
                    }
                    else if (format && format !== 'base64') {
                        data.mimeType &&= format + ':' + data.mimeType;
                    }
                }
                if (data.mimeType && (base64 || format === 'base64')) {
                    data.format = 'base64';
                }
                this.processExtensions(data, getExtensions(element));
                if (filename) {
                    data.filename = filename;
                }
                if (compress && !(data.compress ||= []).find(item => item.format === 'png')) {
                    data.compress.push({ format: 'png' });
                }
                result.push(data);
                return data;
            }
        }
    }

    get outputFileExclusions() {
        return this._outputFileExclusions ||= this.userSettings.outputFileExclusions.map(value => convertFileMatch(value));
    }

    get application() {
        return this.resource.application as Application<T>;
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}