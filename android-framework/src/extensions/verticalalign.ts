import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $e = squared.base.lib.enumeration;

export default class <T extends android.base.View> extends squared.base.extensions.VerticalAlign<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        return {
            output: this.application.renderNode(
                new $Layout(
                    parent,
                    node,
                    CONTAINER_NODE.RELATIVE,
                    $e.NODE_ALIGNMENT.HORIZONTAL,
                    node.children as T[]
                )
            )
        };
    }
}