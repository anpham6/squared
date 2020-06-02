import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

interface NegativeXData {
    container: View;
    children: View[];
    offsetLeft: number;
    firstChild?: View;
}

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
        return node.length > 0 && !node.rootElement && node.css('overflowX') !== 'hidden';
    }

    public condition(node: T) {
        return node.some((item: T) => outsideX(item, node));
    }

    public processNode(node: T, parent: T) {
        const children = node.children.filter((item: T) => outsideX(item, node)) as T[];
        const container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, { children, containerType: CONTAINER_NODE.CONSTRAINT });
        node.resetBox(BOX_STANDARD.MARGIN_TOP | BOX_STANDARD.MARGIN_BOTTOM, container);
        let left = NaN, right = NaN;
        let firstChild: Undef<T>;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
            const linear = item.linear;
            if (item.pageFlow) {
                if (isNaN(left) || linear.left < left) {
                    left = linear.left;
                }
                firstChild = item;
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
        node.data(this.name, 'mainData', {
            container,
            children,
            offsetLeft: node.marginLeft + node.paddingLeft,
            firstChild
        } as NegativeXData);
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
        const mainData: NegativeXData = node.data(this.name, 'mainData');
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
            const children = mainData.children;
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++];
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

    public beforeCascade() {
        for (const node of this.subscribers) {
            const mainData: NegativeXData = node.data(this.name, 'mainData');
            if (mainData) {
                const translateX = node.android('translationX'), translateY = node.android('translationY');
                if (translateX !== '' || translateY !== '') {
                    const x = parseInt(translateX);
                    const y = parseInt(translateY);
                    const children = mainData.children;
                    const length = children.length;
                    let i = 0;
                    while (i < length) {
                        const item = children[i++];
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