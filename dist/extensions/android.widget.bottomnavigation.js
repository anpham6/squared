/* android.widget.bottomnavigation 1.13.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    const { assignEmptyValue, capitalize, iterateArray, safeNestedMap } = squared.lib.util;
    const { createStyleAttribute, createViewAttribute } = android.lib.util;
    const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = android.lib.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = android.lib.enumeration;
    const Resource = android.base.Resource;
    class BottomNavigation extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require('android.widget.menu' /* MENU */);
        }
        processNode(node, parent) {
            const options = createViewAttribute(this.options[node.elementId]);
            assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
            iterateArray(
                node.children,
                item => {
                    item.hide();
                    item.cascade(child => child.hide());
                },
                5
            );
            const controlName =
                node.api < 29 /* Q */ ? SUPPORT_ANDROID.BOTTOM_NAVIGATION : SUPPORT_ANDROID_X.BOTTOM_NAVIGATION;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude({ resource: NODE_RESOURCE.ASSET });
            node.render(parent);
            node.apply(
                Resource.formatOptions(
                    options,
                    this.application.extensionManager.optionValueAsBoolean(
                        EXT_ANDROID.RESOURCE_STRINGS,
                        'numberResourceValue'
                    )
                )
            );
            node.setLayoutWidth('match_parent');
            node.setLayoutHeight('wrap_content');
            node.cascade(item => this.addDescendant(item));
            this.setStyleTheme();
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName,
                },
                complete: true,
                include: true,
            };
        }
        postOptimize(node) {
            var _a;
            const renderParent = node.renderParent;
            if (renderParent.documentRoot) {
                if (renderParent.inlineWidth) {
                    renderParent.setLayoutWidth('match_parent');
                }
                if (renderParent.inlineHeight) {
                    renderParent.setLayoutHeight('match_parent');
                }
            }
            const menu =
                (_a = BottomNavigation.findNestedElement(node, 'android.widget.menu' /* MENU */)) === null ||
                _a === void 0
                    ? void 0
                    : _a.dataset['layoutName' + capitalize(this.application.systemName)];
            if (menu) {
                const options = createViewAttribute(this.options[node.elementId]);
                const app = safeNestedMap(options, 'app');
                assignEmptyValue(app, 'menu', `@menu/${menu}`);
                node.app('menu', app.menu);
            }
        }
        setStyleTheme() {
            const options = createStyleAttribute(this.options.resource);
            assignEmptyValue(options, 'name', this.application.userSettings.manifestThemeName);
            assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
            Resource.addTheme(options);
        }
    }

    const bottomNavigation = new BottomNavigation(
        'android.widget.bottomnavigation' /* BOTTOM_NAVIGATION */,
        2 /* ANDROID */
    );
    if (squared) {
        squared.include(bottomNavigation);
    }

    return bottomNavigation;
})();
