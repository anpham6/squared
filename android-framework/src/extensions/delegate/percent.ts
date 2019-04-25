import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;

export default class Percent<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        return node.pageFlow && node.has('width', $enum.CSS_STANDARD.PERCENT, { not: '100%' }) && (parent.layoutVertical || parent.layoutFrame && node.singleChild) && (node.has('height') || parent.blockStatic || parent.has('width')) && !node.imageElement && !node.documentBody;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        container.css('display', 'block');
        container.android('layout_width', 'match_parent');
        container.android('layout_height', node.has('height', $enum.CSS_STANDARD.PERCENT) ? 'match_parent' : 'wrap_content');
        node.android('layout_width', '0px');
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
            ),
            include: true
        };
    }

    public postConstraints(node: T) {
        const parent = node.parent;
        if (parent && parent.visible) {
            node.resetBox($enum.BOX_STANDARD.MARGIN, parent, true);
        }
    }
}