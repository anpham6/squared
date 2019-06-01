import { NodeXmlTemplate } from '../../src/base/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $session = squared.lib.session;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;
const $e = squared.base.lib.enumeration;

export default class Coordinator<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public processNode(node: T, parent: T) {
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        const element = Coordinator.findNestedElement(node.element, WIDGET_NAME.TOOLBAR);
        if (element) {
            const toolbar = $session.getElementAsNode<T>(element, node.sessionId);
            if (toolbar) {
                const extension = this.application.extensionManager.retrieve(WIDGET_NAME.TOOLBAR);
                if (extension && extension.options[toolbar.elementId] && 'collapsingToolbar' in extension.options[toolbar.elementId]) {
                    node.android('fitsSystemWindows', 'true');
                }
            }
        }
        node.setControlType($constA.SUPPORT_ANDROID.COORDINATOR, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.ASSET);
        node.renderExclude = false;
        node.render(parent);
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName: $constA.SUPPORT_ANDROID.COORDINATOR
            }
        };
    }

    public postOptimize(node: T) {
        if (node.documentRoot) {
            if (node.inlineWidth) {
                for (const item of node) {
                    if (item.rightAligned) {
                        node.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT, true);
                        break;
                    }
                }
            }
            if (node.inlineHeight) {
                for (const item of node) {
                    if (item.bottomAligned) {
                        node.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT, true);
                        break;
                    }
                }
            }
        }
    }
}