import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import type View from '../../view';

import LayoutUI = squared.base.LayoutUI;

interface NegativeXData {
    children: View[];
    offsetLeft: number;
    firstChild?: View;
}

const { safeFloat } = squared.lib.util;

export default class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.isEmpty() && node.cssValue('overflowX') !== 'hidden' && !node.rootElement;
    }

    public condition(node: T) {
        const children = node.children.filter((item: T) => {
            return item.pageFlow
                ? item.marginLeft < 0 && item === node.firstStaticChild && Math.abs(item.marginLeft) <= node.marginLeft + node.paddingLeft && item.inlineFlow && !item.centerAligned && !item.rightAligned && !node.floatContainer
                : item.leftTopAxis && (item.left < 0 || !item.hasUnit('left') && item.right < 0);
        });
        if (children.length) {
            this.data.set(node, { children, offsetLeft: node.marginLeft + node.paddingLeft } as NegativeXData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const mainData = this.data.get(node) as NegativeXData;
        const children = mainData.children as T[];
        const container = this.controller.createNodeWrapper(node, parent, { children, containerType: CONTAINER_NODE.CONSTRAINT, alignmentType: NODE_ALIGNMENT.VERTICAL });
        let left = NaN,
            right = NaN;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            const linear = item.linear;
            if (item.pageFlow) {
                if (isNaN(left) || linear.left < left) {
                    left = linear.left;
                }
                mainData.firstChild = item;
            }
            else if (item.hasUnit('left')) {
                if (item.left < 0 && (isNaN(left) || linear.left < left)) {
                    left = linear.left;
                }
            }
            else if (item.right < 0 && (isNaN(right) || linear.right > right)) {
                right = linear.right;
            }
        }
        if (!node.pageFlow) {
            if (!isNaN(left) && !node.has('left')) {
                const offset = node.linear.left - left;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.MARGIN_LEFT, offset);
                }
            }
            if (!isNaN(right) && !node.has('right')) {
                const offset = right - node.linear.right;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, offset);
                }
            }
        }
        else if (node.hasUnit('width', { percent: false })) {
            container.setLayoutWidth('wrap_content');
        }
        else if (node.hasUnit('width')) {
            container.css('width', node.cssValue('width'), true);
            node.setLayoutWidth('0px');
        }
        node.resetBox(BOX_STANDARD.MARGIN_TOP | BOX_STANDARD.MARGIN_BOTTOM, container);
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    container.containerType,
                    NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.SINGLE
                )
            ),
            subscribe: true
        };
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as NegativeXData;
        if (mainData) {
            let firstChild = mainData.firstChild;
            if (firstChild) {
                firstChild = (firstChild.ascend({ excluding: node, attr: 'outerWrapper' }).pop() || firstChild) as T;
                firstChild.anchor('left', 'parent');
                firstChild.anchorStyle('horizontal', 0);
                firstChild.anchorParent('vertical', 0);
                firstChild.modifyBox(BOX_STANDARD.MARGIN_LEFT, mainData.offsetLeft);
                firstChild.setConstraintDimension();
                firstChild.positioned = true;
            }
            for (const item of mainData.children) {
                if (item === firstChild) {
                    continue;
                }
                if (item.hasUnit('left')) {
                    item.translateX(item.left);
                    item.alignSibling('left', node.documentId);
                    item.constraint.horizontal = true;
                }
                else if (item.hasUnit('right')) {
                    item.translateX(-item.right);
                    item.alignSibling('right', node.documentId);
                    item.constraint.horizontal = true;
                }
            }
            node.anchorParent('horizontal', 0);
            node.anchorParent('vertical', 0);
            node.setConstraintDimension();
            node.positioned = true;
        }
    }

    public beforeFinalize() {
        for (const node of this.subscribers) {
            const mainData = this.data.get(node) as NegativeXData;
            if (mainData) {
                const translateX = node.android('translationX');
                const translateY = node.android('translationY');
                if (translateX || translateY) {
                    const x = safeFloat(translateX);
                    const y = safeFloat(translateY);
                    for (const item of mainData.children) {
                        if (!isNaN(x)) {
                            item.translateX(x);
                        }
                        if (!isNaN(y)) {
                            item.translateY(y);
                        }
                    }
                }
            }
        }
    }
}