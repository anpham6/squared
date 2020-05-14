import Resource from '../../resource';

import { createStyleAttribute } from '../../lib/util';

type View = android.base.View;

const { XML } = squared.lib.regex;
const { capitalize, trimString } = squared.lib.util;

const STORED = Resource.STORED as AndroidResourceStoredMap;
const REGEX_ATTRIBUTE = /(\w+):(\w+)="([^"]+)"/;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        const styles: ObjectMap<string[]> = {};
        const styleCache: StringMap = {};
        this.cache.each(node => {
            if (node.controlId && node.visible) {
                const renderChildren = node.renderChildren;
                const length = renderChildren.length;
                if (length > 1) {
                    const attrMap: ObjectMap<number> = {};
                    let valid = true;
                    let style = '';
                    let i = 0, j: number;
                    while (i < length) {
                        const item = renderChildren[i++] as T;
                        let found = false;
                        const combined = item.combine('_', 'android');
                        const q = combined.length;
                        j = 0;
                        while (j < q) {
                            const value = combined[j++];
                            if (!found && value.startsWith('style=')) {
                                if (i === 0) {
                                    style = value;
                                }
                                else if (style === '' || value !== style) {
                                    valid = false;
                                    break;
                                }
                                found = true;
                            }
                            else {
                                attrMap[value] = (attrMap[value] || 0) + 1;
                            }
                        }
                        if (!valid || !found && style !== '') {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        const keys = [];
                        for (const attr in attrMap) {
                            if (attrMap[attr] === length) {
                                keys.push(attr);
                            }
                        }
                        if (keys.length > 1) {
                            if (style !== '') {
                                style = trimString(style.substring(style.indexOf('/') + 1), '"');
                            }
                            const common: string[] = [];
                            for (const attr of keys) {
                                const match = REGEX_ATTRIBUTE.exec(attr);
                                if (match) {
                                    i = 0;
                                    while (i < length) {
                                        renderChildren[i++].delete(match[1], match[2]);
                                    }
                                    common.push(match[0]);
                                }
                            }
                            common.sort();
                            const commonString = common.join(';');
                            let name = '';
                            for (const index in styleCache) {
                                if (styleCache[index] === commonString) {
                                    name = index;
                                    break;
                                }
                            }
                            if (style === '' || !name.startsWith(style + '.')) {
                                name = (style !== '' ? style + '.' : '') + capitalize(node.controlId);
                                styles[name] = common;
                                styleCache[name] = commonString;
                            }
                            i = 0;
                            while (i < length) {
                                renderChildren[i++].attr('_', 'style', `@style/${name}`);
                            }
                        }
                    }
                }
            }
        });
        for (const name in styles) {
            const items: StringValue[] = [];
            for (const style of styles[name]) {
                const match = XML.ATTRIBUTE.exec(style);
                if (match) {
                    items.push({ key: match[1], value: match[2] });
                }
            }
            STORED.styles.set(name, Object.assign(createStyleAttribute(), { name, items }));
        }
    }
}