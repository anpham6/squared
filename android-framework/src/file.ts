import { FileAsset } from '../../@types/base/application';
import { ResourceStoredMapAndroid } from '../../@types/android/application';
import { FileOutputOptions } from '../../@types/android/resource';

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

function getFileAssets(items: string[]) {
    const length = items.length;
    const result: FileAsset[] = new Array(length / 3);
    for (let i = 0, j = 0; i < length; i += 3, j++) {
        result[j] = {
            pathname: items[i + 1],
            filename: items[i + 2],
            content: items[i]
        };
    }
    return result;
}

function getImageAssets(items: string[]) {
    const length = items.length;
    const result: FileAsset[] = new Array(length / 3);
    for (let i = 0, j = 0; i < length; i += 3, j++) {
        result[j] = {
            pathname: items[i + 1],
            filename: items[i + 2].split('?')[0],
            content: '',
            uri: items[i]
        };
    }
    return result;
}

const createFileAsset = (pathname: string, filename: string, content: string): FileAsset => ({ pathname, filename, content });
const replaceDrawableLength = (value: string, dpi: number, format: string) => format === 'dp' ? value.replace(REGEX_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], dpi, false) + '"') : value;
const replaceThemeLength = (value: string, dpi: number, format: string) => format === 'dp' ? value.replace(REGEX_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], dpi, false) + '<') : value;
const caseInsensitive = (a: string | string[], b: string | string[]) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;

export default class File<T extends android.base.View> extends squared.base.FileUI<T> implements android.base.File<T> {
    public resource!: android.base.Resource<T>;

    public copyToDisk(directory: string, assets: FileAsset[], callback?: CallbackResult) {
        this.copying(directory, this.getAssetsAll(assets), callback);
    }

    public appendToArchive(pathname: string, assets: FileAsset[]) {
        this.archiving(this.userSettings.outputArchiveName, this.getAssetsAll(assets), pathname);
    }

    public saveToArchive(filename: string, assets: FileAsset[]) {
        this.archiving(filename, this.getAssetsAll(assets));
    }

    public resourceAllToXml({ copyTo, archiveTo, callback }: FileOutputOptions = {}) {
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
        if (copyTo || archiveTo) {
            let assets: FileAsset[] = [];
            for (const name in result) {
                assets = assets.concat(name === 'image' ? getImageAssets(result[name]) : getFileAssets(result[name]));
            }
            if (copyTo) {
                this.copying(copyTo, assets, callback);
            }
            if (archiveTo) {
                this.archiving(archiveTo, assets);
            }
        }
        return result;
    }

    public resourceStringToXml(options: FileOutputOptions = {}) {
        const item: ObjectMap<StringMap[]> = { string: [] };
        const itemArray = item.string;
        if (!STORED.strings.has('app_name')) {
            itemArray.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(STORED.strings.entries()).sort(caseInsensitive)) {
            itemArray.push(<ItemValue> { name, innerText });
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

    public resourceStringArrayToXml(options: FileOutputOptions = {}) {
        if (STORED.arrays.size) {
            const item: ObjectMap<any[]> = { 'string-array': [] };
            const itemArray = item['string-array'];
            for (const [name, values] of Array.from(STORED.arrays.entries()).sort()) {
                itemArray.push({
                    name,
                    item: objectMap<string, {}>(values, innerText => ({ innerText }))
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

    public resourceFontToXml(options: FileOutputOptions = {}) {
        if (STORED.fonts.size) {
            const resource = this.resource;
            const { insertSpaces, targetAPI } = this.userSettings;
            const xmlns = targetAPI < BUILD_ANDROID.OREO ? XMLNS_ANDROID.app : XMLNS_ANDROID.android;
            const pathname = this.directory.font;
            const result: string[] = [];
            for (const [name, font] of Array.from(STORED.fonts.entries()).sort()) {
                const item: ExternalData = {
                    'xmlns:android': xmlns,
                    font: []
                };
                const itemArray = item.font;
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
                        font: '@font/' + fontName,
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
                result.push(output, pathname, name + '.xml');
            }
            this.checkFileAssets(result, options);
            return result;
        }
        return [];
    }

    public resourceColorToXml(options: FileOutputOptions = {}) {
        if (STORED.colors.size) {
            const item: ObjectMap<ItemValue[]> = { color: [] };
            const itemArray = item.color;
            for (const [innerText, name] of Array.from(STORED.colors.entries()).sort()) {
                itemArray.push(<ItemValue> { name, innerText });
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

    public resourceStyleToXml(options: FileOutputOptions = {}) {
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
            const { convertPixels, insertSpaces, manifestThemeName, resolutionDPI } = this.userSettings;
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
                                resolutionDPI,
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

    public resourceDimenToXml(options: FileOutputOptions = {}) {
        if (STORED.dimens.size) {
            const { convertPixels, resolutionDPI } = this.userSettings;
            const item: ObjectMap<any[]> = { dimen: [] };
            const itemArray = item.dimen;
            for (const [name, value] of Array.from(STORED.dimens.entries()).sort()) {
                itemArray.push({ name, innerText: convertPixels ? convertLength(value, resolutionDPI, false) : value });
            }
            return this.checkFileAssets([
                replaceTab(applyTemplate('resources', DIMEN_TMPL, [item])),
                this.directory.string,
                'dimens.xml'
            ], options);
        }
        return [];
    }

    public resourceDrawableToXml(options: FileOutputOptions = {}) {
        if (STORED.drawables.size) {
            const { convertPixels, insertSpaces, resolutionDPI } = this.userSettings;
            const directory = this.directory.image;
            const result: string[] = [];
            for (const [name, value] of STORED.drawables.entries()) {
                result.push(
                    replaceTab(
                        replaceDrawableLength(
                            value,
                            resolutionDPI,
                            convertPixels
                        ),
                        insertSpaces
                    ),
                    directory,
                    name + '.xml'
                );
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceDrawableImageToXml({ copyTo, archiveTo, callback }: FileOutputOptions = {}) {
        if (STORED.images.size) {
            const directory = this.directory.image;
            const result: string[] = [];
            for (const [name, images] of STORED.images.entries()) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        const value = images[dpi];
                        result.push(
                            value,
                            directory + '-' + dpi,
                            name + '.' + fromLastIndexOf(value, '.')
                        );
                    }
                }
                else {
                    const mdpi = images.mdpi;
                    if (mdpi) {
                        result.push(
                            mdpi,
                            directory,
                            name + '.' + fromLastIndexOf(mdpi, '.')
                        );
                    }
                }
            }
            if (copyTo || archiveTo) {
                const assets = getImageAssets(result);
                if (copyTo) {
                    this.copying(copyTo, assets, callback);
                }
                if (archiveTo) {
                    this.archiving(archiveTo, assets);
                }
            }
            return result;
        }
        return [];
    }

    public resourceAnimToXml(options: FileOutputOptions = {}) {
        if (STORED.animators.size) {
            const insertSpaces = this.userSettings.insertSpaces;
            const result: string[] = [];
            for (const [name, value] of STORED.animators.entries()) {
                result.push(
                    replaceTab(value, insertSpaces),
                    'res/anim',
                    name + '.xml'
                );
            }
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public layoutAllToXml(options: FileOutputOptions = {}) {
        const { assets, copyTo, archiveTo, callback } = options;
        const result = {};
        if (assets) {
            const layouts: FileAsset[] = [];
            const length = assets.length;
            for (let i = 0; i < length; i++) {
                const { content, filename, pathname } = assets[i];
                result[filename] = [content];
                if (archiveTo) {
                    layouts.push(createFileAsset(pathname, i === 0 ? this.userSettings.outputMainFileName : filename + '.xml', content));
                }
            }
            if (copyTo) {
                this.copying(copyTo, layouts, callback);
            }
            if (archiveTo) {
                this.archiving(archiveTo, layouts);
            }
        }
        return result;
    }

    private getAssetsAll(assets: FileAsset[]) {
        const result: FileAsset[] = [];
        const length = assets.length;
        for (let i = 0; i < length; i++) {
            const item = assets[i];
            result.push(createFileAsset(item.pathname, i === 0 ? this.userSettings.outputMainFileName : item.filename + '.xml', item.content));
        }
        return result.concat(
            getFileAssets(this.resourceStringToXml()),
            getFileAssets(this.resourceStringArrayToXml()),
            getFileAssets(this.resourceFontToXml()),
            getFileAssets(this.resourceColorToXml()),
            getFileAssets(this.resourceDimenToXml()),
            getFileAssets(this.resourceStyleToXml()),
            getFileAssets(this.resourceDrawableToXml()),
            getImageAssets(this.resourceDrawableImageToXml()),
            getFileAssets(this.resourceAnimToXml())
        );
    }

    private checkFileAssets(content: string[], { copyTo, archiveTo, callback }: FileOutputOptions = {}) {
        if (copyTo || archiveTo) {
            const assets = getFileAssets(content);
            if (copyTo) {
                this.copying(copyTo, assets, callback);
            }
            if (archiveTo) {
                this.archiving(archiveTo, assets);
            }
        }
        return content;
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}