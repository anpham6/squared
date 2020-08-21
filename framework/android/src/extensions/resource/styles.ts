import Resource from '../../resource';

import { createStyleAttribute } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

const REGEXP_STYLEATTR = /(\w+:(\w+))="([^"]+)"/;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeDocumentWrite(options: DocumentWriteExtensionUIOptions<T>) {
        const styles = (Resource.STORED as AndroidResourceStoredMap).styles;
        const rendered = options.rendered;
        for (let i = 0, length = rendered.length; i < length; ++i) {
            next: {
                const renderChildren = rendered[i].renderChildren;
                const q = renderChildren.length;
                if (q > 1) {
                    const controlId = rendered[i].controlId;
                    if (controlId === '') {
                        continue;
                    }
                    const attrMap: ObjectMap<number> = {};
                    let style = '';
                    for (let j = 0; j < q; ++j) {
                        const item = renderChildren[j] as T;
                        const combined = item.combine('_', 'android');
                        let found: Undef<boolean>;
                        for (let k = 0, r = combined.length; k < r; ++k) {
                            const value = combined[k];
                            if (!found && value.startsWith('style=')) {
                                if (j === 0) {
                                    style = value;
                                }
                                else if (style === '' || value !== style) {
                                    break next;
                                }
                                found = true;
                            }
                            else {
                                attrMap[value] = (attrMap[value] || 0) + 1;
                            }
                        }
                        if (!found && style !== '') {
                            break next;
                        }
                    }
                    const keys: string[] = [];
                    for (const attr in attrMap) {
                        if (attrMap[attr] === q) {
                            keys.push(attr);
                        }
                    }
                    const r = keys.length;
                    if (r > 1) {
                        if (style !== '') {
                            style = style.substring(style.indexOf('/') + 1, style.length - 1);
                        }
                        const items: StringValue[] = [];
                        const attrs: string[] = [];
                        for (let j = 0; j < r; ++j) {
                            const match = REGEXP_STYLEATTR.exec(keys[j]);
                            if (match) {
                                items.push({ key: match[1], value: match[3] });
                                attrs.push(match[2]);
                            }
                        }
                        const name = (style !== '' ? style + '.' : '') + capitalize(controlId);
                        if (!styles.has(name)) {
                            items.sort((a, b) => a.key < b.key ? -1 : 1);
                            styles.set(name, Object.assign(createStyleAttribute(), { name, items }));
                        }
                        for (let j = 0; j < q; ++j) {
                            const item = renderChildren[j];
                            item.attr('_', 'style', `@style/${name}`);
                            item.delete('android', ...attrs);
                        }
                    }
                }
            }
        }
    }
}