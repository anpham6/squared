import Resource from '../../resource';
import View from '../../view';

const $util = squared.lib.util;

export default class ResourceStyles<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public afterProcedure() {
        const styles: ObjectMap<string[]> = {};
        for (const node of this.application.session.cache.visible) {
            const children = node.renderChildren;
            if (node.controlId && children.length > 1) {
                const attrMap = new Map<string, number>();
                let style = '';
                let valid = true;
                for (let i = 0; i < children.length; i++) {
                    let found = false;
                    children[i].combine('_', 'android').some(value => {
                        if (value.startsWith('style=')) {
                            if (i === 0) {
                                style = value;
                            }
                            else {
                                if (style === '' || value !== style) {
                                    valid = false;
                                    return true;
                                }
                            }
                            found = true;
                        }
                        else {
                            attrMap.set(value, (attrMap.get(value) || 0) + 1);
                        }
                        return false;
                    });
                    if (!valid || (style !== '' && !found)) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    for (const [attr, value] of attrMap.entries()) {
                        if (value !== children.length) {
                            attrMap.delete(attr);
                        }
                    }
                    if (attrMap.size > 1) {
                        if (style !== '') {
                            style = $util.trimString(style.substring(style.indexOf('/') + 1), '"');
                        }
                        const common: string[] = [];
                        for (const attr of attrMap.keys()) {
                            const match = attr.match(/(\w+):(\w+)="(.*?)"/);
                            if (match) {
                                children.forEach(item => item.delete(match[1], match[2]));
                                common.push(match[0]);
                            }
                        }
                        common.sort();
                        let name = '';
                        for (const index in styles) {
                            if (styles[index].join(';') === common.join(';')) {
                                name = index;
                                break;
                            }
                        }
                        if (!(name !== '' && style !== '' && name.startsWith(`${style}.`))) {
                            name = $util.convertCamelCase((style !== '' ? `${style}.` : '') + $util.capitalize(node.controlId), '_');
                            styles[name] = common;
                        }
                        children.forEach(item => item.attr('_', 'style', `@style/${name}`));
                    }
                }
            }
        }
        for (const name in styles) {
            Resource.STORED.styles.set(name, {
                name,
                attrs: styles[name].join(';'),
                ids: []
            });
        }
    }
}