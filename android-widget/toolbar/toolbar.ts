import { ExtensionResult } from '../../src/base/@types/application';
import { UserSettingsAndroid } from '../../android-framework/src/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

type ToolbarThemeData = {
    appBarOverlay: string;
    popupOverlay: string;
};

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $element = squared.lib.element;
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
                    item.dataset.use = (item.dataset.use ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
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
        const settings = <UserSettingsAndroid> application.userSettings;
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options: ExternalData = { ...this.options[element.id] };
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
                    const result = $Resource.addImageSrc(<HTMLImageElement> item, $constA.PREFIX_ANDROID.MENU);
                    if (result !== '') {
                        $util.assignEmptyValue(toolbarOptions, 'app', 'navigationIcon', `@drawable/${result}`);
                        if ($css.getStyle(item).display !== 'none') {
                            children--;
                        }
                    }
                }
                if ($util.hasValue(item.dataset.collapseIcon)) {
                    const result = $Resource.addImageSrc(<HTMLImageElement> item, $constA.PREFIX_ANDROID.MENU);
                    if (result !== '') {
                        $util.assignEmptyValue(toolbarOptions, 'app', 'collapseIcon', `@drawable/${result}`);
                        if ($css.getStyle(item).display !== 'none') {
                            children--;
                        }
                    }
                }
            }
            if (item.dataset.target) {
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
        const hasCollapsingToolbar = 'collapsingToolbar' in options || collapsingToolbarChildren.length > 0;
        const hasAppBar = 'appBar' in options || appBarChildren.length > 0 || hasCollapsingToolbar;
        let appBarOverlay = '';
        let popupOverlay = '';
        if (hasCollapsingToolbar) {
            $util.assignEmptyValue(toolbarOptions, 'app', 'layout_collapseMode', 'pin');
        }
        else {
            if (!hasAppBar) {
                $util.assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
            }
            $util.assignEmptyValue(toolbarOptions, 'app', 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
            if (backgroundImage) {
                $util.assignEmptyValue(appBarChildren.length ? appBarOptions : toolbarOptions, 'android', 'background', `@drawable/${$Resource.addImageUrl(node.css('backgroundImage'))}`);
                node.exclude({ resource: $enum.NODE_RESOURCE.IMAGE_SOURCE });
            }
            else {
                $util.assignEmptyValue(toolbarOptions, 'app', 'layout_scrollFlags', 'scroll|enterAlways');
            }
        }
        if (appBarChildren.length) {
            $util.assignEmptyValue(appBarOptions, 'android', 'layout_height', '?android:attr/actionBarSize');
        }
        else {
            $util.assignEmptyValue(toolbarOptions, 'android', 'layout_height', '?android:attr/actionBarSize');
            node.exclude({ procedure: $enum.NODE_PROCEDURE.LAYOUT });
        }
        if (hasMenu && hasAppBar) {
            if (toolbarOptions.app.popupTheme) {
                popupOverlay = toolbarOptions.app.popupTheme.replace('@style/', '');
            }
            toolbarOptions.app.popupTheme = `@style/${settings.manifestThemeName}.PopupOverlay`;
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
                $util.assignEmptyValue(backgroundImageOptions, 'android', 'id', `${node.documentId}_image`);
                $util.assignEmptyValue(backgroundImageOptions, 'android', 'src', `@drawable/${$Resource.addImageUrl(node.css('backgroundImage'))}`);
                $util.assignEmptyValue(backgroundImageOptions, 'android', 'scaleType', scaleType);
                $util.assignEmptyValue(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                $util.assignEmptyValue(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
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
            $util.assignEmptyValue(appBarOptions, 'android', 'id', `${node.documentId}_appbar`);
            $util.assignEmptyValue(appBarOptions, 'android', 'layout_height', node.hasHeight ? $util.formatPX(node.height) : 'wrap_content');
            $util.assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
            if (hasMenu) {
                if (appBarOptions.android.theme) {
                    appBarOverlay = appBarOptions.android.theme;
                }
                appBarOptions.android.theme = `@style/${settings.manifestThemeName}.AppBarOverlay`;
                node.data(WIDGET_NAME.TOOLBAR, 'themeData', <ToolbarThemeData> { appBarOverlay, popupOverlay });
            }
            else {
                $util.assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
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
                $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'id', `${node.documentId}_collapsingtoolbar`);
                $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                if (!backgroundImage) {
                    $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                }
                $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
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
            appBarNode.render(target ? application.resolveTarget(target, appBarNode) : parent);
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
            collapsingToolbarNode.render(target ? application.resolveTarget(target, collapsingToolbarNode) : parent);
            node.parent = collapsingToolbarNode;
            node.render(collapsingToolbarNode);
        }
        else {
            node.render(target ? application.resolveTarget(target, node) : parent);
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
            const options: ExternalData = this.options[node.elementId] || {};
            const toolbarOptions = $utilA.createViewAttribute(options.self);
            $util.assignEmptyValue(toolbarOptions, 'app', 'menu', `@menu/${menu}`);
            node.app('menu', toolbarOptions.app.menu);
        }
        const themeData: ToolbarThemeData = node.data(WIDGET_NAME.TOOLBAR, 'themeData');
        if (themeData) {
            const options = $utilA.createStyleAttribute(this.options.resource);
            const optionsActionBar = $utilA.createStyleAttribute({ name: '.NoActionBar', output: options.output });
            const optionsAppBar = $utilA.createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
            const optionsPopup = $utilA.createStyleAttribute({ name: '.PopupOverlay', output: options.output });
            $util.assignEmptyValue(optionsActionBar.items, 'windowActionBar', 'false');
            $util.assignEmptyValue(optionsActionBar.items, 'windowNoTitle', 'true');
            $util.assignEmptyValue(optionsAppBar, 'parent', themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
            $util.assignEmptyValue(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
            $Resource.addTheme(optionsActionBar, optionsAppBar, optionsPopup);
        }
    }

    private createPlaceholder(node: T, children: T[]) {
        const placeholder = this.application.createNode($element.createElement(node.actualParent ? node.actualParent.element : null, node.block));
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