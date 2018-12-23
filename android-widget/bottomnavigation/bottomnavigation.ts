import { ExtensionResult } from '../../src/base/types/application';

import { WIDGET_NAME } from '../lib/constant';

import EXTENSION_GENERIC_TMPL from '../lib/templates/generic';

import $enum = squared.base.lib.enumeration;
import $util = squared.lib.util;

import $Resource = android.base.Resource;
import $View = android.base.View;
import $const_android = android.lib.constant;
import $enum_android = android.lib.enumeration;
import $util_android = android.lib.util;

export default class BottomNavigation<T extends $View> extends squared.base.Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require(WIDGET_NAME.MENU);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const options = $util_android.createAttribute(this.options[node.element.id]);
        $util.defaultWhenNull(options, 'android', 'background', `?android:attr/windowBackground`);
        for (let i = 5; i < node.length; i++) {
            const item = node.item(i) as T;
            item.hide();
            item.cascade().forEach(child => child.hide());
        }
        node.setControlType($const_android.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enum_android.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
        node.render(parent);
        const output = this.application.controllerHandler.renderNodeStatic(
            $const_android.SUPPORT_ANDROID.BOTTOM_NAVIGATION,
            node.renderDepth,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($const_android.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
            'match_parent',
            'wrap_content',
            node
        );
        node.cascade().forEach(item => this.subscribersChild.add(item as T));
        this.setStyleTheme();
        return { output, complete: true };
    }

    public postBaseLayout(node: T) {
        const renderParent = node.renderParent as T;
        if (renderParent) {
            if (!renderParent.has('width')) {
                renderParent.android('layout_width', 'match_parent');
            }
            if (!renderParent.has('height')) {
                renderParent.android('layout_height', 'match_parent');
            }
        }
        const menu = $util.optionalAsString(BottomNavigation.findNestedByName(node.element, WIDGET_NAME.MENU), 'dataset.layoutName');
        if (menu !== '') {
            const options = $util_android.createAttribute(this.options[node.element.id]);
            $util.defaultWhenNull(options, 'app', 'menu', `@menu/${menu}`);
            node.app('menu', options.app.menu);
        }
    }

    private setStyleTheme() {
        if (this.application.resourceHandler.fileHandler) {
            const options: ExternalData = Object.assign({}, this.options.resource);
            $util.defaultWhenNull(options, 'appTheme', $util_android.getAppTheme(this.application.resourceHandler.fileHandler.assets) || 'AppTheme');
            $util.defaultWhenNull(options, 'parentTheme', 'Theme.AppCompat.Light.DarkActionBar');
            const data = {
                'appTheme': options.appTheme,
                'parentTheme': options.parentTheme,
                'items': []
            };
            $util.defaultWhenNull(options, 'output', 'path', 'res/values');
            $util.defaultWhenNull(options, 'output', 'file', `${WIDGET_NAME.BOTTOM_NAVIGATION}.xml`);
            (<android.base.Resource<T>> this.application.resourceHandler).addStyleTheme(EXTENSION_GENERIC_TMPL, data, options);
        }
    }
}