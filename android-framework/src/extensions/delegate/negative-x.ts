import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

type NegativeXData = {
    outside: View[];
    container: View;
};

const outsideX = (node: View) => node.leftTopAxis && (node.left < 0 || !node.hasPX('left') && node.right < 0);

export default class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.pageFlow && !node.documentRoot && node.css('overflowX') !== 'hidden';
    }

    public condition(node: T) {
        return node.some((item: T) => outsideX(item));
    }

    public processNode(node: T, parent: T) {
        const outside = node.filter((item: T) => outsideX(item)) as T[];
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, outside, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
        node.resetBox(BOX_STANDARD.MARGIN_TOP | BOX_STANDARD.MARGIN_BOTTOM, container);
        let left = NaN;
        let right = NaN;
        for (const item of outside) {
            const linear = item.linear;
            if (item.hasPX('left')) {
                if (item.left < 0 && (isNaN(left) || linear.left < left)) {
                    left = linear.left;
                }
            }
            else if (item.right < 0 && (isNaN(right) || linear.right > right)) {
                right = linear.right;
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
            offset += Math.max(node.marginLeft, 0);
            if (node.hasPX('width', false)) {
                container.cssPX('width', offset, true);
            }
            else {
                container.css('minWidth', formatPX(node.bounds.width + offset), true);
            }
        }
        if (!isNaN(right)) {
            const marginRight = node.marginRight;
            const rightA = node.linear.right;
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
                if (container.hasPX('width', false)) {
                    container.cssPX('width', offset, true);
                }
                else {
                    container.css('minWidth', formatPX(node.bounds.width + offset), true);
                }
            }
            for (const item of outside) {
                if (item.right < 0) {
                    item.css('right', formatPX(outerRight - item.linear.right), true);
                }
            }
        }
        node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', <NegativeXData> { outside, container });
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
            ),
            subscribe: true
        };
    }

    public postBaseLayout(node: T) {
        const mainData: NegativeXData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
        if (mainData) {
            const nextSibling = (node.ascend({ excluding: mainData.container, attr: 'outerWrapper' }).pop() || node) as T;
            nextSibling.anchorParent('horizontal', 0);
            nextSibling.anchorParent('vertical', 0);
            View.setConstraintDimension(nextSibling);
            nextSibling.positioned = true;
        }
    }

    public beforeCascade() {
        for (const node of this.subscribers) {
            const translateX = node.android('translationX');
            const translateY = node.android('translationY');
            if (translateX !== '' || translateY !== '') {
                const mainData: NegativeXData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
                if (mainData) {
                    const x = parseInt(translateX);
                    const y = parseInt(translateY);
                    for (const child of mainData.outside) {
                        if (!isNaN(x)) {
                            child.translateX(x);
                        }
                        if (!isNaN(y)) {
                            child.translateY(y);
                        }
                    }
                }
            }
        }
    }
}