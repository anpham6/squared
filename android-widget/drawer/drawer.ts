import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

const {
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

export default class Drawer<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;

    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require($constA.EXT_ANDROID.EXTERNAL, true);
        this.require(WIDGET_NAME.MENU);
        this.require(WIDGET_NAME.COORDINATOR);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const children = element.children;
            const length = children.length;
            if (length) {
                for (let i = 0; i < length; i++) {
                    const item = <HTMLElement> children[i];
                    if (item.tagName === 'NAV' && !$util.includes(item.dataset.use, $constA.EXT_ANDROID.EXTERNAL)) {
                        item.dataset.use = (item.dataset.use ? item.dataset.use + ', ' : '') + $constA.EXT_ANDROID.EXTERNAL;
                    }
                }
                this.application.rootElements.add(element);
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const options = $utilA.createViewAttribute(this.options.self);
        if (Drawer.findNestedElement(node.element, WIDGET_NAME.MENU)) {
            $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
            this.setStyleTheme(node.localSettings.targetAPI);
        }
        else {
            const navigationViewOptions = $utilA.createViewAttribute(this.options.navigationView);
            $util.assignEmptyValue(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
            const navView = node.item() as T;
            navView.mergeGravity('layout_gravity', navigationViewOptions.android.layout_gravity);
            navView.setLayoutHeight('match_parent');
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.renderExclude = false;
        const controlName = node.localSettings.targetAPI < $enumA.BUILD_ANDROID.Q ? $constA.SUPPORT_ANDROID.DRAWER : $constA.SUPPORT_ANDROID_X.DRAWER;
        node.setControlType(controlName, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.FONT_STYLE);
        node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.render(parent);
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('match_parent');
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true,
            remove: true
        };
    }

    public afterParseDocument() {
        for (const node of this.subscribers) {
            const options = $utilA.createViewAttribute(this.options.navigationView);
            const menu = $util.optionalAsString(Drawer.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
            const headerLayout = $util.optionalAsString(Drawer.findNestedElement(node.element, $constA.EXT_ANDROID.EXTERNAL), 'dataset.layoutName');
            if (menu !== '') {
                $util.assignEmptyValue(options, 'app', 'menu', '@menu/' + menu);
            }
            if (headerLayout !== '') {
                $util.assignEmptyValue(options, 'app', 'headerLayout', '@layout/' + headerLayout);
            }
            if (menu !== '' || headerLayout !== '') {
                const controller = <android.base.Controller<T>> this.controller;
                $util.assignEmptyValue(options, 'android', 'id', node.documentId + '_navigation');
                $util.assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                $util.assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
                controller.addAfterInsideTemplate(
                    node.id,
                    controller.renderNodeStatic(
                        node.localSettings.targetAPI < $enumA.BUILD_ANDROID.Q ? $constA.SUPPORT_ANDROID.NAVIGATION_VIEW : $constA.SUPPORT_ANDROID_X.NAVIGATION_VIEW,
                        $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
                        'wrap_content',
                        'match_parent'
                    )
                );
            }
        }
    }

    public postOptimize(node: T) {
        const element = Drawer.findNestedElement(node.element, WIDGET_NAME.COORDINATOR);
        if (element) {
            const coordinator = $session.getElementAsNode<T>(element, node.sessionId);
            if (coordinator && coordinator.inlineHeight && coordinator.some((item: T) => item.positioned)) {
                coordinator.setLayoutHeight('match_parent');
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