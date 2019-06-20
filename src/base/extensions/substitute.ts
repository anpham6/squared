import { NodeXmlTemplate } from '../@types/application';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { NODE_ALIGNMENT, NODE_TEMPLATE } from '../lib/enumeration';

const $css = squared.lib.css;

export default class Substitute<T extends NodeUI> extends ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(EXT_NAME.EXTERNAL, true);
    }

    public processNode(node: T, parent: T) {
        const data = $css.getDataSet(<HTMLElement> node.element, this.name);
        if (data.tag) {
            node.setControlType(data.tag);
            node.render(parent);
            if (data.tagChild) {
                node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                node.each(item => {
                    if (item.styleElement) {
                        item.dataset.use = this.name;
                        item.dataset.squaredSubstituteTag = data.tagChild;
                    }
                });
            }
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