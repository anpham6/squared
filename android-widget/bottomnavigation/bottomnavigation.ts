import { ExtensionResult } from '../../src/base/@types/application';

import { WIDGET_NAME } from '../lib/constant';

import EXTENSION_GENERIC_TMPL from '../lib/templates/generic';

import $Resource = android.base.Resource;
import $View = android.base.View;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

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
        const options = $utilA.createAttribute(node.element ? this.options[node.element.id] : undefined);
        $util.defaultWhenNull(options, 'android', 'background', `?android:attr/windowBackground`);
        for (let i = 5; i < node.length; i++) {
            const item = node.item(i) as T;
            item.hide();
            item.cascade().forEach(child => child.hide());
        }
        node.setControlType($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enumA.CONTAINER_NODE.BLOCK);
        node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
        node.render(parent);
        const output = this.application.controllerHandler.renderNodeStatic(
            $constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION,
            node.renderDepth,
            $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')),
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
            const options = $utilA.createAttribute(node.element ? this.options[node.element.id] : undefined);
            $util.defaultWhenNull(options, 'app', 'menu', `@menu/${menu}`);
            node.app('menu', options.app.menu);
        }
    }

    private setStyleTheme() {
        if (this.application.resourceHandler.fileHandler) {
            const options: ExternalData = Object.assign({}, this.options.resource);
            $util.defaultWhenNull(options, 'appTheme', $utilA.getAppTheme(this.application.resourceHandler.fileHandler.assets) || 'AppTheme');
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