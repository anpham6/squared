import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export default class NegativeViewport<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.pageFlow;
    }

    public condition(node: T, parent: T) {
        if (parent.naturalElement && parent.documentRoot) {
            const { top, right, bottom, left, linear, marginLeft, marginTop } = node;
            const box = parent.box;
            return (
                Math.ceil(linear.left) < Math.floor(box.left) && (left < 0 || marginLeft < 0 || !node.hasPX('left') && right > 0) ||
                Math.floor(linear.right) > Math.ceil(box.right) && (left > 0 || marginLeft > 0 || !node.hasPX('left') && right < 0) ||
                Math.ceil(linear.top) < Math.floor(box.top) && (top < 0 || marginTop < 0 || !node.hasPX('top') && bottom > 0) ||
                Math.floor(linear.bottom) > Math.ceil(box.bottom) && (top > 0 || marginTop > 0 || !node.hasPX('top') && bottom < 0) && parent.hasPX('height')
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
                new $LayoutUI(
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