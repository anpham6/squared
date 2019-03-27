import { FileAsset, SessionData } from '../../src/base/@types/application';
import { ResourceStoredMapAndroid, UserSettingsAndroid } from './@types/application';

import View from './view';

import { XMLNS_ANDROID } from './lib/constant';
import { BUILD_ANDROID } from './lib/enumeration';
import { replaceLength } from './lib/util';

import COLOR_TMPL from './template/resources/color';
import DIMEN_TMPL from './template/resources/dimen';
import FONTFAMILY_TMPL from './template/font-family';
import STRING_TMPL from './template/resources/string';
import STRINGARRAY_TMPL from './template/resources/string-array';
import STYLE_TMPL from './template/resources/style';

import $NodeList = squared.base.NodeList;

type StyleXML = {
    data: ExternalData[];
    filename: string;
};

type ItemValue = {
    name: string;
    innerText: string;
};

const $util = squared.lib.util;
const $xml = squared.lib.xml;

const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;

function getFileAssets(items: string[]) {
    const result: FileAsset[] = [];
    for (let i = 0; i < items.length; i += 2) {
        const match = REGEXP_FILENAME.exec(items[i + 1]);
        if (match) {
            result.push({
                pathname: match[1],
                filename: match[2],
                content: items[i]
            });
        }
    }
    return result;
}

function getImageAssets(items: string[]) {
    const result: FileAsset[] = [];
    for (let i = 0; i < items.length; i += 2) {
        const match = REGEXP_FILENAME.exec(items[i + 1]);
        if (match) {
            result.push({
                uri: items[i],
                pathname: match[1],
                filename: match[2],
                content: ''
            });
        }
    }
    return result;
}

function createFileAsset(pathname: string, filename: string, content: string): FileAsset {
    return {
        pathname,
        filename,
        content
    };
}

const caseInsensitive = (a: string | string[], b: string | string[]) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public saveAllToDisk(data: SessionData<$NodeList<T>>) {
        const files: FileAsset[] = [];
        for (let i = 0; i < data.templates.length; i++) {
            const view = data.templates[i];
            files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
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

    public layoutAllToXml(data: SessionData<$NodeList<T>>, saveToDisk = false) {
        const result = {};
        const files: FileAsset[] = [];
        for (let i = 0; i < data.templates.length; i++) {
            const view = data.templates[i];
            result[view.filename] = [view.content];
            if (saveToDisk) {
                files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
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
            STRING_TMPL.filename
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
                STRINGARRAY_TMPL.filename
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
            const xmlns = XMLNS_ANDROID[settings.targetAPI < BUILD_ANDROID.OREO ? 'app' : 'android'];
            for (const [name, font] of Array.from(this.stored.fonts.entries()).sort()) {
                const data: ExternalData[] = [{
                    'xmlns:android': xmlns,
                    font: []
                }];
                for (const attr in font) {
                    const [fontStyle, fontWeight] = attr.split('-');
                    data[0].font.push({
                        fontStyle,
                        fontWeight,
                        font: `@font/${name + (fontStyle === 'normal' && fontWeight === 'normal' ? '' : (fontStyle !== 'normal' ? `_${fontStyle}` : '') + (fontWeight !== 'normal' ? `_${fontWeight}` : ''))}`
                    });
                }
                let output = $xml.replaceTab($xml.applyTemplate('font-family', FONTFAMILY_TMPL, data), this.userSettings.insertSpaces);
                if (settings.targetAPI < BUILD_ANDROID.OREO) {
                    output = output.replace(/\s+android:/g, ' app:');
                }
                result.push(output, `res/font/${name}.xml`);
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
                COLOR_TMPL.filename
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
                    for (const obj of style.items.sort((a, b) => a.name >= b.name ? 1 : -1)) {
                        item.push({ name: obj.name, innerText: obj.value });
                    }
                    data[0].style.push({
                        name: style.name,
                        parent: style.parent,
                        item
                    });
                }
            }
            files.push({ data, filename: STYLE_TMPL.filename });
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
                files.push({ data, filename });
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
            for (const [name, innerText] of Array.from(this.stored.dimens.entries()).sort()) {
                data[0].dimen.push({
                    name,
                    innerText
                });
            }
            result.push(
                $xml.replaceTab(
                    replaceLength(
                        $xml.applyTemplate('resources', DIMEN_TMPL, data),
                        this.userSettings.resolutionDPI,
                        this.userSettings.convertPixels
                    ),
                    this.userSettings.insertSpaces
                ),
                DIMEN_TMPL.filename
            );
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
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
                        replaceLength(value, settings.resolutionDPI, settings.convertPixels),
                        settings.insertSpaces
                    ),
                    `res/drawable/${name}.xml`
                );
            }
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
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
                            `res/drawable-${dpi}/${name}.${$util.fromLastIndexOf(images[dpi], '.')}`
                        );
                    }
                }
                else if (images.mdpi) {
                    result.push(
                        images.mdpi,
                        `res/drawable/${name}.${$util.fromLastIndexOf(images.mdpi, '.')}`
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
            for (const [name, value] of this.stored.animators.entries()) {
                result.push(
                    $xml.replaceTab(value, this.userSettings.insertSpaces),
                    `res/anim/${name}.xml`
                );
            }
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
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