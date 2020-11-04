import type Application from './application';
import type Extension from './extension';

import Pattern = squared.lib.base.Pattern;

type BundleIndex = ObjectMap<ChromeAsset[]>;
type FileAsData = [string, Undef<string>, boolean, boolean];

const { FILE } = squared.lib.regex;

const ASSETS = squared.base.Resource.ASSETS;

const { convertWord, fromLastIndexOf, isString, parseMimeType, resolvePath, splitPair, splitPairStart, trimEnd } = squared.lib.util;

const { appendSeparator, randomUUID } = squared.base.lib.util;

const STRING_SERVERROOT = '__serverroot__';
const STRING_GENERATED = '__generated__';
const REGEXP_ESCAPEPATH = /([.|/\\{}()?])/g;

const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);

function parseFileAs(attr: string, value: Undef<string>, leading: "preserve" | "base64" = 'preserve', trailing: "compress" | "inline" = 'inline') {
    if (value) {
        const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(normalizePath(value));
        if (match) {
            const segments = match[1].split('::').map(item => item.trim());
            const actions = segments[2] || '';
            return [segments[0], segments[1], actions.includes(leading), actions.includes(trailing)] as FileAsData;
        }
    }
}

function getFilePath(value: string, saveTo?: boolean): [Undef<string>, string, string] {
    value = normalizePath(value);
    if (!value.includes('/')) {
        return ['', '', value];
    }
    let moveTo: Undef<string>;
    if (value[0] === '/') {
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
        value = pathname.join('/') + '/' + value.split('../').pop();
    }
    else if (value.startsWith('./')) {
        value = value.substring(2);
    }
    const result = splitPair(value, '/', false, true);
    if (saveTo) {
        result[1] = getFilenameUUID(result[1]);
    }
    return [moveTo, result[0], result[1]];
}

function getFilenameUUID(value: string) {
    const ext = getFileExt(value);
    return randomUUID() + (ext ? '.' + ext : '');
}

function resolveAssetSource(element: HTMLVideoElement | HTMLAudioElement | HTMLObjectElement | HTMLEmbedElement | HTMLSourceElement | HTMLTrackElement | HTMLIFrameElement, data: Map<HTMLElement, string>) {
    const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
    if (value) {
        data.set(element, value);
    }
}

function getExtensions(element: Null<HTMLElement>) {
    if (element) {
        const dataset = element.dataset;
        const use = dataset.useChrome || dataset.use;
        if (use) {
            return use.trim().split(/\s*,\s*/);
        }
    }
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

function sortBundle(a: ChromeAsset, b: ChromeAsset) {
    if (a.bundleIndex === 0) {
        return 1;
    }
    else if (b.bundleIndex === 0) {
        return -1;
    }
    return 0;
}

function createBundleAsset(assets: ChromeAsset[], element: HTMLElement, saveTo: string, format: Undef<string>, preserve?: boolean, inline?: boolean): Null<ChromeAsset> {
    const content = element.innerHTML.trim();
    if (content) {
        const [moveTo, pathname, filename] = getFilePath(saveTo);
        const previous = assets[assets.length - 1];
        const locationData: ChromeAsset = { moveTo, pathname, filename };
        if (previous && hasSamePath(previous, locationData)) {
            (previous.trailingContent ||= []).push({ value: content, format, preserve });
        }
        else{
            return {
                uri: resolvePath(saveTo, location.href),
                pathname,
                filename: assets.find(item => hasSamePath(item, locationData)) ? getFilenameUUID(filename) : filename,
                moveTo,
                content,
                format,
                preserve,
                inlineContent: inline ? getContentType(element) : undefined
            };
        }
    }
    return null;
}

function setBundleData(bundleIndex: BundleIndex, data: ChromeAsset) {
    const name = (data.moveTo || '') + data.pathname + data.filename;
    (bundleIndex[name] ||= []).push(data);
}

function checkBundlePackage(assets: ChromeAsset[], item: Null<ChromeAsset>): [Null<ChromeAsset>, boolean] {
    if (item) {
        for (let i = 0, length = assets.length; i < length; ++i) {
            if (hasSamePath(assets[i], item)) {
                for (let j = i + 1; j < length; ++j) {
                    if (!hasSamePath(assets[j], item)) {
                        item.filename = getFilenameUUID(item.filename);
                        return [item, true];
                    }
                }
                return [item, false];
            }
        }
    }
    return [item, true];
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

function checkSaveAs(uri: Undef<string>, pathname?: string, filename?: string): [string, boolean] {
    if (filename) {
        return [getCustomPath(uri, pathname, filename), false];
    }
    else if (pathname && pathname !== '~') {
        return [pathname, true];
    }
    return ['', false];
}

const getCustomPath = (uri: Undef<string>, pathname: Undef<string>, filename: string) => appendSeparator(uri && (!pathname || pathname === '~') ? FILE.PROTOCOL.exec(uri)?.[4] : pathname, filename);
const getMimeType = (element: HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, src: Undef<string>, fallback: string) => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
const hasSamePath = (item: ChromeAsset, other: ChromeAsset) => (item.moveTo === other.moveTo || !item.moveTo && !moveTo) && item.pathname === other.pathname && item.filename === other.filename;
const convertFileMatch = (value: string) => new RegExp(value.replace(REGEXP_ESCAPEPATH, (match, ...capture) => '\\' + capture[0]).replace(/\*/g, '.*?') + '$');
const getFileExt = (value: string) => value.includes('.') ? fromLastIndexOf(value, '.').trim().toLowerCase() : '';
const getDirectory = (path: string, start: number) => path.substring(start, path.lastIndexOf('/'));
const normalizePath = (value: string) => value.replace(/\\/g, '/');

export default class File<T extends squared.base.Node> extends squared.base.File<T> implements chrome.base.File<T> {
    public static parseUri(uri: string, options?: UriOptions): Null<ChromeAsset> {
        let element: Undef<HTMLElement>,
            saveAs: Undef<string>,
            format: Undef<string>,
            saveTo: Undef<boolean>,
            preserve: Undef<boolean>,
            inline: Undef<boolean>,
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
            if (saveTo) {
                relocate = saveAs;
            }
            else {
                const data = parseFileAs('saveAs', saveAs);
                if (data) {
                    let formatAs: Undef<string>,
                        preserveAs: Undef<boolean>,
                        inlineAs: Undef<boolean>;
                    [relocate, formatAs, preserveAs, inlineAs] = data;
                    if (!fromConfig) {
                        format = formatAs;
                        preserve = preserveAs;
                        if (inlineAs && element) {
                            inline = true;
                            textContent = element.outerHTML;
                        }
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
                preserve,
                textContent,
                inlineContent: inline && element ? getContentType(element) : undefined
            };
        }
        return null;
    }

    private _outputFileExclusions: Null<RegExp[]> = null;

    public reset() {
        this._outputFileExclusions = null;
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

    public getHtmlPage(options?: IFileActionOptions) {
        let filename: Undef<string>,
            assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsHtml: Undef<SaveAsOptions>;
        if (options) {
            ({ preserveCrossOrigin, assetMap } = options);
            saveAsHtml = options.saveAs?.html;
        }
        const result: ChromeAsset[] = [];
        const element = document.querySelector('html');
        let file: Undef<string>,
            format: Undef<string>;
        if (element) {
            file = element.dataset.chromeFile;
            if (file === 'exclude') {
                return result;
            }
            if (assetMap && assetMap.has(element)) {
                const command = assetMap.get(element)!;
                if (command.ignore || command.exclude) {
                    return result;
                }
                filename = command.filename;
                if (command.process) {
                    format = command.process.join('+');
                }
            }
            else if (saveAsHtml) {
                if (saveAsHtml.ignore || saveAsHtml.exclude) {
                    return result;
                }
                if (saveAsHtml.filename) {
                    file = fromLastIndexOf(saveAsHtml.filename, '/', '\\');
                    format = saveAsHtml.format;
                }
            }
            else if (file === 'ignore') {
                return result;
            }
        }
        const data = File.parseUri(location.href, { preserveCrossOrigin, saveAs: file, format });
        if (data) {
            if (filename) {
                data.filename = filename;
            }
            else if (!FILE.NAME.test(data.filename)) {
                data.filename = 'index.html';
            }
            if (this.validFile(data)) {
                data.basePath = location.origin + (data.rootDir || location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1));
                data.mimeType = parseMimeType('html');
                this.processExtensions(data, getExtensions(document.querySelector('html')));
                result.push(data);
            }
        }
        return result;
    }

    public getScriptAssets(options?: IFileActionOptions): [ChromeAsset[], TranspileMap] {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsScript: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsScript = options.saveAs?.script;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        const transpileMap: TranspileMap = { html: {}, js: {}, css: {} };
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
                                    (transpileMap[item.type][module] ||= {})[identifier] = value;
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
            if (template) {
                if (element.type === 'text/template') {
                    let category: Undef<string>,
                        module: Undef<string>,
                        identifier: Undef<string>;
                    if (assetMap && assetMap.has(element)) {
                        const command = assetMap.get(element)!;
                        if (excludeAsset(result, command, element.outerHTML)) {
                            return;
                        }
                        category = command.type;
                        if (command.template) {
                            ({ module, identifier } = command.template);
                        }
                    }
                    else {
                        [category, module, identifier] = template.split('::').map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                    }
                    if (category && module && identifier) {
                        switch (category) {
                            case 'html':
                            case 'js':
                            case 'css':
                                (transpileMap[category][module] ||= {})[identifier] = element.textContent!.trim();
                                break;
                        }
                    }
                }
            }
            else {
                const src = element.src.trim();
                this.createBundle(result, bundleIndex, element, src, getMimeType(element, src, 'text/javascript'), preserveCrossOrigin, assetMap, saveAsScript);
            }
        });
        setBundleIndex(bundleIndex);
        return [result.sort(sortBundle), transpileMap];
    }

    public getLinkAssets(options?: IFileActionOptions) {
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
            preserve: Undef<boolean>;
        if (saveAsLink) {
            ({ format, preserve } = saveAsLink);
        }
        for (const [uri, item] of ASSETS.rawData) {
            if (item.mimeType === 'text/css') {
                const asset = File.parseUri(resolvePath(uri), { preserveCrossOrigin, format, preserve });
                if (this.validFile(asset)) {
                    asset.mimeType = item.mimeType;
                    this.processExtensions(asset);
                    result.push(asset);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result.sort(sortBundle);
    }

    public getImageAssets(options?: IFileActionOptions) {
        let transforms: Undef<TransformCommand[]>,
            assetMap: Undef<Map<Element, AssetCommand>>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>,
            saveAsBase64: Undef<SaveAsOptions>;
        if (options) {
            ({ transforms, assetMap, preserveCrossOrigin } = options);
            if (options.saveAs) {
                ({ image: saveAsImage, base64: saveAsBase64 } = options.saveAs);
            }
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll('video').forEach((element: HTMLVideoElement) => this.processImageUri(result, element, resolvePath(element.poster), saveAsImage, transforms, preserveCrossOrigin, assetMap));
        document.querySelectorAll('picture > source').forEach((element: HTMLSourceElement) => {
            for (const uri of element.srcset.trim().split(',')) {
                this.processImageUri(result, element, resolvePath(splitPairStart(uri, ' ')), saveAsImage, transforms, preserveCrossOrigin, assetMap);
            }
        });
        document.querySelectorAll('img, input[type=image]').forEach((element: HTMLImageElement) => {
            const src = element.src.trim();
            if (!src.startsWith('data:image/')) {
                this.processImageUri(result, element, resolvePath(src), saveAsImage, transforms, preserveCrossOrigin, assetMap);
            }
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            RE_SRCSET.matcher(element.srcset.trim());
            while (RE_SRCSET.find()) {
                this.processImageUri(result, element, resolvePath(RE_SRCSET.group(1)!), saveAsImage, transforms, preserveCrossOrigin, assetMap);
            }
        });
        for (const uri of ASSETS.image.keys()) {
            this.processImageUri(result, null, uri, saveAsImage, transforms, preserveCrossOrigin);
        }
        for (const rawData of ASSETS.rawData.values()) {
            if (rawData.pathname) {
                continue;
            }
            const { base64, filename, mimeType } = rawData;
            let data: Undef<ChromeAsset>;
            if (base64) {
                if (saveAsBase64) {
                    let commands: Undef<string[]>;
                    if (mimeType && mimeType.startsWith('image/')) {
                        switch (saveAsBase64.format) {
                            case 'png':
                            case 'jpeg':
                            case 'bmp':
                            case 'gif':
                            case 'tiff':
                                commands = ['@' + saveAsBase64.format];
                                break;
                        }
                    }
                    data = this.processImageUri(
                        result,
                        null,
                        resolvePath(getFilePath(appendSeparator(saveAsBase64.pathname, filename))[1] + '/' + filename, location.href),
                        saveAsImage,
                        transforms,
                        preserveCrossOrigin,
                        undefined,
                        commands
                    );
                    if (data) {
                        data.base64 = base64;
                        continue;
                    }
                }
                data = {
                    pathname: STRING_GENERATED + '/base64',
                    filename,
                    mimeType,
                    base64
                };
            }
            else if (mimeType && rawData.content) {
                data = {
                    pathname: STRING_GENERATED + `/${mimeType.split('/').pop()!}`,
                    filename,
                    content: rawData.content,
                    mimeType
                };
            }
            else {
                continue;
            }
            if (this.validFile(data)) {
                this.processExtensions(data);
                result.push(data);
            }
        }
        return result;
    }

    public getVideoAssets(options?: IFileActionOptions) {
        return this.getRawAssets('video', options);
    }

    public getAudioAssets(options?: IFileActionOptions) {
        return this.getRawAssets('audio', options);
    }

    public getFontAssets(options?: IFileActionOptions) {
        const preserveCrossOrigin = options && options.preserveCrossOrigin;
        const result: ChromeAsset[] = [];
        for (const fonts of ASSETS.fonts.values()) {
            for (let i = 0, length = fonts.length; i < length; ++i) {
                const url = fonts[i].srcUrl;
                if (url) {
                    const data = File.parseUri(url, { preserveCrossOrigin });
                    if (this.validFile(data)) {
                        this.processExtensions(data);
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

    protected getRawAssets(tagName: "video" | "audio" | "object" | "embed" | "iframe", options?: IFileActionOptions) {
        let assetMap: Undef<Map<Element, AssetCommand>>,
            transforms: Undef<TransformCommand[]>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ transforms, assetMap, preserveCrossOrigin } = options);
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
                            this.processImageUri(result, element, src, saveAsImage, transforms, preserveCrossOrigin, assetMap);
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
                    saveTo: Undef<boolean>,
                    fromConfig: Undef<boolean>;
                if (file === 'exclude') {
                    continue;
                }
                if (assetMap && assetMap.has(item)) {
                    const command = assetMap.get(item)!;
                    if (excludeAsset(result, command, item.outerHTML)) {
                        continue;
                    }
                    let pathname: Undef<string>,
                        filename: Undef<string>;
                    ({ saveTo: saveAs, pathname, filename } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename);
                    fromConfig = true;
                }
                else {
                    if (file === 'ignore') {
                        continue;
                    }
                    const command = parseFileAs('saveTo', file);
                    if (command) {
                        [saveAs, saveTo] = checkSaveAs(uri, command[0]);
                    }
                }
                const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
                if (this.validFile(data)) {
                    this.processExtensions(data, getExtensions(item));
                    result.push(data);
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
                switch (item.mimeType) {
                    case 'text/html':
                    case 'application/xhtml+xml':
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
        options.transpileMap = transpileMap;
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
            fromConfig: Undef<boolean>,
            fromSaveAs: Undef<boolean>;
        if (assetMap && assetMap.has(element)) {
            const command = assetMap.get(element)!;
            if (excludeAsset(assets, command, element.outerHTML)) {
                return;
            }
            if (command.process) {
                format = command.process.join('+');
            }
            if (src) {
                if (command.saveAs) {
                    file = command.saveAs;
                }
            }
            else {
                file = command.exportAs;
            }
            ({ preserve, inline } = command);
            fromConfig = true;
        }
        else if (saveAsCondtion && saveAsOptions && saveAsOptions.filename) {
            if (excludeAsset(assets, saveAsOptions, element.outerHTML)) {
                return;
            }
            file = getCustomPath(src, saveAsOptions.pathname, saveAsOptions.filename);
            ({ format, preserve, inline } = saveAsOptions);
            fromSaveAs = true;
        }
        else if (file === 'ignore') {
            return;
        }
        let data: Null<ChromeAsset> = null,
            first: Undef<boolean>;
        if (src) {
            [data, first] = checkBundlePackage(assets, File.parseUri(resolvePath(src), { element, preserveCrossOrigin, saveAs: file, format, preserve, inline, fromConfig }));
            if (data && first) {
                data.bundleIndex = -1;
            }
        }
        else {
            if (file && !fromConfig && !fromSaveAs) {
                const command = parseFileAs('exportAs', file);
                if (command) {
                    [file, format, preserve, inline] = command;
                }
            }
            if (isString(file)) {
                data = createBundleAsset(assets, element, file, format, preserve, inline);
                if (data) {
                    data.bundleIndex = -1;
                }
            }
        }
        if (this.validFile(data)) {
            data.textContent = element.outerHTML;
            setBundleData(bundleIndex, data);
            data.mimeType = mimeType;
            this.processExtensions(data, getExtensions(element));
            assets.push(data);
        }
    }

    private processImageUri(assets: ChromeAsset[], element: Null<HTMLElement>, uri: string, saveAsImage: Undef<SaveAsOptions>, transforms: Undef<TransformCommand[]>, preserveCrossOrigin: Undef<boolean>, assetMap?: Map<Element, AssetCommand>, commands?: string | string[]) {
        if (uri = uri.trim()) {
            let saveAs: Undef<string>,
                saveTo: Undef<boolean>,
                format: Undef<string>,
                base64: Undef<boolean>,
                compress: Undef<boolean>,
                textContent: Undef<string>,
                fromConfig: Undef<boolean>;
            if (element) {
                let file = element.dataset.chromeFile,
                    pathname: Undef<string>,
                    filename: Undef<string>;
                if (assetMap && assetMap.has(element)) {
                    const command = assetMap.get(element)!;
                    if (excludeAsset(assets, command, element.outerHTML)) {
                        return;
                    }
                    ({ saveTo: saveAs, pathname, filename, commands, base64, compress } = command);
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename);
                    fromConfig = true;
                    textContent = element.outerHTML;
                }
                else {
                    if (transforms) {
                        const id = element.id.trim();
                        if (id) {
                            const data = transforms.find(item => item.id === id);
                            if (data) {
                                ({ pathname, filename, commands, base64, compress } = data);
                                [saveAs, saveTo] = checkSaveAs(uri, pathname, filename);
                                file = '';
                            }
                        }
                    }
                    if (saveAsImage) {
                        if (excludeAsset(assets, saveAsImage, element.outerHTML)) {
                            return;
                        }
                        ({ format, base64, compress } = saveAsImage);
                    }
                    else if (file) {
                        if (file === 'ignore') {
                            return;
                        }
                        const fileAs = parseFileAs('saveTo', file, 'base64', 'compress');
                        if (fileAs) {
                            [pathname, commands, base64, compress] = fileAs;
                            [saveAs, saveTo] = checkSaveAs(uri, pathname);
                            textContent = element.outerHTML;
                        }
                    }
                }
            }
            const data = File.parseUri(uri, { preserveCrossOrigin, saveAs, saveTo, fromConfig });
            if (this.validFile(data) && (textContent || !assets.find(item => item.uri === uri))) {
                if (textContent) {
                    data.textContent = textContent;
                }
                if (!fromConfig && !commands && format && format !== 'base64') {
                    commands = format;
                }
                if (commands) {
                    if (typeof commands === 'string') {
                        commands = commands.split(':').map(value => value.trim());
                    }
                    if (commands[0] !== '~') {
                        data.commands = commands;
                    }
                }
                if (data.mimeType && (base64 || !fromConfig && format === 'base64')) {
                    data.format = 'base64';
                }
                if (compress) {
                    (data.compress ||= []).push({ format: 'png' });
                }
                this.processExtensions(data, getExtensions(element));
                assets.push(data);
                return data;
            }
        }
    }

    private processExtensions(data: ChromeAsset, extensions?: string[]) {
        const extensionManager = this.application.extensionManager!;
        const processed: Extension<T>[] = [];
        for (const ext of this.application.extensions) {
            if (ext.processFile(data)) {
                processed.push(ext);
            }
        }
        if (extensions) {
            for (const name of extensions) {
                const ext = extensionManager.get(name, true) as Undef<Extension<T>>;
                if (ext && !processed.includes(ext)) {
                    ext.processFile(data, true);
                }
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