/* android.widget.coordinator 1.3.3
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    const { constant: $constA, enumeration: $enumA, util: $utilA } = android.lib;
    const $Resource = android.base.Resource;
    const $session = squared.lib.session;
    const $e = squared.base.lib.enumeration;
    class Coordinator extends squared.base.ExtensionUI {
        processNode(node, parent) {
            const extensionManager = this.application.extensionManager;
            const options = $utilA.createViewAttribute(this.options[node.elementId]);
            $Resource.formatOptions(options, extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            const element = Coordinator.findNestedElement(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = $session.getElementAsNode(element, node.sessionId);
                if (toolbar) {
                    const extension = extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */);
                    if (extension) {
                        const elementId = toolbar.elementId;
                        if (extension.options[elementId] && 'collapsingToolbar' in extension.options[elementId]) {
                            node.android('fitsSystemWindows', 'true');
                        }
                    }
                }
            }
            const controlName = node.localSettings.targetAPI < 29 /* Q */ ? $constA.SUPPORT_ANDROID.COORDINATOR : $constA.SUPPORT_ANDROID_X.COORDINATOR;
            node.setControlType(controlName, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude($e.NODE_RESOURCE.ASSET);
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
