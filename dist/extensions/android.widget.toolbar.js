/* android.widget.toolbar 1.13.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.toolbar = (function () {
    'use strict';

    const { formatPX } = squared.lib.css;
    const { getElementAsNode } = squared.lib.session;
    const { assignEmptyValue, capitalize, includes, iterateArray, safeNestedMap } = squared.lib.util;
    const { createStyleAttribute, createViewAttribute, getDocumentId } = android.lib.util;
    const { NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const { CONTAINER_ANDROID, EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = android.lib.constant;
    const { BUILD_ANDROID, CONTAINER_NODE } = android.lib.enumeration;
    const Resource = android.base.Resource;
    const PREFIX_MENU = 'ic_menu_';
    class Toolbar extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require('android.widget.menu' /* MENU */);
        }
        init(element, sessionId) {
            var _a;
            if (this.included(element)) {
                const application = this.application;
                iterateArray(element.children, item => {
                    if (item.tagName === 'NAV') {
                        const use = application.getDatasetName('use', item);
                        if (!includes(use, EXT_ANDROID.EXTERNAL)) {
                            application.setDatasetName('use', item, (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL);
                            return true;
                        }
                    }
                    return;
                });
                const target = element.dataset.androidTarget;
                if (target) {
                    const targetElement = document.getElementById(target);
                    if (
                        targetElement &&
                        !includes(
                            application.getDatasetName('use', targetElement),
                            'android.widget.coordinator' /* COORDINATOR */
                        )
                    ) {
                        (_a = application.getProcessing(sessionId)) === null || _a === void 0
                            ? void 0
                            : _a.rootElements.add(element);
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
            const options = Object.assign({}, this.options[element.id.trim()]);
            const toolbarOptions = createViewAttribute(options.self);
            const appBarOptions = createViewAttribute(options.appBar);
            const collapsingToolbarOptions = createViewAttribute(options.collapsingToolbar);
            const numberResourceValue = application.extensionManager.optionValueAsBoolean(
                EXT_ANDROID.RESOURCE_STRINGS,
                'numberResourceValue'
            );
            const hasMenu = Toolbar.findNestedElement(node, 'android.widget.menu' /* MENU */);
            const backgroundImage = node.has('backgroundImage');
            const appBarChildren = [];
            const collapsingToolbarChildren = [];
            let app = safeNestedMap(toolbarOptions, 'app');
            iterateArray(element.children, item => {
                const dataset = item.dataset;
                if (item.tagName === 'IMG') {
                    if (dataset.navigationIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            assignEmptyValue(app, 'navigationIcon', `@drawable/${src}`);
                        }
                    }
                    if (dataset.collapseIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            assignEmptyValue(app, 'collapseIcon', `@drawable/${src}`);
                        }
                    }
                }
                if (!dataset.androidTarget) {
                    const targetNode = getElementAsNode(item, node.sessionId);
                    if (targetNode) {
                        switch (dataset.androidTargetModule) {
                            case 'appBar':
                                appBarChildren.push(targetNode);
                                break;
                            case 'collapsingToolbar':
                                collapsingToolbarChildren.push(targetNode);
                                break;
                        }
                    }
                }
            });
            const [controlName, appBarName, collapsingToolbarName] =
                node.api < 29 /* Q */
                    ? [SUPPORT_ANDROID.TOOLBAR, SUPPORT_ANDROID.APPBAR, SUPPORT_ANDROID.COLLAPSING_TOOLBAR]
                    : [SUPPORT_ANDROID_X.TOOLBAR, SUPPORT_ANDROID_X.APPBAR, SUPPORT_ANDROID_X.COLLAPSING_TOOLBAR];
            const hasCollapsingToolbar = 'collapsingToolbar' in options || collapsingToolbarChildren.length > 0;
            const hasAppBar = 'appBar' in options || appBarChildren.length > 0 || hasCollapsingToolbar;
            let appBarOverlay = '',
                popupOverlay = '',
                appBarNode,
                collapsingToolbarNode,
                outputAs;
            if (hasCollapsingToolbar) {
                assignEmptyValue(app, 'layout_collapseMode', 'pin');
            } else {
                assignEmptyValue(app, 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
                if (!backgroundImage) {
                    assignEmptyValue(app, 'layout_scrollFlags', 'scroll|enterAlways');
                }
            }
            if (hasAppBar) {
                if (hasMenu) {
                    const popupTheme = app.popupTheme;
                    if (popupTheme) {
                        popupOverlay = popupTheme.replace('@style/', '');
                    }
                    app.popupTheme = `@style/${settings.manifestThemeName}.PopupOverlay`;
                }
            } else {
                node.exclude({ procedure: NODE_PROCEDURE.LAYOUT });
                assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
            }
            assignEmptyValue(
                toolbarOptions,
                'android',
                'layout_height',
                hasAppBar || !node.hasPX('height') ? '?android:attr/actionBarSize' : ''
            );
            node.setControlType(controlName, CONTAINER_NODE.BLOCK);
            node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
            if (hasAppBar) {
                let android = appBarOptions.android;
                assignEmptyValue(appBarOptions, 'android', 'id', `@+id/${node.controlId}_appbar`);
                assignEmptyValue(
                    appBarOptions,
                    'android',
                    'layout_height',
                    node.hasHeight ? formatPX(node.actualHeight) : 'wrap_content'
                );
                assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
                if (hasMenu) {
                    if (android.theme) {
                        appBarOverlay = android.theme;
                    }
                    android.theme = `@style/${settings.manifestThemeName}.AppBarOverlay`;
                    node.data('android.widget.toolbar' /* TOOLBAR */, 'themeData', { appBarOverlay, popupOverlay });
                } else {
                    assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
                }
                appBarNode = this.createPlaceholder(node, appBarChildren, node.target);
                appBarNode.parent = parent;
                let id = android.id;
                if (id) {
                    appBarNode.controlId = getDocumentId(id);
                    delete android.id;
                }
                appBarNode.setControlType(appBarName, CONTAINER_NODE.BLOCK);
                if (hasCollapsingToolbar) {
                    app = safeNestedMap(collapsingToolbarOptions, 'app');
                    assignEmptyValue(
                        collapsingToolbarOptions,
                        'android',
                        'id',
                        `@+id/${node.controlId}_collapsingtoolbar`
                    );
                    assignEmptyValue(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                    if (!backgroundImage) {
                        assignEmptyValue(app, 'contentScrim', '?attr/colorPrimary');
                    }
                    assignEmptyValue(app, 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                    assignEmptyValue(app, 'toolbarId', node.documentId);
                    collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren);
                    if (collapsingToolbarNode) {
                        collapsingToolbarNode.parent = appBarNode;
                        android = collapsingToolbarOptions.android;
                        id = android.id;
                        if (id) {
                            appBarNode.controlId = getDocumentId(id);
                            delete android.id;
                        }
                        collapsingToolbarNode.setControlType(collapsingToolbarName, CONTAINER_NODE.BLOCK);
                    }
                }
            }
            if (appBarNode) {
                appBarNode.setLayoutWidth('match_parent');
                appBarNode.setLayoutHeight('wrap_content');
                appBarNode.apply(Resource.formatOptions(appBarOptions, numberResourceValue));
                appBarNode.render(parent);
                outputAs = {
                    type: 1 /* XML */,
                    node: appBarNode,
                    controlName: appBarName,
                };
                if (collapsingToolbarNode) {
                    node.parent = collapsingToolbarNode;
                    collapsingToolbarNode.apply(Resource.formatOptions(collapsingToolbarOptions, numberResourceValue));
                    collapsingToolbarNode.render(appBarNode);
                    collapsingToolbarNode.setLayoutWidth('match_parent');
                    collapsingToolbarNode.setLayoutHeight('match_parent');
                    application.addLayoutTemplate(collapsingToolbarNode.renderParent, collapsingToolbarNode, {
                        type: 1 /* XML */,
                        node: collapsingToolbarNode,
                        controlName: collapsingToolbarName,
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
                                case '100%':
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
                            app = safeNestedMap(backgroundImageOptions, 'app');
                            assignEmptyValue(backgroundImageOptions, 'android', 'id', `@+id/${node.controlId}_image`);
                            assignEmptyValue(backgroundImageOptions, 'android', 'src', `@drawable/${src}`);
                            assignEmptyValue(backgroundImageOptions, 'android', 'scaleType', scaleType);
                            assignEmptyValue(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                            assignEmptyValue(app, 'layout_collapseMode', 'parallax');
                            controller.addBeforeOutsideTemplate(
                                node.id,
                                controller.renderNodeStatic(
                                    {
                                        controlName: CONTAINER_ANDROID.IMAGE,
                                        width: 'match_parent',
                                        height: 'match_parent',
                                    },
                                    Resource.formatOptions(backgroundImageOptions, numberResourceValue)
                                )
                            );
                            node.setCacheValue('backgroundImage', '');
                        }
                    }
                } else {
                    node.parent = appBarNode;
                    if (backgroundImage) {
                        node.data('android.widget.toolbar' /* TOOLBAR */, 'background', appBarNode);
                    }
                }
                node.data(
                    'android.widget.toolbar' /* TOOLBAR */,
                    'outerParent',
                    appBarNode.android('id') || appBarNode.documentId
                );
                node.render(node.parent);
            } else {
                node.render(parent);
            }
            node.setLayoutWidth('match_parent');
            node.apply(Resource.formatOptions(toolbarOptions, numberResourceValue));
            const output = {
                type: 1 /* XML */,
                node,
                controlName,
            };
            if (appBarNode) {
                return {
                    output,
                    outerParent: node.parent,
                    renderAs: appBarNode,
                    outputAs,
                    include: true,
                };
            } else {
                return {
                    output,
                    include: true,
                };
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
            var _a, _b;
            const menu =
                (_a = Toolbar.findNestedElement(node, 'android.widget.menu' /* MENU */)) === null || _a === void 0
                    ? void 0
                    : _a.dataset['layoutName' + capitalize(this.application.systemName)];
            if (menu) {
                const toolbarOptions = createViewAttribute(
                    (_b = this.options[node.elementId]) === null || _b === void 0 ? void 0 : _b.self
                );
                const app = safeNestedMap(toolbarOptions, 'app');
                assignEmptyValue(app, 'menu', `@menu/${menu}`);
                node.app('menu', app.menu);
            }
            const themeData = node.data('android.widget.toolbar' /* TOOLBAR */, 'themeData');
            if (themeData) {
                const options = createStyleAttribute(this.options.resource);
                const optionsActionBar = createStyleAttribute({ name: '.NoActionBar', output: options.output });
                const optionsAppBar = createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
                const optionsPopup = createStyleAttribute({ name: '.PopupOverlay', output: options.output });
                assignEmptyValue(options, 'name', this.application.userSettings.manifestThemeName);
                assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
                assignEmptyValue(optionsActionBar.items, 'windowActionBar', 'false');
                assignEmptyValue(optionsActionBar.items, 'windowNoTitle', 'true');
                assignEmptyValue(
                    optionsAppBar,
                    'parent',
                    themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar'
                );
                assignEmptyValue(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
                Resource.addTheme(options);
                Resource.addTheme(optionsActionBar);
                Resource.addTheme(optionsAppBar);
                Resource.addTheme(optionsPopup);
            }
            const appBar = node.data('android.widget.toolbar' /* TOOLBAR */, 'background');
            if (appBar) {
                const background = node.android('background');
                if (background !== '') {
                    appBar.android('background', background);
                    node.delete('android', 'background');
                }
            }
        }
        createPlaceholder(node, children, target) {
            const delegate = children.length > 0;
            const container = this.application.createNode(node.sessionId, {
                parent: node,
                children,
                delegate,
                cascade: true,
            });
            container.inherit(node, 'base');
            if (delegate) {
                let containerIndex = Infinity;
                let i = 0;
                while (i < children.length) {
                    containerIndex = Math.min(containerIndex, children[i++].containerIndex);
                }
                container.containerIndex = containerIndex;
            }
            if (target) {
                container.dataset.androidTarget = target.id;
                container.innerWrapped = node;
            }
            container.exclude({ resource: NODE_RESOURCE.ALL });
            container.positioned = true;
            container.renderExclude = false;
            return container;
        }
    }

    const toolbar = new Toolbar('android.widget.toolbar' /* TOOLBAR */, 2 /* ANDROID */);
    if (squared) {
        squared.include(toolbar);
    }

    return toolbar;
})();
