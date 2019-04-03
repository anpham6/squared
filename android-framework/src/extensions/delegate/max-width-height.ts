import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;

export default class MaxWidthHeight<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        return !node.textElement && !node.imageElement && !node.svgElement && (node.has('maxWidth') && !parent.has('columnCount') && !parent.has('columnWidth') || node.has('maxHeight'));
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        container.cssApply({
            marginTop: '0px',
            marginRight: '0px',
            marginBottom: '0px',
            marginLeft: '0px',
            paddingTop: '0px',
            paddingRight: '0px',
            paddingBottom: '0px',
            paddingLeft: '0px',
            borderTopStyle: 'none',
            borderRightStyle: 'none',
            borderBottomStyle: 'none',
            borderLeftStyle: 'none',
            borderRadius: '0px',
            display: 'block'
        }, true);
        container.inherit(node, 'styleMap');
        if (node.has('maxWidth')) {
            container.css('width', node.css('maxWidth'));
            if (!node.hasWidth && node.block && !node.has('columnCount') && !node.has('columnWidth') && (node.autoMargin.leftRight || node.autoMargin.left)) {
                node.android('layout_width', 'wrap_content');
            }
        }
        if (node.has('maxHeight')) {
            container.css('height', node.css('maxHeight'));
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $Layout(
                    parent,
                    container,
                    CONTAINER_NODE.FRAME,
                    $enum.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }
}