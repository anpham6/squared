import { FileAsset, SessionData, TemplateDataA } from '../../src/base/@types/application';
import { ResourceStoredMapAndroid, UserSettingsAndroid } from './@types/application';

import { BUILD_ANDROID } from './lib/enumeration';

import COLOR_TMPL from './template/resource/color';
import DIMEN_TMPL from './template/resource/dimen';
import DRAWABLE_TMPL from './template/resource/drawable';
import FONT_TMPL from './template/resource/font';
import STRING_TMPL from './template/resource/string';
import STRINGARRAY_TMPL from './template/resource/string-array';
import STYLE_TMPL from './template/resource/style';

import View from './view';

import { getXmlNs, replaceTab, replaceUnit } from './lib/util';

import $NodeList = squared.base.NodeList;

const $util = squared.lib.util;
const $xml = squared.lib.xml;

function parseImageDetails(files: string[]) {
    const result: FileAsset[] = [];
    const pattern = /^<!-- image: (.+) -->\n<!-- filename: (.+)\/(.*?\.\w+) -->$/;
    for (const xml of files) {
        const match = pattern.exec(xml);
        if (match) {
            result.push({
                uri: match[1],
                pathname: match[2],
                filename: match[3],
                content: ''
            });
        }
    }
    return result;
}

function parseFileDetails(files: string[]) {
    const result: FileAsset[] = [];
    const pattern = /^<\?xml[\w\W]*?(<!-- filename: (.+)\/(.*?\.xml) -->)$/;
    for (const xml of files) {
        const match = pattern.exec(xml);
        if (match) {
            result.push({
                content: match[0].replace(match[1], '').trim(),
                pathname: match[2],
                filename: match[3]
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

function caseInsensitive(a: string | string[], b: string | string[]) {
    return a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;
}

export default class File<T extends View> extends squared.base.File<T> implements android.base.File<T> {
    public saveAllToDisk(data: SessionData<$NodeList<T>>) {
        const files: FileAsset[] = [];
        const views = [...data.views, ...data.includes];
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
        }
        files.push(...parseFileDetails(this.resourceStringToXml()));
        files.push(...parseFileDetails(this.resourceStringArrayToXml()));
        files.push(...parseFileDetails(this.resourceFontToXml()));
        files.push(...parseFileDetails(this.resourceColorToXml()));
        files.push(...parseFileDetails(this.resourceStyleToXml()));
        files.push(...parseFileDetails(this.resourceDimenToXml()));
        files.push(...parseFileDetails(this.resourceDrawableToXml()));
        files.push(...parseImageDetails(this.resourceDrawableImageToXml()));
        files.push(...parseFileDetails(this.resourceAnimatorToXml()));
        this.saveToDisk(files);
    }

    public layoutAllToXml(data: SessionData<$NodeList<T>>, saveToDisk = false) {
        const result = {};
        const files: FileAsset[] = [];
        const views = [...data.views, ...data.includes];
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            result[view.filename] = [view.content];
            if (saveToDisk) {
                files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
            }
        }
        if (saveToDisk) {
            this.saveToDisk(files);
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
            image: this.resourceDrawableImageToXml(),
            animator: this.resourceAnimatorToXml()
        };
        for (const resource in result) {
            if (result[resource].length === 0) {
                delete result[resource];
            }
        }
        if (saveToDisk) {
            const files: FileAsset[] = [];
            for (const resource in result) {
                if (resource === 'image') {
                    files.push(...parseImageDetails(result[resource]));
                }
                else {
                    files.push(...parseFileDetails(result[resource]));
                }
            }
            this.saveToDisk(files);
        }
        return result;
    }

    public resourceStringToXml(saveToDisk = false) {
        const result: string[] = [];
        const data: TemplateDataA = { A: [] };
        this.stored.strings = new Map([...this.stored.strings.entries()].sort(caseInsensitive));
        if (this.appName !== '' && !this.stored.strings.has('app_name')) {
            data.A.push({
                name: 'app_name',
                value: this.appName
            });
        }
        for (const [name, value] of this.stored.strings.entries()) {
            data.A.push({
                name,
                value
            });
        }
        let xml = $xml.createTemplate($xml.parseTemplate(STRING_TMPL), data);
        xml = replaceTab(xml, this.userSettings.insertSpaces, true);
        result.push(xml);
        if (saveToDisk) {
            this.saveToDisk(parseFileDetails(result));
        }
        return result;
    }

    public resourceStringArrayToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.arrays.size) {
            const data: TemplateDataA = { A: [] };
            this.stored.arrays = new Map([...this.stored.arrays.entries()].sort());
            for (const [name, values] of this.stored.arrays.entries()) {
                data.A.push({
                    name,
                    AA: values.map(value => ({ value }))
                });
            }
            let xml = $xml.createTemplate($xml.parseTemplate(STRINGARRAY_TMPL), data);
            xml = replaceTab(xml, this.userSettings.insertSpaces, true);
            result.push(xml);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceFontToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.fonts.size) {
            const settings = this.userSettings;
            this.stored.fonts = new Map([...this.stored.fonts.entries()].sort());
            const namespace = settings.targetAPI < BUILD_ANDROID.OREO ? 'app' : 'android';
            for (const [name, font] of this.stored.fonts.entries()) {
                const data: TemplateDataA = {
                    name,
                    namespace: getXmlNs(namespace),
                    A: []
                };
                let xml = '';
                for (const attr in font) {
                    const [style, weight] = attr.split('-');
                    data.A.push({
                        style,
                        weight,
                        font: `@font/${name + (style === 'normal' && weight === 'normal' ? `_${style}` : (style !== 'normal' ? `_${style}` : '') + (weight !== 'normal' ? `_${weight}` : ''))}`
                    });
                }
                xml += $xml.createTemplate($xml.parseTemplate(FONT_TMPL), data);
                if (settings.targetAPI < BUILD_ANDROID.OREO) {
                    xml = xml.replace(/android/g, 'app');
                }
                xml = replaceTab(xml, settings.insertSpaces);
                result.push(xml);
            }
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceColorToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.colors.size) {
            const data: TemplateDataA = { A: [] };
            this.stored.colors = new Map([...this.stored.colors.entries()].sort());
            for (const [name, value] of this.stored.colors.entries()) {
                data.A.push({
                    name,
                    value
                });
            }
            let xml = $xml.createTemplate($xml.parseTemplate(COLOR_TMPL), data);
            xml = replaceTab(xml, this.userSettings.insertSpaces);
            result.push(xml);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceStyleToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.styles.size) {
            const settings = this.userSettings;
            const template = $xml.parseTemplate(STYLE_TMPL);
            const files: { filename: string, data: TemplateDataA}[] = [];
            {
                const styles = Array.from(this.stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1);
                const data: TemplateDataA = { A: [] };
                for (const style of styles) {
                    if (Array.isArray(style.items)) {
                        style.items.sort((a, b) => a.name >= b.name ? 1 : -1);
                        data.A.push(style.items as ExternalData);
                    }
                }
                files.push({ filename: 'res/values/styles.xml', data });
            }
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of this.stored.themes.entries()) {
                const data: TemplateDataA = { A: [] };
                const filepath = filename.substring(0, filename.lastIndexOf('/'));
                for (const [themeName, themeData] of theme.entries()) {
                    const items: StringMap[] = [];
                    for (const name in themeData.items) {
                        items.push({
                            name,
                            value: themeData.items[name]
                        });
                    }
                    if (!appTheme[filepath] || themeName !== 'AppTheme' || items.length > 0) {
                        data.A.push({
                            name: themeName,
                            parent: themeData.parent,
                            items
                        });
                    }
                    if (themeName === 'AppTheme') {
                        appTheme[filepath] = true;
                    }
                }
                files.push({ filename, data });
            }
            for (const style of files) {
                let xml = $xml.createTemplate(template, style.data);
                xml = replaceUnit(xml.trim(), settings.resolutionDPI, settings.convertPixels, true);
                xml = replaceTab(xml, settings.insertSpaces);
                xml = xml.replace('filename: {0}', `filename: ${style.filename}`);
                result.push(xml);
            }
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceDimenToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.dimens.size) {
            const settings = this.userSettings;
            const data: TemplateDataA = { A: [] };
            this.stored.dimens = new Map([...this.stored.dimens.entries()].sort());
            for (const [name, value] of this.stored.dimens.entries()) {
                data.A.push({
                    name,
                    value
                });
            }
            let xml = $xml.createTemplate($xml.parseTemplate(DIMEN_TMPL), data);
            xml = replaceUnit(xml.trim(), settings.resolutionDPI, settings.convertPixels);
            xml = replaceTab(xml, settings.insertSpaces);
            result.push(xml);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceDrawableToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.drawables.size) {
            const settings = this.userSettings;
            const template = $xml.parseTemplate(DRAWABLE_TMPL);
            for (const [name, value] of this.stored.drawables.entries()) {
                let xml = $xml.createTemplate(template, {
                    name: `res/drawable/${name}.xml`,
                    value
                });
                xml = replaceUnit(xml, settings.resolutionDPI, settings.convertPixels);
                xml = replaceTab(xml, settings.insertSpaces);
                result.push(xml);
            }
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    public resourceDrawableImageToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.images.size) {
            const settings = this.userSettings;
            const template = $xml.parseTemplate(DRAWABLE_TMPL);
            for (const [name, images] of this.stored.images.entries()) {
                let xml = '';
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        xml = $xml.createTemplate(template, {
                            name: `res/drawable-${dpi}/${name}.${$util.lastIndexOf(images[dpi], '.')}`,
                            value: `<!-- image: ${images[dpi]} -->`
                        });
                    }
                }
                else if (images.mdpi) {
                    xml = $xml.createTemplate(template, {
                        name: `res/drawable/${name}.${$util.lastIndexOf(images.mdpi, '.')}`,
                        value: `<!-- image: ${images.mdpi} -->`
                    });
                }
                if (xml !== '') {
                    xml = replaceTab(xml, settings.insertSpaces);
                    result.push(xml);
                }
            }
            if (saveToDisk) {
                this.saveToDisk(parseImageDetails(result));
            }
        }
        return result;
    }

    public resourceAnimatorToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.animators.size) {
            const template = $xml.parseTemplate(DRAWABLE_TMPL);
            for (const [name, value] of this.stored.animators.entries()) {
                let xml = $xml.createTemplate(template, {
                    name: `res/animator/${name}.xml`,
                    value
                });
                xml = replaceTab(xml, this.userSettings.insertSpaces);
                result.push(xml);
            }
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
        }
        return result;
    }

    get userSettings() {
        return this.resource.userSettings as UserSettingsAndroid;
    }

    get stored() {
        return this.resource.stored as ResourceStoredMapAndroid;
    }
}