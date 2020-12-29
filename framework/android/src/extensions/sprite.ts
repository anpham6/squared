import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;

import { CONTAINER_NODE, CONTAINER_TAGNAME } from '../lib/constant';

import type View from '../view';

import LayoutUI = squared.base.LayoutUI;

const { APP_SECTION, NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;

const { formatPX } = squared.lib.css;

export default class <T extends View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const drawable = (this.resource as android.base.Resource<T>).addImageSrc(node.backgroundImage);
        if (drawable) {
            const { width, height, position } = this.data.get(node) as SpriteData;
            const container = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
            container.inherit(node, 'base', 'initial', 'styleMap');
            container.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
            container.exclude({ resource: NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.CUSTOMIZATION, section: APP_SECTION.ALL });
            node.setControlType(CONTAINER_TAGNAME.IMAGE, CONTAINER_NODE.IMAGE);
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
                width: width ? formatPX(width) : 'auto',
                height: height ? formatPX(height) : 'auto',
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
            node.android('layout_marginTop', formatPX(position.top));
            node.android(node.localizeString('layout_marginLeft'), formatPX(position.left));
            return {
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.FRAME,
                        NODE_ALIGNMENT.SINGLE
                    )
                ),
                parent: container,
                complete: true
            };
        }
    }
}