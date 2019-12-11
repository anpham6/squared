import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

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
        const width = !maxWidth && !isNaN(node.width) && node.hasPX('maxWidth') && !parent.hasAlign(NODE_ALIGNMENT.COLUMN);
        const height = !maxHeight && !isNaN(node.height) && node.hasPX('maxHeight') && parent.hasHeight;
        if (width || height) {
            node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', <MaxWidthHeightData> { width, height });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
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
                            NODE_ALIGNMENT.SINGLE,
                            container.children as T[]
                        )
                    )
                };
            }
        }
        return undefined;
    }
}