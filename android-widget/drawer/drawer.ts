import { ExtensionResult } from '../../src/base/types/application';

import { WIDGET_NAME } from '../lib/constant';

import EXTENSION_DRAWER_TMPL from '../lib/templates/drawer';

import $enum = squared.base.lib.enumeration;
import $const = squared.base.lib.constant;
import $dom = squared.lib.dom;
import $util = squared.lib.util;

import $Resource = android.base.Resource;
import $View = android.base.View;
import $const_android = android.lib.constant;
import $enum_android = android.lib.enumeration;
import $util_android = android.lib.util;

export default class Drawer<T extends $View> extends squared.base.Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.documentRoot = true;
        this.require($const.EXT_NAME.EXTERNAL, true);
        this.require(WIDGET_NAME.MENU);
        this.require(WIDGET_NAME.COORDINATOR);
    }

    public init(element: HTMLElement) {
        if (this.included(element) && element.children.length) {
            Array.from(element.children).forEach((item: HTMLElement) => {
                if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $const.EXT_NAME.EXTERNAL)) {
                    item.dataset.use = ($util.hasValue(item.dataset.use) ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
                }
            });
            this.application.parseElements.add(element);
            return true;
        }
        return false;
    }

    public processNode(node: T): ExtensionResult<T> {
        const options = $util_android.createAttribute(this.options.self);
        if (Drawer.findNestedByName(node.element, WIDGET_NAME.MENU)) {
            $util.defaultWhenNull(options, 'android', 'fitsSystemWindows', 'true');
            this.setStyleTheme(node.localSettings.targetAPI);
        }
        else {
            const navigationViewOptions = $util_android.createAttribute(this.options.navigationView);
            $util.defaultWhenNull(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
            const navView = node.item() as T;
            navView.android('layout_gravity', navigationViewOptions.android.layout_gravity);
            navView.android('layout_height', 'match_parent');
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.setControlType($const_android.SUPPORT_ANDROID.DRAWER, $enum_android.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE });
        const output = this.application.controllerHandler.renderNodeStatic(
            $const_android.SUPPORT_ANDROID.DRAWER,
            0,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
            'match_parent',
            'match_parent',
            node,
            true
        );
        return { output, complete: true };
    }

    public postParseDocument(node: T) {
        const application = this.application;
        const options = $util_android.createAttribute(this.options.navigation);
        const menu = $util.optionalAsString(Drawer.findNestedByName(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        const headerLayout = $util.optionalAsString(Drawer.findNestedByName(node.element, $const.EXT_NAME.EXTERNAL), 'dataset.layoutName');
        if (menu !== '') {
            $util.defaultWhenNull(options, 'app', 'menu', `@menu/${menu}`);
        }
        if (headerLayout !== '') {
            $util.defaultWhenNull(options, 'app', 'headerLayout', `@layout/${headerLayout}`);
        }
        if (menu !== '' || headerLayout !== '') {
            $util.defaultWhenNull(options, 'android', 'id', `${node.documentId}_navigation`);
            $util.defaultWhenNull(options, 'android', 'fitsSystemWindows', 'true');
            $util.defaultWhenNull(options, 'android', 'layout_gravity', node.localizeString('left'));
            const output = application.controllerHandler.renderNodeStatic(
                $const_android.SUPPORT_ANDROID.NAVIGATION_VIEW,
                1,
                $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
                'wrap_content',
                'match_parent'
            );
            application.addRenderQueue(node.id.toString(), output);
        }
    }

    public postProcedure(node: T) {
        const element = Drawer.findNestedByName(node.element, WIDGET_NAME.COORDINATOR);
        if (element) {
            const coordinator = $dom.getElementAsNode<T>(element);
            if (coordinator && coordinator.some(item => item.positioned) && coordinator.inlineHeight) {
                coordinator.android('layout_height', 'match_parent');
            }
        }
    }

    private setStyleTheme(api: number) {
        if (this.application.resourceHandler.fileHandler) {
            const options: ExternalData = Object.assign({}, this.options.resource);
            $util.defaultWhenNull(options, 'appTheme', $util_android.getAppTheme(this.application.resourceHandler.fileHandler.assets) || 'AppTheme');
            $util.defaultWhenNull(options, 'parentTheme', 'Theme.AppCompat.Light.NoActionBar');
            const data = {
                'appTheme': options.appTheme,
                'parentTheme': options.parentTheme,
                'items': []
            };
            $util.defaultWhenNull(options, 'output', 'path', `res/values${api >= 21 ? '' : '-v21'}`);
            $util.defaultWhenNull(options, 'output', 'file', `${WIDGET_NAME.DRAWER}.xml`);
            (<android.base.Resource<T>> this.application.resourceHandler).addStyleTheme(EXTENSION_DRAWER_TMPL, data, options);
        }
    }
}