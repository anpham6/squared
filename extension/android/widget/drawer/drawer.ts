import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import BUILD_VERSION = android.lib.constant.BUILD_VERSION;
import EXT_ANDROID = android.base.EXT_ANDROID;

import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const { NODE_RESOURCE } = squared.base.lib.constant;
const { CONTAINER_NODE, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X } = android.lib.constant;

const { assignEmptyValue, cloneObject, iterateArray } = squared.lib.util;
const { createThemeAttribute, createViewAttribute } = android.lib.util;

const Resource = android.base.Resource;

export default class Drawer<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;

    constructor(name: string, framework: number, options?: ExtensionUIOptions) {
        super(name, framework, options);
        this.require({ name: EXT_ANDROID.EXTERNAL, leading: true });
        this.require({ name: WIDGET_NAME.MENU });
        this.require({ name: WIDGET_NAME.COORDINATOR });
    }

    public beforeInsertNode(element: HTMLElement, sessionId: string) {
        if (this.included(element)) {
            const application = this.application;
            iterateArray(element.children, (item: HTMLElement) => {
                if (item.tagName === 'NAV') {
                    const use = application.getDatasetName('use', item);
                    if (!Drawer.includes(use, EXT_ANDROID.EXTERNAL)) {
                        application.setDatasetName('use', item, (use ? use + ', ' : '') + EXT_ANDROID.EXTERNAL);
                    }
                }
            });
            application.getProcessing(sessionId)!.rootElements.add(element);
            return true;
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
            const navView = node.item(-1) as T;
            navView.mergeGravity('layout_gravity', navigationViewOptions.android.layout_gravity!);
            navView.setLayoutHeight('match_parent');
            navView.positioned = true;
        }
        node.documentRoot = true;
        node.renderExclude = false;
        const controlName = node.api < BUILD_VERSION.Q ? SUPPORT_TAGNAME.DRAWER : SUPPORT_TAGNAME_X.DRAWER;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
        node.apply(Resource.formatOptions(options, this.application.extensionManager.valueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource')));
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

    public afterParseDocument(sessionId: string) {
        for (const node of this.subscribers) {
            if (node.sessionId === sessionId) {
                const systemName = node.localSettings.systemName;
                const options = createViewAttribute(this.options.navigationView);
                const menu = Drawer.findNestedElement(node, WIDGET_NAME.MENU)?.dataset['layoutName' + systemName];
                const headerLayout = Drawer.findNestedElement(node, EXT_ANDROID.EXTERNAL)?.dataset['layoutName' + systemName];
                const app = options.app ||= {};
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
                        node,
                        controller.renderNodeStatic(
                            {
                                controlName: node.api < BUILD_VERSION.Q ? SUPPORT_TAGNAME.NAVIGATION_VIEW : SUPPORT_TAGNAME_X.NAVIGATION_VIEW,
                                width: 'wrap_content',
                                height: 'match_parent'
                            },
                            Resource.formatOptions(options, this.application.extensionManager.valueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource'))
                        )
                    );
                }
            }
        }
    }

    public postOptimize(node: T) {
        for (const parent of node.ascend() as T[]) {
            if (!parent.hasHeight) {
                parent.setLayoutHeight('match_parent');
            }
        }
    }

    public setStyleTheme(api: number) {
        const settings = this.application.userSettings;
        const options = createThemeAttribute(this.options.resource);
        assignEmptyValue(options, 'name', settings.manifestThemeName);
        assignEmptyValue(options, 'parent', settings.manifestParentThemeName);
        assignEmptyValue(options.items, 'android:windowTranslucentStatus', 'true');
        Resource.addTheme(options);
        if (api >= BUILD_VERSION.LOLLIPOP) {
            const themeOptions = createThemeAttribute(cloneObject(options));
            const items: StringMap = {};
            assignEmptyValue(themeOptions.output, 'path', 'res/values-v21');
            assignEmptyValue(items, 'android:windowDrawsSystemBarBackgrounds', 'true');
            assignEmptyValue(items, 'android:statusBarColor', '@android:color/transparent');
            themeOptions.items = items;
            Resource.addTheme(themeOptions);
        }
    }
}