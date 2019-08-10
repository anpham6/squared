import { RawAsset } from '../../../@types/base/application';

import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

type SpriteData = {
    image: Required<RawAsset>,
    position: BoxRectPosition
};

const $css = squared.lib.css;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

export default class <T extends View> extends squared.base.extensions.Sprite<T> {
    public processNode(node: T, parent: T) {
        const mainData = <SpriteData> node.data($c.EXT_NAME.SPRITE, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const drawable = (<android.base.Resource<T>> this.resource).addImageSrc(node.backgroundImage);
            if (drawable !== '') {
                const { width, height } = mainData.image;
                const container = this.application.createNode();
                container.inherit(node, 'base', 'initial', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude($e.NODE_RESOURCE.IMAGE_SOURCE, $e.NODE_PROCEDURE.CUSTOMIZATION);
                parent.appendTry(node, container);
                node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                node.exclude($e.NODE_RESOURCE.FONT_STYLE | $e.NODE_RESOURCE.BOX_STYLE);
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: width > 0 ? $css.formatPX(width) : 'auto',
                    height: height > 0 ? $css.formatPX(height) : 'auto',
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
                            $e.NODE_ALIGNMENT.SINGLE,
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