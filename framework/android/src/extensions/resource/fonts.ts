import Resource from '../../resource';

import { BUILD_ANDROID } from '../../lib/enumeration';

type View = android.base.View;
type StyleList = ObjectMap<number[]>;
type SharedAttributes = ObjectMapNested<number[]>;
type AttributeMap = ObjectMap<number[]>;
type TagNameMap = ObjectMap<StyleAttribute[]>;
type NodeStyleMap = ObjectMap<string[]>;

const { capitalize, convertInt, convertWord, hasKeys, replaceMap, spliceArray, trimBoth } = squared.lib.util;
const { truncate } = squared.lib.math;

const { NODE_RESOURCE } = squared.base.lib.enumeration;

const REGEXP_FONTATTRIBUTE = /([^\s]+)="((?:[^"]|\\")+)"/;
const REGEXP_FONTNAME = /^(\w*?)(?:_(\d+))?$/;

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

function deleteStyleAttribute(sorted: AttributeMap[], attrs: string, ids: number[]) {
    const items = attrs.split(';');
    for (let i = 0, length = items.length, q = sorted.length; i < length; ++i) {
        const value = items[i];
        found: {
            for (let j = 0; j < q; ++j) {
                const data = sorted[j];
                for (const attr in data) {
                    if (attr === value) {
                        data[attr] = data[attr].filter(id => !ids.includes(id));
                        if (data[attr].length === 0) {
                            delete data[attr];
                        }
                        break found;
                    }
                }
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
        const { fonts, styles } = resource.mapOfStored as AndroidResourceStoredMap;
        const styleKeys = Object.keys(FONT_STYLE);
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList[]> = {};
        let cache: T[] = [];
        this.application.getProcessingCache(sessionId).each(node => {
            if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE.FONT_STYLE)) {
                (nameMap[node.containerName] || (nameMap[node.containerName] = [])).push(node);
            }
        });
        for (const tag in nameMap) {
            const sorted: StyleList[] = [];
            const data = nameMap[tag];
            cache = cache.concat(data);
            for (let i = 0, length = data.length; i < length; ++i) {
                let node = data[i];
                const stored = node.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle')!;
                const { id, companion } = node;
                let { fontFamily, fontStyle, fontWeight } = stored;
                if (companion && companion.tagName === 'LABEL' && !companion.visible) {
                    node = companion as T;
                }
                fontFamily.replace(/"/g, '').split(',').some((value, index, array) => {
                    value = trimBoth(value.trim(), "'").toLowerCase();
                    let fontName = value,
                        actualFontWeight = '';
                    if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                        fontName = defaultFontFamily;
                    }
                    if (api >= FONT_ANDROID[fontName] || !disableFontAlias && api >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
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
                            font[`${value}|${fontStyle}|${fontWeight}`] = FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
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
                    backgroundColor: Resource.addColor(stored.backgroundColor, node.inputElement)
                };
                for (let j = 0; j < 6; ++j) {
                    const key = styleKeys[j];
                    let value: Undef<string> = fontData[key];
                    if (value) {
                        if (j === 3 && convertPixels) {
                            value = truncate(value, floatPrecision) + 'sp';
                        }
                        const items = sorted[j] || (sorted[j] = {});
                        const name = FONT_STYLE[key] + value + '"';
                        (items[name] || (items[name] = [])).push(id);
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
                    const styleKey: AttributeMap = {};
                    for (let i = 0; i < length; ++i) {
                        const dataA = sorted[i];
                        const filtered: AttributeMap = {};
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
                            let merged: Undef<boolean>;
                            for (let j = 0; j < length; ++j) {
                                if (i !== j) {
                                    const dataB = sorted[j];
                                    for (const attr in dataB) {
                                        const compare = dataB[attr];
                                        if (compare.length) {
                                            for (let k = 0, q = ids.length; k < q; ++k) {
                                                if (compare.includes(ids[k])) {
                                                    (found[attr] || (found[attr] = [])).push(ids[k]);
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
                            const joinArray: StringMap = {};
                            for (const attr in filtered) {
                                joinArray[attr] = filtered[attr].join(',');
                            }
                            for (const attrA in filtered) {
                                for (const attrB in filtered) {
                                    const index = joinArray[attrA]!;
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
                                const ids = replaceMap(attr.split(','), value => parseInt(value));
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
                    const match = REGEXP_FONTATTRIBUTE.exec(value);
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
                let c: NumString = a.ids!.length,
                    d: NumString = b.ids!.length;
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
            for (let i = 0, length = styleData.length; i < length; ++i) {
                styleData[i].name = capitalize(tag) + (i ? '_' + i : '');
            }
            resourceMap[tag] = styleData;
        }
        for (const tag in resourceMap) {
            for (const group of resourceMap[tag]) {
                const ids = group.ids;
                if (ids) {
                    for (let i = 0, length = ids.length; i < length; ++i) {
                        (nodeMap[ids[i]] || (nodeMap[ids[i]] = [])).push(group.name);
                    }
                }
            }
        }
        for (let i = 0, length = cache.length; i < length; ++i) {
            const node = cache[i];
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
            const values = value.split('.');
            let parent = '',
                items: Undef<StringValue[]>;
            for (let i = 0, q = values.length; i < q; ++i) {
                const name = values[i];
                const match = REGEXP_FONTNAME.exec(name);
                if (match) {
                    const styleData = resourceMap[match[1].toUpperCase()][convertInt(match[2])];
                    if (styleData) {
                        if (i === 0) {
                            parent = name;
                            if (q === 1) {
                                items = styleData.items as StringValue[];
                            }
                            else if (!styles.has(name)) {
                                styles.set(name, { name, parent: '', items: styleData.items });
                            }
                        }
                        else {
                            if (items) {
                                const styleItems = styleData.items as StringValue[];
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