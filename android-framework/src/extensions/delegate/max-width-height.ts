import { ExtensionResult } from '../../../../src/base/@types/application';

import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;

export default class MaxWidthHeight<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return !node.textElement && (node.has('maxWidth') || node.has('maxHeight'));
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const controller = (<android.base.Controller<T>> this.application.controllerHandler);
        const container = controller.createNodeWrapper(node, parent);
        container.css('display', 'block', true);
        if (node.has('maxWidth')) {
            container.css('width', node.css('maxWidth'), true);
            node.css('maxWidth', 'auto');
        }
        if (node.has('maxHeight')) {
            container.css('height', node.css('maxHeight'), true);
            node.css('maxHeight', 'auto');
        }
        const layout = new $Layout(
            parent,
            container,
            CONTAINER_NODE.FRAME,
            $enum.NODE_ALIGNMENT.SINGLE,
            1,
            container.children as T[]
        );
        return { output: '', parent: container, renderAs: container, outputAs: this.application.renderLayout(layout) };
    }
}