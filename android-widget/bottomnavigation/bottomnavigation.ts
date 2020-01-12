import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

const { assignEmptyValue, optionalAsString } = squared.lib.util;

const { NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const $lib = android.lib;
const { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X } = $lib.constant;
const { BUILD_ANDROID, CONTAINER_NODE } = $lib.enumeration;
const { createStyleAttribute, createViewAttribute } = $lib.util;

const { Resource } = android.base;

export default class BottomNavigation<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(WIDGET_NAME.MENU);
    }

    public processNode(node: T, parent: T) {
        const options = createViewAttribute(this.options[node.elementId]);
        assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
        const children = node.children;
        const length = children.length;
        for (let i = 5; i < length; i++) {
            const item = children[i] as T;
            item.hide();
            for (const child of item.cascade() as T[]) {
                child.hide();
            }
        }
        const controlName = node.api < BUILD_ANDROID.Q ? SUPPORT_ANDROID.BOTTOM_NAVIGATION : SUPPORT_ANDROID_X.BOTTOM_NAVIGATION;
        node.setControlType(controlName, CONTAINER_NODE.BLOCK);
        node.exclude({ resource: NODE_RESOURCE.ASSET });
        node.render(parent);
        node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('wrap_content');
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        this.setStyleTheme();
        return {
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true
        };
    }

    public afterParseDocument() {
        for (const node of this.subscribers) {
            const renderParent = node.renderParent as T;
            if (!renderParent.hasPX('width')) {
                renderParent.setLayoutWidth('match_parent');
            }
            if (!renderParent.hasPX('height')) {
                renderParent.setLayoutHeight('match_parent');
            }
            const menu = optionalAsString(BottomNavigation.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
            if (menu !== '') {
                const options = createViewAttribute(this.options[node.elementId]);
                let app = options.app;
                if (app === undefined) {
                    app = {};
                    options.app = app;
                }
                assignEmptyValue(app, 'menu', '@menu/' + menu);
                node.app('menu', app.menu);
            }
        }
    }

    private setStyleTheme() {
        const options = createStyleAttribute(this.options.resource);
        assignEmptyValue(options, 'name', (<UserSettingsAndroid> this.application.userSettings).manifestThemeName);
        assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
        Resource.addTheme(options);
    }
}