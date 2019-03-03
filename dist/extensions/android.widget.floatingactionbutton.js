/* android.widget 0.7.2
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.floatingactionbutton = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $color = squared.lib.color;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    class FloatingActionButton extends squared.base.Extension {
        is(node) {
            const element = node.element;
            return super.is(node) && (element.tagName !== 'INPUT' || ['button', 'file', 'image', 'reset', 'search', 'submit'].includes(element.type));
        }
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const element = node.element;
            const target = $util.hasValue(node.dataset.target);
            const options = $utilA.createViewAttribute(this.options[element.id]);
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
                    src = $Resource.addImageSrcSet(element, $constA.PREFIX_ANDROID.DIALOG);
                    break;
                case 'INPUT':
                    if (element.type === 'image') {
                        src = $Resource.addImage({ mdpi: element.src }, $constA.PREFIX_ANDROID.DIALOG);
                    }
                    else {
                        src = $Resource.addImageUrl(node.css('backgroundImage'), $constA.PREFIX_ANDROID.DIALOG);
                    }
                    break;
                case 'BUTTON':
                    src = $Resource.addImageUrl(node.css('backgroundImage'), $constA.PREFIX_ANDROID.DIALOG);
                    break;
            }
            if (src !== '') {
                $util.defaultWhenNull(options, 'app', 'srcCompat', `@drawable/${src}`);
            }
            node.setControlType($constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON, $enumA.CONTAINER_NODE.BUTTON);
            node.exclude({ resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET });
            if (!node.pageFlow || target) {
                const horizontalBias = node.horizontalBias();
                const verticalBias = node.verticalBias();
                const documentParent = node.documentParent;
                const gravity = [];
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
                if (target) {
                    let anchor = parent.documentId;
                    if (parent.controlName === $constA.SUPPORT_ANDROID.TOOLBAR) {
                        const outerParent = parent.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent');
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
            const output = this.application.controllerHandler.renderNodeStatic($constA.SUPPORT_ANDROID.FLOATING_ACTION_BUTTON, target ? -1 : node.renderDepth, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), 'wrap_content', 'wrap_content', node);
            return { output, complete: true };
        }
    }

    const fab = new FloatingActionButton("android.widget.floatingactionbutton" /* FAB */, 2 /* ANDROID */, ['BUTTON', 'INPUT', 'IMG']);
    if (squared) {
        squared.includeAsync(fab);
    }

    return fab;

}());
