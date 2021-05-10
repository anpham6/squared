import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import type View from '../../view';

import LayoutUI = squared.base.LayoutUI;

interface PositiveXData {
    children: View[];
    container?: View;
    right?: boolean;
    bottom?: boolean;
}

const checkMarginLeft = (node: View, item: View) => item.marginLeft < 0 && (node.rootElement || item.linear.left < Math.floor(node.box.left));
const checkMarginRight = (node: View, item: View) => item.marginRight < 0 && (node.rootElement || item.linear.right > Math.ceil(node.box.right));
const checkMarginTop = (node: View, item: View) => item.marginTop < 0 && (node.rootElement || item.linear.top < Math.floor(node.box.top));
const checkMarginBottom = (node: View, item: View) => item.marginBottom < 0 && (node.rootElement || item.linear.bottom > Math.ceil(node.box.bottom));

export default class PositiveX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.isEmpty();
    }

    public condition(node: T) {
        const { documentBody, lastStaticChild } = node;
        let contentBox = node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.marginTop !== 0 || node.marginRight !== 0 || node.marginBottom !== 0 || node.marginLeft !== 0,
            aboveInvalid: Undef<boolean>,
            belowInvalid: Undef<boolean>;
        if (node.firstStaticChild?.lineBreak) {
            contentBox = true;
            aboveInvalid = true;
        }
        if (lastStaticChild && lastStaticChild.lineBreak && lastStaticChild.previousSibling?.blockStatic) {
            contentBox = true;
            belowInvalid = true;
        }
        if (!documentBody && !contentBox) {
            return false;
        }
        const rootElement = node.rootElement;
        const expandBody = documentBody && node.positionStatic;
        const paddingTop = node.paddingTop + (documentBody ? node.marginTop : 0);
        const paddingRight = node.paddingRight + (documentBody ? node.marginRight : 0);
        const paddingBottom = node.paddingBottom + (documentBody ? node.marginBottom : 0);
        const paddingLeft = node.paddingLeft + (documentBody ? node.marginLeft : 0);
        const children = new Set<View>();
        let right: Undef<boolean>,
            bottom: Undef<boolean>;
        node.each((item: View) => {
            const fixed = rootElement && item.positionFixed;
            if (item.pageFlow || !contentBox && !fixed) {
                return;
            }
            if (item.hasUnit('left') || fixed && item.autoPosition) {
                if (documentBody && (item.cssInitial('width') === '100%' || item.cssInitial('minWidth') === '100%')) {
                    if (paddingLeft || paddingRight) {
                        children.add(item);
                    }
                    right = true;
                }
                else {
                    const value = item.left;
                    if ((value >= 0 || rootElement) && value < paddingLeft ||
                        value < 0 && Math.ceil(item.linear.left) >= Math.ceil(node.linear.left) ||
                        !item.hasUnit('right') && checkMarginLeft(node, item))
                    {
                        children.add(item);
                    }
                }
            }
            else if (item.hasUnit('right')) {
                if (expandBody) {
                    children.add(item);
                    right = true;
                }
                else {
                    const value = item.right;
                    if ((value >= 0 || rootElement) && value < paddingRight ||
                        (value < 0 && Math.floor(item.linear.right) <= Math.ceil(node.linear.right)) ||
                        checkMarginRight(node, item))
                    {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginLeft(node, item)) {
                children.add(item);
            }
            if (item.hasUnit('top') || fixed && item.autoPosition) {
                if (documentBody && (item.cssInitial('height') === '100%' || item.cssInitial('minHeight') === '100%')) {
                    if (paddingTop || paddingBottom) {
                        children.add(item);
                    }
                    bottom = true;
                }
                else {
                    const value = item.top;
                    if ((value >= 0 || rootElement) && (value < paddingTop || aboveInvalid) ||
                        (value < 0 && Math.ceil(item.linear.top) >= Math.ceil(node.linear.top)) ||
                        !item.hasUnit('bottom') && checkMarginTop(node, item))
                    {
                        children.add(item);
                    }
                }
            }
            else if (item.hasUnit('bottom')) {
                if (expandBody) {
                    children.add(item);
                    bottom = true;
                }
                else {
                    const value = item.bottom;
                    if ((value >= 0 || rootElement) && (value < paddingBottom || belowInvalid) ||
                        (value < 0 && Math.floor(item.linear.bottom) <= Math.ceil(node.linear.bottom)) ||
                        checkMarginBottom(node, item))
                    {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginTop(node, item)) {
                children.add(item);
            }
        });
        if (children.size || right || bottom) {
            this.data.set(node, { children: Array.from(children), right, bottom } as PositiveXData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const mainData = this.data.get(node) as PositiveXData;
        const children = mainData.children as T[];
        let container: Undef<T>;
        if (children.length) {
            container = this.controller.createNodeWrapper(node, parent, {
                alignmentType: NODE_ALIGNMENT.VERTICAL,
                children,
                flags: CREATE_NODE.CASCADE | (node.every((item: T) => children.includes(item) || !item.visible) || !node.pageFlow && !node.rootElement || parent.layoutGrid ? CREATE_NODE.RESET_MARGIN : 0) | CREATE_NODE.INHERIT_DATASET
            });
        }
        if (node.documentBody) {
            if (mainData.right) {
                (container || node).setLayoutWidth('match_parent');
            }
            if (mainData.bottom) {
                (container || node).setLayoutHeight('match_parent');
            }
        }
        else if (!node.pageFlow) {
            if (!node.hasUnit('width') && node.hasUnit('left') && node.hasUnit('right')) {
                node.setLayoutWidth('match_parent');
            }
            if (!node.hasUnit('height') && node.hasUnit('top') && node.hasUnit('bottom')) {
                node.setLayoutHeight('match_parent');
            }
        }
        else if (container && node.blockStatic && parent.blockStatic && !parent.layoutElement && !parent.layoutGrid) {
            container.setLayoutWidth('match_parent');
        }
        if (container) {
            mainData.container = container;
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.CONSTRAINT,
                        NODE_ALIGNMENT.ABSOLUTE
                    )
                ),
                subscribe: true
            };
        }
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<PositiveXData>;
        if (mainData) {
            const documentId = node.documentId;
            for (const item of mainData.children) {
                const nested = !item.pageFlow && (item.absoluteParent !== item.documentParent || item.positionFixed || node.documentBody);
                const wrapper = item.outerMostWrapper as T;
                if (item.hasUnit('left')) {
                    if (!nested) {
                        const left = item.left;
                        if (left === 0 && !node.rightAligned && !node.centerAligned) {
                            item.anchor('left', 'parent');
                        }
                        else {
                            item.translateX(item.left);
                            item.alignSibling('left', documentId);
                        }
                        item.constraint.horizontal = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                if (item.hasUnit('right')) {
                    if (!nested) {
                        const right = item.right;
                        if (right === 0 && !node.centerAligned) {
                            item.anchor('right', 'parent');
                        }
                        else {
                            item.translateX(-right);
                            if (node.rootElement) {
                                item.anchor('right', 'parent');
                            }
                            else {
                                item.alignSibling('right', documentId);
                            }
                        }
                        item.constraint.horizontal = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
                else if (item.marginLeft < 0 && checkMarginLeft(node, item)) {
                    wrapper.alignSibling('left', documentId);
                    wrapper.translateX(item.linear.left - node.bounds.left);
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                    wrapper.constraint.horizontal = true;
                    item.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                }
                if (item.hasUnit('top')) {
                    if (!nested) {
                        const top = item.top;
                        if (top === 0 && !node.bottomAligned) {
                            item.anchor('top', 'parent');
                        }
                        else {
                            item.translateY(item.top);
                            item.alignSibling('top', documentId);
                        }
                        item.constraint.vertical = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                if (item.hasUnit('bottom')) {
                    if (!nested) {
                        const bottom = item.bottom;
                        if (bottom === 0) {
                            item.anchor('bottom', 'parent');
                        }
                        else {
                            item.translateY(-bottom);
                            if (node.rootElement) {
                                item.anchor('bottom', 'parent');
                            }
                            else {
                                item.alignSibling('bottom', documentId);
                            }
                        }
                        item.constraint.vertical = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                else if (item.marginTop < 0 && checkMarginTop(node, item)) {
                    wrapper.alignSibling('top', documentId);
                    wrapper.translateY(item.linear.top - node.bounds.top);
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                    wrapper.constraint.vertical = true;
                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                }
            }
        }
    }

    public postConstraints(node: T) {
        if (!node.hasUnit('width')) {
            node.setLayoutWidth(node.getMatchConstraint(), false);
        }
    }

    public postOptimize(node: T) {
        const container = (this.data.get(node) as Undef<PositiveXData>)?.container;
        if (container) {
            const { horizontal, vertical } = container.constraint;
            if (!horizontal) {
                if (container.blockWidth || container.flexibleWidth) {
                    container.anchorParent('horizontal', 0);
                }
                else {
                    container.anchor('left', 'parent');
                }
            }
            if (!vertical) {
                if (container.blockHeight || container.flexibleHeight) {
                    container.anchorParent('vertical', 0);
                }
                else {
                    container.anchor('top', 'parent');
                }
            }
        }
    }
}