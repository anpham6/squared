import Resource from '../../resource';

import { BUILD_ANDROID } from '../../lib/enumeration';
import { convertLength } from '../../lib/util';

type View = android.base.View;
type StyleList = ObjectMap<number[]>;
type SharedAttributes = ObjectMapNested<number[]>;
type AttributeMap = ObjectMap<number[]>;
type TagNameMap = ObjectMap<StyleAttribute[]>;
type NodeStyleMap = ObjectMap<string[]>;

const { capitalize, convertInt, convertWord, hasKeys, plainMap, safeNestedArray, safeNestedMap, spliceArray, trimBoth } = squared.lib.util;

const { NODE_RESOURCE } = squared.base.lib.enumeration;

const FONT_ANDROID = {
    'sans-serif': BUILD_ANDROID.ICE_CREAM_SANDWICH,
    'sans-serif-thin': BUILD_ANDROID.JELLYBEAN,
    'sans-serif-light': BUILD_ANDROID.JELLYBEAN,
    'sans-serif-condensed': BUILD_ANDROID.JELLYBEAN,
    'sans-serif-condensed-light': BUILD_ANDROID.JELLYBEAN,
    'sans-serif-medium': BUILD_ANDROID.LOLLIPOP,
    'sans-serif-black': BUILD_ANDROID.LOLLIPOP,
    'sans-serif-smallcaps': BUILD_ANDROID.LOLLIPOP,
    'serif-monospace' : BUILD_ANDROID.LOLLIPOP,
    'serif': BUILD_ANDROID.LOLLIPOP,
    'casual' : BUILD_ANDROID.LOLLIPOP,
    'cursive': BUILD_ANDROID.LOLLIPOP,
    'monospace': BUILD_ANDROID.LOLLIPOP,
    'sans-serif-condensed-medium': BUILD_ANDROID.OREO
};

const FONTALIAS_ANDROID = {
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

const FONTREPLACE_ANDROID = {
    'arial black': 'sans-serif',
    'ms shell dlg \\32': 'sans-serif',
    'system-ui': 'sans-serif',
    '-apple-system': 'sans-serif',
    '-webkit-standard': 'sans-serif'
};

const FONTWEIGHT_ANDROID = {
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

const STORED = Resource.STORED as AndroidResourceStoredMap;
const REGEX_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
const REGEX_ATTRIBUTE = /([^\s]+)="((?:[^"]|\\")+)"/;
const FONT_STYLEKEYS = Object.keys(FONT_STYLE);

function deleteStyleAttribute(sorted: AttributeMap[], attrs: string, ids: number[]) {
    const length = sorted.length;
    for (const value of attrs.split(';')) {
        for (let i = 0; i < length; ++i) {
            let data = sorted[i];
            let index = -1;
            let key = '';
            for (const j in data) {
                if (j === value) {
                    index = i;
                    key = j;
                    i = length;
                    break;
                }
            }
            if (index !== -1) {
                data = sorted[index];
                data[key] = data[key].filter(id => !ids.includes(id));
                if (data[key].length === 0) {
                    delete data[key];
                }
                break;
            }
        }
    }
}

export default class ResourceFonts<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceFontsOptions = {
        systemDefaultFont: 'sans-serif',
        disableFontAlias: false
    };
    public readonly eventOnly = true;

    public afterParseDocument() {
        const resource = this.resource as android.base.Resource<T>;
        const disableFontAlias = this.options.disableFontAlias;
        const convertPixels = resource.userSettings.convertPixels === 'dp';
        const { fonts, styles } = STORED;
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList[]> = {};
        let cache: T[] = [];
        this.cache.each(node => {
            if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE.FONT_STYLE)) {
                safeNestedArray(nameMap, node.containerName).push(node);
            }
        });
        for (const tag in nameMap) {
            const sorted: StyleList[] = [];
            const data = nameMap[tag];
            cache = cache.concat(data);
            const length = data.length;
            let i = 0;
            while (i < length) {
                let node = data[i++];
                const { id, companion, api } = node;
                const stored: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                let { fontFamily, fontStyle, fontWeight } = stored;
                if (companion?.tagName === 'LABEL' && !companion.visible) {
                    node = companion as T;
                }
                fontFamily.replace(/"/g, '').split(',').some((value, index, array) => {
                    value = trimBoth(value.trim(), "'").toLowerCase();
                    let fontName = value;
                    let actualFontWeight = '';
                    if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                        fontName = this.options.systemDefaultFont;
                    }
                    if (api >= FONT_ANDROID[fontName] || !disableFontAlias && api >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
                        fontFamily = fontName;
                    }
                    else if (fontStyle && fontWeight) {
                        let createFont = false;
                        if (resource.getFont(value, fontStyle, fontWeight)) {
                            createFont = true;
                        }
                        else {
                            let font: Undef<FontFaceData>;
                            if (fontStyle.startsWith('oblique')) {
                                font = resource.getFont(value, 'italic') || resource.getFont(value, 'normal');
                            }
                            else {
                                font = resource.getFont(value, fontStyle);
                            }
                            if (font) {
                                actualFontWeight = fontWeight;
                                fontWeight = font.fontWeight.toString();
                                createFont = true;
                            }
                            else if (index < array.length - 1) {
                                return false;
                            }
                            else {
                                fontFamily = this.options.systemDefaultFont;
                            }
                        }
                        if (createFont) {
                            fontName = convertWord(fontName);
                            const font = fonts.get(fontName) || {};
                            font[value + '|' + fontStyle + '|' + fontWeight] = FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
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
                    else if (fontWeight === '400' || node.api < BUILD_ANDROID.OREO) {
                        fontWeight = '';
                    }
                    if (parseInt(fontWeight) > 500) {
                        fontStyle += (fontStyle ? '|' : '') + 'bold';
                    }
                    return true;
                });
                const fontData = {
                    fontFamily,
                    fontStyle,
                    fontWeight,
                    fontSize: stored.fontSize,
                    color: Resource.addColor(stored.color),
                    backgroundColor: Resource.addColor(stored.backgroundColor)
                };
                for (let j = 0; j < 6; ++j) {
                    const key = FONT_STYLEKEYS[j];
                    let value: Undef<string> = fontData[key];
                    if (value) {
                        if (j === 3 && convertPixels) {
                            value = convertLength(value, true);
                        }
                        safeNestedArray(safeNestedMap(sorted, j), FONT_STYLE[key] + value + '"').push(id);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: SharedAttributes = {};
        for (const tag in groupMap) {
            const styleTag = {};
            style[tag] = styleTag;
            const sorted = groupMap[tag].filter(item => !!item).sort((a, b) => {
                let maxA = 0, maxB = 0;
                let countA = 0, countB = 0;
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
                    return maxA > maxB ? -1 : 1;
                }
                else if (countA !== countB) {
                    return countA > countB ? -1 : 1;
                }
                return 0;
            });
            do {
                if (sorted.length === 1) {
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
                    const styleKey: AttributeMap = {};
                    for (let i = 0; i < sorted.length; ++i) {
                        const filtered: AttributeMap = {};
                        const dataA = sorted[i];
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
                            const found: AttributeMap = {};
                            let merged = false;
                            for (let j = 0; j < sorted.length; ++j) {
                                if (i !== j) {
                                    const dataB = sorted[j];
                                    for (const attr in dataB) {
                                        const compare = dataB[attr];
                                        if (compare.length) {
                                            for (const id of ids) {
                                                if (compare.includes(id)) {
                                                    safeNestedArray(found, attr).push(id);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            for (const attrB in found) {
                                const dataB = found[attrB];
                                if (dataB.length > 1) {
                                    filtered[(attrA < attrB ? attrA + ';' + attrB : attrB + ';' + attrA)] = dataB;
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
                            const joinArray: StringMap = {};
                            for (const attr in filtered) {
                                joinArray[attr] = filtered[attr].join(',');
                            }
                            for (const attrA in filtered) {
                                for (const attrB in filtered) {
                                    const index = joinArray[attrA];
                                    if (attrA !== attrB && index === joinArray[attrB]) {
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
                                deleteStyleAttribute(sorted, attr, filtered[attr]);
                                styleTag[attr] = filtered[attr];
                            }
                            for (const attr in combined) {
                                const attrs = Array.from(combined[attr]).sort().join(';');
                                const ids = plainMap(attr.split(','), value => parseInt(value));
                                deleteStyleAttribute(sorted, attrs, ids);
                                styleTag[attrs] = ids;
                            }
                        }
                    }
                    const shared = Object.keys(styleKey);
                    if (shared.length) {
                        styleTag[shared.join(';')] = styleKey[shared[0]];
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
        const resourceMap: TagNameMap = {};
        const nodeMap: NodeStyleMap = {};
        const parentStyle = new Set<string>();
        for (const tag in style) {
            const styleTag = style[tag];
            const styleData: StyleAttribute[] = [];
            for (const attrs in styleTag) {
                const items: StringValue[] = [];
                for (const value of attrs.split(';')) {
                    const match = REGEX_ATTRIBUTE.exec(value);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                }
                styleData.push({
                    name: '',
                    parent: '',
                    items,
                    ids: styleTag[attrs]
                });
            }
            styleData.sort((a, b) => {
                let c: number | string = a.ids!.length;
                let d: number | string = b.ids!.length;
                if (c === d) {
                    c = (a.items as StringValue[]).length;
                    d = (b.items as StringValue[]).length;
                    if (c === d) {
                        c = a.name;
                        d = b.name;
                    }
                }
                return c <= d ? 1 : -1;
            });
            const length = styleData.length;
            for (let i = 0; i < length; ++i) {
                styleData[i].name = capitalize(tag) + (i > 0 ? '_' + i : '');
            }
            resourceMap[tag] = styleData;
        }
        for (const tag in resourceMap) {
            for (const group of resourceMap[tag]) {
                const ids = group.ids;
                if (ids) {
                    for (const id of ids) {
                        safeNestedArray(nodeMap, id).push(group.name);
                    }
                }
            }
        }
        for (const node of cache) {
            const styleData = nodeMap[node.id];
            if (styleData) {
                if (styleData.length > 1) {
                    parentStyle.add(styleData.join('.'));
                    styleData.shift();
                }
                else {
                    parentStyle.add(styleData[0]);
                }
                node.attr('_', 'style', `@style/${styleData.join('.')}`);
            }
        }
        for (const value of parentStyle) {
            const styleName: string[] = [];
            let parent = '';
            let items: Undef<StringValue[]>;
            const values = value.split('.');
            const length = values.length;
            for (let i = 0; i < length; ++i) {
                const name = values[i];
                const match = REGEX_TAGNAME.exec(name);
                if (match) {
                    const styleData = resourceMap[match[1].toUpperCase()][convertInt(match[2])];
                    if (styleData) {
                        if (i === 0) {
                            parent = name;
                            if (length === 1) {
                                items = styleData.items as StringValue[];
                            }
                            else if (!styles.has(name)) {
                                styles.set(name, { name, parent: '', items: styleData.items });
                            }
                        }
                        else {
                            if (items) {
                                for (const item of styleData.items as StringValue[]) {
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
                                items = (styleData.items as StringValue[]).slice(0);
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
                    const name = styleName.join('.');
                    styles.set(name, { name, parent, items });
                }
            }
        }
    }
}