import type View from '../../view';

import Resource from '../../resource';

const { capitalize, splitPair, splitPairEnd, startsWith, trimEnclosing } = squared.lib.util;

export default class ResourceStyles<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeFinalize(data: FinalizeDataExtensionUI<T>) {
        const styles = Resource.STORED[data.resourceId]!.styles;
        const rendered = data.rendered;
        for (let i = 0, length = rendered.length; i < length; ++i) {
            next: {
                const children = rendered[i].renderChildren;
                const q = children.length;
                if (q > 1) {
                    let keys!: string[],
                        r = 0,
                        style = '';
                    for (let j = 0; j < q; ++j) {
                        const item = children[j] as T;
                        const unnamed = item.combine(false, '_').find(attr => startsWith(attr, 'style='));
                        if (unnamed) {
                            if (j === 0) {
                                style = unnamed;
                            }
                            else if (!style || unnamed !== style) {
                                break next;
                            }
                        }
                        else if (style) {
                            break next;
                        }
                        const items = item.combine(false, 'android');
                        if (j === 0) {
                            keys = items;
                        }
                        else {
                            r = keys.length;
                            for (let k = 0; k < r; ++k) {
                                if (!items.includes(keys[k])) {
                                    keys.splice(k--, 1);
                                    if (--r <= 1) {
                                        break next;
                                    }
                                }
                            }
                        }
                    }
                    const items: StringValue[] = [];
                    const attrs: string[] = [];
                    for (let j = 0; j < r; ++j) {
                        const [key, trailing] = splitPair(keys[j], '=');
                        const attr = splitPairEnd(key, ':');
                        if (attr) {
                            items.push({ key, value: trimEnclosing(trailing) });
                            attrs.push(attr);
                        }
                    }
                    style &&= style.substring(style.indexOf('/') + 1, style.length - 1) + '.';
                    const name = style + capitalize(rendered[i].controlId || 'unknown');
                    items.sort((a, b) => a.key < b.key ? -1 : 1);
                    styles.set(name, { name, parent: '', items } as StyleAttribute);
                    for (let j = 0; j < q; ++j) {
                        const item = children[j];
                        item.attrx('style', `@style/${name}`);
                        item.delete('android', ...attrs);
                    }
                }
            }
        }
    }
}