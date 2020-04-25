import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettings } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const $lib = squared.lib;
const $libA = android.lib;

const { formatPX } = $lib.css;
const { getElementAsNode } = $lib.session;
const { assignEmptyValue, capitalize, includes, isString, iterateArray, safeNestedMap } = $lib.util;

const { NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const { CONTAINER_ANDROID, EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
const { createStyleAttribute, createViewAttribute, getDocumentId } = $libA.util;

const Resource = android.base.Resource;

type ToolbarThemeData = {
    appBarOverlay: string;
    popupOverlay: string;
};

const PREFIX_MENU = 'ic_menu_';

export default class Toolbar<T extends View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: StandardMap,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(WIDGET_NAME.MENU);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const application = this.application;
            iterateArray(element.children, (item: HTMLElement) => {
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
                if (targetElement && !includes(application.getDatasetName('use', targetElement), WIDGET_NAME.COORDINATOR)) {
                    application.rootElements.add(element);
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const application = this.application;
        const resource = <android.base.Resource<T>> this.resource;
        const settings = <UserSettings> application.userSettings;
        const element = <HTMLElement> node.element;
        const options: StandardMap = { ...this.options[element.id] };
        const toolbarOptions = createViewAttribute(options.self);
        const appBarOptions = createViewAttribute(options.appBar);
        const collapsingToolbarOptions = createViewAttribute(options.collapsingToolbar);
        const numberResourceValue = application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
        const hasMenu = Toolbar.findNestedElement(node, WIDGET_NAME.MENU);
        const backgroundImage = node.has('backgroundImage');
        const appBarChildren: T[] = [];
        const collapsingToolbarChildren: T[] = [];
        let app = safeNestedMap<string>(toolbarOptions, 'app');
        iterateArray(element.children, (item: HTMLElement) => {
            const dataset = item.dataset;
            if (item.tagName === 'IMG') {
                if (dataset.navigationIcon) {
                    const src = resource.addImageSrc(<HTMLImageElement> item, PREFIX_MENU);
                    if (src !== '') {
                        assignEmptyValue(app, 'navigationIcon', `@drawable/${src}`);
                    }
                }
                if (dataset.collapseIcon) {
                    const src = resource.addImageSrc(<HTMLImageElement> item, PREFIX_MENU);
                    if (src !== '') {
                        assignEmptyValue(app, 'collapseIcon', `@drawable/${src}`);
                    }
                }
            }
            if (!dataset.androidTarget) {
                const targetNode = getElementAsNode<T>(item, node.sessionId);
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
        const [controlName, appBarName, collapsingToolbarName] = node.api < BUILD_ANDROID.Q ? [SUPPORT_ANDROID.TOOLBAR, SUPPORT_ANDROID.APPBAR, SUPPORT_ANDROID.COLLAPSING_TOOLBAR] : [SUPPORT_ANDROID_X.TOOLBAR, SUPPORT_ANDROID_X.APPBAR, SUPPORT_ANDROID_X.COLLAPSING_TOOLBAR];
        const hasCollapsingToolbar = 'collapsingToolbar' in options || collapsingToolbarChildren.length > 0;
        const hasAppBar = 'appBar' in options || appBarChildren.length > 0 || hasCollapsingToolbar;
        let appBarOverlay = '';
        let popupOverlay = '';
        if (hasCollapsingToolbar) {
            assignEmptyValue(app, 'layout_collapseMode', 'pin');
        }
        else {
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
        }
        else {
            node.exclude({ procedure: NODE_PROCEDURE.LAYOUT });
            assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
        }
        assignEmptyValue(toolbarOptions, 'android', 'layout_height', hasAppBar || !node.hasPX('height') ? '?android:attr/actionBarSize' : '');
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
        let appBarNode: Undef<T>;
        let collapsingToolbarNode: Undef<T>;
        if (hasAppBar) {
            let android = appBarOptions.android;
            assignEmptyValue(appBarOptions, 'android', 'id', `@+id/${node.controlId}_appbar`);
            assignEmptyValue(appBarOptions, 'android', 'layout_height', node.hasHeight ? formatPX(node.actualHeight) : 'wrap_content');
            assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
            if (hasMenu) {
                if (android.theme) {
                    appBarOverlay = android.theme;
                }
                android.theme = `@style/${settings.manifestThemeName}.AppBarOverlay`;
                node.data(WIDGET_NAME.TOOLBAR, 'themeData', <ToolbarThemeData> { appBarOverlay, popupOverlay });
            }
            else {
                assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
            }
            appBarNode = this.createPlaceholder(node, appBarChildren, node.target);
            appBarNode.parent = parent;
            let id = android.id;
            if (isString(id)) {
                appBarNode.controlId = getDocumentId(id);
                delete android.id;
            }
            appBarNode.setControlType(appBarName, CONTAINER_NODE.BLOCK);
            if (hasCollapsingToolbar) {
                app = safeNestedMap(collapsingToolbarOptions, 'app');
                assignEmptyValue(collapsingToolbarOptions, 'android', 'id', `@+id/${node.controlId}_collapsingtoolbar`);
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
        let outputAs: Undef<NodeXmlTemplate<T>>;
        if (appBarNode) {
            appBarNode.setLayoutWidth('match_parent');
            appBarNode.setLayoutHeight('wrap_content');
            appBarNode.apply(Resource.formatOptions(appBarOptions, numberResourceValue));
            appBarNode.render(parent);
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
                    collapsingToolbarNode.renderParent as T,
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
                        const controller = <android.base.Controller<T>> this.controller;
                        const backgroundImageOptions = createViewAttribute(options.backgroundImage);
                        let scaleType: string;
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
                                    height: 'match_parent'
                                },
                                Resource.formatOptions(backgroundImageOptions, numberResourceValue)
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
            node.render(parent);
        }
        node.setLayoutWidth('match_parent');
        node.apply(Resource.formatOptions(toolbarOptions, numberResourceValue));
        const output: NodeXmlTemplate<T> = {
            type: NODE_TEMPLATE.XML,
            node,
            controlName
        };
        if (appBarNode) {
            return {
                output,
                outerParent: node.parent as T,
                renderAs: appBarNode,
                outputAs,
                include: true
            };
        }
        else {
            return {
                output,
                include: true
            };
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
        const menu = Toolbar.findNestedElement(node, WIDGET_NAME.MENU)?.dataset['layoutName' + capitalize(this.application.systemName)];
        if (menu) {
            const toolbarOptions = createViewAttribute(this.options[node.elementId]?.self);
            const app = safeNestedMap<string>(toolbarOptions, 'app');
            assignEmptyValue(app, 'menu', `@menu/${menu}`);
            node.app('menu', app.menu);
        }
        const themeData: ToolbarThemeData = node.data(WIDGET_NAME.TOOLBAR, 'themeData');
        if (themeData) {
            const settings = <UserSettings> this.application.userSettings;
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
            Resource.addTheme(options);
            Resource.addTheme(optionsActionBar);
            Resource.addTheme(optionsAppBar);
            Resource.addTheme(optionsPopup);
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

    public createPlaceholder(node: T, children: T[], target?: Null<HTMLElement>) {
        const delegate = children.length > 0;
        const container = this.application.createNode({ parent: node, children, delegate, cascade: true });
        container.inherit(node, 'base');
        if (delegate) {
            let containerIndex = Infinity;
            children.forEach(item => containerIndex = Math.min(containerIndex, item.containerIndex));
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