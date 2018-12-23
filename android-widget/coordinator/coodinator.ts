import { ExtensionResult } from '../../src/base/types/application';

import { WIDGET_NAME } from '../lib/constant';

import $enum = squared.base.lib.enumeration;
import $dom = squared.lib.dom;

import $Resource = android.base.Resource;
import $View = android.base.View;
import $const_android = android.lib.constant;
import $enum_android = android.lib.enumeration;
import $util_android = android.lib.util;

export default class Coordinator<T extends $View> extends squared.base.Extension<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        const controller = this.application.controllerHandler;
        const options = $util_android.createAttribute(node.element ? this.options[node.element.id] : undefined);
        node.setControlType($const_android.SUPPORT_ANDROID.COORDINATOR, $enum_android.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
        node.render(parent);
        const output = controller.renderNodeStatic(
            $const_android.SUPPORT_ANDROID.COORDINATOR,
            node.renderDepth,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
            '',
            '',
            node,
            true
        );
        const element = Coordinator.findNestedByName(node.element, WIDGET_NAME.TOOLBAR);
        if (element) {
            const toolbar = $dom.getElementAsNode<T>(element);
            if (toolbar && toolbar.element) {
                const extension = this.application.extensionManager.retrieve(WIDGET_NAME.TOOLBAR);
                if (extension) {
                    const toolbarOptions = $util_android.createAttribute(extension.options[toolbar.element.id]);
                    if (toolbarOptions.hasOwnProperty('collapsingToolbar')) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
        }
        return { output };
    }

    public postProcedure(node: T) {
        if (node.documentRoot) {
            if (node.inlineWidth) {
                node.some((item: T) => {
                    if (item.rightAligned) {
                        node.android('layout_width', 'match_parent', true);
                        return true;
                    }
                    return false;
                });
            }
            if (node.inlineHeight) {
                node.some((item: T) => {
                    if (item.bottomAligned) {
                        node.android('layout_height', 'match_parent', true);
                        return true;
                    }
                    return false;
                });
            }
        }
    }
}