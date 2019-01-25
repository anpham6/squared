import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';

const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;

    public afterBaseLayout() {
        for (const node of this.application.processing.cache.elements) {
            const element = <HTMLElement> node.element;
            if (element && !node.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.controlName) {
                    case CONTAINER_ANDROID.EDIT:
                        if (!node.companion) {
                            [$dom.getPreviousElementSibling(element), $dom.getNextElementSibling(element)].some((sibling: HTMLLabelElement | null) => {
                                if (sibling) {
                                    const label = $dom.getElementAsNode<T>(sibling);
                                    const labelParent = sibling && sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom.getElementAsNode<T>(sibling.parentElement) : undefined;
                                    if (label && label.visible && label.pageFlow) {
                                        if ($util.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
                                            label.android('labelFor', node.documentId);
                                            return true;
                                        }
                                        else if (label.textElement && labelParent) {
                                            labelParent.android('labelFor', node.documentId);
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            });
                        }
                    case CONTAINER_ANDROID.SELECT:
                    case CONTAINER_ANDROID.CHECKBOX:
                    case CONTAINER_ANDROID.RADIO:
                    case CONTAINER_ANDROID.BUTTON:
                        if ((<HTMLInputElement> element).disabled) {
                            node.android('focusable', 'false');
                        }
                        break;
                }
            }
        }
    }
}