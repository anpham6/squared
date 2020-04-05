import type { FileArchivingOptions, FileAsset, FileCopyingOptions } from '../../@types/base/application';
import type { FileOutputOptions, ResourceStoredMapAndroid } from '../../@types/android/application';

import Resource from './resource';

import { XMLNS_ANDROID } from './lib/constant';
import { BUILD_ANDROID } from './lib/enumeration';
import { convertLength } from './lib/util';

import COLOR_TMPL from './template/resources/color';
import DIMEN_TMPL from './template/resources/dimen';
import FONTFAMILY_TMPL from './template/font-family';
import STRING_TMPL from './template/resources/string';
import STRINGARRAY_TMPL from './template/resources/string-array';
import STYLE_TMPL from './template/resources/style';

type View = android.base.View;

const $lib = squared.lib;

const { fromLastIndexOf, objectMap } = $lib.util;
const { applyTemplate, replaceTab } = $lib.xml;

type ItemValue = {
    name: string;
    innerText: string;
};

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEX_FILENAME = /^(.+)\/(.+?\.\w+)$/;
const REGEX_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
const REGEX_THEME_UNIT = />(-?[\d.]+)px</g;

function getFileAssets(directory: string, items: string[]) {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3, j++) {
            result[j] = {
                pathname: directory + items[i + 1],
                filename: items[i + 2],
                content: items[i]
            };
        }
        return result;
    }
    return items as any[];
}

function getImageAssets(directory: string, items: string[], compression: boolean) {
    const length = items.length;
    if (length) {
        const result: FileAsset[] = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3, j++) {
            const filename = items[i + 2].split('?')[0];
            result[j] = {
                pathname: directory + items[i + 1],
                filename,
                content: '',
                compress: compression && Resource.canCompressImage(filename) ? [{ format: 'png' }] : undefined,
                uri: items[i]
            };
        }
        return result;
    }
    return items as any[];
}

function getOutputDirectory(value: string) {
    value = value.trim();
    return !value.endsWith('/') && !value.endsWith('\\') ? value + '/' : value;
}

const createFileAsset = (pathname: string, filename: string, content: string): FileAsset => ({ pathname, filename, content });
const replaceDrawableLength = (value: string, format: string) => format === 'dp' ? value.replace(REGEX_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], false) + '"') : value;
const replaceThemeLength = (value: string, format: string) => format === 'dp' ? value.replace(REGEX_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], false) + '<') : value;
const caseInsensitive = (a: string | string[], b: string | string[]) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;

export default class File<T extends View> extends squared.base.FileUI<T> implements android.base.File<T> {
    public resource!: android.base.Resource<T>;

    public copyToDisk(directory: string, options?: FileCopyingOptions) {
        this.copying({
            ...options,
            assets: this.getAssetsAll(options?.assets),
            directory
        });
    }

    public appendToArchive(pathname: string, options?: FileArchivingOptions) {
        this.archiving({
            filename: this.userSettings.outputArchiveName,
            ...options,
            assets: this.getAssetsAll(options?.assets),
            appendTo: pathname
        });
    }

    public saveToArchive(filename: string, options?: FileArchivingOptions) {
        this.archiving({
            ...options,
            assets: this.getAssetsAll(options?.assets),
            filename
        });
    }

    public resourceAllToXml(options: FileOutputOptions = {}) {
        const { directory, filename } = options;
        const result = {
            string: this.resourceStringToXml(),
            stringArray: this.resourceStringArrayToXml(),
            font: this.resourceFontToXml(),
            color: this.resourceColorToXml(),
            style: this.resourceStyleToXml(),
            dimen: this.resourceDimenToXml(),
            drawable: this.resourceDrawableToXml(),
            drawableImage: this.resourceDrawableImageToXml(),
            anim: this.resourceAnimToXml()
        };
        for (const name in result) {
            if (result[name].length === 0) {
                delete result[name];
            }
        }
        if (directory || filename) {
            const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
            const compressImages = this.userSettings.compressImages;
            let assets: FileAsset[] = [];
            for (const name in result) {
                assets = assets.concat(name === 'image' ? getImageAssets(outputDirectory, result[name], compressImages) : getFileAssets(outputDirectory, result[name]));
            }
            options.assets = assets.concat(options.assets || []);
            if (directory) {
                this.copying(options);
            }
            if (filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    public resourceStringToXml(options: FileOutputOptions = {}): string[] {
        const item: ObjectMap<ItemValue[]> = { string: [] };
        const itemArray = item.string;
        if (!STORED.strings.has('app_name')) {
            itemArray.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(STORED.strings.entries()).sort(caseInsensitive)) {
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

    public resourceStringArrayToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.arrays.size) {
            const item: ObjectMap<any[]> = { 'string-array': [] };
            const itemArray = item['string-array'];
            for (const [name, values] of Array.from(STORED.arrays.entries()).sort()) {
                itemArray.push({
                    name,
                    item: objectMap(values, innerText => ({ innerText }))
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

    public resourceFontToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.fonts.size) {
            const resource = this.resource;
            const { insertSpaces, targetAPI } = this.userSettings;
            const xmlns = targetAPI < BUILD_ANDROID.OREO ? XMLNS_ANDROID.app : XMLNS_ANDROID.android;
            const pathname = this.directory.font;
            const result: string[] = [];
            for (const [name, font] of Array.from(STORED.fonts.entries()).sort()) {
                const item: StandardMap = { 'xmlns:android': xmlns, font: [] };
                const itemArray = <StringMap[]> item.font;
                for (const attr in font) {
                    const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                    let fontName = name;
                    if (fontStyle === 'normal') {
                        fontName += fontWeight === '400' ? '_normal' : '_' + font[attr];
                    }
                    else {
                        fontName += '_' + fontStyle;
                        if (fontWeight !== '400') {
                            fontName += '_' + font[attr];
                        }
                    }
                    itemArray.push({
                        font: `@font/${fontName}`,
                        fontStyle,
                        fontWeight
                    });
                    const uri = resource.getFont(fontFamily, fontStyle, fontWeight)?.srcUrl;
                    if (uri) {
                        this.addAsset({
                            pathname,
                            filename: fontName + '.' + fromLastIndexOf(uri.split('?')[0], '.').toLowerCase(),
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

    public resourceColorToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.colors.size) {
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

    public resourceStyleToXml(options: FileOutputOptions = {}): string[] {
        const result: string[] = [];
        if (STORED.styles.size) {
            const item: ObjectMap<any[]> = { style: [] };
            const itemArray = item.style;
            for (const style of Array.from(STORED.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                const styleArray = style.items;
                if (Array.isArray(styleArray)) {
                    const itemStyle: ItemValue[] = [];
                    for (const obj of styleArray.sort((a, b) => a.key >= b.key ? 1 : -1)) {
                        itemStyle.push({ name: obj.key, innerText: obj.value });
                    }
                    itemArray.push({
                        name: style.name,
                        parent: style.parent,
                        item: itemStyle
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
        if (STORED.themes.size) {
            const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of STORED.themes.entries()) {
                const match = REGEX_FILENAME.exec(filename);
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
                    result.push(
                        replaceTab(
                            replaceThemeLength(
                                applyTemplate('resources', STYLE_TMPL, [item]),
                                convertPixels
                            ),
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

    public resourceDimenToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.dimens.size) {
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

    public resourceDrawableToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.drawables.size) {
            const { convertPixels, insertSpaces } = this.userSettings;
            const directory = this.directory.image;
            const result: string[] = [];
            for (const [name, value] of STORED.drawables.entries()) {
                result.push(
                    replaceTab(
                        replaceDrawableLength(value, convertPixels),
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

    public resourceDrawableImageToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.images.size) {
            const { directory, filename } = options;
            const imageDirectory = this.directory.image;
            const result: string[] = [];
            for (const [name, images] of STORED.images.entries()) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi];
                        result.push(
                            value,
                            `${imageDirectory}-${dpi}`,
                            name + '.' + fromLastIndexOf(value, '.')
                        );
                    }
                }
                else {
                    const mdpi = images.mdpi;
                    if (mdpi) {
                        result.push(
                            mdpi,
                            imageDirectory,
                            name + '.' + fromLastIndexOf(mdpi, '.')
                        );
                    }
                }
            }
            if (directory || filename) {
                options.assets = getImageAssets(getOutputDirectory(this.userSettings.outputDirectory), result, this.userSettings.compressImages).concat(options.assets || []);
                if (directory) {
                    this.copying(options);
                }
                if (filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        return [];
    }

    public resourceAnimToXml(options: FileOutputOptions = {}): string[] {
        if (STORED.animators.size) {
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

    public layoutAllToXml(layouts: FileAsset[], options: FileOutputOptions = {}) {
        const { directory, filename } = options;
        const actionable = directory || filename;
        const result = {};
        const assets: FileAsset[] = [];
        const length = layouts.length;
        for (let i = 0; i < length; i++) {
            const { content, filename: filenameA, pathname } = layouts[i];
            result[filenameA] = [content];
            if (actionable) {
                assets.push(createFileAsset(pathname, i === 0 ? this.userSettings.outputMainFileName : `${filenameA}.xml`, content));
            }
        }
        if (actionable) {
            options.assets = options.assets ? assets.concat(options.assets) : assets;
            if (directory) {
                this.copying(options);
            }
            if (filename) {
                this.archiving(options);
            }
        }
        return result;
    }

    protected getAssetsAll(assets?: FileAsset[]) {
        let result: FileAsset[] = [];
        if (assets) {
            const length = assets.length;
            for (let i = 0, j = 0; i < length; i++) {
                const item = assets[i];
                if (!item.uri) {
                    if (j === 0) {
                        item.filename = this.userSettings.outputMainFileName;
                        j++;
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
        const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
        return result.concat(
            getFileAssets(outputDirectory, this.resourceStringToXml()),
            getFileAssets(outputDirectory, this.resourceStringArrayToXml()),
            getFileAssets(outputDirectory, this.resourceFontToXml()),
            getFileAssets(outputDirectory, this.resourceColorToXml()),
            getFileAssets(outputDirectory, this.resourceDimenToXml()),
            getFileAssets(outputDirectory, this.resourceStyleToXml()),
            getFileAssets(outputDirectory, this.resourceDrawableToXml()),
            getImageAssets(outputDirectory, this.resourceDrawableImageToXml(), this.userSettings.compressImages),
            getFileAssets(outputDirectory, this.resourceAnimToXml())
        );
    }

    protected checkFileAssets(content: string[], options: FileOutputOptions) {
        const { directory, filename } = options;
        if (directory || filename) {
            options.assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content).concat(options.assets || []);
            if (directory) {
                this.copying(options);
            }
            if (filename) {
                this.archiving(options);
            }
        }
        return content;
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}