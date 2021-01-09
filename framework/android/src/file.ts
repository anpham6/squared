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

const { convertBase64, fromLastIndexOf, parseMimeType, plainMap, splitPairStart } = squared.lib.util;

const { fromMimeType } = squared.base.lib.util;

const STORED = Resource.STORED;

function getFileAssets(pathname: string, items: string[]) {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            result[j++] = {
                pathname: pathname + items[i + 1],
                filename: items[i + 2],
                content: items[i],
                document: ['android']
            };
        }
        return result;
    }
    return items as [];
}

function getImageAssets(pathname: string, items: string[], convertImages: string, compressing: boolean) {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 4);
        for (let i = 0, j = 0; i < length; i += 4) {
            const filename = items[i + 2];
            const task = items[i + 3];
            let mimeType: Undef<string>,
                commands: Undef<string[]>,
                compress: Undef<CompressFormat[]>;
            if (filename.endsWith('.unknown')) {
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
            result[j++] = {
                pathname: pathname + items[i + 1],
                filename,
                mimeType,
                commands,
                compress,
                uri: items[i],
                document: ['android'],
                tasks: task ? task.split('+') : undefined
            };
        }
        return result;
    }
    return items as [];
}

function getRawAssets(pathname: string, items: string[]) {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 4);
        for (let i = 0, j = 0; i < length; i += 4) {
            const task = items[i + 3];
            result[j++] = {
                pathname,
                filename: items[i + 2].toLowerCase(),
                mimeType: items[i + 1],
                uri: items[i],
                document: ['android'],
                tasks: task ? task.split('+') : undefined
            };
        }
        return result;
    }
    return items as [];
}

function getOutputDirectory(value: string) {
    value = value.replace(/\\/g, '/');
    return value + (!value.endsWith('/') ? '/' : '');
}

const hasFileAction = (options: Undef<FileUniversalOptions>): options is FileUniversalOptions => !!(options && (options.directory || options.filename));

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public resource!: Resource<T>;

    public copyTo(directory: string, options: FileCopyingOptions) {
        return this.copying({ ...options, assets: this.combineAssets(options.assets!), directory });
    }

    public appendTo(pathname: string, options: FileArchivingOptions) {
        return this.archiving({ ...options, assets: this.combineAssets(options.assets!), appendTo: pathname });
    }

    public saveAs(filename: string, options: FileArchivingOptions) {
        return this.archiving({ ...options, assets: this.combineAssets(options.assets!), filename });
    }

    public resourceAllToXml(options?: FileUniversalOptions) {
        const result: ObjectMap<string[]> = {
            string: this.resourceStringToXml(),
            stringArray: this.resourceStringArrayToXml(),
            font: this.resourceFontToXml(),
            color: this.resourceColorToXml(),
            style: this.resourceStyleToXml(),
            dimen: this.resourceDimenToXml(),
            drawable: this.resourceDrawableToXml(),
            anim: this.resourceAnimToXml(),
            drawableImage: this.resourceDrawableImageToString(),
            rawVideo: this.resourceRawVideoToString(),
            rawAudio: this.resourceRawAudioToString()
        };
        for (const name in result) {
            if (result[name].length === 0) {
                delete result[name];
            }
        }
        if (hasFileAction(options)) {
            const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
            const assets: FileAsset[] = [];
            for (const name in result) {
                switch (name) {
                    case 'drawableImage':
                        assets.push(...getImageAssets(outputDirectory, result[name], this.userSettings.convertImages, this.userSettings.compressImages));
                        break;
                    case 'rawVideo':
                        assets.push(...getRawAssets(outputDirectory + this.directory.video, result[name]));
                        break;
                    case 'rawAudio':
                        assets.push(...getRawAssets(outputDirectory + this.directory.audio, result[name]));
                        break;
                    default:
                        assets.push(...getFileAssets(outputDirectory, result[name]));
                        break;
                }
            }
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    public resourceStringToXml(options?: FileUniversalOptions): string[] {
        const items = Array.from(STORED.strings).sort((a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1);
        const length = items.length;
        let j: number,
            itemArray: ItemValue[];
        if (STORED.strings.has('app_name')) {
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
        return this.checkFileAssets([
            replaceTab(applyTemplate('resources', STRING_TMPL, [{ string: itemArray }]), this.userSettings.insertSpaces, true),
            this.directory.string,
            'strings.xml'
        ], options);
    }

    public resourceStringArrayToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.arrays.size;
        if (length) {
            const items = Array.from(STORED.arrays).sort();
            const itemArray: { name: string; item: { innerText: string }[] }[] = new Array(length);
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                itemArray[i] = { name: item[0], item: plainMap(item[1], innerText => ({ innerText })) };
            }
            return this.checkFileAssets([
                replaceTab(applyTemplate('resources', STRINGARRAY_TMPL, [{ 'string-array': itemArray }]), this.userSettings.insertSpaces, true),
                this.directory.string,
                'string_arrays.xml'
            ], options);
        }
        return [];
    }

    public resourceFontToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.fonts.size;
        if (length) {
            const { insertSpaces, outputDirectory, targetAPI } = this.userSettings;
            const resource = this.resource;
            const xmlns = XML_NAMESPACE[targetAPI < BUILD_VERSION.OREO ? 'app' : 'android'];
            const directory = getOutputDirectory(outputDirectory);
            const pathname = this.directory.font;
            const items = Array.from(STORED.fonts).sort();
            const result: string[] = new Array(length * 3);
            for (let i = 0, j = 0; i < length; ++i) {
                const [name, font] = items[i];
                const itemArray: { font: string; fontStyle: string; fontWeight: string }[] = [];
                for (const attr in font) {
                    const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                    const fontName = name + (fontStyle === 'normal' ? fontWeight === '400' ? '_normal' : '_' + font[attr] : '_' + fontStyle + (fontWeight !== '400' ? font[attr] : ''));
                    itemArray.push({ font: `@font/${fontName}`, fontStyle, fontWeight });
                    const url = resource.getFont(fontFamily, fontStyle, fontWeight)?.srcUrl;
                    if (url) {
                        const data = this.resource.getRawData(url);
                        let base64: Undef<string>,
                            ext: Undef<string>;
                        if (data) {
                            base64 = data.base64;
                            if (!base64 && data.buffer) {
                                base64 = convertBase64(data.buffer);
                                data.base64 = base64;
                            }
                            if (data.mimeType) {
                                ext = fromMimeType(data.mimeType);
                            }
                        }
                        this.addAsset({
                            pathname: directory + pathname,
                            filename: fontName + '.' + (ext || Resource.getExtension(splitPairStart(url, '?')).toLowerCase() || 'ttf'),
                            uri: !base64 ? url : undefined,
                            base64
                        });
                    }
                }
                const output = replaceTab(applyTemplate('font-family', FONTFAMILY_TMPL, [{ 'xmlns:android': xmlns, font: itemArray }]), insertSpaces);
                result[j++] = targetAPI < BUILD_VERSION.OREO ? output.replace(/\s+android:/g, ' app:') : output;
                result[j++] = pathname;
                result[j++] = `${name}.xml`;
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceColorToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.colors.size;
        if (length) {
            const items = Array.from(STORED.colors).sort();
            const itemArray: ItemValue[] = new Array(length);
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                itemArray[i] = { name: item[1], innerText: item[0] };
            }
            return this.checkFileAssets([
                replaceTab(applyTemplate('resources', COLOR_TMPL, [{ color: itemArray }]), this.userSettings.insertSpaces),
                this.directory.string,
                'colors.xml'
            ], options);
        }
        return [];
    }

    public resourceStyleToXml(options?: FileUniversalOptions): string[] {
        const result: string[] = [];
        if (STORED.styles.size) {
            const itemArray: ItemData[] = [];
            for (const style of Array.from(STORED.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                itemArray.push({
                    name: style.name,
                    parent: style.parent,
                    item: plainMap(style.items.sort((a, b) => a.key >= b.key ? 1 : -1), obj => ({ name: obj.key, innerText: obj.value }))
                });
            }
            result.push(
                replaceTab(applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]), this.userSettings.insertSpaces),
                this.directory.string,
                'styles.xml'
            );
        }
        if (STORED.themes.size) {
            const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
            const dpUnit = convertPixels === 'dp';
            const appTheme: ObjectMap<boolean> = {};
            for (const data of STORED.themes) {
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
                        result.push(
                            replaceTab(dpUnit ? value.replace(/>(-?[\d.]+)px</g, (...capture: string[]) => `>${capture[1]}dp<`) : value, insertSpaces),
                            match[1],
                            match[2]
                        );
                    }
                }
            }
        }
        return this.checkFileAssets(result, options);
    }

    public resourceDimenToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.dimens.size;
        if (length) {
            const convertPixels = this.userSettings.convertPixels === 'dp';
            const items = Array.from(STORED.dimens).sort();
            const itemArray: ItemValue[] = new Array(length);
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                itemArray[i] = { name: item[0], innerText: convertPixels ? item[1].replace(/px$/, 'dp') : item[1] };
            }
            return this.checkFileAssets([
                replaceTab(applyTemplate('resources', DIMEN_TMPL, [{ dimen: itemArray }])),
                this.directory.string,
                'dimens.xml'
            ], options);
        }
        return [];
    }

    public resourceDrawableToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.drawables.size;
        if (length) {
            const userSettings = this.userSettings;
            const insertSpaces = userSettings.insertSpaces;
            const convertPixels = userSettings.convertPixels === 'dp';
            const directory = this.directory.image;
            const result: string[] = new Array(length * 3);
            let i = 0;
            for (const data of STORED.drawables) {
                result[i++] = replaceTab(convertPixels ? data[1].replace(/"(-?[\d.]+)px"/g, (...match: string[]) => `"${match[1]}dp"`) : data[1], insertSpaces);
                result[i++] = directory;
                result[i++] = `${data[0]}.xml`;
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceAnimToXml(options?: FileUniversalOptions): string[] {
        const length = STORED.animators.size;
        if (length) {
            const insertSpaces = this.userSettings.insertSpaces;
            const result: string[] = new Array(length * 3);
            let i = 0;
            for (const data of STORED.animators) {
                result[i++] = replaceTab(data[1], insertSpaces);
                result[i++] = 'res/anim';
                result[i++] = `${data[0]}.xml`;
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceDrawableImageToString(options?: FileUniversalOptions): string[] {
        if (STORED.images.size) {
            const resource = this.resource;
            const imageDirectory = this.directory.image;
            const result: string[] = [];
            const getTask = (src: string) => {
                const image = resource.getImage(src);
                return image && image.tasks ? image.tasks.join('+') : '';
            };
            for (const data of STORED.images) {
                const images = data[1];
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi]!;
                        result.push(
                            value,
                            imageDirectory + '-' + dpi,
                            data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown'),
                            getTask(value)
                        );
                    }
                }
                else {
                    const value = images.mdpi;
                    if (value) {
                        result.push(
                            value,
                            imageDirectory,
                            data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown'),
                            getTask(value)
                        );
                    }
                }
            }
            if (hasFileAction(options)) {
                const assets = getImageAssets(getOutputDirectory(this.userSettings.outputDirectory), result, this.userSettings.convertImages, this.userSettings.compressImages);
                if (options.assets) {
                    assets.push(...options.assets);
                }
                options.assets = assets;
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        return [];
    }

    public resourceRawVideoToString(options?: FileUniversalOptions): string[] {
        return this.resourceRawToString('video', options);
    }

    public resourceRawAudioToString(options?: FileUniversalOptions): string[] {
        return this.resourceRawToString('audio', options);
    }

    public layoutAllToXml(layouts: FileAsset[], options?: FileUniversalOptions) {
        const result: PlainObject = {};
        const assets: FileAsset[] = [];
        for (let i = 0, length = layouts.length; i < length; ++i) {
            const { content, filename, pathname } = layouts[i];
            result[filename] = [content];
            if (hasFileAction(options)) {
                assets.push({ pathname, filename: i === 0 ? this.userSettings.outputMainFileName : `${filename}.xml`, content } as FileAsset);
            }
        }
        if (hasFileAction(options)) {
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    public getCopyQueryParameters(options: FileCopyingOptions) {
        return this.getArchiveQueryParameters(options) + (options.watch ? '&watch=1' : '');
    }

    public getArchiveQueryParameters(options: FileArchivingOptions) {
        return '&android=1';
    }

    protected combineAssets(assets: FileAsset[]) {
        const userSettings = this.userSettings;
        const result: FileAsset[] = [];
        for (let i = 0, length = assets.length, first = true; i < length; ++i) {
            const item = assets[i];
            if (item.content && !item.uri) {
                if (first) {
                    item.filename = userSettings.outputMainFileName;
                    first = false;
                }
                else if (!item.filename.endsWith('.xml')) {
                    item.filename += '.xml';
                }
                (item.document ||= []).push('android');
            }
        }
        result.push(...assets);
        const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
        result.push(
            ...getFileAssets(outputDirectory, this.resourceStringToXml()),
            ...getFileAssets(outputDirectory, this.resourceStringArrayToXml()),
            ...getFileAssets(outputDirectory, this.resourceFontToXml()),
            ...getFileAssets(outputDirectory, this.resourceColorToXml()),
            ...getFileAssets(outputDirectory, this.resourceDimenToXml()),
            ...getFileAssets(outputDirectory, this.resourceStyleToXml()),
            ...getFileAssets(outputDirectory, this.resourceDrawableToXml()),
            ...getImageAssets(outputDirectory, this.resourceDrawableImageToString(), userSettings.convertImages, userSettings.compressImages),
            ...getFileAssets(outputDirectory, this.resourceAnimToXml()),
            ...getRawAssets(outputDirectory + this.directory.video, this.resourceRawVideoToString()),
            ...getRawAssets(outputDirectory + this.directory.audio, this.resourceRawAudioToString())
        );
        return result;
    }

    protected checkFileAssets(content: string[], options?: FileUniversalOptions) {
        if (hasFileAction(options)) {
            const assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content);
            if (options.assets) {
                assets.push(...options.assets);
            }
            options.assets = assets;
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return content;
    }

    private resourceRawToString(name: "video" | "audio", options?: FileUniversalOptions) {
        const length = Resource.ASSETS[name].size;
        if (length) {
            const resource = this.resource;
            const getTask = (src: string) => {
                const asset = name === 'video' ? resource.getVideo(src) : resource.getAudio(src);
                return asset && asset.tasks ? asset.tasks.join('+') : '';
            };
            const result: string[] = new Array(length * 4);
            let i = 0;
            for (const item of Resource.ASSETS[name].values()) {
                const uri = item.uri!;
                result[i++] = uri;
                result[i++] = item.mimeType || '';
                result[i++] = fromLastIndexOf(uri, '/', '\\');
                result[i++] = getTask(uri);
            }
            if (hasFileAction(options)) {
                const assets = getRawAssets(getOutputDirectory(this.userSettings.outputDirectory) + this.directory[name], result);
                if (options.assets) {
                    assets.push(...options.assets);
                }
                options.assets = assets;
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        return [];
    }

    get userSettings() {
        return this.resource.userSettings;
    }

    get directory() {
        return this.resource.controllerSettings.directory;
    }
}