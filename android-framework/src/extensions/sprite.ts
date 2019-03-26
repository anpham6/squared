import { ImageAsset } from '../../../src/base/@types/application';

import Resource from '../resource';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class <T extends android.base.View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const mainData = <Required<ImageAsset>> node.data($const.EXT_NAME.SPRITE, 'mainData');
        if (mainData) {
            const container = this.application.createNode(<HTMLElement> node.element);
            container.inherit(node, 'initial', 'base', 'styleMap');
            container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
            container.exclude({
                procedure: $enum.NODE_PROCEDURE.CUSTOMIZATION,
                resource: $enum.NODE_RESOURCE.IMAGE_SOURCE
            });
            parent.appendTry(node, container);
            this.application.processing.cache.append(container, false);
            node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
            node.exclude({
                procedure: $enum.NODE_PROCEDURE.AUTOFIT,
                resource: $enum.NODE_RESOURCE.FONT_STYLE | $enum.NODE_RESOURCE.BOX_STYLE
            });
            node.cssApply({
                position: 'static',
                top: 'auto',
                right: 'auto',
                bottom: 'auto',
                left: 'auto',
                display: 'inline-block',
                width: $util.formatPX(mainData.width),
                height: $util.formatPX(mainData.height),
                marginTop: $util.formatPX(mainData.position.y),
                marginRight: '0px',
                marginBottom: '0px',
                marginLeft: $util.formatPX(mainData.position.x),
                paddingTop: '0px',
                paddingRight: '0px',
                paddingBottom: '0px',
                paddingLeft: '0px',
                borderTopStyle: 'none',
                borderRightStyle: 'none',
                borderBottomStyle: 'none',
                borderLeftStyle: 'none',
                borderRadius: '0px',
                backgroundPositionX: '0px',
                backgroundPositionY: '0px',
                backgroundColor: 'transparent'
            });
            node.unsetCache();
            node.exclude({ procedure: $enum.NODE_PROCEDURE.OPTIMIZATION });
            node.android('src', `@drawable/${Resource.addImage({ mdpi: mainData.uri })}`);
            node.outerParent = container;
            node.parent = container;
            return {
                renderAs: container,
                outputAs: this.application.renderNode(
                    new $Layout(
                        parent,
                        container,
                        CONTAINER_NODE.FRAME,
                        $enum.NODE_ALIGNMENT.SINGLE,
                        container.children as T[]
                    )
                ),
                parent: container,
                complete: true
            };
        }
        return undefined;
    }
}