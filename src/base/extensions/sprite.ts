import { ImageAsset } from '../@types/application';

import Extension from '../extension';
import Node from '../node';

import { EXT_NAME } from '../lib/constant';

const $css = squared.lib.css;

export default abstract class Sprite<T extends Node> extends Extension<T> {
    public condition(node: T) {
        let valid = false;
        if (node.hasWidth && node.hasHeight && node.length === 0 && node.backgroundImage !== '' && (this.included(<HTMLElement> node.element) || !node.dataset.use)) {
            const image = <ImageAsset> (this.application.resourceHandler.getRawData(node.backgroundImage) || this.application.resourceHandler.getImage($css.resolveURL(node.backgroundImage)));
            if (image) {
                const dimension = node.actualDimension;
                const position = $css.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, node.fontSize);
                if (position.left <= 0 && position.top <= 0 && image.width > dimension.width && image.height > dimension.height) {
                    node.data(EXT_NAME.SPRITE, 'mainData', { image, position });
                    valid = true;
                }
            }
        }
        return valid;
    }
}