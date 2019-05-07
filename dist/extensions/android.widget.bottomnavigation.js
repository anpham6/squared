/* android.widget 0.9.6
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    class BottomNavigation extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        processNode(node, parent) {
            const options = $utilA.createViewAttribute(this.options[node.elementId]);
            $util.assignEmptyValue(options, 'android', 'background', `?android:attr/windowBackground`);
            for (let i = 5; i < node.length; i++) {
                const item = node.children[i];
                item.hide();
                for (const child of item.cascade()) {
                    child.hide();
                }
            }
            node.setControlType($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
            node.android('layout_width', 'match_parent');
            node.android('layout_height', 'wrap_content');
            for (const item of node.cascade()) {
                this.addDescendant(item);
            }
            this.setStyleTheme();
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: $constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION
                },
                complete: true
            };
        }
        postBaseLayout(node) {
            const renderParent = node.renderParent;
            if (renderParent) {
                if (!renderParent.has('width')) {
                    renderParent.android('layout_width', 'match_parent');
                }
                if (!renderParent.has('height')) {
                    renderParent.android('layout_height', 'match_parent');
                }
            }
            const menu = $util.optionalAsString(BottomNavigation.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const options = $utilA.createViewAttribute(this.options[node.elementId]);
                $util.assignEmptyValue(options, 'app', 'menu', `@menu/${menu}`);
                node.app('menu', options.app.menu);
            }
        }
        setStyleTheme() {
            const options = $utilA.createStyleAttribute(this.options.resource);
            $util.assignEmptyValue(options, 'name', this.application.userSettings.manifestThemeName);
            $util.assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
            $Resource.addTheme(options);
        }
    }

    const bottomNavigation = new BottomNavigation("android.widget.bottomnavigation" /* BOTTOM_NAVIGATION */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(bottomNavigation);
    }

    return bottomNavigation;

}());
