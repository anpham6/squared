/* android.widget.coordinator 1.3.8
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    const { getElementAsNode } = squared.lib.session;
    const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const $lib = android.lib;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $lib.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = $lib.enumeration;
    const { createViewAttribute } = $lib.util;
    const { Resource } = android.base;
    class Coordinator extends squared.base.ExtensionUI {
        processNode(node, parent) {
            var _a;
            const extensionManager = this.application.extensionManager;
            const options = createViewAttribute(this.options[node.elementId]);
            Resource.formatOptions(options, extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            const element = Coordinator.findNestedElement(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = getElementAsNode(element, node.sessionId);
                if (toolbar) {
                    const data = (_a = extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */)) === null || _a === void 0 ? void 0 : _a.options[toolbar.elementId];
                    if (data && 'collapsingToolbar' in data) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
            const controlName = node.localSettings.targetAPI < 29 /* Q */ ? SUPPORT_ANDROID.COORDINATOR : SUPPORT_ANDROID_X.COORDINATOR;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude(NODE_RESOURCE.ASSET);
            node.renderExclude = false;
            node.render(parent);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                }
            };
        }
        postOptimize(node) {
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

    const coordinator = new Coordinator("android.widget.coordinator" /* COORDINATOR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(coordinator);
    }

    return coordinator;

}());
