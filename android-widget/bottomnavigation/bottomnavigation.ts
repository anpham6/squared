import { NodeXmlTemplate } from '../../src/base/@types/application';
import { UserSettingsAndroid } from '../../android-framework/src/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import $Resource = android.base.Resource;

const $const = squared.lib.constant;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;
const $e = squared.base.lib.enumeration;

export default class BottomNavigation<T extends android.base.View> extends squared.base.Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require(WIDGET_NAME.MENU);
    }

    public processNode(node: T, parent: T) {
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, 'background', `?android:attr/windowBackground`);
        for (let i = 5; i < node.length; i++) {
            const item = node.item(i) as T;
            item.hide();
            for (const child of item.cascade()) {
                child.hide();
            }
        }
        node.setControlType($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $e.NODE_RESOURCE.ASSET });
        node.render(parent);
        node.apply($Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        node.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
        node.setLayoutHeight($constA.STRING_ANDROID.WRAP_CONTENT);
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        this.setStyleTheme();
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName: $constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION
            },
            complete: true
        };
    }

    public postBaseLayout(node: T) {
        const renderParent = node.renderParent as T;
        if (renderParent) {
            if (!renderParent.has($const.CSS.WIDTH)) {
                renderParent.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
            }
            if (!renderParent.has($const.CSS.HEIGHT)) {
                renderParent.setLayoutHeight($constA.STRING_ANDROID.MATCH_PARENT);
            }
        }
        const menu = $util.optionalAsString(BottomNavigation.findNestedElement(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        if (menu !== '') {
            const options = $utilA.createViewAttribute(this.options[node.elementId]);
            $util.assignEmptyValue(options, $constA.STRING_ANDROID.APP, 'menu', `@menu/${menu}`);
            node.app('menu', options.app.menu);
        }
    }

    private setStyleTheme() {
        const options = $utilA.createStyleAttribute(this.options.resource);
        $util.assignEmptyValue(options, 'name', (<UserSettingsAndroid> this.application.userSettings).manifestThemeName);
        $util.assignEmptyValue(options, $constA.STRING_ANDROID.PARENT, 'Theme.AppCompat.Light.DarkActionBar');
        $Resource.addTheme(options);
    }
}