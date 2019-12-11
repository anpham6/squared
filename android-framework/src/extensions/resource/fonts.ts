import { ResourceStoredMapAndroid, StyleAttribute } from '../../../../@types/android/application';
import { ResourceFontsOptions } from '../../../../@types/android/extension';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID } from '../../lib/enumeration';
import { convertLength } from '../../lib/util';

const $lib = squared.lib;
const { XML } = $lib.regex;
const { capitalize, convertInt, convertWord, filterArray, objectMap, spliceArray, trimString } = $lib.util;

const { NODE_RESOURCE } = squared.base.lib.enumeration;

type StyleList = ObjectMap<number[]>;
type SharedAttributes = ObjectMapNested<number[]>;
type AttributeMap = ObjectMap<number[]>;
type TagNameMap = ObjectMap<StyleAttribute[]>;
type NodeStyleMap = ObjectMap<string[]>;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEXP_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
const REGEXP_DOUBLEQUOTE = /"/g;
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
    const length = sorted.length;
    for (const value of attrs.split(';')) {
        for (let i = 0; i < length; i++) {
            let index = -1;
            let key = '';
            let data = sorted[i];
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
                data[key] = filterArray(data[key], id => !ids.includes(id));
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
        const resource = <android.base.Resource<T>> this.resource;
        const settings = resource.userSettings;
        const disableFontAlias = this.options.disableFontAlias;
        const dpi = settings.resolutionDPI;
        const convertPixels = settings.convertPixels === 'dp';
        const { fonts, styles } = STORED;
        const styleKeys = Object.keys(FONT_STYLE);
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList[]> = {};
        for (const node of this.application.session.cache) {
            if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE.FONT_STYLE)) {
                const containerName = node.containerName;
                let map = nameMap[containerName];
                if (map === undefined) {
                    map = [];
                    nameMap[containerName] = map;
                }
                map.push(node);
            }
        }
        for (const tag in nameMap) {
            const sorted: StyleList[] = [];
            const data = nameMap[tag];
            for (let node of data) {
                const { id, companion } = node;
                const targetAPI = node.localSettings.targetAPI;
                const stored = <FontAttribute> node.data(Resource.KEY_NAME, 'fontStyle');
                let { fontFamily, fontStyle, fontWeight } = stored;
                if (companion?.tagName === 'LABEL' && !companion.visible) {
                    node = companion as T;
                }
                fontFamily.replace(REGEXP_DOUBLEQUOTE, '').split(XML.SEPARATOR).some((value, index, array) => {
                    value = trimString(value, "'").toLowerCase();
                    let fontName = value;
                    let customFont = false;
                    if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                        fontName = this.options.systemDefaultFont;
                    }
                    if (targetAPI >= FONT_ANDROID[fontName] || !disableFontAlias && targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
                        fontFamily = fontName;
                        customFont = true;
                    }
                    else if (fontStyle && fontWeight) {
                        let createFont = true;
                        if (resource.getFont(value, fontStyle, fontWeight) === undefined) {
                            if (resource.getFont(value, fontStyle)) {
                                createFont = false;
                            }
                            else if (index < array.length - 1) {
                                return false;
                            }
                            else if (index > 0) {
                                value = trimString(array[0], "'").toLowerCase();
                                fontName = value;
                            }
                        }
                        fontName = convertWord(fontName);
                        if (createFont) {
                            const font = fonts.get(fontName) || {};
                            font[value + '|' + fontStyle + '|' + fontWeight] = FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
                            fonts.set(fontName, font);
                        }
                        fontFamily = '@font/' + fontName;
                        customFont = true;
                    }
                    if (customFont) {
                        if (fontStyle === 'normal') {
                            fontStyle = '';
                        }
                        if (fontWeight === '400' || node.localSettings.targetAPI < BUILD_ANDROID.OREO) {
                            fontWeight = '';
                        }
                        else if (parseInt(fontWeight) > 500) {
                            fontStyle += (fontStyle ? '|' : '') + 'bold';
                        }
                        return true;
                    }
                    return false;
                });
                const fontData = {
                    fontFamily,
                    fontStyle,
                    fontWeight,
                    fontSize: stored.fontSize,
                    color: Resource.addColor(stored.color),
                    backgroundColor: Resource.addColor(stored.backgroundColor)
                };
                for (let i = 0; i < 6; i++) {
                    const key = styleKeys[i];
                    let value: string | undefined = fontData[key];
                    if (value) {
                        if (i === 3 && convertPixels) {
                            value = convertLength(value, dpi, true);
                        }
                        const attr = FONT_STYLE[key] + value + '"';
                        let dataIndex = sorted[i];
                        if (dataIndex === undefined) {
                            dataIndex = {};
                            sorted[i] = dataIndex;
                        }
                        let dataAttr = dataIndex[attr];
                        if (dataAttr === undefined) {
                            dataAttr = [];
                            dataIndex[attr] = dataAttr;
                        }
                        dataAttr.push(id);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: SharedAttributes = {};
        for (const tag in groupMap) {
            const styleTag = {};
            style[tag] = styleTag;
            const sorted = filterArray(groupMap[tag], item => item !== undefined).sort((a, b) => {
                let maxA = 0;
                let maxB = 0;
                let countA = 0;
                let countB = 0;
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
                    sorted.length = 0;
                }
                else {
                    const styleKey: AttributeMap = {};
                    for (let i = 0; i < sorted.length; i++) {
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
                            for (let j = 0; j < sorted.length; j++) {
                                if (i !== j) {
                                    const dataB = sorted[j];
                                    for (const attr in dataB) {
                                        const compare = dataB[attr];
                                        if (compare.length) {
                                            for (const id of ids) {
                                                if (compare.includes(id)) {
                                                    let dataC = found[attr];
                                                    if (dataC === undefined) {
                                                        dataC = [];
                                                        found[attr] = dataC;
                                                    }
                                                    dataC.push(id);
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
                        if (Object.keys(filtered).length) {
                            const combined: ObjectMap<Set<string>> = {};
                            const deleteKeys = new Set<string>();
                            const joinMap: StringMap = {};
                            for (const attr in filtered) {
                                joinMap[attr] = filtered[attr].join(',');
                            }
                            for (const attrA in filtered) {
                                for (const attrB in filtered) {
                                    const index = joinMap[attrA];
                                    if (attrA !== attrB && index === joinMap[attrB]) {
                                        let data = combined[index];
                                        if (data === undefined) {
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
                            for (const attr of deleteKeys) {
                                delete filtered[attr];
                            }
                            for (const attr in filtered) {
                                deleteStyleAttribute(sorted, attr, filtered[attr]);
                                styleTag[attr] = filtered[attr];
                            }
                            for (const attr in combined) {
                                const attrs = Array.from(combined[attr]).sort().join(';');
                                const ids = objectMap<string, number>(attr.split(XML.SEPARATOR), value => parseInt(value));
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
                    const match = XML.ATTRIBUTE.exec(value);
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
                let c: number | string = (a.ids as []).length;
                let d: number | string = (b.ids as []).length;
                if (c === d) {
                    const itemA = <StringValue[]> a.items;
                    const itemB = <StringValue[]> b.items;
                    c = (itemA as []).length;
                    d = (itemB as []).length;
                    if (c === d) {
                        c = a.name;
                        d = b.name;
                    }
                }
                return c <= d ? 1 : -1;
            });
            const lengthA = styleData.length;
            for (let i = 0; i < lengthA; i++) {
                styleData[i].name = capitalize(tag) + (i > 0 ? '_' + i : '');
            }
            resourceMap[tag] = styleData;
        }
        for (const tag in resourceMap) {
            for (const group of resourceMap[tag]) {
                const ids = group.ids;
                if (ids) {
                    for (const id of ids) {
                        let map = nodeMap[id];
                        if (map === undefined) {
                            map = [];
                            nodeMap[id] = map;
                        }
                        map.push(group.name);
                    }
                }
            }
        }
        for (const node of this.application.session.cache) {
            const styleData = nodeMap[node.id];
            if (styleData?.length) {
                switch (node.tagName) {
                    case 'METER':
                    case 'PROGRESS':
                        node.attr('_', 'style', '@android:style/Widget.ProgressBar.Horizontal');
                        break;
                    default:
                        if (styleData.length > 1) {
                            parentStyle.add(styleData.join('.'));
                            styleData.shift();
                        }
                        else {
                            parentStyle.add(styleData[0]);
                        }
                        node.attr('_', 'style', '@style/' + styleData.join('.'));
                        break;
                }
            }
        }
        for (const value of parentStyle) {
            const styleName: string[] = [];
            let parent = '';
            let items: StringValue[] | undefined;
            value.split('.').forEach((tag, index, array) => {
                const match = REGEXP_TAGNAME.exec(tag);
                if (match) {
                    const styleData = resourceMap[match[1].toUpperCase()][convertInt(match[2])];
                    if (styleData) {
                        if (index === 0) {
                            parent = tag;
                            if (array.length === 1) {
                                items = <StringValue[]> styleData.items;
                            }
                            else if (!styles.has(tag)) {
                                styles.set(tag, { name: tag, parent: '', items: styleData.items });
                            }
                        }
                        else {
                            if (items) {
                                for (const item of styleData.items as StringValue[]) {
                                    const key = items.findIndex(previous => previous.key === item.key);
                                    if (key !== -1) {
                                        items[key] = item;
                                    }
                                    else {
                                        items.push(item);
                                    }
                                }
                            }
                            else {
                                items = (<StringValue[]> styleData.items).slice(0);
                            }
                            styleName.push(tag);
                        }
                    }
                }
            });
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