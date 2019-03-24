import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;

export default class MaxWidthHeight<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return !node.textElement && !node.imageElement && !node.svgElement && (node.has('maxWidth') || node.has('maxHeight'));
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        container.css('display', 'block', true);
        if (node.has('maxWidth')) {
            const maxWidth = node.css('maxWidth');
            container.cssApply({ width: maxWidth, maxWidth }, true);
        }
        if (node.has('maxHeight')) {
            const maxHeight = node.css('maxHeight');
            container.cssApply({ height: maxHeight, maxHeight }, true);
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