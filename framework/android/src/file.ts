import { BUILD_VERSION, XML_NAMESPACE } from './lib/constant';

import COLOR_TMPL from './template/resources/color';
import DIMEN_TMPL from './template/resources/dimen';
import FONTFAMILY_TMPL from './template/font-family';
import STRING_TMPL from './template/resources/string';
import STRINGARRAY_TMPL from './template/resources/string-array';
import STYLE_TMPL from './template/resources/style';

import type View from './view';

import Resource from './resource';

import { applyTemplate, replaceTab } from './lib/util';

type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;

interface ItemData {
    name: string;
    parent: string;
    item: ItemValue[];
}

interface ItemValue {
    name: string;
    innerText: string;
}

interface ArrayValue {
    name: string;
    translatable?: string;
    item: { innerText: string }[];
}

interface FontValue {
    font: string;
    fontStyle: string;
    fontWeight: string;
}

const { convertBase64, convertWord, endsWith, isPlainObject, lastItemOf, replaceAll, splitPair, splitPairStart, splitSome, resolvePath } = squared.lib.util;

const { fromMimeType, getComponentEnd, parseMimeType } = squared.base.lib.util;

function getFileAssets(pathname: string, items: string[], document: StringOfArray) {
    const length = items.length;
    const result: FileAsset[] = new Array(length / 3);
    for (let i = 0, j = 0; i < length; i += 3) {
        result[j++] = {
            pathname: pathname + items[i + 1],
            filename: items[i + 2],
            content: items[i],
            document: File.copyDocument(document)
        };
    }
    return result;
}

function getImageAssets(this: Resource<View>, resourceId: number, pathname: string, items: string[], convertImages: string, compressing: boolean, document: StringOfArray) {
    const compress = compressing ? [{ format: 'png' }] : undefined;
    const length = items.length;
    const result: FileAsset[] = new Array(length / 3);
    for (let i = 0, j = 0; i < length; i += 3) {
        const uri = items[i];
        const filename = items[i + 2];
        let mimeType: Undef<string>,
            commands: Undef<string[]>;
        if (endsWith(filename, '.unknown')) {
            mimeType = 'image/unknown';
        }
        else if (convertImages) {
            switch (mimeType = parseMimeType(filename)) {
                case 'image/png':
                case 'image/jpeg':
                case 'image/webp':
                case 'image/gif':
                case 'image/bmp':
                case 'image/tiff':
                case 'image/unknown':
                    splitSome(convertImages.toLowerCase(), value => {
                        if (/^(?:png|jpeg|webp|bmp)/i.test(value)) {
                            (commands ||= []).push(value);
                        }
                    }, '::');
                    break;
            }
        }
        const image = this.getImage(resourceId, uri);
        result[j++] = {
            pathname: pathname + items[i + 1],
            filename,
            mimeType,
            commands,
            compress,
            uri,
            document: File.copyDocument(document),
            tasks: image && image.tasks
        };
    }
    return result;
}

function getRawAssets(this: Resource<View>, resourceId: number, name: ResourceRawAsset, pathname: string, items: string[], document: StringOfArray) {
    const length = items.length;
    const result: FileAsset[] = new Array(length / 3);
    for (let i = 0, j = 0; i < length; i += 3) {
        const uri = items[i];
        const rawData = name === 'video' ? this.getVideo(resourceId, uri) : this.getAudio(resourceId, uri);
        result[j++] = {
            pathname,
            filename: items[i + 1].toLowerCase(),
            mimeType: items[i + 2],
            uri,
            document: File.copyDocument(document),
            tasks: rawData && rawData.tasks
        };
    }
    return result;
}

function checkLayoutFiles(assets: FileAsset[], mainFileName: string, document?: StringOfArray) {
    for (let i = 0, length = assets.length, found: Undef<boolean>; i < length; ++i) {
        const item = assets[i];
        if (item.content && !item.uri) {
            if (!endsWith(item.filename, '.xml')) {
                if (!found) {
                    item.filename = mainFileName;
                    found = true;
                }
                else {
                    item.filename += '.xml';
                }
            }
            else if (item.filename === mainFileName) {
                found = true;
            }
            if (document) {
                item.document ||= document;
            }
        }
    }
}

const hasFileAction = (options: Undef<FileUniversalOptions>): options is FileUniversalOptions => !!(options && (options.directory || options.filename));
const getOutputDirectory = (value: string) => (value = replaceAll(value, '\\', '/')) + (lastItemOf(value) !== '/' ? '/' : '');

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public resource!: Resource<T>;

    public async copyTo(pathname: string, options: FileCopyingOptions) {
        return this.copying(pathname, { ...options, assets: await this.processAssets(options.assets!, options) });
    }

    public async appendTo(pathname: string, options: FileArchivingOptions) {
        return this.archiving(pathname, { ...options, assets: await this.processAssets(options.assets!, options) });
    }

    public async saveAs(filename: string, options: FileArchivingOptions) {
        return this.archiving('', { ...options, assets: await this.processAssets(options.assets!, options), filename });
    }

    public resourceAllToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions) {
        if (stored) {
            const assets = Resource.ASSETS[this.resourceId];
            const result: ObjectMap<string[]> = {
                string: this.resourceStringToXml(stored),
                stringArray: this.resourceStringArrayToXml(stored),
                font: this.resourceFontToXml(stored),
                color: this.resourceColorToXml(stored),
                style: this.resourceStyleToXml(stored),
                dimen: this.resourceDimenToXml(stored),
                drawable: this.resourceDrawableToXml(stored),
                anim: this.resourceAnimToXml(stored),
                drawableImage: this.resourceDrawableImageToString(stored),
                rawVideo: this.resourceRawVideoToString(assets),
                rawAudio: this.resourceRawAudioToString(assets)
            };
            for (const name in result) {
                if (result[name]!.length === 0) {
                    delete result[name];
                }
            }
            if (hasFileAction(options)) {
                const { resource, resourceId, userSettings } = this;
                const { convertImages, compressImages, outputDocumentHandler } = userSettings;
                const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
                const rawAssets: FileAsset[] = [];
                for (const name in result) {
                    switch (name) {
                        case 'drawableImage':
                            rawAssets.push(...getImageAssets.call(resource, resourceId, outputDirectory, result[name], convertImages, compressImages, outputDocumentHandler));
                            break;
                        case 'rawVideo':
                            rawAssets.push(...getRawAssets.call(resource, resourceId, 'video', outputDirectory + this.directory.video, result[name], outputDocumentHandler));
                            break;
                        case 'rawAudio':
                            rawAssets.push(...getRawAssets.call(resource, resourceId, 'audio', outputDirectory + this.directory.audio, result[name], outputDocumentHandler));
                            break;
                        default:
                            rawAssets.push(...getFileAssets(outputDirectory, result[name]!, outputDocumentHandler));
                            break;
                    }
                }
                if (options.assets) {
                    rawAssets.push(...options.assets);
                }
                options.assets = rawAssets;
                if (options.pathname) {
                    this.copying(options.pathname, options);
                }
                if (options.filename) {
                    this.archiving('', options);
                }
            }
            return result;
        }
        return {};
    }

    public resourceStringToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        if (!stored) {
            return [];
        }
        const items = Array.from(stored.strings).sort((a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1);
        const length = items.length;
        let j: number,
            itemArray: ItemValue[];
        if (stored.strings.has('app_name')) {
            j = 0;
            itemArray = new Array(length);
        }
        else {
            j = 1;
            itemArray = new Array(length + 1);
            itemArray[0] = { name: 'app_name', innerText: this.userSettings.manifestLabelAppName };
        }
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            itemArray[j++] = { name: item[0], innerText: item[1] };
        }
        return this.checkFileAssets([replaceTab(applyTemplate('resources', STRING_TMPL, [{ string: itemArray }]), this.userSettings.insertSpaces), this.directory.string, 'strings.xml'], options);
    }

    public resourceStringArrayToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.arrays.size)) {
            return [];
        }
        const items = Array.from(stored.arrays).sort();
        const array: ArrayValue[] = [];
        const stringArray: ArrayValue[] = [];
        for (let i = 0; i < length; ++i) {
            const [key, value] = items[i];
            const item = value.map(innerText => ({ innerText }));
            const [name, type, translatable] = key.split(':');
            const data: ArrayValue = { name, item };
            if (translatable === '0') {
                data.translatable = 'false';
            }
            (type === '0' ? array : stringArray).push(data);
        }
        return this.checkFileAssets([replaceTab(applyTemplate('resources', STRINGARRAY_TMPL, [{ 'array': array, 'string-array': stringArray }]), this.userSettings.insertSpaces), this.directory.string, 'string_arrays.xml'], options);
    }

    public resourceFontToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.fonts.size)) {
            return [];
        }
        const { resource, resourceId } = this;
        const { insertSpaces, outputDirectory, targetAPI } = this.userSettings;
        const xmlns = XML_NAMESPACE[targetAPI < BUILD_VERSION.OREO ? 'app' : 'android'];
        const directory = getOutputDirectory(outputDirectory);
        const pathname = this.directory.font;
        const items = Array.from(stored.fonts).sort();
        const result: string[] = [];
        for (let i = 0; i < length; ++i) {
            const [filename, font] = items[i];
            const itemArray: FontValue[] = [];
            for (const attr in font) {
                if (attr.indexOf(';') === -1) {
                    const fontProvider = resource.fontProvider[attr]!;
                    result.push(
                        replaceTab(
                            applyTemplate('font-family', FONTFAMILY_TMPL, [{
                                'xmlns:app': XML_NAMESPACE.app,
                                'app:fontProviderAuthority': fontProvider.authority,
                                'app:fontProviderPackage': fontProvider.package,
                                'app:fontProviderQuery': font[attr],
                                'app:fontProviderCerts': `@array/${convertWord(fontProvider.authority.toLowerCase())}_certs`
                            }]),
                            insertSpaces
                        ),
                        pathname,
                        filename + '.xml'
                    );
                }
                else {
                    const [fontFamily, fontStyle, fontWeight] = attr.split(';');
                    const fontName = filename + (fontStyle === 'normal' ? fontWeight === '400' ? '_normal' : '_' + font[attr] : '_' + fontStyle + (fontWeight !== '400' ? font[attr] : ''));
                    itemArray.push({ font: `@font/${fontName}`, fontStyle, fontWeight });
                    if (options?.updateXmlOnly) {
                        continue;
                    }
                    const fonts = resource.getFonts(resourceId, fontFamily, fontStyle, fontWeight);
                    if (fonts.length) {
                        let uri: Undef<string>,
                            base64: Undef<string>,
                            ext: Undef<string>,
                            data = fonts.find(item => item.srcUrl);
                        if (data && (uri = data.srcUrl)) {
                            const rawData = resource.getRawData(resourceId, uri);
                            if (rawData) {
                                base64 = rawData.base64;
                                if (!base64 && rawData.buffer) {
                                    base64 = convertBase64(rawData.buffer);
                                    rawData.base64 = base64;
                                }
                                if (rawData.mimeType) {
                                    ext = fromMimeType(rawData.mimeType);
                                }
                            }
                            ext ||= fromMimeType(data.mimeType) || Resource.getExtension(splitPairStart(uri, '?')).toLowerCase();
                        }
                        else if (data = fonts.find(item => item.srcBase64)) {
                            base64 = data.srcBase64;
                            ext = fromMimeType(data.mimeType);
                        }
                        else {
                            continue;
                        }
                        resource.addAsset(resourceId, {
                            pathname: directory + pathname,
                            filename: fontName + '.' + (ext || 'ttf'),
                            uri: !base64 ? uri : undefined,
                            base64
                        });
                    }
                }
            }
            if (itemArray.length) {
                const output = replaceTab(applyTemplate('font-family', FONTFAMILY_TMPL, [{ 'xmlns:android': xmlns, font: itemArray }]), insertSpaces);
                result.push(
                    targetAPI < BUILD_VERSION.OREO ? output.replace(/\s+android:/g, ' app:') : output,
                    pathname,
                    filename + '.xml'
                );
            }
        }
        return this.checkFileAssets(result, options);
    }

    public resourceColorToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.colors.size)) {
            return [];
        }
        const items = Array.from(stored.colors).sort();
        const itemArray: ItemValue[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            itemArray[i] = { name: item[1], innerText: item[0] };
        }
        return this.checkFileAssets([replaceTab(applyTemplate('resources', COLOR_TMPL, [{ color: itemArray }]), this.userSettings.insertSpaces), this.directory.string, 'colors.xml'], options);
    }

    public resourceStyleToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        if (!stored) {
            return [];
        }
        const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
        const result: string[] = [];
        if (stored.styles.size) {
            const itemArray: ItemData[] = [];
            for (const style of Array.from(stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                itemArray.push({
                    name: style.name,
                    parent: style.parent,
                    item: style.items.sort((a, b) => a.key >= b.key ? 1 : -1).map(obj => ({ name: obj.key, innerText: obj.value }))
                });
            }
            const value = applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]);
            result.push(replaceTab(convertPixels ? replaceAll(value, 'px<', convertPixels + '<') : value, this.userSettings.insertSpaces), this.directory.string, 'styles.xml');
        }
        if (stored.themes.size) {
            const appTheme: string[] = [];
            for (const [filename, themes] of stored.themes) {
                const itemArray: ItemData[] = [];
                for (const [themeName, themeData] of themes) {
                    if (!appTheme.includes(filename) || themeName !== manifestThemeName) {
                        const themeArray: ItemValue[] = [];
                        const items = themeData.items;
                        for (const name in items) {
                            themeArray.push({ name, innerText: items[name]! });
                        }
                        itemArray.push({ name: themeName, parent: themeData.parent, item: themeArray });
                    }
                    if (themeName === manifestThemeName) {
                        appTheme.push(filename);
                    }
                }
                if (itemArray.length) {
                    const value = applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]);
                    result.push(replaceTab(convertPixels ? replaceAll(value, 'px<', convertPixels + '<') : value, insertSpaces), ...splitPair(filename, '/', false, true));
                }
            }
        }
        return this.checkFileAssets(result, options);
    }

    public resourceDimenToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.dimens.size)) {
            return [];
        }
        const userSettings = this.userSettings;
        const convertPixels = userSettings.convertPixels;
        const items = Array.from(stored.dimens).sort();
        const itemArray: ItemValue[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            itemArray[i] = { name: item[0], innerText: item[1] };
        }
        const value = applyTemplate('resources', DIMEN_TMPL, [{ dimen: itemArray }]);
        return this.checkFileAssets([replaceTab(convertPixels ? replaceAll(value, 'px', convertPixels) : value, userSettings.insertSpaces), this.directory.string, 'dimens.xml'], options);
    }

    public resourceDrawableToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.drawables.size)) {
            return [];
        }
        const { insertSpaces, convertPixels } = this.userSettings;
        const directory = this.directory.image;
        const result: string[] = new Array(length * 3);
        let i = 0;
        for (const data of stored.drawables) {
            result[i++] = replaceTab(convertPixels ? replaceAll(data[1], 'px"', convertPixels + '"') : data[1], insertSpaces);
            result[i++] = directory;
            result[i++] = data[0] + '.xml';
        }
        return this.checkFileAssets(result, options);
    }

    public resourceAnimToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.animators.size)) {
            return [];
        }
        const insertSpaces = this.userSettings.insertSpaces;
        const directory = this.directory.animation;
        const result: string[] = new Array(length * 3);
        let i = 0;
        for (const data of stored.animators) {
            result[i++] = replaceTab(data[1], insertSpaces);
            result[i++] = directory;
            result[i++] = data[0] + '.xml';
        }
        return this.checkFileAssets(result, options);
    }

    public resourceDrawableImageToString(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        if (stored && stored.images.size) {
            const imageDirectory = this.directory.image;
            const result: string[] = [];
            for (const [filename, images] of stored.images) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi]!;
                        result.push(
                            value,
                            imageDirectory + '-' + dpi,
                            filename + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
                else {
                    const value = images.mdpi;
                    if (value) {
                        result.push(
                            value,
                            imageDirectory,
                            filename + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
            }
            if (hasFileAction(options)) {
                const { resource, resourceId, userSettings } = this;
                const assets = getImageAssets.call(resource, resourceId, getOutputDirectory(userSettings.outputDirectory), result, userSettings.convertImages, userSettings.compressImages, userSettings.outputDocumentHandler);
                if (options.assets) {
                    assets.push(...options.assets);
                }
                options.assets = assets;
                if (options.pathname) {
                    this.copying(options.pathname, options);
                }
                if (options.filename) {
                    this.archiving('', options);
                }
            }
            return result;
        }
        return [];
    }

    public resourceRawVideoToString(assets = Resource.ASSETS[this.resourceId], options?: FileUniversalOptions): string[] {
        return this.resourceRawToString(assets, 'video', options);
    }

    public resourceRawAudioToString(assets = Resource.ASSETS[this.resourceId], options?: FileUniversalOptions): string[] {
        return this.resourceRawToString(assets, 'audio', options);
    }

    public layoutAllToXml(layouts: FileAsset[], options?: FileUniversalOptions) {
        const result: PlainObject = {};
        const assets: FileAsset[] = [];
        if (hasFileAction(options)) {
            checkLayoutFiles(assets, this.userSettings.outputMainFileName);
        }
        for (const { content, filename } of layouts) {
            result[filename] = [content];
        }
        if (hasFileAction(options)) {
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            if (options.pathname) {
                this.copying(options.pathname, options);
            }
            if (options.filename) {
                this.archiving('', options);
            }
        }
        return result;
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return options.watch ? '&watch=1' : '';
    }

    public finalizeRequestBody(body: RequestData & FileUniversalOptions) {
        if (body.watch) {
            for (const item of body.assets!) {
                if (isPlainObject<WatchInterval>(item.watch)) {
                    delete item.watch.reload;
                }
            }
        }
        if (this.userSettings.createBuildDependencies) {
            body.dependencies = this.resource.application.dependencies;
        }
    }

    protected async processAssets(assets: FileAsset[], options: FileUniversalOptions) {
        const { userSettings, resource, resourceId } = this;
        const documentHandler = userSettings.outputDocumentHandler;
        checkLayoutFiles(assets, this.userSettings.outputMainFileName, documentHandler);
        const data = Resource.ASSETS[resourceId];
        if (data) {
            const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
            assets.push(
                ...getFileAssets(outputDirectory, this.resourceStringToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceStringArrayToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceFontToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceColorToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceDimenToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceStyleToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceDrawableToXml(), documentHandler),
                ...getFileAssets(outputDirectory, this.resourceAnimToXml(), documentHandler)
            );
            if (!options.updateXmlOnly) {
                const imageAssets = getImageAssets.call(resource, resourceId, outputDirectory, this.resourceDrawableImageToString(), userSettings.convertImages, userSettings.compressImages, documentHandler);
                const videoAssets = getRawAssets.call(resource, resourceId, 'video', outputDirectory + this.directory.video, this.resourceRawVideoToString(), documentHandler);
                const audioAssets = getRawAssets.call(resource, resourceId, 'audio', outputDirectory + this.directory.audio, this.resourceRawAudioToString(), documentHandler);
                const uri = options.config?.uri;
                if (uri) {
                    const items = await this.loadConfig(uri, options);
                    if (items) {
                        for (const item of items) {
                            const { selector, commands, watch, tasks, document: documentData } = item;
                            if (selector && (commands || watch || tasks || documentData)) {
                                const elements = document.querySelectorAll(selector);
                                for (let i = 0, length = elements.length; i < length; ++i) {
                                    const element = elements[i] as HTMLElement;
                                    let src: string;
                                    switch (element.tagName) {
                                        case 'IMG':
                                        case 'AUDIO':
                                        case 'SOURCE':
                                        case 'EMBED':
                                        case 'IFRAME':
                                            src = (element as HTMLImageElement | HTMLAudioElement | HTMLSourceElement | HTMLEmbedElement | HTMLIFrameElement).src;
                                            break;
                                        case 'VIDEO':
                                            src = (element as HTMLVideoElement)[item.type === 'image' ? 'poster' : 'src'];
                                            break;
                                        case 'OBJECT':
                                            src = (element as HTMLObjectElement).data;
                                            break;
                                        default:
                                            return;
                                    }
                                    if (src = resolvePath(src)) {
                                        let related: FileAsset[];
                                        switch (item.type) {
                                            case 'image':
                                                related = imageAssets.filter(asset => asset.uri === src);
                                                break;
                                            case 'video':
                                                related = videoAssets.filter(asset => asset.uri === src);
                                                break;
                                            case 'audio':
                                                related = audioAssets.filter(asset => asset.uri === src);
                                                break;
                                            default:
                                                return;
                                        }
                                        for (const asset of related) {
                                            if (commands) {
                                                asset.commands = commands;
                                            }
                                            if (watch) {
                                                asset.watch = watch;
                                            }
                                            if (tasks) {
                                                asset.tasks = tasks;
                                            }
                                            if (documentData) {
                                                asset.document = documentData;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                assets.push(
                    ...imageAssets,
                    ...videoAssets,
                    ...audioAssets
                );
                if (data.other) {
                    assets.push(...data.other);
                }
            }
        }
        return assets;
    }

    protected checkFileAssets(content: string[], options?: FileUniversalOptions) {
        if (hasFileAction(options)) {
            const userSettings = this.userSettings;
            const assets = getFileAssets(getOutputDirectory(userSettings.outputDirectory), content, userSettings.outputDocumentHandler);
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            if (options.pathname) {
                this.copying(options.pathname, options);
            }
            if (options.filename) {
                this.archiving('', options);
            }
        }
        return content;
    }

    private resourceRawToString(assets = Resource.ASSETS[this.resourceId], name: ResourceRawAsset, options?: FileUniversalOptions) {
        const rawData = assets && assets[name];
        let length: number;
        if (!rawData || !(length = rawData.size)) {
            return [];
        }
        const result: string[] = new Array(length * 3);
        let i = 0;
        for (const { uri, mimeType = '' } of rawData.values()) {
            result[i++] = uri!;
            result[i++] = getComponentEnd(uri!);
            result[i++] = mimeType;
        }
        if (hasFileAction(options)) {
            const { resource, resourceId, userSettings } = this;
            const rawAssets = getRawAssets.call(resource, resourceId, name, getOutputDirectory(userSettings.outputDirectory) + this.directory[name], result, userSettings.outputDocumentHandler);
            if (options.assets) {
                rawAssets.push(...options.assets);
            }
            options.assets = rawAssets;
            if (options.pathname) {
                this.copying(options.pathname, options);
            }
            if (options.filename) {
                this.archiving('', options);
            }
        }
        return result;
    }

    get userSettings() {
        return this.resource.application.userSettings;
    }

    get directory() {
        return this.resource.controllerSettings.directory;
    }

    get resourceId() {
        return this.resource.application.resourceId;
    }
}