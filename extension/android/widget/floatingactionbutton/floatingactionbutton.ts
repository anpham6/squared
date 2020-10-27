import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import BUILD_VERSION = android.lib.constant.BUILD_VERSION;

import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const { NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;
const { CONTAINER_NODE, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X } = android.lib.constant;

const { assignEmptyValue } = squared.lib.util;
const { createViewAttribute, parseColor } = android.lib.util;

const Resource = android.base.Resource;

const SUPPORTED_INPUT = [
    'button',
    'file',
    'image',
    'reset',
    'search',
    'submit'
];

const PREFIX_DIALOG = 'ic_dialog_';

export default class FloatingActionButton<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        const element = node.element as HTMLInputElement;
        return super.is(node) && (element.tagName !== 'INPUT' || SUPPORTED_INPUT.includes(element.type));
    }

    public condition(node: T) {
        return this.included(node.element as HTMLElement);
    }

    public processNode(node: T, parent: T) {
        const { element, target } = node;
        const options = createViewAttribute(this.options[element!.id.trim()]);
        const backgroundColor = node.css('backgroundColor');
        let colorName: Undef<string>;
        if (backgroundColor !== 'none') {
            const colorData = parseColor(backgroundColor);
            if (colorData) {
                colorName = Resource.addColor(colorData);
            }
        }
        assignEmptyValue(options, 'android', 'backgroundTint', colorName ? `@color/${colorName}` : '?attr/colorAccent');
        if (!node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
            assignEmptyValue(options, 'android', 'focusable', 'false');
        }
        let src: Undef<string>;
        switch (element!.tagName) {
            case 'IMG':
                src = (this.resource as android.base.Resource<T>).addImageSrc(element as HTMLImageElement, PREFIX_DIALOG);
                break;
            case 'INPUT':
                if ((element as HTMLInputElement).type === 'image') {
                    src = (this.resource as android.base.Resource<T>).addImageSrc(element as HTMLImageElement, PREFIX_DIALOG);
                    break;
                }
            case 'BUTTON':
                src = (this.resource as android.base.Resource<T>).addImageSrc(node.backgroundImage, PREFIX_DIALOG);
                break;
        }
        if (src) {
            assignEmptyValue(options.app ||= {}, 'srcCompat', `@drawable/${src}`);
        }
        const controlName = node.api < BUILD_VERSION.Q ? SUPPORT_TAGNAME.FLOATING_ACTION_BUTTON : SUPPORT_TAGNAME_X.FLOATING_ACTION_BUTTON;
        node.setControlType(controlName, CONTAINER_NODE.BUTTON);
        node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET });
        Resource.formatOptions(options, this.application.extensionManager.valueAsBoolean(android.base.EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource'));
        if (!node.pageFlow) {
            const offsetParent = (this.application as android.base.Application<T>).resolveTarget(node.sessionId, target) || parent;
            if (node.autoMargin.leftRight) {
                node.mergeGravity('layout_gravity', 'center_horizontal');
            }
            else if (node.hasPX('left')) {
                node.mergeGravity('layout_gravity', node.localizeString('left'));
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, offsetParent.getAbsolutePaddingOffset(BOX_STANDARD.PADDING_LEFT, node.left));
            }
            else if (node.hasPX('right')) {
                node.mergeGravity('layout_gravity', node.localizeString('right'));
                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, offsetParent.getAbsolutePaddingOffset(BOX_STANDARD.PADDING_RIGHT, node.right));
            }
            if (node.autoMargin.topBottom) {
                node.mergeGravity('layout_gravity', 'center_vertical');
            }
            else if (node.hasPX('top')) {
                node.app('layout_dodgeInsetEdges', 'top');
                node.mergeGravity('layout_gravity', 'top');
                node.modifyBox(BOX_STANDARD.MARGIN_TOP, offsetParent.getAbsolutePaddingOffset(BOX_STANDARD.PADDING_TOP, node.top));
            }
            else if (node.hasPX('bottom')) {
                node.mergeGravity('layout_gravity', 'bottom');
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offsetParent.getAbsolutePaddingOffset(BOX_STANDARD.PADDING_BOTTOM, node.bottom));
            }
            node.positioned = true;
        }
        else if (target) {
            const box = node.documentParent.box;
            const linear = node.linear;
            const horizontalBias = node.getHorizontalBias();
            const verticalBias = node.getVerticalBias();
            if (horizontalBias < 0.5) {
                node.mergeGravity('layout_gravity', node.localizeString('left'));
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, linear.left - box.left);
            }
            else if (horizontalBias > 0.5) {
                node.mergeGravity('layout_gravity', node.localizeString('right'));
                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, box.right - linear.right);
            }
            else {
                node.mergeGravity('layout_gravity', 'center_horizontal');
            }
            if (verticalBias < 0.5) {
                node.app('layout_dodgeInsetEdges', 'top');
                node.mergeGravity('layout_gravity', 'top');
                node.modifyBox(BOX_STANDARD.MARGIN_TOP, linear.top - box.top);
            }
            else if (verticalBias > 0.5) {
                node.mergeGravity('layout_gravity', 'bottom');
                node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, box.bottom - linear.bottom);
            }
            else {
                node.mergeGravity('layout_gravity', 'center_vertical');
            }
            node.positioned = true;
        }
        if (target) {
            const layoutGravity = node.android('layout_gravity');
            let anchor = parent.documentId;
            if (parent.controlName === (node.api < BUILD_VERSION.Q ? SUPPORT_TAGNAME.TOOLBAR : SUPPORT_TAGNAME_X.TOOLBAR)) {
                const value = parent.data<string>(WIDGET_NAME.TOOLBAR, 'outerParent');
                if (value) {
                    anchor = value;
                }
            }
            if (layoutGravity) {
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
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            } as NodeXmlTemplate<T>,
            complete: true
        };
    }
}