import { AccessibilityOptions } from '../../../@types/android/extension';

const { NODE_PROCEDURE } = squared.base.lib.enumeration;

export default class <T extends android.base.View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;
    public readonly options: AccessibilityOptions = {
        showLabel: false
    };

    public beforeBaseLayout() {
        for (const node of this.cacheProcessing) {
            if (node.inputElement && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                switch (node.containerName) {
                    case 'INPUT_RADIO':
                    case 'INPUT_CHECKBOX': {
                        const id = node.elementId;
                        [node.nextSibling, node.previousSibling].some((sibling: Null<T>) => {
                            if (sibling?.pageFlow && !sibling.visibleStyle.backgroundImage && sibling.visible) {
                                let valid = false;
                                if (id && id === sibling.toElementString('htmlFor')) {
                                    valid = true;
                                }
                                else if (sibling.textElement) {
                                    const parent = sibling.actualParent as T;
                                    if (parent.tagName === 'LABEL') {
                                        parent.renderAs = node;
                                        valid = true;
                                    }
                                    else if (sibling.plainText) {
                                        valid = true;
                                    }
                                }
                                if (valid) {
                                    sibling.labelFor = node;
                                    if (!this.options.showLabel) {
                                        sibling.hide();
                                    }
                                    return true;
                                }
                            }
                            return false;
                        });
                        break;
                    }
                    case 'INPUT_IMAGE':
                        node.extracted = [node];
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