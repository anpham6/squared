import { LayoutRoot } from '../../../../@types/base/application';
import { AppViewModelAndroid } from '../../../../@types/android/internal';

import { getDataSet } from '../../lib/util';

type View = android.base.View;

const { capitalize } = squared.lib.util;

export default class ResourceData<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascade(documentRoot: LayoutRoot<T>[]) {
        const viewModel = <AppViewModelAndroid> this.application.viewModel;
        if (viewModel) {
            const controller = this.controller;
            const applied = new Set<T>();
            this.cache.each(node => {
                if (node.styleElement && node.visible) {
                    node.unsafe('namespaces').forEach((name: string) => {
                        const dataset = getDataSet(node.dataset, `viewmodel${capitalize(name)}`);
                        if (dataset) {
                            for (const attr in dataset) {
                                node.attr(name, attr, `@{${dataset[attr]}}`, true);
                            }
                            applied.add(node);
                        }
                    });
                }
            });
            if (applied.size) {
                documentRoot.forEach(root => {
                    const node = root.node;
                    for (const child of applied) {
                        if (child.ascend({ condition: item => item === node, attr: 'renderParent'}).length) {
                            const { import: importing, variable } = viewModel;
                            const { depth, id } = node;
                            const indentA = '\t'.repeat(depth);
                            const indentB = '\t'.repeat(depth + 1);
                            const indentC = '\t'.repeat(depth + 2);
                            let output = indentA + '<layout {#0}>\n' +
                                         indentB + '<data>\n';
                            if (importing) {
                                importing.forEach(name => output += indentC + `<import type="${name}" />\n`);
                            }
                            if (variable) {
                                variable.forEach(data => output += indentC + `<variable name="${data.name}" type="${data.type}" />\n`);
                            }
                            output += indentB + '</data>\n';
                            controller.addBeforeOutsideTemplate(id, output);
                            controller.addAfterOutsideTemplate(id, indentA + '</layout>\n');
                            node.depth = depth - 1;
                            applied.delete(child);
                            break;
                        }
                    }
                });
            }
        }
    }
}