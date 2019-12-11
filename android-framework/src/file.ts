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
const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;
const REGEXP_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
const REGEXP_THEME_UNIT = />(-?[\d.]+)px</g;

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
            filename: items[i + 2],
            content: '',
            uri: items[i]
        };
    }
    return result;
}

const createFileAsset = (pathname: string, filename: string, content: string): FileAsset => ({ pathname, filename, content });

const replaceDrawableLength = (value: string, dpi: number, format: string) => format === 'dp' ? value.replace(REGEXP_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], dpi, false) + '"') : value;

const replaceThemeLength = (value: string, dpi: number, format: string) => format === 'dp' ? value.replace(REGEXP_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], dpi, false) + '<') : value;

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
        if (!STORED.strings.has('app_name')) {
            item.string.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(STORED.strings.entries()).sort(caseInsensitive)) {
            item.string.push(<ItemValue> { name, innerText });
        }
        const result = [
            replaceTab(
                applyTemplate('resources', STRING_TMPL, [item]),
                this.userSettings.insertSpaces,
                true
            ),
            this.directory.string,
            'strings.xml'
        ];
        return this.checkFileAssets(result, options);
    }

    public resourceStringArrayToXml(options: FileOutputOptions = {}) {
        if (STORED.arrays.size) {
            const item: ObjectMap<any[]> = { 'string-array': [] };
            for (const [name, values] of Array.from(STORED.arrays.entries()).sort()) {
                item['string-array'].push({
                    name,
                    item: objectMap<string, {}>(values, innerText => ({ innerText }))
                });
            }
            const result = [
                replaceTab(
                    applyTemplate('resources', STRINGARRAY_TMPL, [item]),
                    this.userSettings.insertSpaces,
                    true
                ),
                this.directory.string,
                'string_arrays.xml'
            ];
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceFontToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        const fonts = Array.from(STORED.fonts.entries());
        if (fonts.length) {
            const resource = this.resource;
            const { insertSpaces, targetAPI } = this.userSettings;
            const xmlns = XMLNS_ANDROID[targetAPI < BUILD_ANDROID.OREO ? 'app' : 'android'];
            const pathname = this.directory.font;
            for (const [name, font] of fonts.sort()) {
                const item: ExternalData = {
                    'xmlns:android': xmlns,
                    font: []
                };
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
                    item.font.push({
                        font: '@font/' + fontName,
                        fontStyle,
                        fontWeight
                    });
                    const src = resource.getFont(fontFamily, fontStyle, fontWeight);
                    if (src?.srcUrl) {
                        this.addAsset({
                            pathname,
                            filename: fontName + '.' + fromLastIndexOf(src.srcUrl, '.').toLowerCase(),
                            uri: src.srcUrl
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
        }
        return result;
    }

    public resourceColorToXml(options: FileOutputOptions = {}) {
        if (STORED.colors.size) {
            const item: ObjectMap<ItemValue[]> = { color: [] };
            for (const [innerText, name] of Array.from(STORED.colors.entries()).sort()) {
                item.color.push(<ItemValue> { name, innerText });
            }
            const result = [
                replaceTab(
                    applyTemplate('resources', COLOR_TMPL, [item]),
                    this.userSettings.insertSpaces
                ),
                this.directory.string,
                'colors.xml'
            ];
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceStyleToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.styles.size) {
            const item: ObjectMap<any[]> = { style: [] };
            for (const style of Array.from(STORED.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                if (Array.isArray(style.items)) {
                    const styleItem: ItemValue[] = [];
                    for (const obj of style.items.sort((a, b) => a.key >= b.key ? 1 : -1)) {
                        styleItem.push({ name: obj.key, innerText: obj.value });
                    }
                    item.style.push({
                        name: style.name,
                        parent: style.parent,
                        item: styleItem
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
                const match = REGEXP_FILENAME.exec(filename);
                if (match) {
                    const item: ObjectMap<any[]> = { style: [] };
                    for (const [themeName, themeData] of theme.entries()) {
                        const themeItem: ItemValue[] = [];
                        const items = themeData.items;
                        for (const name in items) {
                            themeItem.push({ name, innerText: items[name] });
                        }
                        if (!appTheme[filename] || themeName !== manifestThemeName || item.length) {
                            item.style.push({
                                name: themeName,
                                parent: themeData.parent,
                                item: themeItem
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
            const item: ObjectMap<any[]> = { dimen: [] };
            const { convertPixels, resolutionDPI } = this.userSettings;
            for (const [name, value] of Array.from(STORED.dimens.entries()).sort()) {
                item.dimen.push({ name, innerText: convertPixels ? convertLength(value, resolutionDPI, false) : value });
            }
            const result = [
                replaceTab(applyTemplate('resources', DIMEN_TMPL, [item])),
                this.directory.string,
                'dimens.xml'
            ];
            return this.checkFileAssets(result, options);
        }
        return [];
    }

    public resourceDrawableToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.drawables.size) {
            const { convertPixels, insertSpaces, resolutionDPI } = this.userSettings;
            const directory = this.directory.image;
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
            this.checkFileAssets(result, options);
        }
        return result;
    }

    public resourceDrawableImageToXml({ copyTo, archiveTo, callback }: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.images.size) {
            const directory = this.directory.image;
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
        }
        return result;
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
                const layout = assets[i];
                result[layout.filename] = [layout.content];
                if (archiveTo) {
                    layouts.push(createFileAsset(layout.pathname, i === 0 ? this.userSettings.outputMainFileName : layout.filename + '.xml', layout.content));
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
            result.push(createFileAsset(assets[i].pathname, i === 0 ? this.userSettings.outputMainFileName : assets[i].filename + '.xml', assets[i].content));
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