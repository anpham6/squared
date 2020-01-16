import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.VerticalAlign<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        return {
            output: this.application.renderNode(
                new LayoutUI(
                    parent,
                    node,
                    CONTAINER_NODE.RELATIVE,
                    NODE_ALIGNMENT.HORIZONTAL,
                    node.children as T[]
                )
            )
        };
    }
}