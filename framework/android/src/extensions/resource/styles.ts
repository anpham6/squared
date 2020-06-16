import Resource from '../../resource';

import { createStyleAttribute } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        const STORED = Resource.STORED as AndroidResourceStoredMap;
        this.cache.each(node => {
            if (node.controlId && node.visible) {
                const renderChildren = node.renderChildren;
                const length = renderChildren.length;
                if (length > 1) {
                    const attrMap: ObjectMap<number> = {};
                    let style = '';
                    let i = 0, j: number;
                    while (i < length) {
                        const item = renderChildren[i++] as T;
                        const combined = item.combine('_', 'android');
                        let found = false;
                        const q = combined.length;
                        j = 0;
                        while (j < q) {
                            const value = combined[j++];
                            if (!found && value.startsWith('style=')) {
                                if (i === 0) {
                                    style = value;
                                }
                                else if (style === '' || value !== style) {
                                    return;
                                }
                                found = true;
                            }
                            else {
                                attrMap[value] = (attrMap[value] || 0) + 1;
                            }
                        }
                        if (!found && style !== '') {
                            return;
                        }
                    }
                    const keys: string[] = [];
                    for (const attr in attrMap) {
                        if (attrMap[attr] === length) {
                            keys.push(attr);
                        }
                    }
                    const q = keys.length;
                    if (q > 1) {
                        if (style !== '') {
                            style = style.substring(style.indexOf('/') + 1, style.length - 1);
                        }
                        const items: StringValue[] = [];
                        const attrs: string[] = [];
                        i = 0;
                        while (i < q) {
                            const match = /(\w+:(\w+))="([^"]+)"/.exec(keys[i++]);
                            if (match) {
                                items.push({ key: match[1], value: match[3] });
                                attrs.push(match[2]);
                            }
                        }
                        const name = (style !== '' ? style + '.' : '') + capitalize(node.controlId);
                        if (!STORED.styles.has(name)) {
                            items.sort((a, b) => a.key < b.key ? -1 : 1);
                            STORED.styles.set(name, Object.assign(createStyleAttribute(), { name, items }));
                        }
                        i = 0;
                        while (i < length) {
                            const item = renderChildren[i++];
                            item.attr('_', 'style', `@style/${name}`);
                            item.delete('android', ...attrs);
                        }
                    }
                }
            }
        });
    }
}