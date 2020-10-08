/* android.widget.bottomnavigation 2.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    const { NODE_RESOURCE } = squared.base.lib.constant;
    const { CONTAINER_NODE, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X } = android.lib.constant;
    const { assignEmptyValue, capitalize, iterateArray } = squared.lib.util;
    const { createThemeAttribute, createViewAttribute } = android.lib.util;
    const Resource = android.base.Resource;
    class BottomNavigation extends squared.base.ExtensionUI {
        constructor(name, framework, options) {
            super(name, framework, options);
            this.require({ name: 'android.widget.menu' /* MENU */ });
        }
        processNode(node, parent) {
            const options = createViewAttribute(this.options[node.elementId]);
            assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
            iterateArray(
                node.children,
                item => {
                    item.hide();
                    item.cascade(child => {
                        child.hide();
                    });
                },
                5
            );
            const controlName =
                node.api < 29 /* Q */ ? SUPPORT_TAGNAME.BOTTOM_NAVIGATION : SUPPORT_TAGNAME_X.BOTTOM_NAVIGATION;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude({ resource: NODE_RESOURCE.ASSET });
            node.render(parent);
            node.apply(
                Resource.formatOptions(
                    options,
                    this.application.extensionManager.valueAsBoolean(
                        'android.resource.strings' /* RESOURCE_STRINGS */,
                        'numberAsResource'
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
                const app = options.app || (options.app = {});
                assignEmptyValue(app, 'menu', `@menu/${menu}`);
                node.app('menu', app.menu);
            }
        }
        setStyleTheme() {
            const options = createThemeAttribute(this.options.resource);
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
        squared.add(bottomNavigation);
    }

    return bottomNavigation;
})();
