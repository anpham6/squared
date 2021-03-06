import type View from '../../view';

type AppViewModel = android.base.AppViewModel;

const { convertHyphenated, isPlainObject } = squared.lib.util;

export default class ResourceData<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public beforeCascadeRoot(processing: squared.base.AppProcessing<T>) {
        this.enabled = this.application.getUserSetting<boolean>(processing, 'enabledViewModel');
    }

    public beforeFinalize(data: FinalizeDataExtensionUI<T>) {
        const { session, viewModel } = this.application as android.base.Application<T>;
        if (session.data.size || viewModel.size) {
            const { rendered, documentRoot } = data;
            const controller = this.controller;
            const applied = new Set<T>();
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                if (node.styleElement) {
                    const dataset = node.dataset;
                    for (const name in dataset) {
                        if (name.startsWith('viewmodel')) {
                            const items = convertHyphenated(name).split('-');
                            if (items.length === 3) {
                                const attr = items[2];
                                const value = `@{${dataset[name]!}}`;
                                switch (items[1]) {
                                    case 'android':
                                        node.android(attr, value);
                                        break;
                                    case 'app':
                                        node.app(attr, value);
                                        break;
                                    default:
                                        node.attr(items[1], attr, value);
                                        break;
                                }
                                applied.add(node);
                            }
                        }
                    }
                }
            }
            if (applied.size) {
                for (let i = 0, length = documentRoot.length; i < length; ++i) {
                    const node = documentRoot[i].node;
                    const viewData = session.data.get(node.sessionId)?.viewModel || viewModel.get(node.sessionId) || viewModel.get('0');
                    if (isPlainObject<AppViewModel>(viewData)) {
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