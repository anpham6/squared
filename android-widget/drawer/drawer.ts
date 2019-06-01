import { NodeXmlTemplate } from '../../src/base/@types/application';
import { UserSettingsAndroid } from '../../android-framework/src/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $const = squared.lib.constant;
const $session = squared.lib.session;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

export default class Drawer<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.documentBase = true;
        this.require($c.EXT_NAME.EXTERNAL, true);
        this.require(WIDGET_NAME.MENU);
        this.require(WIDGET_NAME.COORDINATOR);
    }

    public init(element: HTMLElement) {
        if (this.included(element) && element.children.length) {
            for (let i = 0; i < element.children.length; i++) {
                const item = <HTMLElement> element.children[i];
                if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $c.EXT_NAME.EXTERNAL)) {
                    item.dataset.use = (item.dataset.use ? `${item.dataset.use}, ` : '') + $c.EXT_NAME.EXTERNAL;
                }
            }
            this.application.rootElements.add(element);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const options = $utilA.createViewAttribute(this.options.self);
        if (Drawer.findNestedElement(node.element, WIDGET_NAME.MENU)) {
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
            this.setStyleTheme(node.localSettings.targetAPI);
        }
        else {
            const navigationViewOptions = $utilA.createViewAttribute(this.options.navigationView);
            $util.assignEmptyValue(navigationViewOptions, $constA.STRING_ANDROID.ANDROID, $constA.STRING_ANDROID.LAYOUT_GRAVITY, node.localizeString($const.CSS.LEFT));
            const navView = node.item() as T;
            navView.mergeGravity($constA.STRING_ANDROID.LAYOUT_GRAVITY, navigationViewOptions.android.layout_gravity);
            navView.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT);
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.renderExclude = false;
        node.setControlType($constA.SUPPORT_ANDROID.DRAWER, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.FONT_STYLE);
        node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.render(parent);
        node.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
        node.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT);
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName: $constA.SUPPORT_ANDROID.DRAWER
            },
            complete: true
        };
    }

    public postParseDocument(node: T) {
        const options = $utilA.createViewAttribute(this.options.navigationView);
        const menu = $util.optionalAsString(Drawer.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        const headerLayout = $util.optionalAsString(Drawer.findNestedElement(node.element, $c.EXT_NAME.EXTERNAL), 'dataset.layoutName');
        if (menu !== '') {
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.APP, 'menu', `@menu/${menu}`);
        }
        if (headerLayout !== '') {
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.APP, 'headerLayout', `@layout/${headerLayout}`);
        }
        if (menu !== '' || headerLayout !== '') {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, 'id', `${node.documentId}_navigation`);
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, 'fitsSystemWindows', 'true');
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, $constA.STRING_ANDROID.LAYOUT_GRAVITY, node.localizeString($const.CSS.LEFT));
            controller.addAfterInsideTemplate(
                node.id,
                controller.renderNodeStatic(
                    $constA.SUPPORT_ANDROID.NAVIGATION_VIEW,
                    $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
                    $constA.STRING_ANDROID.WRAP_CONTENT,
                    $constA.STRING_ANDROID.MATCH_PARENT
                )
            );
        }
    }

    public postOptimize(node: T) {
        const element = Drawer.findNestedElement(node.element, WIDGET_NAME.COORDINATOR);
        if (element) {
            const coordinator = $session.getElementAsNode<T>(element, node.sessionId);
            if (coordinator && coordinator.inlineHeight && coordinator.some((item: T) => item.positioned)) {
                coordinator.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT);
            }
        }
    }

    private setStyleTheme(api: number) {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        const options = $utilA.createStyleAttribute(this.options.resource);
        $util.assignEmptyValue(options, 'name', settings.manifestThemeName);
        $util.assignEmptyValue(options, $constA.STRING_ANDROID.PARENT, settings.manifestParentThemeName);
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