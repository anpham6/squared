import type View from '../../view';

import { getDataSet } from '../../lib/util';

const { capitalize } = squared.lib.util;

export default class ResourceData<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeFinalize(data: FinalizeDataExtensionUI<T>) {
        const viewModel = (this.application as android.base.Application<T>).viewModel;
        if (viewModel.size) {
            const { rendered, documentRoot } = data;
            const controller = this.controller;
            const applied = new Set<T>();
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                if (node.styleElement) {
                    for (const [name] of node.namespaces()) {
                        const dataset = getDataSet(node.dataset, 'viewmodel' + capitalize(name));
                        if (dataset) {
                            for (const attr in dataset) {
                                node.attr(name, attr, `@{${dataset[attr]!}}`, true);
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
                                const depth = node.depth;
                                const indentA = depth ? '\t'.repeat(depth) : '';
                                const indentB = '\t'.repeat(depth + 1);
                                const indentC = '\t'.repeat(depth + 2);
                                let output = indentA + '<layout{#0}>\n' +
                                             indentB + '<data>\n';
                                if (importing) {
                                    output += importing.reduce((a, b) => a + indentC + `<import type="${b}" />\n`, '');
                                }
                                if (variable) {
                                    output += variable.reduce((a, b) => a + indentC + `<variable name="${b.name}" type="${b.type}" />\n`, '');
                                }
                                output += indentB + '</data>\n';
                                controller.addBeforeOutsideTemplate(node, output);
                                controller.addAfterOutsideTemplate(node, indentA + '</layout>\n');
                                node.unsafe('depth', depth - 1);
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