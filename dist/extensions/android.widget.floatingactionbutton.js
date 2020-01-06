/* android.widget.floatingactionbutton 1.3.7
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.floatingactionbutton = (function () {
    'use strict';

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
    class FloatingActionButton extends squared.base.ExtensionUI {
        is(node) {
            const element = node.element;
            return super.is(node) && (element.tagName !== 'INPUT' || ['button', 'file', 'image', 'reset', 'search', 'submit'].includes(element.type));
        }
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const resource = this.resource;
            const element = node.element;
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
            if (src !== '') {
                assignEmptyValue(options, 'app', 'srcCompat', '@drawable/' + src);
            }
            const controlName = node.localSettings.targetAPI < 29 /* Q */ ? SUPPORT_ANDROID.FLOATING_ACTION_BUTTON : SUPPORT_ANDROID_X.FLOATING_ACTION_BUTTON;
            node.setControlType(controlName, CONTAINER_NODE.BUTTON);
            node.exclude(NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET);
            Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            let outerParent;
            if (!node.pageFlow || target) {
                const horizontalBias = getHorizontalBias(node);
                const verticalBias = getVerticalBias(node);
                const documentParent = node.documentParent;
                const gravity = [];
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
                        node.modifyBox(16 /* MARGIN_LEFT */, node.linear.left - documentParent.box.left);
                    }
                    else {
                        node.modifyBox(4 /* MARGIN_RIGHT */, documentParent.box.right - node.linear.right);
                    }
                }
                if (verticalBias > 0 && verticalBias < 1 && verticalBias !== 0.5) {
                    if (verticalBias < 0.5) {
                        node.modifyBox(2 /* MARGIN_TOP */, node.linear.top - documentParent.box.top);
                    }
                    else {
                        node.modifyBox(8 /* MARGIN_BOTTOM */, documentParent.box.bottom - node.linear.bottom);
                    }
                }
                node.positioned = true;
                if (target) {
                    const layoutGravity = node.android('layout_gravity');
                    let anchor = parent.documentId;
                    if (parent.controlName === (node.localSettings.targetAPI < 29 /* Q */ ? SUPPORT_ANDROID.TOOLBAR : SUPPORT_ANDROID_X.TOOLBAR)) {
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
                    node.exclude(0, NODE_PROCEDURE.ALIGNMENT);
                    node.render(this.application.resolveTarget(target));
                    outerParent = node.renderParent;
                }
            }
            if (!target) {
                node.render(parent);
            }
            node.apply(options);
            return {
                outerParent,
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
        squared.includeAsync(fab);
    }

    return fab;

}());
