import type { NodeXmlTemplate } from '../../../@types/base/application';

import Resource from '../resource';

import { EXT_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute, getDataSet } from '../lib/util';

type View = android.base.View;

const { convertCamelCase } = squared.lib.util;

const { NODE_ALIGNMENT, NODE_TEMPLATE } = squared.base.lib.enumeration;

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
        const data = getDataSet(node.dataset, convertCamelCase(this.name, '.'));
        if (data) {
            const controlName = data.tag;
            if (controlName) {
                node.setControlType(controlName, node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE);
                node.render(parent);
                const tagChild = data.tagChild;
                if (tagChild) {
                    const name = this.name;
                    node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
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
                    },
                    include: true
                };
            }
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