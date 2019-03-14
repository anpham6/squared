import { ExtensionResult } from '../../src/base/@types/application';
import { UserSettingsAndroid } from '../../android-framework/src/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $enum = squared.base.lib.enumeration;
const $const = squared.base.lib.constant;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

export default class Drawer<T extends android.base.View> extends squared.base.Extension<T> {
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
            for (let i = 0; i < element.children.length; i++) {
                const item = <HTMLElement> element.children[i];
                if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $const.EXT_NAME.EXTERNAL)) {
                    item.dataset.use = (item.dataset.use ? `${item.dataset.use}, ` : '') + $const.EXT_NAME.EXTERNAL;
                }
            }
            this.application.parseElements.add(element);
            return true;
        }
        return false;
    }

    public processNode(node: T): ExtensionResult<T> {
        const options = $utilA.createViewAttribute(this.options.self);
        if (Drawer.findNestedElement(node.element, WIDGET_NAME.MENU)) {
            $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
            this.setStyleTheme(node.localSettings.targetAPI);
        }
        else {
            const navigationViewOptions = $utilA.createViewAttribute(this.options.navigationView);
            $util.assignEmptyValue(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
            const navView = node.item() as T;
            navView.android('layout_gravity', navigationViewOptions.android.layout_gravity);
            navView.android('layout_height', 'match_parent');
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.setControlType($constA.SUPPORT_ANDROID.DRAWER, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE });
        const output = this.application.controllerHandler.renderNodeStatic(
            $constA.SUPPORT_ANDROID.DRAWER,
            0,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
            'match_parent',
            'match_parent',
            node,
            true
        );
        return { output, complete: true };
    }

    public postParseDocument(node: T) {
        const application = this.application;
        const options = $utilA.createViewAttribute(this.options.navigationView);
        const menu = $util.optionalAsString(Drawer.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        const headerLayout = $util.optionalAsString(Drawer.findNestedElement(node.element, $const.EXT_NAME.EXTERNAL), 'dataset.layoutName');
        if (menu !== '') {
            $util.assignEmptyValue(options, 'app', 'menu', `@menu/${menu}`);
        }
        if (headerLayout !== '') {
            $util.assignEmptyValue(options, 'app', 'headerLayout', `@layout/${headerLayout}`);
        }
        if (menu !== '' || headerLayout !== '') {
            $util.assignEmptyValue(options, 'android', 'id', `${node.documentId}_navigation`);
            $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
            $util.assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
            const output = application.controllerHandler.renderNodeStatic(
                $constA.SUPPORT_ANDROID.NAVIGATION_VIEW,
                1,
                $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
                'wrap_content',
                'match_parent'
            );
            application.addRenderQueue(node.id.toString(), output);
        }
    }

    public postProcedure(node: T) {
        const element = Drawer.findNestedElement(node.element, WIDGET_NAME.COORDINATOR);
        if (element) {
            const coordinator = $dom.getElementAsNode<T>(element);
            if (coordinator && coordinator.some(item => item.positioned) && coordinator.inlineHeight) {
                coordinator.android('layout_height', 'match_parent');
            }
        }
    }

    private setStyleTheme(api: number) {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        const options = $utilA.createStyleAttribute(this.options.resource);
        $util.assignEmptyValue(options, 'name', settings.manifestThemeName);
        $util.assignEmptyValue(options, 'parent', settings.manifestParentThemeName);
        $util.assignEmptyValue(options.items, 'android:windowTranslucentStatus', 'true');
        $Resource.addTheme(options);
        if (api >= 21) {
            const lollipop = $utilA.createStyleAttribute($util.cloneObject(options));
            lollipop.items = {};
            $util.assignEmptyValue(lollipop.output, 'path', 'res/values-v21');
            $util.assignEmptyValue(lollipop.items, 'android:windowDrawsSystemBarBackgrounds', 'true');
            $util.assignEmptyValue(lollipop.items, 'android:statusBarColor', '@android:color/transparent');
            $Resource.addTheme(lollipop);
        }
    }
}