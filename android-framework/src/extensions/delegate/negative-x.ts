import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class NegativeX<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return this.application.userSettings.supportNegativeLeftTop && !node.svgElement && node.some(item => !item.pageFlow && !item.imageElement && item.actualParent === node && (item.left < 0 || item.right < 0));
    }

    public processNode(node: T, parent: T) {
        const absolute = node.filter(item => !item.pageFlow);
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, absolute as T[], CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
        let left = NaN;
        let right = NaN;
        for (const item of absolute) {
            if (item.actualParent === node) {
                if (item.left < 0 && (isNaN(left) || item.linear.left < left)) {
                    left = item.linear.left;
                }
                if (item.right < 0 && (isNaN(right) || item.linear.right > right)) {
                    right = item.linear.right;
                }
            }
        }
        container.inherit(node, 'styleMap');
        if (!isNaN(left)) {
            const offset = node.linear.left - left;
            if (offset > 0) {
                node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, offset);
                for (const item of absolute) {
                    if (item.actualParent === node && item.left < 0) {
                        item.css('left', $util.formatPX(item.left + offset), true);
                    }
                }
            }
        }
        if (!isNaN(right)) {
            const offset = right - node.linear.right;
            if (offset > 0) {
                node.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, offset);
                for (const item of absolute) {
                    if (item.actualParent === node && item.right < 0) {
                        item.css('right', $util.formatPX(item.right + offset), true);
                    }
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
                    container.containerType,
                    $enum.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }
}