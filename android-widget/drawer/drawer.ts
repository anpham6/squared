import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

import Resource = android.base.Resource;

const $lib = squared.lib;
const { assignEmptyValue, cloneObject, includes, optionalAsString } = $lib.util;
const { getElementAsNode } = $lib.session;

const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const $libA = android.lib;
const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
const { createStyleAttribute, createViewAttribute } = $libA.util;

export default class Drawer<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;

    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(EXT_ANDROID.EXTERNAL, true);
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
                    if (item.tagName === 'NAV') {
                        const use = item.dataset.use;
                        if (!includes(use, EXT_ANDROID.EXTERNAL)) {
                            item.dataset.use = (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL;
                        }
                    }
                }
                this.application.rootElements.add(element);
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const options = createViewAttribute(this.options.self);
        if (Drawer.findNestedElement(node.element, WIDGET_NAME.MENU)) {
            assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
            this.setStyleTheme(node.api);
        }
        else {
            const navigationViewOptions = createViewAttribute(this.options.navigationView);
            assignEmptyValue(navigationViewOptions, 'android', 'layout_gravity', node.localizeString('left'));
            const navView = node.item() as T;
            navView.mergeGravity('layout_gravity', navigationViewOptions.android.layout_gravity);
            navView.setLayoutHeight('match_parent');
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.renderExclude = false;
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.DRAWER : SUPPORT_ANDROID_X.DRAWER;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
        node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.render(parent);
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('match_parent');
        return {
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true,
            remove: true
        };
    }

    public afterParseDocument() {
        for (const node of this.subscribers) {
            const element = node.element;
            const options = createViewAttribute(this.options.navigationView);
            const menu = optionalAsString(Drawer.findNestedElement(element, WIDGET_NAME.MENU), 'dataset.layoutName');
            const headerLayout = optionalAsString(Drawer.findNestedElement(element, EXT_ANDROID.EXTERNAL), 'dataset.layoutName');
            let app = options.app;
            if (app === undefined) {
                app = {};
                options.app = app;
            }
            if (menu !== '') {
                assignEmptyValue(app, 'menu', '@menu/' + menu);
            }
            if (headerLayout !== '') {
                assignEmptyValue(app, 'headerLayout', '@layout/' + headerLayout);
            }
            if (menu !== '' || headerLayout !== '') {
                const controller = <android.base.Controller<T>> this.controller;
                assignEmptyValue(options, 'android', 'id', node.documentId.replace('@', '@+') + '_navigation');
                assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
                controller.addAfterInsideTemplate(
                    node.id,
                    controller.renderNodeStatic(
                        node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.NAVIGATION_VIEW : SUPPORT_ANDROID_X.NAVIGATION_VIEW,
                        Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
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
            const coordinator = getElementAsNode<T>(element, node.sessionId);
            if (coordinator?.inlineHeight && coordinator.some((item: T) => item.positioned)) {
                coordinator.setLayoutHeight('match_parent');
            }
        }
    }

    private setStyleTheme(api: number) {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        const options = createStyleAttribute(this.options.resource);
        assignEmptyValue(options, 'name', settings.manifestThemeName);
        assignEmptyValue(options, 'parent', settings.manifestParentThemeName);
        assignEmptyValue(options.items, 'android:windowTranslucentStatus', 'true');
        Resource.addTheme(options);
        if (api >= 21) {
            const lollipop = createStyleAttribute(cloneObject(options));
            const items = {};
            assignEmptyValue(lollipop.output, 'path', 'res/values-v21');
            assignEmptyValue(items, 'android:windowDrawsSystemBarBackgrounds', 'true');
            assignEmptyValue(items, 'android:statusBarColor', '@android:color/transparent');
            lollipop.items = items;
            Resource.addTheme(lollipop);
        }
    }
}