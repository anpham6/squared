import { ImageAsset } from '../../../@types/base/file';

import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';

type NodeUI = squared.base.NodeUI;

const { getBackgroundPosition, resolveURL } = squared.lib.css;

const REGEX_BACKGROUNDPOSITION = /^0[a-z%]+|left|start|top/;

export default abstract class Sprite<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.length === 0 && node.hasWidth && node.hasHeight;
    }

    public condition(node: T) {
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '' && (this.included(<HTMLElement> node.element) || !node.dataset.use)) {
            const image = <ImageAsset> (this.resource.getRawData(backgroundImage) || this.resource.getImage(resolveURL(backgroundImage)));
            if (image) {
                const dimension = node.actualDimension;
                const { backgroundPositionX, backgroundPositionY } = node.cssAsObject('backgroundPositionX', 'backgroundPositionY');
                const position = getBackgroundPosition(backgroundPositionX + ' ' + backgroundPositionY, dimension, { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension });
                const x = (position.left < 0 || REGEX_BACKGROUNDPOSITION.test(backgroundPositionX)) && image.width > dimension.width;
                const y = (position.top < 0 || REGEX_BACKGROUNDPOSITION.test(backgroundPositionY)) && image.height > dimension.height;
                if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                    node.data(EXT_NAME.SPRITE, 'mainData', { image, position });
                    return true;
                }
            }
        }
        return false;
    }
}