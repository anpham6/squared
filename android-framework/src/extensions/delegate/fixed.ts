import { MaxWidthHeightData } from './max-width-height';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_RESOURCE } = squared.base.lib.enumeration;

const checkMarginLeft = (parent: View, item: View) => item.marginLeft < 0 && (parent.documentRoot || item.linear.left < Math.floor(parent.bounds.left));
const checkMarginRight = (parent: View, item: View) => item.marginRight < 0 && (parent.documentRoot || item.linear.right > Math.ceil(parent.bounds.right));
const checkMarginTop = (parent: View, item: View) => item.marginTop < 0 && (parent.documentRoot || item.linear.top < Math.floor(parent.bounds.top));
const checkMarginBottom = (parent: View, item: View) => item.marginBottom < 0 && (parent.documentRoot || item.linear.bottom > Math.ceil(parent.bounds.bottom));

export interface FixedData {
    children: View[];
    right: boolean;
    bottom: boolean;
}

export default class Fixed<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.naturalElement && (node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.documentBody);
    }

    public condition(node: T) {
        const absolute = node.filter((item: T) => !item.pageFlow && item.leftTopAxis && item.left >= 0 && item.right >= 0) as T[];
        if (absolute.length) {
            const paddingTop = node.paddingTop + (node.documentBody ? node.marginTop : 0);
            const paddingRight = node.paddingRight + (node.documentBody ? node.marginRight : 0);
            const paddingBottom = node.paddingBottom + (node.documentBody ? node.marginBottom : 0);
            const paddingLeft = node.paddingLeft + (node.documentBody ? node.marginLeft : 0);
            const children = new Set<T>();
            let right = false;
            let bottom = false;
            for (const item of absolute) {
                const fixed = item.css('position') === 'fixed';
                if (item.hasPX('left')) {
                    const value = item.left;
                    if (value >= 0 && value < paddingLeft) {
                        children.add(item);
                    }
                    else if (!item.hasPX('right') && checkMarginLeft(node, item)) {
                        children.add(item);
                    }
                }
                else if (item.hasPX('right')) {
                    const value = item.right;
                    if (value >= 0 && (fixed || value < paddingRight || node.documentBody && node.hasPX('width') && node.positionStatic)) {
                        children.add(item);
                        right = true;
                    }
                    else if (checkMarginRight(node, item)) {
                        children.add(item);
                    }
                }
                else if (checkMarginLeft(node, item) || checkMarginRight(node, item)) {
                    children.add(item);
                }
                if (item.hasPX('top')) {
                    const value = item.top;
                    if (value >= 0 && value < paddingTop) {
                        children.add(item);
                    }
                    else if (!item.hasPX('bottom') && checkMarginTop(node, item)) {
                        children.add(item);
                    }
                }
                else if (item.hasPX('bottom')) {
                    const value = item.bottom;
                    if (value >= 0 && (fixed || value < paddingBottom || node.documentBody && node.hasPX('height') && node.positionStatic)) {
                        children.add(item);
                        bottom = true;
                    }
                    else if (checkMarginBottom(node, item)) {
                        children.add(item);
                    }
                }
                else if (checkMarginTop(node, item) || checkMarginBottom(node, item)) {
                    children.add(item);
                }
            }
            if (children.size) {
                node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData', <FixedData> { children: Array.from(children), right, bottom });
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: FixedData = node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData');
        if (mainData) {
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, mainData.children as T[], { resource: NODE_RESOURCE.ASSET, resetMargin: !node.documentRoot && !node.pageFlow || parent.layoutGrid });
            if (container.documentRoot) {
                const visibleStyle = node.visibleStyle;
                if (visibleStyle.backgroundColor || visibleStyle.backgroundImage) {
                    container.inherit(node, 'boxStyle');
                }
                else {
                    container.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
                }
            }
            if (node.documentBody) {
                if (mainData.right) {
                    container.setLayoutWidth('match_parent');
                    container.css('width', 'auto');
                    container.addAlign(NODE_ALIGNMENT.BLOCK);
                }
                if (mainData.bottom) {
                    container.setLayoutHeight('match_parent');
                    container.css('height', 'auto');
                }
            }
            if (!node.pageFlow) {
                if (!node.hasPX('width') && node.hasPX('left') && node.hasPX('right')) {
                    node.setLayoutWidth('match_parent');
                }
                if (!node.hasPX('height') && node.hasPX('top') && node.hasPX('bottom')) {
                    node.setLayoutHeight('match_parent');
                }
            }
            for (const item of mainData.children) {
                const autoMargin = item.autoMargin;
                let top = false;
                let left = false;
                if (item.hasPX('top')) {
                    item.modifyBox(BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                    top = true;
                }
                if (item.hasPX('bottom') && (!top || autoMargin.top || autoMargin.topBottom)) {
                    item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                if (item.hasPX('left')) {
                    item.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                    left = true;
                }
                if (item.hasPX('right') && (!left || autoMargin.left || autoMargin.leftRight)) {
                    item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
            }
            this.subscribers.add(container);
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
                )
            };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        if (node.innerWrapped) {
            const innerWrapped = node.innerMostWrapped as T;
            const maxData: MaxWidthHeightData = innerWrapped.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
            if (maxData?.container?.outerWrapper === node) {
                if (maxData.width) {
                    node.css('maxWidth', innerWrapped.css('maxWidth'));
                    node.setLayoutWidth('0px');
                    node.contentBoxWidth = innerWrapped.contentBoxWidth;
                    innerWrapped.setLayoutWidth('wrap_content', false);
                }
                if (maxData.height) {
                    node.css('maxHeight', innerWrapped.css('maxHeight'));
                    node.setLayoutHeight('0px');
                    node.contentBoxHeight = innerWrapped.contentBoxHeight;
                    innerWrapped.setLayoutHeight('wrap_content', false);
                }
            }
        }
    }
}