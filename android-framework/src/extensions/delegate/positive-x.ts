import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

interface PositiveXData {
    children: View[];
    right: boolean;
    bottom: boolean;
}
const checkMarginLeft = (parent: View, item: View) => item.marginLeft < 0 && (parent.documentRoot || item.linear.left < Math.floor(parent.box.left));
const checkMarginRight = (parent: View, item: View) => item.marginRight < 0 && (parent.documentRoot || item.linear.right > Math.ceil(parent.box.right));
const checkMarginTop = (parent: View, item: View) => item.marginTop < 0 && (parent.documentRoot || item.linear.top < Math.floor(parent.box.top));
const checkMarginBottom = (parent: View, item: View) => item.marginBottom < 0 && (parent.documentRoot || item.linear.bottom > Math.ceil(parent.box.bottom));

function setFixedNodes(node: View) {
    const documentBody = node.documentBody;
    const documentRoot = node.originalRoot;
    const expandBody = documentBody && node.positionStatic;
    const children = new Set<View>();
    const paddingTop = node.paddingTop + (documentBody ? node.marginTop : 0);
    const paddingRight = node.paddingRight + (documentBody ? node.marginRight : 0);
    const paddingBottom = node.paddingBottom + (documentBody ? node.marginBottom : 0);
    const paddingLeft = node.paddingLeft + (documentBody ? node.marginLeft : 0);
    let right = false;
    let bottom = false;
    node.each((item: View) => {
        if (item.pageFlow) {
            return;
        }
        const fixedPosition = item.autoPosition && item.css('position') === 'fixed';
        if (item.hasPX('left') || fixedPosition) {
            if (documentBody && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                children.add(item);
                right = true;
            }
            else {
                const value = item.left;
                if ((value >= 0 || documentRoot) && value < paddingLeft) {
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
                if ((value >= 0 || documentRoot) && value < paddingRight) {
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
                if ((value >= 0 || documentRoot) && value < paddingTop) {
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
                if ((value >= 0 || documentRoot) && value < paddingBottom) {
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

export default class PositiveX<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.naturalElement && (node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.documentBody);
    }

    public condition(node: T) {
        return setFixedNodes(node);
    }

    public processNode(node: T, parent: T) {
        const mainData: PositiveXData = node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData');
        if (mainData) {
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, mainData.children as T[], { resetMargin: !node.documentRoot && !node.pageFlow || parent.layoutGrid, inheritDataset: true });
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
            for (const item of mainData.children) {
                const nested = item.absoluteParent !== item.documentParent || item.css('position') === 'fixed';
                const documentId = node.documentId;
                const wrapper = item.outerMostWrapper as T;
                if (item.hasPX('left')) {
                    if (!nested) {
                        item.translateX(item.left);
                        item.alignSibling('left', documentId);
                        item.constraint.horizontal = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                else if (item.hasPX('right')) {
                    if (!nested) {
                        item.translateX(-item.right);
                        item.alignSibling('right', documentId);
                        item.constraint.horizontal = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
                else if (item.marginLeft < 0 && !nested) {
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
                else if (item.hasPX('bottom')) {
                    if (!nested) {
                        item.translateY(-item.bottom);
                        item.alignSibling('bottom', documentId);
                        item.constraint.vertical = true;
                    }
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                else if (item.marginTop < 0 && !nested) {
                    wrapper.alignSibling('top', documentId);
                    wrapper.translateY(item.linear.top - node.bounds.top);
                    wrapper.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                    wrapper.constraint.vertical = true;
                    item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                }
            }
        }
    }
}