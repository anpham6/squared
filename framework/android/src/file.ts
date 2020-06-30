import Resource from './resource';

import { XMLNS_ANDROID } from './lib/constant';
import { BUILD_ANDROID } from './lib/enumeration';
import { applyTemplate, convertLength, replaceTab } from './lib/util';

import COLOR_TMPL from './template/resources/color';
import DIMEN_TMPL from './template/resources/dimen';
import FONTFAMILY_TMPL from './template/font-family';
import STRING_TMPL from './template/resources/string';
import STRINGARRAY_TMPL from './template/resources/string-array';
import STYLE_TMPL from './template/resources/style';

type FileArchivingOptions = squared.base.FileArchivingOptions;
type FileCopyingOptions = squared.base.FileCopyingOptions;
type View = android.base.View;

interface ItemValue {
    name: string;
    innerText: string;
}

const { fromLastIndexOf, parseMimeType, plainMap } = squared.lib.util;

const STORED = Resource.STORED as AndroidResourceStoredMap;

function getFileAssets(pathname: string, items: string[]) {
    const length = items.length;
    if (length > 0) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            result[j++] = {
                pathname: pathname + items[i + 1],
                filename: items[i + 2],
                content: items[i]
            };
        }
        return result;
    }
    return items as [];
}

function getImageAssets(pathname: string, items: string[], convertExt: string, compress: boolean) {
    const length = items.length;
    if (length > 0) {
        convertExt = convertExt.toLowerCase();
        let mimeTypeTo = parseMimeType(convertExt);
        if (!mimeTypeTo.startsWith('image/')) {
            mimeTypeTo = '';
        }
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            const filename = items[i + 2];
            let mimeType: Undef<string>;
            if (filename.endsWith('.unknown')) {
                mimeType = (compress ? 'png@:' : '') + 'image/unknown';
            }
            else if (mimeTypeTo !== '') {
                const mimeTypeFrom = parseMimeType(filename);
                if (mimeTypeFrom !== mimeTypeTo && mimeTypeFrom.startsWith('image/')) {
                    mimeType = convertExt + (!/[@%]/.test(convertExt) ? '@' : '') + ':' + mimeTypeFrom;
                }
            }
            result[j++] = {
                pathname: pathname + items[i + 1],
                filename,
                mimeType,
                compress: compress && Resource.canCompressImage(filename, mimeTypeTo) ? [{ format: 'png' }] : undefined,
                uri: items[i]
            };
        }
        return result;
    }
    return items as [];
}

function getRawAssets(pathname: string, items: string[]) {
    const length = items.length;
    if (length > 0) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3) {
            result[j++] = {
                pathname,
                filename: items[i + 2].toLowerCase(),
                mimeType: items[i + 1],
                uri: items[i]
            };
        }
        return result;
    }
    return items as [];
}

function getOutputDirectory(value: string) {
    value = value.trim().replace(/\\/g, '/');
    return value + (!value.endsWith('/') ? '/' : '');
}

export default class File<T extends View> extends squared.base.FileUI<T> implements android.base.File<T> {
    public readonly resource!: android.base.Resource<T>;

    public copyToDisk(directory: string, options?: FileCopyingOptions) {
        return this.copying({
            ...options,
            assets: this.combineAssets(options?.assets),
            directory
        });
    }

    public appendToArchive(pathname: string, options?: FileArchivingOptions) {
        return this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: this.combineAssets(options?.assets),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptions) {
        return this.archiving({
            ...options,
            assets: this.combineAssets(options?.assets),
            filename
        });
    }

    public resourceAllToXml(options: FileUniversalOptions = {}) {
        const result = {
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
        if (options.directory || options.filename) {
            const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
            let assets: FileAsset[] = [];
            for (const name in result) {
                switch (name) {
                    case 'drawableImage':
                        assets = assets.concat(getImageAssets(outputDirectory, result[name], this.userSettings.convertImages, this.userSettings.compressImages));
                        break;
                    case 'rawVideo':
                        assets = assets.concat(getRawAssets(outputDirectory + this.directory.video, result[name]));
                        break;
                    case 'rawAudio':
                        assets = assets.concat(getRawAssets(outputDirectory + this.directory.audio, result[name]));
                        break;
                    default:
                        assets = assets.concat(getFileAssets(outputDirectory, result[name]));
                        break;
                }
            }
            options.assets = assets.concat(options.assets || []);
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    public resourceStringToXml(options: FileUniversalOptions = {}): string[] {
        const item: ObjectMap<ItemValue[]> = { string: [] };
        const itemArray = item.string;
        if (!STORED.strings.has('app_name')) {
            itemArray.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(STORED.strings.entries()).sort((a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1)) {
            itemArray.push({ name, innerText });
        }
        return this.checkFileAssets([
            replaceTab(
                applyTemplate('resources', STRING_TMPL, [item]),
                this.userSettings.insertSpaces,
                true
            ),
            this.directory.string,
            'strings.xml'
        ], options);
    }

    public resourceStringArrayToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.arrays.size > 0) {
            const item: ObjectMap<any[]> = { 'string-array': [] };
            const itemArray = item['string-array'];
            for (const [name, values] of Array.from(STORED.arrays.entries()).sort()) {
                itemArray.push({
                    name,
                    item: plainMap(values, innerText => ({ innerText }))
                });
            }
            return this.checkFileAssets([
                replaceTab(
                    applyTemplate('resources', STRINGARRAY_TMPL, [item]),
                    this.userSettings.insertSpaces,
                    true
                ),
                this.directory.string,
                'string_arrays.xml'
            ], options);
        }
        return [];
    }

    public resourceFontToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.fonts.size > 0) {
            const resource = this.resource;
            const { insertSpaces, targetAPI } = this.userSettings;
            const xmlns = targetAPI < BUILD_ANDROID.OREO ? XMLNS_ANDROID.app : XMLNS_ANDROID.android;
            const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
            const pathname = this.directory.font;
            const result: string[] = [];
            for (const [name, font] of Array.from(STORED.fonts.entries()).sort()) {
                const item: StandardMap = { 'xmlns:android': xmlns, font: [] };
                const itemArray = item.font as StringMap[];
                for (const attr in font) {
                    const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                    let fontName = name;
                    if (fontStyle === 'normal') {
                        fontName += fontWeight === '400' ? '_normal' : '_' + font[attr];
                    }
                    else {
                        fontName += '_' + fontStyle + (fontWeight !== '400' ? font[attr] : '');
                    }
                    itemArray.push({
                        font: `@font/${fontName}`,
                        fontStyle,
                        fontWeight
                    });
                    const uri = resource.getFont(fontFamily, fontStyle, fontWeight)?.srcUrl;
                    if (uri) {
                        this.addAsset({
                            pathname: outputDirectory + pathname,
                            filename: fontName + '.' + (Resource.getExtension(uri.split('?')[0]).toLowerCase() || 'ttf'),
                            uri
                        });
                    }
                }
                let output = replaceTab(applyTemplate('font-family', FONTFAMILY_TMPL, [item]), insertSpaces);
                if (targetAPI < BUILD_ANDROID.OREO) {
                    output = output.replace(/\s+android:/g, ' app:');
                }
                result.push(output, pathname, `${name}.xml`);
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceColorToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.colors.size > 0) {
            const item: ObjectMap<ItemValue[]> = { color: [] };
            const itemArray = item.color;
            for (const [innerText, name] of Array.from(STORED.colors.entries()).sort()) {
                itemArray.push({ name, innerText });
            }
            return this.checkFileAssets([
                replaceTab(
                    applyTemplate('resources', COLOR_TMPL, [item]),
                    this.userSettings.insertSpaces
                ),
                this.directory.string,
                'colors.xml'
            ], options);
        }
        return [];
    }

    public resourceStyleToXml(options: FileUniversalOptions = {}): string[] {
        const result: string[] = [];
        if (STORED.styles.size > 0) {
            const item: ObjectMap<any[]> = { style: [] };
            const itemArray = item.style;
            for (const style of Array.from(STORED.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                const styleArray = style.items;
                if (Array.isArray(styleArray)) {
                    itemArray.push({
                        name: style.name,
                        parent: style.parent,
                        item: plainMap(styleArray.sort((a, b) => a.key >= b.key ? 1 : -1), obj => ({ name: obj.key, innerText: obj.value }))
                    });
                }
            }
            result.push(
                replaceTab(
                    applyTemplate('resources', STYLE_TMPL, [item]),
                    this.userSettings.insertSpaces
                ),
                this.directory.string,
                'styles.xml'
            );
        }
        if (STORED.themes.size > 0) {
            const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of STORED.themes.entries()) {
                const match = /^(.+)\/(.+?\.\w+)$/.exec(filename);
                if (match) {
                    const item: ObjectMap<any[]> = { style: [] };
                    const itemArray = item.style;
                    for (const [themeName, themeData] of theme.entries()) {
                        const themeArray: ItemValue[] = [];
                        const items = themeData.items;
                        for (const name in items) {
                            themeArray.push({ name, innerText: items[name] });
                        }
                        if (!appTheme[filename] || themeName !== manifestThemeName || item.length) {
                            itemArray.push({
                                name: themeName,
                                parent: themeData.parent,
                                item: themeArray
                            });
                        }
                        if (themeName === manifestThemeName) {
                            appTheme[filename] = true;
                        }
                    }
                    const value = applyTemplate('resources', STYLE_TMPL, [item]);
                    result.push(
                        replaceTab(
                            convertPixels === 'dp' ? value.replace(/>(-?[\d.]+)px</g, (found, ...capture) => '>' + convertLength(capture[0], false) + '<') : value,
                            insertSpaces
                        ),
                        match[1],
                        match[2]
                    );
                }
            }
        }
        return this.checkFileAssets(result, options);
    }

    public resourceDimenToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.dimens.size > 0) {
            const convertPixels = this.userSettings.convertPixels;
            const item: ObjectMap<ItemValue[]> = { dimen: [] };
            const itemArray = item.dimen;
            for (const [name, value] of Array.from(STORED.dimens.entries()).sort()) {
                itemArray.push({ name, innerText: convertPixels ? convertLength(value, false) : value });
            }
            return this.checkFileAssets([
                replaceTab(applyTemplate('resources', DIMEN_TMPL, [item])),
                this.directory.string,
                'dimens.xml'
            ], options);
        }
        return [];
    }

    public resourceDrawableToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.drawables.size > 0) {
            const { convertPixels, insertSpaces } = this.userSettings;
            const directory = this.directory.image;
            const result: string[] = [];
            for (const [name, value] of STORED.drawables.entries()) {
                result.push(
                    replaceTab(
                        convertPixels === 'dp' ? value.replace(/"(-?[\d.]+)px"/g, (match, ...capture) => '"' + convertLength(capture[0], false) + '"') : value,
                        insertSpaces
                    ),
                    directory,
                    `${name}.xml`
                );
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceAnimToXml(options: FileUniversalOptions = {}): string[] {
        if (STORED.animators.size > 0) {
            const insertSpaces = this.userSettings.insertSpaces;
            const result: string[] = [];
            for (const [name, value] of STORED.animators.entries()) {
                result.push(
                    replaceTab(value, insertSpaces),
                    'res/anim',
                    `${name}.xml`
                );
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceDrawableImageToString(options: FileUniversalOptions = {}): string[] {
        if (STORED.images.size > 0) {
            const imageDirectory = this.directory.image;
            const result: string[] = [];
            for (const [name, images] of STORED.images.entries()) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi]!;
                        result.push(
                            value,
                            imageDirectory + '-' + dpi,
                            name + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
                else {
                    const value = images.mdpi;
                    if (value) {
                        result.push(
                            value,
                            imageDirectory,
                            name + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                        );
                    }
                }
            }
            if (options.directory || options.filename) {
                options.assets = getImageAssets(getOutputDirectory(this.userSettings.outputDirectory), result, this.userSettings.convertImages, this.userSettings.compressImages).concat(options.assets || []);
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

    public resourceRawVideoToString(options: FileUniversalOptions = {}): string[] {
        if (Resource.ASSETS.video.size > 0) {
            const result: string[] = [];
            for (const video of Resource.ASSETS.video.values()) {
                const uri = video.uri as string;
                result.push(uri, video.mimeType || '', fromLastIndexOf(uri, '/', '\\'));
            }
            if (options.directory || options.filename) {
                options.assets = getRawAssets(getOutputDirectory(this.userSettings.outputDirectory) + this.directory.video, result).concat(options.assets || []);
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

    public resourceRawAudioToString(options: FileUniversalOptions = {}): string[] {
        if (Resource.ASSETS.video.size > 0) {
            const result: string[] = [];
            for (const video of Resource.ASSETS.audio.values()) {
                const uri = video.uri as string;
                result.push(uri, video.mimeType || '', fromLastIndexOf(uri, '/', '\\'));
            }
            if (options.directory || options.filename) {
                options.assets = getRawAssets(getOutputDirectory(this.userSettings.outputDirectory) + this.directory.audio, result).concat(options.assets || []);
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

    public layoutAllToXml(layouts: FileAsset[], options: FileUniversalOptions = {}) {
        const actionable = options.directory || options.filename;
        const result = {};
        const assets: FileAsset[] = [];
        for (let i = 0; i < layouts.length; ++i) {
            const { content, filename, pathname } = layouts[i];
            result[filename] = [content];
            if (actionable) {
                assets.push({ pathname, filename: i === 0 ? this.userSettings.outputMainFileName : `${filename}.xml`, content } as FileAsset);
            }
        }
        if (actionable) {
            options.assets = options.assets ? assets.concat(options.assets) : assets;
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    protected combineAssets(assets?: FileAsset[]) {
        const userSettings = this.userSettings;
        let result: FileAsset[] = [];
        if (assets) {
            const length = assets.length;
            let first = true;
            let i = 0;
            while (i < length) {
                const item = assets[i++];
                if (!item.uri) {
                    if (first) {
                        item.filename = userSettings.outputMainFileName;
                        first = false;
                    }
                    else {
                        const filename = item.filename;
                        if (!filename.endsWith('.xml')) {
                            item.filename =  `${filename}.xml`;
                        }
                    }
                }
            }
            result = result.concat(assets);
        }
        const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
        return result.concat(
            getFileAssets(outputDirectory, this.resourceStringToXml()),
            getFileAssets(outputDirectory, this.resourceStringArrayToXml()),
            getFileAssets(outputDirectory, this.resourceFontToXml()),
            getFileAssets(outputDirectory, this.resourceColorToXml()),
            getFileAssets(outputDirectory, this.resourceDimenToXml()),
            getFileAssets(outputDirectory, this.resourceStyleToXml()),
            getFileAssets(outputDirectory, this.resourceDrawableToXml()),
            getImageAssets(outputDirectory, this.resourceDrawableImageToString(), userSettings.convertImages, userSettings.compressImages),
            getFileAssets(outputDirectory, this.resourceAnimToXml()),
            getRawAssets(outputDirectory + this.directory.video, this.resourceRawVideoToString()),
            getRawAssets(outputDirectory + this.directory.audio, this.resourceRawAudioToString())
        );
    }

    protected checkFileAssets(content: string[], options: FileUniversalOptions) {
        if (options.directory || options.filename) {
            options.assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content).concat(options.assets || []);
            if (options.directory) {
                this.copying(options);
            }
            if (options.filename) {
                this.archiving(options);
            }
        }
        return content;
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}