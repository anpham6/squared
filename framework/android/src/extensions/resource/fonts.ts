import { BUILD_VERSION } from '../../lib/constant';

import type View from '../../view';

import Resource from '../../resource';

import { concatString } from '../../lib/util';

type StyleList<T> = ObjectMap<T[]>;
type AttributeMap<T> = ObjectMap<T[]>;

interface IStyleAttribute<T> extends StyleAttribute {
    nodes: T[];
}

const { NODE_RESOURCE } = squared.base.lib.constant;

const { truncate } = squared.lib.math;
const { capitalize, convertWord, hasKeys, joinArray, spliceArray, trimBoth } = squared.lib.util;

const REGEXP_FONTATTRIBUTE = /([^\s]+)="((?:[^"]|\\")+)"/;
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

const FONT_REPLACE = {
    'arial black': 'sans-serif',
    'ms shell dlg \\32': 'sans-serif',
    'system-ui': 'sans-serif',
    '-apple-system': 'sans-serif',
    '-webkit-standard': 'sans-serif'
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
    'fontFamily': 'android:fontFamily="',
    'fontStyle': 'android:textStyle="',
    'fontWeight': 'android:fontWeight="',
    'fontSize': 'android:textSize="',
    'color': 'android:textColor="@color/',
    'backgroundColor': 'android:background="@color/'
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
        defaultFontFamily: 'sans-serif',
        floatPrecision: 2,
        disableFontAlias: false
    };
    public readonly eventOnly = true;

    public afterParseDocument(sessionId: string) {
        const resource = this.resource as android.base.Resource<T>;
        const userSettings = resource.userSettings;
        const { defaultFontFamily, floatPrecision, disableFontAlias } = this.options;
        const api = userSettings.targetAPI;
        const convertPixels = userSettings.convertPixels === 'dp';
        const { fonts, styles } = resource.mapOfStored;
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList<T>[]> = {};
        let cache: T[] = [];
        this.application.getProcessingCache(sessionId).each(node => {
            if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE.FONT_STYLE)) {
                const containerName = node.containerName;
                (nameMap[containerName] ||= []).push(node);
            }
        });
        for (const tag in nameMap) {
            const data = nameMap[tag];
            const sorted: StyleList<T>[] = [{}, {}, {}];
            const addFontItem = (node: T, index: number, attr: string, value: string) => {
                const items = sorted[index] ||= {};
                const name = FONT_STYLE[attr] + value + '"';
                (items[name] ||= []).push(node);
            };
            cache = cache.concat(data);
            for (let i = 0, length = data.length; i < length; ++i) {
                const node = data[i];
                const stored = node.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle')!;
                let { backgroundColor, fontFamily, fontStyle, fontWeight } = stored;
                const companion = node.companion;
                if (companion && !companion.visible && companion.tagName === 'LABEL') {
                    const fontData = companion.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle');
                    if (fontData) {
                        ({ fontFamily, fontStyle, fontWeight } = fontData);
                        backgroundColor ||= fontData.backgroundColor;
                    }
                }
                fontFamily.replace(/"/g, '').split(',').some((value, index, array) => {
                    value = trimBoth(value.trim(), "'").toLowerCase();
                    let fontName = value,
                        actualFontWeight = '';
                    if (!disableFontAlias && FONT_REPLACE[fontName]) {
                        fontName = defaultFontFamily;
                    }
                    if (api >= FONT_NAME[fontName] || !disableFontAlias && api >= FONT_NAME[FONT_ALIAS[fontName]]) {
                        fontFamily = fontName;
                    }
                    else if (fontStyle && fontWeight) {
                        let createFont: Undef<boolean>;
                        if (resource.getFont(value, fontStyle, fontWeight)) {
                            createFont = true;
                        }
                        else {
                            const font = fontStyle.startsWith('oblique') ? resource.getFont(value, 'italic') || resource.getFont(value, 'normal') : resource.getFont(value, fontStyle);
                            if (font) {
                                actualFontWeight = fontWeight;
                                fontWeight = font.fontWeight.toString();
                                createFont = true;
                            }
                            else if (index < array.length - 1) {
                                return false;
                            }
                            else {
                                fontFamily = defaultFontFamily;
                            }
                        }
                        if (createFont) {
                            fontName = convertWord(fontName);
                            const font = fonts.get(fontName) || {};
                            font[`${value}|${fontStyle}|${fontWeight}`] = FONT_WEIGHT[fontWeight] || fontWeight;
                            fonts.set(fontName, font);
                            fontFamily = `@font/${fontName}`;
                        }
                    }
                    else {
                        return false;
                    }
                    if (fontStyle === 'normal' || fontStyle.startsWith('oblique')) {
                        fontStyle = '';
                    }
                    if (actualFontWeight !== '') {
                        fontWeight = actualFontWeight;
                    }
                    else if (fontWeight === '400' || node.api < BUILD_VERSION.OREO) {
                        fontWeight = '';
                    }
                    if (parseInt(fontWeight) > 500) {
                        fontStyle += (fontStyle ? '|' : '') + 'bold';
                    }
                    return true;
                });
                addFontItem(node, 0, 'fontFamily', fontFamily);
                addFontItem(node, 1, 'fontSize', truncate(stored.fontSize, floatPrecision) + (convertPixels ? 'sp' : 'px'));
                addFontItem(node, 2, 'color', Resource.addColor(stored.color));
                if (fontWeight !== '') {
                    addFontItem(node, 3, 'fontWeight', fontWeight);
                }
                if (fontStyle !== '') {
                    addFontItem(node, 4, 'fontStyle', fontStyle);
                }
                if (backgroundColor) {
                    const color = Resource.addColor(backgroundColor, node.inputElement);
                    if (color !== '') {
                        addFontItem(node, 5, 'backgroundColor', color);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: ObjectMapNested<T[]> = {};
        for (const tag in groupMap) {
            const styleTag: ObjectMap<T[]> = {};
            style[tag] = styleTag;
            const sorted = groupMap[tag].filter(item => item).sort((a, b) => {
                let maxA = 0,
                    maxB = 0,
                    countA = 0,
                    countB = 0;
                for (const attr in a) {
                    const lenA = a[attr].length;
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
                else if (countA !== countB) {
                    return countB - countA;
                }
                return 0;
            });
            do {
                const length = sorted.length;
                if (length === 1) {
                    const data = sorted[0];
                    for (const attr in data) {
                        const item = data[attr];
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
                            const ids = dataA[attrA];
                            if (ids.length === 0) {
                                continue;
                            }
                            else if (ids.length === nameMap[tag].length) {
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
                                        const compare = dataB[attr];
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
                                const dataB = found[attrB];
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
                            const deleteKeys = new Set<string>();
                            const joinedMap: ObjectMap<T[]> = {};
                            const joinedIndex: StringMap = {};
                            for (const attr in filtered) {
                                const ids = joinArray(filtered[attr], item => item.id.toString(), ',');
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
                                        deleteKeys.add(attrA).add(attrB);
                                    }
                                }
                            }
                            for (const attr in filtered) {
                                if (deleteKeys.has(attr)) {
                                    continue;
                                }
                                deleteStyleAttribute(sorted, attr.split(';'), filtered[attr]);
                                styleTag[attr] = filtered[attr];
                            }
                            for (const attr in combined) {
                                const items = Array.from(combined[attr]);
                                deleteStyleAttribute(sorted, items, joinedMap[attr]);
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
                            if (item[attr].length) {
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
                for (const value of attrs.split(';')) {
                    const match = REGEXP_FONTATTRIBUTE.exec(value);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                }
                styleData.push({
                    name: '',
                    parent: '',
                    items,
                    nodes: styleTag[attrs]
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
            for (const group of resourceMap[tag]) {
                const nodes = group.nodes;
                if (nodes) {
                    for (let i = 0, length = nodes.length; i < length; ++i) {
                        const item = nodes[i];
                        let data = nodeMap.get(item);
                        if (!data) {
                            data = [];
                            nodeMap.set(item, data);
                        }
                        data.push(group.name);
                    }
                }
            }
        }
        for (let i = 0, length = cache.length; i < length; ++i) {
            const node = cache[i];
            const styleData = nodeMap.get(node);
            if (styleData) {
                if (styleData.length > 1) {
                    parentStyle.add(concatString(styleData, '.'));
                    styleData.shift();
                }
                else {
                    parentStyle.add(styleData[0]);
                }
                node.attr('_', 'style', `@style/${concatString(styleData, '.')}`);
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
                    const styleData = resourceMap[match[1].toUpperCase()][parseInt(match[2]) || 0];
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
    }
}