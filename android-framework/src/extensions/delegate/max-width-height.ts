import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export interface MaxWidthHeightData {
    width: boolean;
    height: boolean;
    container?: View;
}

export default class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.inputElement && !node.support.maxDimension;
    }

    public condition(node: T, parent: T) {
        const width = node.hasPX('maxWidth') && (node.blockStatic || parent.layoutVertical || node.onlyChild && (parent.blockStatic || parent.hasWidth) || parent.layoutFrame) && !parent.layoutElement && !(parent.layoutConstraint && parent.blockStatic && parent.naturalElements.every(item => item.pageFlow && item.naturalElements.every(child => child.pageFlow))) && !(parent.hasAlign(NODE_ALIGNMENT.COLUMN) && parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT));
        const height = node.hasPX('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
        if (width || height) {
            node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', <MaxWidthHeightData> { width, height });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
        if (mainData) {
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
            container.addAlign(NODE_ALIGNMENT.BLOCK);
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
                    if (!mainData.width && node.blockStatic && !node.hasWidth) {
                        node.setLayoutWidth('match_parent', false);
                    }
                }
            }
            mainData.container = container;
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