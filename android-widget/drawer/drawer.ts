import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const $lib = squared.lib;
const $libA = android.lib;

const { assignEmptyValue, capitalize, cloneObject, safeNestedMap, includes, iterateArray } = $lib.util;
const { getElementAsNode } = $lib.session;

const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $libA.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $libA.enumeration;
const { createStyleAttribute, createViewAttribute } = $libA.util;

const Resource = android.base.Resource;

export default class Drawer<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;

    constructor(
        name: string,
        framework: number,
        options?: StandardMap,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(EXT_ANDROID.EXTERNAL, true);
        this.require(WIDGET_NAME.MENU);
        this.require(WIDGET_NAME.COORDINATOR);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const application = this.application;
            const result = iterateArray(element.children, (item: HTMLElement) => {
                if (item.tagName === 'NAV') {
                    const use = application.getDatasetName('use', item);
                    if (!includes(use, EXT_ANDROID.EXTERNAL)) {
                        application.setDatasetName('use', item, (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL);
                    }
                }
            });
            if (result) {
                application.rootElements.add(element);
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const options = createViewAttribute(this.options.self);
        if (Drawer.findNestedElement(node, WIDGET_NAME.MENU)) {
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
            output: {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            } as NodeXmlTemplate<T>,
            complete: true,
            include: true,
            remove: true
        };
    }

    public afterParseDocument() {
        const systemName = capitalize(this.application.systemName);
        for (const node of this.subscribers) {
            const options = createViewAttribute(this.options.navigationView);
            const menu = Drawer.findNestedElement(node, WIDGET_NAME.MENU)?.dataset['layoutName' + systemName];
            const headerLayout = Drawer.findNestedElement(node, EXT_ANDROID.EXTERNAL)?.dataset['layoutName' + systemName];
            const app = safeNestedMap(options, 'app');
            if (menu) {
                assignEmptyValue(app, 'menu', `@menu/${menu}`);
            }
            if (headerLayout) {
                assignEmptyValue(app, 'headerLayout', `@layout/${headerLayout}`);
            }
            if (menu || headerLayout) {
                const controller = this.controller as android.base.Controller<T>;
                assignEmptyValue(options, 'android', 'id', `@+id/${node.controlId}_navigation`);
                assignEmptyValue(options, 'android', 'fitsSystemWindows', 'true');
                assignEmptyValue(options, 'android', 'layout_gravity', node.localizeString('left'));
                controller.addAfterInsideTemplate(
                    node.id,
                    controller.renderNodeStatic(
                        {
                            controlName: node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.NAVIGATION_VIEW : SUPPORT_ANDROID_X.NAVIGATION_VIEW,
                            width: 'wrap_content',
                            height: 'match_parent'
                        },
                        Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'))
                    )
                );
            }
        }
    }

    public postOptimize(node: T) {
        const element = Drawer.findNestedElement(node, WIDGET_NAME.COORDINATOR);
        if (element) {
            const coordinator = getElementAsNode<T>(element, node.sessionId);
            if (coordinator?.inlineHeight && coordinator.some((item: T) => item.positioned)) {
                coordinator.setLayoutHeight('match_parent');
            }
        }
    }

    public setStyleTheme(api: number) {
        const settings = this.application.userSettings as AndroidUserSettingsUI;
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