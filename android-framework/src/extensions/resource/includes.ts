import { NodeTagXml, NodeTemplate, NodeIncludeTemplate } from '../../../../src/base/@types/application';

import View from '../../view';
import { getRootNs } from '../../lib/util';

type NodeRenderIndex = {
    item: View;
    name: string;
    index: number;
    merge: boolean;
};

const $enum = squared.base.lib.enumeration;

export default class ResourceIncludes<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public beforeCascadeDocument() {
        for (const node of this.application.session.cache) {
            if (node.renderParent && node.renderTemplates) {
                const open: NodeRenderIndex[] = [];
                const close: NodeRenderIndex[] = [];
                node.renderEach((item: T, index) => {
                    const name = item.dataset.androidInclude || '';
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
                    const controller = this.application.controllerHandler;
                    open.length = Math.min(open.length, close.length);
                    for (let i = open.length; i < close.length; i++) {
                        close.shift();
                    }
                    for (let i = open.length - 1; i >= 0; i--) {
                        const openData = open[i];
                        for (let j = 0; j < close.length; j++) {
                            const index = close[j].index;
                            if (index >= openData.index) {
                                const templates: NodeTemplate<T>[] = [];
                                for (let k = openData.index; k <= index; k++) {
                                    templates.push(<NodeTemplate<T>> node.renderTemplates[k]);
                                    node.renderTemplates[k] = null as any;
                                }
                                const merge = openData.merge || templates.length > 1;
                                const depth = merge ? 1 : 0;
                                node.renderTemplates[openData.index] = <NodeIncludeTemplate<T>> {
                                    type: $enum.NODE_TEMPLATE.INCLUDE,
                                    node: templates[0].node,
                                    content: controller.renderNodeStatic('include', { layout: `@layout/${openData.name}` }, '', ''),
                                    indent: true
                                };
                                if (!merge && !openData.item.documentRoot) {
                                    openData.item.documentRoot = true;
                                }
                                let content = controller.cascadeDocument(templates, depth);
                                if (merge) {
                                    content = controller.getEnclosingTag($enum.NODE_TEMPLATE.XML, <NodeTagXml<T>> { controlName: 'merge', attributes: getRootNs(content), content });
                                }
                                this.application.addIncludeFile(openData.item.id, openData.name, content);
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