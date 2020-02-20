import { NodeXmlTemplate } from '../../../@types/base/application';

import Resource from '../resource';

import { EXT_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

type View = android.base.View;

const { getDataSet } = squared.lib.css;

const { NODE_ALIGNMENT, NODE_TEMPLATE } =  squared.base.lib.enumeration;

export default class Substitute<T extends View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: StandardMap,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(EXT_ANDROID.EXTERNAL, true);
    }

    public processNode(node: T, parent: T) {
        const data = getDataSet(<HTMLElement> node.element, this.name);
        const controlName = data.tag;
        if (controlName) {
            node.setControlType(controlName, node.block ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE);
            node.render(parent);
            const tagChild = data.tagChild;
            if (tagChild) {
                const name = this.name;
                node.addAlign(node.block ? NODE_ALIGNMENT.BLOCK : NODE_ALIGNMENT.INLINE);
                node.each((item: T) => {
                    if (item.styleElement) {
                        const dataset = item.dataset;
                        dataset.use = name;
                        dataset.androidSubstituteTag = tagChild;
                    }
                });
            }
            return {
                output: <NodeXmlTemplate<T>> {
                    type: NODE_TEMPLATE.XML,
                    node,
                    controlName
                }
            };
        }
        return undefined;
    }

    public postOptimize(node: T) {
        node.apply(
            Resource.formatOptions(
                createViewAttribute(this.options[node.elementId]),
                this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')
            )
        );
    }
}