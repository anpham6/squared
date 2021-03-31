import DIR_FUNCTIONS = internal.chrome.DIR_FUNCTIONS

import type Application from './application';

import Resource = squared.base.Resource;

type CloudStorage = unknown;
type BundleIndex = ObjectMap<ChromeAsset[]>;

interface OptionsData {
    preserve?: boolean;
    inline?: boolean;
    blob?: boolean;
    download?: boolean;
    compress?: CompressFormat[];
}

interface FileAsData {
    file: string;
    format?: string;
}

const { DOM } = squared.base.lib.regex;

const { createElement } = squared.lib.dom;
const { convertWord, fromLastIndexOf, isPlainObject, hasValue, lastItemOf, resolvePath, splitPair, splitPairEnd, splitPairStart, splitSome, startsWith } = squared.lib.util;

const { appendSeparator, fromMimeType, parseMimeType, parseTask, parseWatchInterval, randomUUID, trimEnd } = squared.base.lib.util;

const FILENAME_MAP = new WeakMap<ChromeAsset, string>();
let BUNDLE_ID = 0;

function parseFileAs(attr: string, value: Undef<string>) {
    if (value) {
        const match = new RegExp(`^\\s*${attr}\\s*:(.+)$`).exec(value);
        if (match) {
            const [file, format] = splitPair(match[1], '::', true);
            return { file: normalizePath(file), format } as FileAsData;
        }
    }
}

function parseOptions(value: Undef<string>) {
    const result: OptionsData = {};
    if (value) {
        if (value.includes('inline')) {
            result.inline = true;
        }
        if (value.includes('preserve')) {
            result.preserve = true;
        }
        if (value.includes('blob')) {
            result.blob = true;
        }
        if (value.includes('crossorigin')) {
            result.download = false;
        }
        const pattern = /compress\[([^\]]+)\]/g;
        let match: Null<RegExpExecArray>;
        while (match = pattern.exec(value)) {
            (result.compress ||= []).push({ format: match[1].trim() });
        }
    }
    return result;
}

function getFilePath(value: string, saveTo?: boolean, ext?: string): [Undef<string>, string, string] {
    if (startsWith(value, './')) {
        value = value.substring(2);
    }
    if (!value.includes('/')) {
        return [undefined, '', value];
    }
    let moveTo: Undef<string>;
    if (value[0] === '/') {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
        value = value.substring(1);
    }
    else if (startsWith(value, '../')) {
        moveTo = DIR_FUNCTIONS.SERVERROOT;
        const pathname: StringOfArray = location.pathname.split('/');
        if (--pathname.length) {
            for (let i = 0, length = value.length; i < length; i += 3) {
                if (value.substring(i, i + 3) !== '../' || --pathname.length === 0) {
                    break;
                }
            }
        }
        value = (pathname.shift() ? pathname.join('/') + '/' : '') + value.split('../').pop();
    }
    const result = splitPair(value, '/', false, true);
    if (saveTo) {
        result[1] = assignFilename(result[1], ext);
    }
    return [moveTo, ...result];
}

function resolveAssetSource(element: HTMLVideoElement | HTMLAudioElement | HTMLObjectElement | HTMLEmbedElement | HTMLSourceElement | HTMLTrackElement | HTMLIFrameElement, data: Map<HTMLElement, string>) {
    const value = resolvePath(element instanceof HTMLObjectElement ? element.data : element.src);
    if (value) {
        data.set(element, value);
    }
}

function setBundleIndex(bundles: BundleIndex) {
    for (const uri in bundles) {
        const items = bundles[uri];
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

function createBundleAsset(assets: ChromeAsset[], element: HTMLElement, file: string, mimeType: string, format: Undef<string>, preserve: Undef<boolean>, inline: Undef<boolean>, document: Undef<StringOfArray>): Null<ChromeAsset> {
    const content = element.innerHTML;
    if (content.trim()) {
        const [moveTo, pathname, filename] = getFilePath(file);
        const data: ChromeAsset = {
            uri: location.href,
            pathname,
            filename,
            moveTo,
            content,
            mimeType,
            format,
            preserve,
            document
        };
        if (inline) {
            data.inlineContent = getContentType(element);
        }
        const previous = lastItemOf(assets);
        if (previous && hasSamePath(previous, data, true)) {
            (previous.trailingContent ||= []).push(content);
            excludeAsset(assets, { exclude: true }, element, document);
        }
        else {
            checkFilename(assets, data);
            return data;
        }
    }
    return null;
}

function setBundleData(bundles: BundleIndex, data: ChromeAsset) {
    const uri = (data.moveTo || '') + data.pathname + data.filename;
    if (uri) {
        (bundles[uri] ||= []).push(data);
    }
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

function excludeAsset(assets: ChromeAsset[], command: AssetCommand, element: HTMLElement, document?: StringOfArray) {
    if (command.exclude) {
        assets.push({ pathname: '', filename: '', exclude: true, element, document });
        return true;
    }
    return !!command.ignore;
}

function checkSaveAs(uri: Undef<string>, pathname: Undef<string>, filename: Undef<string>): [string, boolean] {
    const value = getCustomPath(uri, pathname, filename || uri && assignFilename(uri));
    if (value) {
        return [value, false];
    }
    else if (pathname && pathname !== '~') {
        return [pathname, true];
    }
    return ['', false];
}

function getCustomPath(uri: Undef<string>, pathname: Undef<string>, filename: Undef<string>) {
    if (pathname === '~') {
        pathname = '';
    }
    if (uri && !pathname) {
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
    return pathname && filename ? appendSeparator(pathname, filename) : '';
}

function setUUID(node: XmlTagNode, element: HTMLElement, name: string) {
    const id = element.dataset[name + 'Id'] ||= randomUUID();
    (node.id ||= {})[name] = id;
}

function createFile(mimeType: Undef<string>): ChromeAsset {
    return {
        pathname: '',
        filename: '',
        mimeType,
        format: 'crossorigin'
    };
}

const assignFilename = (value: string, ext?: string) => DIR_FUNCTIONS.ASSIGN + '.' + (ext || value && getFileExt(value) || 'unknown');
const isCrossOrigin = (download: Undef<boolean>, preserveCrossOrigin: Undef<boolean>) => typeof download === 'boolean' ? !download : !!preserveCrossOrigin;
const getContentType = (element: HTMLElement) => element instanceof HTMLLinkElement ? 'style' : element.tagName.toLowerCase();
const getTagNode = (node: XmlTagNode, attributes: Undef<AttributeMap>, append?: TagAppend): XmlTagNode => ({ ...node, attributes, append });
const getFilename = (value: string) => value.split('?')[0].split('/').pop()!;
const hasSamePath = (item: ChromeAsset, other: ChromeAsset, bundle?: boolean) => item.pathname === other.pathname && (item.filename === other.filename || FILENAME_MAP.get(item) === other.filename || bundle && startsWith(item.filename, DIR_FUNCTIONS.ASSIGN)) && (item.moveTo || '') === (other.moveTo || '');
const getMimeType = (element: HTMLLinkElement | HTMLStyleElement | HTMLScriptElement, src: Undef<string>, fallback = '') => element.type.trim().toLowerCase() || src && parseMimeType(src) || fallback;
const getFileExt = (value: string) => splitPairEnd(value, '.', true, true).toLowerCase();
const normalizePath = (value: string) => value.replace(/\\+/g, '/');

export default class File<T extends squared.base.Node> extends squared.base.File<T> implements chrome.base.File<T> {
    public static createTagNode(element: Element, domAll: NodeListOf<Element>, cache: SelectorCache): XmlTagNode {
        const tagName = element.tagName.toLowerCase();
        const elements = cache[tagName] ||= document.querySelectorAll(tagName);
        const tagCount = elements.length;
        let index = -1,
            tagIndex = -1;
        for (let i = 0, length = domAll.length; i < length; ++i) {
            if (domAll[i] === element) {
                index = i;
            }
        }
        for (let i = 0; i < tagCount; ++i) {
            if (elements[i] === element) {
                tagIndex = i;
                break;
            }
        }
        return { index, tagName, tagIndex, tagCount, ignoreCase: true };
    }

    public static setDocumentId(node: XmlTagNode, element: HTMLElement, document: Undef<StringOfArray>) {
        if (Array.isArray(document)) {
            for (const name of document) {
                setUUID(node, element, name);
            }
        }
        else if (document) {
            setUUID(node, element, document);
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
        mimeType ||= parseMimeType(uri);
        let value = trimEnd(uri, '/'),
            file: Undef<string>;
        const local = startsWith(value, location.origin);
        if (!local && preserveCrossOrigin) {
            return createFile(mimeType);
        }
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
                value = resolvePath(file);
            }
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
                    if (lastItemOf(pathbase) !== '/') {
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
                pathname: decodeURIComponent(pathname),
                filename: decodeURIComponent(filename),
                mimeType,
                format
            };
        }
        catch {
        }
        return null;
    }

    public copyTo(pathname: string, options: FileCopyingOptions) {
        return this.copying(pathname, this.processAssets(options));
    }

    public appendTo(target: string, options: FileArchivingOptions) {
        return this.archiving(target, this.processAssets(options));
    }

    public saveAs(filename: string, options: FileArchivingOptions) {
        if (filename) {
            options.filename = filename;
        }
        return this.archiving('', this.processAssets(options));
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
        const command = assetMap?.get(element) || saveAsHtml;
        let filename: Undef<string>,
            format: Undef<string>,
            compress: Undef<CompressFormat[]>,
            process: Undef<string[]>,
            tasks: Undef<TaskAction[]>,
            attributes: Undef<AttributeMap>,
            cloudStorage: Undef<CloudStorage[]>,
            documentData: Undef<StringOfArray>;
        if (command) {
            if (command.ignore || command.exclude) {
                return [];
            }
            ({ filename, compress, process, tasks, attributes, cloudStorage, document: documentData } = command);
        }
        else {
            const { chromeOptions, chromeTasks } = element.dataset;
            compress = parseOptions(chromeOptions).compress;
            tasks = parseTask(chromeTasks);
        }
        if (filename) {
            file = '';
        }
        if (process) {
            format = process.join('+');
        }
        const data = File.parseUri(location.href, false, { saveAs: file, format, mimeType: 'text/html' });
        if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element)) {
            if (filename) {
                data.filename = filename;
            }
            else if (!data.filename) {
                const value = getFilename(location.href);
                data.filename = /\.(?:html?|php|jsp|aspx?)$/i.exec(value) ? value : 'index.html';
            }
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
            for (const { template, type, selector } of assetMap.values()) {
                if (template && type && !selector) {
                    switch (type) {
                        case 'html':
                        case 'js':
                        case 'css': {
                            const { module, identifier } = template;
                            let value = template.value;
                            if (module && identifier && value && (value = value.trim()) && value.includes('function')) {
                                ((templateMap ||= { html: {}, js: {}, css: {} })[type][module] ||= {})[identifier] = value;
                            }
                            break;
                        }
                    }
                }
            }
        }
        document.querySelectorAll('script').forEach(element => {
            const template = element.dataset.chromeTemplate;
            if (template || element.type === 'text/template') {
                const command = assetMap?.get(element);
                let category: Undef<string>,
                    module: Undef<string>,
                    identifier: Undef<string>;
                if (command) {
                    category = command.type;
                    if (command.template) {
                        ({ module, identifier } = command.template);
                    }
                    excludeAsset(result, command, element);
                }
                else if (template) {
                    [category, module, identifier] = template.split('::').map((value, index) => (index === 0 ? value.toLowerCase() : value).trim());
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
        let resourceId: Undef<number>,
            assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsLink: Undef<SaveAsOptions>;
        if (options) {
            ({ resourceId, assetMap, preserveCrossOrigin } = options);
            saveAsLink = options.saveAs?.link;
        }
        const result: ChromeAsset[] = [];
        const bundleIndex: BundleIndex = {};
        document.querySelectorAll('link, style').forEach((element: HTMLLinkElement | HTMLStyleElement) => {
            let mimeType = 'text/css',
                href: Undef<string>;
            const checkMimeType = () => {
                const filename = fromLastIndexOf(href!, '/');
                if (filename.includes('.')) {
                    mimeType = getMimeType(element, filename);
                    return true;
                }
                return false;
            };
            if (element instanceof HTMLLinkElement) {
                href = element.href;
                if (assetMap && assetMap.get(element)) {
                    checkMimeType();
                }
                else if (href) {
                    const rel = element.rel.trim().toLowerCase();
                    if (rel !== 'stylesheet') {
                        switch (rel) {
                            case 'alternate':
                            case 'help':
                            case 'license':
                            case 'manifest':
                            case 'modulepreload':
                            case 'prefetch':
                            case 'preload':
                            case 'prerender':
                                if (!checkMimeType()) {
                                    return;
                                }
                                break;
                            default:
                                if (!rel.includes('icon') || !checkMimeType()) {
                                    return;
                                }
                                break;
                        }
                    }
                }
                else {
                    return;
                }
            }
            this.createBundle(result, element, href, mimeType, preserveCrossOrigin, bundleIndex, assetMap, undefined, saveAsLink, mimeType === 'text/css');
        });
        const rawData = this.getResourceAssets(resourceId)?.rawData;
        if (rawData) {
            for (const [uri, item] of rawData) {
                if (item.mimeType === 'text/css') {
                    let command = saveAsLink,
                        saveAs: Undef<string>,
                        filename: Undef<string>,
                        compress: Undef<CompressFormat[]>,
                        download: Undef<boolean>,
                        preserve: Undef<boolean>,
                        process: Undef<string[]>,
                        tasks: Undef<TaskAction[]>,
                        cloudStorage: Undef<CloudStorage[]>,
                        documentData: Undef<StringOfArray>;
                    if (command) {
                        if (command.customize) {
                            filename = command.customize.call(null, uri, 'text/css', command = { ...command });
                            if (command.pathname && filename) {
                                saveAs = appendSeparator(command.pathname, filename);
                            }
                        }
                        ({ compress, download, preserve, process, tasks, cloudStorage, document: documentData } = command);
                    }
                    const data = File.parseUri(resolvePath(uri), isCrossOrigin(download, preserveCrossOrigin), { saveAs, mimeType: 'text/css', format: process ? process.join('+') : '' });
                    if (this.processExtensions(data, documentData, compress, tasks, cloudStorage)) {
                        if (filename) {
                            data.filename = filename;
                        }
                        if (preserve) {
                            data.preserve = true;
                        }
                        result.push(data);
                    }
                }
            }
        }
        setBundleIndex(bundleIndex);
        return result;
    }

    public getImageAssets(options?: FileActionOptions) {
        let resourceId: Undef<number>,
            assetMap: Undef<ElementAssetMap>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsImage: Undef<SaveAsOptions>;
        if (options) {
            ({ resourceId, assetMap, preserveCrossOrigin } = options);
            saveAsImage = options.saveAs?.image;
        }
        const result: ChromeAsset[] = [];
        document.querySelectorAll('img, input[type=image], picture > source[src]').forEach((element: HTMLImageElement | HTMLSourceElement | HTMLVideoElement) => {
            let src = element instanceof HTMLVideoElement ? element.poster : element.src,
                mimeType: Undef<string>,
                base64: Undef<string>;
            const image = Resource.parseDataURI(src);
            if (image) {
                if (base64 = image.base64) {
                    mimeType = image.mimeType;
                    src = assignFilename('', mimeType && fromMimeType(mimeType));
                }
                else {
                    return;
                }
            }
            this.processImageUri(result, element, resolvePath(src), saveAsImage, preserveCrossOrigin, assetMap, mimeType, base64);
        });
        document.querySelectorAll('img[srcset], picture > source[srcset]').forEach((element: HTMLImageElement) => {
            splitSome(element.srcset, value => {
                const match = DOM.SRCSET.exec(value);
                if (match) {
                    const src = resolvePath(match[1]);
                    if (src !== resolvePath(element.src)) {
                        this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, undefined, undefined, true);
                    }
                }
            });
        });
        const assets = this.getResourceAssets(resourceId);
        if (assets) {
            for (const uri of assets.image.keys()) {
                const image = Resource.parseDataURI(uri);
                if (image) {
                    if (image.base64) {
                        this.resource.addRawData(resourceId!, uri, image);
                    }
                }
                else {
                    this.processImageUri(result, null, uri, saveAsImage, preserveCrossOrigin);
                }
            }
            if (assets.rawData) {
                for (const item of assets.rawData.values()) {
                    const { base64, content, mimeType = parseMimeType(item.filename) } = item;
                    if (base64) {
                        if (saveAsImage?.blob) {
                            let command = saveAsImage,
                                filename: Undef<string>,
                                commands: Undef<string[]>;
                            if (command.customize) {
                                filename = command.customize.call(null, '', mimeType, command = { ...command });
                            }
                            const pathname = command.pathname;
                            filename ||= item.filename;
                            if (startsWith(mimeType, 'image/') && (commands = command.commands)) {
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
                            const data = this.processImageUri(result, null, resolvePath(pathname ? appendSeparator(pathname, filename) : filename), command, false, undefined, mimeType || 'image/unknown', base64);
                            if (data) {
                                if (commands && commands.length) {
                                    data.commands = commands;
                                }
                                else {
                                    delete data.commands;
                                }
                                if (!pathname) {
                                    delete data.uri;
                                }
                            }
                        }
                    }
                    else if (content && mimeType) {
                        const data = {
                            pathname: DIR_FUNCTIONS.GENERATED + `/${mimeType.split('/').pop()!}`,
                            filename: assignFilename(item.filename),
                            content,
                            mimeType
                        };
                        if (this.processExtensions(data)) {
                            result.push(data);
                        }
                    }
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
        let resourceId: Undef<number>,
            preserveCrossOrigin: Undef<boolean>,
            saveAsFont: Undef<SaveAsOptions>;
        if (options) {
            ({ resourceId, preserveCrossOrigin } = options);
            saveAsFont = options.saveAs?.font;
        }
        const result: ChromeAsset[] = [];
        const assets = this.getResourceAssets(resourceId);
        if (assets) {
            for (const fonts of assets.fonts.values()) {
                for (const { srcUrl, srcBase64, mimeType } of fonts) {
                    let command = saveAsFont,
                        data: Null<ChromeAsset> = null,
                        pathname: Undef<string>,
                        filename: Undef<string>,
                        inline: Undef<boolean>,
                        blob: Undef<boolean>;
                    if (command) {
                        if (command.customize) {
                            filename = command.customize.call(null, srcUrl || '', mimeType, command = { ...command });
                        }
                        ({ pathname, inline, blob } = command);
                    }
                    if (srcUrl) {
                        if ((data = File.parseUri(srcUrl, inline === true ? false : preserveCrossOrigin)) && inline) {
                            data.format = 'base64';
                        }
                    }
                    else if (srcBase64 && blob) {
                        filename ||= assignFilename('', fromMimeType(mimeType));
                        if (data = File.parseUri(resolvePath(pathname ? appendSeparator(pathname, filename) : filename))) {
                            data.format = 'blob';
                            data.base64 = srcBase64;
                        }
                    }
                    if (this.processExtensions(data)) {
                        result.push(data);
                    }
                }
            }
        }
        return result;
    }

    public finalizeRequestBody(data: RequestData, options: FileCopyingOptions & FileArchivingOptions) {
        const productionRelease = options.productionRelease;
        data.baseUrl = options.baseUrl;
        data.dataSource = options.dataSource;
        data.templateMap = options.templateMap;
        data.unusedStyles = options.unusedStyles;
        data.productionRelease = productionRelease;
        let watchElement: Undef<HTMLElement>;
        if (!productionRelease && options.watch) {
            const socketMap: ObjectMap<string> = {};
            const hostname = new URL(this.hostname).hostname;
            for (const { watch } of options.assets!) {
                if (isPlainObject<WatchInterval>(watch) && watch.reload) {
                    const reload = watch.reload as WatchReload;
                    const { socketId: id, handler = {}, secure } = reload;
                    const port = reload.port ?? (secure ? this.userSettings.webSocketSecurePort : this.userSettings.webSocketPort);
                    if (hasValue<number>(port)) {
                        socketMap[id + '_' + port + (secure ? '_0' : '_1')] ||=
                        'socket=new WebSocket("' + (secure ? 'wss' : 'ws') + `://${hostname}:${port}");` +
                        (handler.open ? `socket.onopen=${handler.open};` : '') +
                        'socket.onmessage=' + (handler.message || `function(e){var c=JSON.parse(e.data);if(c&&c.socketId==="${id!}"&&c.module==="watch"&&c.action==="modified"){if(!c.errors||!c.errors.length){if(c.hot){if(c.type==="text/css"){var a=document.querySelectorAll('link[href^="'+c.src+'"]');if(a.length){a.forEach(function(b){b.href=c.src+c.hot;});return;}}else if(c.type.startsWith("image/")){var a=document.querySelectorAll('img[src^="'+c.src+'"]');if(a.length){a.forEach(function(b){b.src=c.src+c.hot;});return;}}}window.location.reload();}else{console.log("FAIL: "+c.errors.length+" errors\\n\\n"+c.errors.join("\\n"));}}}`) + ';' +
                        (handler.error ? `socket.onerror=${handler.error};` : '') +
                        (handler.close ? `socket.onclose=${handler.close};` : '');
                    }
                    delete reload.handler;
                }
            }
            if (Object.keys(socketMap).length) {
                let textContent = 'document.addEventListener("DOMContentLoaded", function(){var socket;';
                for (const id in socketMap) {
                    textContent += socketMap[id];
                }
                textContent += '});';
                if (!options.useOriginalHtmlPage) {
                    watchElement = createElement('script', { parent: document.body, attributes: { textContent } });
                }
                else {
                    const html = (options.assets as ChromeAsset[]).find(item => item.mimeType === '@text/html');
                    if (html) {
                        html.element!.textContent = `<script>${textContent}</script>`;
                    }
                }
            }
        }
        if (!options.useOriginalHtmlPage) {
            for (const item of options.assets as ChromeAsset[]) {
                const element = item.element as Undef<XmlTagNode>;
                if (element) {
                    switch (element.tagName) {
                        case 'html':
                            element.innerXml = document.documentElement.innerHTML;
                            break;
                        case 'script':
                            if (watchElement) {
                                ++element.tagCount!;
                            }
                            break;
                    }
                    if (watchElement) {
                        const append = element.append;
                        if (append?.tagName === 'script') {
                            ++append.tagCount!;
                        }
                    }
                }
                if (productionRelease && item.watch) {
                    delete item.watch;
                }
            }
            if (watchElement) {
                document.body.removeChild(watchElement);
            }
            if (data.document) {
                for (const name of data.document) {
                    const attr = name + 'Id';
                    document.querySelectorAll(`[data-${name}-id]`).forEach((element: HTMLElement) => delete element.dataset[attr]);
                }
            }
            if (options.removeInlineStyles) {
                document.querySelectorAll(`[style]`).forEach(element => element.removeAttribute('style'));
            }
        }
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return options.watch && !options.productionRelease ? '&watch=1' : '';
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
            switch (element.tagName.toUpperCase()) {
                case 'VIDEO':
                case 'AUDIO':
                    element.querySelectorAll('source, track').forEach((source: HTMLSourceElement | HTMLTrackElement) => resolveAssetSource(source, items));
                    break;
                case 'IFRAME':
                    if (!assetMap?.get(element) && !startsWith(element.dataset.chromeFile, 'saveTo')) {
                        return;
                    }
                case 'OBJECT':
                case 'EMBED': {
                    const src = element instanceof HTMLObjectElement ? element.data : element.src;
                    mimeType = (element as HTMLObjectElement | HTMLEmbedElement).type || parseMimeType(src);
                    if (startsWith(mimeType, 'image/')) {
                        this.processImageUri(result, element, src, saveAsImage, preserveCrossOrigin, assetMap, mimeType);
                        return;
                    }
                    break;
                }
            }
            resolveAssetSource(element, items);
            for (const [item, uri] of items) {
                const file = item.dataset.chromeFile;
                if (file === 'ignore') {
                    continue;
                }
                const command = assetMap?.get(item);
                let saveAs: Undef<string>,
                    saveTo: Undef<boolean>,
                    filename: Undef<string>,
                    compress: Undef<CompressFormat[]>,
                    download: Undef<boolean>,
                    tasks: Undef<TaskAction[]>,
                    watch: Undef<WatchValue>,
                    attributes: Undef<AttributeMap>,
                    cloudStorage: Undef<CloudStorage[]>,
                    documentData: Undef<StringOfArray>,
                    fromConfig: Undef<boolean>;
                if (command) {
                    ({ filename, compress, download, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                    if (excludeAsset(result, command, item, documentData)) {
                        continue;
                    }
                    [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || command.pathname, filename || getFilename(uri));
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else {
                    const fileAs = parseFileAs('saveAs', file);
                    if (fileAs) {
                        saveAs = fileAs.file;
                    }
                    const { chromeOptions, chromeTasks, chromeWatch } = item.dataset;
                    ({ compress, download } = parseOptions(chromeOptions));
                    tasks = parseTask(chromeTasks);
                    watch = parseWatchInterval(chromeWatch);
                }
                const data = File.parseUri(uri, isCrossOrigin(download, preserveCrossOrigin), { saveAs, saveTo, fromConfig });
                if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, item, watch)) {
                    if (filename) {
                        data.filename = filename;
                    }
                    result.push(data);
                }
            }
        });
        return result;
    }

    private processAssets(options: FileActionOptions) {
        const { assetMap, appendMap, nodeMap = new Map<XmlNode, HTMLElement>(), useOriginalHtmlPage, preserveCrossOrigin } = options;
        const domAll = document.querySelectorAll('*');
        const cache: SelectorCache = {};
        const assets = this.getHtmlPage(options).concat(this.getLinkAssets(options));
        if (options.saveAsWebPage) {
            for (const item of assets) {
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
            const getAppendData = (tagName: string, order: number, textContent?: string, prepend?: boolean): TagAppend => {
                if (!(tagName in tagCount)) {
                    tagCount[tagName] = document.querySelectorAll(tagName).length;
                }
                return { tagName, tagCount: tagCount[tagName], textContent, order, prepend };
            };
            for (const [element, siblings] of appendMap) {
                const node = File.createTagNode(element, domAll, cache);
                const command = assetMap?.get(element);
                const documentData = command?.document;
                const getNextSibling = () => node.index + element.querySelectorAll('*').length + 1;
                if (!useOriginalHtmlPage) {
                    File.setDocumentId(node, element, documentData);
                }
                node.outerXml = element.outerHTML.trim();
                let i = 0;
                for (const sibling of siblings) {
                    const { type, attributes, download, textContent } = sibling;
                    if (type) {
                        let js: Undef<boolean>,
                            url: Optional<string>,
                            prepend: Undef<boolean>;
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
                                let elementData: Undef<XmlTagNode>;
                                if (type === 'replace') {
                                    if (textContent) {
                                        elementData = getTagNode(node, attributes);
                                        elementData.textContent = textContent;
                                    }
                                }
                                else {
                                    const append = getAppendData(splitPairEnd(type, '/', true, true).toLowerCase(), ++i, textContent);
                                    if (type.startsWith('append/')) {
                                        append.nextSibling = getNextSibling();
                                        elementData = getTagNode(node, attributes, append);
                                    }
                                    else if (type.startsWith('prepend/')) {
                                        append.prepend = true;
                                        elementData = getTagNode(node, attributes, append);
                                    }
                                }
                                if (elementData) {
                                    assets.push({ pathname: '', filename: '', document: documentData, element: elementData });
                                }
                                continue;
                            }
                        }
                        if (url && attributes) {
                            sibling.document ||= documentData;
                            delete sibling.download;
                            const data = this.createBundle(assets, element, url, attributes.type!, undefined, undefined, undefined, sibling);
                            if (data) {
                                if (isCrossOrigin(download, preserveCrossOrigin)) {
                                    delete data.uri;
                                }
                                const append = getAppendData(js ? 'script' : 'link', ++i, undefined, prepend);
                                if (!prepend) {
                                    append.nextSibling = getNextSibling();
                                }
                                data.element = getTagNode(node, attributes, append);
                            }
                        }
                    }
                }
            }
        }
        const documentHandler = this.userSettings.outputDocumentHandler;
        for (const item of assets) {
            const element = item.element;
            if (element instanceof Element) {
                const node = File.createTagNode(element, domAll, cache);
                if (!useOriginalHtmlPage) {
                    File.setDocumentId(node, element, item.document);
                }
                item.element = node;
                nodeMap.set(node, element);
            }
            item.document ||= File.copyDocument(documentHandler);
        }
        for (const [node, element] of nodeMap) {
            if (element !== document.documentElement) {
                node.outerXml = element.outerHTML.trim();
            }
        }
        if (options.assets) {
            assets.push(...options.assets);
        }
        options.assets = assets;
        options.baseUrl = location.href;
        if (templateMap) {
            options.templateMap = templateMap;
        }
        delete options.assetMap;
        delete options.indexMap;
        delete options.nodeMap;
        delete options.appendMap;
        return options;
    }

    private createBundle(assets: ChromeAsset[], element: HTMLElement, src: Undef<string>, mimeType: string, preserveCrossOrigin: Undef<boolean>, bundleIndex: Undef<BundleIndex>, assetMap: Undef<ElementAssetMap>, assetCommand: Undef<AssetCommand>, saveAsOptions?: SaveAsOptions, saveAsCondtion = true) {
        let file = !assetCommand ? element.dataset.chromeFile : '';
        if (file === 'exclude' || file === 'ignore') {
            return;
        }
        const command = assetMap?.get(element) || assetCommand;
        let filename: Undef<string>,
            format: Undef<string>,
            inline: Undef<boolean>,
            process: Undef<string[]>,
            compress: Undef<CompressFormat[]>,
            download: Undef<boolean>,
            preserve: Undef<boolean>,
            tasks: Undef<TaskAction[]>,
            watch: Undef<WatchValue>,
            attributes: Undef<AttributeMap>,
            cloudStorage: Undef<CloudStorage[]>,
            documentData: Undef<StringOfArray>,
            fromConfig: Undef<boolean>,
            fromSaveAs: Undef<boolean>;
        if (command) {
            ({ inline, compress, download, preserve, process, tasks, watch, attributes, cloudStorage, document: documentData } = command);
            if (excludeAsset(assets, command, element, documentData)) {
                return;
            }
            file = src ? command.saveAs : command.exportAs;
            if (!file && command.filename && (!command.pathname || !(file = checkSaveAs(src, command.pathname, command.filename)[0]))) {
                filename = command.filename;
            }
            fromConfig = true;
        }
        else {
            if (saveAsCondtion && saveAsOptions) {
                if (saveAsOptions.customize) {
                    filename = saveAsOptions.customize.call(null, src || '', mimeType, saveAsOptions = { ...saveAsOptions });
                }
                ({ preserve, inline, compress, download, process, tasks, watch, attributes, cloudStorage, document: documentData } = saveAsOptions);
                if (excludeAsset(assets, saveAsOptions, element, documentData)) {
                    return;
                }
                if (filename ||= saveAsOptions.filename) {
                    if (src) {
                        if (file = getCustomPath(src, saveAsOptions.pathname, filename)) {
                            filename = '';
                        }
                    }
                    else {
                        file = './' + filename;
                        filename = '';
                        fromSaveAs = true;
                    }
                }
            }
            const { chromeOptions, chromeTasks, chromeWatch } = element.dataset;
            const options = parseOptions(chromeOptions);
            inline ??= options.inline;
            preserve ??= options.preserve;
            compress ||= options.compress;
            download ??= options.download;
            tasks ||= parseTask(chromeTasks);
            watch ||= parseWatchInterval(chromeWatch);
        }
        if (process) {
            format = process.join('+');
        }
        let data: Null<ChromeAsset> = null;
        if (src) {
            if ((data = File.parseUri(resolvePath(src), isCrossOrigin(download, preserveCrossOrigin), { saveAs: file, mimeType, format, fromConfig })) && data.format !== 'crossorigin') {
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
            if (data = createBundleAsset(assets, element, file, mimeType, format, preserve, inline, documentData)) {
                data.bundleIndex = -1;
            }
        }
        else if (!(element instanceof HTMLScriptElement)) {
            data = createFile(mimeType);
        }
        if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, !assetCommand ? element : undefined, watch)) {
            if (filename) {
                data.filename = filename;
            }
            if (preserve) {
                data.preserve = true;
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
            let command: Undef<AssetCommand>,
                saveAs: Undef<string>,
                saveTo: Undef<boolean>,
                pathname: Undef<string>,
                filename: Undef<string>,
                commands: Undef<string[]>,
                inline: Undef<boolean>,
                compress: Undef<CompressFormat[]>,
                download: Undef<boolean>,
                blob: Undef<boolean>,
                tasks: Undef<TaskAction[]>,
                watch: Undef<WatchValue>,
                attributes: Undef<AttributeMap>,
                cloudStorage: Undef<CloudStorage[]>,
                documentData: Undef<StringOfArray>,
                fromConfig: Undef<boolean>;
            const setFilename = (options: SaveAsOptions) => {
                if (options.customize) {
                    filename = options.customize.call(null, uri, mimeType || '', command = { ...options });
                }
            };
            if (element) {
                const file = element.dataset.chromeFile;
                if (file === 'ignore') {
                    return;
                }
                if (command = assetMap?.get(element)) {
                    ({ pathname, filename, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                    if (excludeAsset(assets, command, element, documentData)) {
                        return;
                    }
                    [saveAs, saveTo] = checkSaveAs(uri, command.saveTo || pathname, filename || getFilename(uri));
                    if (saveAs) {
                        filename = '';
                    }
                    fromConfig = true;
                }
                else {
                    if (saveAsImage) {
                        setFilename(command = saveAsImage);
                        ({ pathname, inline, compress, download, blob, commands, tasks, watch, attributes, cloudStorage, document: documentData } = command);
                        if (excludeAsset(assets, saveAsImage, element, documentData)) {
                            return;
                        }
                        [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getFilename(uri));
                    }
                    if (file && !pathname) {
                        let fileAs = parseFileAs('saveTo', file);
                        if (fileAs) {
                            [saveAs, saveTo] = checkSaveAs(uri, fileAs.file, filename || getFilename(uri));
                        }
                        else if (fileAs = parseFileAs('saveAs', file)) {
                            saveAs = fileAs.file;
                        }
                    }
                    const { chromeCommands, chromeOptions, chromeTasks, chromeWatch } = element.dataset;
                    if (chromeCommands) {
                        commands ||= chromeCommands.split('::').map(value => value.trim());
                    }
                    const options = parseOptions(chromeOptions);
                    inline ??= options.inline;
                    compress ||= options.compress;
                    download ??= options.download;
                    blob ??= options.blob;
                    tasks ||= parseTask(chromeTasks);
                    watch ||= parseWatchInterval(chromeWatch);
                }
            }
            else if (saveAsImage) {
                setFilename(command = saveAsImage);
                ({ pathname, inline, compress, download, blob, commands, tasks, cloudStorage } = command);
                [saveAs, saveTo] = checkSaveAs(uri, pathname, filename || getFilename(uri));
            }
            if (base64 && !blob) {
                return;
            }
            if (commands && (commands.length === 0 || commands[0] === '~')) {
                commands = undefined;
            }
            const data = File.parseUri(uri, isCrossOrigin(download, preserveCrossOrigin), { saveAs, saveTo, mimeType, fromConfig });
            if (this.processExtensions(data, documentData, compress, tasks, cloudStorage, attributes, element, watch, !!commands)) {
                if (filename) {
                    data.filename = filename;
                }
                if (base64) {
                    if (!fromConfig && assets.find(item => item.base64 === base64)) {
                        return;
                    }
                    data.format = 'blob';
                    data.base64 = base64;
                }
                else if (srcSet) {
                    data.format = 'srcset';
                }
                else if (inline) {
                    data.format = 'base64';
                }
                else if (!element && assets.find(item => item.moveTo === data.moveTo && item.pathname === data.pathname && item.filename === data.filename && !data.filename.includes(DIR_FUNCTIONS.ASSIGN))) {
                    return;
                }
                if (commands) {
                    data.commands = commands;
                }
                assets.push(data);
                return data;
            }
        }
    }

    private getResourceAssets(resourceId: Undef<number>) {
        if (resourceId !== undefined && resourceId !== -1) {
            return Resource.ASSETS[resourceId];
        }
    }

    private processExtensions(data: Null<ChromeAsset>, document?: StringOfArray, compress?: CompressFormat[], tasks?: TaskAction[], cloudStorage?: CloudStorage[], attributes?: AttributeMap, element?: Null<HTMLElement>, watch?: WatchValue, modified?: Undef<boolean>): data is ChromeAsset {
        if (data) {
            if (compress) {
                data.compress = compress;
                modified = true;
            }
            if (tasks) {
                data.tasks = tasks;
                modified = true;
            }
            if (attributes) {
                data.attributes = attributes;
                modified = true;
            }
            if (cloudStorage) {
                data.cloudStorage = cloudStorage;
                modified = true;
            }
            if (watch) {
                data.watch = watch;
                modified = true;
            }
            if (element) {
                data.element = element;
            }
            if (document) {
                data.document = document;
            }
            for (const ext of this.application.extensions) {
                if (!ext.processFile(data)) {
                    return false;
                }
            }
            return modified || data.format !== 'crossorigin';
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