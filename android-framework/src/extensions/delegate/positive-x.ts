import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

interface PositiveXData {
    children: View[];
    right: boolean;
    bottom: boolean;
}

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

const checkMarginLeft = (node: View, item: View) => item.marginLeft < 0 && (node.originalRoot || item.linear.left < Math.floor(node.box.left));
const checkMarginRight = (node: View, item: View) => item.marginRight < 0 && (node.originalRoot || item.linear.right > Math.ceil(node.box.right));
const checkMarginTop = (node: View, item: View) => item.marginTop < 0 && (node.originalRoot || item.linear.top < Math.floor(node.box.top));
const checkMarginBottom = (node: View, item: View) => item.marginBottom < 0 && (node.originalRoot || item.linear.bottom > Math.ceil(node.box.bottom));

export default class PositiveX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0;
    }

    public condition(node: T) {
        const { documentBody, lastStaticChild } = node;
        let contentBox = node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.marginTop !== 0 || node.marginRight !== 0 || node.marginBottom !== 0 || node.marginLeft !== 0;
        let aboveInvalid = false;
        let belowInvalid = false;
        if (node.firstStaticChild?.lineBreak) {
            aboveInvalid = true;
            contentBox = true;
        }
        if (lastStaticChild?.lineBreak && lastStaticChild.previousSibling?.blockStatic) {
            contentBox = true;
            belowInvalid = true;
        }
        if (!documentBody && !contentBox) {
            return false;
        }
        const originalRoot = node.originalRoot;
        const expandBody = documentBody && node.positionStatic;
        const children = new Set<View>();
        const paddingTop = node.paddingTop + (documentBody ? node.marginTop : 0);
        const paddingRight = node.paddingRight + (documentBody ? node.marginRight : 0);
        const paddingBottom = node.paddingBottom + (documentBody ? node.marginBottom : 0);
        const paddingLeft = node.paddingLeft + (documentBody ? node.marginLeft : 0);
        let right = false, bottom = false;
        node.each((item: View) => {
            const fixed = originalRoot && item.css('position') === 'fixed';
            if (item.pageFlow || !contentBox && !fixed) {
                return;
            }
            const fixedPosition = fixed && item.autoPosition;
            if (item.hasPX('left') || fixedPosition) {
                if (documentBody && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                    children.add(item);
                    right = true;
                }
                else {
                    const value = item.left;
                    if ((value >= 0 || originalRoot) && value < paddingLeft) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginLeft > 0) {
                        children.add(item);
                    }
                    else if (!item.hasPX('right') && checkMarginLeft(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (item.hasPX('right')) {
                if (expandBody) {
                    children.add(item);
                    right = true;
                }
                else {
                    const value = item.right;
                    if ((value >= 0 || originalRoot) && value < paddingRight) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginRight > 0) {
                        children.add(item);
                    }
                    else if (checkMarginRight(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginLeft(node, item)) {
                children.add(item);
            }
            if (item.hasPX('top') || fixedPosition) {
                if (documentBody && (item.css('height') === '100%' || item.css('minHeight') === '100%')) {
                    children.add(item);
                    bottom = true;
                }
                else {
                    const value = item.top;
                    if ((value >= 0 || originalRoot) && (value < paddingTop || aboveInvalid)) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginTop > 0) {
                        children.add(item);
                    }
                    else if (!item.hasPX('bottom') && checkMarginTop(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (item.hasPX('bottom')) {
                if (expandBody) {
                    children.add(item);
                    bottom = true;
                }
                else {
                    const value = item.bottom;
                    if ((value >= 0 || originalRoot) && (value < paddingBottom || belowInvalid)) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginBottom > 0) {
                        children.add(item);
                    }
                    else if (checkMarginBottom(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginTop(node, item)) {
                children.add(item);
            }
        });
        if (children.size) {
            node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData', { children: Array.from(children), right, bottom });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: PositiveXData = node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData');
        if (mainData) {
            const container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, {
                children: mainData.children as T[],
                resetMargin: !node.originalRoot && !node.pageFlow || parent.layoutGrid,
                cascade: true,
                inheritDataset: true
            });
            if (node.documentBody) {
                if (mainData.right) {
                    container.setLayoutWidth('match_parent');
                }
                if (mainData.bottom) {
                    container.setLayoutHeight('match_parent');
                }
            }
            else if (!node.pageFlow) {
                if (!node.hasPX('width') && node.hasPX('left') && node.hasPX('right')) {
                    node.setLayoutWidth('match_parent');
                }
                if (!node.hasPX('height') && node.hasPX('top') && node.hasPX('bottom')) {
                    node.setLayoutHeight('match_parent');
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.CONSTRAINT,
                        NODE_ALIGNMENT.ABSOLUTE,
                        container.children as T[]
                    )
                ),
                subscribe: true
            };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        const mainData: PositiveXData = node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData');
        if (mainData) {
            const documentId = node.documentId;
            mainData.children.forEach(item => {
                const nested = !item.pageFlow && (item.absoluteParent !== item.documentParent || item.css('position') === 'fixed' || node.documentBody);
                const wrapper = item.outerMostWrapper as T;
                if (item.hasPX('left')) {
                    if (!nested) {
                        item.translateX(item.left);
                        item.alignSibling('left', documentId);
                        item.constraint.horizontal = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                if (item.hasPX('right')) {
                    if (!nested) {
                        item.translateX(-item.right);
                        if (node.originalRoot) {
                            item.anchor('right', 'parent');
                        }
                        else {
                            item.alignSibling('right', documentId);
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
                if (item.hasPX('top')) {
                    if (!nested) {
                        item.translateY(item.top);
                        item.alignSibling('top', documentId);
                        item.constraint.vertical = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                if (item.hasPX('bottom')) {
                    if (!nested) {
                        item.translateY(-item.bottom);
                        if (node.originalRoot) {
                            item.anchor('bottom', 'parent');
                        }
                        else {
                            item.alignSibling('bottom', documentId);
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
            });
        }
    }
}