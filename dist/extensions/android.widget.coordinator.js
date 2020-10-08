/* android.widget.coordinator 2.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    const { NODE_RESOURCE } = squared.base.lib.constant;
    const { CONTAINER_NODE, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X } = android.lib.constant;
    const { getElementAsNode } = squared.lib.session;
    const { createViewAttribute } = android.lib.util;
    const Resource = android.base.Resource;
    class Coordinator extends squared.base.ExtensionUI {
        processNode(node, parent) {
            var _a;
            const options = createViewAttribute(this.options[node.elementId]);
            Resource.formatOptions(
                options,
                this.application.extensionManager.valueAsBoolean(
                    'android.resource.strings' /* RESOURCE_STRINGS */,
                    'numberAsResource'
                )
            );
            const element = Coordinator.findNestedElement(node, 'android.widget.toolbar' /* TOOLBAR */);
            if (element) {
                const toolbar = getElementAsNode(element, node.sessionId);
                if (toolbar) {
                    const data =
                        (_a = this.application.extensionManager.get('android.widget.toolbar' /* TOOLBAR */)) === null ||
                        _a === void 0
                            ? void 0
                            : _a.options[toolbar.elementId];
                    if (data && 'collapsingToolbar' in data) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
            const controlName = node.api < 29 /* Q */ ? SUPPORT_TAGNAME.COORDINATOR : SUPPORT_TAGNAME_X.COORDINATOR;
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
                if (node.inlineWidth && node.find(item => item.rightAligned)) {
                    node.setLayoutWidth('match_parent', true);
                }
                if (node.inlineHeight && node.find(item => item.bottomAligned)) {
                    node.setLayoutHeight('match_parent', true);
                }
            }
        }
    }

    const coordinator = new Coordinator('android.widget.coordinator' /* COORDINATOR */, 2 /* ANDROID */);
    if (squared) {
        squared.add(coordinator);
    }

    return coordinator;
})();
