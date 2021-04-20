import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import type View from '../view';

import { CONTAINER_TAGNAME } from '../lib/constant';

import Resource from '../resource';

const { NODE_ALIGNMENT, NODE_PROCEDURE, NODE_TEMPLATE } = squared.base.lib.constant;

function addTextDecorationLine(node: View, attr: string) {
    if (!checkTextElement(node, attr)) {
        node.cascade((item: View) => {
            checkTextElement(item, attr);
        });
    }
}

function checkTextElement(node: View, attr: string) {
    if (node.textElement) {
        let value = node.css('textDecorationLine');
        if (!value || value === 'none') {
            value = attr;
        }
        else if (value.indexOf(attr) === -1) {
            value += ' ' + attr;
        }
        node.css('textDecorationLine', value);
        return true;
    }
    return false;
}

const getBoundsHeight = (node: View) => Math.floor(node.actualHeight - node.contentBoxHeight);

export default class <T extends View> extends squared.base.extensions.Accessibility<T> {
    public readonly options: ExtensionAccessibilityOptions = {
        displayLabel: false
    };
    public readonly eventOnly = true;

    public beforeBaseLayout(sessionId: string) {
        const cache = this.application.getProcessingCache(sessionId);
        cache.each(node => {
            if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                const describedby = node.attributes['aria-describedby'];
                if (describedby) {
                    const sibling = cache.find(item => item.elementId === describedby);
                    if (sibling) {
                        const value = sibling.textContent;
                        if (value) {
                            node.data(Resource.KEY_NAME, 'titleString', value);
                        }
                    }
                }
                switch (node.tagName) {
                    case 'INPUT':
                        switch (node.toElementString('type')) {
                            case 'radio':
                            case 'checkbox':
                                if (!node.rightAligned && !node.centerAligned) {
                                    const id = node.elementId;
                                    [node.nextSibling, node.previousSibling].some((sibling: Null<T>) => {
                                        if (sibling && sibling.pageFlow && !sibling.visibleStyle.backgroundImage && sibling.visible) {
                                            let valid: Undef<boolean>;
                                            if (id && id === sibling.toElementString('htmlFor')) {
                                                valid = true;
                                            }
                                            else if (sibling.textElement) {
                                                const parent = sibling.actualParent!;
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
                                                    if (node.hasPX('width')) {
                                                        if (!node.hasPX('minWidth')) {
                                                            node.css('minWidth', node.cssValue('width'));
                                                        }
                                                        node.css('width', 'auto', true);
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                        return false;
                                    });
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        this.subscribers.add(node);
                        node.naturalChildren.forEach((item: T) => {
                            if (!item.pageFlow && item.zIndex >= 0) {
                                item.android('elevation', '2px');
                            }
                        });
                        break;
                    case 'DEL':
                        addTextDecorationLine(node, 'line-through');
                        break;
                    case 'INS':
                        addTextDecorationLine(node, 'underline');
                        break;
                }
            }
        });
    }

    public postConstraints(node: T) {
        if (node.containerType !== CONTAINER_NODE.BUTTON) {
            const button = this.application.createNode(node.sessionId, { parent: node });
            button.containerName = 'BUTTON';
            button.positioned = true;
            button.renderExclude = false;
            button.setControlType(CONTAINER_TAGNAME.BUTTON, CONTAINER_NODE.BUTTON);
            button.addAlign(NODE_ALIGNMENT.WRAPPER);
            button.cssApply({
                backgroundRepeat: 'repeat',
                backgroundPositionX: 'left',
                backgroundPositionY: 'top'
            });
            button.setCacheValue('backgroundColor', 'rgba(0, 0, 0, 0)');
            button.setCacheValue('inputElement', true);
            button.render(node);
            if (node.layoutConstraint) {
                button.anchorParent('horizontal', 0);
                button.anchorParent('vertical', 0);
                button.setLayoutWidth('0px');
                button.setLayoutHeight('0px');
                if (!node.hasHeight) {
                    this.subscribers.add(button);
                }
            }
            else {
                if (node.layoutRelative) {
                    button.anchor('left', 'true');
                    button.anchor('top', 'true');
                }
                button.setLayoutWidth('match_parent');
                button.setLayoutHeight('match_parent');
                const height = !node.hasHeight ? getBoundsHeight(node) : 0;
                if (height > 0) {
                    button.android('minHeight', height + 'px');
                }
            }
            this.application.addLayoutTemplate(
                node,
                button,
                {
                    type: NODE_TEMPLATE.XML,
                    node: button,
                    controlName: button.controlName
                } as NodeXmlTemplate<T>
            );
        }
    }

    public postOptimize(node: T) {
        if (node.hasAlign(NODE_ALIGNMENT.WRAPPER) && node.renderParent!.inlineHeight) {
            const height = getBoundsHeight(node.renderParent as T);
            if (height > 0) {
                node.app('layout_constraintHeight_min', height + 'px');
            }
        }
    }
}