import Resource from '../resource';

type View = android.base.View;

const { formatPX } = squared.lib.css;

const { NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.Accessibility<T> {
    public readonly eventOnly = true;
    public readonly options: AccessibilityOptions = {
        displayLabel: false
    };

    public beforeBaseLayout() {
        this.cacheProcessing.each(node => {
            if (node.inputElement && node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                const describedby = node.attributes['aria-describedby'];
                if (describedby) {
                    const sibling = this.cacheProcessing.find(item => item.elementId === describedby);
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
                        if (!node.rightAligned && !node.centerAligned) {
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
                        }
                        break;
                    }
                    case 'INPUT_IMAGE':
                        if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                            node.data(Resource.KEY_NAME, 'embedded', [node]);
                        }
                        break;
                    case 'BUTTON':
                        if (node.length) {
                            let { width, height } = node.bounds;
                            let modified = false;
                            node.cascade((item: T) => {
                                if (item.width >= width && item.height >= height) {
                                    ({ width, height } = item);
                                    if (!node.visibleStyle.background) {
                                        node.inherit(item, 'boxStyle');
                                    }
                                    modified = true;
                                }
                            });
                            if (modified) {
                                node.css('minWidth', formatPX(width));
                                node.css('minHeight', formatPX(height));
                            }
                            const embedded = node.extract((item: T) => !item.textElement) as T[];
                            if (embedded.length && node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                                node.data(Resource.KEY_NAME, 'embedded', embedded);
                            }
                            node.clear();
                        }
                        break;
                }
            }
        });
    }
}