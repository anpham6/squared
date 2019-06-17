import { NodeXmlTemplate } from '../../src/base/@types/application';
import { UserSettingsAndroid } from '../../android-framework/src/@types/application';

import { WIDGET_NAME } from '../lib/constant';

const {
    constant: $const,
    util: $util
} = squared.lib;

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
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require(WIDGET_NAME.MENU);
    }

    public processNode(node: T, parent: T) {
        const options = $utilA.createViewAttribute(this.options[node.elementId]);
        $util.assignEmptyValue(options, $constA.STRING_ANDROID.ANDROID, 'background', `?android:attr/windowBackground`);
        const children = node.children;
        const length = children.length;
        for (let i = 5; i < length; i++) {
            const item = children[i] as T;
            item.hide();
            for (const child of item.cascade() as T[]) {
                child.hide();
            }
        }
        node.setControlType($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude($e.NODE_RESOURCE.ASSET);
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
            if (!renderParent.hasPX($const.CSS.WIDTH)) {
                renderParent.setLayoutWidth($constA.STRING_ANDROID.MATCH_PARENT);
            }
            if (!renderParent.hasPX($const.CSS.HEIGHT)) {
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