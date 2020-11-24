import DIR_FUNCTIONS = chrome.internal.DIR_FUNCTIONS

import type Application from './application';

import Pattern = squared.lib.base.Pattern;

type BundleIndex = ObjectMap<ChromeAsset[]>;

interface FileAsData {
    file: string;
    preserve: boolean;
    base64: boolean;
    inline: boolean;
    format?: string;
    compress?: CompressFormat[];
}

const { FILE } = squared.lib.regex;

const ASSETS = squared.base.Resource.ASSETS;

const { convertWord, fromLastIndexOf, parseMimeType, replaceMap, resolvePath, splitPair, splitPairStart, trimEnd } = squared.lib.util;

const { appendSeparator, parseWatchInterval } = squared.base.lib.util;

const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);

const FILENAME_MAP = new WeakMap<ChromeAsset, string>();
let BUNDLE_ID = 0;

function parseFileAs(attr: string, value: Undef<string>) {
    if (value) {
        let match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(normalizePath(value));
        if (match) {
            let compress: Undef<CompressFormat[]>;
            const segments = replaceMap(match[1].split('::'), item => item.trim());
            const actions = (segments[2] || '').toLowerCase();
            const pattern = /\bcompress\[\s*([a-z\d]+)\s*\]/g;
            while (match = pattern.exec(actions)) {
                (compress ||= []).push({ format: match[1] });
            }
            return {
                file: segments[0],
                format: segments[1],
                preserve: actions.includes('preserve'),
                base64: actions.includes('base64'),
                inline: actions.includes('inline'),
                compress
            } as FileAsData;
        }
    }
}

function getFilePath(value: string, saveTo?: boolean, ext?: string): [Undef<string>, string, string] {
    value = normalizePath(value);
    if (value.startsWith('./')) {
        value = value.substring(2);
    }
    if (!value.includes('/')) {
        return ['', '', value];
    }
    let moveTo: Undef<string>;
    if (value[0] === '/') {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
    }
    else if (value.startsWith('../')) {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
        const pathname = location.pathname.split('/');
        if (--pathname.length) {
            for (let i = 0, length = value.length; i < length; i += 3) {
                if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                    break;
                }
            }
        }
        value = pathname.join('/') + '/' + value.split('../').pop();
    }
    const result = splitPair(value, '/', false, true);
    if (saveTo) {
        result[1] = assignFilename(result[1], ext);
    }
    return [moveTo, result[0], result[1]];
}

function assignFilename(value: string, ext?: string) {
    ext ||= getFileExt(value);
    return DIR_FUNCTIONS.ASSIGN + (ext ? '.' + ext : 'unknown');
}

function resolveAssetSource(element: HTMLVideoElement | HTMLAudioElement | HTMLObjectElement | HTMLEmbedElement | HTMLSourceElement | HTMLTrackElement | HTMLIFrameElement, data: Map<HTMLElement, string>) {
    const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
    if (value) {
        data.set(element, value);
    }
}

function setBundleIndex(bundleIndex: BundleIndex) {
    for (const pathUri in bundleIndex) {
        const items = bundleIndex[pathUri];
        const length = items.length;
        if (length > 1) {
            const urls: Null<URL[]> = [];
            const id = ++BUNDLE_ID;
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                item.bundleId = id;
                item.bundleIndex = i;
                if (i > 0) {
                    delete item.cloudStorage;
                }
                if (urls && item.uri) {
                    urls.push(new URL(item.uri));
                }
            }
            invalid: {
                if (urls.length === length) {
                    const origin = urls[0].origin;
                    const baseDir = urls[0].pathname.split('/');
                    for (let i = 1; i < length; ++i) {
                        const url = urls[i];
                        if (url.origin === origin) {
                            if (baseDir.length) {
                                const parts = url.pathname.split('/');
                                for (let j = 0; j < parts.length; ++j) {
                                    if (baseDir[j] !== parts[j]) {
                                        baseDir.splice(j, Infinity);
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            break invalid;
                        }
                    }
                    items[0].bundleRoot = origin + baseDir.join('/') + '/';
                }
            }
        }
    }
}

function createBundleAsset(assets: ChromeAsset[], element: HTMLElement, file: string, format: Undef<string>, preserve?: boolean, inline?: boolean): Null<ChromeAsset> {
    const content = element.innerHTML.trim();
    if (content) {
        const [moveTo, pathname, filename] = getFilePath(file);
        const previous = assets[assets.length - 1];
        const data = {
            uri: resolvePath(file, location.href),
            pathname,
            filename,
            moveTo,
            content,
            format,
            preserve,
            inlineContent: inline ? getContentType(element) : undefined
        } as ChromeAsset;
        if (previous && hasSamePath(previous, data, true)) {
            (previous.trailingContent ||= []).push({ value: content, preserve });
        }
        else {
            checkFilename(assets, data);
            return data;
        }
    }
    return null;
}

function setBundleData(bundleIndex: BundleIndex, data: ChromeAsset) {
    const pathUri = (data.moveTo || '') + data.pathname + '/' + data.filename;
    (bundleIndex[pathUri] ||= []).push(data);
}

function checkBundleStart(assets: ChromeAsset[], data: ChromeAsset) {
    for (let i = 0, length = assets.length; i < length; ++i) {
        if (hasSamePath(assets[i], data)) {
            for (let j = i + 1; j < length; ++j) {
                if (!hasSamePath(assets[j], data)) {
                    checkFilename(assets, data);
                    return true;
                }
            }
            return false;
        }
    }
    checkFilename(assets, data);
    return true;
}

function checkFilename(assets: ChromeAsset[], data: ChromeAsset) {
    const filename = data.filename;
    let i = 0;
    while (assets.find(item => hasSamePath(item, data))) {
        const [start, end] = splitPair(data.filename, '.');
        data.filename = start + '_' + ++i + (end ? '.' + end : '');
    }
    if (i > 0) {
        FILENAME_MAP.set(data, filename);
    }
}

function getContentType(element: HTMLElement) {
    switch (element.tagName) {
        case 'SCRIPT':
            return 'script';
        case 'LINK':
        case 'STYLE':
            return 'style';
    }
}

function excludeAsset(assets: ChromeAsset[], command: AssetCommand, textContent: string) {
    if (command.exclude) {
        assets.push({
            pathname: '',
            filename: '',
            exclude: true,
            textContent
        });
        return true;
    }
    if (command.ignore) {
        return true;
    }
    return false;
}

function checkSaveAs(uri: Undef<string>, pathname: Undef<string>, filename?: string): [string, boolean] {
    if (filename) {
        const value = getCustomPath(uri, pathname, filename);
        if (value) {
            return [value, false];
        }
    }
    else if (pathname && pathname !== '~') {
        return [pathname, true];
    }
    return ['', false];
}

function setOutputModifiers(item: ChromeAsset, compress: Undef<CompressFormat[]>, tasks: Undef<string[]>, cloudStorage: Undef<CloudService[]>, attributes?: AttributeValue[]) {
    if (compress) {
        (item.compress ||= []).push(...compress);
    }
    if (tasks) {
        item.tasks = tasks;
    }
    if (attributes) {
        item.attributes = attributes;
    }
    if (cloudStorage) {
        item.cloudStorage = cloudStorage;
    }
}

function getCustomPath(uri: Undef<string>, pathname: Undef<string>, filename: string) {
    if (uri && (!pathname || pathname === '~')) {
        const asset = new URL(uri);
        if (location.origin === asset.origin) {
            const length = location.origin.length;
            const seg = uri.substring(length + 1).split('/');
            for (const dir of location.href.substring(length + 1).split('/')) {
                if (dir !== seg.shift()) {
                    return '';
                }
            }
            pathname = seg.join('/');
        }
    }
    return appendSeparator(pathname, filename);
}

function hasSamePath(item: ChromeAsset, other: ChromeAsset, bundling = false) {
    if ((item.moveTo === other.moveTo || !item.moveTo && !moveTo) && item.pathname === other.pathname) {
        if (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename) {
            return true;
        }
        else if (bundling && item.filename.startsWith(DIR_FUNCTIONS.ASSIGN)) {
            return true;
        }
    }
    return false;
}

const getTasks = (element: HTMLElement) => element.dataset.chromeTasks?.trim().split(/\s*\+\s*/);
const getMimeType = (element: HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, src: Undef<string>, fallback: string) => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
const getFileExt = (value: string) => value.includes('.') ? fromLastIndexOf(value, '.').trim().toLowerCase() : '';
const getDirectory = (path: string, start: number) => path.substring(start, path.lastIndexOf('/'));
const normalizePath = (value: string) => value.replace(/\\+/g, '/');

export default class File<T extends squared.base.Node> extends squared.base.File<T> implements chrome.base.File<T> {
    public static parseUri(uri: string, options?: UriOptions): Null<ChromeAsset> {
        let element: Undef<HTMLElement>,
            saveAs: Undef<string>,
            format: Undef<string>,
            saveTo: Undef<boolean>,
            preserve: Undef<boolean>,
            inline: Undef<boolean>,
            compress: Undef<CompressFormat[]>,
            textContent: Undef<string>,
            fromConfig: Undef<boolean>;
        if (options) {
            ({ element, saveAs, format, saveTo, preserve, inline, fromConfig } = options);
        }
        let value = trimEnd(uri, '/'),
            relocate: Undef<string>;
        const local = value.startsWith(trimEnd(location.origin, '/'));
        if (saveAs) {
            saveAs = trimEnd(normalizePath(saveAs), '/');
            if (saveTo || fromConfig) {
                relocate = saveAs;
            }
            else {
                const data = parseFileAs('saveAs', saveAs);
                if (data) {
                    ({ file: relocate, format, preserve, inline, compress } = data);
                    if (inline && element) {
                        textContent = element.outerHTML;
                    }
                }
                else {
                    relocate = saveAs;
                }
            }
            if (relocate === '~') {
                relocate = '';
            }
            if (local && relocate) {
                value = resolvePath(relocate, location.href);
            }
        }
        if (!local && !relocate && options && options.preserveCrossOrigin) {
            return null;
        }
        const match = FILE.PROTOCOL.exec(value);
        if (match) {
            const host = match[2];
            const port = match[3];
            const path = match[4] || '';
            const ext = getFileExt(uri);
            let pathname = '',
                filename = '',
                prefix = '',
                rootDir: Undef<string>,
                moveTo: Undef<string>;
            if (!local) {
                if (saveTo && relocate) {
                    [moveTo, pathname, filename] = getFilePath(relocate + '/' + DIR_FUNCTIONS.ASSIGN + (ext ? '.' + ext : ''));
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
                    [moveTo, pathname, filename] = getFilePath(relocate, saveTo, ext);
                }
                else if (path && path !== '/') {
                    filename = fromLastIndexOf(path, '/', '\\');
                    if (local) {
                        if (path.startsWith(prefix)) {
                            pathname = getDirectory(path, prefix.length);
                        }
                        else {
                            moveTo = DIR_FUNCTIONS.SERVERROOT;
                            rootDir = '';
                            pathname = getDirectory(path, 0);
                        }
                    }
                    else {
                        pathname += getDirectory(path, 1);
                    }
                }
            }
            return {
                uri,
                rootDir,
                moveTo,
                pathname: normalizePath(decodeURIComponent(pathname)),
                filename: decodeURIComponent(filename),
                mimeType: ext && parseMimeType(ext),
                format,
                compress,
                preserve,
                textContent,
                inlineContent: inline && element ? getContentType(element) : undefined
            };
        }
        return null;
    }

    public copyTo(directory: string, options: FileCopyingOptions = {}) {
        options.directory = directory;
        return this.copying(this.processAssets(options));
    }

    public appendTo(pathname: string, options: FileArchivingOptions = {}) {
        options.filename ||= this.userSettings.outputArchiveName;
        options.appendTo = pathname;
        return this.archiving(this.processAssets(options));
    }

    public saveAs(filename: string, options: FileArchivingOptions = {}) {
        options.filename = filename;
        return this.archiving(this.processAssets(options));
    }

    public getHtmlPage(options?: FileActionOptions) {
        const element = document.documentElement;
        let file = element.dataset.chromeFile;
        if (file === 'exclude') {
            return [];
        }
        let assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsHtml: Undef<SaveAsOptions>;
        if (options) {
            ({ preserveCrossOrigin, assetMap } = options);
            saveAsHtml = options.saveAs?.html;
        }
        let filename: Undef<string>,
            format: Undef<string>,
            compress: Undef<CompressFormat[]>,
            tasks: Undef<string[]>,
            attributes: Undef<AttributeValue[]>,
            cloudStorage: Undef<CloudService[]>;
        if (assetMap && assetMap.has(element)) {
            const command = assetMap.get(element)!;
            if (command.ignore || command.exclude) {
                return [];
            }
            ({ filename, compress, tasks, attributes, cloudStorage } = command);
            if (command.process) {
                format = command.process.join('+');
            }
        }
        else if (saveAsHtml) {
            if (saveAsHtml.ignore || saveAsHtml.exclude) {
                return [];
            }
            ({ filename, format, compress, tasks, attributes, cloudStorage } = saveAsHtml);
        }
        else if (file === 'ignore') {
            return [];
        }
        else {
            tasks = getTasks(element);
        }
        if (filename) {
            file = '';
        }
        const data = File.parseUri(location.href, { preserveCrossOrigin, saveAs: file, format });
        if (this.processExtensions(data)) {
            setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
            if (attributes) {
                data.textContent = /^\s*<[\S\s]*html[^>]+>\s*/i.exec(element.outerHTML)?.[0].replace(/(\s?[\w-]+="")+>/g, '');
            }
            data.filename ||= filename || 'index.html';
            data.mimeType = 'text/html';
            return [data];
        }
        return [];
    }

    public getScriptAssets(options?: FileActionOptions): [ChromeAsset[], Undef<TranspileMap>] {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsScript: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsScript = options.saveAs?.script;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        let transpileMap: Undef<TranspileMap>;
        if (assetMap) {
            for (const item of assetMap.values()) {
                if (!item.selector) {
                    const template = item.template;
                    if (template) {
                        switch (item.type) {
                            case 'html':
                            case 'js':
                            case 'css': {
                                const { module, identifier } = template;
                                let value = template.value;
                                if (module && identifier && value && (value = value.trim()) && value.startsWith('function')) {
                                    ((transpileMap ||= { html: {}, js: {}, css: {} })[item.type][module] ||= {})[identifier] = value;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
        document.querySelectorAll('script').forEach(element => {
            const template = element.dataset.chromeTemplate;
            if (template || element.type === 'text/template') {
                let category: Undef<string>,
                    module: Undef<string>,
                    identifier: Undef<string>;
                if (assetMap && assetMap.has(element)) {
                    const command = assetMap.get(element)!;
                    category = command.type;
                    if (command.template) {
                        ({ module, identifier } = command.template);
                    }
                    excludeAsset(result, command, element.outerHTML);
                }
                else if (template) {
                    [category, module, identifier] = replaceMap(template.split('::'), (value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                }
                if (category && module && identifier) {
                    switch (category) {
                        case 'html':
                        case 'js':
                        case 'css':
                            ((transpileMap ||= { html: {}, js: {}, css: {} })[category][module] ||= {})[identifier] = element.textContent!.trim();
                            break;
                    }
                }
            }
            else {
                const src = element.src.trim();
                this.createBundle(result, bundleIndex, element, src, getMimeType(element, src, 'text/javascript'), preserveCrossOrigin, assetMap, saveAsScript);
            }
        });
        setBundleIndex(bundleIndex);
        return [result, transpileMap];
    }

    public getLinkAssets(options?: FileActionOptions) {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            saveAsLink: Undef<SaveAsOptions>,
            preserveCrossOrigin: Undef<boolean>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsLink = options.saveAs?.link;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll('link, style').forEach((element: HTMLLinkElement | HTMLStyleElement) => {
            let href: Undef<string>,
                mimeType: Undef<string>;
            if (element instanceof HTMLLinkElement && (href = element.href.trim())) {
                switch (element.rel.trim().toLowerCase()) {
                    case 'stylesheet':
                        mimeType = 'text/css';
                        break;
                    case 'icon':
                        mimeType = 'image/x-icon';
                        break;
                }
            }
            this.createBundle(result, bundleIndex, element, href, mimeType || getMimeType(element, href, 'text/css'), preserveCrossOrigin, assetMap, saveAsLink, mimeType === 'text/css' || element instanceof HTMLStyleElement);
        });
        let format: Undef<string>,
            compress: Undef<CompressFormat[]>,
            tasks: Undef<string[]>,
            preserve: Undef<boolean>,
            cloudStorage: Undef<CloudService[]>;
        if (saveAsLink) {
            ({ format, preserve, compress, tasks, cloudStorage } = saveAsLink);
        }
        for (const [uri, item] of ASSETS.rawData) {
            if (item.mimeType === 'text/css') {
                const data = File.parseUri(resolvePath(uri), { preserveCrossOrigin, format, preserve });
                if (this.processExtensions(data)) {
                    setOutputModifiers(data, compress, tasks, cloudStorage);
                    data.mimeType = item.mimeType;
                    result.push(data);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result;
    }

    public getImageAssets(options?: FileActionOptions) {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>,
            saveAsBase64: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            if (options.saveAs) {
                ({ image: saveAsImage, base64: saveAsBase64 } = options.saveAs);
            }
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll('video').forEach((element: HTMLVideoElement) => this.processImageUri(result, element, resolvePath(element.poster), saveAsImage, preserveCrossOrigin, assetMap));
        document.querySelectorAll('picture > source').forEach((element: HTMLSourceElement) => {
            for (const uri of element.srcset.trim().split(',')) {
                this.processImageUri(result, element, resolvePath(splitPairStart(uri, ' ')), saveAsImage, preserveCrossOrigin, assetMap);
            }
        });
        document.querySelectorAll('img, input[type=image]').forEach((element: HTMLImageElement) => {
            const src = element.src.trim();
            if (!src.startsWith('data:image/')) {
                this.processImageUri(result, element, resolvePath(src), saveAsImage, preserveCrossOrigin, assetMap);
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            RE_SRCSET.matcher(element.srcset.trim());
            while (RE_SRCSET.find()) {
                this.processImageUri(result, element, resolvePath(RE_SRCSET.group(1)!), saveAsImage, preserveCrossOrigin, assetMap);
            }
        });
        for (const uri of ASSETS.image.keys()) {
            this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
        }
        for (const rawData of ASSETS.rawData.values()) {
            const { base64, filename, mimeType } = rawData;
            if (base64) {
                if (saveAsBase64) {
                    let commands: Undef<string[]>;
                    if (mimeType && mimeType.startsWith('image/')) {
                        switch (saveAsBase64.format) {
                            case 'png':
                            case 'jpeg':
                            case 'webp':
                            case 'bmp':
                                commands = [saveAsBase64.format + '@'];
                                break;
                        }
                    }
                    const data = this.processImageUri(
                        result,
                        null,
                        resolvePath(getFilePath(appendSeparator(saveAsBase64.pathname, filename))[1] + '/' + filename, location.href),
                        saveAsImage,
                        preserveCrossOrigin
                    );
                    if (data) {
                        data.base64 = base64;
                        data.commands ||= commands;
                        data.cloudStorage = saveAsBase64.cloudStorage;
                    }
                }
            }
            else if (mimeType && rawData.content) {
                const data = {
                    pathname: DIR_FUNCTIONS.GENERATED + `/${mimeType.split('/').pop()!}`,
                    filename,
                    content: rawData.content,
                    mimeType
                };
                if (this.processExtensions(data)) {
                    result.push(data);
                }
            }
        }
        return result;
    }

    public getVideoAssets(options?: FileActionOptions) {
        return this.getRawAssets('video', options);
    }

    public getAudioAssets(options?: FileActionOptions) {
        return this.getRawAssets('audio', options);
    }

    public getFontAssets(options?: FileActionOptions) {
        const preserveCrossOrigin = options && options.preserveCrossOrigin;
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (let i = 0, length = fonts.length; i < length; ++i) {
                const url = fonts[i].srcUrl;
                if (url) {
                    const data = File.parseUri(url, { preserveCrossOrigin });
                    if (this.processExtensions(data)) {
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public finalizeRequestBody(data: PlainObject, options: FileActionOptions) {
        data.unusedStyles = options.unusedStyles;
        data.transpileMap = options.transpileMap;
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return (options.watch ? '&watch=1' : '') + (options.productionRelease ? '&release=1' : '');
    }

    public getArchiveQueryParameters(options: FileArchivingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    protected getRawAssets(tagName: ResourceAssetTagName, options?: FileActionOptions) {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsImage = options.saveAs?.image;
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach(element => {
            const items = new Map<HTMLElement, string>();
            let type = '';
            switch (element.tagName) {
                case 'VIDEO':
                case 'AUDIO':
                    element.querySelectorAll('source, track').forEach((source: HTMLSourceElement | HTMLTrackElement) => resolveAssetSource(source, items));
                case 'OBJECT':
                case 'EMBED':
                    type = (element as HTMLObjectElement | HTMLEmbedElement).type;
                case 'IFRAME': {
                    const iframe = element.tagName === 'IFRAME';
                    const file = element.dataset.chromeFile;
                    if (!iframe || file && file.startsWith('saveTo')) {
                        const src = (element instanceof HTMLObjectElement ? element.data : element.src).trim();
                        if (type.startsWith('image/') || parseMimeType(src).startsWith('image/')) {
                            this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap);
                            return;
                        }
                    }
                    else if (iframe) {
                        return;
                    }
                }
            }
            resolveAssetSource(element, items);
            for (const [item, uri] of items) {
                const file = item.dataset.chromeFile;
                let saveAs: Undef<string>,
                    compress: Undef<CompressFormat[]>,
                    tasks: Undef<string[]>,
                    watch: Undef<boolean | WatchInterval>,
                    cloudStorage: Undef<CloudService[]>,
                    attributes: Undef<AttributeValue[]>,
                    saveTo: Undef<boolean>,
                    filename: Undef<string>,
                    fromConfig: Undef<boolean>;
                if (file === 'exclude') {
                    continue;
                }
                if (assetMap && assetMap.has(item)) {
                    const command = assetMap.get(item)!;
                    if (excludeAsset(result, command, item.outerHTML)) {
                        continue;
                    }
                    ({ saveTo: saveAs, filename, compress, tasks, watch, cloudStorage, attributes } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || command.pathname, filename);
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else {
                    if (file === 'ignore') {
                        continue;
                    }
                    const command = parseFileAs('saveTo', file);
                    if (command) {
                        [saveAs, saveTo] = checkSaveAs(uri, command[0]);
                        compress = command[4];
                    }
                    tasks = getTasks(item);
                    watch = parseWatchInterval(item.dataset.chromeWatch);
                }
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
                if (this.processExtensions(data)) {
                    setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                    if (filename) {
                        data.filename = filename;
                    }
                    if (watch) {
                        data.watch = watch;
                    }
                    data.textContent = item.outerHTML;
                    result.push(data);
                }
            }
        });
        return result;
    }

    private processAssets(options: FileActionOptions) {
        const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            for (let i = 0, length = assets.length; i < length; ++i) {
                const item = assets[i];
                switch (item.mimeType) {
                    case 'text/html':
                        item.baseUrl = location.origin + (item.rootDir || location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1));
                    case 'text/css':
                        item.mimeType = '@' + item.mimeType;
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
        delete options.assetMap;
        if (transpileMap) {
            options.transpileMap = transpileMap;
        }
        return options;
    }

    private createBundle(assets: ChromeAsset[], bundleIndex: BundleIndex, element: HTMLElement, src: Undef<string>, mimeType: string, preserveCrossOrigin: Undef<boolean>, assetMap: Undef<Map<Element, AssetCommand>>, saveAsOptions: Undef<SaveAsOptions>, saveAsCondtion = true) {
        let file = element.dataset.chromeFile;
        if (file === 'exclude') {
            return;
        }
        let format: Undef<string>,
            preserve: Undef<boolean>,
            inline: Undef<boolean>,
            compress: Undef<CompressFormat[]>,
            tasks: Undef<string[]>,
            watch: Undef<boolean | WatchInterval>,
            cloudStorage: Undef<CloudService[]>,
            attributes: Undef<AttributeValue[]>,
            filename: Undef<string>,
            fromConfig: Undef<boolean>,
            fromSaveAs: Undef<boolean>;
        if (assetMap && assetMap.has(element)) {
            const command = assetMap.get(element)!;
            if (excludeAsset(assets, command, element.outerHTML)) {
                return;
            }
            let filenameAs: Undef<string>;
            ({ filename: filenameAs, preserve, inline, compress, tasks, watch, cloudStorage, attributes } = command);
            file = src ? command.saveAs : command.exportAs;
            if (!file && filenameAs) {
                if (command.pathname) {
                    [file] = checkSaveAs(src, command.pathname, filenameAs);
                    if (!file) {
                        filename = filenameAs;
                    }
                }
                else {
                    filename = filenameAs;
                }
            }
            if (command.process) {
                format = command.process.join('+');
            }
            fromConfig = true;
        }
        else if (saveAsCondtion && saveAsOptions) {
            if (excludeAsset(assets, saveAsOptions, element.outerHTML)) {
                return;
            }
            filename = saveAsOptions.filename;
            ({ format, preserve, inline, compress, tasks, watch, cloudStorage, attributes } = saveAsOptions);
            if (src) {
                file = filename && getCustomPath(src, saveAsOptions.pathname, filename);
                if (file) {
                    filename = '';
                }
            }
            else {
                if (!filename) {
                    return;
                }
                file = './' + filename;
                filename = '';
            }
            fromSaveAs = true;
        }
        else if (file === 'ignore') {
            return;
        }
        else {
            tasks = getTasks(element);
            watch = parseWatchInterval(element.dataset.chromeWatch);
        }
        let data: Null<ChromeAsset> = null;
        if (src) {
            data = File.parseUri(resolvePath(src), { element, saveAs: file, format, preserve, inline, preserveCrossOrigin, fromConfig });
            if (data && checkBundleStart(assets, data)) {
                data.bundleIndex = -1;
            }
        }
        else if (file) {
            if (!fromConfig && !fromSaveAs) {
                const command = parseFileAs('exportAs', file);
                if (command) {
                    ({ file, format, preserve, inline, compress } = command);
                }
            }
            data = createBundleAsset(assets, element, file, format, preserve, inline);
            if (data) {
                data.bundleIndex = -1;
            }
        }
        if (this.processExtensions(data)) {
            setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
            if (filename) {
                data.filename = filename;
            }
            if (watch) {
                data.watch = watch;
            }
            data.mimeType = mimeType;
            data.textContent = element.outerHTML;
            setBundleData(bundleIndex, data);
            assets.push(data);
        }
    }

    private processImageUri(assets: ChromeAsset[], element: Null<HTMLElement>, uri: string, saveAsImage: Undef<SaveAsOptions>, preserveCrossOrigin: Undef<boolean>, assetMap?: Map<Element, AssetCommand>) {
        if (uri = uri.trim()) {
            let saveAs: Undef<string>,
                pathname: Undef<string>,
                base64: Undef<boolean>,
                compress: Undef<CompressFormat[]>,
                commands: Undef<string[]>,
                tasks: Undef<string[]>,
                watch: Undef<boolean | WatchInterval>,
                cloudStorage: Undef<CloudService[]>,
                attributes: Undef<AttributeValue[]>,
                saveTo: Undef<boolean>,
                filename: Undef<string>,
                fromConfig: Undef<boolean>;
            if (element) {
                const file = element.dataset.chromeFile;
                if (file === 'exclude') {
                    return;
                }
                if (assetMap && assetMap.has(element)) {
                    const command = assetMap.get(element)!;
                    if (excludeAsset(assets, command, element.outerHTML)) {
                        return;
                    }
                    ({ saveTo: saveAs, pathname, filename, commands, base64, compress, tasks, watch, cloudStorage, attributes } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename);
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else if (saveAsImage) {
                    if (excludeAsset(assets, saveAsImage, element.outerHTML)) {
                        return;
                    }
                    ({ pathname, commands, base64, compress, tasks, watch, cloudStorage, attributes } = saveAsImage);
                    [saveAs, saveTo] = checkSaveAs(uri, pathname);
                }
                else if (file) {
                    if (file === 'ignore') {
                        return;
                    }
                    const fileAs = parseFileAs('saveTo', file);
                    if (fileAs) {
                        let format: Undef<string>;
                        ({ file: pathname, format, base64, compress } = fileAs);
                        [saveAs, saveTo] = checkSaveAs(uri, pathname);
                        if (format) {
                            commands = replaceMap(format.split(':'), value => value.trim());
                        }
                    }
                    tasks = getTasks(element);
                    watch = parseWatchInterval(element.dataset.chromeWatch);
                }
            }
            else if (saveAsImage) {
                ({ pathname, commands, base64, compress, tasks, cloudStorage } = saveAsImage);
                [saveAs, saveTo] = checkSaveAs(uri, pathname);
            }
            const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
            if (this.processExtensions(data)) {
                setOutputModifiers(data, compress, tasks, cloudStorage, attributes);
                if (filename) {
                    data.filename = filename;
                }
                if (watch) {
                    data.watch = watch;
                }
                if (element) {
                    data.textContent = element.outerHTML;
                }
                if (commands && commands.length && commands[0] !== '~') {
                    data.commands = commands;
                }
                if (base64) {
                    data.format = 'base64';
                }
                assets.push(data);
                return data;
            }
        }
    }

    private processExtensions(data: Null<ChromeAsset>): data is ChromeAsset {
        if (data) {
            for (const ext of this.application.extensions) {
                if (!ext.processFile(data)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    get application() {
        return this.resource.application as Application<T>;
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}