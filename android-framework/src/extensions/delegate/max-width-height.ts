import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

interface MaxWidthHeightData {
    maxWidth: boolean;
    maxHeight: boolean;
}

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export default class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.inputElement && !node.support.maxDimension;
    }

    public condition(node: T, parent: T) {
        const maxWidth = node.hasPX('maxWidth') && !parent.layoutConstraint && !parent.layoutElement && (
            parent.layoutVertical ||
            parent.layoutFrame ||
            node.blockStatic ||
            node.onlyChild && (parent.blockStatic || parent.hasWidth)
        );
        const maxHeight = node.hasPX('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
        if (maxWidth || maxHeight) {
            node.data(this.name, 'mainData', { maxWidth, maxHeight } as MaxWidthHeightData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(this.name, 'mainData');
        if (mainData) {
            const container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, alignmentType: NODE_ALIGNMENT.BLOCK, resetMargin: true });
            if (mainData.maxWidth) {
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
            if (mainData.maxHeight) {
                node.setLayoutHeight('0px');
                container.setLayoutHeight('match_parent');
                if (parent.layoutElement) {
                    const autoMargin = node.autoMargin;
                    autoMargin.vertical = false;
                    autoMargin.top = false;
                    autoMargin.bottom = false;
                    autoMargin.topBottom = false;
                    if (!mainData.maxHeight && node.blockStatic && !node.hasWidth) {
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
                        NODE_ALIGNMENT.SINGLE,
                        container.children as T[]
                    )
                )
            };
        }
        return undefined;
    }
}