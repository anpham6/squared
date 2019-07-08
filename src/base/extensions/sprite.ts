import { ImageAsset } from '../../../@types/base/application';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';

const $css = squared.lib.css;

export default abstract class Sprite<T extends NodeUI> extends ExtensionUI<T> {
    public condition(node: T) {
        const backgroundImage = node.backgroundImage;
        let valid = false;
        if (backgroundImage !== '' && node.hasWidth && node.hasHeight && node.length === 0 && (this.included(<HTMLElement> node.element) || !node.dataset.use)) {
            const image = <ImageAsset> (this.resource.getRawData(backgroundImage) || this.resource.getImage($css.resolveURL(backgroundImage)));
            if (image) {
                const dimension = node.actualDimension;
                const position = $css.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, undefined, node.fontSize);
                const x = position.left < 0 && image.width > dimension.width;
                const y = position.top < 0 && image.height > dimension.height;
                if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                    node.data(EXT_NAME.SPRITE, STRING_BASE.EXT_DATA, { image, position });
                    valid = true;
                }
            }
        }
        return valid;
    }
}