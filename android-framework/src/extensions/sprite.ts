import type { RawAsset } from '../../../@types/base/application';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { formatPX } = squared.lib.css;

const $base_lib = squared.base.lib;
const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } = $base_lib.enumeration;

const SPRITE = $base_lib.constant.EXT_NAME.SPRITE;

type SpriteData = {
    image: Required<RawAsset>;
    position: BoxRectPosition;
};

export default class <T extends View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const mainData: SpriteData = node.data(SPRITE, 'mainData');
        if (mainData) {
            const drawable = (<android.base.Resource<T>> this.resource).addImageSrc(node.backgroundImage);
            if (drawable !== '') {
                const { width, height } = mainData.image;
                const { top, left } = mainData.position;
                const container = this.application.createNode({ parent, replace: node });
                container.inherit(node, 'base', 'initial', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude({ resource: NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.CUSTOMIZATION, section: APP_SECTION.ALL });
                node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                node.resetBox(BOX_STANDARD.MARGIN);
                node.resetBox(BOX_STANDARD.PADDING);
                node.registerBox(BOX_STANDARD.MARGIN_TOP, container);
                node.registerBox(BOX_STANDARD.MARGIN_RIGHT, container);
                node.registerBox(BOX_STANDARD.MARGIN_BOTTOM, container);
                node.registerBox(BOX_STANDARD.MARGIN_LEFT, container);
                node.exclude({ resource: NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.BOX_SPACING });
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: width > 0 ? formatPX(width) : 'auto',
                    height: height > 0 ? formatPX(height) : 'auto',
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
                node.android('src', `@drawable/${drawable}`);
                node.android('layout_marginTop', formatPX(top));
                node.android(node.localizeString('layout_marginLeft'), formatPX(left));
                return {
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI(
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