import type View from '../../view';

import Resource from '../../resource';

type GroupData = ObjectMap<View[]>;

const { isPx, isPercent } = squared.lib.css;
const { convertHyphenated, fromLastIndexOf, startsWith } = squared.lib.util;

const CACHE_UNDERSCORE: StringMap = {};
const REGEXP_DIMENS = /:(\w+)="(-?[\d.]+px)"/g;

function getResourceName(resourceId: number, map: Map<string, string>, name: string, value: string) {
    if (map.get(name) === value) {
        return name;
    }
    for (const data of map) {
        if (value === data[1] && startsWith(data[0], name)) {
            return data[0];
        }
    }
    return Resource.generateId(resourceId, 'dimen', name, 0);
}

const removePrefix = (attr: string) => startsWith(attr, 'layout_') ? attr.substring(7) : attr;

export default class ResourceDimens<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceDimensOptions = {
        percentAsResource: true
    };
    public readonly eventOnly = true;

    public beforeFinalize(data: FinalizeDataExtensionUI<T>) {
        const percentAsResource = this.options.percentAsResource;
        const { rendered, resourceId } = data;
        const dimens = Resource.STORED[resourceId]!.dimens;
        const groups: ObjectMapNested<T[]> = {};
        for (let i = 0, length = rendered.length; i < length; ++i) {
            const node = rendered[i];
            if (node.visible) {
                const containerName = fromLastIndexOf(node.containerName, '.').toLowerCase();
                const group: GroupData = groups[containerName] ||= {};
                let obj = node.namespace('android');
                for (const attr in obj) {
                    switch (attr) {
                        case 'id':
                        case 'text':
                        case 'src':
                            continue;
                    }
                    const value = obj[attr]!;
                    const ch = value[0];
                    if ((ch >= '0' && ch <= '9' || ch === '-') && (isPx(value) || percentAsResource && isPercent(value))) {
                        const name = 'android,' + attr + ',' + value;
                        (group[name] ||= []).push(node);
                    }
                }
                obj = node.namespace('app');
                for (const attr in obj) {
                    const value = obj[attr]!;
                    const ch = value[0];
                    if ((ch >= '0' && ch <= '9' || ch === '-') && (isPx(value) || percentAsResource && isPercent(value))) {
                        const name = 'app,' + attr + ',' + obj[attr]!;
                        (group[name] ||= []).push(node);
                    }
                }
            }
        }
        for (const containerName in groups) {
            const group = groups[containerName];
            for (const name in group) {
                const [namespace, attr, value] = name.split(',');
                const dimen = removePrefix(attr);
                const key = getResourceName(resourceId, dimens, containerName + '_' + (CACHE_UNDERSCORE[dimen] ||= convertHyphenated(dimen, '_')), value);
                const items = group[name]!;
                for (let i = 0, length = items.length; i < length; ++i) {
                    items[i].attr(namespace, attr, `@dimen/${key}`);
                }
                dimens.set(key, value);
            }
        }
    }

    public afterFinalize(data: FinalizeDataExtensionUI<T>) {
        if (this.controller.requireFormat) {
            const resourceId = data.resourceId;
            const dimens = Resource.STORED[resourceId]!.dimens;
            for (const layout of this.application.layouts) {
                let content = layout.content!,
                    match: Null<RegExpExecArray>;
                while (match = REGEXP_DIMENS.exec(content)) {
                    const attr = match[1];
                    if (attr !== 'text') {
                        const dimen = removePrefix(attr);
                        const key = getResourceName(resourceId, dimens, 'custom_' + (CACHE_UNDERSCORE[dimen] ||= convertHyphenated(dimen, '_')), match[2]);
                        const value = `:${attr}="@dimen/${key}"`;
                        content = content.substring(0, match.index) + value + content.substring(match.index + match[0].length);
                        dimens.set(key, match[2]);
                        REGEXP_DIMENS.lastIndex = match.index + value.length;
                    }
                }
                layout.content = content;
                REGEXP_DIMENS.lastIndex = 0;
            }
        }
    }
}