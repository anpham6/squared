import Controller from '../../controller';

import { CONTAINER_ANDROID, EXT_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

type View = android.base.View;

type NegativeXData = {
    offsetLeft: number;
    firstChild: View;
    adjacentChild: View;
};

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

function outsideX(node: View, parent: View) {
    if (node.pageFlow) {
        return node === parent.firstChild && node.inlineFlow && !node.centerAligned && !node.rightAligned && node.marginLeft < 0 && Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft && !parent.some(item => item.multiline);
    }
    else {
        return node.absoluteParent === parent && (node.left < 0 || !node.has($const.CSS.LEFT) && node.right < 0);
    }
}

export default class NegativeX<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return this.application.userSettings.supportNegativeLeftTop && !node.documentRoot && node.css('overflowX') !== 'hidden' && node.some((item: T) => outsideX(item, node));
    }

    public processNode(node: T, parent: T) {
        const outside = node.filter((item: T) => outsideX(item, node)) as T[];
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, outside, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
        if (node.marginTop > 0) {
            container.modifyBox($e.BOX_STANDARD.MARGIN_TOP, node.marginTop);
            node.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
        }
        if (node.marginBottom > 0) {
            container.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, node.marginBottom);
            node.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM);
        }
        let left = NaN;
        let right = NaN;
        let firstChild: T | undefined;
        for (const item of outside) {
            if (item.pageFlow) {
                if (isNaN(left) || item.linear.left < left) {
                    left = item.linear.left;
                }
                firstChild = item;
            }
            else {
                if (item.has($const.CSS.LEFT)) {
                    if (item.left < 0 && (isNaN(left) || item.linear.left < left)) {
                        left = item.linear.left;
                    }
                }
                else if (item.right < 0 && (isNaN(right) || item.linear.right > right)) {
                    right = item.linear.right;
                }
            }
        }
        container.inherit(node, 'styleMap');
        if (!isNaN(left)) {
            let offset = node.linear.left - left;
            if (offset > 0) {
                node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, offset);
                for (const item of outside) {
                    if (!item.pageFlow && item.left < 0) {
                        item.css($const.CSS.LEFT, $css.formatPX(item.left + offset), true);
                    }
                }
            }
            else {
                for (const item of outside) {
                    if (!item.pageFlow && item.left < 0) {
                        item.css($const.CSS.LEFT, $css.formatPX(node.marginLeft + item.left), true);
                    }
                }
                offset = Math.abs(offset);
            }
            if (node.has($const.CSS.WIDTH, $e.CSS_STANDARD.LENGTH)) {
                container.cssPX($const.CSS.WIDTH, (node.marginLeft > 0 ? node.marginLeft : 0) + offset, false, true);
            }
            else if (node.has($const.CSS.WIDTH)) {
                container.css($const.CSS.WIDTH, $const.CSS.AUTO, true);
            }
        }
        if (!isNaN(right)) {
            let offset = right - node.linear.right;
            if (offset > node.marginRight) {
                offset -= node.marginRight;
                node.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, offset);
            }
            else {
                offset = 0;
            }
            const outerRight = node.linear.right + offset;
            if (node.marginRight > 0) {
                offset += node.marginRight;
            }
            if (offset > 0) {
                if (node.has($const.CSS.WIDTH, $e.CSS_STANDARD.LENGTH) || !node.blockStatic && !node.has($const.CSS.WIDTH)) {
                    container.css(container.has($const.CSS.WIDTH) ? $const.CSS.WIDTH : 'minWidth', $css.formatPX(node.actualWidth + offset), true);
                }
            }
            for (const item of outside) {
                if (item.right < 0) {
                    item.css($const.CSS.RIGHT, $css.formatPX(outerRight - item.linear.right), true);
                }
            }
        }
        if (firstChild) {
            this.subscribers.add(container);
            container.data(EXT_ANDROID.DELEGATE_NEGATIVEX, $c.STRING_BASE.EXT_DATA, <NegativeXData> { offsetLeft: node.marginLeft + node.paddingLeft, firstChild, adjacentChild: node });
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $Layout(
                    parent,
                    container,
                    container.containerType,
                    $e.NODE_ALIGNMENT.HORIZONTAL | $e.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }

    public postBaseLayout(node: T) {
        const mainData: NegativeXData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const firstChild = mainData.firstChild;
            const adjacentChild = mainData.adjacentChild;
            firstChild.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT);
            firstChild.anchor($c.STRING_BASE.RIGHT_LEFT, adjacentChild.documentId);
            firstChild.anchorStyle(STRING_ANDROID.HORIZONTAL);
            firstChild.anchorParent(STRING_ANDROID.VERTICAL);
            firstChild.anchorStyle(STRING_ANDROID.VERTICAL);
            firstChild.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, mainData.offsetLeft);
            adjacentChild.anchor($c.STRING_BASE.LEFT_RIGHT, firstChild.documentId);
            adjacentChild.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT);
            adjacentChild.anchorParent(STRING_ANDROID.VERTICAL);
            adjacentChild.anchorStyle(STRING_ANDROID.VERTICAL);
            Controller.setConstraintDimension(firstChild as any);
            Controller.setConstraintDimension(adjacentChild as any);
            firstChild.positioned = true;
            adjacentChild.positioned = true;
        }
    }
}