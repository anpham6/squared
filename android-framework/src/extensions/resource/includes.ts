import { getRootNs } from '../../lib/util';

type View = android.base.View;
type RenderIndex = Undef<NodeRenderIndex[]>;

interface NodeRenderIndex {
    item: View;
    name?: string;
    index: number;
    include: boolean;
}

const { NODE_TEMPLATE } = squared.base.lib.enumeration;

export default class ResourceIncludes<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade() {
        this.cache.each((node: T) => {
            const renderTemplates = node.renderTemplates;
            if (renderTemplates) {
                let open: RenderIndex,
                    close: RenderIndex;
                node.renderEach((item: T, index) => {
                    const dataset = item.dataset;
                    const name = dataset.androidInclude;
                    const closing = dataset.androidIncludeEnd === 'true';
                    if (name || closing) {
                        if (item.documentRoot) {
                            return;
                        }
                        const data: NodeRenderIndex = {
                            item,
                            name,
                            index,
                            include: dataset.androidIncludeMerge === 'false'
                        };
                        if (name) {
                            if (!open) {
                                open = [];
                            }
                            open.push(data);
                        }
                        if (closing) {
                            if (!close) {
                                close = [];
                            }
                            close.push(data);
                        }
                    }
                });
                if (open && close) {
                    const application = this.application;
                    const controller = this.controller as android.base.Controller<T>;
                    const length = Math.min(open.length, close.length);
                    const excess = close.length - length;
                    if (excess > 0) {
                        close.splice(0, excess);
                    }
                    let i = length - 1;
                    while (i >= 0) {
                        const { index, include, item, name } = open[i--];
                        for (let j = 0; j < close.length; ++j) {
                            const q = close[j].index;
                            if (q >= index) {
                                const templates: NodeTemplate<T>[] = [];
                                let k = index;
                                while (k <= q) {
                                    templates.push(renderTemplates[k++] as NodeTemplate<T>);
                                }
                                const merge = !include || templates.length > 1;
                                const depth = merge ? 1 : 0;
                                renderTemplates.splice(index, templates.length, {
                                    type: NODE_TEMPLATE.INCLUDE,
                                    node: templates[0].node,
                                    content: controller.renderNodeStatic({ controlName: 'include', width: 'match_parent' }, { layout: `@layout/${name}`, android: {} }),
                                    indent: true
                                } as NodeIncludeTemplate<T>);
                                let content = controller.cascadeDocument(templates, depth);
                                if (merge) {
                                    content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                }
                                else {
                                    item.documentRoot = true;
                                }
                                application.saveDocument(name as string, content, '', Infinity);
                                close.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
        });
    }
}