import { VerticalAlignData } from '../../../src/base/@types/extension';

import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;

export default class <T extends android.base.View> extends squared.base.extensions.VerticalAlign<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: VerticalAlignData<T> = node.data($const.EXT_NAME.VERTICAL_ALIGN, 'mainData');
        if (mainData) {
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.RELATIVE,
                $enum.NODE_ALIGNMENT.HORIZONTAL,
                node.children as T[]
            );
            return { output: this.application.renderNode(layout) };
        }
        return undefined;
    }
}