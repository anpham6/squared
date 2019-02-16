import Extension from '../extension';
import Node from '../node';

import { NODE_PROCEDURE } from '../lib/enumeration';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Accessibility<T extends Node> extends Extension<T> {
    public afterInit() {
        for (const node of this.application.processing.cache) {
            const element = <HTMLInputElement> node.element;
            if (element && element.tagName === 'INPUT' && !node.hasBit('excludeProcedure', NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (element.type) {
                    case 'radio':
                    case 'checkbox':
                        [$dom.getPreviousElementSibling(element), $dom.getNextElementSibling(element)].some((sibling: HTMLLabelElement) => {
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
                                    if (node.companion) {
                                        if (this.options && !this.options.showLabel) {
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
            }
        }
    }
}