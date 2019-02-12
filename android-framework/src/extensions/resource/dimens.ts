import { ResourceStoredMapAndroid } from '../../@types/application';

import Resource from '../../resource';
import View from '../../view';

const $util = squared.lib.util;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;

function getResourceName(map: Map<string, string>, name: string, value: string) {
    for (const [storedName, storedValue] of map.entries()) {
        if (storedName.startsWith(name) && value === storedValue) {
            return storedName;
        }
    }
    return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
}

function getAttributeName(value: string) {
    return $util.convertUnderscore(value).replace('layout_', '');
}

function getDisplayName(value: string) {
    return $util.lastIndexOf(value, '.');
}

export default class ResourceDimens<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public afterProcedure() {
        const groups: ObjectMapNested<T[]> = {};
        for (const node of this.application.session.cache.visible) {
            const tagName = node.tagName.toLowerCase();
            if (groups[tagName] === undefined) {
                groups[tagName] = {};
            }
            ['android', 'app'].forEach(namespace => {
                const obj = node.namespace(namespace);
                for (const attr in obj) {
                    const value = obj[attr].trim();
                    if (/^-?[\d.]+(px|dp|sp)$/.test(value)) {
                        const dimen = `${namespace},${attr},${value}`;
                        if (groups[tagName][dimen] === undefined) {
                            groups[tagName][dimen] = [];
                        }
                        groups[tagName][dimen].push(node);
                    }
                }
            });
        }
        for (const tagName in groups) {
            const group = groups[tagName];
            for (const name in group) {
                const [namespace, attr, value] = name.split(',');
                const key = getResourceName(STORED.dimens, `${getDisplayName(tagName)}_${getAttributeName(attr)}`, value);
                group[name].forEach(node => node[namespace](attr, `@dimen/${key}`));
                STORED.dimens.set(key, value);
            }
        }
    }

    public afterFinalize() {
        for (const view of this.application.viewData) {
            const pattern = /[\s\n]+<[^<]*?(\w+):(\w+)="(-?[\d.]+(?:px|dp|sp))"/;
            let match: RegExpExecArray | null;
            let content = view.content;
            while ((match = pattern.exec(content)) !== null) {
                const controlName = /^[\s\n]+<([\w\-.]+)[\s\n]/.exec(match[0]);
                if (controlName) {
                    const key = getResourceName(STORED.dimens, `${getDisplayName(controlName[1]).toLowerCase()}_${getAttributeName(match[2])}`, match[3]);
                    STORED.dimens.set(key, match[3]);
                    content = content.replace(match[0], match[0].replace(match[3], `@dimen/${key}`));
                }
            }
            view.content = content;
        }
    }
}