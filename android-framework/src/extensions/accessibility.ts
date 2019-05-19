import { CONTAINER_ANDROID } from '../lib/constant';

const $e = squared.base.lib.enumeration;

export default class <T extends android.base.View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;

    public afterBaseLayout() {
        for (const node of this.application.processing.cache) {
            if (node.visible && node.hasProcedure($e.NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.controlName) {
                    case CONTAINER_ANDROID.EDIT:
                        if (!node.companion) {
                            [node.previousSibling, node.previousSibling].some((sibling: T) => {
                                if (sibling && sibling.visible && sibling.pageFlow) {
                                    const element = <HTMLInputElement> node.element;
                                    const labelElement = <HTMLLabelElement> sibling.element;
                                    const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent as T : undefined;
                                    if (element.id && element.id === labelElement.htmlFor) {
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
                    case CONTAINER_ANDROID.BUTTON: {
                        const element = <HTMLInputElement> node.element;
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
}