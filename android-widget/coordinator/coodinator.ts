import { ExtensionResult } from '../../src/base/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

export default class Coordinator<T extends android.base.View> extends squared.base.Extension<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        const element = Coordinator.findNestedElement(node.element, WIDGET_NAME.TOOLBAR);
        if (element) {
            const toolbar = $dom.getElementAsNode<T>(element);
            if (toolbar) {
                const extension = this.application.extensionManager.retrieve(WIDGET_NAME.TOOLBAR);
                if (extension && 'collapsingToolbar' in $utilA.createViewAttribute(extension.options[toolbar.elementId])) {
                    node.android('fitsSystemWindows', 'true');
                }
            }
        }
        node.setControlType($constA.SUPPORT_ANDROID.COORDINATOR, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
        node.render(parent);
        return {
            output: this.application.controllerHandler.renderNodeStatic(
                $constA.SUPPORT_ANDROID.COORDINATOR,
                node.renderDepth,
                $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
                '',
                '',
                node,
                true
            )
        };
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