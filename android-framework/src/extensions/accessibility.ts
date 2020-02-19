import { AccessibilityOptions } from '../../../@types/android/extension';

import Resource from '../resource';

const { NODE_PROCEDURE } = squared.base.lib.enumeration;

type View = android.base.View;

export default class <T extends View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;
    public readonly options: AccessibilityOptions = {
        displayLabel: false
    };

    public beforeBaseLayout() {
        const cache = this.cacheProcessing;
        for (const node of cache) {
            if (node.inputElement && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                const describedby = node.attributes['aria-describedby'];
                if (describedby) {
                    const sibling = cache.find(item => item.elementId === describedby);
                    if (sibling) {
                        const value = sibling.textContent.trim();
                        if (value !== '') {
                            node.data(Resource.KEY_NAME, 'titleString', value);
                        }
                    }
                }
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
                                    if (!this.options.displayLabel) {
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