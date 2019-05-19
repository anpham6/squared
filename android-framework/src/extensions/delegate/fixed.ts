import { MaxWidthHeightData } from './max-width-height';

import View from '../../view';

import { EXT_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

export interface FixedData {
    children: View[];
    right: boolean;
    bottom: boolean;
}

const $const = squared.lib.constant;
const $util = squared.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

export default class Fixed<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        if (node.naturalElement && (node.documentBody || node.contentBoxWidth > 0 || node.contentBoxHeight > 0)) {
            const absolute = node.filter(item => !item.pageFlow && item.leftTopAxis && item.left >= 0 && item.right >= 0) as T[];
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
                    if (item.has($const.CSS.LEFT)) {
                        if (item.left >= 0 && item.left < paddingLeft) {
                            children.add(item);
                        }
                    }
                    else if (item.has($const.CSS.RIGHT) && item.right >= 0 && (fixed || item.right < paddingRight || node.documentBody && node.has($const.CSS.WIDTH))) {
                        children.add(item);
                        right = true;
                    }
                    else if (!item.rightAligned) {
                        if (item.marginLeft < 0 && (node.documentRoot || $util.belowRange(item.linear.left, node.bounds.left))) {
                            children.add(item);
                        }
                    }
                    else if (item.marginRight < 0 && (node.documentRoot || $util.aboveRange(item.linear.right, node.bounds.right))) {
                        children.add(item);
                    }
                    if (item.has($const.CSS.TOP)) {
                        if (item.top >= 0 && item.top < paddingTop) {
                            children.add(item);
                        }
                    }
                    else if (item.has($const.CSS.BOTTOM) && item.bottom >= 0 && (fixed || item.bottom < paddingBottom || node.documentBody && node.has($const.CSS.HEIGHT))) {
                        children.add(item);
                        bottom = true;
                    }
                }
                if (children.size) {
                    node.data(EXT_ANDROID.DELEGATE_FIXED, $c.STRING_BASE.EXT_DATA, <FixedData> { children: Array.from(children), right, bottom });
                    return true;
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: FixedData = node.data(EXT_ANDROID.DELEGATE_FIXED, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, mainData.children as T[]);
            if (node.documentBody && (mainData.right || mainData.bottom)) {
                container.cssApply({
                    width: $const.CSS.AUTO,
                    height: $const.CSS.AUTO,
                    display: 'block',
                    float: $const.CSS.NONE
                });
                if (mainData.right) {
                    container.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                }
                if (mainData.bottom) {
                    container.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
                }
            }
            else if (!node.pageFlow) {
                node.resetBox($e.BOX_STANDARD.MARGIN, container);
            }
            for (const item of mainData.children) {
                if (item.has($const.CSS.TOP)) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                else if (item.has($const.CSS.BOTTOM)) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                if (item.has($const.CSS.LEFT)) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                else if (item.has($const.CSS.RIGHT)) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
            }
            const maxWidthHeight: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA);
            if (maxWidthHeight) {
                const wrapped = maxWidthHeight.container;
                if (wrapped) {
                    if (maxWidthHeight.width) {
                        container.css('maxWidth', node.css('maxWidth'));
                        container.setLayoutWidth($const.CSS.PX_ZERO);
                        container.contentBoxWidth = node.contentBoxWidth;
                        node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
                    }
                    if (maxWidthHeight.height) {
                        container.css('maxHeight', node.css('maxHeight'));
                        container.setLayoutHeight($const.CSS.PX_ZERO);
                        container.contentBoxHeight = node.contentBoxHeight;
                        node.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
                    }
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new $Layout(
                        parent,
                        container,
                        CONTAINER_NODE.CONSTRAINT,
                        $e.NODE_ALIGNMENT.ABSOLUTE,
                        container.children as T[]
                    )
                )
            };
        }
        return undefined;
    }
}