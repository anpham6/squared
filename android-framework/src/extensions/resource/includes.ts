import type { NodeTemplate, NodeIncludeTemplate } from '../../../../@types/base/application';

import { getRootNs } from '../../lib/util';

type View = android.base.View;

const { NODE_TEMPLATE } = squared.base.lib.enumeration;

type NodeRenderIndex = {
    item: View;
    name?: string;
    index: number;
    include: boolean;
};

export default class ResourceIncludes<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        for (const node of this.cache) {
            const renderTemplates = node.renderTemplates;
            if (renderTemplates) {
                let open: Undef<NodeRenderIndex[]>;
                let close: Undef<NodeRenderIndex[]>;
                node.renderEach((item: T, index) => {
                    const dataset = item.dataset;
                    const name = dataset.androidInclude;
                    const closing = dataset.androidIncludeEnd === 'true';
                    if (name || closing) {
                        const data: NodeRenderIndex = {
                            item,
                            name,
                            index,
                            include: dataset.androidIncludeMerge === 'false'
                        };
                        if (name) {
                            if (open === undefined) {
                                open = [];
                            }
                            open.push(data);
                        }
                        if (closing) {
                            if (close === undefined) {
                                close = [];
                            }
                            close.push(data);
                        }
                    }
                });
                if (open && close) {
                    const application = this.application;
                    const controller = <android.base.Controller<T>> this.controller;
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
                                    templates.push(<NodeTemplate<T>> renderTemplates[k]);
                                }
                                const length = templates.length;
                                const merge = !openData.include || length > 1;
                                const depth = merge ? 1 : 0;
                                renderTemplates.splice(openData.index, length, <NodeIncludeTemplate<T>> {
                                    type: NODE_TEMPLATE.INCLUDE,
                                    node: templates[0].node,
                                    content: controller.renderNodeStatic({ controlName: 'include', width: 'match_parent' }, { layout: `@layout/${openData.name}`, android: {} }),
                                    indent: true
                                });
                                let content = controller.cascadeDocument(templates, depth);
                                if (merge) {
                                    content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                }
                                else {
                                    openData.item.documentRoot = true;
                                }
                                application.saveDocument(openData.name as string, content, '', Number.POSITIVE_INFINITY);
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