import { ExtensionResult } from '../../src/base/types/application';

import { WIDGET_NAME } from '../lib/constant';

import $enum = squared.base.lib.enumeration;
import $color = squared.lib.color;
import $util = squared.lib.util;

import $Resource = android.base.Resource;
import $View = android.base.View;
import $const_android = android.lib.constant;
import $enum_android = android.lib.enumeration;
import $util_android = android.lib.util;

export default class FloatingActionButton<T extends $View> extends squared.base.Extension<T> {
    public is(node: T) {
        const element = <HTMLInputElement> node.element;
        return super.is(node) && (element.tagName !== 'INPUT' || ['button', 'file', 'image', 'reset', 'search', 'submit'].includes(element.type));
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const element = <HTMLElement> node.element;
        const target = $util.hasValue(node.dataset.target);
        const options = $util_android.createAttribute(this.options[element.id]);
        const backgroundColor = $color.parseRGBA(node.css('backgroundColor'), node.css('opacity'));
        let colorValue = '';
        if (backgroundColor) {
            colorValue = $Resource.addColor(backgroundColor);
        }
        $util.defaultWhenNull(options, 'android', 'backgroundTint', colorValue !== '' ? `@color/${colorValue}` : '?attr/colorAccent');
        if (node.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.ACCESSIBILITY)) {
            $util.defaultWhenNull(options, 'android', 'focusable', 'false');
        }
        let src = '';
        switch (element.tagName) {
            case 'IMG':
                src = $Resource.addImageSrcSet(<HTMLImageElement> element, $const_android.PREFIX_ANDROID.DIALOG);
                break;
            case 'INPUT':
                if ((<HTMLInputElement> element).type === 'image') {
                    src = $Resource.addImage({ mdpi: (<HTMLInputElement> element).src }, $const_android.PREFIX_ANDROID.DIALOG);
                }
                else {
                    src = $Resource.addImageUrl(node.css('backgroundImage'), $const_android.PREFIX_ANDROID.DIALOG);
                }
                break;
            case 'BUTTON':
                src = $Resource.addImageUrl(node.css('backgroundImage'), $const_android.PREFIX_ANDROID.DIALOG);
                break;
        }
        if (src !== '') {
            $util.defaultWhenNull(options, 'app', 'srcCompat', `@drawable/${src}`);
        }
        node.setControlType($const_android.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON, $enum_android.CONTAINER_NODE.BUTTON);
        node.exclude({ resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET });
        if (!node.pageFlow || target) {
            const horizontalBias = node.horizontalBias();
            const verticalBias = node.verticalBias();
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
            const layoutGravity = node.mergeGravity('layout_gravity', ...gravity);
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
            if (target) {
                let anchor = parent.documentId;
                if (parent.controlName === $const_android.SUPPORT_ANDROID.TOOLBAR) {
                    const outerParent: string = parent.data(WIDGET_NAME.TOOLBAR, 'outerParent');
                    if (outerParent) {
                        anchor = outerParent;
                    }
                }
                node.app('layout_anchor', anchor);
                if (layoutGravity !== '') {
                    node.app('layout_anchorGravity', layoutGravity);
                    node.delete('android', 'layout_gravity');
                }
                node.exclude({ procedure: $enum.NODE_PROCEDURE.ALIGNMENT });
                node.render(node);
            }
            else {
                node.render(parent);
            }
            node.positioned = true;
        }
        else {
            node.render(parent);
        }
        const output = this.application.controllerHandler.renderNodeStatic(
            $const_android.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON,
            target ? -1 : node.renderDepth,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
            'wrap_content',
            'wrap_content',
            node
        );
        return { output, complete: true };
    }
}