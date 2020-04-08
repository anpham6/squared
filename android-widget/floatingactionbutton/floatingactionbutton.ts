import { NodeXmlTemplate } from '../../@types/base/application';

import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

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

export default class FloatingActionButton<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        const element = <HTMLInputElement> node.element;
        return super.is(node) && (element.tagName !== 'INPUT' || SUPPORTED_INPUT.includes(element.type));
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const resource = <android.base.Resource<T>> this.resource;
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options = createViewAttribute(this.options[element.id]);
        const colorName = Resource.addColor(parseColor(node.css('backgroundColor'), node.toFloat('opacity', 1)));
        assignEmptyValue(options, 'android', 'backgroundTint', colorName !== '' ? `@color/${colorName}` : '?attr/colorAccent');
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
            const app = safeNestedMap<string>(options, 'app');
            assignEmptyValue(app, 'srcCompat', `@drawable/${src}`);
        }
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.FLOATING_ACTION_BUTTON : SUPPORT_ANDROID_X.FLOATING_ACTION_BUTTON;
        node.setControlType(controlName, CONTAINER_NODE.BUTTON);
        node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET });
        Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        let outerParent = this.application.resolveTarget(target);
        if (!node.pageFlow) {
            const { leftRight, topBottom } = node.autoMargin;
            const offsetParent = outerParent || parent;
            if (leftRight) {
                node.mergeGravity('layout_gravity', 'center_horizontal');
            }
            else if (node.hasPX('left')) {
                node.mergeGravity('layout_gravity', node.localizeString('left'));
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, adjustAbsolutePaddingOffset(offsetParent, BOX_STANDARD.PADDING_LEFT, node.left));
            }
            else if (node.hasPX('right')) {
                node.mergeGravity('layout_gravity', node.localizeString('right'));
                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, adjustAbsolutePaddingOffset(offsetParent, BOX_STANDARD.PADDING_RIGHT, node.right));
            }
            if (topBottom) {
                node.mergeGravity('layout_gravity', 'center_vertical');
            }
            else if (node.hasPX('top')) {
                node.app('layout_dodgeInsetEdges', 'top');
                node.mergeGravity('layout_gravity', 'top');
                node.modifyBox(BOX_STANDARD.MARGIN_TOP, adjustAbsolutePaddingOffset(offsetParent, BOX_STANDARD.PADDING_TOP, node.top));
            }
            else if (node.hasPX('bottom')) {
                node.mergeGravity('layout_gravity', 'bottom');
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, adjustAbsolutePaddingOffset(offsetParent, BOX_STANDARD.PADDING_BOTTOM, node.bottom));
            }
            node.positioned = true;
        }
        else if (target) {
            const horizontalBias = getHorizontalBias(node);
            const verticalBias = getVerticalBias(node);
            const documentParent = node.documentParent;
            if (horizontalBias < 0.5) {
                node.mergeGravity('layout_gravity', node.localizeString('left'));
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.linear.left - documentParent.box.left);
            }
            else if (horizontalBias > 0.5) {
                node.mergeGravity('layout_gravity', node.localizeString('right'));
                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, documentParent.box.right - node.linear.right);
            }
            else {
                node.mergeGravity('layout_gravity', 'center_horizontal');
            }
            if (verticalBias < 0.5) {
                node.app('layout_dodgeInsetEdges', 'top');
                node.mergeGravity('layout_gravity', 'top');
                node.modifyBox(BOX_STANDARD.MARGIN_TOP, node.linear.top - documentParent.box.top);
            }
            else if (verticalBias > 0.5) {
                node.mergeGravity('layout_gravity', 'bottom');
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, documentParent.box.bottom - node.linear.bottom);
            }
            else {
                node.mergeGravity('layout_gravity', 'center_vertical');
            }
            node.positioned = true;
        }
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
            node.render(outerParent);
        }
        else {
            node.render(parent);
            outerParent = undefined;
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