/* android.widget 0.9.1
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $dom = squared.lib.dom;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    class Coordinator extends squared.base.Extension {
        processNode(node, parent) {
            const options = $utilA.createViewAttribute(this.options[node.elementId]);
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            const element = Coordinator.findNestedElement(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = $dom.getElementAsNode(element);
                if (toolbar) {
                    const extension = this.application.extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */);
                    if (extension && 'collapsingToolbar' in $utilA.createViewAttribute(extension.options[toolbar.elementId])) {
                        node.android('fitsSystemWindows', 'true');
                    }
                }
            }
            node.setControlType($constA.SUPPORT_ANDROID.COORDINATOR, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: $constA.SUPPORT_ANDROID.COORDINATOR
                }
            };
        }
        postProcedure(node) {
            if (node.documentRoot) {
                if (node.inlineWidth) {
                    for (const item of node) {
                        if (item.rightAligned) {
                            node.android('layout_width', 'match_parent', true);
                            break;
                        }
                    }
                }
                if (node.inlineHeight) {
                    for (const item of node) {
                        if (item.bottomAligned) {
                            node.android('layout_height', 'match_parent', true);
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
