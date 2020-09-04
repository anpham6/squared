import NODE_TEMPLATE = squared.base.constant.NODE_TEMPLATE;

import type View from '../../view';

import { getRootNs } from '../../lib/util';

type RenderData = Undef<NodeIndex[]>;

interface NodeIndex {
    item: View;
    name?: string;
    index: number;
    include: boolean;
}

export default class ResourceIncludes<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeDocumentWrite(data: squared.base.DocumentWriteDataExtensionUI<T>) {
        const rendered = data.rendered;
        for (let i = 0, length = rendered.length; i < length; ++i) {
            const node = rendered[i];
            if (node.rendering) {
                let open: RenderData,
                    close: RenderData;
                node.renderEach((item: T, index) => {
                    const dataset = item.dataset;
                    const name = dataset.androidInclude;
                    const closing = dataset.androidIncludeEnd === 'true';
                    if (name || closing) {
                        if (item.documentRoot) {
                            return;
                        }
                        const indexData: NodeIndex = {
                            item,
                            name,
                            index,
                            include: dataset.androidIncludeMerge === 'false'
                        };
                        if (name) {
                            (open || (open = [])).push(indexData);
                        }
                        if (closing) {
                            (close || (close = [])).push(indexData);
                        }
                    }
                });
                if (open && close) {
                    const application = this.application;
                    const controller = this.controller as android.base.Controller<T>;
                    const renderTemplates = node.renderTemplates!;
                    const q = Math.min(open.length, close.length);
                    const excess = close.length - q;
                    if (excess) {
                        close.splice(0, excess);
                    }
                    for (let j = q - 1; j >= 0; --j) {
                        const { index, include, item, name } = open[j];
                        for (let k = 0; k < close.length; ++k) {
                            const r = close[k].index;
                            if (r >= index) {
                                const templates: NodeTemplate<T>[] = [];
                                for (let l = index; l <= r; ++l) {
                                    templates.push(renderTemplates[l] as NodeTemplate<T>);
                                }
                                const merge = !include || templates.length > 1;
                                const depth = merge ? 1 : 0;
                                renderTemplates.splice(index, templates.length, {
                                    type: NODE_TEMPLATE.INCLUDE,
                                    node: templates[0].node,
                                    content: controller.renderNodeStatic({ controlName: 'include', width: 'match_parent' }, { layout: `@layout/${name!}`, android: {} }),
                                    indent: true
                                } as NodeIncludeTemplate<T>);
                                let content = controller.writeDocument(templates, depth, this.application.userSettings.showAttributes);
                                if (merge) {
                                    content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                }
                                else {
                                    item.documentRoot = true;
                                }
                                application.saveDocument(name!, content, '', Infinity);
                                close.splice(k, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}