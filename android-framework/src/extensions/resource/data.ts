import { getDataSet } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

export default class ResourceData<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade(documentRoot: squared.base.LayoutRoot<T>[]) {
        const viewModel = this.application.viewModel as android.base.AppViewModel;
        if (viewModel) {
            const controller = this.controller;
            const applied = new Set<T>();
            this.cache.each(node => {
                if (node.styleElement && node.visible) {
                    for (const name of node.unsafe('namespaces')) {
                        const dataset = getDataSet(node.dataset, `viewmodel${capitalize(name)}`);
                        if (dataset) {
                            for (const attr in dataset) {
                                node.attr(name, attr, `@{${dataset[attr]}}`, true);
                            }
                            applied.add(node);
                        }
                    }
                }
            });
            if (applied.size) {
                let i = 0;
                while (i < documentRoot.length) {
                    const node = documentRoot[i++].node;
                    for (const child of applied) {
                        if (child.ascend({ condition: item => item === node, attr: 'renderParent'}).length) {
                            const { import: importing, variable } = viewModel;
                            const { depth, id } = node;
                            const indentA = '\t'.repeat(depth), indentB = '\t'.repeat(depth + 1), indentC = '\t'.repeat(depth + 2);
                            let output = indentA + '<layout {#0}>\n' +
                                         indentB + '<data>\n';
                            if (importing) {
                                let j = 0;
                                while (j < importing.length) {
                                    output += indentC + `<import type="${importing[j++]}" />\n`;
                                }
                            }
                            if (variable) {
                                let j = 0;
                                while (j < variable.length) {
                                    const { name, type } = variable[j++];
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