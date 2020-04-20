/* android.widget.floatingactionbutton 1.6.3
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.floatingactionbutton = (function () {
    'use strict';

    const $lib = squared.lib;
    const $libA = android.lib;
    const { parseColor } = $lib.color;
    const { assignEmptyValue, safeNestedMap } = $lib.util;
    const { BOX_STANDARD, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const { adjustAbsolutePaddingOffset, createViewAttribute, getHorizontalBias, getVerticalBias } = $libA.util;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
    const Resource = android.base.Resource;
    const PREFIX_DIALOG = 'ic_dialog_';
    const SUPPORTED_INPUT = ['button', 'file', 'image', 'reset', 'search', 'submit'];
    class FloatingActionButton extends squared.base.ExtensionUI {
        is(node) {
            const element = node.element;
            return super.is(node) && (element.tagName !== 'INPUT' || SUPPORTED_INPUT.includes(element.type));
        }
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const resource = this.resource;
            const element = node.element;
            const target = node.target;
            const options = createViewAttribute(this.options[element.id]);
            const colorName = Resource.addColor(parseColor(node.css('backgroundColor'), node.toFloat('opacity', 1)));
            assignEmptyValue(options, 'android', 'backgroundTint', colorName !== '' ? `@color/${colorName}` : '?attr/colorAccent');
            if (!node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                assignEmptyValue(options, 'android', 'focusable', 'false');
            }
            let src;
            switch (element.tagName) {
                case 'IMG':
                    src = resource.addImageSrc(element, PREFIX_DIALOG);
                    break;
                case 'INPUT':
                    if (element.type === 'image') {
                        src = resource.addImageSrc(element, PREFIX_DIALOG);
                        break;
                    }
                case 'BUTTON':
                    src = resource.addImageSrc(node.backgroundImage, PREFIX_DIALOG);
                    break;
            }
            if (src) {
                assignEmptyValue(safeNestedMap(options, 'app'), 'srcCompat', `@drawable/${src}`);
            }
            const controlName = node.api < 29 /* Q */ ? SUPPORT_ANDROID.FLOATING_ACTION_BUTTON : SUPPORT_ANDROID_X.FLOATING_ACTION_BUTTON;
            node.setControlType(controlName, CONTAINER_NODE.BUTTON);
            node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET });
            Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            if (!node.pageFlow) {
                const { leftRight, topBottom } = node.autoMargin;
                const offsetParent = this.application.resolveTarget(target) || parent;
                if (leftRight) {
                    node.mergeGravity('layout_gravity', 'center_horizontal');
                }
                else if (node.hasPX('left')) {
                    node.mergeGravity('layout_gravity', node.localizeString('left'));
                    node.modifyBox(16 /* MARGIN_LEFT */, adjustAbsolutePaddingOffset(offsetParent, 256 /* PADDING_LEFT */, node.left));
                }
                else if (node.hasPX('right')) {
                    node.mergeGravity('layout_gravity', node.localizeString('right'));
                    node.modifyBox(4 /* MARGIN_RIGHT */, adjustAbsolutePaddingOffset(offsetParent, 64 /* PADDING_RIGHT */, node.right));
                }
                if (topBottom) {
                    node.mergeGravity('layout_gravity', 'center_vertical');
                }
                else if (node.hasPX('top')) {
                    node.app('layout_dodgeInsetEdges', 'top');
                    node.mergeGravity('layout_gravity', 'top');
                    node.modifyBox(2 /* MARGIN_TOP */, adjustAbsolutePaddingOffset(offsetParent, 32 /* PADDING_TOP */, node.top));
                }
                else if (node.hasPX('bottom')) {
                    node.mergeGravity('layout_gravity', 'bottom');
                    node.modifyBox(8 /* MARGIN_BOTTOM */, adjustAbsolutePaddingOffset(offsetParent, 128 /* PADDING_BOTTOM */, node.bottom));
                }
                node.positioned = true;
            }
            else if (target) {
                const box = node.documentParent.box;
                const linear = node.linear;
                const horizontalBias = getHorizontalBias(node);
                const verticalBias = getVerticalBias(node);
                if (horizontalBias < 0.5) {
                    node.mergeGravity('layout_gravity', node.localizeString('left'));
                    node.modifyBox(16 /* MARGIN_LEFT */, linear.left - box.left);
                }
                else if (horizontalBias > 0.5) {
                    node.mergeGravity('layout_gravity', node.localizeString('right'));
                    node.modifyBox(4 /* MARGIN_RIGHT */, box.right - linear.right);
                }
                else {
                    node.mergeGravity('layout_gravity', 'center_horizontal');
                }
                if (verticalBias < 0.5) {
                    node.app('layout_dodgeInsetEdges', 'top');
                    node.mergeGravity('layout_gravity', 'top');
                    node.modifyBox(2 /* MARGIN_TOP */, linear.top - box.top);
                }
                else if (verticalBias > 0.5) {
                    node.mergeGravity('layout_gravity', 'bottom');
                    node.modifyBox(8 /* MARGIN_BOTTOM */, box.bottom - linear.bottom);
                }
                else {
                    node.mergeGravity('layout_gravity', 'center_vertical');
                }
                node.positioned = true;
            }
            if (target) {
                const layoutGravity = node.android('layout_gravity');
                let anchor = parent.documentId;
                if (parent.controlName === (node.api < 29 /* Q */ ? SUPPORT_ANDROID.TOOLBAR : SUPPORT_ANDROID_X.TOOLBAR)) {
                    const value = parent.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent');
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
            }
            node.render(parent);
            node.apply(options);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                },
                complete: true
            };
        }
    }

    const fab = new FloatingActionButton("android.widget.floatingactionbutton" /* FAB */, 2 /* ANDROID */, ['BUTTON', 'INPUT', 'IMG']);
    if (squared) {
        squared.include(fab);
    }

    return fab;

}());
