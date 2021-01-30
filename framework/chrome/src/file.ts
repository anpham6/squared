import DIR_FUNCTIONS = internal.chrome.DIR_FUNCTIONS

import type Application from './application';

import Resource = squared.base.Resource;
import Pattern = squared.lib.base.Pattern;

type CloudStorage = unknown;
type BundleIndex = ObjectMap<ChromeAsset[]>;

interface OptionsData {
    preserve?: boolean;
    inline?: boolean;
    blob?: boolean;
    compress?: CompressFormat[];
}

interface FileAsData extends OptionsData {
    file: string;
    format?: string;
}

const ASSETS = squared.base.Resource.ASSETS;

const { convertWord, endsWith, parseMimeType, replaceMap, resolvePath, splitPair, splitPairEnd, splitPairStart, startsWith, trimEnd } = squared.lib.util;

const { appendSeparator, fromMimeType, parseTask, parseWatchInterval, randomUUID } = squared.base.lib.util;

const RE_SRCSET = new Pattern(/\s*(.+?\.[^\s,]+)(\s+[\d.]+[wx])?\s*,?/g);

const FILENAME_MAP = new WeakMap<ChromeAsset, string>();
let BUNDLE_ID = 0;

function parseFileAs(attr: string, value: Undef<string>) {
    if (value) {
        const match = new RegExp(`${attr}:\\s*((?:[^"]|\\\\")+)`).exec(normalizePath(value));
        if (match) {
            const segments = replaceMap(match[1].split('::'), item => item.trim());
            return { file: segments[0], format: segments[1] } as FileAsData;
        }
    }
}

function parseOptions(value: Undef<string>): OptionsData {
    if (value) {
        const pattern = /\bcompress\[\s*([a-z\d]+)\s*\]/g;
        let compress: Undef<CompressFormat[]>,
            match: Null<RegExpExecArray>;
        while (match = pattern.exec(value)) {
            (compress ||= []).push({ format: match[1] });
        }
        return { preserve: value.includes('preserve'), inline: value.includes('inline'), blob: value.includes('blob'), compress };
    }
    return {};
}

function getFilePath(value: string, saveTo?: boolean, ext?: string): [Undef<string>, string, string] {
    value = normalizePath(value);
    if (startsWith(value, './')) {
        value = value.substring(2);
    }
    if (!value.includes('/')) {
        return ['', '', value];
    }
    let moveTo: Undef<string>;
    if (value[0] === '/') {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
        value = value.substring(1);
    }
    else if (startsWith(value, '../')) {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
        let pathname: StringOfArray = location.pathname.split('/');
        if (--pathname.length) {
            for (let i = 0, length = value.length; i < length; i += 3) {
                if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                    break;
                }
            }
        }
        pathname.shift();
        pathname = pathname.join('/');
        value = (pathname ? pathname + '/' : '') + value.split('../').pop();
    }
    const result = splitPair(value, '/', false, true);
    if (saveTo) {
        result[1] = assignFilename(result[1], ext);
    }
    return [moveTo, result[0], result[1]];
}

function assignFilename(value: string, ext?: string) {
    ext ||= value && getFileExt(value);
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

function createBundleAsset(assets: ChromeAsset[], element: HTMLElement, file: string, mimeType: string, format: Undef<string>, documentData: StringOfArray, preserve?: boolean, inline?: boolean): Null<ChromeAsset> {
    const content = element.innerHTML;
    if (content.trim()) {
        const [moveTo, pathname, filename] = getFilePath(file);
        const previous = assets[assets.length - 1];
        const data = {
            uri: location.href,
            pathname,
            filename,
            moveTo,
            content,
            mimeType,
            format,
            preserve,
            inlineContent: inline ? getContentType(element) : undefined
        } as ChromeAsset;
        if (previous && hasSamePath(previous, data, true)) {
            (previous.trailingContent ||= []).push(content);
            excludeAsset(assets, { exclude: true }, element, documentData);
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

function excludeAsset(assets: ChromeAsset[], command: AssetCommand, element: HTMLElement, document: StringOfArray) {
    if (command.exclude) {
        assets.push({ pathname: '', filename: '', exclude: true, element, document });
        return true;
    }
    if (command.ignore) {
        return true;
    }
    return false;
}

function checkSaveAs(uri: Undef<string>, pathname: Undef<string>, filename: string): [string, boolean] {
    const value = getCustomPath(uri, pathname, filename || assignFilename(''));
    if (value) {
        return [value, false];
    }
    else if (pathname && pathname !== '~') {
        return [pathname, true];
    }
    return ['', false];
}

function setOutputModifiers(data: ChromeAsset, document: Undef<StringOfArray>, compress: Undef<CompressFormat[]>, tasks: Undef<TaskAction[]>, cloudStorage: Undef<CloudStorage[]>, attributes?: AttributeMap, element?: Null<HTMLElement>) {
    if (document) {
        data.document = document;
    }
    if (compress) {
        (data.compress ||= []).push(...compress);
    }
    if (tasks) {
        data.tasks = tasks;
    }
    if (attributes) {
        data.attributes = attributes;
    }
    if (cloudStorage) {
        data.cloudStorage = cloudStorage;
    }
    if (element) {
        data.element = element;
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

function getPageFilename(value: Undef<string>) {
    if (!value) {
        const filename = getFilename(location.href);
        return /\.html?$/.exec(filename) ? filename : 'index.html';
    }
    return value;
}

function setUUID(element: HTMLElement, index: ElementIndex, name: string) {
    const documentId = element.dataset[name + 'Id'] ||= randomUUID();
    index.id![name] = documentId;
}

const getFilename = (value: string) => value.split('?')[0].split('/').pop()!;
const copyDocument = (value: StringOfArray) => Array.isArray(value) ? value.slice(0) : value;
const hasSamePath = (item: ChromeAsset, other: ChromeAsset, bundle?: boolean) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && startsWith(item.filename, DIR_FUNCTIONS.ASSIGN)) && (item.moveTo || '') === (other.moveTo || '');
const getMimeType = (element: HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, src: Undef<string>, fallback: string) => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
const getFileExt = (value: string) => splitPairEnd(value, '.', true, true).toLowerCase();
const normalizePath = (value: string) => value.replace(/\\+/g, '/');

export default class File<T extends squared.base.Node> extends squared.base.File<T> implements chrome.base.File<T> {
    public static getElementIndex(element: Element, domAll: NodeListOf<Element>, cache: SelectorCache): ElementIndex {
        const tagName = element.tagName;
        const elements = cache[tagName] ||= document.querySelectorAll(tagName);
        const tagCount = elements.length;
        let domIndex = -1,
            tagIndex = -1;
        for (let i = 0, length = domAll.length; i < length; ++i) {
            if (domAll[i] === element) {
                domIndex = i;
            }
        }
        for (let i = 0; i < tagCount; ++i) {
            if (elements[i] === element) {
                tagIndex = i;
                break;
            }
        }
        return { domIndex, tagName, tagIndex, tagCount, outerHTML: '', id: {} };
    }

    public static setDocumentId(element: HTMLElement, index: ElementIndex, document: Undef<StringOfArray>) {
        if (Array.isArray(document)) {
            for (const name of document) {
                setUUID(element, index, name);
            }
        }
        else if (document) {
            setUUID(element, index, document);
        }
    }

    public static parseUri(uri: string, preserveCrossOrigin?: boolean, options?: UriOptions): Null<ChromeAsset> {
        let saveAs: Undef<string>,
            mimeType: Undef<string>,
            format: Undef<string>,
            saveTo: Undef<boolean>,
            fromConfig: Undef<boolean>;
        if (options) {
            ({ saveAs, mimeType, format, saveTo, fromConfig } = options);
        }
        let value = trimEnd(uri, '/'),
            file: Undef<string>;
        const local = startsWith(value, location.origin);
        if (saveAs) {
            saveAs = trimEnd(normalizePath(saveAs), '/');
            if (saveTo || fromConfig) {
                file = saveAs;
            }
            else {
                const data = parseFileAs('saveAs', saveAs);
                if (data) {
                    ({ file, format } = data);
                }
                else {
                    file = saveAs;
                }
            }
            if (file === '~') {
                file = '';
            }
            if (local && file) {
                value = resolvePath(file, location.href);
            }
        }
        if (!local && !file && preserveCrossOrigin) {
            return null;
        }
        try {
            const { host, port, pathname: path } = new URL(value);
            const [pathsub, filesub] = splitPair(path, '/', false, true);
            let pathname = '',
                filename = '',
                moveTo: Undef<string>;
            if (file) {
                [moveTo, pathname, filename] = getFilePath(file, saveTo, getFileExt(uri));
            }
            else if (!local) {
                pathname = convertWord(host) + (port ? '/' + port.substring(1) : '') + pathsub;
            }
            if (uri !== location.href) {
                if (local && !pathname) {
                    let pathbase = location.pathname;
                    if (!pathbase.endsWith('/')) {
                        pathbase = splitPairStart(pathbase, '/', false, true);
                    }
                    if (pathsub.startsWith(pathbase)) {
                        pathname = pathsub.substring(pathbase.length + 1);
                    }
                    else {
                        moveTo = DIR_FUNCTIONS.SERVERROOT;
                        pathname = pathsub;
                    }
                }
                filename ||= filesub;
            }
            return {
                uri,
                moveTo,
                pathname: normalizePath(decodeURIComponent(pathname)),
                filename: decodeURIComponent(filename),
                mimeType: mimeType || parseMimeType(uri),
                format
            };
        }
        catch {
        }
        return null;
    }

    public copyTo(pathname: string, options: FileCopyingOptions) {
        options.pathname = pathname;
        return this.copying(this.processAssets(options));
    }

    public appendTo(pathname: string, options: FileArchivingOptions) {
        options.appendTo = pathname;
        return this.archiving(this.processAssets(options));
    }

    public saveAs(filename: string, options: FileArchivingOptions) {
        options.filename = filename;
        return this.archiving(this.processAssets(options));
    }

    public getHtmlPage(options?: FileActionOptions) {
        const element = document.documentElement;
        let file = element.dataset.chromeFile;
        if (file === 'ignore') {
            return [];
        }
        let assetMap: Undef<ElementAssetMap>,
            saveAsHtml: Undef<SaveAsOptions>;
        if (options) {
            assetMap = options.assetMap;
            saveAsHtml = options.saveAs?.html;
        }
        let filename: Undef<string>,
            format: Undef<string>,
            process: Undef<string[]>,
            compress: Undef<CompressFormat[]>,
            tasks: Undef<TaskAction[]>,
            attributes: Undef<AttributeMap>,
            cloudStorage: Undef<CloudStorage[]>,
            documentData: Undef<StringOfArray>;
        if (assetMap && assetMap.has(element)) {
            const command = assetMap.get(element)!;
            if (command.ignore || command.exclude) {
                return [];
            }
            ({ filename, process, compress, tasks, attributes, cloudStorage, document: documentData } = command);
        }
        else if (saveAsHtml) {
            if (saveAsHtml.ignore || saveAsHtml.exclude) {
                return [];
            }
            ({ filename, process, compress, tasks, attributes, cloudStorage, document: documentData } = saveAsHtml);
        }
        else {
            tasks = parseTask(element.dataset.chromeTasks);
        }
        if (filename) {
            file = '';
        }
        if (process) {
            format = process.join('+');
        }
        const data = File.parseUri(location.href, false, { saveAs: file, format, mimeType: 'text/html' });
        if (this.processExtensions(data)) {
            setOutputModifiers(data, documentData, compress, tasks, cloudStorage, attributes, element);
            data.filename ||= getPageFilename(filename);
            return [data];
        }
        return [];
    }

    public getScriptAssets(options?: FileActionOptions): [ChromeAsset[], Undef<TemplateMap>] {
        let assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsScript: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsScript = options.saveAs?.script;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        let templateMap: Undef<TemplateMap>;
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
                                if (module && identifier && value && (value = value.trim()) && startsWith(value, 'function')) {
                                    ((templateMap ||= { html: {}, js: {}, css: {} })[item.type][module] ||= {})[identifier] = value;
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
                    excludeAsset(result, command, element, this.userSettings.outputDocumentHandler);
                }
                else if (template) {
                    [category, module, identifier] = replaceMap(template.split('::'), (value, index) => (index === 0 ? value.toLowerCase() : value).trim());
                }
                if (category && module && identifier) {
                    switch (category) {
                        case 'html':
                        case 'js':
                        case 'css':
                            ((templateMap ||= { html: {}, js: {}, css: {} })[category][module] ||= {})[identifier] = element.textContent!.trim();
                            element.dataset.chromeFile = 'exclude';
                            break;
                    }
                }
            }
            else {
                const src = element.src;
                this.createBundle(result, element, src, getMimeType(element, src, 'text/javascript'), preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsScript);
            }
        });
        setBundleIndex(bundleIndex);
        return [result, templateMap];
    }

    public getLinkAssets(options?: FileActionOptions) {
        let assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsLink: Undef<SaveAsOptions>;
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
            this.createBundle(result, element, href, mimeType || getMimeType(element, href, 'text/css'), preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsLink, mimeType === 'text/css' || element instanceof HTMLStyleElement);
        });
        let process: Undef<string[]>,
            compress: Undef<CompressFormat[]>,
            preserve: Undef<boolean>,
            tasks: Undef<TaskAction[]>,
            cloudStorage: Undef<CloudStorage[]>,
            documentData: Undef<StringOfArray>;
        if (saveAsLink) {
            ({ process, compress, preserve, tasks, cloudStorage, document: documentData } = saveAsLink);
        }
        for (const [uri, item] of ASSETS.rawData) {
            if (item.mimeType === 'text/css') {
                const data = File.parseUri(resolvePath(uri), preserveCrossOrigin, { format: process ? process.join('+'): undefined });
                if (this.processExtensions(data)) {
                    setOutputModifiers(data, documentData, compress, tasks, cloudStorage);
                    if (preserve) {
                        data.preserve = true;
                    }
                    data.mimeType = item.mimeType;
                    result.push(data);
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result;
    }

    public getImageAssets(options?: FileActionOptions) {
        let assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsImage = options.saveAs?.image;
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll('img, input[type=image], picture > source[src]').forEach((element: HTMLImageElement | HTMLSourceElement | HTMLVideoElement) => {
            let src = element instanceof HTMLVideoElement ? element.poster : element.src,
                mimeType: Undef<string>,
                base64: Undef<string>;
            const image = Resource.parseDataURI(src, 'image/unknown', 'base64');
            if (image) {
                if (image.encoding === 'base64') {
                    mimeType = image.mimeType;
                    base64 = image.data as string;
                    src = resolvePath(randomUUID() + '.' + ((mimeType && fromMimeType(mimeType), '/') || 'unknown'), location.href);
                }
                else {
                    return;
                }
            }
            else {
                src = resolvePath(src);
            }
            this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64);
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            RE_SRCSET.matcher(element.srcset.trim());
            while (RE_SRCSET.find()) {
                const src = resolvePath(RE_SRCSET.group(1)!);
                if (src !== resolvePath(element.src)) {
                    this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, undefined, undefined, true);
                }
            }
        });
        for (const uri of ASSETS.image.keys()) {
            const image = Resource.parseDataURI(uri, 'image/unknown', 'base64');
            if (image) {
                this.resource.addRawData(uri, image.data as string, image);
            }
            else if (!result.find(item => item.uri === uri)) {
                this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
            }
        }
        for (const rawData of ASSETS.rawData.values()) {
            const { base64, content, filename, mimeType = parseMimeType(filename) } = rawData;
            if (base64) {
                if (saveAsImage?.blob && !result.find(item => item.base64 === base64)) {
                    let commands: Undef<string[]>;
                    if (startsWith(mimeType, 'image/') && (commands = saveAsImage.commands)) {
                        for (let i = 0; i < commands.length; ++i) {
                            const match = /^\s*(?:(png|jpeg|webp|bmp)\s*[@%]?)(.*)$/.exec(commands[i]);
                            if (match) {
                                commands[i] = match[1] + '@' + match[2].trim();
                            }
                            else {
                                commands.splice(i--, 1);
                            }
                        }
                    }
                    const pathname = saveAsImage.pathname;
                    const data = this.processImageUri(result, null, resolvePath(pathname? appendSeparator(pathname, filename) : filename, location.href), saveAsImage, preserveCrossOrigin, undefined, mimeType, base64);
                    if (data) {
                        if (endsWith(data.filename, '.unknown')) {
                            data.mimeType = 'image/unknown';
                        }
                        if (commands && commands.length) {
                            data.commands ||= commands;
                        }
                        data.cloudStorage = saveAsImage.cloudStorage;
                        if (!pathname) {
                            delete data.uri;
                        }
                    }
                }
            }
            else if (content && mimeType) {
                const data = {
                    pathname: DIR_FUNCTIONS.GENERATED + `/${mimeType.split('/').pop()!}`,
                    filename: assignFilename(filename),
                    content,
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
                    const data = File.parseUri(url, preserveCrossOrigin);
                    if (this.processExtensions(data)) {
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public finalizeRequestBody(data: RequestData, options: FileActionOptions) {
        data.database = options.database;
        data.baseUrl = options.baseUrl;
        data.unusedStyles = options.unusedStyles;
        data.templateMap = options.templateMap;
        if (data.document) {
            for (const name of data.document) {
                const attr = name + 'Id';
                document.querySelectorAll(`[data-${name}-id]`).forEach((element: HTMLElement) => delete element.dataset[attr]);
            }
        }
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return this.getArchiveQueryParameters(options) + (options.watch ? '&watch=1' : '');
    }

    public getArchiveQueryParameters(options: FileArchivingOptions) {
        return options.productionRelease ? '&release=1' : '';
    }

    protected getRawAssets(tagName: ResourceAssetTagName, options?: FileActionOptions) {
        let assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ assetMap, preserveCrossOrigin } = options);
            saveAsImage = options.saveAs?.image;
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll(tagName).forEach(element => {
            const items = new Map<HTMLElement, string>();
            let mimeType = '';
            switch (element.tagName) {
                case 'VIDEO':
                case 'AUDIO':
                    element.querySelectorAll('source, track').forEach((source: HTMLSourceElement | HTMLTrackElement) => resolveAssetSource(source, items));
                    break;
                case 'OBJECT':
                case 'EMBED':
                    mimeType = (element as HTMLObjectElement | HTMLEmbedElement).type;
                case 'IFRAME': {
                    const iframe = element.tagName === 'IFRAME';
                    const file = element.dataset.chromeFile;
                    if (!iframe || startsWith(file, 'saveTo')) {
                        const src = element instanceof HTMLObjectElement ? element.data : element.src;
                        if (startsWith(mimeType, 'image/') || startsWith(parseMimeType(src), 'image/')) {
                            this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType);
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
                    filename: Undef<string>,
                    compress: Undef<CompressFormat[]>,
                    tasks: Undef<TaskAction[]>,
                    watch: Undef<boolean | WatchInterval>,
                    attributes: Undef<AttributeMap>,
                    cloudStorage: Undef<CloudStorage[]>,
                    documentData: Undef<StringOfArray>,
                    fromConfig: Undef<boolean>;
                if (file === 'ignore') {
                    continue;
                }
                if (assetMap && assetMap.has(item)) {
                    const command = assetMap.get(item)!;
                    ({ saveTo: saveAs, filename, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                    if (excludeAsset(result, command, item, documentData || this.userSettings.outputDocumentHandler)) {
                        continue;
                    }
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || command.pathname, filename || getFilename(uri));
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else {
                    const command = parseFileAs('saveAs', file);
                    if (command) {
                        saveAs = command.file;
                    }
                    const { chromeOptions, chromeTasks, chromeWatch } = item.dataset;
                    ({ compress } = parseOptions(chromeOptions));
                    tasks = parseTask(chromeTasks);
                    watch = parseWatchInterval(chromeWatch);
                }
                const data = File.parseUri(uri, preserveCrossOrigin, { saveAs, saveTo, fromConfig });
                if (this.processExtensions(data)) {
                    setOutputModifiers(data, documentData, compress, tasks, cloudStorage, attributes, item);
                    if (filename) {
                        data.filename = filename;
                    }
                    if (watch) {
                        data.watch = watch;
                    }
                    result.push(data);
                }
            }
        });
        return result;
    }

    private processAssets(options: FileActionOptions) {
        const { appendMap, preserveCrossOrigin } = options;
        const indexMap = options.indexMap ||= new Map<ElementIndex, HTMLElement>();
        const domAll = document.querySelectorAll('*');
        const cache: SelectorCache = {};
        const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            for (let i = 0, length = assets.length; i < length; ++i) {
                const item = assets[i];
                switch (item.mimeType) {
                    case 'text/html':
                    case 'text/css':
                        item.mimeType = '@' + item.mimeType;
                        break;
                }
            }
        }
        const [scriptAssets, templateMap] = this.getScriptAssets(options);
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
        if (appendMap) {
            const tagCount: ObjectMap<number> = {};
            const getAppendData = (tagName: string, order: number, textContent?: string): TagAppend => {
                if (!(tagName in tagCount)) {
                    tagCount[tagName] = document.querySelectorAll(tagName).length;
                }
                return { tagName, tagCount: tagCount[tagName], textContent, order };
            };
            for (const [element, siblings] of appendMap) {
                const index = File.getElementIndex(element, domAll, cache);
                const command = options.assetMap?.get(element);
                const documentData = command && command.document || this.userSettings.outputDocumentHandler;
                const getElementIndex = (attributes: Undef<AttributeMap>, append?: TagAppend, prepend?: TagAppend): ElementIndex => ({ ...index, attributes, prepend, append });
                File.setDocumentId(element, index, documentData);
                let i = 0;
                for (const sibling of siblings) {
                    const { type, attributes, preserve = preserveCrossOrigin } = sibling;
                    if (type) {
                        let prepend: Undef<boolean>,
                            js: Undef<boolean>,
                            url: Optional<string>;
                        switch (type) {
                            case 'prepend/js':
                                prepend = true;
                            case 'append/js':
                                if (attributes) {
                                    url = attributes.src;
                                    attributes.type ||= 'text/javascript';
                                    js = true;
                                }
                                break;
                            case 'prepend/css':
                                prepend = true;
                            case 'append/css':
                                if (attributes) {
                                    url = attributes.href;
                                    attributes.type ||= 'text/css';
                                }
                                break;
                            default: {
                                const data = getAppendData(splitPairEnd(type, '/', true, true).toLowerCase(), ++i, sibling.textContent);
                                if (type.startsWith('append/')) {
                                    assets.push({ pathname: '', filename: '', document: documentData, element: getElementIndex(attributes, data) });
                                }
                                else if (type.startsWith('prepend/')) {
                                    assets.push({ pathname: '', filename: '', document: documentData, element: getElementIndex(attributes, undefined, data) });
                                }
                                continue;
                            }
                        }
                        if (url && attributes) {
                            const data = this.createBundle(assets, element, url, attributes.type!, undefined, undefined, undefined, sibling);
                            if (data) {
                                if (preserve) {
                                    delete data.uri;
                                }
                                data.element = getElementIndex(attributes);
                                data.element[prepend ? 'prepend' : 'append'] = getAppendData(js ? 'script' : 'link', ++i);
                            }
                        }
                    }
                }
            }
        }
        if (options.assets) {
            assets.push(...options.assets);
        }
        for (const asset of assets) {
            const element = asset.element;
            if (element instanceof Element) {
                const index = File.getElementIndex(element, domAll, cache);
                asset.element = index;
                File.setDocumentId(element, index, asset.document);
                indexMap.set(index, element);
            }
        }
        for (const [index, element] of indexMap) {
            if (element.tagName === 'HTML') {
                index.innerHTML = element.innerHTML;
            }
            else {
                index.outerHTML = element.outerHTML.trim();
            }
        }
        options.assets = assets;
        options.baseUrl = location.href;
        if (templateMap) {
            options.templateMap = templateMap;
        }
        delete options.assetMap;
        delete options.indexMap;
        delete options.appendMap;
        return options;
    }

    private createBundle(assets: ChromeAsset[], element: HTMLElement, src: Undef<string>, mimeType: string, preserveCrossOrigin: Undef<boolean>, bundleIndex: Undef<BundleIndex>, assetMap: Undef<ElementAssetMap>, assetCommand: Undef<AssetCommand>, saveAsOptions?: SaveAsOptions, saveAsCondtion = true) {
        let file = !assetCommand ? element.dataset.chromeFile : '';
        if (file === 'exclude' || file === 'ignore') {
            return;
        }
        let filename: Undef<string>,
            format: Undef<string>,
            preserve: Undef<boolean>,
            inline: Undef<boolean>,
            process: Undef<string[]>,
            compress: Undef<CompressFormat[]>,
            tasks: Undef<TaskAction[]>,
            watch: Undef<boolean | WatchInterval>,
            attributes: Undef<AttributeMap>,
            cloudStorage: Undef<CloudStorage[]>,
            documentData: Undef<StringOfArray>,
            fromConfig: Undef<boolean>,
            fromSaveAs: Undef<boolean>;
        const command = assetMap && assetMap.get(element) || assetCommand;
        if (command) {
            let filenameAs: Undef<string>;
            ({ filename: filenameAs, preserve, inline, process, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
            if (excludeAsset(assets, command, element, documentData || this.userSettings.outputDocumentHandler)) {
                return;
            }
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
            fromConfig = true;
        }
        else if (saveAsCondtion && saveAsOptions) {
            ({ preserve, inline, process, compress, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsOptions);
            if (excludeAsset(assets, saveAsOptions, element, documentData || this.userSettings.outputDocumentHandler)) {
                return;
            }
            filename = saveAsOptions.filename;
            if (src) {
                if (file = filename && getCustomPath(src, saveAsOptions.pathname, filename)) {
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
        else {
            ({ preserve, inline, compress } = parseOptions(element.dataset.chromeOptions));
            tasks = parseTask(element.dataset.chromeTasks);
            watch = parseWatchInterval(element.dataset.chromeWatch);
        }
        if (process) {
            format = process.join('+');
        }
        let data: Null<ChromeAsset> = null;
        if (src) {
            data = File.parseUri(resolvePath(src), preserveCrossOrigin, { saveAs: file, mimeType, format, fromConfig });
            if (data) {
                if (assetCommand) {
                    if (inline) {
                        switch (assetCommand.type) {
                            case 'append/js':
                                data.inlineContent = 'script';
                                break;
                            case 'append/css':
                                data.inlineContent = 'style';
                                break;
                        }
                    }
                }
                else {
                    if (inline) {
                        data.inlineContent = getContentType(element);
                    }
                    if (checkBundleStart(assets, data)) {
                        data.bundleIndex = -1;
                    }
                }
            }
        }
        else if (file) {
            if (!fromConfig && !fromSaveAs) {
                const exportAs = parseFileAs('exportAs', file);
                if (exportAs) {
                    ({ file, format } = exportAs);
                }
            }
            if (data = createBundleAsset(assets, element, file, mimeType, format, this.userSettings.outputDocumentHandler, preserve, inline)) {
                data.bundleIndex = -1;
            }
        }
        if (this.processExtensions(data)) {
            setOutputModifiers(data, documentData, compress, tasks, cloudStorage, attributes, !assetCommand ? element : undefined);
            if (filename) {
                data.filename = filename;
            }
            if (preserve) {
                data.preserve = true;
            }
            if (watch) {
                data.watch = watch;
            }
            if (bundleIndex) {
                setBundleData(bundleIndex, data);
            }
            assets.push(data);
            return data;
        }
    }

    private processImageUri(assets: ChromeAsset[], element: Null<HTMLElement>, uri: string, saveAsImage: Undef<SaveAsOptions>, preserveCrossOrigin: Undef<boolean>, assetMap?: ElementAssetMap, mimeType?: Undef<string>, base64?: string, srcSet?: boolean) {
        if (uri) {
            let saveAs: Undef<string>,
                saveTo: Undef<boolean>,
                pathname: Undef<string>,
                filename: Undef<string>,
                blob: Undef<boolean>,
                inline: Undef<boolean>,
                compress: Undef<CompressFormat[]>,
                commands: Undef<string[]>,
                tasks: Undef<TaskAction[]>,
                watch: Undef<boolean | WatchInterval>,
                attributes: Undef<AttributeMap>,
                cloudStorage: Undef<CloudStorage[]>,
                documentData: Undef<StringOfArray>,
                fromConfig: Undef<boolean>;
            if (element) {
                const file = element.dataset.chromeFile;
                if (file === 'ignore') {
                    return;
                }
                if (assetMap && assetMap.has(element)) {
                    const command = assetMap.get(element)!;
                    ({ saveTo: saveAs, pathname, filename, commands, inline, blob, compress, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                    if (excludeAsset(assets, command, element, documentData || this.userSettings.outputDocumentHandler)) {
                        return;
                    }
                    [saveAs, saveTo] = checkSaveAs(uri, saveAs || pathname, filename || getFilename(uri));
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else if (saveAsImage) {
                    ({ pathname, commands, inline, blob, compress, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsImage);
                    if (excludeAsset(assets, saveAsImage, element, documentData || this.userSettings.outputDocumentHandler)) {
                        return;
                    }
                    [saveAs, saveTo] = checkSaveAs(uri, pathname, getFilename(uri));
                }
                else {
                    if (file) {
                        let fileAs = parseFileAs('saveTo', file);
                        if (fileAs) {
                            [saveAs, saveTo] = checkSaveAs(uri, fileAs.file, getFilename(uri));
                        }
                        else if (fileAs = parseFileAs('saveAs', file)) {
                            saveAs = fileAs.file;
                        }
                    }
                    const { chromeCommands, chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                    if (chromeCommands) {
                        commands = replaceMap(chromeCommands.split('::'), value => value.trim());
                    }
                    ({ inline, blob, compress } = parseOptions(chromeOptions));
                    tasks = parseTask(chromeTasks);
                    watch = parseWatchInterval(chromeWatch);
                }
            }
            else if (saveAsImage) {
                ({ pathname, commands, inline, blob, compress, tasks, cloudStorage } = saveAsImage);
                [saveAs, saveTo] = checkSaveAs(uri, pathname, getFilename(uri));
            }
            const data = File.parseUri(uri, preserveCrossOrigin, { saveAs, saveTo, mimeType, fromConfig });
            if (this.processExtensions(data)) {
                setOutputModifiers(data, documentData, compress, tasks, cloudStorage, attributes, element);
                if (filename) {
                    data.filename = filename;
                }
                if (commands && commands.length && commands[0] !== '~') {
                    data.commands = commands;
                }
                if (watch) {
                    data.watch = watch;
                }
                if (base64) {
                    if (blob) {
                        data.format = 'blob';
                        data.base64 = base64;
                        delete data.watch;
                    }
                    else {
                        return;
                    }
                }
                else if (srcSet) {
                    data.format = 'srcset';
                }
                else if (inline) {
                    data.format = 'base64';
                }
                assets.push(data);
                return data;
            }
        }
    }

    private processExtensions(data: Null<ChromeAsset>): data is ChromeAsset {
        if (data) {
            data.document = copyDocument(this.userSettings.outputDocumentHandler);
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