import { NodeXmlTemplate } from '../../@types/base/application';
import { UserSettingsAndroid } from '../../@types/android/application';

import { WIDGET_NAME } from '../lib/constant';

const $util = squared.lib.util;

const {
    constant: $constA,
    enumeration: $enumA,
    util: $utilA
} = android.lib;

const $Resource = android.base.Resource;
const $e = squared.base.lib.enumeration;

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
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        $util.assignEmptyValue(options, 'android', 'background', '?android:attr/windowBackground');
        const children = node.children;
        const length = children.length;
        for (let i = 5; i < length; i++) {
            const item = children[i] as T;
            item.hide();
            for (const child of item.cascade() as T[]) {
                child.hide();
            }
        }
        const controlName = node.localSettings.targetAPI < $enumA.BUILD_ANDROID.Q ? $constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION : $constA.SUPPORT_ANDROID_X.BOTTOM_NAVIGATION;
        node.setControlType(controlName, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.ASSET);
        node.render(parent);
        node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.setLayoutWidth('match_parent');
        node.setLayoutHeight('wrap_content');
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        this.setStyleTheme();
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true
        };
    }

    public afterParseDocument() {
        for (const node of this.subscribers) {
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (!renderParent.hasPX('width')) {
                    renderParent.setLayoutWidth('match_parent');
                }
                if (!renderParent.hasPX('height')) {
                    renderParent.setLayoutHeight('match_parent');
                }
            }
            const menu = $util.optionalAsString(BottomNavigation.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
            if (menu !== '') {
                const options = $utilA.createViewAttribute(this.options[node.elementId]);
                $util.assignEmptyValue(options, 'app', 'menu', '@menu/' + menu);
                node.app('menu', options.app.menu);
            }
        }
    }

    private setStyleTheme() {
        const options = $utilA.createStyleAttribute(this.options.resource);
        $util.assignEmptyValue(options, 'name', (<UserSettingsAndroid> this.application.userSettings).manifestThemeName);
        $util.assignEmptyValue(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
        $Resource.addTheme(options);
    }
}