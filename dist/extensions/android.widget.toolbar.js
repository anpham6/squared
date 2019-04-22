/* android.widget 0.9.4
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.toolbar = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $const = squared.base.lib.constant;
    const $css = squared.lib.css;
    const $dom = squared.lib.dom;
    const $enum = squared.base.lib.enumeration;
    const $session = squared.lib.session;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    class Toolbar extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        init(element) {
            if (this.included(element)) {
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $const.EXT_NAME.EXTERNAL)) {
                        item.dataset.use = (item.dataset.use ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
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
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item.tagName === 'IMG') {
                    if (item.dataset.navigationIcon) {
                        const src = $Resource.addImageSrc(item, $constA.PREFIX_ANDROID.MENU);
                        if (src !== '') {
                            $util.assignEmptyValue(toolbarOptions, 'app', 'navigationIcon', `@drawable/${src}`);
                        }
                    }
                    if (item.dataset.collapseIcon) {
                        const src = $Resource.addImageSrc(item, $constA.PREFIX_ANDROID.MENU);
                        if (src !== '') {
                            $util.assignEmptyValue(toolbarOptions, 'app', 'collapseIcon', `@drawable/${src}`);
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
                $util.assignEmptyValue(toolbarOptions, 'app', 'layout_collapseMode', 'pin');
            }
            else {
                $util.assignEmptyValue(toolbarOptions, 'app', 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
                if (backgroundImage) {
                    $util.assignEmptyValue(hasAppBar ? appBarOptions : toolbarOptions, 'android', 'background', `@drawable/${$Resource.addImageURL(node.css('backgroundImage'))}`);
                    node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
                }
                else {
                    $util.assignEmptyValue(toolbarOptions, 'app', 'layout_scrollFlags', 'scroll|enterAlways');
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
                node.exclude({ procedure: $enum.NODE_PROCEDURE.LAYOUT });
                $util.assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
            }
            $util.assignEmptyValue(toolbarOptions, 'android', 'layout_height', hasAppBar || !node.has('height') ? '?android:attr/actionBarSize' : '');
            node.setControlType($constA.SUPPORT_ANDROID.TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE });
            let appBarNode;
            let collapsingToolbarNode;
            if (hasAppBar) {
                $util.assignEmptyValue(appBarOptions, 'android', 'id', `${node.documentId}_appbar`);
                $util.assignEmptyValue(appBarOptions, 'android', 'layout_height', node.hasHeight ? $css.formatPX(node.height) : 'wrap_content');
                $util.assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
                if (hasMenu) {
                    if (appBarOptions.android.theme) {
                        appBarOverlay = appBarOptions.android.theme;
                    }
                    appBarOptions.android.theme = `@style/${settings.manifestThemeName}.AppBarOverlay`;
                    node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData', { appBarOverlay, popupOverlay });
                }
                else {
                    $util.assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
                }
                appBarNode = this.createPlaceholder(node, appBarChildren, target);
                appBarNode.parent = parent;
                appBarNode.controlId = $utilA.stripId(appBarOptions.android.id);
                appBarNode.setControlType($constA.SUPPORT_ANDROID.APPBAR, $enumA.CONTAINER_NODE.BLOCK);
                if (hasCollapsingToolbar) {
                    $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'id', `${node.documentId}_collapsingtoolbar`);
                    $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                    if (!backgroundImage) {
                        $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                    }
                    $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                    $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
                    collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren, target);
                    if (collapsingToolbarNode) {
                        collapsingToolbarNode.parent = appBarNode;
                        collapsingToolbarNode.each(item => item.dataset.target = collapsingToolbarNode.controlId);
                        collapsingToolbarNode.setControlType($constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
                    }
                }
            }
            let outputAs;
            if (appBarNode) {
                appBarNode.android('layout_width', 'match_parent');
                appBarNode.android('layout_height', 'wrap_content');
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
                    collapsingToolbarNode.android('layout_width', 'match_parent');
                    collapsingToolbarNode.android('layout_height', 'match_parent');
                    application.addRenderTemplate((collapsingToolbarNode.renderParent || parent), collapsingToolbarNode, {
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
                const src = $Resource.addImageURL(node.css('backgroundImage'));
                if (src !== '') {
                    const backgroundImageOptions = $utilA.createViewAttribute(options.backgroundImage);
                    let scaleType = 'center';
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
                    $util.assignEmptyValue(backgroundImageOptions, 'android', 'id', `${node.documentId}_image`);
                    $util.assignEmptyValue(backgroundImageOptions, 'android', 'src', `@drawable/${src}`);
                    $util.assignEmptyValue(backgroundImageOptions, 'android', 'scaleType', scaleType);
                    $util.assignEmptyValue(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                    $util.assignEmptyValue(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
                    controller.addBeforeOutsideTemplate(node.id, controller.renderNodeStatic($constA.CONTAINER_ANDROID.IMAGE, $Resource.formatOptions(backgroundImageOptions, numberResourceValue), 'match_parent', 'match_parent'));
                    node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
                }
            }
            node.android('layout_width', 'match_parent');
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
        postProcedure(node) {
            const menu = $util.optionalAsString(Toolbar.findNestedElement(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const toolbarOptions = $utilA.createViewAttribute(this.options[node.elementId] && this.options[node.elementId].self);
                $util.assignEmptyValue(toolbarOptions, 'app', 'menu', `@menu/${menu}`);
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
                $util.assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
                $util.assignEmptyValue(optionsActionBar.items, 'windowActionBar', 'false');
                $util.assignEmptyValue(optionsActionBar.items, 'windowNoTitle', 'true');
                $util.assignEmptyValue(optionsAppBar, 'parent', themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
                $util.assignEmptyValue(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
                $Resource.addTheme(options, optionsActionBar, optionsAppBar, optionsPopup);
            }
        }
        createPlaceholder(node, children, target) {
            let siblingIndex = Number.POSITIVE_INFINITY;
            for (const item of children) {
                siblingIndex = Math.min(siblingIndex, item.siblingIndex);
            }
            const placeholder = this.application.createNode($dom.createElement(node.actualParent && node.actualParent.element, node.block ? 'div' : 'span'), true, node, children);
            placeholder.siblingIndex = siblingIndex;
            if (target) {
                placeholder.dataset.target = target;
            }
            placeholder.inherit(node, 'base');
            placeholder.exclude({ resource: $enum.NODE_RESOURCE.ALL });
            placeholder.positioned = true;
            return placeholder;
        }
    }

    const toolbar = new Toolbar("android.widget.toolbar" /* TOOLBAR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(toolbar);
    }

    return toolbar;

}());
