import Extension from '../extension';
import Node from '../node';

import { NODE_PROCEDURE } from '../lib/enumeration';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Accessibility<T extends Node> extends Extension<T> {
    public afterInit() {
        for (const node of this.application.processing.cache) {
            if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                const element = <HTMLInputElement> node.element;
                switch (element.tagName) {
                    case 'INPUT':
                        switch (element.type) {
                            case 'image':
                                node.extracted = [node];
                                break;
                            case 'radio':
                            case 'checkbox':
                                [$dom.getNextElementSibling(element), $dom.getPreviousElementSibling(element)].some((sibling: HTMLLabelElement) => {
                                    if (sibling) {
                                        const label = $dom.getElementAsNode<T>(sibling);
                                        const labelParent = sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom.getElementAsNode<T>(sibling.parentElement) : undefined;
                                        if (label && label.visible && label.pageFlow) {
                                            if ($util.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
                                                node.companion = label;
                                            }
                                            else if (label.textElement && labelParent) {
                                                node.companion = label;
                                                labelParent.renderAs = node;
                                            }
                                            else if (label.plainText) {
                                                node.companion = label;
                                            }
                                            if (node.companion) {
                                                if (!this.options.showLabel) {
                                                    label.hide();
                                                }
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                });
                                break;
                        }
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