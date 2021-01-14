import type View from '../../view';

import Resource from '../../resource';

import Pattern = squared.lib.base.Pattern;

type GroupData = ObjectMap<View[]>;

const { isPx } = squared.lib.css;
const { convertHyphenated, fromLastIndexOf, startsWith } = squared.lib.util;

const CACHE_UNDERSCORE: StringMap = {};

const RE_DIMENS = new Pattern(/:(\w+)="(-?[\d.]+px)"/g);

function getResourceName(map: Map<string, string>, name: string, value: string) {
    if (map.get(name) === value) {
        return name;
    }
    for (const data of map) {
        if (value === data[1] && startsWith(data[0], name)) {
            return data[0];
        }
    }
    return Resource.generateId('dimen', name, 0);
}

function createNamespaceData(namespace: string, node: View, group: GroupData) {
    const obj = node.namespace(namespace);
    for (const attr in obj) {
        if (attr !== 'text') {
            const value = obj[attr]!;
            if (isPx(value)) {
                const name = namespace + ',' + attr + ',' + value;
                (group[name] ||= []).push(node);
            }
        }
    }
}

export default class ResourceDimens<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeDocumentWrite(data: squared.base.DocumentWriteDataExtensionUI<T>) {
        const dimens = Resource.STORED.dimens;
        const rendered = data.rendered;
        const groups: ObjectMapNested<T[]> = {};
        for (let i = 0, length = rendered.length; i < length; ++i) {
            const node = rendered[i];
            if (node.visible) {
                const containerName = node.containerName.toLowerCase();
                const group: GroupData = groups[containerName] ||= {};
                createNamespaceData('android', node, group);
                createNamespaceData('app', node, group);
            }
        }
        for (const containerName in groups) {
            const group = groups[containerName];
            for (const name in group) {
                const [namespace, attr, value] = name.split(',');
                CACHE_UNDERSCORE[attr] ||= convertHyphenated(attr, '_');
                const key = getResourceName(dimens, fromLastIndexOf(containerName, '.') + '_' + CACHE_UNDERSCORE[attr], value);
                const items = group[name];
                for (let i = 0, length = items.length; i < length; ++i) {
                    items[i].attr(namespace, attr, `@dimen/${key}`);
                }
                dimens.set(key, value);
            }
        }
    }

    public afterFinalize() {
        if (this.controller.hasAppendProcessing()) {
            const dimens = Resource.STORED.dimens;
            for (const layout of this.application.layouts) {
                let content = layout.content!;
                RE_DIMENS.matcher(content);
                while (RE_DIMENS.find()) {
                    const [original, name, value] = RE_DIMENS.groups();
                    if (name !== 'text') {
                        CACHE_UNDERSCORE[name] ||= convertHyphenated(name, '_');
                        const key = getResourceName(dimens, 'custom_' + CACHE_UNDERSCORE[name], value);
                        content = content.replace(original, original.replace(value, `@dimen/${key}`));
                        dimens.set(key, value);
                    }
                }
                if (RE_DIMENS.found) {
                    layout.content = content;
                }
            }
        }
    }
}