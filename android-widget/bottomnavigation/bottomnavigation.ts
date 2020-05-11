import { WIDGET_NAME } from '../lib/constant';

type View = android.base.View;

const { assignEmptyValue, capitalize, iterateArray, safeNestedMap } = squared.lib.util;
const { createStyleAttribute, createViewAttribute } = android.lib.util;

const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = android.lib.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = android.lib.enumeration;

const Resource = android.base.Resource;

export default class BottomNavigation<T extends View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: StandardMap,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(WIDGET_NAME.MENU);
    }

    public processNode(node: T, parent: T) {
        const options = createViewAttribute(this.options[node.elementId]);
        assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
        iterateArray(node.children, (item: T) => {
            item.hide();
            item.cascade((child: T) => {
                child.hide();
                return false;
            });
        }, 5);
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.BOTTOM_NAVIGATION : SUPPORT_ANDROID_X.BOTTOM_NAVIGATION;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.ASSET });
        node.render(parent);
        node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('wrap_content');
        node.cascade((item: T) => {
            this.addDescendant(item);
            return false;
        });
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
            const app = safeNestedMap<string>(options, 'app');
            assignEmptyValue(app, 'menu', `@menu/${menu}`);
            node.app('menu', app.menu);
        }
    }

    public setStyleTheme() {
        const options = createStyleAttribute(this.options.resource);
        assignEmptyValue(options, 'name', (this.application.userSettings as AndroidUserSettingsUI).manifestThemeName);
        assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
        Resource.addTheme(options);
    }
}