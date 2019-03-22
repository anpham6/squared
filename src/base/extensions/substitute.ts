import { NodeXmlTemplate } from '../../../src/base/@types/application';

import Extension from '../extension';
import Node from '../node';

import { EXT_NAME } from '../lib/constant';
import { NODE_TEMPLATE } from '../lib/enumeration';

const $css = squared.lib.css;

export default class Substitute<T extends Node> extends Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require(EXT_NAME.EXTERNAL, true);
    }

    public processNode(node: T, parent: T) {
        const data = $css.getDataSet(<HTMLElement> node.element, this.name);
        if (data.tagChild) {
            node.each(item => {
                if (item.styleElement) {
                    item.dataset.use = this.name;
                    item.dataset.squaredSubstituteTag = data.tagChild;
                }
            });
        }
        if (data.tag) {
            node.setControlType(data.tag);
            node.render(parent);
            return {
                output: <NodeXmlTemplate<T>> {
                    type: NODE_TEMPLATE.XML,
                    node,
                    controlName: data.tag
                }
            };
        }
        return undefined;
    }
}