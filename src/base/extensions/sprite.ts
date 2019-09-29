import { ImageAsset } from '../../../@types/base/application';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';

const $css = squared.lib.css;

export default abstract class Sprite<T extends NodeUI> extends ExtensionUI<T> {
    public is() {
        return true;
    }

    public condition(node: T) {
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '' && node.hasWidth && node.hasHeight && node.length === 0 && (this.included(<HTMLElement> node.element) || !node.dataset.use)) {
            const image = <ImageAsset> (this.resource.getRawData(backgroundImage) || this.resource.getImage($css.resolveURL(backgroundImage)));
            if (image) {
                const pattern = /^0[a-z%]+|left|start|top/;
                const dimension = node.actualDimension;
                const backgroundPositionX = node.css('backgroundPositionX');
                const backgroundPositionY = node.css('backgroundPositionY');
                const position = $css.getBackgroundPosition(backgroundPositionX + ' ' + backgroundPositionY, dimension, node.fontSize);
                const x = (position.left < 0 || pattern.test(backgroundPositionX)) && image.width > dimension.width;
                const y = (position.top < 0 || pattern.test(backgroundPositionY)) && image.height > dimension.height;
                if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                    node.data(EXT_NAME.SPRITE, STRING_BASE.EXT_DATA, { image, position });
                    return true;
                }
            }
        }
        return false;
    }
}