/* android.widget.bottomnavigation 1.3.8
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    const { assignEmptyValue, optionalAsString } = squared.lib.util;
    const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const $lib = android.lib;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $lib.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = $lib.enumeration;
    const { createStyleAttribute, createViewAttribute } = $lib.util;
    const { Resource } = android.base;
    class BottomNavigation extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require("android.widget.menu" /* MENU */);
        }
        processNode(node, parent) {
            const options = createViewAttribute(this.options[node.elementId]);
            assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
            const children = node.children;
            const length = children.length;
            for (let i = 5; i < length; i++) {
                const item = children[i];
                item.hide();
                for (const child of item.cascade()) {
                    child.hide();
                }
            }
            const controlName = node.localSettings.targetAPI < 29 /* Q */ ? SUPPORT_ANDROID.BOTTOM_NAVIGATION : SUPPORT_ANDROID_X.BOTTOM_NAVIGATION;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude(NODE_RESOURCE.ASSET);
            node.render(parent);
            node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
            node.setLayoutWidth('match_parent');
            node.setLayoutHeight('wrap_content');
            for (const item of node.cascade()) {
                this.addDescendant(item);
            }
            this.setStyleTheme();
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                },
                complete: true
            };
        }
        afterParseDocument() {
            for (const node of this.subscribers) {
                const renderParent = node.renderParent;
                if (!renderParent.hasPX('width')) {
                    renderParent.setLayoutWidth('match_parent');
                }
                if (!renderParent.hasPX('height')) {
                    renderParent.setLayoutHeight('match_parent');
                }
                const menu = optionalAsString(BottomNavigation.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
                if (menu !== '') {
                    const options = createViewAttribute(this.options[node.elementId]);
                    assignEmptyValue(options, 'app', 'menu', '@menu/' + menu);
                    node.app('menu', options.app.menu);
                }
            }
        }
        setStyleTheme() {
            const options = createStyleAttribute(this.options.resource);
            assignEmptyValue(options, 'name', this.application.userSettings.manifestThemeName);
            assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
            Resource.addTheme(options);
        }
    }

    const bottomNavigation = new BottomNavigation("android.widget.bottomnavigation" /* BOTTOM_NAVIGATION */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(bottomNavigation);
    }

    return bottomNavigation;

}());
