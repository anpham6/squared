import { ExtensionResult } from '../../../../src/base/types/application';

import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class Percent<T extends View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        return parent.layoutVertical && !node.documentBody && node.pageFlow && !node.imageElement && node.has('width', $enum.CSS_STANDARD.PERCENT, { not: '100%' });
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const controller = (<android.base.Controller<T>> this.application.controllerHandler);
        const container = controller.createNodeWrapper(node, parent);
        container.android('layout_width', 'match_parent');
        container.android('layout_height', 'wrap_content');
        if (!node.has('height', $enum.CSS_STANDARD.UNIT)) {
            node.css('height', $util.formatPX(node.bounds.height), true);
        }
        const layout = new $Layout(
            parent,
            container,
            CONTAINER_NODE.CONSTRAINT,
            $enum.NODE_ALIGNMENT.SINGLE,
            1,
            container.children as T[]
        );
        return { output: '', parent: container, renderAs: container, outputAs: this.application.renderLayout(layout) };
    }
}