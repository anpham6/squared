import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export default class NegativeViewport<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.pageFlow;
    }

    public condition(node: T, parent: T) {
        if (parent.documentRoot) {
            const box = parent.box;
            const linear = node.linear;
            return (
                Math.ceil(linear.left) < Math.floor(box.left) && (node.left < 0 || node.marginLeft < 0 || !node.hasPX('left') && node.right > 0) ||
                Math.floor(linear.right) > Math.ceil(box.right) && (node.left > 0 || node.marginLeft > 0 || !node.hasPX('left') && node.right < 0) ||
                Math.ceil(linear.top) < Math.floor(box.top) && (node.top < 0 || node.marginTop < 0 || !node.hasPX('top') && node.bottom > 0) ||
                Math.floor(linear.bottom) > Math.ceil(box.bottom) && (node.top > 0 || node.marginTop > 0 || !node.hasPX('top') && node.bottom < 0) && parent.hasPX('height')
            );
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent);
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.FRAME,
                    NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            ),
            include: true
        };
    }
}