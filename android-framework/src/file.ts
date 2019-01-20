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
    const pattern = /^[\w\W]*?(<!-- filename: (.+)\/(.*?\.xml) -->)$/;
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
        files.push(...parseFileDetails(this.resourceAnimToXml()));
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
            drawableImage: this.resourceDrawableImageToXml(),
            anim: this.resourceAnimToXml()
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
        result.push(
            replaceTab(
                $xml.createTemplate($xml.parseTemplate(STRING_TMPL), data),
                this.userSettings.insertSpaces,
                true
            )
        );
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
            result.push(
                replaceTab(
                    $xml.createTemplate($xml.parseTemplate(STRINGARRAY_TMPL), data),
                    this.userSettings.insertSpaces,
                    true
                )
            );
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
                result.push(
                    replaceTab(
                        xml,
                        settings.insertSpaces
                    )
                );
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
            result.push(
                replaceTab(
                    $xml.createTemplate($xml.parseTemplate(COLOR_TMPL), data),
                    this.userSettings.insertSpaces
                )
            );
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
                        data.A.push(<ExternalData> style);
                    }
                }
                files.push({
                    filename: 'res/values/styles.xml',
                    data
                });
            }
            const appTheme: ObjectMap<boolean> = {};
            for (const [filename, theme] of this.stored.themes.entries()) {
                const data: TemplateDataA = { A: [] };
                for (const [themeName, themeData] of theme.entries()) {
                    const items: StringMap[] = [];
                    for (const name in themeData.items) {
                        items.push({
                            name,
                            value: themeData.items[name]
                        });
                    }
                    if (!appTheme[filename] || themeName !== 'AppTheme' || items.length > 0) {
                        data.A.push({
                            name: themeName,
                            parent: themeData.parent,
                            items
                        });
                    }
                    if (themeName === 'AppTheme') {
                        appTheme[filename] = true;
                    }
                }
                files.push({ filename, data });
            }
            for (const style of files) {
                result.push(
                    replaceTab(
                        replaceUnit(
                            $xml.createTemplate(template, style.data).replace('filename: {0}', `filename: ${style.filename}`),
                            settings.resolutionDPI,
                            settings.convertPixels,
                            true
                        ),
                        settings.insertSpaces
                    )
                );
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
            result.push(
                replaceTab(
                    replaceUnit(
                        $xml.createTemplate($xml.parseTemplate(DIMEN_TMPL), data),
                        settings.resolutionDPI,
                        settings.convertPixels
                    ),
                    settings.insertSpaces
                )
            );
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
                result.push(
                    replaceTab(
                        replaceUnit(
                            $xml.createTemplate(template, {
                                name: `res/drawable/${name}.xml`,
                                value
                            }),
                            settings.resolutionDPI,
                            settings.convertPixels
                        ),
                        settings.insertSpaces
                    )
                );
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
                if (Object.keys(images).length > 1) {
                    for (const dpi in images) {
                        result.push(
                            replaceTab(
                                $xml.createTemplate(template, {
                                    name: `res/drawable-${dpi}/${name}.${$util.lastIndexOf(images[dpi], '.')}`,
                                    value: `<!-- image: ${images[dpi]} -->`
                                }),
                                settings.insertSpaces
                            )
                        );
                    }
                }
                else if (images.mdpi) {
                    result.push(
                        replaceTab(
                            $xml.createTemplate(template, {
                                name: `res/drawable/${name}.${$util.lastIndexOf(images.mdpi, '.')}`,
                                value: `<!-- image: ${images.mdpi} -->`
                            }),
                            settings.insertSpaces
                        )
                    );
                }
            }
            if (saveToDisk) {
                this.saveToDisk(parseImageDetails(result));
            }
        }
        return result;
    }

    public resourceAnimToXml(saveToDisk = false) {
        const result: string[] = [];
        if (this.stored.animators.size) {
            const template = $xml.parseTemplate(DRAWABLE_TMPL);
            for (const [name, value] of this.stored.animators.entries()) {
                result.push(
                    replaceTab(
                        $xml.createTemplate(template, { name: `res/anim/${name}.xml`, value }),
                        this.userSettings.insertSpaces
                    )
                );
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