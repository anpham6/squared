import { ResourceStoredMapAndroid } from '../../@types/application';

import Resource from '../../resource';

const $regex = squared.lib.regex;
const $util = squared.lib.util;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;

const REGEXP_WIDGETNAME = /[\s\n]*<([\w\-.]+)[^<]*?(\w+):(\w+)="(-?[\d.]+(?:px|dp|sp))"/;
const REGEXP_DEVICEUNIT = /\d(px|dp|sp)$/;

const NAMESPACE_ATTR = ['android', 'app'];

function getResourceName(map: Map<string, string>, name: string, value: string) {
    for (const [storedName, storedValue] of map.entries()) {
        if (storedName.startsWith(name) && value === storedValue) {
            return storedName;
        }
    }
    return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
}

const getDisplayName = (value: string) => $util.fromLastIndexOf(value, '.');

export default class ResourceDimens<T extends android.base.View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        const groups: ObjectMapNested<T[]> = {};
        for (const node of this.application.session.cache) {
            if (node.visible) {
                const tagName = node.tagName.toLowerCase();
                if (groups[tagName] === undefined) {
                    groups[tagName] = {};
                }
                for (const namespace of NAMESPACE_ATTR) {
                    const obj = node.namespace(namespace);
                    for (const attr in obj) {
                        if (attr !== 'text') {
                            const value = obj[attr].trim();
                            if (REGEXP_DEVICEUNIT.test(value)) {
                                const dimen = `${namespace},${attr},${value}`;
                                if (groups[tagName][dimen] === undefined) {
                                    groups[tagName][dimen] = [];
                                }
                                groups[tagName][dimen].push(node);
                            }
                        }
                    }
                }
            }
        }
        for (const tagName in groups) {
            const group = groups[tagName];
            for (const name in group) {
                const [namespace, attr, value] = name.split($regex.XML.SEPARATOR);
                const key = getResourceName(STORED.dimens, `${getDisplayName(tagName)}_${$util.convertUnderscore(attr)}`, value);
                for (const node of group[name]) {
                    node[namespace](attr, `@dimen/${key}`);
                }
                STORED.dimens.set(key, value);
            }
        }
    }

    public afterFinalize() {
        for (const layout of this.application.layouts) {
            let content = layout.content;
            let match: RegExpExecArray | null;
            while ((match = REGEXP_WIDGETNAME.exec(content)) !== null) {
                if (match[3] !== 'text') {
                    const key = getResourceName(STORED.dimens, `${getDisplayName(match[1]).toLowerCase()}_${$util.convertUnderscore(match[3])}`, match[4]);
                    STORED.dimens.set(key, match[4]);
                    content = content.replace(match[0], match[0].replace(match[4], `@dimen/${key}`));
                }
            }
            layout.content = content;
        }
    }
}