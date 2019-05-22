/* android.widget 0.9.9
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $session = squared.lib.session;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    const $e = squared.base.lib.enumeration;
    class Coordinator extends squared.base.Extension {
        processNode(node, parent) {
            const options = $utilA.createViewAttribute(this.options[node.elementId]);
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            const element = Coordinator.findNestedElement(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = $session.getElementAsNode(element, node.sessionId);
                if (toolbar) {
                    const extension = this.application.extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */);
                    if (extension && extension.options[toolbar.elementId] && 'collapsingToolbar' in extension.options[toolbar.elementId]) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
            node.setControlType($constA.SUPPORT_ANDROID.COORDINATOR, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude($e.NODE_RESOURCE.ASSET);
            node.render(parent);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: $constA.SUPPORT_ANDROID.COORDINATOR
                }
            };
        }
        postOptimize(node) {
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

    const coordinator = new Coordinator("android.widget.coordinator" /* COORDINATOR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(coordinator);
    }

    return coordinator;

}());
