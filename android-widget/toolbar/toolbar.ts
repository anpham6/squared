import { ExtensionResult } from '../../src/base/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

type ToolbarThemeData = {
    target: boolean;
    appBarOverlay: string;
    popupOverlay: string;
};

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

export default class Toolbar<T extends android.base.View> extends squared.base.Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require(WIDGET_NAME.MENU);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            for (let i = 0; i < element.children.length; i++) {
                const item = <HTMLElement> element.children[i];
                if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $const.EXT_NAME.EXTERNAL)) {
                    item.dataset.use = ($util.hasValue(item.dataset.use) ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
                    break;
                }
            }
            if (element.dataset.target) {
                const target = document.getElementById(element.dataset.target);
                if (target && element.parentElement !== target && !$util.includes(target.dataset.use, WIDGET_NAME.COORDINATOR)) {
                    this.application.parseElements.add(element);
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const application = this.application;
        const controller = application.controllerHandler;
        const element = <HTMLElement> node.element;
        const target = $util.hasValue(node.dataset.target);
        const options: ExternalData = Object.assign({}, this.options[element.id]);
        const toolbarOptions = $utilA.createViewAttribute(options.self);
        const appBarOptions = $utilA.createViewAttribute(options.appBar);
        const collapsingToolbarOptions = $utilA.createViewAttribute(options.collapsingToolbar);
        const hasMenu = Toolbar.findNestedByName(element, WIDGET_NAME.MENU);
        const backgroundImage = node.has('backgroundImage');
        const appBarChildren: T[] = [];
        const collapsingToolbarChildren: T[] = [];
        let depth = target ? 0 : parent.renderDepth + 1;
        let children = node.filter(item => !item.positioned).length;
        for (let i = 0; i < element.children.length; i++) {
            const item = <HTMLElement> element.children[i];
            if (item.tagName === 'IMG') {
                if ($util.hasValue(item.dataset.navigationIcon)) {
                    const result = $Resource.addImageSrcSet(<HTMLImageElement> item, $constA.PREFIX_ANDROID.MENU);
                    if (result !== '') {
                        $util.defaultWhenNull(toolbar, 'app', 'navigationIcon', `@drawable/${result}`);
                        if ($dom.getStyle(item).display !== 'none') {
                            children--;
                        }
                    }
                }
                if ($util.hasValue(item.dataset.collapseIcon)) {
                    const result = $Resource.addImageSrcSet(<HTMLImageElement> item, $constA.PREFIX_ANDROID.MENU);
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
                const targetNode = $dom.getElementAsNode<T>(item);
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
        }
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
        const numberResourceValue = application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
        node.setControlType($constA.SUPPORT_ANDROID.TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
        let output = controller.renderNodeStatic(
            $constA.SUPPORT_ANDROID.TOOLBAR,
            innerDepth,
            $Resource.formatOptions(toolbarOptions, numberResourceValue),
            'match_parent',
            'wrap_content',
            node,
            children > 0
        );
        if (hasCollapsingToolbar) {
            if (backgroundImage) {
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
                $util.defaultWhenNull(backgroundImageOptions, 'android', 'id', `${node.documentId}_image`);
                $util.defaultWhenNull(backgroundImageOptions, 'android', 'src', `@drawable/${$Resource.addImageUrl(node.css('backgroundImage'))}`);
                $util.defaultWhenNull(backgroundImageOptions, 'android', 'scaleType', scaleType);
                $util.defaultWhenNull(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                $util.defaultWhenNull(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
                output = controller.renderNodeStatic(
                    $constA.CONTAINER_ANDROID.IMAGE,
                    innerDepth,
                    $Resource.formatOptions(backgroundImageOptions, numberResourceValue),
                    'match_parent',
                    'match_parent'
                ) + output;
                node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
            }
        }
        let outer = '';
        let appBarNode: T | undefined;
        let collapsingToolbarNode: T | undefined;
        if (hasAppBar) {
            $util.defaultWhenNull(appBarOptions, 'android', 'id', `${node.documentId}_appbar`);
            $util.defaultWhenNull(appBarOptions, 'android', 'layout_height', node.hasHeight ? $util.formatPX(node.height) : 'wrap_content');
            $util.defaultWhenNull(appBarOptions, 'android', 'fitsSystemWindows', 'true');
            if (hasMenu) {
                if (appBarOptions.android.theme) {
                    appBarOverlay = appBarOptions.android.theme;
                }
                appBarOptions.android.theme = '@style/AppTheme.AppBarOverlay';
                node.data(WIDGET_NAME.TOOLBAR, 'themeData', <ToolbarThemeData> {
                    target,
                    appBarOverlay,
                    popupOverlay
                });
            }
            else {
                $util.defaultWhenNull(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
            }
            appBarNode = this.createPlaceholder(node, appBarChildren);
            appBarNode.parent = node.parent;
            appBarNode.controlId = $utilA.stripId(appBarOptions.android.id);
            appBarNode.setControlType($constA.SUPPORT_ANDROID.APPBAR, $enumA.CONTAINER_NODE.BLOCK);
            application.processing.cache.append(appBarNode, appBarChildren.length > 0);
            outer = controller.renderNodeStatic(
                $constA.SUPPORT_ANDROID.APPBAR,
                target ? -1 : depth,
                $Resource.formatOptions(appBarOptions, numberResourceValue),
                'match_parent',
                'wrap_content',
                appBarNode,
                true
            );
            if (hasCollapsingToolbar) {
                depth++;
                $util.defaultWhenNull(collapsingToolbarOptions, 'android', 'id', `${node.documentId}_collapsingtoolbar`);
                $util.defaultWhenNull(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                if (!backgroundImage) {
                    $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                }
                $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                $util.defaultWhenNull(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
                collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren);
                collapsingToolbarNode.parent = appBarNode;
                if (collapsingToolbarNode) {
                    collapsingToolbarNode.each(item => item.dataset.target = (collapsingToolbarNode as T).controlId);
                    collapsingToolbarNode.setControlType($constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR, $enumA.CONTAINER_NODE.BLOCK);
                    application.processing.cache.append(collapsingToolbarNode, collapsingToolbarChildren.length > 0);
                    const content = controller.renderNodeStatic(
                        $constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR,
                        target && !hasAppBar ? -1 : depth,
                        $Resource.formatOptions(collapsingToolbarOptions, numberResourceValue),
                        'match_parent',
                        'match_parent',
                        collapsingToolbarNode,
                        true
                    );
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
            node.data(WIDGET_NAME.TOOLBAR, 'outerParent', appBarNode.documentId);
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
        node.containerType = $enumA.CONTAINER_NODE.BLOCK;
        node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE });
        return { output };
    }

    public processChild(node: T): ExtensionResult<T> {
        let next = false;
        if (node.imageElement && ($util.hasValue(node.dataset.navigationIcon) || $util.hasValue(node.dataset.collapseIcon))) {
            node.hide();
            next = true;
        }
        return { output: '', next };
    }

    public postProcedure(node: T) {
        const menu = $util.optionalAsString(Toolbar.findNestedByName(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        if (menu !== '') {
            const options: ExternalData = node.element && this.options[node.element.id] || {};
            const toolbarOptions = $utilA.createViewAttribute(options.self);
            $util.defaultWhenNull(toolbarOptions, 'app', 'menu', `@menu/${menu}`);
            node.app('menu', toolbarOptions.app.menu);
        }
        const themeData: ToolbarThemeData = node.data(WIDGET_NAME.TOOLBAR, 'themeData');
        if (themeData) {
            this.setStyleTheme(themeData);
        }
    }

    private setStyleTheme(themeData: ToolbarThemeData) {
        const options = $utilA.createStyleAttribute(Object.assign({}, this.options.resource));
        const optionsActionBar = $utilA.createStyleAttribute({ name: '.NoActionBar', output: options.output });
        const optionsAppBar = $utilA.createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
        const optionsPopup = $utilA.createStyleAttribute({ name: '.PopupOverlay', output: options.output });
        $util.defaultWhenNull(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
        $util.defaultWhenNull(optionsActionBar.items, 'windowActionBar', 'false');
        $util.defaultWhenNull(optionsActionBar.items, 'windowNoTitle', 'true');
        $util.defaultWhenNull(optionsAppBar, 'parent', themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
        $util.defaultWhenNull(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
        $Resource.addTheme(options, optionsActionBar, optionsAppBar, optionsPopup);
    }

    private createPlaceholder(node: T, children: T[]) {
        const placeholder = this.application.createNode($dom.createElement(node.actualParent ? node.actualParent.element : null, node.block));
        placeholder.inherit(node, 'base');
        placeholder.exclude({ resource: $enum.NODE_RESOURCE.ALL });
        placeholder.positioned = true;
        let siblingIndex = Number.POSITIVE_INFINITY;
        for (const item of children) {
            siblingIndex = Math.min(siblingIndex, item.siblingIndex);
            item.parent = placeholder;
        }
        placeholder.siblingIndex = siblingIndex;
        return placeholder;
    }
}