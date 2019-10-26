import { NodeXmlTemplate } from '../../@types/base/application';

import { WIDGET_NAME } from '../lib/constant';

const {
    constant: $constA,
    enumeration: $enumA,
    util: $utilA
} = android.lib;

const $Resource = android.base.Resource;
const $session = squared.lib.session;
const $e = squared.base.lib.enumeration;

export default class Coordinator<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public processNode(node: T, parent: T) {
        const extensionManager = this.application.extensionManager;
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        $Resource.formatOptions(options, extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        const element = Coordinator.findNestedElement(node.element, WIDGET_NAME.TOOLBAR);
        if (element) {
            const toolbar = $session.getElementAsNode<T>(element, node.sessionId);
            if (toolbar) {
                const extension = extensionManager.retrieve(WIDGET_NAME.TOOLBAR);
                if (extension) {
                    const elementId = toolbar.elementId;
                    if (extension.options[elementId] && 'collapsingToolbar' in extension.options[elementId]) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
        }
        const controlName = node.localSettings.targetAPI < $enumA.BUILD_ANDROID.Q ? $constA.SUPPORT_ANDROID.COORDINATOR : $constA.SUPPORT_ANDROID_X.COORDINATOR;
        node.setControlType(controlName, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.ASSET);
        node.renderExclude = false;
        node.render(parent);
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName
            }
        };
    }

    public postOptimize(node: T) {
        if (node.documentRoot) {
            if (node.inlineWidth) {
                for (const item of node) {
                    if (item.rightAligned) {
                        node.setLayoutWidth('match_parent', true);
                        break;
                    }
                }
            }
            if (node.inlineHeight) {
                for (const item of node) {
                    if (item.bottomAligned) {
                        node.setLayoutHeight('match_parent', true);
                        break;
                    }
                }
            }
        }
    }
}