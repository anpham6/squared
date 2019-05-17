import { RawAsset } from '../../../src/base/@types/application';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;

type SpriteData = {
    image: Required<RawAsset>,
    position: BoxRectPosition
};

export default class <T extends android.base.View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const mainData = <SpriteData> node.data($const.EXT_NAME.SPRITE, 'mainData');
        if (mainData) {
            const drawable = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(node.backgroundImage);
            if (drawable !== '') {
                const container = this.application.createNode(<HTMLElement> node.element);
                container.inherit(node, 'initial', 'base', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude({
                    procedure: $enum.NODE_PROCEDURE.CUSTOMIZATION,
                    resource: $enum.NODE_RESOURCE.IMAGE_SOURCE
                });
                parent.appendTry(node, container);
                node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                node.exclude({ resource: $enum.NODE_RESOURCE.FONT_STYLE | $enum.NODE_RESOURCE.BOX_STYLE });
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: $css.formatPX(mainData.image.width),
                    height: $css.formatPX(mainData.image.height),
                    marginTop: $css.formatPX(mainData.position.top),
                    marginRight: '0px',
                    marginBottom: '0px',
                    marginLeft: $css.formatPX(mainData.position.left),
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
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                });
                node.unsetCache();
                node.android('src', `@drawable/${drawable}`);
                node.outerWrapper = container;
                container.innerWrapped = node;
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
        }
        return undefined;
    }
}