import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class MaxWidthHeight<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        return !node.textElement && !node.imageElement && !node.svgElement && !parent.layoutConstraint && (node.has('maxWidth') && !parent.has('columnCount') && !parent.has('columnWidth') || node.has('maxHeight'));
    }

    public processNode(node: T, parent: T) {
        const absolute = node.filter(item => !item.pageFlow && (item.absoluteParent !== node || node.documentRoot));
        let container: T;
        if (absolute.length) {
            container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, absolute as T[], CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
        }
        else {
            container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, undefined, CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
        }
        container.inherit(node, 'styleMap');
        const maxWidth = node.css('maxWidth');
        const maxHeight = node.css('maxHeight');
        if ($util.isLength(maxWidth, true)) {
            if (!node.hasWidth) {
                node.android('layout_width', node.some(item => item.blockStatic) ? 'match_parent' : 'wrap_content');
            }
            const width = $util.formatPX(node.parseUnit(maxWidth) + ($util.isPercent(maxWidth) ? 0 : node.contentBoxWidth + (node.marginLeft > 0 ? node.marginLeft : 0) + (node.marginRight > 0 ? node.marginRight : 0)));
            container.cssApply({ width, maxWidth: width }, true);
            if (parent.layoutElement) {
                node.autoMargin.horizontal = false;
                node.autoMargin.left = false;
                node.autoMargin.right = false;
                node.autoMargin.leftRight = false;
            }
        }
        if ($util.isLength(maxHeight, true)) {
            if (!node.hasHeight) {
                node.android('layout_height', 'wrap_content');
            }
            const height = $util.formatPX(node.parseUnit(maxHeight) + ($util.isPercent(maxHeight) ? 0 : node.contentBoxHeight + (node.marginTop > 0 ? node.marginTop : 0) + (node.marginBottom > 0 ? node.marginBottom : 0)));
            container.cssApply({ height, maxHeight: height }, true);
            if (parent.layoutElement) {
                node.autoMargin.vertical = false;
                node.autoMargin.top = false;
                node.autoMargin.bottom = false;
                node.autoMargin.topBottom = false;
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