import { ExtensionResult } from '../../../src/base/types/application';

import { EXT_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import Resource from '../resource';
import View from '../view';

export default class Substitute<T extends View> extends squared.base.extensions.Substitute<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
        return super.processNode(node, parent);
    }

    public postProcedure(node: T) {
        const options: ExternalData = Object.assign({}, this.options[node.element.id]);
        node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
    }
}