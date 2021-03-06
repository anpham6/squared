import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import type View from '../../view';

import LayoutUI = squared.base.LayoutUI;

interface MaxWidthHeightData {
    maxWidth: boolean;
    maxHeight: boolean;
}

export default class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.support.maxDimension && !node.inputElement && !node.controlElement;
    }

    public condition(node: T, parent: T) {
        const maxWidth = node.isResizable('maxWidth') && !parent.layoutConstraint && !parent.layoutElement && (
            parent.layoutVertical ||
            parent.layoutFrame ||
            node.blockStatic ||
            node.onlyChild && (parent.blockStatic || parent.hasWidth)
        );
        const maxHeight = node.isResizable('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
        if (maxWidth || maxHeight) {
            this.data.set(node, { maxWidth, maxHeight } as MaxWidthHeightData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const { maxWidth, maxHeight } = this.data.get(node) as MaxWidthHeightData;
        const container = this.controller.createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, alignmentType: NODE_ALIGNMENT.BLOCK | NODE_ALIGNMENT.VERTICAL, flags: CREATE_NODE.RESET_MARGIN });
        if (maxWidth) {
            node.setLayoutWidth(node.fullWidth ? 'match_parent' : '0px');
            container.setLayoutWidth('match_parent');
            if (parent.layoutElement) {
                const autoMargin = node.autoMargin;
                autoMargin.horizontal = false;
                autoMargin.left = false;
                autoMargin.right = false;
                autoMargin.leftRight = false;
            }
        }
        if (maxHeight) {
            node.setLayoutHeight(node.fullHeight ? 'match_parent' : '0px');
            container.setLayoutHeight('match_parent');
            if (parent.layoutElement) {
                const autoMargin = node.autoMargin;
                autoMargin.vertical = false;
                autoMargin.top = false;
                autoMargin.bottom = false;
                autoMargin.topBottom = false;
                if (!maxWidth && node.blockStatic && !node.hasWidth) {
                    node.setLayoutWidth('match_parent', false);
                }
            }
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    container.containerType,
                    NODE_ALIGNMENT.SINGLE
                )
            )
        };
    }
}