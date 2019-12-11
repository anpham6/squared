import { RawAsset } from '../../../@types/base/application';

import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;

const $base_lib = squared.base.lib;
const { NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } = $base_lib.enumeration;

const { SPRITE } = $base_lib.constant.EXT_NAME;

type SpriteData = {
    image: Required<RawAsset>,
    position: BoxRectPosition
};

export default class <T extends View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const mainData = <SpriteData> node.data(SPRITE, 'mainData');
        if (mainData) {
            const drawable = (<android.base.Resource<T>> this.resource).addImageSrc(node.backgroundImage);
            if (drawable !== '') {
                const { width, height } = mainData.image;
                const { top, left } = mainData.position;
                const container = this.application.createNode();
                container.inherit(node, 'base', 'initial', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude(NODE_RESOURCE.IMAGE_SOURCE, NODE_PROCEDURE.CUSTOMIZATION);
                parent.appendTry(node, container);
                node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                node.exclude(NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.BOX_STYLE);
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: width > 0 ? formatPX(width) : 'auto',
                    height: height > 0 ? formatPX(height) : 'auto',
                    marginTop: formatPX(top),
                    marginRight: '0px',
                    marginBottom: '0px',
                    marginLeft: formatPX(left),
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
                node.android('src', '@drawable/' + drawable);
                container.innerWrapped = node;
                node.outerWrapper = container;
                node.parent = container;
                return {
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new $LayoutUI(
                            parent,
                            container,
                            CONTAINER_NODE.FRAME,
                            NODE_ALIGNMENT.SINGLE,
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