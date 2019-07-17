import { MaxWidthHeightData } from './max-width-height';

import View from '../../view';

import { EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const {
    util: $util
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

export interface FixedData {
    children: View[];
    right: boolean;
    bottom: boolean;
}

export default class Fixed<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.naturalElement && (node.documentBody || node.contentBoxWidth > 0 || node.contentBoxHeight > 0);
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
                    if (item.left >= 0 && item.left < paddingLeft) {
                        children.add(item);
                    }
                }
                else if (item.hasPX('right') && item.right >= 0 && (fixed || item.right < paddingRight || node.documentBody && node.hasPX('width'))) {
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
                if (item.hasPX('top')) {
                    if (item.top >= 0 && item.top < paddingTop) {
                        children.add(item);
                    }
                }
                else if (item.hasPX('bottom') && item.bottom >= 0 && (fixed || item.bottom < paddingBottom || node.documentBody && node.hasPX('height'))) {
                    children.add(item);
                    bottom = true;
                }
            }
            if (children.size) {
                node.data(EXT_ANDROID.DELEGATE_FIXED, $c.STRING_BASE.EXT_DATA, <FixedData> { children: Array.from(children), right, bottom });
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: FixedData = node.data(EXT_ANDROID.DELEGATE_FIXED, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, mainData.children as T[]);
            if (node.documentBody && (mainData.right || mainData.bottom)) {
                container.cssApply({
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    float: 'none'
                });
                if (mainData.right) {
                    container.setLayoutWidth('match_parent');
                }
                if (mainData.bottom) {
                    container.setLayoutHeight('match_parent');
                }
            }
            else if (!node.pageFlow) {
                node.resetBox($e.BOX_STANDARD.MARGIN, container);
            }
            for (const item of mainData.children) {
                if (item.hasPX('top')) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_TOP, node.borderTopWidth);
                }
                else if (item.hasPX('bottom')) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM, node.borderBottomWidth);
                }
                if (item.hasPX('left')) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, node.borderLeftWidth);
                }
                else if (item.hasPX('right')) {
                    item.modifyBox($e.BOX_STANDARD.MARGIN_RIGHT, node.borderRightWidth);
                }
            }
            const maxWidthHeight: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c.STRING_BASE.EXT_DATA);
            if (maxWidthHeight) {
                const wrapped = maxWidthHeight.container;
                if (wrapped) {
                    if (maxWidthHeight.width) {
                        container.css('maxWidth', node.css('maxWidth'));
                        container.setLayoutWidth('0px');
                        container.contentBoxWidth = node.contentBoxWidth;
                        node.setLayoutWidth('wrap_content');
                    }
                    if (maxWidthHeight.height) {
                        container.css('maxHeight', node.css('maxHeight'));
                        container.setLayoutHeight('0px');
                        container.contentBoxHeight = node.contentBoxHeight;
                        node.setLayoutHeight('wrap_content');
                    }
                }
            }
            this.subscribers.add(container);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new $LayoutUI(
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

    public postConstraints(node: T) {
        node.each((item: T) => {
            if (!item.constraint.horizontal) {
                item.anchor('left', 'parent');
            }
            if (!item.constraint.vertical) {
                item.anchor('top', 'parent');
            }
        });
    }
}