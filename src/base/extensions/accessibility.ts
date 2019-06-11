import { AccessibilityOptions } from '../@types/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { NODE_PROCEDURE } from '../lib/enumeration';

export default abstract class Accessibility<T extends NodeUI> extends ExtensionUI<T> {
    public readonly options: AccessibilityOptions = {
        showLabel: false
    };

    public afterInit() {
        for (const node of this.application.processing.cache) {
            if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.containerName) {
                    case 'INPUT_IMAGE':
                        node.extracted = [node];
                        break;
                    case 'INPUT_RADIO':
                    case 'INPUT_CHECKBOX':
                        const element = <HTMLInputElement> node.element;
                        [node.nextSibling, node.previousSibling].some((sibling: T) => {
                            if (sibling && sibling.visible && sibling.pageFlow && !sibling.visibleStyle.backgroundImage) {
                                const labelElement = <HTMLLabelElement> sibling.element;
                                const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent as T : undefined;
                                if (element.id && element.id === labelElement.htmlFor) {
                                    node.companion = sibling;
                                }
                                else if (sibling.textElement && labelParent) {
                                    node.companion = sibling;
                                    labelParent.renderAs = node;
                                }
                                else if (sibling.plainText) {
                                    node.companion = sibling;
                                }
                                if (node.companion) {
                                    if (!this.options.showLabel) {
                                        sibling.hide();
                                    }
                                    return true;
                                }
                            }
                            return false;
                        });
                        break;
                    case 'BUTTON':
                        if (node.length) {
                            const extracted = node.filter((item: T) => !item.textElement) as T[];
                            if (extracted.length) {
                                node.extracted = extracted;
                            }
                            node.clear();
                        }
                        break;
                }
            }
        }
    }
}