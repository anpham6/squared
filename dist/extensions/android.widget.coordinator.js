/* android.widget.coordinator 1.13.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    const { getElementAsNode } = squared.lib.session;
    const { createViewAttribute } = android.lib.util;
    const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = android.lib.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = android.lib.enumeration;
    const Resource = android.base.Resource;
    class Coordinator extends squared.base.ExtensionUI {
        processNode(node, parent) {
            var _a;
            const options = createViewAttribute(this.options[node.elementId]);
            Resource.formatOptions(
                options,
                this.application.extensionManager.optionValueAsBoolean(
                    EXT_ANDROID.RESOURCE_STRINGS,
                    'numberResourceValue'
                )
            );
            const element = Coordinator.findNestedElement(node, 'android.widget.toolbar' /* TOOLBAR */);
            if (element) {
                const toolbar = getElementAsNode(element, node.sessionId);
                if (toolbar) {
                    const data =
                        (_a = this.application.extensionManager.retrieve('android.widget.toolbar' /* TOOLBAR */)) ===
                            null || _a === void 0
                            ? void 0
                            : _a.options[toolbar.elementId];
                    if (data && 'collapsingToolbar' in data) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
            const controlName = node.api < 29 /* Q */ ? SUPPORT_ANDROID.COORDINATOR : SUPPORT_ANDROID_X.COORDINATOR;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude({ resource: NODE_RESOURCE.ASSET });
            node.render(parent);
            node.renderExclude = false;
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName,
                },
            };
        }
        postOptimize(node) {
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

    const coordinator = new Coordinator('android.widget.coordinator' /* COORDINATOR */, 2 /* ANDROID */);
    if (squared) {
        squared.include(coordinator);
    }

    return coordinator;
})();
