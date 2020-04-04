import type { ResourceStoredMapAndroid } from '../../../../@types/android/application';

import Resource from '../../resource';

type View = android.base.View;

const $lib = squared.lib;

const { XML } = $lib.regex;
const { convertUnderscore, fromLastIndexOf, safeNestedArray, safeNestedMap } = $lib.util;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const REGEX_UNIT = /\dpx$/;
const REGEX_UNIT_ATTR = /:(\w+)="(-?[\d.]+px)"/;

function getResourceName(map: Map<string, string>, name: string, value: string) {
    for (const [storedName, storedValue] of map.entries()) {
        if (storedName.startsWith(name) && value === storedValue) {
            return storedName;
        }
    }
    const previous = map.get(name);
    return !!previous && previous !== value ? Resource.generateId('dimen', name) : name;
}

function createNamespaceData(namespace: string, node: View, group: ObjectMap<View[]>) {
    const obj = node.namespace(namespace);
    for (const attr in obj) {
        if (attr !== 'text') {
            const value = obj[attr];
            if (REGEX_UNIT.test(value)) {
                safeNestedArray(group, `${namespace},${attr},${value}`).push(node);
            }
        }
    }
}

const getDisplayName = (value: string) => fromLastIndexOf(value, '.');

export default class ResourceDimens<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        const dimens = STORED.dimens;
        const groups: ObjectMapNested<T[]> = {};
        for (const node of this.cache) {
            if (node.visible) {
                const containerName = node.containerName.toLowerCase();
                const group = safeNestedMap(groups, containerName);
                createNamespaceData('android', node, group);
                createNamespaceData('app', node, group);
            }
        }
        for (const containerName in groups) {
            const group = groups[containerName];
            for (const name in group) {
                const [namespace, attr, value] = name.split(XML.SEPARATOR);
                const key = getResourceName(dimens, getDisplayName(containerName) + '_' + convertUnderscore(attr), value);
                const data = group[name];
                for (const node of data) {
                    node[namespace](attr, `@dimen/${key}`);
                }
                dimens.set(key, value);
            }
        }
    }

    public afterFinalize() {
        if (this.controller.hasAppendProcessing()) {
            const dimens = STORED.dimens;
            for (const layout of this.application.layouts) {
                let content = layout.content;
                let match: Null<RegExpExecArray>;
                while ((match = REGEX_UNIT_ATTR.exec(content)) !== null) {
                    const [original, name, value] = match;
                    if (name !== 'text') {
                        const key = getResourceName(dimens, `custom_${convertUnderscore(name)}`, value);
                        content = content.replace(original, original.replace(value, `@dimen/${key}`));
                        dimens.set(key, value);
                    }
                }
                layout.content = content;
            }
        }
    }
}