/* android.widget 0.8.0
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
            node.setControlType($constA.SUPPORT_ANDROID.COORDINATOR, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            const output = this.application.controllerHandler.renderNodeStatic($constA.SUPPORT_ANDROID.COORDINATOR, node.renderDepth, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), '', '', node, true);
            const element = Coordinator.findNestedByName(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = $dom.getElementAsNode(element);
                if (toolbar && toolbar.element) {
                    const extension = this.application.extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */);
                    if (extension) {
                        const toolbarOptions = $utilA.createViewAttribute(extension.options[toolbar.elementId]);
                        if ('collapsingToolbar' in toolbarOptions) {
                            node.android('fitsSystemWindows', 'true');
                        }
                    }
                }
            }
            return { output };
        }
        postProcedure(node) {
            if (node.documentRoot) {
                if (node.inlineWidth) {
                    node.some((item) => {
                        if (item.rightAligned) {
                            node.android('layout_width', 'match_parent', true);
                            return true;
                        }
                        return false;
                    });
                }
                if (node.inlineHeight) {
                    node.some((item) => {
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

    const coordinator = new Coordinator("android.widget.coordinator" /* COORDINATOR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(coordinator);
    }

    return coordinator;

}());
