import View from '../../view';

import { EXT_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

type NegativeXData = {
    offsetLeft: number;
    nextSibling: View;
    firstChild?: View;
};

function outsideX(node: View, parent: View) {
    if (node.pageFlow) {
        return node === parent.firstChild && node.inlineFlow && !node.centerAligned && !node.rightAligned && node.marginLeft < 0 && Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft && !parent.some(item => item.multiline);
    }
    else {
        return node.absoluteParent === parent && (node.left < 0 || !node.hasPX('left') && node.right < 0);
    }
}

export default class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.documentRoot && node.css('overflowX') !== 'hidden';
    }

    public condition(node: T) {
        return node.some((item: T) => outsideX(item, node));
    }

    public processNode(node: T, parent: T) {
        const outside = node.filter((item: T) => outsideX(item, node)) as T[];
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, outside, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
        node.resetBox(BOX_STANDARD.MARGIN_TOP | BOX_STANDARD.MARGIN_BOTTOM, container);
        let left = NaN;
        let right = NaN;
        let firstChild: Undef<T>;
        for (const item of outside) {
            const linear = item.linear;
            if (item.pageFlow) {
                if (isNaN(left) || linear.left < left) {
                    left = linear.left;
                }
                firstChild = item;
            }
            else {
                if (item.hasPX('left')) {
                    if (item.left < 0 && (isNaN(left) || linear.left < left)) {
                        left = linear.left;
                    }
                }
                else if (item.right < 0 && (isNaN(right) || linear.right > right)) {
                    right = linear.right;
                }
            }
        }
        container.inherit(node, 'styleMap');
        if (!isNaN(left)) {
            let offset = node.linear.left - left;
            if (offset > 0) {
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                for (const item of outside) {
                    if (!item.pageFlow && item.left < 0) {
                        item.css('left', formatPX(item.left + offset), true);
                    }
                }
            }
            else {
                for (const item of outside) {
                    if (!item.pageFlow && item.left < 0) {
                        item.css('left', formatPX(node.marginLeft + item.left), true);
                    }
                }
                offset = Math.abs(offset);
            }
            if (node.hasPX('width', false)) {
                container.cssPX('width', Math.max(node.marginLeft, 0) + offset, false);
            }
            else if (node.percentWidth > 0) {
                container.css('width', 'auto');
            }
        }
        if (!isNaN(right)) {
            const rightA = node.linear.right;
            const marginRight = node.marginRight;
            let offset = right - rightA;
            if (offset > marginRight) {
                offset -= marginRight;
                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, offset);
            }
            else {
                offset = 0;
            }
            const outerRight = rightA + offset;
            if (marginRight > 0) {
                offset += marginRight;
            }
            if (offset > 0) {
                if (node.hasPX('width', false) || !node.blockStatic && !node.hasPX('width')) {
                    container.css(container.hasPX('width') ? 'width' : 'minWidth', formatPX(node.actualWidth + offset), true);
                }
            }
            for (const item of outside) {
                if (item.right < 0) {
                    item.css('right', formatPX(outerRight - item.linear.right), true);
                }
            }
        }
        container.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', <NegativeXData> { offsetLeft: node.marginLeft + node.paddingLeft, firstChild, nextSibling: node });
        this.subscribers.add(container);
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    container.containerType,
                    NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }

    public postBaseLayout(node: T) {
        const mainData: NegativeXData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
        if (mainData) {
            const options = { excluding: node, attr: 'outerWrapper' };
            let firstChild = mainData.firstChild;
            if (firstChild) {
                firstChild = (firstChild.ascend(options).pop() || firstChild) as T;
                firstChild.anchorParent(STRING_ANDROID.HORIZONTAL, 0);
                firstChild.anchorParent(STRING_ANDROID.VERTICAL, 0);
                firstChild.modifyBox(BOX_STANDARD.MARGIN_LEFT, mainData.offsetLeft);
                View.setConstraintDimension(firstChild);
                firstChild.positioned = true;
            }
            const nextSibling = (mainData.nextSibling.ascend(options).pop() || mainData.nextSibling) as T;
            nextSibling.anchorParent(STRING_ANDROID.HORIZONTAL, 0);
            nextSibling.anchorParent(STRING_ANDROID.VERTICAL, 0);
            View.setConstraintDimension(nextSibling);
            nextSibling.positioned = true;
        }
    }
}