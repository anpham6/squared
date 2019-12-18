import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

const $lib = squared.lib;
const { formatPX } = $lib.css;
const { getElementAsNode } = $lib.session;
const { assignEmptyValue, includes, optionalAsString } = $lib.util;

const { NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const $libA = android.lib;
const { CONTAINER_ANDROID, EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
const { createStyleAttribute, createViewAttribute, getDocumentId } = $libA.util;

const { Resource } = android.base;

type ToolbarThemeData = {
    appBarOverlay: string;
    popupOverlay: string;
};

const PREFIX_MENU = 'ic_menu_';

export default class Toolbar<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(WIDGET_NAME.MENU);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = <HTMLElement> children[i];
                if (item.tagName === 'NAV' && !includes(item.dataset.use, EXT_ANDROID.EXTERNAL)) {
                    item.dataset.use = (item.dataset.use ? item.dataset.use + ', ' : '') + EXT_ANDROID.EXTERNAL;
                    break;
                }
            }
            const target = element.dataset.target;
            if (target) {
                const targetElement = document.getElementById(target);
                if (element.parentElement !== targetElement && targetElement && !includes(targetElement.dataset.use, WIDGET_NAME.COORDINATOR)) {
                    (<squared.base.ApplicationUI<T>> this.application).rootElements.add(element);
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const application = this.application;
        const resource = <android.base.Resource<T>> this.resource;
        const settings = <UserSettingsAndroid> application.userSettings;
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options: ExternalData = { ...this.options[element.id] };
        const toolbarOptions = createViewAttribute(options.self);
        const appBarOptions = createViewAttribute(options.appBar);
        const collapsingToolbarOptions = createViewAttribute(options.collapsingToolbar);
        const numberResourceValue = application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
        const hasMenu = Toolbar.findNestedElement(element, WIDGET_NAME.MENU);
        const backgroundImage = node.has('backgroundImage');
        const appBarChildren: T[] = [];
        const collapsingToolbarChildren: T[] = [];
        const children = element.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = <HTMLElement> children[i];
            const dataset = item.dataset;
            if (item.tagName === 'IMG') {
                if (dataset.navigationIcon) {
                    const src = resource.addImageSrc(<HTMLImageElement> item, PREFIX_MENU);
                    if (src !== '') {
                        assignEmptyValue(toolbarOptions, 'app', 'navigationIcon', '@drawable/' + src);
                    }
                }
                if (dataset.collapseIcon) {
                    const src = resource.addImageSrc(<HTMLImageElement> item, PREFIX_MENU);
                    if (src !== '') {
                        assignEmptyValue(toolbarOptions, 'app', 'collapseIcon', '@drawable/' + src);
                    }
                }
            }
            if (!dataset.target) {
                const targetNode = getElementAsNode<T>(item, node.sessionId);
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
                if (app.popupTheme) {
                    popupOverlay = app.popupTheme.replace('@style/', '');
                }
                app.popupTheme = '@style/' + settings.manifestThemeName + '.PopupOverlay';
            }
        }
        else {
            node.exclude(0, NODE_PROCEDURE.LAYOUT);
            assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
        }
        assignEmptyValue(toolbarOptions, 'android', 'layout_height', hasAppBar || !node.hasPX('height') ? '?android:attr/actionBarSize' : '');
        let controlName: string;
        let appBarName: string;
        let collapsingToolbarName: string;
        if (node.localSettings.targetAPI < BUILD_ANDROID.Q) {
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
        let appBarNode: T | undefined;
        let collapsingToolbarNode: T | undefined;
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
                node.data(WIDGET_NAME.TOOLBAR, 'themeData', <ToolbarThemeData> { appBarOverlay, popupOverlay });
            }
            else {
                assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
            }
            appBarNode = this.createPlaceholder(node, appBarChildren, target);
            appBarNode.parent = parent;
            let id = android.id;
            if (id) {
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
                    collapsingToolbarNode.each(item => item.dataset.target = (collapsingToolbarNode as T).controlId);
                }
            }
        }
        let outputAs: NodeXmlTemplate<T> | undefined;
        if (appBarNode) {
            appBarNode.setLayoutWidth('match_parent');
            appBarNode.setLayoutHeight('wrap_content');
            appBarNode.apply(Resource.formatOptions(appBarOptions, numberResourceValue));
            appBarNode.render(target ? application.resolveTarget(target) : parent);
            outputAs = {
                type: NODE_TEMPLATE.XML,
                node: appBarNode,
                controlName: appBarName
            };
            if (collapsingToolbarNode) {
                node.parent = collapsingToolbarNode;
                collapsingToolbarNode.apply(Resource.formatOptions(collapsingToolbarOptions, numberResourceValue));
                collapsingToolbarNode.render(appBarNode);
                collapsingToolbarNode.setLayoutWidth('match_parent');
                collapsingToolbarNode.setLayoutHeight('match_parent');
                application.addLayoutTemplate(
                    (collapsingToolbarNode.renderParent || parent) as T,
                    collapsingToolbarNode,
                    <NodeXmlTemplate<T>> {
                        type: NODE_TEMPLATE.XML,
                        node: collapsingToolbarNode,
                        controlName: collapsingToolbarName
                    }
                );
                if (backgroundImage) {
                    const src = resource.addImageSrc(node.backgroundImage);
                    if (src !== '') {
                        const controller = this.controller;
                        const backgroundImageOptions = createViewAttribute(options.backgroundImage);
                        let scaleType: string;
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
                        controller.addBeforeOutsideTemplate(
                            node.id,
                            controller.renderNodeStatic(
                                CONTAINER_ANDROID.IMAGE,
                                Resource.formatOptions(backgroundImageOptions, numberResourceValue),
                                'match_parent',
                                'match_parent'
                            )
                        );
                        node.setCacheValue('backgroundImage', '');
                    }
                }
            }
            else {
                node.parent = appBarNode;
                if (backgroundImage) {
                    node.data(WIDGET_NAME.TOOLBAR, 'background', appBarNode);
                }
            }
            node.data(WIDGET_NAME.TOOLBAR, 'outerParent', appBarNode.android('id') || appBarNode.documentId);
            node.render(node.parent as T);
        }
        else {
            node.render(target ? application.resolveTarget(target) : parent);
        }
        node.setLayoutWidth('match_parent');
        node.apply(Resource.formatOptions(toolbarOptions, numberResourceValue));
        const output = <NodeXmlTemplate<T>> {
            type: NODE_TEMPLATE.XML,
            node,
            controlName
        };
        if (appBarNode) {
            return {
                output,
                outerParent: node.parent as T,
                renderAs: appBarNode,
                outputAs
            };
        }
        else {
            return { output };
        }
    }

    public processChild(node: T) {
        if (node.imageElement && (node.dataset.navigationIcon || node.dataset.collapseIcon)) {
            node.hide();
            return { next: true };
        }
        return undefined;
    }

    public postOptimize(node: T) {
        const menu = optionalAsString(Toolbar.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        if (menu !== '') {
            const toolbarOptions = createViewAttribute(this.options[node.elementId]?.self);
            assignEmptyValue(toolbarOptions, 'app', 'menu', '@menu/' + menu);
            node.app('menu', toolbarOptions.app.menu);
        }
        const themeData: ToolbarThemeData = node.data(WIDGET_NAME.TOOLBAR, 'themeData');
        if (themeData) {
            const settings = <UserSettingsAndroid> this.application.userSettings;
            const options = createStyleAttribute(this.options.resource);
            const optionsActionBar = createStyleAttribute({ name: '.NoActionBar', output: options.output });
            const optionsAppBar = createStyleAttribute({ name: '.AppBarOverlay', output: options.output });
            const optionsPopup = createStyleAttribute({ name: '.PopupOverlay', output: options.output });
            assignEmptyValue(options, 'name', settings.manifestThemeName);
            assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
            assignEmptyValue(optionsActionBar.items, 'windowActionBar', 'false');
            assignEmptyValue(optionsActionBar.items, 'windowNoTitle', 'true');
            assignEmptyValue(optionsAppBar, 'parent', themeData.appBarOverlay || 'ThemeOverlay.AppCompat.Dark.ActionBar');
            assignEmptyValue(optionsPopup, 'parent', themeData.popupOverlay || 'ThemeOverlay.AppCompat.Light');
            Resource.addTheme(options, optionsActionBar, optionsAppBar, optionsPopup);
        }
        const appBar = node.data(WIDGET_NAME.TOOLBAR, 'background');
        if (appBar) {
            const background = node.android('background');
            if (background !== '') {
                appBar.android('background', background);
                node.delete('android', 'background');
            }
        }
    }

    private createPlaceholder(node: T, children: T[], target?: string) {
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