/* android.widget.drawer 1.5.1
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.drawer = (function () {
    'use strict';

    const $lib = squared.lib;
    const $libA = android.lib;
    const { assignEmptyValue, cloneObject, safeNestedMap, includes, iterateArray } = $lib.util;
    const { getElementAsNode } = $lib.session;
    const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
    const { createStyleAttribute, createViewAttribute } = $libA.util;
    const Resource = android.base.Resource;
    class Drawer extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.documentBase = true;
            this.require(EXT_ANDROID.EXTERNAL, true);
            this.require("android.widget.menu" /* MENU */);
            this.require("android.widget.coordinator" /* COORDINATOR */);
        }
        init(element) {
            if (this.included(element)) {
                const result = iterateArray(element.children, (item) => {
                    if (item.tagName === 'NAV') {
                        const use = item.dataset.use;
                        if (!includes(use, EXT_ANDROID.EXTERNAL)) {
                            item.dataset.use = (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL;
                        }
                    }
                });
                if (result) {
                    this.application.rootElements.add(element);
                    return true;
                }
            }
            return false;
        }
        processNode(node, parent) {
            const options = createViewAttribute(this.options.self);
            if (Drawer.findNestedElement(node.element, "android.widget.menu" /* MENU */)) {
                assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                this._setStyleTheme(node.api);
            }
            else {
                const navigationViewOptions = createViewAttribute(this.options.navigationView);
                assignEmptyValue(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
                const navView = node.item();
                navView.mergeGravity('layout_gravity', navigationViewOptions.android.layout_gravity);
                navView.setLayoutHeight('match_parent');
                navView.positioned = true;
            }
            node.documentRoot = true;
            node.renderExclude = false;
            const controlName = node.api < 29 /* Q */ ? SUPPORT_ANDROID.DRAWER : SUPPORT_ANDROID_X.DRAWER;
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
            node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
            node.render(parent);
            node.setLayoutWidth('match_parent');
            node.setLayoutHeight('match_parent');
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                },
                complete: true,
                include: true,
                remove: true
            };
        }
        afterParseDocument() {
            var _a, _b;
            for (const node of this.subscribers) {
                const element = node.element;
                const options = createViewAttribute(this.options.navigationView);
                const menu = (_a = Drawer.findNestedElement(element, "android.widget.menu" /* MENU */)) === null || _a === void 0 ? void 0 : _a.dataset.layoutName;
                const headerLayout = (_b = Drawer.findNestedElement(element, EXT_ANDROID.EXTERNAL)) === null || _b === void 0 ? void 0 : _b.dataset.layoutName;
                const app = safeNestedMap(options, 'app');
                if (menu) {
                    assignEmptyValue(app, 'menu', `@menu/${menu}`);
                }
                if (headerLayout) {
                    assignEmptyValue(app, 'headerLayout', `@layout/${headerLayout}`);
                }
                if (menu || headerLayout) {
                    const controller = this.controller;
                    assignEmptyValue(options, 'android', 'id', `@+id/${node.controlId}_navigation`);
                    assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                    assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
                    controller.addAfterInsideTemplate(node.id, controller.renderNodeStatic({
                        controlName: node.api < 29 /* Q */ ? SUPPORT_ANDROID.NAVIGATION_VIEW : SUPPORT_ANDROID_X.NAVIGATION_VIEW,
                        width: 'wrap_content',
                        height: 'match_parent'
                    }, Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'))));
                }
            }
        }
        postOptimize(node) {
            const element = Drawer.findNestedElement(node.element, "android.widget.coordinator" /* COORDINATOR */);
            if (element) {
                const coordinator = getElementAsNode(element, node.sessionId);
                if ((coordinator === null || coordinator === void 0 ? void 0 : coordinator.inlineHeight) && coordinator.some((item) => item.positioned)) {
                    coordinator.setLayoutHeight('match_parent');
                }
            }
        }
        _setStyleTheme(api) {
            const settings = this.application.userSettings;
            const options = createStyleAttribute(this.options.resource);
            assignEmptyValue(options, 'name', settings.manifestThemeName);
            assignEmptyValue(options, 'parent', settings.manifestParentThemeName);
            assignEmptyValue(options.items, 'android:windowTranslucentStatus', 'true');
            Resource.addTheme(options);
            if (api >= 21) {
                const lollipop = createStyleAttribute(cloneObject(options));
                const items = {};
                assignEmptyValue(lollipop.output, 'path', 'res/values-v21');
                assignEmptyValue(items, 'android:windowDrawsSystemBarBackgrounds', 'true');
                assignEmptyValue(items, 'android:statusBarColor', '@android:color/transparent');
                lollipop.items = items;
                Resource.addTheme(lollipop);
            }
        }
    }

    const drawer = new Drawer("android.widget.drawer" /* DRAWER */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(drawer);
    }

    return drawer;

}());
