import Resource from '../resource';

import { EXT_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

const $e = squared.base.lib.enumeration;

export default class Substitute<T extends android.base.View> extends squared.base.extensions.Substitute<T> {
    public processNode(node: T, parent: T) {
        node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
        node.alignmentType = $e.NODE_ALIGNMENT.CUSTOM;
        return super.processNode(node, parent);
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