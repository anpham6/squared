import { MaxWidthHeightData } from './max-width-height';

import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

export interface FixedData {
    children: View[];
    right: boolean;
    bottom: boolean;
}

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

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
                    if (item.has('left')) {
                        if (item.left >= 0 && item.left < paddingLeft) {
                            children.add(item);
                        }
                    }
                    else if (item.has('right') && item.right >= 0 && (fixed || item.right < paddingRight || node.documentBody && node.has('width'))) {
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
                    if (item.has('top')) {
                        if (item.top >= 0 && item.top < paddingTop) {
                            children.add(item);
                        }
                    }
                    else if (item.has('bottom') && item.bottom >= 0 && (fixed || item.bottom < paddingBottom || node.documentBody && node.has('height'))) {
                        children.add(item);
                        bottom = true;
                    }
                }
                if (children.size) {
                    node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData', <FixedData> { children: Array.from(children), right, bottom });
                    return true;
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: FixedData = node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData');
        if (mainData) {
            const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, mainData.children as T[]);
            if (node.documentBody && (mainData.right || mainData.bottom)) {
                container.cssApply({
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    float: 'none'
                });
                if (mainData.right) {
                    container.android('layout_width', 'match_parent');
                }
                if (mainData.bottom) {
                    container.android('layout_height', 'match_parent');
                }
            }
            else if (!node.pageFlow) {
                node.resetBox($enum.BOX_STANDARD.MARGIN, container);
            }
            for (const item of mainData.children) {
                if (item.has('top')) {
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                else if (item.has('bottom')) {
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                if (item.has('left')) {
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                else if (item.has('right')) {
                    item.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
                item.documentParent = container;
                item.unsetCache('leftTopAxis');
            }
            const maxWidthHeight: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
            if (maxWidthHeight) {
                const wrapped = maxWidthHeight.container;
                if (wrapped) {
                    if (maxWidthHeight.width) {
                        container.css('maxWidth', node.css('maxWidth'));
                        container.android('layout_width', '0px');
                        container.contentBoxWidth = node.contentBoxWidth;
                        node.android('layout_width', 'wrap_content');
                    }
                    if (maxWidthHeight.height) {
                        container.css('maxHeight', node.css('maxHeight'));
                        container.android('layout_height', '0px');
                        container.contentBoxHeight = node.contentBoxHeight;
                        node.android('layout_height', 'wrap_content');
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
                        $enum.NODE_ALIGNMENT.ABSOLUTE,
                        container.children as T[]
                    )
                )
            };
        }
        return undefined;
    }
}