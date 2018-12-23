/* android.widget 0.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.coordinator = (function () {
    'use strict';

    var $enum = squared.base.lib.enumeration;
    var $dom = squared.lib.dom;
    var $Resource = android.base.Resource;
    var $const_android = android.lib.constant;
    var $enum_android = android.lib.enumeration;
    var $util_android = android.lib.util;
    class Coordinator extends squared.base.Extension {
        processNode(node, parent) {
            const controller = this.application.controllerHandler;
            const options = $util_android.createAttribute(node.element ? this.options[node.element.id] : undefined);
            node.setControlType($const_android.SUPPORT_ANDROID.COORDINATOR, $enum_android.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            const output = controller.renderNodeStatic($const_android.SUPPORT_ANDROID.COORDINATOR, node.renderDepth, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), '', '', node, true);
            const element = Coordinator.findNestedByName(node.element, "android.widget.toolbar" /* TOOLBAR */);
            if (element) {
                const toolbar = $dom.getElementAsNode(element);
                if (toolbar && toolbar.element) {
                    const extension = this.application.extensionManager.retrieve("android.widget.toolbar" /* TOOLBAR */);
                    if (extension) {
                        const toolbarOptions = $util_android.createAttribute(extension.options[toolbar.element.id]);
                        if (toolbarOptions.hasOwnProperty('collapsingToolbar')) {
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
