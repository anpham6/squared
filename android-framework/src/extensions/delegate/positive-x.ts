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
const checkMarginLeft = (parent: View, item: View) => item.marginLeft < 0 && (parent.documentRoot || item.linear.left < Math.floor(parent.bounds.left));
const checkMarginRight = (parent: View, item: View) => item.marginRight < 0 && (parent.documentRoot || item.linear.right > Math.ceil(parent.bounds.right));
const checkMarginTop = (parent: View, item: View) => item.marginTop < 0 && (parent.documentRoot || item.linear.top < Math.floor(parent.bounds.top));
const checkMarginBottom = (parent: View, item: View) => item.marginBottom < 0 && (parent.documentRoot || item.linear.bottom > Math.ceil(parent.bounds.bottom));

function setFixedNodes(node: View) {
    const documentBody = node.documentBody;
    const originalRoot = node.originalRoot;
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
            if (originalRoot && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                children.add(item);
                right = true;
            }
            else {
                const value = item.left;
                if (value >= 0 && value < paddingLeft) {
                    children.add(item);
                }
                else if (!item.hasPX('right') && checkMarginLeft(node, item)) {
                    children.add(item);
                    item.modifyBox(BOX_STANDARD.MARGIN_LEFT, paddingLeft);
                }
            }
        }
        else if (item.hasPX('right')) {
            if (originalRoot) {
                children.add(item);
                right = true;
            }
            else {
                const value = item.right;
                if (value >= 0 && (value < paddingRight || documentBody && node.positionStatic && node.hasPX('width') && node.percentWidth < 1)) {
                    children.add(item);
                }
                else if (checkMarginRight(node, item)) {
                    children.add(item);
                    item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, paddingRight);
                }
            }
        }
        else if (checkMarginLeft(node, item)) {
            children.add(item);
            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, paddingLeft);
        }
        else if (checkMarginRight(node, item)) {
            children.add(item);
            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, paddingLeft);
        }
        if (item.hasPX('top') || item.autoPosition && item.css('position') === 'fixed') {
            if (originalRoot && (item.css('height') === '100%' || item.css('minHeight') === '100%')) {
                children.add(item);
                bottom = true;
            }
            else {
                const value = item.top;
                if (value >= 0 && value < paddingTop) {
                    children.add(item);
                }
                else if (!item.hasPX('bottom') && checkMarginTop(node, item)) {
                    children.add(item);
                    item.modifyBox(BOX_STANDARD.MARGIN_TOP, paddingTop);
                }
            }
        }
        else if (item.hasPX('bottom')) {
            if (originalRoot) {
                children.add(item);
                bottom = true;
            }
            else {
                const value = item.bottom;
                if (value >= 0 && (value < paddingBottom || documentBody && node.positionStatic && (node.hasPX('height', false) || node.percentHeight > 0 && node.percentHeight < 1))) {
                    children.add(item);
                }
                else if (checkMarginBottom(node, item)) {
                    children.add(item);
                    item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, paddingBottom);
                }
            }
        }
        else if (checkMarginTop(node, item)) {
            children.add(item);
            item.modifyBox(BOX_STANDARD.MARGIN_TOP, paddingTop);
        }
        else if (checkMarginBottom(node, item)) {
            children.add(item);
            item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, paddingBottom);
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
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, mainData.children as T[], { resetMargin: !node.documentRoot && !node.pageFlow || parent.layoutGrid });
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
                const fixed = item.css('position') === 'fixed' || item.absoluteParent !== item.actualParent;
                const constraint = item.constraint;
                const documentId = node.documentId;
                if (item.hasPX('left')) {
                    if (!fixed) {
                        item.translateX(item.left);
                        item.alignSibling('left', documentId);
                        constraint.horizontal = true;
                    }
                    item.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                if (item.hasPX('right')) {
                    if (!fixed) {
                        item.translateX(-item.right);
                        item.alignSibling('right', documentId);
                        constraint.horizontal = true;
                    }
                    item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
                else if (item.marginLeft < 0 && !fixed) {
                    const wrapper = item.outerMostWrapper as T;
                    wrapper.alignSibling('left', documentId);
                    wrapper.constraint.horizontal = true;
                }
                if (item.hasPX('top')) {
                    if (!fixed) {
                        item.translateY(item.top);
                        item.alignSibling('top', documentId);
                        constraint.vertical = true;
                    }
                    item.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                if (item.hasPX('bottom')) {
                    if (!fixed) {
                        item.translateY(-item.bottom);
                        item.alignSibling('bottom', documentId);
                        constraint.vertical = true;
                    }
                    item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                else if (item.marginTop < 0 && node.firstChild === item && !fixed) {
                    const wrapper = item.outerMostWrapper as T;
                    wrapper.alignSibling('top', documentId);
                    wrapper.constraint.vertical = true;
                }
            }
        }
    }
}