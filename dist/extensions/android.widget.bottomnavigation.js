/* android.widget 0.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    const template = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<resources>',
        '	<style name="{&appTheme}" parent="{~parentTheme}">',
        '!items',
        '		<item name="{&name}">{&value}</item>',
        '!items',
        '	</style>',
        '</resources>'
    ];
    var EXTENSION_GENERIC_TMPL = template.join('\n');

    var $enum = squared.base.lib.enumeration;
    var $util = squared.lib.util;
    var $Resource = android.base.Resource;
    var $const_android = android.lib.constant;
    var $enum_android = android.lib.enumeration;
    var $util_android = android.lib.util;
    class BottomNavigation extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        processNode(node, parent) {
            const options = $util_android.createAttribute(this.options[node.element.id]);
            $util.defaultWhenNull(options, 'android', 'background', `?android:attr/windowBackground`);
            for (let i = 5; i < node.length; i++) {
                const item = node.item(i);
                item.hide();
                item.cascade().forEach(child => child.hide());
            }
            node.setControlType($const_android.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enum_android.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            const output = this.application.controllerHandler.renderNodeStatic($const_android.SUPPORT_ANDROID.BOTTOM_NAVIGATION, node.renderDepth, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), 'match_parent', 'wrap_content', node);
            node.cascade().forEach(item => this.subscribersChild.add(item));
            this.setStyleTheme();
            return { output, complete: true };
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
            const menu = $util.optionalAsString(BottomNavigation.findNestedByName(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const options = $util_android.createAttribute(this.options[node.element.id]);
                $util.defaultWhenNull(options, 'app', 'menu', `@menu/${menu}`);
                node.app('menu', options.app.menu);
            }
        }
        setStyleTheme() {
            if (this.application.resourceHandler.fileHandler) {
                const options = Object.assign({}, this.options.resource);
                $util.defaultWhenNull(options, 'appTheme', $util_android.getAppTheme(this.application.resourceHandler.fileHandler.assets) || 'AppTheme');
                $util.defaultWhenNull(options, 'parentTheme', 'Theme.AppCompat.Light.DarkActionBar');
                const data = {
                    'appTheme': options.appTheme,
                    'parentTheme': options.parentTheme,
                    'items': []
                };
                $util.defaultWhenNull(options, 'output', 'path', 'res/values');
                $util.defaultWhenNull(options, 'output', 'file', `${"android.widget.bottomnavigation" /* BOTTOM_NAVIGATION */}.xml`);
                this.application.resourceHandler.addStyleTheme(EXTENSION_GENERIC_TMPL, data, options);
            }
        }
    }

    const bottomNavigation = new BottomNavigation("android.widget.bottomnavigation" /* BOTTOM_NAVIGATION */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(bottomNavigation);
    }

    return bottomNavigation;

}());
