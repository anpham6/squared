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

type ItemValue = {
    name: string;
    innerText: string;
};

const {
    util: $util,
    xml: $xml
} = squared.lib;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;
const REGEXP_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
const REGEXP_THEME_UNIT = />(-?[\d.]+)px</g;

function getFileAssets(items: string[]) {
    const result: FileAsset[] = [];
    const length = items.length;
    for (let i = 0; i < length; i += 3) {
        result.push({
            pathname: items[i + 1],
            filename: items[i + 2],
            content: items[i]
        });
    }
    return result;
}

function getImageAssets(items: string[]) {
    const result: FileAsset[] = [];
    const length = items.length;
    for (let i = 0; i < length; i += 3) {
        result.push({
            pathname: items[i + 1],
            filename: items[i + 2],
            content: '',
            uri: items[i]
        });
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
                if (name === 'image') {
                    assets = assets.concat(getImageAssets(result[name]));
                }
                else {
                    assets = assets.concat(getFileAssets(result[name]));
                }
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
        const result: string[] = [];
        const data: ExternalData[] = [{ string: [] }];
        if (!STORED.strings.has('app_name')) {
            data[0].string.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(STORED.strings.entries()).sort(caseInsensitive)) {
            data[0].string.push(<ItemValue> { name, innerText });
        }
        result.push(
            $xml.replaceTab(
                $xml.applyTemplate('resources', STRING_TMPL, data),
                this.userSettings.insertSpaces,
                true
            ),
            this.directory.string,
            'strings.xml'
        );
        this.checkFileAssets(result, options);
        return result;
    }

    public resourceStringArrayToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.arrays.size) {
            const data: ExternalData[] = [{ 'string-array': [] }];
            for (const [name, values] of Array.from(STORED.arrays.entries()).sort()) {
                data[0]['string-array'].push({
                    name,
                    item: $util.objectMap<string, {}>(values, innerText => ({ innerText }))
                });
            }
            result.push(
                $xml.replaceTab(
                    $xml.applyTemplate('resources', STRINGARRAY_TMPL, data),
                    this.userSettings.insertSpaces,
                    true
                ),
                this.directory.string,
                'string_arrays.xml'
            );
            this.checkFileAssets(result, options);
        }
        return result;
    }

    public resourceFontToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.fonts.size) {
            const settings = this.userSettings;
            const xmlns = XMLNS_ANDROID[settings.targetAPI < BUILD_ANDROID.OREO ? 'app' : 'android'];
            const pathname = this.directory.font;
            for (const [name, font] of Array.from(STORED.fonts.entries()).sort()) {
                const data: ExternalData[] = [{
                    'xmlns:android': xmlns,
                    font: []
                }];
                for (const attr in font) {
                    const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                    let fontName = name;
                    if (fontStyle === 'normal') {
                        fontName += fontWeight === '400' ? '_normal' : `_${font[attr]}`;
                    }
                    else {
                        fontName += `_${fontStyle}`;
                        if (fontWeight !== '400') {
                            fontName += `_${font[attr]}`;
                        }
                    }
                    data[0].font.push({
                        font: `@font/${fontName}`,
                        fontStyle,
                        fontWeight
                    });
                    const src = this.resource.getFont(fontFamily, fontStyle, fontWeight);
                    if (src && src.srcUrl) {
                        this.addAsset({
                            pathname,
                            filename: fontName + '.' + $util.fromLastIndexOf(src.srcUrl, '.').toLowerCase(),
                            uri: src.srcUrl
                        });
                    }
                }
                let output = $xml.replaceTab(
                    $xml.applyTemplate('font-family', FONTFAMILY_TMPL, data),
                    settings.insertSpaces
                );
                if (settings.targetAPI < BUILD_ANDROID.OREO) {
                    output = output.replace(/\s+android:/g, ' app:');
                }
                result.push(output, pathname, `${name}.xml`);
            }
            this.checkFileAssets(result, options);
        }
        return result;
    }

    public resourceColorToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.colors.size) {
            const data: ExternalData[] = [{ color: [] }];
            for (const [innerText, name] of Array.from(STORED.colors.entries()).sort()) {
                data[0].color.push(<ItemValue> { name, innerText });
            }
            result.push(
                $xml.replaceTab(
                    $xml.applyTemplate('resources', COLOR_TMPL, data),
                    this.userSettings.insertSpaces
                ),
                this.directory.string,
                'colors.xml'
            );
            this.checkFileAssets(result, options);
        }
        return result;
    }

    public resourceStyleToXml(options: FileOutputOptions = {}) {
        const settings = this.userSettings;
        const result: string[] = [];
        if (STORED.styles.size) {
            const data: ExternalData[] = [{ style: [] }];
            for (const style of Array.from(STORED.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                if (Array.isArray(style.items)) {
                    const item: ItemValue[] = [];
                    for (const obj of style.items.sort((a, b) => a.key >= b.key ? 1 : -1)) {
                        item.push({ name: obj.key, innerText: obj.value });
                    }
                    data[0].style.push({
                        name: style.name,
                        parent: style.parent,
                        item
                    });
                }
            }
            result.push(
                $xml.replaceTab(
                    $xml.applyTemplate('resources', STYLE_TMPL, data),
                    settings.insertSpaces
                ),
                this.directory.string,
                'styles.xml'
            );
        }
        if (STORED.themes.size) {
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of STORED.themes.entries()) {
                const data: ExternalData[] = [{ style: [] }];
                for (const [themeName, themeData] of theme.entries()) {
                    const item: ItemValue[] = [];
                    for (const name in themeData.items) {
                        item.push({ name, innerText: themeData.items[name] });
                    }
                    if (!appTheme[filename] || themeName !== settings.manifestThemeName || item.length) {
                        data[0].style.push({
                            name: themeName,
                            parent: themeData.parent,
                            item
                        });
                    }
                    if (themeName === settings.manifestThemeName) {
                        appTheme[filename] = true;
                    }
                }
                const match = REGEXP_FILENAME.exec(filename);
                if (match) {
                    result.push(
                        $xml.replaceTab(
                            replaceThemeLength(
                                $xml.applyTemplate('resources', STYLE_TMPL, data),
                                settings.resolutionDPI,
                                settings.convertPixels
                            ),
                            settings.insertSpaces
                        ),
                        match[1],
                        match[2]
                    );
                }
            }
        }
        this.checkFileAssets(result, options);
        return result;
    }

    public resourceDimenToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.dimens.size) {
            const data: ExternalData[] = [{ dimen: [] }];
            const settings = this.userSettings;
            const dpi = settings.resolutionDPI;
            const convertPixels = settings.convertPixels;
            for (const [name, value] of Array.from(STORED.dimens.entries()).sort()) {
                data[0].dimen.push({ name, innerText: convertPixels ? convertLength(value, dpi, false) : value });
            }
            result.push(
                $xml.replaceTab($xml.applyTemplate('resources', DIMEN_TMPL, data)),
                this.directory.string,
                'dimens.xml'
            );
            this.checkFileAssets(result, options);
        }
        return result;
    }

    public resourceDrawableToXml(options: FileOutputOptions = {}) {
        const result: string[] = [];
        if (STORED.drawables.size) {
            const settings = this.userSettings;
            const directory = this.directory.image;
            for (const [name, value] of STORED.drawables.entries()) {
                result.push(
                    $xml.replaceTab(
                        replaceDrawableLength(
                            value,
                            settings.resolutionDPI,
                            settings.convertPixels
                        ),
                        settings.insertSpaces
                    ),
                    directory,
                    `${name}.xml`
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
                        result.push(
                            images[dpi],
                            `${directory}-${dpi}`,
                            `${name}.${$util.fromLastIndexOf(images[dpi], '.')}`
                        );
                    }
                }
                else if (images.mdpi) {
                    result.push(
                        images.mdpi,
                        directory,
                        `${name}.${$util.fromLastIndexOf(images.mdpi, '.')}`
                    );
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
        const result: string[] = [];
        if (STORED.animators.size) {
            const settings = this.userSettings;
            for (const [name, value] of STORED.animators.entries()) {
                result.push(
                    $xml.replaceTab(value, settings.insertSpaces),
                    'res/anim',
                    `${name}.xml`
                );
            }
            this.checkFileAssets(result, options);
        }
        return result;
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
                    layouts.push(createFileAsset(layout.pathname, i === 0 ? this.userSettings.outputMainFileName : `${layout.filename}.xml`, layout.content));
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
            result.push(createFileAsset(assets[i].pathname, i === 0 ? this.userSettings.outputMainFileName : `${assets[i].filename}.xml`, assets[i].content));
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
    }

    get userSettings() {
        return this.resource.userSettings;
    }
}