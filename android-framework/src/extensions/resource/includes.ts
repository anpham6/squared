import View from '../../view';

type NodeRenderIndex = {
    item: View;
    name: string;
    index: number;
    merge: boolean;
};

const $xml = squared.lib.xml;

export default class ResourceIncludes<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public beforeCascadeDocument() {
        for (const node of this.application.session.cache) {
            if (node.renderParent && node.renderTemplates) {
                const open: NodeRenderIndex[] = [];
                const close: NodeRenderIndex[] = [];
                node.renderEach((item: T, index) => {
                    const name = (item.dataset.androidInclude || '').trim();
                    const closing = item.dataset.androidIncludeEnd === 'true';
                    if (name || closing) {
                        const data: NodeRenderIndex = {
                            item,
                            name,
                            index,
                            merge: item.dataset.androidIncludeMerge === 'true'
                        };
                        if (name) {
                            open.push(data);
                        }
                        if (closing) {
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
                                const templates: string[] = [];
                                const children: T[] = [];
                                for (let k = openData.index; k <= index; k++) {
                                    templates.push(node.renderTemplates[k]);
                                    children.push(node.renderChildren[k] as T);
                                    node.renderTemplates[k] = '';
                                }
                                node.renderTemplates[openData.index] = this.application.controllerHandler.renderNodeStatic('include', children[0].renderDepth, { layout: `@layout/${openData.name}` });
                                const controller = this.application.controllerHandler;
                                const merge = openData.merge || templates.length > 1;
                                const depth = merge ? 1 : 0;
                                for (const item of children) {
                                    item.renderDepth = depth;
                                }
                                if (!merge && !openData.item.documentRoot) {
                                    const hash = $xml.formatPlaceholder(openData.item.id, '@');
                                    templates[0] = templates[0].replace(hash, `{#0}${hash}`);
                                    openData.item.documentRoot = true;
                                }
                                let xml = controller.cascadeDocument(templates, children);
                                if (merge) {
                                    xml = controller.getEnclosingTag('merge', 0, 0, xml).replace('{@0}', '');
                                }
                                this.application.addIncludeFile(openData.item.id, openData.name, $xml.formatTemplate(xml, false, 0));
                                close.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}