import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

export interface MaxWidthHeightData {
    width: boolean;
    height: boolean;
    container?: View;
}

export default class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.inputElement;
    }

    public condition(node: T, parent: T) {
        const { maxWidth, maxHeight } = node.support;
        let width = false;
        let height = false;
        if (!maxWidth && !isNaN(node.width) && node.hasPX('maxWidth') && !parent.hasAlign($e.NODE_ALIGNMENT.COLUMN)) {
            width = true;
        }
        if (!maxHeight && !isNaN(node.height) && node.hasPX('maxHeight') && parent.hasHeight) {
            height = true;
        }
        if (width || height) {
            node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA, <MaxWidthHeightData> { width, height });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const container = parent.layoutConstraint ? parent : (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, View.getControlName(CONTAINER_NODE.CONSTRAINT, node.localSettings.targetAPI), CONTAINER_NODE.CONSTRAINT);
            if (mainData.width) {
                node.setLayoutWidth('0px');
                container.setLayoutWidth('match_parent');
                if (parent.layoutElement) {
                    const autoMargin = node.autoMargin;
                    autoMargin.horizontal = false;
                    autoMargin.left = false;
                    autoMargin.right = false;
                    autoMargin.leftRight = false;
                }
            }
            if (mainData.height) {
                node.setLayoutHeight('0px');
                container.setLayoutHeight('match_parent');
                if (parent.layoutElement) {
                    const autoMargin = node.autoMargin;
                    autoMargin.vertical = false;
                    autoMargin.top = false;
                    autoMargin.bottom = false;
                    autoMargin.topBottom = false;
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