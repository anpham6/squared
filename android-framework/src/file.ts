import { FileAsset } from '../../src/base/@types/application';
import { ResourceStoredMapAndroid, UserSettingsAndroid } from './@types/application';

import View from './view';

import { STRING_ANDROID, XMLNS_ANDROID } from './lib/constant';
import { BUILD_ANDROID } from './lib/enumeration';

import COLOR_TMPL from './template/resources/color';
import DIMEN_TMPL from './template/resources/dimen';
import FONTFAMILY_TMPL from './template/font-family';
import STRING_TMPL from './template/resources/string';
import STRINGARRAY_TMPL from './template/resources/string-array';
import STYLE_TMPL from './template/resources/style';

type StyleXML = {
    data: ExternalData[];
    pathname: string;
    filename: string;
};

type ItemValue = {
    name: string;
    innerText: string;
};

const $math = squared.lib.math;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const REGEXP_UNIT = /([">])(-?[\d.]+)px(["<])/g;
const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;

function getFileAssets(items: string[]) {
    const result: FileAsset[] = [];
    for (let i = 0; i < items.length; i += 3) {
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
    for (let i = 0; i < items.length; i += 3) {
        result.push({
            pathname: items[i + 1],
            filename: items[i + 2],
            content: '',
            uri: items[i]
        });
    }
    return result;
}

function convertLength(value: string, dpi = 160, font = false, precision = 3) {
    let result = parseFloat(value);
    if (!isNaN(result)) {
        if (dpi !== 160) {
            result /= dpi / 160;
            return (result !== 0 && result > -1 && result < 1 ? result.toPrecision(precision)  : $math.truncate(result, precision - 1)) + (font ? 'sp' : 'dp');
        }
        else {
            return Math.round(result) + (font ? 'sp' : 'dp');
        }
    }
    return '0dp';
}

function replaceLength(value: string, dpi = 160, format = 'dp', font = false, precision = 3) {
    if (format === 'dp') {
        return value.replace(REGEXP_UNIT, (match, ...capture) => capture[0] + convertLength(capture[1], dpi, font, precision) + capture[2]);
    }
    return value;
}

const createFileAsset = (pathname: string, filename: string, content: string): FileAsset => ({ pathname, filename, content });

const caseInsensitive = (a: string | string[], b: string | string[]) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public saveAllToDisk(layouts: FileAsset[]) {
        const files: FileAsset[] = [];
        for (let i = 0; i < layouts.length; i++) {
            files.push(createFileAsset(layouts[i].pathname, i === 0 ? this.userSettings.outputMainFileName : `${layouts[i].filename}.xml`, layouts[i].content));
        }
        this.saveToDisk(
            $util.concatMultiArray(
                files,
                getFileAssets(this.resourceStringToXml()),
                getFileAssets(this.resourceStringArrayToXml()),
                getFileAssets(this.resourceFontToXml()),
                getFileAssets(this.resourceColorToXml()),
                getFileAssets(this.resourceDimenToXml()),
                getFileAssets(this.resourceStyleToXml()),
                getFileAssets(this.resourceDrawableToXml()),
                getImageAssets(this.resourceDrawableImageToXml()),
                getFileAssets(this.resourceAnimToXml())
            ),
            this.userSettings.manifestLabelAppName
        );
    }

    public layoutAllToXml(layouts: FileAsset[], saveToDisk = false) {
        const result = {};
        const files: FileAsset[] = [];
        for (let i = 0; i < layouts.length; i++) {
            const layout = layouts[i];
            result[layout.filename] = [layout.content];
            if (saveToDisk) {
                files.push(createFileAsset(layout.pathname, i === 0 ? this.userSettings.outputMainFileName : `${layout.filename}.xml`, layout.content));
            }
        }
        if (saveToDisk) {
            this.saveToDisk(files, this.userSettings.manifestLabelAppName);
        }
        return result;
    }

    public resourceAllToXml(saveToDisk = false) {
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
        if (saveToDisk) {
            const files: FileAsset[] = [];
            for (const name in result) {
                if (name === 'image') {
                    $util.concatArray(files, getImageAssets(result[name]));
                }
                else {
                    $util.concatArray(files, getFileAssets(result[name]));
                }
            }
            this.saveToDisk(files, this.userSettings.manifestLabelAppName);
        }
        return result;
    }

    public resourceStringToXml(saveToDisk = false) {
        const result: string[] = [];
        const data: ExternalData[] = [{ string: [] }];
        if (!this.stored.strings.has('app_name')) {
            data[0].string.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
        }
        for (const [name, innerText] of Array.from(this.stored.strings.entries()).sort(caseInsensitive)) {
            data[0].string.push(<ItemValue> { name, innerText });
        }
        result.push(
            $xml.replaceTab(
                $xml.applyTemplate('resources', STRING_TMPL, data),
                this.userSettings.insertSpaces
            ),
            'res/values',
            'strings.xml'
        );
        if (saveToDisk) {
            this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
        }
        return result;
    }

    public resourceStringArrayToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.arrays.size) {
            const data: ExternalData[] = [{ 'string-array': [] }];
            for (const [name, values] of Array.from(this.stored.arrays.entries()).sort()) {
                data[0]['string-array'].push({
                    name,
                    item: $util.objectMap<string, {}>(values, innerText => ({ innerText }))
                });
            }
            result.push(
                $xml.replaceTab(
                    $xml.applyTemplate('resources', STRINGARRAY_TMPL, data),
                    this.userSettings.insertSpaces
                ),
                'res/values',
                'string_arrays.xml'
            );
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceFontToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.fonts.size) {
            const settings = this.userSettings;
            const xmlns = XMLNS_ANDROID[settings.targetAPI < BUILD_ANDROID.OREO ? STRING_ANDROID.APP : STRING_ANDROID.ANDROID];
            const pathname = this.resource.application.controllerHandler.localSettings.directory.font;
            for (const [name, font] of Array.from(this.stored.fonts.entries()).sort()) {
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
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), settings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceColorToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.colors.size) {
            const data: ExternalData[] = [{ color: [] }];
            for (const [innerText, name] of Array.from(this.stored.colors.entries()).sort()) {
                data[0].color.push(<ItemValue> { name, innerText });
            }
            result.push(
                $xml.replaceTab(
                    $xml.applyTemplate('resources', COLOR_TMPL, data),
                    this.userSettings.insertSpaces
                ),
                'res/values',
                'colors.xml'
            );
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceStyleToXml(saveToDisk = false) {
        const settings = this.userSettings;
        const result: string[] = [];
        const files: StyleXML[] = [];
        if (this.stored.styles.size) {
            const data: ExternalData[] = [{ style: [] }];
            for (const style of Array.from(this.stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
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
            files.push({ data, pathname: 'res/values', filename: 'styles.xml' });
        }
        if (this.stored.themes.size) {
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of this.stored.themes.entries()) {
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
                    files.push({ data, pathname: match[1], filename: match[2] });
                }
            }
        }
        for (const style of files) {
            result.push(
                $xml.replaceTab(
                    replaceLength(
                        $xml.applyTemplate('resources', STYLE_TMPL, style.data),
                        settings.resolutionDPI,
                        settings.convertPixels,
                        true
                    ),
                    settings.insertSpaces
                ),
                style.pathname,
                style.filename
            );
        }
        if (saveToDisk) {
            this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
        }
        return result;
    }

    public resourceDimenToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.dimens.size) {
            const data: ExternalData[] = [{ dimen: [] }];
            const settings = this.userSettings;
            for (const [name, innerText] of Array.from(this.stored.dimens.entries()).sort()) {
                data[0].dimen.push({ name, innerText });
            }
            result.push(
                $xml.replaceTab(
                    replaceLength(
                        $xml.applyTemplate('resources', DIMEN_TMPL, data),
                        settings.resolutionDPI,
                        settings.convertPixels
                    ),
                    settings.insertSpaces
                ),
                'res/values',
                'dimens.xml'
            );
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), settings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceDrawableToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.drawables.size) {
            const settings = this.userSettings;
            for (const [name, value] of this.stored.drawables.entries()) {
                result.push(
                    $xml.replaceTab(
                        replaceLength(
                            value,
                            settings.resolutionDPI,
                            settings.convertPixels
                        ),
                        settings.insertSpaces
                    ),
                    'res/drawable',
                    `${name}.xml`
                );
            }
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), settings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceDrawableImageToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.images.size) {
            for (const [name, images] of this.stored.images.entries()) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        result.push(
                            images[dpi],
                            `res/drawable-${dpi}`,
                            `${name}.${$util.fromLastIndexOf(images[dpi], '.')}`
                        );
                    }
                }
                else if (images.mdpi) {
                    result.push(
                        images.mdpi,
                        'res/drawable',
                        `${name}.${$util.fromLastIndexOf(images.mdpi, '.')}`
                    );
                }
            }
            if (saveToDisk) {
                this.saveToDisk(getImageAssets(result), this.userSettings.manifestLabelAppName);
            }
        }
        return result;
    }

    public resourceAnimToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.animators.size) {
            const settings = this.userSettings;
            for (const [name, value] of this.stored.animators.entries()) {
                result.push(
                    $xml.replaceTab(value, settings.insertSpaces),
                    'res/anim',
                    `${name}.xml`
                );
            }
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), settings.manifestLabelAppName);
            }
        }
        return result;
    }

    get userSettings() {
        return <UserSettingsAndroid> this.resource.userSettings;
    }

    get stored() {
        return <ResourceStoredMapAndroid> this.resource.stored;
    }
}