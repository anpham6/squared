import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

type NegativeXData = {
    container: View;
    children: View[];
    offsetLeft: number;
    firstChild?: View;
};

function outsideX(node: View, parent: View) {
    if (node.pageFlow) {
        return node === parent.firstStaticChild && node.inlineFlow && !node.centerAligned && !node.rightAligned && node.marginLeft < 0 && Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft && !parent.some(item => item.multiline);
    }
    else {
        return node.leftTopAxis && (node.left < 0 || !node.hasPX('left') && node.right < 0);
    }
}

export default class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.originalRoot && node.css('overflowX') !== 'hidden';
    }

    public condition(node: T) {
        return node.some((item: T) => outsideX(item, node));
    }

    public processNode(node: T, parent: T) {
        const children = node.filter((item: T) => outsideX(item, node)) as T[];
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, children, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
        node.resetBox(BOX_STANDARD.MARGIN_TOP | BOX_STANDARD.MARGIN_BOTTOM, container);
        let left = NaN;
        let right = NaN;
        let firstChild: Undef<T>;
        for (const item of children) {
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
        if (!isNaN(left)) {
            let offset = node.linear.left - left;
            if (offset > 0) {
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                for (const item of children) {
                    if (!item.pageFlow && item.left < 0) {
                        item.setCacheValue('left', item.left + offset);
                    }
                }
            }
            else {
                for (const item of children) {
                    if (!item.pageFlow && item.left < 0) {
                        item.setCacheValue('left', node.marginLeft + item.left);
                    }
                }
                offset = Math.abs(offset);
            }
            offset += Math.max(node.marginLeft, 0);
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
            if (offset > 0 && container.hasPX('width', false)) {
                container.cssPX('width', offset, true);
            }
            for (const item of children) {
                if (item.right < 0) {
                    item.setCacheValue('right', outerRight - item.linear.right);
                }
            }
        }
        node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', <NegativeXData> {
            container,
            children,
            offsetLeft: node.marginLeft + node.paddingLeft,
            firstChild
        });
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
            let firstChild = mainData.firstChild;
            if (firstChild) {
                firstChild = (firstChild.ascend({ excluding: node, attr: 'outerWrapper' }).pop() || firstChild) as T;
                firstChild.anchor('left', 'parent');
                firstChild.anchorStyle('horizontal', 0);
                firstChild.anchorParent('vertical', 0);
                firstChild.modifyBox(BOX_STANDARD.MARGIN_LEFT, mainData.offsetLeft);
                View.setConstraintDimension(firstChild);
                firstChild.positioned = true;
            }
            node.anchorParent('horizontal', 0);
            node.anchorParent('vertical', 0);
            View.setConstraintDimension(node);
            node.positioned = true;
        }
    }

    public beforeCascade() {
        for (const node of this.subscribers) {
            const mainData: NegativeXData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
            if (mainData) {
                const translateX = node.android('translationX');
                const translateY = node.android('translationY');
                if (translateX !== '' || translateY !== '') {
                    const x = parseInt(translateX);
                    const y = parseInt(translateY);
                    for (const child of mainData.children) {
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