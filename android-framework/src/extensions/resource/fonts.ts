import { ResourceStoredMapAndroid, StyleAttribute } from '../../@types/application';
import { ResourceFontsOptions } from '../../@types/extension';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID } from '../../lib/enumeration';

type StyleList = ObjectMap<number[]>;
type SharedAttributes = ObjectMapNested<number[]>;
type AttributeMap = ObjectMap<number[]>;
type TagNameMap = ObjectMap<StyleAttribute[]>;
type NodeStyleMap = ObjectMap<string[]>;

const $regex = squared.lib.regex;
const $util = squared.lib.util;
const $e = squared.base.lib.enumeration;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEXP_DOUBLEQUOTE = /"/g;
const REGEXP_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
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
    for (const value of attrs.split(';')) {
        for (let i = 0; i < sorted.length; i++) {
            let index = -1;
            let key = '';
            for (const j in sorted[i]) {
                if (j === value) {
                    index = i;
                    key = j;
                    i = sorted.length;
                    break;
                }
            }
            if (index !== -1) {
                sorted[index][key] = $util.filterArray(sorted[index][key], id => !ids.includes(id));
                if (sorted[index][key].length === 0) {
                    delete sorted[index][key];
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
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList[]> = {};
        for (const node of this.application.session.cache) {
            if (node.visible && node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource($e.NODE_RESOURCE.FONT_STYLE)) {
                if (nameMap[node.containerName] === undefined) {
                    nameMap[node.containerName] = [];
                }
                nameMap[node.containerName].push(node);
            }
        }
        const styleKeys = Object.keys(FONT_STYLE);
        for (const tag in nameMap) {
            const sorted: StyleList[] = [];
            for (let node of nameMap[tag]) {
                const stored: FontAttribute = { ...node.data(Resource.KEY_NAME, 'fontStyle') };
                const id = node.id;
                if (node.companion && !node.companion.visible && node.companion.tagName === 'LABEL') {
                    node = node.companion as T;
                }
                if (stored.backgroundColor) {
                    stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                }
                if (stored.fontFamily) {
                    stored.fontFamily.replace(REGEXP_DOUBLEQUOTE, '').split($regex.XML.SEPARATOR).some((value, index, array) => {
                        value = $util.trimString(value, "'");
                        let fontFamily = value.toLowerCase();
                        if (!this.options.disableFontAlias && FONTREPLACE_ANDROID[fontFamily]) {
                            fontFamily = this.options.systemDefaultFont || FONTREPLACE_ANDROID[fontFamily];
                        }
                        if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] || !this.options.disableFontAlias && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]]) {
                            stored.fontFamily = fontFamily;
                            if (stored.fontStyle === 'normal') {
                                stored.fontStyle = '';
                            }
                            if (stored.fontWeight === '400' || node.localSettings.targetAPI < BUILD_ANDROID.OREO) {
                                stored.fontWeight = '';
                            }
                            return true;
                        }
                        else if (stored.fontStyle && stored.fontWeight) {
                            let createFont = true;
                            if (this.application.resourceHandler.getFont(value, stored.fontStyle, stored.fontWeight) === undefined) {
                                if (this.application.resourceHandler.getFont(value, stored.fontStyle)) {
                                    createFont = false;
                                }
                                else if (index < array.length - 1) {
                                    return false;
                                }
                                else if (index > 0) {
                                    value = $util.trimString(array[0], "'");
                                    fontFamily = value.toLowerCase();
                                }
                            }
                            fontFamily = $util.convertWord(fontFamily);
                            if (createFont) {
                                const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                                fonts[value + '|' + stored.fontStyle + '|' + stored.fontWeight] = FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight;
                                Resource.STORED.fonts.set(fontFamily, fonts);
                            }
                            stored.fontFamily = `@font/${fontFamily}`;
                            stored.fontStyle = '';
                            stored.fontWeight = '';
                            return true;
                        }
                        return false;
                    });
                }
                stored.color = Resource.addColor(stored.color);
                for (let i = 0; i < styleKeys.length; i++) {
                    const value: string = stored[styleKeys[i]];
                    if (value) {
                        const attr = FONT_STYLE[styleKeys[i]] + value + '"';
                        if (sorted[i] === undefined) {
                            sorted[i] = {};
                        }
                        if (sorted[i][attr] === undefined) {
                            sorted[i][attr] = [];
                        }
                        sorted[i][attr].push(id);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: SharedAttributes = {};
        for (const tag in groupMap) {
            style[tag] = {};
            const sorted = $util.filterArray(groupMap[tag], item => item !== undefined).sort((a, b) => {
                let maxA = 0;
                let maxB = 0;
                let countA = 0;
                let countB = 0;
                for (const attr in a) {
                    maxA = Math.max(a[attr].length, maxA);
                    countA += a[attr].length;
                }
                for (const attr in b) {
                    if (b[attr]) {
                        maxB = Math.max(b[attr].length, maxB);
                        countB += b[attr].length;
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
                    for (const attr in sorted[0]) {
                        if (sorted[0][attr].length) {
                            style[tag][attr] = sorted[0][attr];
                        }
                    }
                    sorted.length = 0;
                }
                else {
                    const styleKey: AttributeMap = {};
                    for (let i = 0; i < sorted.length; i++) {
                        const filtered: AttributeMap = {};
                        for (const attr1 in sorted[i]) {
                            const ids = sorted[i][attr1];
                            if (ids.length === 0) {
                                continue;
                            }
                            else if (ids.length === nameMap[tag].length) {
                                styleKey[attr1] = ids;
                                sorted[i] = {};
                                break;
                            }
                            const found: AttributeMap = {};
                            let merged = false;
                            for (let j = 0; j < sorted.length; j++) {
                                if (i !== j) {
                                    for (const attr in sorted[j]) {
                                        const compare = sorted[j][attr];
                                        if (compare.length) {
                                            for (const id of ids) {
                                                if (compare.includes(id)) {
                                                    if (found[attr] === undefined) {
                                                        found[attr] = [];
                                                    }
                                                    found[attr].push(id);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            for (const attr2 in found) {
                                if (found[attr2].length > 1) {
                                    filtered[[attr1, attr2].sort().join(';')] = found[attr2];
                                    merged = true;
                                }
                            }
                            if (!merged) {
                                filtered[attr1] = ids;
                            }
                        }
                        if (Object.keys(filtered).length) {
                            const combined: ObjectMap<Set<string>> = {};
                            const deleteKeys = new Set<string>();
                            const joinMap: StringMap = {};
                            for (const attr in filtered) {
                                joinMap[attr] = filtered[attr].join(',');
                            }
                            for (const attr1 in filtered) {
                                for (const attr2 in filtered) {
                                    const index = joinMap[attr1];
                                    if (attr1 !== attr2 && index === joinMap[attr2]) {
                                        if (combined[index] === undefined) {
                                            combined[index] = new Set(attr1.split(';'));
                                        }
                                        for (const value of attr2.split(';')) {
                                            combined[index].add(value);
                                        }
                                        deleteKeys.add(attr1).add(attr2);
                                    }
                                }
                            }
                            for (const attr of deleteKeys) {
                                delete filtered[attr];
                            }
                            for (const attr in filtered) {
                                deleteStyleAttribute(sorted, attr, filtered[attr]);
                                style[tag][attr] = filtered[attr];
                            }
                            for (const attr in combined) {
                                const attrs = Array.from(combined[attr]).sort().join(';');
                                const ids = $util.objectMap<string, number>(attr.split($regex.XML.SEPARATOR), value => parseInt(value));
                                deleteStyleAttribute(sorted, attrs, ids);
                                style[tag][attrs] = ids;
                            }
                        }
                    }
                    const shared = Object.keys(styleKey);
                    if (shared.length) {
                        style[tag][shared.join(';')] = styleKey[shared[0]];
                    }
                    $util.spliceArray(sorted, item => {
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
        const resource: TagNameMap = {};
        const nodeMap: NodeStyleMap = {};
        const parentStyle = new Set<string>();
        for (const tag in style) {
            const tagData = style[tag];
            const styleData: StyleAttribute[] = [];
            for (const attrs in tagData) {
                const items: StringValue[] = [];
                for (const value of attrs.split(';')) {
                    const match = $regex.XML.ATTRIBUTE.exec(value);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                }
                styleData.push({
                    name: '',
                    parent: '',
                    items,
                    ids: tagData[attrs]
                });
            }
            styleData.sort((a, b) => {
                let c = 0;
                let d = 0;
                if (a.ids && b.ids) {
                    c = a.ids.length;
                    d = b.ids.length;
                }
                if (c === d) {
                    c = (a.items as any[]).length;
                    d = (b.items as any[]).length;
                }
                if (c === d) {
                    c = a.items[0].name;
                    d = b.items[0].name;
                }
                if (c === d) {
                    c = a.items[0].value;
                    d = b.items[0].value;
                }
                return c <= d ? 1 : -1;
            });
            for (let i = 0; i < styleData.length; i++) {
                styleData[i].name = $util.capitalize(tag) + (i > 0 ? `_${i}` : '');
            }
            resource[tag] = styleData;
        }
        for (const tag in resource) {
            for (const group of resource[tag]) {
                if (group.ids) {
                    for (const id of group.ids) {
                        if (nodeMap[id] === undefined) {
                            nodeMap[id] = [];
                        }
                        nodeMap[id].push(group.name);
                    }
                }
            }
        }
        for (const node of this.application.session.cache) {
            const styles = nodeMap[node.id];
            if (styles && styles.length) {
                if (styles.length > 1) {
                    parentStyle.add(styles.join('.'));
                    styles.shift();
                }
                else {
                    parentStyle.add(styles[0]);
                }
                node.attr('_', 'style', `@style/${styles.join('.')}`);
            }
        }
        for (const value of parentStyle) {
            const styleName: string[] = [];
            let items: StringValue[] | undefined;
            let parent = '';
            value.split('.').forEach((tag, index, array) => {
                const match = REGEXP_TAGNAME.exec(tag);
                if (match) {
                    const styleData = resource[match[1].toUpperCase()][$util.convertInt(match[2])];
                    if (styleData) {
                        if (index === 0) {
                            parent = tag;
                            if (array.length === 1) {
                                items = <StringValue[]> styleData.items;
                            }
                            else if (!STORED.styles.has(tag)) {
                                STORED.styles.set(tag, { name: tag, parent: '', items: styleData.items });
                            }
                        }
                        else {
                            if (items) {
                                for (const item of styleData.items as StringValue[]) {
                                    const replaceIndex = items.findIndex(previous => previous.key === item.key);
                                    if (replaceIndex !== -1) {
                                        items[replaceIndex] = item;
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
                    STORED.styles.set(parent, { name: parent, parent: '', items });
                }
                else {
                    const name = styleName.join('.');
                    STORED.styles.set(name, { name, parent, items });
                }
            }
        }
    }
}