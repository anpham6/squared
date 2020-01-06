/* android.widget.toolbar 1.3.7
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.toolbar = (function () {
    'use strict';

    const $lib = squared.lib;
    const { formatPX } = $lib.css;
    const { getElementAsNode } = $lib.session;
    const { assignEmptyValue, includes, isString, optionalAsString } = $lib.util;
    const { NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const $libA = android.lib;
    const { CONTAINER_ANDROID, EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
    const { createStyleAttribute, createViewAttribute, getDocumentId } = $libA.util;
    const { Resource } = android.base;
    const PREFIX_MENU = 'ic_menu_';
    class Toolbar extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require("android.widget.menu" /* MENU */);
        }
        init(element) {
            if (this.included(element)) {
                const children = element.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item.tagName === 'NAV') {
                        const use = item.dataset.use;
                        if (!includes(use, EXT_ANDROID.EXTERNAL)) {
                            item.dataset.use = (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL;
                            break;
                        }
                    }
                }
                const target = element.dataset.target;
                if (target) {
                    const targetElement = document.getElementById(target);
                    if (targetElement && element.parentElement !== targetElement && !includes(targetElement.dataset.use, "android.widget.coordinator" /* COORDINATOR */)) {
                        this.application.rootElements.add(element);
                    }
                }
            }
            return false;
        }
        processNode(node, parent) {
            const application = this.application;
            const resource = this.resource;
            const settings = application.userSettings;
            const element = node.element;
            const target = node.dataset.target;
            const options = Object.assign({}, this.options[element.id]);
            const toolbarOptions = createViewAttribute(options.self);
            const appBarOptions = createViewAttribute(options.appBar);
            const collapsingToolbarOptions = createViewAttribute(options.collapsingToolbar);
            const numberResourceValue = application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            const hasMenu = Toolbar.findNestedElement(element, "android.widget.menu" /* MENU */);
            const backgroundImage = node.has('backgroundImage');
            const appBarChildren = [];
            const collapsingToolbarChildren = [];
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                const dataset = item.dataset;
                if (item.tagName === 'IMG') {
                    if (dataset.navigationIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            assignEmptyValue(toolbarOptions, 'app', 'navigationIcon', '@drawable/' + src);
                        }
                    }
                    if (dataset.collapseIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            assignEmptyValue(toolbarOptions, 'app', 'collapseIcon', '@drawable/' + src);
                        }
                    }
                }
                if (!dataset.target) {
                    const targetNode = getElementAsNode(item, node.sessionId);
                    if (targetNode) {
                        switch (dataset.targetModule) {
                            case 'appBar':
                                appBarChildren.push(targetNode);
                                break;
                            case 'collapsingToolbar':
                                collapsingToolbarChildren.push(targetNode);
                                break;
                        }
                    }
                }
            }
            const hasCollapsingToolbar = 'collapsingToolbar' in options || collapsingToolbarChildren.length > 0;
            const hasAppBar = 'appBar' in options || appBarChildren.length > 0 || hasCollapsingToolbar;
            let appBarOverlay = '';
            let popupOverlay = '';
            if (hasCollapsingToolbar) {
                assignEmptyValue(toolbarOptions, 'app', 'layout_collapseMode', 'pin');
            }
            else {
                assignEmptyValue(toolbarOptions, 'app', 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
                if (!backgroundImage) {
                    assignEmptyValue(toolbarOptions, 'app', 'layout_scrollFlags', 'scroll|enterAlways');
                }
            }
            if (hasAppBar) {
                if (hasMenu) {
                    const app = toolbarOptions.app;
                    const popupTheme = app.popupTheme;
                    if (popupTheme) {
                        popupOverlay = popupTheme.replace('@style/', '');
                    }
                    app.popupTheme = '@style/' + settings.manifestThemeName + '.PopupOverlay';
                }
            }
            else {
                node.exclude(0, NODE_PROCEDURE.LAYOUT);
                assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
            }
            assignEmptyValue(toolbarOptions, 'android', 'layout_height', hasAppBar || !node.hasPX('height') ? '?android:attr/actionBarSize' : '');
            let controlName;
            let appBarName;
            let collapsingToolbarName;
            if (node.localSettings.targetAPI < 29 /* Q */) {
                controlName = SUPPORT_ANDROID.TOOLBAR;
                appBarName = SUPPORT_ANDROID.APPBAR;
                collapsingToolbarName = SUPPORT_ANDROID.COLLAPSING_TOOLBAR;
            }
            else {
                controlName = SUPPORT_ANDROID_X.TOOLBAR;
                appBarName = SUPPORT_ANDROID_X.APPBAR;
                collapsingToolbarName = SUPPORT_ANDROID_X.COLLAPSING_TOOLBAR;
            }
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude(NODE_RESOURCE.FONT_STYLE);
            let appBarNode;
            let collapsingToolbarNode;
            if (hasAppBar) {
                let android = appBarOptions.android;
                assignEmptyValue(appBarOptions, 'android', 'id', node.documentId.replace('@', '@+') + '_appbar');
                assignEmptyValue(appBarOptions, 'android', 'layout_height', node.hasHeight ? formatPX(node.actualHeight) : 'wrap_content');
                assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
                if (hasMenu) {
                    if (android.theme) {
                        appBarOverlay = android.theme;
                    }
                    android.theme = '@style/' + settings.manifestThemeName + '.AppBarOverlay';
                    node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData', { appBarOverlay, popupOverlay });
                }
                else {
                    assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
                }
                appBarNode = this.createPlaceholder(node, appBarChildren, target);
                appBarNode.parent = parent;
                let id = android.id;
                if (isString(id)) {
                    appBarNode.controlId = getDocumentId(id);
                    delete android.id;
                }
                appBarNode.setControlType(appBarName, CONTAINER_NODE.BLOCK);
                if (hasCollapsingToolbar) {
                    assignEmptyValue(collapsingToolbarOptions, 'android', 'id', node.documentId.replace('@', '@+') + '_collapsingtoolbar');
                    assignEmptyValue(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                    if (!backgroundImage) {
                        assignEmptyValue(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                    }
                    assignEmptyValue(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                    assignEmptyValue(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
                    collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren, target);
                    if (collapsingToolbarNode) {
                        collapsingToolbarNode.parent = appBarNode;
                        android = collapsingToolbarOptions.android;
                        id = android.id;
                        if (id) {
                            appBarNode.controlId = getDocumentId(id);
                            delete android.id;
                        }
                        collapsingToolbarNode.setControlType(collapsingToolbarName, CONTAINER_NODE.BLOCK);
                        collapsingToolbarNode.each(item => item.dataset.target = collapsingToolbarNode.controlId);
                    }
                }
            }
            let outputAs;
            if (appBarNode) {
                appBarNode.setLayoutWidth('match_parent');
                appBarNode.setLayoutHeight('wrap_content');
                appBarNode.apply(Resource.formatOptions(appBarOptions, numberResourceValue));
                appBarNode.render(target ? application.resolveTarget(target) : parent);
                outputAs = {
                    type: 1 /* XML */,
                    node: appBarNode,
                    controlName: appBarName
                };
                if (collapsingToolbarNode) {
                    node.parent = collapsingToolbarNode;
                    collapsingToolbarNode.apply(Resource.formatOptions(collapsingToolbarOptions, numberResourceValue));
                    collapsingToolbarNode.render(appBarNode);
                    collapsingToolbarNode.setLayoutWidth('match_parent');
                    collapsingToolbarNode.setLayoutHeight('match_parent');
                    application.addLayoutTemplate((collapsingToolbarNode.renderParent || parent), collapsingToolbarNode, {
                        type: 1 /* XML */,
                        node: collapsingToolbarNode,
                        controlName: collapsingToolbarName
                    });
                    if (backgroundImage) {
                        const src = resource.addImageSrc(node.backgroundImage);
                        if (src !== '') {
                            const controller = this.controller;
                            const backgroundImageOptions = createViewAttribute(options.backgroundImage);
                            let scaleType;
                            switch (node.css('backgroundSize')) {
                                case 'cover':
                                case '100% auto':
                                case 'auto 100%':
                                    scaleType = 'centerCrop';
                                    break;
                                case 'contain':
                                case '100% 100%':
                                    scaleType = 'fitXY';
                                    break;
                                case 'auto':
                                    scaleType = 'matrix';
                                    break;
                                default:
                                    scaleType = 'center';
                                    break;
                            }
                            assignEmptyValue(backgroundImageOptions, 'android', 'id', node.documentId.replace('@', '@+') + '_image');
                            assignEmptyValue(backgroundImageOptions, 'android', 'src', '@drawable/' + src);
                            assignEmptyValue(backgroundImageOptions, 'android', 'scaleType', scaleType);
                            assignEmptyValue(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                            assignEmptyValue(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
                            controller.addBeforeOutsideTemplate(node.id, controller.renderNodeStatic(CONTAINER_ANDROID.IMAGE, Resource.formatOptions(backgroundImageOptions, numberResourceValue), 'match_parent', 'match_parent'));
                            node.setCacheValue('backgroundImage', '');
                        }
                    }
                }
                else {
                    node.parent = appBarNode;
                    if (backgroundImage) {
                        node.data("android.widget.toolbar" /* TOOLBAR */, 'background', appBarNode);
                    }
                }
                node.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent', appBarNode.android('id') || appBarNode.documentId);
                node.render(node.parent);
            }
            else {
                node.render(target ? application.resolveTarget(target) : parent);
            }
            node.setLayoutWidth('match_parent');
            node.apply(Resource.formatOptions(toolbarOptions, numberResourceValue));
            const output = {
                type: 1 /* XML */,
                node,
                controlName
            };
            if (appBarNode) {
                return {
                    output,
                    outerParent: node.parent,
                    renderAs: appBarNode,
                    outputAs
                };
            }
            else {
                return { output };
            }
        }
        processChild(node) {
            if (node.imageElement && (node.dataset.navigationIcon || node.dataset.collapseIcon)) {
                node.hide();
                return { next: true };
            }
            return undefined;
        }
        postOptimize(node) {
            var _a;
            const menu = optionalAsString(Toolbar.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const toolbarOptions = createViewAttribute((_a = this.options[node.elementId]) === null || _a === void 0 ? void 0 : _a.self);
                assignEmptyValue(toolbarOptions, 'app', 'menu', '@menu/' + menu);
                node.app('menu', toolbarOptions.app.menu);
            }
            const themeData = node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData');
            if (themeData) {
                const settings = this.application.userSettings;
                const options = createStyleAttribute(this.options.resource);
                const optionsActionBar = createStyleAttribute({ name: '.NoActionBar', output: options.output });
                const optionsAppBar = createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
                const optionsPopup = createStyleAttribute({ name: '.PopupOverlay', output: options.output });
                const optionsActionBarItems = optionsActionBar.items;
                assignEmptyValue(options, 'name', settings.manifestThemeName);
                assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
                assignEmptyValue(optionsActionBarItems, 'windowActionBar', 'false');
                assignEmptyValue(optionsActionBarItems, 'windowNoTitle', 'true');
                assignEmptyValue(optionsAppBar, 'parent', themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
                assignEmptyValue(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
                Resource.addTheme(options, optionsActionBar, optionsAppBar, optionsPopup);
            }
            const appBar = node.data("android.widget.toolbar" /* TOOLBAR */, 'background');
            if (appBar) {
                const background = node.android('background');
                if (background !== '') {
                    appBar.android('background', background);
                    node.delete('android', 'background');
                }
            }
        }
        createPlaceholder(node, children, target) {
            const placeholder = this.application.createNode(undefined, true, node, children);
            if (children.length) {
                let containerIndex = Number.POSITIVE_INFINITY;
                for (const item of children) {
                    containerIndex = Math.min(containerIndex, item.containerIndex);
                }
                placeholder.containerIndex = containerIndex;
            }
            if (target) {
                placeholder.dataset.target = target;
            }
            placeholder.inherit(node, 'base');
            placeholder.exclude(NODE_RESOURCE.ALL);
            placeholder.positioned = true;
            placeholder.renderExclude = false;
            return placeholder;
        }
    }

    const toolbar = new Toolbar("android.widget.toolbar" /* TOOLBAR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(toolbar);
    }

    return toolbar;

}());
