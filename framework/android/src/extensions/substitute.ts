import NODE_ALIGNMENT = squared.base.lib.enumeration.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.enumeration.NODE_TEMPLATE;
import EXT_ANDROID = android.lib.enumeration.EXT_ANDROID;

import type View from '../view';

import Resource from '../resource';

import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute, getDataSet } from '../lib/util';

const { convertCamelCase } = squared.lib.util;

export default class Substitute<T extends View> extends squared.base.ExtensionUI<T> {
    constructor(name: string, framework: number, options?: ExtensionUIOptions) {
        super(name, framework, options);
        this.require(EXT_ANDROID.EXTERNAL, true);
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
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
                            if (item.pseudoElement && item.textEmpty) {
                                item.hide({ remove: true });
                            }
                            else {
                                item.use = name;
                                item.dataset.androidSubstituteTag = tagChild;
                            }
                        }
                    });
                }
                return {
                    output: {
                        type: NODE_TEMPLATE.XML,
                        node,
                        controlName
                    } as NodeXmlTemplate<T>,
                    include: true
                };
            }
        }
    }

    public postOptimize(node: T) {
        node.apply(
            Resource.formatOptions(
                createViewAttribute(this.options[node.elementId]),
                this.application.extensionManager.valueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource')
            )
        );
    }
}