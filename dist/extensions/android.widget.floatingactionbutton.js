/* android.widget 1.2.5
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.floatingactionbutton = (function () {
    'use strict';

    const { color: $color, util: $util } = squared.lib;
    const { constant: $constA, enumeration: $enumA, util: $utilA } = android.lib;
    const $Resource = android.base.Resource;
    const $e = squared.base.lib.enumeration;
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
            const options = $utilA.createViewAttribute(this.options[element.id]);
            const colorName = $Resource.addColor($color.parseColor(node.css('backgroundColor'), node.toFloat('opacity', true, 1)));
            $util.assignEmptyValue(options, 'android', 'backgroundTint', colorName !== '' ? `@color/${colorName}` : '?attr/colorAccent');
            if (!node.hasProcedure($e.NODE_PROCEDURE.ACCESSIBILITY)) {
                $util.assignEmptyValue(options, 'android', 'focusable', 'false');
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
                $util.assignEmptyValue(options, 'app', 'srcCompat', `@drawable/${src}`);
            }
            node.setControlType($constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON, $enumA.CONTAINER_NODE.BUTTON);
            node.exclude($e.NODE_RESOURCE.BOX_STYLE | $e.NODE_RESOURCE.ASSET);
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            let parentAs;
            if (!node.pageFlow || target) {
                const horizontalBias = $utilA.getHorizontalBias(node);
                const verticalBias = $utilA.getVerticalBias(node);
                const documentParent = node.documentParent;
                const gravity = [];
                if (horizontalBias < 0.5) {
                    gravity.push(node.localizeString('left'));
                }
                else if (horizontalBias > 0.5) {
                    gravity.push(node.localizeString('right'));
                }
                else {
                    gravity.push($constA.STRING_ANDROID.CENTER_HORIZONTAL);
                }
                if (verticalBias < 0.5) {
                    gravity.push('top');
                    node.app('layout_dodgeInsetEdges', 'top');
                }
                else if (verticalBias > 0.5) {
                    gravity.push('bottom');
                }
                else {
                    gravity.push($constA.STRING_ANDROID.CENTER_VERTICAL);
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
                    if (parent.controlName === $constA.SUPPORT_ANDROID.TOOLBAR) {
                        const outerParent = parent.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent');
                        if (outerParent) {
                            anchor = outerParent;
                        }
                    }
                    if (layoutGravity !== '') {
                        node.app('layout_anchorGravity', layoutGravity);
                        node.delete('android', 'layout_gravity');
                    }
                    node.app('layout_anchor', anchor);
                    node.exclude(0, $e.NODE_PROCEDURE.ALIGNMENT);
                    node.render(this.application.resolveTarget(target));
                    parentAs = node.renderParent;
                }
            }
            if (!target) {
                node.render(parent);
            }
            node.apply(options);
            return {
                parentAs,
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: $constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON
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
