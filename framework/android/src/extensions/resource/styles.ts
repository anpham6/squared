import { createStyleAttribute } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

const REGEXP_STYLEATTR = /(\w+:(\w+))="([^"]+)"/;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade(rendered: T[]) {
        const STORED = (this.resource as android.base.Resource<T>).mapOfStored;
        const length = rendered.length;
        let i = 0;
        while (i < length) {
            const node = rendered[i++];
            if (node.controlId && node.visible) {
                const renderChildren = node.renderChildren;
                const q = renderChildren.length;
                if (q > 1) {
                    const attrMap: ObjectMap<number> = {};
                    let style = '';
                    let j = 0, k: number;
                    while (j < q) {
                        const item = renderChildren[j++] as T;
                        const combined = item.combine('_', 'android');
                        let found: Undef<boolean>;
                        const r = combined.length;
                        k = 0;
                        while (k < r) {
                            const value = combined[k++];
                            if (!found && value.startsWith('style=')) {
                                if (j === 0) {
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
                        j = 0;
                        while (j < r) {
                            const match = REGEXP_STYLEATTR.exec(keys[j++]);
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
                        j = 0;
                        while (j < q) {
                            const item = renderChildren[j++];
                            item.attr('_', 'style', `@style/${name}`);
                            item.delete('android', ...attrs);
                        }
                    }
                }
            }
        }
    }
}