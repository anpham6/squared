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

const { convertBase64, endsWith, fromLastIndexOf, parseMimeType, plainMap } = squared.lib.util;

const { fromMimeType } = squared.base.lib.util;

function getFileAssets(pathname: string, items: string[], document: StringOfArray = 'android') {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            result[j++] = {
                pathname: pathname + items[i + 1],
                filename: items[i + 2],
                content: items[i],
                document: copyDocument(document)
            };
        }
        return result;
    }
    return items as [];
}

function getImageAssets(this: Resource<View>, resourceId: number, pathname: string, items: string[], convertImages: string, compressing: boolean, document: StringOfArray = 'android') {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            const uri = items[i];
            const filename = items[i + 2];
            let mimeType: Undef<string>,
                commands: Undef<string[]>,
                compress: Undef<CompressFormat[]>;
            if (endsWith(filename, '.unknown')) {
                mimeType = 'image/unknown';
                if (compressing) {
                    compress = [{ format: 'png' }];
                }
            }
            else if (convertImages) {
                mimeType = parseMimeType(filename);
                switch (mimeType) {
                    case 'image/png':
                    case 'image/jpeg':
                    case 'image/webp':
                    case 'image/gif':
                    case 'image/bmp':
                    case 'image/tiff':
                        for (const value of convertImages.trim().toLowerCase().split(/\s*::\s*/)) {
                            const match = /^[a-z]+/.exec(value);
                            if (match) {
                                switch (match[0]) {
                                    case 'png':
                                    case 'jpeg':
                                    case 'webp':
                                    case 'bmp':
                                        (commands ||= []).push(value);
                                        if (compressing && !compress && Resource.canCompressImage(filename, match[0])) {
                                            compress = [{ format: 'png' }];
                                        }
                                        break;
                                }
                            }
                        }
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
                document: copyDocument(document),
                tasks: image && image.tasks
            };
        }
        return result;
    }
    return items as [];
}

function getRawAssets(this: Resource<View>, resourceId: number, name: "video" | "audio", pathname: string, items: string[], document: StringOfArray = 'android') {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            const uri = items[i];
            const rawData = name === 'video' ? this.getVideo(resourceId, uri) : this.getAudio(resourceId, uri);
            result[j++] = {
                pathname,
                filename: items[i + 2].toLowerCase(),
                mimeType: items[i + 1],
                uri,
                document: copyDocument(document),
                tasks: rawData && rawData.tasks
            };
        }
        return result;
    }
    return items as [];
}

function getOutputDirectory(value: string) {
    value = value.replace(/\\/g, '/');
    return value + (!endsWith(value, '/') ? '/' : '');
}

const copyDocument = (value: StringOfArray) => Array.isArray(value) ? value.slice(0) : value;
const hasFileAction = (options: Undef<FileUniversalOptions>): options is FileUniversalOptions => !!(options && (options.directory || options.filename));

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public resource!: Resource<T>;

    public copyTo(pathname: string, options: FileCopyingOptions) {
        return this.copying(pathname, { ...options, assets: this.combineAssets(options.assets!) });
    }

    public appendTo(pathname: string, options: FileArchivingOptions) {
        return this.archiving(pathname, { ...options, assets: this.combineAssets(options.assets!) });
    }

    public saveAs(filename: string, options: FileArchivingOptions) {
        return this.archiving('', { ...options, assets: this.combineAssets(options.assets!), filename });
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
                if (result[name].length === 0) {
                    delete result[name];
                }
            }
            if (hasFileAction(options)) {
                const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
                const rawAssets: FileAsset[] = [];
                const resource = this.resource;
                const resourceId = this.resourceId;
                for (const name in result) {
                    switch (name) {
                        case 'drawableImage':
                            rawAssets.push(...getImageAssets.call(resource, resourceId, outputDirectory, result[name], this.userSettings.convertImages, this.userSettings.compressImages));
                            break;
                        case 'rawVideo':
                            rawAssets.push(...getRawAssets.call(resource, resourceId, 'video', outputDirectory + this.directory.video, result[name]));
                            break;
                        case 'rawAudio':
                            rawAssets.push(...getRawAssets.call(resource, resourceId, 'audio', outputDirectory + this.directory.audio, result[name]));
                            break;
                        default:
                            rawAssets.push(...getFileAssets(outputDirectory, result[name]));
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
        return this.checkFileAssets([replaceTab(applyTemplate('resources', STRING_TMPL, [{ string: itemArray }]), this.userSettings.insertSpaces, true), this.directory.string, 'strings.xml'], options);
    }

    public resourceStringArrayToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.arrays.size)) {
            return [];
        }
        const items = Array.from(stored.arrays).sort();
        const itemArray: { name: string; item: { innerText: string }[] }[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            itemArray[i] = { name: item[0], item: plainMap(item[1], innerText => ({ innerText })) };
        }
        return this.checkFileAssets([replaceTab(applyTemplate('resources', STRINGARRAY_TMPL, [{ 'string-array': itemArray }]), this.userSettings.insertSpaces, true), this.directory.string, 'string_arrays.xml'], options);
    }

    public resourceFontToXml(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        let length: number;
        if (!stored || !(length = stored.fonts.size)) {
            return [];
        }
        const { insertSpaces, outputDirectory, targetAPI } = this.userSettings;
        const resource = this.resource;
        const resourceId = this.resourceId;
        const xmlns = XML_NAMESPACE[targetAPI < BUILD_VERSION.OREO ? 'app' : 'android'];
        const directory = getOutputDirectory(outputDirectory);
        const pathname = this.directory.font;
        const items = Array.from(stored.fonts).sort();
        const result: string[] = new Array(length * 3);
        for (let i = 0, j = 0; i < length; ++i) {
            const [name, font] = items[i];
            const itemArray: { font: string; fontStyle: string; fontWeight: string }[] = [];
            for (const attr in font) {
                const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                const fontName = name + (fontStyle === 'normal' ? fontWeight === '400' ? '_normal' : '_' + font[attr] : '_' + fontStyle + (fontWeight !== '400' ? font[attr] : ''));
                itemArray.push({ font: `@font/${fontName}`, fontStyle, fontWeight });
                const fonts = resource.getFonts(resourceId, fontFamily, fontStyle, fontWeight);
                if (fonts.length) {
                    let uri: Undef<string>,
                        base64: Undef<string>,
                        ext: Undef<string>;
                    let data = fonts.find(item => item.srcUrl);
                    if (data) {
                        uri = data.srcUrl!;
                        const rawData = this.resource.getRawData(resourceId, uri);
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
                        ext ||= fromMimeType(data.mimeType) || Resource.getExtension(uri.split('?')[0]).toLowerCase();
                    }
                    else {
                        data = fonts.find(item => item.srcBase64);
                        if (data) {
                            base64 = data.srcBase64;
                            ext = fromMimeType(data.mimeType);
                        }
                        else {
                            continue;
                        }
                    }
                    this.resource.addAsset(resourceId, {
                        pathname: directory + pathname,
                        filename: fontName + '.' + (ext || 'ttf'),
                        uri: !base64 ? uri : undefined,
                        base64
                    });
                }
            }
            const output = replaceTab(applyTemplate('font-family', FONTFAMILY_TMPL, [{ 'xmlns:android': xmlns, font: itemArray }]), insertSpaces);
            result[j++] = targetAPI < BUILD_VERSION.OREO ? output.replace(/\s+android:/g, ' app:') : output;
            result[j++] = pathname;
            result[j++] = name + '.xml';
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
        const result: string[] = [];
        if (stored.styles.size) {
            const itemArray: ItemData[] = [];
            for (const style of Array.from(stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                itemArray.push({
                    name: style.name,
                    parent: style.parent,
                    item: plainMap(style.items.sort((a, b) => a.key >= b.key ? 1 : -1), obj => ({ name: obj.key, innerText: obj.value }))
                });
            }
            result.push(replaceTab(applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]), this.userSettings.insertSpaces), this.directory.string, 'styles.xml');
        }
        if (stored.themes.size) {
            const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
            const appTheme: ObjectMap<boolean> = {};
            for (const data of stored.themes) {
                const filename = data[0];
                const match = /^(.+)\/(.+?\.\w+)$/.exec(filename);
                if (match) {
                    const itemArray: ItemData[] = [];
                    for (const [themeName, themeData] of data[1]) {
                        if (!appTheme[filename] || themeName !== manifestThemeName) {
                            const themeArray: ItemValue[] = [];
                            const items = themeData.items;
                            for (const name in items) {
                                themeArray.push({ name, innerText: items[name]! });
                            }
                            itemArray.push({ name: themeName, parent: themeData.parent, item: themeArray });
                        }
                        if (themeName === manifestThemeName) {
                            appTheme[filename] = true;
                        }
                    }
                    if (itemArray.length) {
                        const value = applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]);
                        result.push(replaceTab(convertPixels === 'dp' ? value.replace(/>(-?[\d.]+)px</g, (...capture: string[]) => `>${capture[1]}dp<`) : value, insertSpaces), match[1], match[2]);
                    }
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
        const convertPixels = this.userSettings.convertPixels === 'dp';
        const items = Array.from(stored.dimens).sort();
        const itemArray: ItemValue[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            itemArray[i] = { name: item[0], innerText: convertPixels ? item[1].replace(/px$/, 'dp') : item[1] };
        }
        return this.checkFileAssets([replaceTab(applyTemplate('resources', DIMEN_TMPL, [{ dimen: itemArray }])), this.directory.string, 'dimens.xml'], options);
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
            result[i++] = replaceTab(convertPixels === 'dp' ? data[1].replace(/"(-?[\d.]+)px"/g, (...match: string[]) => `"${match[1]}dp"`) : data[1], insertSpaces);
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
        const result: string[] = new Array(length * 3);
        let i = 0;
        for (const data of stored.animators) {
            result[i++] = replaceTab(data[1], insertSpaces);
            result[i++] = 'res/anim';
            result[i++] = data[0] + '.xml';
        }
        return this.checkFileAssets(result, options);
    }

    public resourceDrawableImageToString(stored = Resource.STORED[this.resourceId], options?: FileUniversalOptions): string[] {
        if (stored && stored.images.size) {
            const imageDirectory = this.directory.image;
            const result: string[] = [];
            for (const data of stored.images) {
                const images = data[1];
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi]!;
                        result.push(
                            value,
                            imageDirectory + '-' + dpi,
                            data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
                else {
                    const value = images.mdpi;
                    if (value) {
                        result.push(
                            value,
                            imageDirectory,
                            data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
            }
            if (hasFileAction(options)) {
                const assets = getImageAssets.call(this.resource, this.resourceId, getOutputDirectory(this.userSettings.outputDirectory), result, this.userSettings.convertImages, this.userSettings.compressImages);
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
        for (let i = 0, length = layouts.length; i < length; ++i) {
            const { content, filename, pathname } = layouts[i];
            result[filename] = [content];
            if (hasFileAction(options)) {
                assets.push({ pathname, filename: i === 0 ? this.userSettings.outputMainFileName : filename + '.xml', content } as FileAsset);
            }
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

    protected combineAssets(assets: FileAsset[]) {
        const { userSettings, resource, resourceId } = this;
        const result: FileAsset[] = [];
        for (let i = 0, length = assets.length, first = true; i < length; ++i) {
            const item = assets[i];
            if (item.content && !item.uri) {
                if (first) {
                    item.filename = userSettings.outputMainFileName;
                    first = false;
                }
                else if (!endsWith(item.filename, '.xml')) {
                    item.filename += '.xml';
                }
                item.document ||= userSettings.outputDocumentHandler;
            }
        }
        result.push(...assets);
        const data = Resource.ASSETS[resourceId];
        if (data) {
            const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
            result.push(
                ...getFileAssets(outputDirectory, this.resourceStringToXml()),
                ...getFileAssets(outputDirectory, this.resourceStringArrayToXml()),
                ...getFileAssets(outputDirectory, this.resourceFontToXml()),
                ...getFileAssets(outputDirectory, this.resourceColorToXml()),
                ...getFileAssets(outputDirectory, this.resourceDimenToXml()),
                ...getFileAssets(outputDirectory, this.resourceStyleToXml()),
                ...getFileAssets(outputDirectory, this.resourceDrawableToXml()),
                ...getImageAssets.call(resource, resourceId, outputDirectory, this.resourceDrawableImageToString(), userSettings.convertImages, userSettings.compressImages),
                ...getFileAssets(outputDirectory, this.resourceAnimToXml()),
                ...getRawAssets.call(resource, resourceId, 'video', outputDirectory + this.directory.video, this.resourceRawVideoToString()),
                ...getRawAssets.call(resource, resourceId, 'audio', outputDirectory + this.directory.audio, this.resourceRawAudioToString())
            );
            if (data.other.length) {
                result.push(...data.other);
            }
        }
        return result;
    }

    protected checkFileAssets(content: string[], options?: FileUniversalOptions) {
        if (hasFileAction(options)) {
            const assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content);
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

    private resourceRawToString(assets = Resource.ASSETS[this.resourceId], name: "video" | "audio", options?: FileUniversalOptions) {
        let length: number;
        if (!assets || !(length = assets[name].size)) {
            return [];
        }
        const result: string[] = new Array(length * 3);
        let i = 0;
        for (const item of assets[name].values()) {
            const uri = item.uri!;
            result[i++] = uri;
            result[i++] = item.mimeType || '';
            result[i++] = fromLastIndexOf(uri.split('?')[0], '/');
        }
        if (hasFileAction(options)) {
            const rawAssets = getRawAssets.call(this.resource, this.resourceId, name, getOutputDirectory(this.userSettings.outputDirectory) + this.directory[name], result);
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
        return this.resource.userSettings;
    }

    get directory() {
        return this.resource.controllerSettings.directory;
    }

    get resourceId() {
        return this.resource.application.resourceId;
    }
}