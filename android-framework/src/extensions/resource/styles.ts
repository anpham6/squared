import { ResourceStoredMapAndroid } from '../../../../@types/android/application';

import Resource from '../../resource';
import View from '../../view';

import { STRING_ANDROID } from '../../lib/constant';
import { createStyleAttribute } from '../../lib/util';

const {
    regex: $regex,
    util: $util
} = squared.lib;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEXP_ATTRIBUTE = /(\w+):(\w+)="([^"]+)"/;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        const styles: ObjectMap<string[]> = {};
        const styleCache: StringMap = {};
        for (const node of this.application.session.cache) {
            if (node.visible && node.controlId) {
                const renderChildren = node.renderChildren;
                const length = renderChildren.length;
                if (length > 1) {
                    const attrMap = new Map<string, number>();
                    let valid = true;
                    let style = '';
                    for (let i = 0; i < length; i++) {
                        const item = renderChildren[i] as T;
                        let found = false;
                        for (const value of item.combine('_', STRING_ANDROID.ANDROID)) {
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
                                style = $util.trimString(style.substring(style.indexOf('/') + 1), '"');
                            }
                            const common: string[] = [];
                            for (const attr of attrMap.keys()) {
                                const match = REGEXP_ATTRIBUTE.exec(attr);
                                if (match) {
                                    for (const item of renderChildren) {
                                        item.delete(match[1], match[2]);
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
                            if (style === '' || !name.startsWith(`${style}.`)) {
                                name = (style !== '' ? style + '.' : '') + $util.capitalize(node.controlId);
                                styles[name] = common;
                                styleCache[name] = commonString;
                            }
                            for (const item of renderChildren) {
                                item.attr('_', 'style', `@style/${name}`);
                            }
                        }
                    }
                }
            }
        }
        for (const name in styles) {
            const items: StringValue[] = [];
            const data = styles[name];
            for (const attr in data) {
                const match = $regex.XML.ATTRIBUTE.exec(data[attr]);
                if (match) {
                    items.push({ key: match[1], value: match[2] });
                }
            }
            STORED.styles.set(name, { ...createStyleAttribute(), name, items });
        }
    }
}