/* android.widget 1.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.toolbar = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $const = squared.lib.constant;
    const $css = squared.lib.css;
    const $session = squared.lib.session;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    const $c = squared.base.lib.constant;
    const $e = squared.base.lib.enumeration;
    const PREFIX_MENU = 'ic_menu_';
    class Toolbar extends squared.base.ExtensionUI {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        init(element) {
            if (this.included(element)) {
                const children = element.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $c.EXT_NAME.EXTERNAL)) {
                        item.dataset.use = (item.dataset.use ? `${item.dataset.use}, ` : '') + $c.EXT_NAME.EXTERNAL;
                        break;
                    }
                }
                if (element.dataset.target) {
                    const target = document.getElementById(element.dataset.target);
                    if (target && element.parentElement !== target && !$util.includes(target.dataset.use, "android.widget.coordinator" /* COORDINATOR */)) {
                        this.application.rootElements.add(element);
                    }
                }
            }
            return false;
        }
        processNode(node, parent) {
            const application = this.application;
            const controller = application.controllerHandler;
            const resource = this.application.resourceHandler;
            const settings = application.userSettings;
            const element = node.element;
            const target = node.dataset.target;
            const options = Object.assign({}, this.options[element.id]);
            const toolbarOptions = $utilA.createViewAttribute(options.self);
            const appBarOptions = $utilA.createViewAttribute(options.appBar);
            const collapsingToolbarOptions = $utilA.createViewAttribute(options.collapsingToolbar);
            const numberResourceValue = application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            const hasMenu = Toolbar.findNestedElement(element, "android.widget.menu" /* MENU */);
            const backgroundImage = node.has('backgroundImage');
            const appBarChildren = [];
            const collapsingToolbarChildren = [];
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (item.tagName === 'IMG') {
                    if (item.dataset.navigationIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'navigationIcon', `@drawable/${src}`);
                        }
                    }
                    if (item.dataset.collapseIcon) {
                        const src = resource.addImageSrc(item, PREFIX_MENU);
                        if (src !== '') {
                            $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'collapseIcon', `@drawable/${src}`);
                        }
                    }
                }
                if (!item.dataset.target) {
                    const targetNode = $session.getElementAsNode(item, node.sessionId);
                    if (targetNode) {
                        switch (item.dataset.targetModule) {
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
                $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'layout_collapseMode', 'pin');
            }
            else {
                $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
                if (backgroundImage) {
                    const drawable = this.application.resourceHandler.addImageSrc(node.backgroundImage);
                    if (drawable !== '') {
                        $util.assignEmptyValue(hasAppBar ? appBarOptions : toolbarOptions, $constA.STRING_ANDROID.ANDROID, 'background', `@drawable/${drawable}`);
                        node.exclude($e.NODE_RESOURCE.IMAGE_SOURCE);
                    }
                }
                else {
                    $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'layout_scrollFlags', 'scroll|enterAlways');
                }
            }
            if (hasAppBar) {
                if (hasMenu) {
                    if (toolbarOptions.app.popupTheme) {
                        popupOverlay = toolbarOptions.app.popupTheme.replace('@style/', '');
                    }
                    toolbarOptions.app.popupTheme = `@style/${settings.manifestThemeName}.PopupOverlay`;
                }
            }
            else {
                node.exclude(0, $e.NODE_PROCEDURE.LAYOUT);
                $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
            }
            $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.ANDROID, 'layout_height', hasAppBar || !node.hasPX($const.CSS.HEIGHT) ? '?android:attr/actionBarSize' : '');
            node.setControlType($constA.SUPPORT_ANDROID.TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude($e.NODE_RESOURCE.FONT_STYLE);
            let appBarNode;
            let collapsingToolbarNode;
            if (hasAppBar) {
                $util.assignEmptyValue(appBarOptions, $constA.STRING_ANDROID.ANDROID, 'id', `${node.documentId}_appbar`);
                $util.assignEmptyValue(appBarOptions, $constA.STRING_ANDROID.ANDROID, 'layout_height', node.hasHeight ? $css.formatPX(node.actualHeight) : $constA.STRING_ANDROID.WRAP_CONTENT);
                $util.assignEmptyValue(appBarOptions, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
                if (hasMenu) {
                    if (appBarOptions.android.theme) {
                        appBarOverlay = appBarOptions.android.theme;
                    }
                    appBarOptions.android.theme = `@style/${settings.manifestThemeName}.AppBarOverlay`;
                    node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData', { appBarOverlay, popupOverlay });
                }
                else {
                    $util.assignEmptyValue(appBarOptions, $constA.STRING_ANDROID.ANDROID, 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
                }
                appBarNode = this.createPlaceholder(node, appBarChildren, target);
                appBarNode.parent = parent;
                if (appBarOptions.android.id) {
                    appBarNode.controlId = $utilA.getDocumentId(appBarOptions.android.id);
                }
                appBarNode.setControlType($constA.SUPPORT_ANDROID.APPBAR, $enumA.CONTAINER_NODE.BLOCK);
                if (hasCollapsingToolbar) {
                    $util.assignEmptyValue(collapsingToolbarOptions, $constA.STRING_ANDROID.ANDROID, 'id', `${node.documentId}_collapsingtoolbar`);
                    $util.assignEmptyValue(collapsingToolbarOptions, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
                    if (!backgroundImage) {
                        $util.assignEmptyValue(collapsingToolbarOptions, $constA.STRING_ANDROID.APP, 'contentScrim', '?attr/colorPrimary');
                    }
                    $util.assignEmptyValue(collapsingToolbarOptions, $constA.STRING_ANDROID.APP, 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                    $util.assignEmptyValue(collapsingToolbarOptions, $constA.STRING_ANDROID.APP, 'toolbarId', node.documentId);
                    collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren, target);
                    if (collapsingToolbarNode) {
                        collapsingToolbarNode.parent = appBarNode;
                        if (collapsingToolbarOptions.android.id) {
                            appBarNode.controlId = $utilA.getDocumentId(collapsingToolbarOptions.android.id);
                        }
                        collapsingToolbarNode.setControlType($constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
                        collapsingToolbarNode.each(item => item.dataset.target = collapsingToolbarNode.controlId);
                    }
                }
            }
            let outputAs;
            if (appBarNode) {
                appBarNode.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
                appBarNode.setLayoutHeight($constA.STRING_ANDROID.WRAP_CONTENT);
                appBarNode.apply($Resource.formatOptions(appBarOptions, numberResourceValue));
                appBarNode.render(target ? application.resolveTarget(target) : parent);
                outputAs = {
                    type: 1 /* XML */,
                    node: appBarNode,
                    controlName: $constA.SUPPORT_ANDROID.APPBAR
                };
                if (collapsingToolbarNode) {
                    node.parent = collapsingToolbarNode;
                    collapsingToolbarNode.apply($Resource.formatOptions(collapsingToolbarOptions, numberResourceValue));
                    collapsingToolbarNode.render(appBarNode);
                    collapsingToolbarNode.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
                    collapsingToolbarNode.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT);
                    application.addLayoutTemplate((collapsingToolbarNode.renderParent || parent), collapsingToolbarNode, {
                        type: 1 /* XML */,
                        node: collapsingToolbarNode,
                        controlName: $constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR
                    });
                }
                else {
                    node.parent = appBarNode;
                }
                node.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent', appBarNode.android('id') || appBarNode.documentId);
                node.render(node.parent);
            }
            else {
                node.render(target ? application.resolveTarget(target) : parent);
            }
            if (backgroundImage && hasCollapsingToolbar) {
                const src = this.application.resourceHandler.addImageSrc(node.backgroundImage);
                if (src !== '') {
                    const backgroundImageOptions = $utilA.createViewAttribute(options.backgroundImage);
                    let scaleType = $const.CSS.CENTER;
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
                    }
                    $util.assignEmptyValue(backgroundImageOptions, $constA.STRING_ANDROID.ANDROID, 'id', `${node.documentId}_image`);
                    $util.assignEmptyValue(backgroundImageOptions, $constA.STRING_ANDROID.ANDROID, 'src', `@drawable/${src}`);
                    $util.assignEmptyValue(backgroundImageOptions, $constA.STRING_ANDROID.ANDROID, 'scaleType', scaleType);
                    $util.assignEmptyValue(backgroundImageOptions, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
                    $util.assignEmptyValue(backgroundImageOptions, $constA.STRING_ANDROID.APP, 'layout_collapseMode', 'parallax');
                    controller.addBeforeOutsideTemplate(node.id, controller.renderNodeStatic($constA.CONTAINER_ANDROID.IMAGE, $Resource.formatOptions(backgroundImageOptions, numberResourceValue), $constA.STRING_ANDROID.MATCH_PARENT, $constA.STRING_ANDROID.MATCH_PARENT));
                    node.exclude($e.NODE_RESOURCE.IMAGE_SOURCE);
                }
            }
            node.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
            node.apply($Resource.formatOptions(toolbarOptions, numberResourceValue));
            const output = {
                type: 1 /* XML */,
                node,
                controlName: $constA.SUPPORT_ANDROID.TOOLBAR
            };
            if (appBarNode) {
                return {
                    output,
                    parentAs: node.parent,
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
            const menu = $util.optionalAsString(Toolbar.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const toolbarOptions = $utilA.createViewAttribute(this.options[node.elementId] && this.options[node.elementId].self);
                $util.assignEmptyValue(toolbarOptions, $constA.STRING_ANDROID.APP, 'menu', `@menu/${menu}`);
                node.app('menu', toolbarOptions.app.menu);
            }
            const themeData = node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData');
            if (themeData) {
                const settings = this.application.userSettings;
                const options = $utilA.createStyleAttribute(this.options.resource);
                const optionsActionBar = $utilA.createStyleAttribute({ name: '.NoActionBar', output: options.output });
                const optionsAppBar = $utilA.createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
                const optionsPopup = $utilA.createStyleAttribute({ name: '.PopupOverlay', output: options.output });
                $util.assignEmptyValue(options, 'name', settings.manifestThemeName);
                $util.assignEmptyValue(options, $constA.STRING_ANDROID.PARENT, 'Theme.AppCompat.Light.DarkActionBar');
                $util.assignEmptyValue(optionsActionBar.items, 'windowActionBar', 'false');
                $util.assignEmptyValue(optionsActionBar.items, 'windowNoTitle', 'true');
                $util.assignEmptyValue(optionsAppBar, $constA.STRING_ANDROID.PARENT, themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
                $util.assignEmptyValue(optionsPopup, $constA.STRING_ANDROID.PARENT, themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
                $Resource.addTheme(options, optionsActionBar, optionsAppBar, optionsPopup);
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
            placeholder.exclude($e.NODE_RESOURCE.ALL);
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
