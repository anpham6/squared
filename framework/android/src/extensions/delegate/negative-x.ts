import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

interface NegativeXData {
    children: View[];
    offsetLeft: number;
    firstChild?: View;
}

export default class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0 && node.css('overflowX') !== 'hidden' && !node.rootElement;
    }

    public condition(node: T) {
        const children = node.children.filter((item: T) => {
            if (item.pageFlow) {
                return item.marginLeft < 0 && item === node.firstStaticChild && Math.abs(item.marginLeft) <= node.marginLeft + node.paddingLeft && item.inlineFlow && !item.centerAligned && !item.rightAligned && !node.floatContainer;
            }
            return item.leftTopAxis && (item.left < 0 || !item.hasPX('left') && item.right < 0);
        });
        if (children.length > 0) {
            this.data.set(node, { children, offsetLeft: node.marginLeft + node.paddingLeft });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData = this.data.get(node) as NegativeXData;
        const children = mainData.children as T[];
        const container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, { children, containerType: CONTAINER_NODE.CONSTRAINT, alignmentType: NODE_ALIGNMENT.VERTICAL });
        let left = NaN,
            right = NaN;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
            const linear = item.linear;
            if (item.pageFlow) {
                if (isNaN(left) || linear.left < left) {
                    left = linear.left;
                }
                mainData.firstChild = item;
            }
            else if (item.hasPX('left')) {
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
        else if (node.hasPX('width', { percent: false })) {
            container.setLayoutWidth('wrap_content');
        }
        else if (node.hasPX('width')) {
            container.css('width', node.css('width'), true);
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
                View.setConstraintDimension(firstChild);
                firstChild.positioned = true;
            }
            for (const item of mainData.children) {
                if (item === firstChild) {
                    continue;
                }
                if (item.hasPX('left')) {
                    item.translateX(item.left);
                    item.alignSibling('left', node.documentId);
                    item.constraint.horizontal = true;
                }
                else if (item.hasPX('right')) {
                    item.translateX(-item.right);
                    item.alignSibling('right', node.documentId);
                    item.constraint.horizontal = true;
                }
            }
            node.anchorParent('horizontal', 0);
            node.anchorParent('vertical', 0);
            View.setConstraintDimension(node);
            node.positioned = true;
        }
    }

    public beforeDocumentWrite() {
        for (const node of this.subscribers) {
            const mainData = this.data.get(node) as NegativeXData;
            if (mainData) {
                const translateX = node.android('translationX');
                const translateY = node.android('translationY');
                if (translateX !== '' || translateY !== '') {
                    const x = parseInt(translateX);
                    const y = parseInt(translateY);
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