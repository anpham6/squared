/* android.widget 0.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.toolbar = (function () {
    'use strict';

    const template = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<resources>',
        '!1',
        '	<style name="{&appTheme}" parent="{~parentTheme}">',
        '!items',
        '		<item name="{&name}">{&value}</item>',
        '!items',
        '	</style>',
        '!1',
        '	<style name="{&appTheme}.NoActionBar">',
        '		<item name="windowActionBar">false</item>',
        '		<item name="windowNoTitle">true</item>',
        '	</style>',
        '	<style name="{&appTheme}.AppBarOverlay" parent="{~appBarOverlay}" />',
        '	<style name="{&appTheme}.PopupOverlay" parent="{~popupOverlay}" />',
        '</resources>'
    ];
    var EXTENSION_TOOLBAR_TMPL = template.join('\n');

    var $const = squared.base.lib.constant;
    var $enum = squared.base.lib.enumeration;
    var $dom = squared.lib.dom;
    var $util = squared.lib.util;
    var $xml = squared.lib.xml;
    var $Resource = android.base.Resource;
    var $View = android.base.View;
    var $const_android = android.lib.constant;
    var $enum_android = android.lib.enumeration;
    var $util_android = android.lib.util;
    class Toolbar extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        init(element) {
            if (this.included(element)) {
                Array.from(element.children).some((item) => {
                    if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $const.EXT_NAME.EXTERNAL)) {
                        item.dataset.use = ($util.hasValue(item.dataset.use) ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
                        return true;
                    }
                    return false;
                });
                if (element.dataset.target) {
                    const target = document.getElementById(element.dataset.target);
                    if (target && element.parentElement !== target && !$util.includes(target.dataset.use, "android.widget.coordinator" /* COORDINATOR */)) {
                        this.application.parseElements.add(element);
                    }
                }
            }
            return false;
        }
        processNode(node, parent) {
            const application = this.application;
            const controller = application.controllerHandler;
            const element = node.element;
            const target = $util.hasValue(node.dataset.target);
            const options = Object.assign({}, this.options[element.id]);
            const toolbarOptions = $util_android.createAttribute(options.self);
            const appBarOptions = $util_android.createAttribute(options.appBar);
            const collapsingToolbarOptions = $util_android.createAttribute(options.collapsingToolbar);
            const hasMenu = Toolbar.findNestedByName(element, "android.widget.menu" /* MENU */);
            const backgroundImage = node.has('backgroundImage');
            const appBarChildren = [];
            const collapsingToolbarChildren = [];
            let depth = target ? 0 : parent.renderDepth + 1;
            let children = node.filter(item => !item.positioned).length;
            Array.from(element.children).forEach((item) => {
                if (item.tagName === 'IMG') {
                    if ($util.hasValue(item.dataset.navigationIcon)) {
                        const result = $Resource.addImageSrcSet(item, $const_android.PREFIX_ANDROID.MENU);
                        if (result !== '') {
                            $util.defaultWhenNull(toolbar, 'app', 'navigationIcon', `@drawable/${result}`);
                            if ($dom.getStyle(item).display !== 'none') {
                                children--;
                            }
                        }
                    }
                    if ($util.hasValue(item.dataset.collapseIcon)) {
                        const result = $Resource.addImageSrcSet(item, $const_android.PREFIX_ANDROID.MENU);
                        if (result !== '') {
                            $util.defaultWhenNull(toolbar, 'app', 'collapseIcon', `@drawable/${result}`);
                            if ($dom.getStyle(item).display !== 'none') {
                                children--;
                            }
                        }
                    }
                }
                if ($util.hasValue(item.dataset.target)) {
                    children--;
                }
                else {
                    const targetNode = $dom.getElementAsNode(item);
                    if (targetNode) {
                        switch (item.dataset.targetModule) {
                            case 'appBar':
                                appBarChildren.push(targetNode);
                                children--;
                                break;
                            case 'collapsingToolbar':
                                collapsingToolbarChildren.push(targetNode);
                                children--;
                                break;
                        }
                    }
                }
            });
            const hasCollapsingToolbar = options.hasOwnProperty('collapsingToolbar') || collapsingToolbarChildren.length;
            const hasAppBar = options.hasOwnProperty('appBar') || appBarChildren.length || hasCollapsingToolbar;
            let appBarOverlay = '';
            let popupOverlay = '';
            if (hasCollapsingToolbar) {
                $util.defaultWhenNull(toolbarOptions, 'app', 'layout_collapseMode', 'pin');
            }
            else {
                if (!hasAppBar) {
                    $util.defaultWhenNull(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
                }
                $util.defaultWhenNull(toolbarOptions, 'app', 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
                if (backgroundImage) {
                    $util.defaultWhenNull(appBarChildren.length ? appBarOptions : toolbarOptions, 'android', 'background', `@drawable/${$Resource.addImageUrl(node.css('backgroundImage'))}`);
                    node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
                }
                else {
                    $util.defaultWhenNull(toolbarOptions, 'app', 'layout_scrollFlags', 'scroll|enterAlways');
                }
            }
            if (appBarChildren.length) {
                $util.defaultWhenNull(appBarOptions, 'android', 'layout_height', '?android:attr/actionBarSize');
            }
            else {
                $util.defaultWhenNull(toolbarOptions, 'android', 'layout_height', '?android:attr/actionBarSize');
                node.exclude({ procedure: $enum.NODE_PROCEDURE.LAYOUT });
            }
            if (hasMenu) {
                if (hasAppBar) {
                    if (toolbarOptions.app.popupTheme) {
                        popupOverlay = toolbarOptions.app.popupTheme.replace('@style/', '');
                    }
                    toolbarOptions.app.popupTheme = '@style/AppTheme.PopupOverlay';
                }
            }
            const innerDepth = depth + (hasAppBar ? 1 : 0) + (hasCollapsingToolbar ? 1 : 0);
            const numberResourceValue = application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            node.setControlType($const_android.SUPPORT_ANDROID.TOOLBAR, $enum_android.CONTAINER_NODE.BLOCK);
            let output = controller.renderNodeStatic($const_android.SUPPORT_ANDROID.TOOLBAR, innerDepth, $Resource.formatOptions(toolbarOptions, numberResourceValue), 'match_parent', 'wrap_content', node, children > 0);
            if (hasCollapsingToolbar) {
                if (backgroundImage) {
                    const backgroundImageOptions = $util_android.createAttribute(options.backgroundImage);
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
                    $util.defaultWhenNull(backgroundImageOptions, 'android', 'id', `${node.documentId}_image`);
                    $util.defaultWhenNull(backgroundImageOptions, 'android', 'src', `@drawable/${$Resource.addImageUrl(node.css('backgroundImage'))}`);
                    $util.defaultWhenNull(backgroundImageOptions, 'android', 'scaleType', scaleType);
                    $util.defaultWhenNull(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                    $util.defaultWhenNull(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
                    output = controller.renderNodeStatic($const_android.CONTAINER_ANDROID.IMAGE, innerDepth, $Resource.formatOptions(backgroundImageOptions, numberResourceValue), 'match_parent', 'match_parent') + output;
                    node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
                }
            }
            let outer = '';
            let appBarNode;
            let collapsingToolbarNode;
            if (hasAppBar) {
                $util.defaultWhenNull(appBarOptions, 'android', 'id', `${node.documentId}_appbar`);
                $util.defaultWhenNull(appBarOptions, 'android', 'layout_height', node.hasHeight ? $util.formatPX(node.height) : 'wrap_content');
                $util.defaultWhenNull(appBarOptions, 'android', 'fitsSystemWindows', 'true');
                if (hasMenu) {
                    if (appBarOptions.android.theme) {
                        appBarOverlay = appBarOptions.android.theme;
                    }
                    appBarOptions.android.theme = '@style/AppTheme.AppBarOverlay';
                    node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData', {
                        target,
                        appBarOverlay,
                        popupOverlay
                    });
                }
                else {
                    $util.defaultWhenNull(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
                }
                appBarNode = this.createPlaceholder(application.nextId, node, appBarChildren);
                appBarNode.parent = node.parent;
                appBarNode.controlId = $util_android.stripId(appBarOptions.android.id);
                appBarNode.setControlType($const_android.SUPPORT_ANDROID.APPBAR, $enum_android.CONTAINER_NODE.BLOCK);
                application.processing.cache.append(appBarNode, appBarChildren.length > 0);
                outer = controller.renderNodeStatic($const_android.SUPPORT_ANDROID.APPBAR, target ? -1 : depth, $Resource.formatOptions(appBarOptions, numberResourceValue), 'match_parent', 'wrap_content', appBarNode, true);
                if (hasCollapsingToolbar) {
                    depth++;
                    $util.defaultWhenNull(collapsingToolbarOptions, 'android', 'id', `${node.documentId}_collapsingtoolbar`);
                    $util.defaultWhenNull(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                    if (!backgroundImage) {
                        $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                    }
                    $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                    $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
                    collapsingToolbarNode = this.createPlaceholder(application.nextId, node, collapsingToolbarChildren);
                    collapsingToolbarNode.parent = appBarNode;
                    if (collapsingToolbarNode) {
                        collapsingToolbarNode.each(item => item.dataset.target = collapsingToolbarNode.controlId);
                        collapsingToolbarNode.setControlType($const_android.SUPPORT_ANDROID.COLLAPSING_TOOLBAR, $enum_android.CONTAINER_NODE.BLOCK);
                        application.processing.cache.append(collapsingToolbarNode, collapsingToolbarChildren.length > 0);
                        const content = controller.renderNodeStatic($const_android.SUPPORT_ANDROID.COLLAPSING_TOOLBAR, target && !hasAppBar ? -1 : depth, $Resource.formatOptions(collapsingToolbarOptions, numberResourceValue), 'match_parent', 'match_parent', collapsingToolbarNode, true);
                        outer = $xml.replacePlaceholder(outer, appBarNode.id, content);
                    }
                }
            }
            if (appBarNode) {
                output = $xml.replacePlaceholder(outer, collapsingToolbarNode ? collapsingToolbarNode.id : appBarNode.id, output);
                appBarNode.render(target ? appBarNode : parent);
                if (!collapsingToolbarNode) {
                    node.parent = appBarNode;
                }
                else {
                    collapsingToolbarNode.parent = appBarNode;
                    collapsingToolbarNode.render(appBarNode);
                    node.parent = collapsingToolbarNode;
                }
                node.data("android.widget.toolbar" /* TOOLBAR */, 'outerParent', appBarNode.documentId);
                node.render(node.parent);
            }
            else if (collapsingToolbarNode) {
                collapsingToolbarNode.render(target ? collapsingToolbarNode : parent);
                node.parent = collapsingToolbarNode;
                node.render(collapsingToolbarNode);
            }
            else {
                node.render(target ? node : parent);
            }
            node.containerType = $enum_android.CONTAINER_NODE.BLOCK;
            node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE });
            return { output };
        }
        processChild(node) {
            let next = false;
            if (node.imageElement && ($util.hasValue(node.dataset.navigationIcon) || $util.hasValue(node.dataset.collapseIcon))) {
                node.hide();
                next = true;
            }
            return { output: '', next };
        }
        postProcedure(node) {
            const menu = $util.optionalAsString(Toolbar.findNestedByName(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const options = node.element && this.options[node.element.id] || {};
                const toolbarOptions = $util_android.createAttribute(options.self);
                $util.defaultWhenNull(toolbarOptions, 'app', 'menu', `@menu/${menu}`);
                node.app('menu', toolbarOptions.app.menu);
            }
            const themeData = node.data("android.widget.toolbar" /* TOOLBAR */, 'themeData');
            if (themeData) {
                this.setStyleTheme(themeData);
            }
        }
        setStyleTheme(themeData) {
            if (this.application.resourceHandler.fileHandler) {
                const options = Object.assign({}, this.options.resource);
                $util.defaultWhenNull(options, 'appTheme', $util_android.getAppTheme(this.application.resourceHandler.fileHandler.assets) || 'AppTheme');
                $util.defaultWhenNull(options, 'parentTheme', 'Theme.AppCompat.Light.DarkActionBar');
                const data = {
                    'appTheme': options.appTheme,
                    'appBarOverlay': themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar',
                    'popupOverlay': themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light',
                    '1': [{
                            'appTheme': options.appTheme,
                            'parentTheme': options.parentTheme,
                            'items': []
                        }]
                };
                if (themeData.target) {
                    data['1'] = [];
                }
                else {
                    data['items'] = data['1'][0]['items'];
                }
                $util.defaultWhenNull(options, 'output', 'path', 'res/values');
                $util.defaultWhenNull(options, 'output', 'file', `${"android.widget.toolbar" /* TOOLBAR */}.xml`);
                this.application.resourceHandler.addStyleTheme(EXTENSION_TOOLBAR_TMPL, data, options);
            }
        }
        createPlaceholder(nextId, node, children) {
            const placeholder = new $View(nextId, $dom.createElement(node.actualParent ? node.actualParent.element : null, node.block), this.application.controllerHandler.afterInsertNode);
            placeholder.inherit(node, 'base');
            placeholder.exclude({ resource: $enum.NODE_RESOURCE.ALL });
            placeholder.positioned = true;
            let siblingIndex = Number.MAX_VALUE;
            children.forEach(item => {
                siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                item.parent = placeholder;
            });
            placeholder.siblingIndex = siblingIndex;
            return placeholder;
        }
    }

    const toolbar$1 = new Toolbar("android.widget.toolbar" /* TOOLBAR */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(toolbar$1);
    }

    return toolbar$1;

}());
