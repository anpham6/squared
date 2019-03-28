import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class Percent<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        return parent.layoutVertical && node.pageFlow && !(node.documentParent as T).layoutFrame && node.has('width', $enum.CSS_STANDARD.PERCENT, { not: '100%' }) && !node.documentBody && !node.imageElement;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        container.android('layout_width', 'match_parent');
        container.android('layout_height', 'wrap_content');
        if (!node.has('height', $enum.CSS_STANDARD.LENGTH)) {
            node.css('height', $util.formatPX(node.bounds.height), true);
        }
        node.resetBox($enum.BOX_STANDARD.MARGIN, container, true);
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $Layout(
                    parent,
                    container,
                    CONTAINER_NODE.CONSTRAINT,
                    $enum.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            )
        };
    }
}