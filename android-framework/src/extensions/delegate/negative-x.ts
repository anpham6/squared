import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

type View = android.base.View;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

function outsideX(node: View, parent: View) {
    return !node.pageFlow && node.absoluteParent === parent && (node.left < 0 || !node.has('left') && node.right < 0);
}

export default class NegativeX<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return this.application.userSettings.supportNegativeLeftTop && node.css('overflow') !== 'hidden' && node.some((item: T) => outsideX(item, node));
    }

    public processNode(node: T, parent: T) {
        const outside = node.filter((item: T) => outsideX(item, node));
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, outside as T[], CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
        if (node.marginTop > 0) {
            container.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, node.marginTop);
            node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
        }
        if (node.marginBottom > 0) {
            container.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, node.marginBottom);
            node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, null);
        }
        let left = NaN;
        let right = NaN;
        for (const item of outside) {
            if (item.left < 0 && (isNaN(left) || item.linear.left < left)) {
                left = item.linear.left;
            }
            if (item.right < 0 && (isNaN(right) || item.linear.right > right)) {
                right = item.linear.right;
            }
        }
        container.inherit(node, 'styleMap');
        if (!isNaN(left)) {
            let offset = node.linear.left - left;
            if (offset > 0) {
                node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, offset);
                for (const item of outside) {
                    if (item.left < 0) {
                        item.css('left', $util.formatPX(item.left + offset), true);
                    }
                }
            }
            else {
                for (const item of outside) {
                    if (item.left < 0) {
                        item.css('left', $util.formatPX(node.marginLeft + item.left), true);
                    }
                }
                offset = 0;
            }
            if (node.has('width', $enum.CSS_STANDARD.LENGTH)) {
                container.cssPX('width', node.marginLeft + offset, false, true);
            }
            else if (node.has('width')) {
                container.css('width', 'auto', true);
            }
        }
        if (!isNaN(right)) {
            let offset = node.linear.right - right;
            if (offset > 0) {
                node.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, offset);
                for (const item of outside) {
                    if (item.right < 0) {
                        item.css('right', $util.formatPX(item.right + offset), true);
                    }
                }
            }
            else {
                for (const item of outside) {
                    if (item.right < 0) {
                        item.css('right', $util.formatPX(node.marginRight + item.right), true);
                    }
                }
                offset = 0;
            }
            if (node.has('width', $enum.CSS_STANDARD.LENGTH)) {
                container.cssPX('width', node.marginRight + offset, false, true);
            }
            else if (node.has('width')) {
                container.css('width', 'auto', true);
            }
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $Layout(
                    parent,
                    container,
                    container.containerType,
                    $enum.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }
}