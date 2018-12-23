import { ExtensionResult } from '../../../src/base/types/application';
import { VerticalAlignData } from '../../../src/base/types/extension';

import { CONTAINER_NODE } from '../lib/enumeration';

import View from '../view';

import $Layout = squared.base.Layout;
import $const = squared.base.lib.constant;
import $enum = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.VerticalAlign<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        super.processNode(node, parent);
        const mainData: VerticalAlignData<T> = node.data($const.EXT_NAME.VERTICAL_ALIGN, 'mainData');
        let output = '';
        if (mainData) {
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.RELATIVE,
                $enum.NODE_ALIGNMENT.HORIZONTAL,
                node.length,
                node.children as T[]
            );
            layout.floated = layout.getFloated(true);
            output = this.application.renderNode(layout);
        }
        return { output };
    }
}