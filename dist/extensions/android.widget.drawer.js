/* android.widget 1.2.10
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.drawer = (function () {
    'use strict';

    const { session: $session, util: $util } = squared.lib;
    const { constant: $constA, enumeration: $enumA, util: $utilA } = android.lib;
    const $Resource = android.base.Resource;
    const $e = squared.base.lib.enumeration;
    class Drawer extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.documentBase = true;
            this.require($constA.EXT_ANDROID.EXTERNAL, true);
            this.require("android.widget.menu" /* MENU */);
            this.require("android.widget.coordinator" /* COORDINATOR */);
        }
        init(element) {
            if (this.included(element)) {
                const children = element.children;
                const length = children.length;
                if (length) {
                    for (let i = 0; i < length; i++) {
                        const item = children[i];
                        if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $constA.EXT_ANDROID.EXTERNAL)) {
                            item.dataset.use = (item.dataset.use ? item.dataset.use + ', ' : '') + $constA.EXT_ANDROID.EXTERNAL;
                        }
                    }
                    this.application.rootElements.add(element);
                    return true;
                }
            }
            return false;
        }
        processNode(node, parent) {
            const options = $utilA.createViewAttribute(this.options.self);
            if (Drawer.findNestedElement(node.element, "android.widget.menu" /* MENU */)) {
                $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                this.setStyleTheme(node.localSettings.targetAPI);
            }
            else {
                const navigationViewOptions = $utilA.createViewAttribute(this.options.navigationView);
                $util.assignEmptyValue(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
                const navView = node.item();
                navView.mergeGravity('layout_gravity', navigationViewOptions.android.layout_gravity);
                navView.setLayoutHeight('match_parent');
                navView.positioned = true;
            }
            node.documentRoot = true;
            node.renderExclude = false;
            node.setControlType($constA.SUPPORT_ANDROID.DRAWER, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude($e.NODE_RESOURCE.FONT_STYLE);
            node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
            node.render(parent);
            node.setLayoutWidth('match_parent');
            node.setLayoutHeight('match_parent');
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: $constA.SUPPORT_ANDROID.DRAWER
                },
                complete: true,
                remove: true
            };
        }
        afterParseDocument() {
            for (const node of this.subscribers) {
                const options = $utilA.createViewAttribute(this.options.navigationView);
                const menu = $util.optionalAsString(Drawer.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
                const headerLayout = $util.optionalAsString(Drawer.findNestedElement(node.element, $constA.EXT_ANDROID.EXTERNAL), 'dataset.layoutName');
                if (menu !== '') {
                    $util.assignEmptyValue(options, 'app', 'menu', '@menu/' + menu);
                }
                if (headerLayout !== '') {
                    $util.assignEmptyValue(options, 'app', 'headerLayout', '@layout/' + headerLayout);
                }
                if (menu !== '' || headerLayout !== '') {
                    const controller = this.controller;
                    $util.assignEmptyValue(options, 'android', 'id', node.documentId + '_navigation');
                    $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                    $util.assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
                    controller.addAfterInsideTemplate(node.id, controller.renderNodeStatic($constA.SUPPORT_ANDROID.NAVIGATION_VIEW, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), 'wrap_content', 'match_parent'));
                }
            }
        }
        postOptimize(node) {
            const element = Drawer.findNestedElement(node.element, "android.widget.coordinator" /* COORDINATOR */);
            if (element) {
                const coordinator = $session.getElementAsNode(element, node.sessionId);
                if (coordinator && coordinator.inlineHeight && coordinator.some((item) => item.positioned)) {
                    coordinator.setLayoutHeight('match_parent');
                }
            }
        }
        setStyleTheme(api) {
            const settings = this.application.userSettings;
            const options = $utilA.createStyleAttribute(this.options.resource);
            $util.assignEmptyValue(options, 'name', settings.manifestThemeName);
            $util.assignEmptyValue(options, 'parent', settings.manifestParentThemeName);
            $util.assignEmptyValue(options.items, 'android:windowTranslucentStatus', 'true');
            $Resource.addTheme(options);
            if (api >= 21) {
                const lollipop = $utilA.createStyleAttribute($util.cloneObject(options));
                lollipop.items = {};
                $util.assignEmptyValue(lollipop.output, 'path', 'res/values-v21');
                $util.assignEmptyValue(lollipop.items, 'android:windowDrawsSystemBarBackgrounds', 'true');
                $util.assignEmptyValue(lollipop.items, 'android:statusBarColor', '@android:color/transparent');
                $Resource.addTheme(lollipop);
            }
        }
    }

    const drawer = new Drawer("android.widget.drawer" /* DRAWER */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(drawer);
    }

    return drawer;

}());
