import { AccessibilityOptions } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';

import { NODE_PROCEDURE } from '../lib/enumeration';

export default abstract class Accessibility<T extends Node> extends Extension<T> {
    public readonly options: AccessibilityOptions = {
        showLabel: true
    };

    public afterInit() {
        for (const node of this.application.processing.cache) {
            if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.tagName) {
                    case 'IMAGE':
                        node.extracted = [node];
                        break;
                    case 'RADIO':
                    case 'CHECKBOX':
                        const element = <HTMLInputElement> node.element;
                        [node.nextSibling, node.previousSibling].some(sibling => {
                            if (sibling && sibling.visible && sibling.pageFlow && !sibling.visibleStyle.backgroundImage) {
                                const labelElement = <HTMLLabelElement> sibling.element;
                                const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent : undefined;
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
                            const extracted = node.filter(item => !item.textElement);
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