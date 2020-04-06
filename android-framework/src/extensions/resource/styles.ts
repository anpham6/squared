import type { ResourceStoredMapAndroid } from '../../../../@types/android/application';

import Resource from '../../resource';

import { createStyleAttribute } from '../../lib/util';

type View = android.base.View;

const $lib = squared.lib;

const { XML } = $lib.regex;
const { capitalize, trimString } = $lib.util;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
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
                    const attrMap = new Map<string, number>();
                    let valid = true;
                    let style = '';
                    for (let i = 0; i < length; i++) {
                        const item = renderChildren[i] as T;
                        let found = false;
                        const combined = item.combine('_', 'android');
                        const q = combined.length;
                        for (let j = 0; j < q; j++) {
                            const value = combined[j];
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
                                attrMap.set(value, (attrMap.get(value) || 0) + 1);
                            }
                        }
                        if (!valid || !found && style !== '') {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        for (const [attr, value] of attrMap.entries()) {
                            if (value !== length) {
                                attrMap.delete(attr);
                            }
                        }
                        if (attrMap.size > 1) {
                            if (style !== '') {
                                style = trimString(style.substring(style.indexOf('/') + 1), '"');
                            }
                            const common: string[] = [];
                            for (const attr of attrMap.keys()) {
                                const match = REGEX_ATTRIBUTE.exec(attr);
                                if (match) {
                                    renderChildren.forEach(item => item.delete(match[1], match[2]));
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
                            renderChildren.forEach(item => item.attr('_', 'style', `@style/${name}`));
                        }
                    }
                }
            }
        });
        for (const name in styles) {
            const items: StringValue[] = [];
            styles[name].forEach(style => {
                const match = XML.ATTRIBUTE.exec(style);
                if (match) {
                    items.push({ key: match[1], value: match[2] });
                }
            });
            STORED.styles.set(name, { ...createStyleAttribute(), name, items });
        }
    }
}