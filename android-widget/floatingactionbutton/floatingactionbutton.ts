import { NodeXmlTemplate } from '../../src/base/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $enum = squared.base.lib.enumeration;
const $color = squared.lib.color;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

export default class FloatingActionButton<T extends android.base.View> extends squared.base.Extension<T> {
    public is(node: T) {
        const element = <HTMLInputElement> node.element;
        return super.is(node) && (element.tagName !== 'INPUT' || ['button', 'file', 'image', 'reset', 'search', 'submit'].includes(element.type));
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options = $utilA.createViewAttribute(this.options[element.id]);
        const colorName = $Resource.addColor($color.parseColor(node.css('backgroundColor'), node.css('opacity')));
        $util.assignEmptyValue(options, 'android', 'backgroundTint', colorName !== '' ? `@color/${colorName}` : '?attr/colorAccent');
        if (!node.hasProcedure($enum.NODE_PROCEDURE.ACCESSIBILITY)) {
            $util.assignEmptyValue(options, 'android', 'focusable', 'false');
        }
        let src = '';
        switch (element.tagName) {
            case 'IMG':
                src = $Resource.addImageSrc(<HTMLImageElement> element, $constA.PREFIX_ANDROID.DIALOG);
                break;
            case 'INPUT':
                if ((<HTMLInputElement> element).type === 'image') {
                    src = $Resource.addImage({ mdpi: node.src }, $constA.PREFIX_ANDROID.DIALOG);
                }
                else {
                    src = $Resource.addImageURL(node.css('backgroundImage'), $constA.PREFIX_ANDROID.DIALOG);
                }
                break;
            case 'BUTTON':
                src = $Resource.addImageURL(node.css('backgroundImage'), $constA.PREFIX_ANDROID.DIALOG);
                break;
        }
        if (src !== '') {
            $util.assignEmptyValue(options, 'app', 'srcCompat', `@drawable/${src}`);
        }
        node.setControlType($constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON, $enumA.CONTAINER_NODE.BUTTON);
        node.exclude({ resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET });
        $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        let parentAs: T | undefined;
        if (!node.pageFlow || target) {
            const horizontalBias = node.horizontalBias;
            const verticalBias = node.verticalBias;
            const documentParent = node.documentParent;
            const gravity: string[] = [];
            if (horizontalBias < 0.5) {
                gravity.push(node.localizeString('left'));
            }
            else if (horizontalBias > 0.5) {
                gravity.push(node.localizeString('right'));
            }
            else {
                gravity.push('center_horizontal');
            }
            if (verticalBias < 0.5) {
                gravity.push('top');
                node.app('layout_dodgeInsetEdges', 'top');
            }
            else if (verticalBias > 0.5) {
                gravity.push('bottom');
            }
            else {
                gravity.push('center_vertical');
            }
            for (const value of gravity) {
                node.mergeGravity('layout_gravity', value);
            }
            if (horizontalBias > 0 && horizontalBias < 1 && horizontalBias !== 0.5) {
                if (horizontalBias < 0.5) {
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, node.linear.left - documentParent.box.left);
                }
                else {
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, documentParent.box.right - node.linear.right);
                }
            }
            if (verticalBias > 0 && verticalBias < 1 && verticalBias !== 0.5) {
                if (verticalBias < 0.5) {
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, node.linear.top - documentParent.box.top);
                }
                else {
                    node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, documentParent.box.bottom - node.linear.bottom);
                }
            }
            node.positioned = true;
            if (target) {
                const layoutGravity = node.android('layout_gravity');
                let anchor = parent.documentId;
                if (parent.controlName === $constA.SUPPORT_ANDROID.TOOLBAR) {
                    const outerParent: string = parent.data(WIDGET_NAME.TOOLBAR, 'outerParent');
                    if (outerParent) {
                        anchor = outerParent;
                    }
                }
                if (layoutGravity !== '') {
                    node.app('layout_anchorGravity', layoutGravity);
                    node.delete('android', 'layout_gravity');
                }
                node.app('layout_anchor', anchor);
                node.exclude({ procedure: $enum.NODE_PROCEDURE.ALIGNMENT });
                node.render(this.application.resolveTarget(target));
                parentAs = node.renderParent as T;
            }
        }
        if (!target) {
            node.render(parent);
        }
        node.apply(options);
        return {
            parentAs,
            output: <NodeXmlTemplate<T>> {
                type: $enum.NODE_TEMPLATE.XML,
                node,
                controlName: $constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON
            },
            complete: true
        };
    }
}