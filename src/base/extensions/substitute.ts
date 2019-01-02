import { ExtensionResult } from '../@types/application';

import { EXT_NAME } from '../lib/constant';

import Extension from '../extension';
import Node from '../node';

const $dom = squared.lib.dom;

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

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const data = $dom.getDataSet(node.element, this.name);
        let output = '';
        if (data.tag) {
            node.setControlType(data.tag);
            node.render(parent);
            output = this.application.controllerHandler.renderNodeStatic(data.tag, node.renderDepth, {}, '', '', node, node.length > 0);
        }
        if (data.tagChild) {
            node.each(item => {
                if (item.styleElement) {
                    item.dataset.use = this.name;
                    item.dataset.squaredSubstituteTag = data.tagChild;
                }
            });
        }
        return { output };
    }
}