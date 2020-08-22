import { getDataSet } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

export default class ResourceData<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeDocumentWrite(data: DocumentWriteDataExtensionUI<T>) {
        const viewModel = (this.application as android.base.Application<T>).viewModel;
        if (viewModel.size) {
            const { rendered, documentRoot } = data;
            const controller = this.controller;
            const applied = new Set<T>();
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                if (node.styleElement) {
                    for (const [name] of node.namespaces()) {
                        const dataset = getDataSet(node.dataset, 'viewmodel' + capitalize(name)) as Undef<StringMapChecked>;
                        if (dataset) {
                            for (const attr in dataset) {
                                node.attr(name, attr, `@{${dataset[attr]}}`, true);
                            }
                            applied.add(node);
                        }
                    }
                }
            }
            if (applied.size) {
                for (let i = 0, length = documentRoot.length; i < length; ++i) {
                    const node = documentRoot[i].node;
                    const viewData = viewModel.get(node.sessionId) || viewModel.get('0');
                    if (viewData) {
                        for (const child of applied) {
                            if (child.ascend({ condition: item => item === node, attr: 'renderParent'}).length) {
                                const { import: importing, variable } = viewData;
                                const { depth, id } = node;
                                const indentA = '\t'.repeat(depth);
                                const indentB = '\t'.repeat(depth + 1);
                                const indentC = '\t'.repeat(depth + 2);
                                let output = indentA + '<layout {#0}>\n' +
                                            indentB + '<data>\n';
                                if (importing) {
                                    for (let j = 0, q = importing.length; j < q; ++j) {
                                        output += indentC + `<import type="${importing[j]}" />\n`;
                                    }
                                }
                                if (variable) {
                                    for (let j = 0, q = variable.length; j < q; ++j) {
                                        const { name, type } = variable[j];
                                        output += indentC + `<variable name="${name}" type="${type}" />\n`;
                                    }
                                }
                                output += indentB + '</data>\n';
                                controller.addBeforeOutsideTemplate(id, output);
                                controller.addAfterOutsideTemplate(id, indentA + '</layout>\n');
                                node.depth = depth - 1;
                                applied.delete(child);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}