import { SessionData } from '../../src/base/types/application';
import { UserSettingsAndroid } from './types/application';

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
import $util = squared.lib.util;
import $xml = squared.lib.xml;

function parseImageDetails(xml: string) {
    const result: FileAsset[] = [];
    const pattern = /<!-- image: (.+) -->\n<!-- filename: (.+)\/(.*?\.\w+) -->/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(xml)) !== null) {
        result.push({
            uri: match[1],
            pathname: match[2],
            filename: match[3],
            content: ''
        });
    }
    return result;
}

function parseFileDetails(xml: string) {
    const result: FileAsset[] = [];
    const pattern = /<\?xml[\w\W]*?(<!-- filename: (.+)\/(.*?\.xml) -->)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(xml)) !== null) {
        result.push({
            content: match[0].replace(match[1], '').trim(),
            pathname: match[2],
            filename: match[3]
        });
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
        const xml = this.resourceDrawableToXml();
        files.push(...parseFileDetails(this.resourceStringToXml()));
        files.push(...parseFileDetails(this.resourceStringArrayToXml()));
        files.push(...parseFileDetails(this.resourceFontToXml()));
        files.push(...parseFileDetails(this.resourceColorToXml()));
        files.push(...parseFileDetails(this.resourceStyleToXml()));
        files.push(...parseFileDetails(this.resourceDimenToXml()));
        files.push(...parseImageDetails(xml), ...parseFileDetails(xml));
        this.saveToDisk(files);
    }

    public layoutAllToXml(data: SessionData<$NodeList<T>>, saveToDisk = false) {
        const result = {};
        const files: FileAsset[] = [];
        const views = [...data.views, ...data.includes];
        for (let i = 0; i < views.length; i++) {
            const view = views[i];
            result[view.filename] = view.content;
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
            drawable: this.resourceDrawableToXml()
        };
        for (const resource in result) {
            if (result[resource] === '') {
                delete result[resource];
            }
        }
        if (saveToDisk) {
            const files: FileAsset[] = [];
            for (const resource in result) {
                if (resource === 'drawable') {
                    files.push(...parseImageDetails(result[resource]));
                }
                files.push(...parseFileDetails(result[resource]));
            }
            this.saveToDisk(files);
        }
        return result;
    }

    public resourceStringToXml(saveToDisk = false) {
        const data: ExternalData = { '1': [] };
        this.stored.strings = new Map([...this.stored.strings.entries()].sort(caseInsensitive));
        if (this.appName !== '' && !this.stored.strings.has('app_name')) {
            data['1'].push({
                name: 'app_name',
                value: this.appName
            });
        }
        for (const [name, value] of this.stored.strings.entries()) {
            data['1'].push({
                name,
                value
            });
        }
        let xml = $xml.createTemplate($xml.parseTemplate(STRING_TMPL), data);
        xml = replaceTab(xml, this.userSettings.insertSpaces, true);
        if (saveToDisk) {
            this.saveToDisk(parseFileDetails(xml));
        }
        return xml;
    }

    public resourceStringArrayToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.arrays.size) {
            const data: ExternalData = { '1': [] };
            this.stored.arrays = new Map([...this.stored.arrays.entries()].sort());
            for (const [name, values] of this.stored.arrays.entries()) {
                data['1'].push({
                    name,
                    items: values.map(value => ({ value }))
                });
            }
            xml = $xml.createTemplate($xml.parseTemplate(STRINGARRAY_TMPL), data);
            xml = replaceTab(xml, this.userSettings.insertSpaces, true);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(xml));
            }
        }
        return xml;
    }

    public resourceFontToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.fonts.size) {
            const settings = this.userSettings;
            this.stored.fonts = new Map([...this.stored.fonts.entries()].sort());
            const namespace = settings.targetAPI < BUILD_ANDROID.OREO ? 'app' : 'android';
            for (const [name, font] of this.stored.fonts.entries()) {
                const data: ExternalData = {
                    name,
                    namespace: getXmlNs(namespace),
                    '1': []
                };
                for (const attr in font) {
                    const [style, weight] = attr.split('-');
                    data['1'].push({
                        style,
                        weight,
                        font: `@font/${name + (style === 'normal' && weight === 'normal' ? `_${style}` : (style !== 'normal' ? `_${style}` : '') + (weight !== 'normal' ? `_${weight}` : ''))}`
                    });
                }
                xml += '\n\n' + $xml.createTemplate($xml.parseTemplate(FONT_TMPL), data);
            }
            if (settings.targetAPI < BUILD_ANDROID.OREO) {
                xml = xml.replace(/android/g, 'app');
            }
            xml = replaceTab(xml, settings.insertSpaces);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(xml));
            }
        }
        return xml.trim();
    }

    public resourceColorToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.colors.size) {
            const data: ExternalData = { '1': [] };
            this.stored.colors = new Map([...this.stored.colors.entries()].sort());
            for (const [name, value] of this.stored.colors.entries()) {
                data['1'].push({
                    name,
                    value
                });
            }
            xml = $xml.createTemplate($xml.parseTemplate(COLOR_TMPL), data);
            xml = replaceTab(xml, this.userSettings.insertSpaces);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(xml));
            }
        }
        return xml;
    }

    public resourceStyleToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.styles.size) {
            const settings = this.userSettings;
            const data: ExternalData = { '1': [] };
            const styles = (Array.from(this.stored.styles.values()) as Array<StringMap>).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1);
            for (const style of styles) {
                const items: StringMap[] = [];
                style.attrs.split(';').sort().forEach((attr: string) => {
                    const [name, value] = attr.split('=');
                    items.push({
                        name,
                        value: value.replace(/"/g, '')
                    });
                });
                data['1'].push({
                    name: style.name,
                    parent: style.parent || '',
                    items
                });
            }
            xml = $xml.createTemplate($xml.parseTemplate(STYLE_TMPL), data);
            xml = replaceUnit(xml.trim(), settings.resolutionDPI, settings.convertPixels, true);
            xml = replaceTab(xml, settings.insertSpaces);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(xml));
            }
        }
        return xml;
    }

    public resourceDimenToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.dimens.size) {
            const settings = this.userSettings;
            const data: ExternalData = { '1': [] };
            this.stored.dimens = new Map([...this.stored.dimens.entries()].sort());
            for (const [name, value] of this.stored.dimens.entries()) {
                data['1'].push({
                    name,
                    value
                });
            }
            xml = $xml.createTemplate($xml.parseTemplate(DIMEN_TMPL), data);
            xml = replaceUnit(xml.trim(), settings.resolutionDPI, settings.convertPixels);
            xml = replaceTab(xml, settings.insertSpaces);
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(xml));
            }
        }
        return xml;
    }

    public resourceDrawableToXml(saveToDisk = false) {
        let xml = '';
        if (this.stored.drawables.size || this.stored.images.size) {
            const settings = this.userSettings;
            const template = $xml.parseTemplate(DRAWABLE_TMPL);
            for (const [name, value] of this.stored.drawables.entries()) {
                xml += '\n\n' + $xml.createTemplate(template, {
                    name: `res/drawable/${name}.xml`,
                    value
                });
            }
            for (const [name, images] of this.stored.images.entries()) {
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        xml += '\n\n' + $xml.createTemplate(template, {
                            name: `res/drawable-${dpi}/${name}.${$util.lastIndexOf(images[dpi], '.')}`,
                            value: `<!-- image: ${images[dpi]} -->`
                        });
                    }
                }
                else if (images.mdpi) {
                    xml += '\n\n' + $xml.createTemplate(template, {
                        name: `res/drawable/${name}.${$util.lastIndexOf(images.mdpi, '.')}`,
                        value: `<!-- image: ${images.mdpi} -->`
                    });
                }
            }
            xml = replaceUnit(xml.trim(), settings.resolutionDPI, settings.convertPixels);
            xml = replaceTab(xml, settings.insertSpaces);
            if (saveToDisk) {
                this.saveToDisk([...parseImageDetails(xml), ...parseFileDetails(xml)]);
            }
        }
        return xml;
    }

    get userSettings() {
        return this.resource.userSettings as UserSettingsAndroid;
    }
}