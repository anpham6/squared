import View from '../../view';

import { CONTAINER_ANDROID, EXT_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const $const = squared.lib.constant;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

export interface MaxWidthHeightData {
    width: boolean;
    height: boolean;
    container?: View;
}

export default class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T, parent: T) {
        if (!node.inputElement) {
            let width = false;
            let height = false;
            if (!node.support.maxWidth && !isNaN(node.width) && node.has('maxWidth') && !parent.hasAlign($e.NODE_ALIGNMENT.COLUMN)) {
                width = true;
            }
            if (!node.support.maxHeight && !isNaN(node.height) && node.has('maxHeight') && parent.hasHeight) {
                height = true;
            }
            if (width || height) {
                node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA, <MaxWidthHeightData> { width, height });
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const container = parent.layoutConstraint ? parent : (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, undefined, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
            if (mainData.width) {
                node.setLayoutWidth($const.CSS.PX_0);
                container.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                if (parent.layoutElement) {
                    node.autoMargin.horizontal = false;
                    node.autoMargin.left = false;
                    node.autoMargin.right = false;
                    node.autoMargin.leftRight = false;
                }
            }
            if (mainData.height) {
                node.setLayoutHeight($const.CSS.PX_0);
                container.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
                if (parent.layoutElement) {
                    node.autoMargin.vertical = false;
                    node.autoMargin.top = false;
                    node.autoMargin.bottom = false;
                    node.autoMargin.topBottom = false;
                }
            }
            mainData.container = container;
            if (parent !== container) {
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new $LayoutUI(
                            parent,
                            container,
                            container.containerType,
                            $e.NODE_ALIGNMENT.SINGLE,
                            container.children as T[]
                        )
                    )
                };
            }
        }
        return undefined;
    }
}