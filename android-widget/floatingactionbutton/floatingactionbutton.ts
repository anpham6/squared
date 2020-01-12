import { NodeXmlTemplate } from '../../@types/base/application';

import { WIDGET_NAME } from '../lib/constant';

const $lib = squared.lib;
const { parseColor } = $lib.color;
const { assignEmptyValue } = $lib.util;

const { BOX_STANDARD, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const $libA = android.lib;
const { EXT_ANDROID, STRING_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
const { createViewAttribute, getHorizontalBias, getVerticalBias } = $libA.util;

const { Resource } = android.base;

const PREFIX_DIALOG = 'ic_dialog_';

export default class FloatingActionButton<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        const element = <HTMLInputElement> node.element;
        return super.is(node) && (element.tagName !== 'INPUT' || ['button', 'file', 'image', 'reset', 'search', 'submit'].includes(element.type));
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const resource = <android.base.Resource<T>> this.resource;
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options = createViewAttribute(this.options[element.id]);
        const colorName = Resource.addColor(parseColor(node.css('backgroundColor'), node.toFloat('opacity', true, 1)));
        assignEmptyValue(options, 'android', 'backgroundTint', colorName !== '' ? '@color/' + colorName : '?attr/colorAccent');
        if (!node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
            assignEmptyValue(options, 'android', 'focusable', 'false');
        }
        let src = '';
        switch (element.tagName) {
            case 'IMG':
                src = resource.addImageSrc(<HTMLImageElement> element, PREFIX_DIALOG);
                break;
            case 'INPUT':
                if ((<HTMLInputElement> element).type === 'image') {
                    src = resource.addImageSrc(<HTMLImageElement> element, PREFIX_DIALOG);
                    break;
                }
            case 'BUTTON':
                src = resource.addImageSrc(node.backgroundImage, PREFIX_DIALOG);
                break;
        }
        if (src !== '') {
            assignEmptyValue(options, 'app', 'srcCompat', '@drawable/' + src);
        }
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.FLOATING_ACTION_BUTTON : SUPPORT_ANDROID_X.FLOATING_ACTION_BUTTON;
        node.setControlType(controlName, CONTAINER_NODE.BUTTON);
        node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET });
        Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        let outerParent: T | undefined;
        if (!node.pageFlow || target) {
            const horizontalBias = getHorizontalBias(node);
            const verticalBias = getVerticalBias(node);
            const documentParent = node.documentParent;
            const gravity: string[] = [];
            if (horizontalBias < 0.5) {
                gravity.push(node.localizeString('left'));
            }
            else if (horizontalBias > 0.5) {
                gravity.push(node.localizeString('right'));
            }
            else {
                gravity.push(STRING_ANDROID.CENTER_HORIZONTAL);
            }
            if (verticalBias < 0.5) {
                gravity.push('top');
                node.app('layout_dodgeInsetEdges', 'top');
            }
            else if (verticalBias > 0.5) {
                gravity.push('bottom');
            }
            else {
                gravity.push(STRING_ANDROID.CENTER_VERTICAL);
            }
            for (const value of gravity) {
                node.mergeGravity('layout_gravity', value);
            }
            if (horizontalBias > 0 && horizontalBias < 1 && horizontalBias !== 0.5) {
                if (horizontalBias < 0.5) {
                    node.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.linear.left - documentParent.box.left);
                }
                else {
                    node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, documentParent.box.right - node.linear.right);
                }
            }
            if (verticalBias > 0 && verticalBias < 1 && verticalBias !== 0.5) {
                if (verticalBias < 0.5) {
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, node.linear.top - documentParent.box.top);
                }
                else {
                    node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, documentParent.box.bottom - node.linear.bottom);
                }
            }
            node.positioned = true;
            if (target) {
                const layoutGravity = node.android('layout_gravity');
                let anchor = parent.documentId;
                if (parent.controlName === (node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.TOOLBAR : SUPPORT_ANDROID_X.TOOLBAR)) {
                    const value: string = parent.data(WIDGET_NAME.TOOLBAR, 'outerParent');
                    if (value) {
                        anchor = value;
                    }
                }
                if (layoutGravity !== '') {
                    node.app('layout_anchorGravity', layoutGravity);
                    node.delete('android', 'layout_gravity');
                }
                node.app('layout_anchor', anchor);
                node.exclude({ procedure: NODE_PROCEDURE.ALIGNMENT });
                node.render(this.application.resolveTarget(target));
                outerParent = node.renderParent as T;
            }
        }
        if (!target) {
            node.render(parent);
        }
        node.apply(options);
        return {
            outerParent,
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true
        };
    }
}