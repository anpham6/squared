import View from '../../view';

type NodeRenderIndex = {
    item: View;
    name: string;
    index: number;
    merge: boolean;
};

const $util = squared.lib.util;
const $xml = squared.lib.xml;

export default class ResourceIncludes<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public afterDepthLevel() {
        const processing = this.application.processing;
        for (const node of processing.cache) {
            const open: NodeRenderIndex[] = [];
            const close: NodeRenderIndex[] = [];
            node.renderEach((item: T, index) => {
                const openTag = $util.hasValue(item.dataset.androidInclude);
                const closeTag = item.dataset.androidIncludeEnd === 'true';
                if (openTag || closeTag) {
                    const data: NodeRenderIndex = {
                        item,
                        name: (item.dataset.androidInclude || '').trim(),
                        index,
                        merge: item.dataset.androidIncludeMerge === 'true'
                    };
                    if (openTag) {
                        open.push(data);
                    }
                    if (closeTag) {
                        close.push(data);
                    }
                }
            });
            if (open.length && close.length) {
                open.length = Math.min(open.length, close.length);
                for (let i = open.length; i < close.length; i++) {
                    close.shift();
                }
                for (let i = open.length - 1; i >= 0; i--) {
                    const openData = open[i];
                    for (let j = 0; j < close.length; j++) {
                        const index = close[j].index;
                        if (index >= openData.index) {
                            const location = new Map<number, T[]>();
                            let valid = true;
                            for (let k = openData.index; k <= index; k++) {
                                const item = node.renderChildren[k] as T;
                                const depthMap = processing.depthMap.get(node.id);
                                if (depthMap && depthMap.has(item.renderPositionId)) {
                                    const items = location.get(node.id) || [];
                                    items.push(item);
                                    location.set(node.id, items);
                                }
                                else {
                                    valid = false;
                                }
                            }
                            if (valid) {
                                const content = new Map<string, string>();
                                const group: T[] = [];
                                let k = 0;
                                for (const [id, templates] of processing.depthMap.entries()) {
                                    const parent = location.get(id);
                                    if (parent) {
                                        const deleteIds: string[] = [];
                                        for (const [key, template] of templates.entries()) {
                                            const item = parent.find(sibling => sibling.renderPositionId === key);
                                            if (item) {
                                                if (k === 0) {
                                                    templates.set(key, this.application.controllerHandler.renderNodeStatic('include', item.renderDepth, { layout: `@layout/${openData.name}` }));
                                                    k++;
                                                }
                                                else {
                                                    deleteIds.push(key);
                                                }
                                                content.set(key, template);
                                                group.push(item);
                                            }
                                        }
                                        for (const value of deleteIds) {
                                            templates.delete(value);
                                        }
                                    }
                                }
                                if (content.size) {
                                    const controller = this.application.controllerHandler;
                                    const merge = openData.merge || content.size > 1;
                                    const depth = merge ? 1 : 0;
                                    for (const item of group) {
                                        if (item.renderDepth !== depth) {
                                            const id = item.renderPositionId;
                                            const output = content.get(id);
                                            if (output) {
                                                content.set(id, controller.replaceIndent(output, depth, controller.cache.children));
                                            }
                                        }
                                    }
                                    let xml = '';
                                    for (const value of content.values()) {
                                        xml += value;
                                    }
                                    if (merge) {
                                        xml = controller.getEnclosingTag('merge', 0, 0, xml);
                                    }
                                    else if (!openData.item.documentRoot) {
                                        const hash = $xml.formatPlaceholder(openData.item.id, '@');
                                        xml = xml.replace(hash, `{#0}${hash}`);
                                        openData.item.documentRoot = true;
                                    }
                                    this.application.addIncludeFile(openData.name, xml);
                                }
                            }
                            close.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }
    }
}