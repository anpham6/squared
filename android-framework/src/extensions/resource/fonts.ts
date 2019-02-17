import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from '../../@types/application';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID } from '../../lib/enumeration';
import { replaceUnit } from '../../lib/util';

type StyleList = ObjectMap<number[]>;
type SharedAttributes = ObjectMapNested<number[]>;
type AttributeMap = ObjectMap<number[]>;
type TagNameMap = ObjectMap<StyleAttribute[]>;
type NodeStyleMap = ObjectMapNested<string[]>;

const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

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
    '-apple-system': 'sans-serif'
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
    'fontFamily': 'android:fontFamily="{0}"',
    'fontStyle': 'android:textStyle="{0}"',
    'fontWeight': 'android:fontWeight="{0}"',
    'fontSize': 'android:textSize="{0}"',
    'color': 'android:textColor="@color/{0}"',
    'backgroundColor': 'android:background="@color/{0}"'
};

if ($dom.isUserAgent($dom.USER_AGENT.EDGE)) {
    FONTREPLACE_ANDROID['consolas'] = 'monospace';
}

const STORED = <ResourceStoredMapAndroid> Resource.STORED;

function deleteStyleAttribute(sorted: AttributeMap[], attrs: string, ids: number[]) {
    for (const value of attrs.split(';')) {
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i]) {
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
                    sorted[index][key] = sorted[index][key].filter(id => !ids.includes(id));
                    if (sorted[index][key].length === 0) {
                        delete sorted[index][key];
                    }
                    break;
                }
            }
        }
    }
}

export default class ResourceFonts<T extends View> extends squared.base.Extension<T> {
    public readonly options = {
        fontResourceValue: true
    };

    public readonly eventOnly = true;

    public afterParseDocument() {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        const nameMap: ObjectMap<T[]> = {};
        const groupMap: ObjectMap<StyleList[]> = {};
        for (const node of this.application.session.cache) {
            if (node.visible && node.data(Resource.KEY_NAME, 'fontStyle') && !node.hasBit('excludeResource', $enum.NODE_RESOURCE.FONT_STYLE)) {
                if (nameMap[node.tagName] === undefined) {
                    nameMap[node.tagName] = [];
                }
                nameMap[node.tagName].push(node);
            }
        }
        for (const tag in nameMap) {
            const sorted: StyleList[] = [];
            for (let node of nameMap[tag]) {
                const controlId = node.id;
                const companion = node.companion;
                if (companion && !companion.visible && companion.tagName === 'LABEL') {
                    node = companion as T;
                }
                const stored: FontAttribute = Object.assign({}, node.data(Resource.KEY_NAME, 'fontStyle'));
                let system = false;
                stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                if (stored.fontFamily) {
                    let fontFamily = stored.fontFamily.split(',')[0].replace(/"/g, '').toLowerCase().trim();
                    let fontStyle = '';
                    let fontWeight = '';
                    stored.color = Resource.addColor(stored.color);
                    if (this.options.fontResourceValue && FONTREPLACE_ANDROID[fontFamily]) {
                        fontFamily = FONTREPLACE_ANDROID[fontFamily];
                    }
                    if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] ||
                        this.options.fontResourceValue && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]])
                    {
                        system = true;
                        stored.fontFamily = fontFamily;
                        if (stored.fontStyle === 'normal') {
                            delete stored.fontStyle;
                        }
                        if (stored.fontWeight === '400') {
                            delete stored.fontWeight;
                        }
                    }
                    else {
                        fontFamily = $util.convertWord(fontFamily);
                        stored.fontFamily = `@font/${fontFamily + (stored.fontStyle !== 'normal' ? `_${stored.fontStyle}` : '') + (stored.fontWeight !== '400' ? `_${FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight}` : '')}`;
                        fontStyle = stored.fontStyle;
                        fontWeight = stored.fontWeight;
                        delete stored.fontStyle;
                        delete stored.fontWeight;
                    }
                    if (!system) {
                        const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                        fonts[`${fontStyle}-${FONTWEIGHT_ANDROID[fontWeight] || fontWeight}`] = true;
                        Resource.STORED.fonts.set(fontFamily, fonts);
                    }
                }
                const keys = Object.keys(FONT_STYLE);
                for (let i = 0; i < keys.length; i++) {
                    if (sorted[i] === undefined) {
                        sorted[i] = {};
                    }
                    const value: string = stored[keys[i]];
                    if ($util.hasValue(value) && node.supported('android', keys[i])) {
                        const attr = $util.formatString(FONT_STYLE[keys[i]], value);
                        if (sorted[i][attr] === undefined) {
                            sorted[i][attr] = [];
                        }
                        sorted[i][attr].push(controlId);
                    }
                }
            }
            groupMap[tag] = sorted;
        }
        const style: SharedAttributes = {};
        const layout: SharedAttributes = {};
        for (const tag in groupMap) {
            style[tag] = {};
            layout[tag] = {};
            const count = nameMap[tag].length;
            let sorted = groupMap[tag].filter(item => Object.keys(item).length > 0).sort((a, b) => {
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
                        const value = sorted[0][attr];
                        if (value.length === 1) {
                            layout[tag][attr] = value;
                        }
                        else if (value.length > 1) {
                            style[tag][attr] = value;
                        }
                    }
                    sorted.length = 0;
                }
                else {
                    const styleKey: AttributeMap = {};
                    const layoutKey: AttributeMap = {};
                    for (let i = 0; i < sorted.length; i++) {
                        if (!sorted[i]) {
                            continue;
                        }
                        const filtered: AttributeMap = {};
                        const combined: ObjectMap<Set<string>> = {};
                        const deleteKeys = new Set<string>();
                        for (const attr1 in sorted[i]) {
                            const ids: number[] = sorted[i][attr1];
                            let revalidate = false;
                            if (!ids || ids.length === 0) {
                                continue;
                            }
                            else if (ids.length === count) {
                                styleKey[attr1] = ids.slice(0);
                                sorted[i] = {};
                                revalidate = true;
                            }
                            else if (ids.length === 1) {
                                layoutKey[attr1] = ids.slice(0);
                                sorted[i][attr1] = [];
                                revalidate = true;
                            }
                            if (!revalidate) {
                                const found: AttributeMap = {};
                                let merged = false;
                                for (let j = 0; j < sorted.length; j++) {
                                    if (i !== j && sorted[j]) {
                                        for (const attr in sorted[j]) {
                                            const compare = sorted[j][attr];
                                            if (compare.length) {
                                                for (const controlId of ids) {
                                                    if (compare.includes(controlId)) {
                                                        if (found[attr] === undefined) {
                                                            found[attr] = [];
                                                        }
                                                        found[attr].push(controlId);
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
                        }
                        for (const attr1 in filtered) {
                            for (const attr2 in filtered) {
                                if (attr1 !== attr2 && filtered[attr1].join('') === filtered[attr2].join('')) {
                                    const index = filtered[attr1].join(',');
                                    if (combined[index]) {
                                        combined[index] = new Set([...combined[index], ...attr2.split(';')]);
                                    }
                                    else {
                                        combined[index] = new Set([...attr1.split(';'), ...attr2.split(';')]);
                                    }
                                    deleteKeys.add(attr1).add(attr2);
                                }
                            }
                        }
                        for (const value of deleteKeys) {
                            delete filtered[value];
                        }
                        for (const attrs in filtered) {
                            deleteStyleAttribute(sorted, attrs, filtered[attrs]);
                            style[tag][attrs] = filtered[attrs];
                        }
                        for (const index in combined) {
                            const attrs = Array.from(combined[index]).sort().join(';');
                            const ids = $util.replaceMap<string, number>(index.split(','), value => parseInt(value));
                            deleteStyleAttribute(sorted, attrs, ids);
                            style[tag][attrs] = ids;
                        }
                    }
                    const shared = Object.keys(styleKey);
                    if (shared.length) {
                        if (shared.length > 1 || styleKey[shared[0]].length > 1) {
                            style[tag][shared.join(';')] = styleKey[shared[0]];
                        }
                        else {
                            Object.assign(layoutKey, styleKey);
                        }
                    }
                    for (const attr in layoutKey) {
                        layout[tag][attr] = layoutKey[attr];
                    }
                    for (let i = 0; i < sorted.length; i++) {
                        if (sorted[i] && Object.keys(sorted[i]).length === 0) {
                            delete sorted[i];
                        }
                    }
                    sorted = sorted.filter(item => {
                        if (item) {
                            for (const attr in item) {
                                if (item[attr] && item[attr].length) {
                                    return true;
                                }
                            }
                        }
                        return false;
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
                const items: NameValue[] = [];
                for (const value of attrs.split(';')) {
                    const match = $util.REGEXP_PATTERN.ATTRIBUTE.exec(value);
                    if (match) {
                        items.push({ name: match[1], value: match[2] });
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
                            nodeMap[id] = { styles: [], attrs: [] };
                        }
                        nodeMap[id].styles.push(group.name);
                    }
                }
            }
            if (layout[tag]) {
                for (const attr in layout[tag]) {
                    for (const id of layout[tag][attr]) {
                        if (nodeMap[id] === undefined) {
                            nodeMap[id] = { styles: [], attrs: [] };
                        }
                        nodeMap[id].attrs.push(attr);
                    }
                }
            }
        }
        for (const id in nodeMap) {
            const node = this.application.session.cache.find('id', parseInt(id));
            if (node) {
                const styles = nodeMap[id].styles;
                if (styles.length) {
                    parentStyle.add(styles.join('.'));
                    node.attr('_', 'style', `@style/${styles.pop()}`);
                }
                for (const value of nodeMap[id].attrs.sort()) {
                    node.formatted(replaceUnit(value, settings.resolutionDPI, settings.convertPixels, true), false);
                }
            }
        }
        for (const value of parentStyle) {
            let parent = '';
            for (const name of value.split('.')) {
                const match = name.match(/^(\w*?)(?:_(\d+))?$/);
                if (match) {
                    const data = resource[match[1].toUpperCase()];
                    const index = match[2] ? parseInt(match[2]) : 0;
                    if (data[index]) {
                        STORED.styles.set(name, { ...data[index], name, parent });
                        parent = name;
                    }
                }
            }
        }
    }
}