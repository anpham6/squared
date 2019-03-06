import { ExtensionResult } from '../../../src/base/@types/application';

import Resource from '../resource';

import { EXT_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

export default class Substitute<T extends android.base.View> extends squared.base.extensions.Substitute<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
        return super.processNode(node, parent);
    }

    public postProcedure(node: T) {
        const options = createViewAttribute(this.options[node.elementId]);
        node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
    }
}