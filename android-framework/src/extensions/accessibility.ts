import { CONTAINER_ANDROID } from '../lib/constant';

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class <T extends android.base.View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;

    public afterBaseLayout() {
        for (const node of this.application.processing.cache) {
            const element = <HTMLInputElement> node.element;
            if (element && node.visible && node.hasProcedure($enum.NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.controlName) {
                    case CONTAINER_ANDROID.EDIT:
                        if (!node.companion) {
                            [node.previousSibling, node.previousSibling].some((sibling: T) => {
                                if (sibling && sibling.visible && sibling.pageFlow) {
                                    const labelElement = <HTMLLabelElement> sibling.element;
                                    const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent as T : undefined;
                                    if ($util.hasValue(labelElement.htmlFor) && labelElement.htmlFor === element.id) {
                                        sibling.android('labelFor', node.documentId);
                                        return true;
                                    }
                                    else if (labelParent && sibling.textElement) {
                                        labelParent.android('labelFor', node.documentId);
                                        return true;
                                    }
                                }
                                return false;
                            });
                        }
                    case CONTAINER_ANDROID.SELECT:
                    case CONTAINER_ANDROID.CHECKBOX:
                    case CONTAINER_ANDROID.RADIO:
                    case CONTAINER_ANDROID.BUTTON:
                        if (element.readOnly) {
                            node.android('focusable', 'false');
                        }
                        if (element.disabled) {
                            node.android('enabled', 'false');
                        }
                        break;
                }
            }
        }
    }
}