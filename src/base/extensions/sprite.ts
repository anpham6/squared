import { ImageAsset } from '../../../@types/base/application';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';

const $css = squared.lib.css;

export default abstract class Sprite<T extends NodeUI> extends ExtensionUI<T> {
    public condition(node: T) {
        let valid = false;
        if (node.hasWidth && node.hasHeight && node.length === 0 && node.backgroundImage !== '' && (this.included(<HTMLElement> node.element) || !node.dataset.use)) {
            const resource = this.application.resourceHandler;
            const image = <ImageAsset> (resource.getRawData(node.backgroundImage) || resource.getImage($css.resolveURL(node.backgroundImage)));
            if (image) {
                const dimension = node.actualDimension;
                const position = $css.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, node.fontSize);
                if (position.left <= 0 && position.top <= 0 && image.width > dimension.width && image.height > dimension.height) {
                    node.data(EXT_NAME.SPRITE, STRING_BASE.EXT_DATA, { image, position });
                    valid = true;
                }
            }
        }
        return valid;
    }
}