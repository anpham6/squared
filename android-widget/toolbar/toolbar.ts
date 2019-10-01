import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

type ToolbarThemeData = {
    appBarOverlay: string;
    popupOverlay: string;
};

const {
    css: $css,
    session: $session,
    util: $util
} = squared.lib;

const {
    constant: $constA,
    enumeration: $enumA,
    util: $utilA
} = android.lib;

const $Resource = android.base.Resource;
const $e = squared.base.lib.enumeration;

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
                if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $constA.EXT_ANDROID.EXTERNAL)) {
                    item.dataset.use = (item.dataset.use ? item.dataset.use + ', ' : '') + $constA.EXT_ANDROID.EXTERNAL;
                    break;
                }
            }
            if (element.dataset.target) {
                const target = document.getElementById(element.dataset.target);
                if (target && element.parentElement !== target && !$util.includes(target.dataset.use, WIDGET_NAME.COORDINATOR)) {
                    (<squared.base.ApplicationUI<T>> this.application).rootElements.add(element);
                }
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const application = this.application;
        const controller = this.controller;
        const resource = <android.base.Resource<T>> this.resource;
        const settings = <UserSettingsAndroid> application.userSettings;
        const element = <HTMLElement> node.element;
        const target = node.dataset.target;
        const options: ExternalData = { ...this.options[element.id] };
        const toolbarOptions = $utilA.createViewAttribute(options.self);
        const appBarOptions = $utilA.createViewAttribute(options.appBar);
        const collapsingToolbarOptions = $utilA.createViewAttribute(options.collapsingToolbar);
        const numberResourceValue = application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
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
                        $util.assignEmptyValue(toolbarOptions, 'app', 'navigationIcon', '@drawable/' + src);
                    }
                }
                if (dataset.collapseIcon) {
                    const src = resource.addImageSrc(<HTMLImageElement> item, PREFIX_MENU);
                    if (src !== '') {
                        $util.assignEmptyValue(toolbarOptions, 'app', 'collapseIcon', '@drawable/' + src);
                    }
                }
            }
            if (!dataset.target) {
                const targetNode = $session.getElementAsNode<T>(item, node.sessionId);
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
            $util.assignEmptyValue(toolbarOptions, 'app', 'layout_collapseMode', 'pin');
        }
        else {
            $util.assignEmptyValue(toolbarOptions, 'app', 'popupTheme', '@style/ThemeOverlay.AppCompat.Light');
            if (!backgroundImage) {
                $util.assignEmptyValue(toolbarOptions, 'app', 'layout_scrollFlags', 'scroll|enterAlways');
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
            node.exclude(0, $e.NODE_PROCEDURE.LAYOUT);
            $util.assignEmptyValue(toolbarOptions, 'android', 'fitsSystemWindows', 'true');
        }
        $util.assignEmptyValue(toolbarOptions, 'android', 'layout_height', hasAppBar || !node.hasPX('height') ? '?android:attr/actionBarSize' : '');
        let controlName: string;
        let appBarName: string;
        let collapsingToolbarName: string;
        if (node.localSettings.targetAPI < $enumA.BUILD_ANDROID.Q) {
            controlName = $constA.SUPPORT_ANDROID.TOOLBAR;
            appBarName = $constA.SUPPORT_ANDROID.APPBAR;
            collapsingToolbarName = $constA.SUPPORT_ANDROID.COLLAPSING_TOOLBAR;
        }
        else {
            controlName = $constA.SUPPORT_ANDROID_X.TOOLBAR;
            appBarName = $constA.SUPPORT_ANDROID_X.APPBAR;
            collapsingToolbarName = $constA.SUPPORT_ANDROID_X.COLLAPSING_TOOLBAR;
        }
        node.setControlType(controlName, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.FONT_STYLE);
        let appBarNode: T | undefined;
        let collapsingToolbarNode: T | undefined;
        if (hasAppBar) {
            $util.assignEmptyValue(appBarOptions, 'android', 'id', node.documentId + '_appbar');
            $util.assignEmptyValue(appBarOptions, 'android', 'layout_height', node.hasHeight ? $css.formatPX(node.actualHeight) : 'wrap_content');
            $util.assignEmptyValue(appBarOptions, 'android', 'fitsSystemWindows', 'true');
            if (hasMenu) {
                if (appBarOptions.android.theme) {
                    appBarOverlay = appBarOptions.android.theme;
                }
                appBarOptions.android.theme = '@style/' + settings.manifestThemeName + '.AppBarOverlay';
                node.data(WIDGET_NAME.TOOLBAR, 'themeData', <ToolbarThemeData> { appBarOverlay, popupOverlay });
            }
            else {
                $util.assignEmptyValue(appBarOptions, 'android', 'theme', '@style/ThemeOverlay.AppCompat.Dark.ActionBar');
            }
            appBarNode = this.createPlaceholder(node, appBarChildren, target);
            appBarNode.parent = parent;
            if (appBarOptions.android.id) {
                appBarNode.controlId = $utilA.getDocumentId(appBarOptions.android.id);
            }
            appBarNode.setControlType(appBarName, $enumA.CONTAINER_NODE.BLOCK);
            if (hasCollapsingToolbar) {
                $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'id', node.documentId + '_collapsingtoolbar');
                $util.assignEmptyValue(collapsingToolbarOptions, 'android', 'fitsSystemWindows', 'true');
                if (!backgroundImage) {
                    $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'contentScrim', '?attr/colorPrimary');
                }
                $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'layout_scrollFlags', 'scroll|exitUntilCollapsed');
                $util.assignEmptyValue(collapsingToolbarOptions, 'app', 'toolbarId', node.documentId);
                collapsingToolbarNode = this.createPlaceholder(node, collapsingToolbarChildren, target);
                if (collapsingToolbarNode) {
                    collapsingToolbarNode.parent = appBarNode;
                    if (collapsingToolbarOptions.android.id) {
                        appBarNode.controlId = $utilA.getDocumentId(collapsingToolbarOptions.android.id);
                    }
                    collapsingToolbarNode.setControlType(collapsingToolbarName, $enumA.CONTAINER_NODE.BLOCK);
                    collapsingToolbarNode.each(item => item.dataset.target = (collapsingToolbarNode as T).controlId);
                }
            }
        }
        let outputAs: NodeXmlTemplate<T> | undefined;
        if (appBarNode) {
            appBarNode.setLayoutWidth('match_parent');
            appBarNode.setLayoutHeight('wrap_content');
            appBarNode.apply($Resource.formatOptions(appBarOptions, numberResourceValue));
            appBarNode.render(target ? application.resolveTarget(target) : parent);
            outputAs = {
                type: $e.NODE_TEMPLATE.XML,
                node: appBarNode,
                controlName: appBarName
            };
            if (collapsingToolbarNode) {
                node.parent = collapsingToolbarNode;
                collapsingToolbarNode.apply($Resource.formatOptions(collapsingToolbarOptions, numberResourceValue));
                collapsingToolbarNode.render(appBarNode);
                collapsingToolbarNode.setLayoutWidth('match_parent');
                collapsingToolbarNode.setLayoutHeight('match_parent');
                application.addLayoutTemplate(
                    (collapsingToolbarNode.renderParent || parent) as T,
                    collapsingToolbarNode,
                    <NodeXmlTemplate<T>> {
                        type: $e.NODE_TEMPLATE.XML,
                        node: collapsingToolbarNode,
                        controlName: collapsingToolbarName
                    }
                );
                if (backgroundImage) {
                    const src = (<android.base.Resource<T>> this.resource).addImageSrc(node.backgroundImage);
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
                        $util.assignEmptyValue(backgroundImageOptions, 'android', 'id', node.documentId + '_image');
                        $util.assignEmptyValue(backgroundImageOptions, 'android', 'src', '@drawable/' + src);
                        $util.assignEmptyValue(backgroundImageOptions, 'android', 'scaleType', scaleType);
                        $util.assignEmptyValue(backgroundImageOptions, 'android', 'fitsSystemWindows', 'true');
                        $util.assignEmptyValue(backgroundImageOptions, 'app', 'layout_collapseMode', 'parallax');
                        controller.addBeforeOutsideTemplate(
                            node.id,
                            controller.renderNodeStatic(
                                $constA.CONTAINER_ANDROID.IMAGE,
                                $Resource.formatOptions(backgroundImageOptions, numberResourceValue),
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
        node.apply($Resource.formatOptions(toolbarOptions, numberResourceValue));
        const output = <NodeXmlTemplate<T>> {
            type: $e.NODE_TEMPLATE.XML,
            node,
            controlName
        };
        if (appBarNode) {
            return {
                output,
                parentAs: node.parent as T,
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
        const menu = $util.optionalAsString(Toolbar.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        if (menu !== '') {
            const toolbarOptions = $utilA.createViewAttribute(this.options[node.elementId] && this.options[node.elementId].self);
            $util.assignEmptyValue(toolbarOptions, 'app', 'menu', '@menu/' + menu);
            node.app('menu', toolbarOptions.app.menu);
        }
        const themeData: ToolbarThemeData = node.data(WIDGET_NAME.TOOLBAR, 'themeData');
        if (themeData) {
            const settings = <UserSettingsAndroid> this.application.userSettings;
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
        placeholder.exclude($e.NODE_RESOURCE.ALL);
        placeholder.positioned = true;
        placeholder.renderExclude = false;
        return placeholder;
    }
}