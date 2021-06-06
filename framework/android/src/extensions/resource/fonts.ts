import { BUILD_VERSION, CONTAINER_NODE, FONT_GOOGLE } from '../../lib/constant';

import type View from '../../view';

import Resource from '../../resource';

import { concatString } from '../../lib/util';

type StyleList<T> = ObjectMap<T[]>;
type AttributeMap<T> = ObjectMap<T[]>;

interface IStyleAttribute<T> extends StyleAttribute {
    nodes: T[];
}

const { truncate } = squared.lib.math;
const { capitalize, convertWord, hasKeys, joinArray, replaceAll, spliceArray, splitPair, startsWith, trimEnclosing } = squared.lib.util;

const { trimBoth } = squared.base.lib.util;

const REGEXP_FONTNAME = /^(\w*?)(?:_(\d+))?$/;

const FONT_NAME = {
    'sans-serif': BUILD_VERSION.ICE_CREAM_SANDWICH,
    'sans-serif-thin': BUILD_VERSION.JELLYBEAN,
    'sans-serif-light': BUILD_VERSION.JELLYBEAN,
    'sans-serif-condensed': BUILD_VERSION.JELLYBEAN,
    'sans-serif-condensed-light': BUILD_VERSION.JELLYBEAN,
    'sans-serif-medium': BUILD_VERSION.LOLLIPOP,
    'sans-serif-black': BUILD_VERSION.LOLLIPOP,
    'sans-serif-smallcaps': BUILD_VERSION.LOLLIPOP,
    'serif-monospace' : BUILD_VERSION.LOLLIPOP,
    'serif': BUILD_VERSION.LOLLIPOP,
    'casual' : BUILD_VERSION.LOLLIPOP,
    'cursive': BUILD_VERSION.LOLLIPOP,
    'monospace': BUILD_VERSION.LOLLIPOP,
    'sans-serif-condensed-medium': BUILD_VERSION.OREO
};

const FONT_ALIAS = {
    'arial': 'sans-serif',
    'helvetica': 'sans-serif',
    'tahoma': 'sans-serif',
    'verdana': 'sans-serif',
    'times': 'serif',
    'times new roman': 'serif',
    'palatino': 'serif',
    'georgia': 'serif',
    'baskerville': 'serif',
    'goudy': 'serif',
    'fantasy': 'serif',
    'itc stone serif': 'serif',
    'sans-serif-monospace': 'monospace',
    'monaco': 'monospace',
    'courier': 'serif-monospace',
    'courier new': 'serif-monospace'
};

const FONT_WEIGHT = {
    '100': 'thin',
    '200': 'extra_light',
    '300': 'light',
    '400': 'normal',
    '500': 'medium',
    '600': 'semi_bold',
    '700': 'bold',
    '800': 'extra_bold',
    '900': 'black'
};

const FONT_STYLE = {
    'fontFamily': 'fontFamily="',
    'fontStyle': 'textStyle="',
    'fontWeight': 'fontWeight="',
    'fontSize': 'textSize="',
    'color': 'textColor="@color/',
    'backgroundColor': 'background="@color/'
};

function deleteStyleAttribute(sorted: AttributeMap<View>[], attrs: string[], nodes: View[]) {
    for (let i = 0, length = attrs.length, q = sorted.length; i < length; ++i) {
        const attr = attrs[i];
        for (let j = 0; j < q; ++j) {
            const data = sorted[j];
            let item = data[attr];
            if (item) {
                item = item.filter(node => !nodes.includes(node));
                if (item.length === 0) {
                    delete data[attr];
                }
                else {
                    data[attr] = item;
                }
                break;
            }
        }
    }
}

export default class ResourceFonts<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceFontsOptions = {
        systemFonts: ['arial black', 'sans-serif', 'ms shell dlg \\32', 'system-ui', '-apple-system', '-webkit-standard'],
        defaultFontFamily: 'sans-serif',
        floatPrecision: 2,
        disableFontAlias: false
    };
    public readonly eventOnly = true;

    public afterParseDocument(sessionId: string) {
        const { systemFonts, defaultFontFamily, floatPrecision, disableFontAlias } = this.options;
        const resource = this.resource as android.base.Resource<T>;
        const fontProvider = this.application.getUserSetting<boolean>(sessionId, 'createDownloadableFonts') && resource.fontProvider;
        const convertPixels = this.application.userSettings.convertPixels;
        const { resourceId, cache } = this.application.getProcessing(sessionId)!;
        const { fonts, arrays, styles } = Resource.STORED[resourceId]!;
        const nameMap: ObjectMapSafe<T[]> = {};
        const textMap: ObjectMapSafe<T[]> = {};
        const groupMap: ObjectMap<StyleList<T>[]> = {};
        const fontItems: T[] = [];
        cache.each(node => {
            if (node.data(Resource.KEY_NAME, 'fontStyle')) {
                const containerName = node.containerName;
                (nameMap[containerName] ||= []).push(node);
            }
        });
        for (const tag in nameMap) {
            const data = nameMap[tag];
            const sorted: StyleList<T>[] = [{}, {}];
            const addFontItem = (node: T, index: number, attr: string, value: string) => {
                if (value) {
                    const items = sorted[index] ||= {};
                    const name = FONT_STYLE[attr] + value + '"';
                    (items[name] ||= []).push(node);
                }
            };
            fontItems.push(...data);
            for (let i = 0, length = data.length; i < length; ++i) {
                const node = data[i];
                const { api, companion } = node;
                const stored = node.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle')!;
                let { fontFamily, fontStyle, fontWeight, backgroundColor } = stored,
                    closest: Undef<boolean>;
                const finalizeFont = (actualWeight: number) => {
                    if (fontStyle === 'normal' || startsWith(fontStyle, 'oblique')) {
                        fontStyle = '' as FontStyle;
                    }
                    if (actualWeight) {
                        fontWeight = actualWeight.toString();
                    }
                    else if (fontWeight === '400' || node.api < BUILD_VERSION.OREO) {
                        fontWeight = '';
                    }
                    if (+fontWeight >= 600) {
                        fontStyle += (fontStyle ? '|' : '') + 'bold';
                    }
                };
                if (companion && !companion.visible && companion.tagName === 'LABEL') {
                    const fontData = companion.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle');
                    if (fontData) {
                        ({ fontFamily, fontStyle, fontWeight } = fontData);
                        backgroundColor ||= fontData.backgroundColor;
                    }
                }
                const items = replaceAll(fontFamily, '"', '').split(',');
                for (let j = 0, q = items.length; j < q; ++j) {
                    const value = trimBoth(items[j], "'", true).toLowerCase();
                    let fontName = value,
                        actualWeight = 0;
                    if (startsWith(fontStyle, 'oblique')) {
                        fontStyle = 'italic';
                    }
                    if (fontProvider && api >= BUILD_VERSION.OREO) {
                        let foundName = '',
                            foundStyle: Undef<FontProvider>;
                        for (const authority in fontProvider) {
                            const item = fontProvider[authority]!;
                            for (const name in item.fonts) {
                                if (fontName === name.toLowerCase()) {
                                    const font = item.fonts[name]!;
                                    foundName = name;
                                    if (font[fontStyle]) {
                                        foundStyle = item;
                                        break;
                                    }
                                    else if (font.normal?.includes(fontWeight)) {
                                        foundStyle = item;
                                    }
                                }
                            }
                        }
                        if (foundStyle) {
                            const styleData = foundStyle.fonts[foundName]!;
                            const font = styleData[fontStyle] || styleData.normal!;
                            if (!font.includes(fontWeight)) {
                                actualWeight = +fontWeight;
                                fontWeight = '';
                                for (const weight of font) {
                                    if (+weight > actualWeight) {
                                        fontWeight = weight.toString();
                                        break;
                                    }
                                }
                                fontWeight ||= font[font.length - 1].toString();
                                closest = true;
                            }
                            let fontData = fonts.get(fontName = convertWord(fontName) + (fontWeight !== '400' ? '_' + FONT_WEIGHT[fontWeight] : '') + (fontStyle === 'italic' ? '_italic' : ''));
                            if (!fontData) {
                                fonts.set(fontName, fontData = {});
                            }
                            let authority = foundStyle.authority;
                            const weight = fontWeight !== '400' ? '&amp;weight=' + fontWeight : '';
                            const italic = fontStyle === 'italic' ? '&amp;italic=1' : '';
                            const width = styleData.width ? '&amp;width=' + styleData.width : '';
                            fontData[authority] = weight || italic || width ? 'name=' + foundName + weight + italic + width : foundName;
                            fonts.set(fontName, fontData);
                            let preloaded = arrays.get('preloaded_fonts:0:0');
                            if (!preloaded) {
                                arrays.set('preloaded_fonts:0:0', preloaded = []);
                            }
                            if (!preloaded.includes(fontFamily = `@font/${fontName}`)) {
                                preloaded.push(fontFamily);
                            }
                            authority = convertWord(authority.toLowerCase()) + '_certs';
                            const fontKey = authority + ':0:0';
                            if (!arrays.has(fontKey)) {
                                const certs: string[] = [];
                                foundStyle.certs.forEach((encoded, index) => {
                                    const key = authority + '_' + (index + 1);
                                    certs.push(`@array/${key}`);
                                    arrays.set(key + ':1:0', [encoded]);
                                });
                                arrays.set(fontKey, certs);
                            }
                            finalizeFont(actualWeight);
                            break;
                        }
                    }
                    if (!disableFontAlias && systemFonts.includes(fontName)) {
                        fontName = defaultFontFamily;
                    }
                    if (api >= FONT_NAME[fontName] || !disableFontAlias && api >= FONT_NAME[FONT_ALIAS[fontName]]) {
                        fontFamily = fontName;
                    }
                    else if (fontStyle && fontWeight) {
                        let foundStyle: Undef<string>;
                        if (resource.getFonts(resourceId, value, fontStyle, fontWeight).length) {
                            foundStyle = fontStyle;
                        }
                        else {
                            let fontData = resource.getFonts(resourceId, value);
                            if (fontData.length) {
                                foundStyle = 'normal';
                                actualWeight = +fontWeight;
                                if (fontStyle === 'italic') {
                                    const italic = fontData.filter(item => item.fontStyle === 'italic');
                                    if (italic.length) {
                                        fontData = italic;
                                        foundStyle = 'italic';
                                    }
                                }
                                fontWeight = '';
                                for (const { fontWeight: weight } of fontData) {
                                    if (weight >= actualWeight) {
                                        fontWeight = weight.toString();
                                        break;
                                    }
                                }
                                fontWeight ||= fontData.pop()!.fontWeight.toString();
                                closest = true;
                            }
                            else if (j < q - 1) {
                                continue;
                            }
                            else {
                                fontFamily = defaultFontFamily;
                            }
                        }
                        if (foundStyle) {
                            let fontData = fonts.get(fontName = convertWord(fontName));
                            if (!fontData) {
                                fonts.set(fontName, fontData = {});
                            }
                            fontData[`${value};${foundStyle};${fontWeight}`] = FONT_WEIGHT[fontWeight] || fontWeight;
                            fontFamily = `@font/${fontName}`;
                        }
                    }
                    else {
                        continue;
                    }
                    finalizeFont(actualWeight);
                    break;
                }
                const fontSize = truncate(stored.fontSize, floatPrecision) + (convertPixels ? 'sp' : 'px');
                const fontColor = stored.color && Resource.addColor(resourceId, stored.color) || '';
                if (node.is(CONTAINER_NODE.TEXT) && api >= BUILD_VERSION.PIE) {
                    (textMap[fontFamily + ';' + fontSize + ';' + fontWeight + ';' + fontStyle + ';' + fontColor] ||= []).push(node);
                }
                else {
                    addFontItem(node, 0, 'fontFamily', fontFamily);
                    addFontItem(node, 1, 'fontSize', fontSize);
                    if (fontColor) {
                        addFontItem(node, 2, 'color', fontColor);
                    }
                    addFontItem(node, 3, 'fontWeight', fontWeight);
                    addFontItem(node, 4, 'fontStyle', fontStyle);
                    if (backgroundColor) {
                        addFontItem(node, 5, 'backgroundColor', Resource.addColor(resourceId, backgroundColor, node.inputElement));
                    }
                    if (closest && node.api >= BUILD_VERSION.PIE) {
                        node.android('textFontWeight', fontWeight);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: ObjectMapNested<T[]> = {};
        for (const tag in groupMap) {
            const styleTag: ObjectMap<T[]> = {};
            style[tag] = styleTag;
            const sorted = groupMap[tag]!.filter(item => item).sort((a, b) => {
                let maxA = 0,
                    maxB = 0,
                    countA = 0,
                    countB = 0;
                for (const attr in a) {
                    const lenA = a[attr]!.length;
                    maxA = Math.max(lenA, maxA);
                    countA += lenA;
                }
                for (const attr in b) {
                    const item = b[attr];
                    if (item) {
                        const lenB = item.length;
                        maxB = Math.max(lenB, maxB);
                        countB += lenB;
                    }
                }
                if (maxA !== maxB) {
                    return maxB - maxA;
                }
                if (countA !== countB) {
                    return countB - countA;
                }
                return 0;
            });
            do {
                const length = sorted.length;
                if (length === 1) {
                    const data = sorted[0];
                    for (const attr in data) {
                        const item = data[attr]!;
                        if (item.length) {
                            styleTag[attr] = item;
                        }
                    }
                    break;
                }
                else {
                    const styleKey: AttributeMap<T> = {};
                    for (let i = 0; i < length; ++i) {
                        const dataA = sorted[i];
                        const filtered: AttributeMap<T> = {};
                        for (const attrA in dataA) {
                            const ids = dataA[attrA]!;
                            if (ids.length === 0) {
                                continue;
                            }
                            else if (ids.length === nameMap[tag]!.length) {
                                styleKey[attrA] = ids;
                                sorted[i] = {};
                                break;
                            }
                            const found: AttributeMap<T> = {};
                            let merged: Undef<boolean>;
                            for (let j = 0; j < length; ++j) {
                                if (i !== j) {
                                    const dataB = sorted[j];
                                    for (const attr in dataB) {
                                        const compare = dataB[attr]!;
                                        if (compare.length) {
                                            for (let k = 0, q = ids.length; k < q; ++k) {
                                                if (compare.includes(ids[k])) {
                                                    (found[attr] ||= []).push(ids[k]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            for (const attrB in found) {
                                const dataB = found[attrB]!;
                                if (dataB.length > 1) {
                                    filtered[attrA < attrB ? `${attrA};${attrB}` : `${attrB};${attrA}`] = dataB;
                                    merged = true;
                                }
                            }
                            if (!merged) {
                                filtered[attrA] = ids;
                            }
                        }
                        if (hasKeys(filtered)) {
                            const combined: ObjectMap<Set<string>> = {};
                            const deleteKeys: string[] = [];
                            const joinedMap: ObjectMap<T[]> = {};
                            const joinedIndex: StringMap = {};
                            for (const attr in filtered) {
                                const ids = joinArray(filtered[attr]!, item => item.id.toString(), ',');
                                joinedIndex[attr] = ids;
                                joinedMap[ids] = filtered[attr];
                            }
                            for (const attrA in filtered) {
                                for (const attrB in filtered) {
                                    const index = joinedIndex[attrA]!;
                                    if (attrA !== attrB && index === joinedIndex[attrB]) {
                                        let data = combined[index];
                                        if (!data) {
                                            data = new Set(attrA.split(';'));
                                            combined[index] = data;
                                        }
                                        for (const value of attrB.split(';')) {
                                            data.add(value);
                                        }
                                        deleteKeys.push(attrA, attrB);
                                    }
                                }
                            }
                            for (const attr in filtered) {
                                if (deleteKeys.includes(attr)) {
                                    continue;
                                }
                                deleteStyleAttribute(sorted, attr.split(';'), filtered[attr]!);
                                styleTag[attr] = filtered[attr];
                            }
                            for (const attr in combined) {
                                const items = Array.from(combined[attr]!);
                                deleteStyleAttribute(sorted, items, joinedMap[attr]!);
                                styleTag[items.join(';')] = joinedMap[attr];
                            }
                        }
                    }
                    const shared = Object.keys(styleKey);
                    if (shared.length) {
                        styleTag[concatString(shared, ';')] = styleKey[shared[0]];
                    }
                    spliceArray(sorted, item => {
                        for (const attr in item) {
                            if (item[attr]!.length) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
            }
            while (sorted.length);
        }
        const resourceMap: ObjectMap<IStyleAttribute<T>[]> = {};
        const nodeMap = new WeakMap<T, string[]>();
        const parentStyle = new Set<string>();
        for (const tag in style) {
            const styleTag = style[tag];
            const styleData: IStyleAttribute<T>[] = [];
            for (const attrs in styleTag) {
                const items: StringValue[] = [];
                for (const attr of attrs.split(';')) {
                    const [key, value] = splitPair(attr, '=');
                    items.push({ key: 'android:' + key, value: trimEnclosing(value) });
                }
                styleData.push({
                    name: '',
                    parent: '',
                    items,
                    nodes: styleTag[attrs]!
                });
            }
            styleData.sort((a, b) => {
                let c: NumString = a.nodes.length,
                    d: NumString = b.nodes.length;
                if (c === d) {
                    c = a.items.length;
                    d = b.items.length;
                }
                return c <= d ? 1 : -1;
            });
            for (let i = 0, length = styleData.length; i < length; ++i) {
                styleData[i].name = capitalize(tag) + (i > 0 ? '_' + i : '');
            }
            resourceMap[tag] = styleData;
        }
        for (const tag in resourceMap) {
            for (const group of resourceMap[tag]!) {
                const nodes = group.nodes;
                if (nodes) {
                    for (let i = 0, length = nodes.length; i < length; ++i) {
                        const item = nodes[i];
                        let data = nodeMap.get(item);
                        if (!data) {
                            nodeMap.set(item, data = []);
                        }
                        data.push(group.name);
                    }
                }
            }
        }
        for (let i = 0, length = fontItems.length; i < length; ++i) {
            const node = fontItems[i];
            const styleData = nodeMap.get(node);
            if (styleData) {
                if (styleData.length > 1) {
                    parentStyle.add(concatString(styleData, '.'));
                    styleData.shift();
                }
                else {
                    parentStyle.add(styleData[0]);
                }
                node.attrx('style', `@style/${concatString(styleData, '.')}`);
            }
        }
        for (const value of parentStyle) {
            const styleName: string[] = [];
            const values = value.split('.');
            let parent = '',
                items: Undef<StringValue[]>;
            for (let i = 0, q = values.length; i < q; ++i) {
                const name = values[i];
                const match = REGEXP_FONTNAME.exec(name);
                if (match) {
                    const styleData = resourceMap[match[1].toUpperCase()]![+match[2] || 0];
                    if (styleData) {
                        if (i === 0) {
                            parent = name;
                            if (q === 1) {
                                items = styleData.items;
                            }
                            else if (!styles.has(name)) {
                                styles.set(name, { name, parent: '', items: styleData.items });
                            }
                        }
                        else {
                            if (items) {
                                const styleItems = styleData.items;
                                for (let j = 0, r = styleItems.length; j < r; ++j) {
                                    const item = styleItems[j];
                                    const key = item.key;
                                    const index = items.findIndex(previous => previous.key === key);
                                    if (index !== -1) {
                                        items[index] = item;
                                    }
                                    else {
                                        items.push(item);
                                    }
                                }
                            }
                            else {
                                items = styleData.items.slice(0);
                            }
                            styleName.push(name);
                        }
                    }
                }
            }
            if (items) {
                if (styleName.length === 0) {
                    styles.set(parent, { name: parent, parent: '', items });
                }
                else {
                    const name = concatString(styleName, '.');
                    styles.set(name, { name, parent, items });
                }
            }
        }
        for (const attr in textMap) {
            const [fontFamily, fontSize, fontWeight, fontStyle, fontColor] = attr.split(';');
            const nodes = textMap[attr];
            let tagName = nodes[0].tagName;
            if (tagName[0] === '#') {
                tagName = '';
            }
            const basename = 'Text' + (tagName ? '_' + capitalize(tagName) : '') + (fontWeight ? '_' + fontWeight : '');
            let name = basename,
                i = 0;
            while (styles.has(name)) {
                name = basename + '_' + ++i;
            }
            const items: StringValue[] = [
                { key: 'android:fontFamily', value: fontFamily },
                { key: 'android:textSize', value: fontSize },
                { key: 'android:textFontWeight', value: fontWeight || '400' }
            ];
            if (fontStyle) {
                if (fontStyle.indexOf('|') === -1) {
                    items.push({ key: 'android:textStyle', value: fontStyle });
                }
                else {
                    nodes.forEach(node => node.android('textStyle', fontStyle));
                }
            }
            if (fontColor) {
                items.push({ key: 'android:textColor', value: `@color/${fontColor}` });
            }
            let letterSpacing: Set<string> | string = new Set(nodes.map(item => item.android('letterSpacing')));
            if (letterSpacing.size === 1 && (letterSpacing = letterSpacing.values().next().value as string)) {
                items.push({ key: 'android:letterSpacing', value: letterSpacing });
                nodes.forEach(node => node.deleteOne('android', 'letterSpacing'));
            }
            styles.set(name, { name, parent: '', items } as StyleAttribute);
            for (let j = 0, length = nodes.length; j < length; ++j) {
                nodes[j].android('textAppearance', `@style/${name}`);
            }
        }
    }

    set application(value: android.base.Application<T>) {
        super.application = value;
        (value.resourceHandler as android.base.Resource<T>).addFontProvider(
            'com.google.android.gms.fonts',
            'com.google.android.gms',
            ['MIIEqDCCA5CgAwIBAgIJANWFuGx90071MA0GCSqGSIb3DQEBBAUAMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEQMA4GA1UEChMHQW5kcm9pZDEQMA4GA1UECxMHQW5kcm9pZDEQMA4GA1UEAxMHQW5kcm9pZDEiMCAGCSqGSIb3DQEJARYTYW5kcm9pZEBhbmRyb2lkLmNvbTAeFw0wODA0MTUyMzM2NTZaFw0zNTA5MDEyMzM2NTZaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEQMA4GA1UEChMHQW5kcm9pZDEQMA4GA1UECxMHQW5kcm9pZDEQMA4GA1UEAxMHQW5kcm9pZDEiMCAGCSqGSIb3DQEJARYTYW5kcm9pZEBhbmRyb2lkLmNvbTCCASAwDQYJKoZIhvcNAQEBBQADggENADCCAQgCggEBANbOLggKv+IxTdGNs8/TGFy0PTP6DHThvbbR24kT9ixcOd9W+EaBPWW+wPPKQmsHxajtWjmQwWfna8mZuSeJS48LIgAZlKkpFeVyxW0qMBujb8X8ETrWy550NaFtI6t9+u7hZeTfHwqNvacKhp1RbE6dBRGWynwMVX8XW8N1+UjFaq6GCJukT4qmpN2afb8sCjUigq0GuMwYXrFVee74bQgLHWGJwPmvmLHC69EH6kWr22ijx4OKXlSIx2xT1AsSHee70w5iDBiK4aph27yH3TxkXy9V89TDdexAcKk/cVHYNnDBapcavl7y0RiQ4biu8ymM8Ga/nmzhRKya6G0cGw8CAQOjgfwwgfkwHQYDVR0OBBYEFI0cxb6VTEM8YYY6FbBMvAPyT+CyMIHJBgNVHSMEgcEwgb6AFI0cxb6VTEM8YYY6FbBMvAPyT+CyoYGapIGXMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEQMA4GA1UEChMHQW5kcm9pZDEQMA4GA1UECxMHQW5kcm9pZDEQMA4GA1UEAxMHQW5kcm9pZDEiMCAGCSqGSIb3DQEJARYTYW5kcm9pZEBhbmRyb2lkLmNvbYIJANWFuGx90071MAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEEBQADggEBABnTDPEF+3iSP0wNfdIjIz1AlnrPzgAIHVvXxunW7SBrDhEglQZBbKJEk5kT0mtKoOD1JMrSu1xuTKEBahWRbqHsXclaXjoBADb0kkjVEJu/Lh5hgYZnOjvlba8Ld7HCKePCVePoTJBdI4fvugnL8TsgK05aIskyY0hKI9L8KfqfGTl1lzOv2KoWD0KWwtAWPoGChZxmQ+nBli+gwYMzM1vAkP+aayLe0a1EQimlOalO762r0GXO0ks+UeXde2Z4e+8S/pf7pITEI/tP+MxJTALw9QUWEv9lKTk+jkbqxbsh8nfBUapfKqYn0eidpwq2AzVp3juYl7//fKnaPhJD9gs=',
             'MIIEQzCCAyugAwIBAgIJAMLgh0ZkSjCNMA0GCSqGSIb3DQEBBAUAMHQxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtHb29nbGUgSW5jLjEQMA4GA1UECxMHQW5kcm9pZDEQMA4GA1UEAxMHQW5kcm9pZDAeFw0wODA4MjEyMzEzMzRaFw0zNjAxMDcyMzEzMzRaMHQxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRQwEgYDVQQKEwtHb29nbGUgSW5jLjEQMA4GA1UECxMHQW5kcm9pZDEQMA4GA1UEAxMHQW5kcm9pZDCCASAwDQYJKoZIhvcNAQEBBQADggENADCCAQgCggEBAKtWLgDYO6IIrgqWbxJOKdoR8qtW0I9Y4sypEwPpt1TTcvZApxsdyxMJZ2JORland2qSGT2y5b+3JKkedxiLDmpHpDsz2WCbdxgxRczfey5YZnTJ4VZbH0xqWVW/8lGmPav5xVwnIiJS6HXk+BVKZF+JcWjAsb/GEuq/eFdpuzSqeYTcfi6idkyugwfYwXFU1+5fZKUaRKYCwkkFQVfcAs1fXA5V+++FGfvjJ/CxURaSxaBvGdGDhfXE28LWuT9ozCl5xw4Yq5OGazvV24mZVSoOO0yZ31j7kYvtwYK6NeADwbSxDdJEqO4k//0zOHKrUiGYXtqw/A0LFFtqoZKFjnkCAQOjgdkwgdYwHQYDVR0OBBYEFMd9jMIhF1Ylmn/Tgt9r45jk14alMIGmBgNVHSMEgZ4wgZuAFMd9jMIhF1Ylmn/Tgt9r45jk14aloXikdjB0MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEUMBIGA1UEChMLR29vZ2xlIEluYy4xEDAOBgNVBAsTB0FuZHJvaWQxEDAOBgNVBAMTB0FuZHJvaWSCCQDC4IdGZEowjTAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBBAUAA4IBAQBt0lLO74UwLDYKqs6Tm8/yzKkEu116FmH4rkaymUIE0P9KaMftGlMexFlaYjzmB2OxZyl6euNXEsQH8gjwyxCUKRJNexBiGcCEyj6z+a1fuHHvkiaai+KL8W1EyNmgjmyy8AW7P+LLlkR+ho5zEHatRbM/YAnqGcFh5iZBqpknHf1SKMXFh4dd239FJ1jWYfbMDMy3NS5CTMQ2XFI1MvcyUTdZPErjQfTbQe3aDQsQcafEQPD+nqActifKZ0Np0IS9L9kR/wbNvyz6ENwPiTrjV2KRkEjH78ZMcUQXg0L3BYHJ3lc69Vs5Ddf9uUGGMYldX3WfMBEmh/9iFBDAaTCK'],
            FONT_GOOGLE,
            true
        );
    }
    get application() {
        return super.application as android.base.Application<T>;
    }
}