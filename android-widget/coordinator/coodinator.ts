import { NodeXmlTemplate } from '../../@types/base/application';

import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const $lib = android.lib;

const { getElementAsNode } = squared.lib.session;

const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $lib.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $lib.enumeration;
const { createViewAttribute } = $lib.util;

const Resource = android.base.Resource;

export default class Coordinator<T extends View> extends squared.base.ExtensionUI<T> {
    public processNode(node: T, parent: T) {
        const extensionManager = this.application.extensionManager;
        const options = createViewAttribute(this.options[node.elementId]);
        Resource.formatOptions(options, extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
        const element = Coordinator.findNestedElement(node, WIDGET_NAME.TOOLBAR);
        if (element) {
            const toolbar = getElementAsNode<T>(element, node.sessionId);
            if (toolbar) {
                const data: StandardMap = extensionManager.retrieve(WIDGET_NAME.TOOLBAR)?.options[toolbar.elementId];
                if (data && 'collapsingToolbar' in data) {
                    node.android('fitsSystemWindows', 'true');
                }
            }
        }
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.COORDINATOR : SUPPORT_ANDROID_X.COORDINATOR;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.ASSET });
        node.render(parent);
        node.renderExclude = false;
        return {
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            }
        };
    }

    public postOptimize(node: T) {
        if (node.documentRoot) {
            if (node.inlineWidth) {
                node.some(item => {
                    if (item.rightAligned) {
                        node.setLayoutWidth('match_parent', true);
                        return true;
                    }
                    return false;
                });
            }
            if (node.inlineHeight) {
                node.some(item => {
                    if (item.bottomAligned) {
                        node.setLayoutHeight('match_parent', true);
                        return true;
                    }
                    return false;
                });
            }
        }
    }
}