import { MaxWidthHeightData } from './max-width-height';

import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { aboveRange, belowRange } = squared.lib.util;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

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
                }
                else if (item.hasPX('right')) {
                    const value = item.right;
                    if (value >= 0 && (fixed || value < paddingRight || node.documentBody && node.hasPX('width') && node.positionStatic)) {
                        children.add(item);
                        right = true;
                    }
                }
                else if (!item.rightAligned) {
                    if (item.marginLeft < 0 && (node.documentRoot || belowRange(item.linear.left, node.bounds.left))) {
                        children.add(item);
                    }
                }
                else if (item.marginRight < 0 && (node.documentRoot || aboveRange(item.linear.right, node.bounds.right))) {
                    children.add(item);
                }
                if (item.hasPX('top')) {
                    const value = item.top;
                    if (value >= 0 && value < paddingTop) {
                        children.add(item);
                    }
                }
                else if (item.hasPX('bottom')) {
                    const value = item.bottom;
                    if (value >= 0 && (fixed || value < paddingBottom || node.documentBody && node.hasPX('height') && node.positionStatic)) {
                        children.add(item);
                        bottom = true;
                    }
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
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, mainData.children as T[], { resetMargin: !node.documentId && !node.pageFlow });
            if (node.documentBody) {
                let valid = false;
                if (mainData.right) {
                    container.setLayoutWidth('match_parent');
                    valid = true;
                }
                if (mainData.bottom) {
                    container.setLayoutHeight('match_parent');
                    valid = true;
                }
                if (valid) {
                    container.cssApply({
                        width: 'auto',
                        height: 'auto',
                        display: 'block',
                        float: 'none'
                    });
                }
            }
            if (!node.pageFlow) {
                if (!node.hasPX('width') && node.has('left') && node.has('right')) {
                    node.setLayoutWidth('match_parent');
                }
                if (!node.hasPX('height') && node.has('top') && node.has('bottom')) {
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
        const innerWrapped = <Null<T>> node.innerMostWrapped;
        if (innerWrapped) {
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