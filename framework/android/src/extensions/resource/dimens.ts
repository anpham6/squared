import Resource from '../../resource';

type View = android.base.View;

const { convertUnderscore, fromLastIndexOf, safeNestedArray, safeNestedMap } = squared.lib.util;

function getResourceName(map: Map<string, string>, name: string, value: string) {
    if (map.get(name) === value) {
        return name;
    }
    for (const [storedName, storedValue] of map.entries()) {
        if (value === storedValue && storedName.startsWith(name)) {
            return storedName;
        }
    }
    return Resource.generateId('dimen', name);
}

function createNamespaceData(namespace: string, node: View, group: ObjectMap<View[]>) {
    const obj = node.namespace(namespace);
    for (const attr in obj) {
        if (attr !== 'text') {
            const value = obj[attr];
            if (/\dpx$/.test(value)) {
                safeNestedArray(group, `${namespace},${attr},${value}`).push(node);
            }
        }
    }
}

export default class ResourceDimens<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade(rendered: T[]) {
        const dimens = (Resource.STORED as AndroidResourceStoredMap).dimens;
        const groups: ObjectMapNested<T[]> = {};
        const length = rendered.length;
        let i = 0;
        while (i < length) {
            const node = rendered[i++];
            if (node.visible) {
                const containerName = node.containerName.toLowerCase();
                const group = safeNestedMap(groups, containerName);
                createNamespaceData('android', node, group);
                createNamespaceData('app', node, group);
            }
        }
        for (const containerName in groups) {
            const group = groups[containerName] as ObjectMap<T[]>;
            for (const name in group) {
                const [namespace, attr, value] = name.split(',');
                const key = getResourceName(dimens, fromLastIndexOf(containerName, '.') + '_' + convertUnderscore(attr), value);
                for (const node of group[name]) {
                    node[namespace](attr, `@dimen/${key}`);
                }
                dimens.set(key, value);
            }
        }
    }

    public afterFinalize() {
        if (this.controller.hasAppendProcessing()) {
            const dimens = (Resource.STORED as AndroidResourceStoredMap).dimens;
            const layouts = this.application.layouts;
            let i = 0;
            while (i < layouts.length) {
                const layout = layouts[i++];
                const pattern = /:(\w+)="(-?[\d.]+px)"/g;
                let content = layout.content!,
                    match: Null<RegExpExecArray>;
                while (match = pattern.exec(layout.content!)) {
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