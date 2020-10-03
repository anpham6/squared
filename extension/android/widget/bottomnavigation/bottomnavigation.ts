import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import BUILD_VERSION = android.lib.constant.BUILD_VERSION;

import { WIDGET_NAME } from '../lib/constant';

const { NODE_RESOURCE } = squared.base.lib.constant;
const { CONTAINER_NODE, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X } = android.lib.constant;

const { assignEmptyValue, capitalize, iterateArray } = squared.lib.util;
const { createThemeAttribute, createViewAttribute } = android.lib.util;

const Resource = android.base.Resource;

export default class BottomNavigation<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    constructor(name: string, framework: number, options?: ExtensionUIOptions) {
        super(name, framework, options);
        this.require({ name: WIDGET_NAME.MENU });
    }

    public processNode(node: T, parent: T) {
        const options = createViewAttribute(this.options[node.elementId]);
        assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
        iterateArray(node.children, (item: T) => {
            item.hide();
            item.cascade((child: T) => {
                child.hide();
            });
        }, 5);
        const controlName = node.api < BUILD_VERSION.Q ? SUPPORT_TAGNAME.BOTTOM_NAVIGATION : SUPPORT_TAGNAME_X.BOTTOM_NAVIGATION;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.ASSET });
        node.render(parent);
        node.apply(Resource.formatOptions(options, this.application.extensionManager.valueAsBoolean(android.base.EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource')));
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('wrap_content');
        node.cascade((item: T) => this.addDescendant(item));
        this.setStyleTheme();
        return {
            output: {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            } as NodeXmlTemplate<T>,
            complete: true,
            include: true
        };
    }

    public postOptimize(node: T) {
        const renderParent = node.renderParent as T;
        if (renderParent.documentRoot) {
            if (renderParent.inlineWidth) {
                renderParent.setLayoutWidth('match_parent');
            }
            if (renderParent.inlineHeight) {
                renderParent.setLayoutHeight('match_parent');
            }
        }
        const menu = BottomNavigation.findNestedElement(node, WIDGET_NAME.MENU)?.dataset['layoutName' + capitalize(this.application.systemName)];
        if (menu) {
            const options = createViewAttribute(this.options[node.elementId]);
            const app = options.app ||= {};
            assignEmptyValue(app, 'menu', `@menu/${menu}`);
            node.app('menu', app.menu);
        }
    }

    public setStyleTheme() {
        const options = createThemeAttribute(this.options.resource);
        assignEmptyValue(options, 'name', this.application.userSettings.manifestThemeName);
        assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
        Resource.addTheme(options);
    }
}