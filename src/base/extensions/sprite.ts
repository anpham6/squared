import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';
import ResourceUI from '../resource-ui';

const { resolveURL, isLength } = squared.lib.css;

const REGEXP_POSITION = /^0[a-z%]+|left|start|top/;

export default abstract class Sprite<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.visibleStyle.backgroundImage && node.isEmpty() && node.hasWidth && node.hasHeight && (!node.use || this.included(node.element as HTMLElement));
    }

    public condition(node: T) {
        const backgroundImage = node.backgroundImage;
        let image = this.resource!.getRawData(backgroundImage) as Undef<ImageAsset>;
        if (!image) {
            const url = resolveURL(backgroundImage);
            if (url) {
                image = this.resource!.getImage(url);
            }
        }
        if (image) {
            const dimension = node.actualDimension;
            const [backgroundPositionX, backgroundPositionY, backgroundSize] = node.cssAsTuple('backgroundPositionX', 'backgroundPositionY', 'backgroundSize');
            const position = ResourceUI.getBackgroundPosition(backgroundPositionX + ' ' + backgroundPositionY, dimension, { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension });
            const [sizeW, sizeH] = backgroundSize.split(' ');
            let { width, height } = image;
            if (isLength(sizeW, true)) {
                width = node.parseWidth(sizeW, false);
                if (sizeH === 'auto') {
                    height = image.height * width / image.width;
                }
            }
            if (isLength(sizeH, true)) {
                height = node.parseHeight(sizeH, false);
                if (sizeW === 'auto') {
                    width = image.width * height / image.height;
                }
            }
            const x = width > dimension.width && (position.left < 0 || REGEXP_POSITION.test(backgroundPositionX));
            const y = height > dimension.height && (position.top < 0 || REGEXP_POSITION.test(backgroundPositionY));
            if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                this.data.set(node, { image, width, height, position } as SpriteData);
                return true;
            }
        }
        return false;
    }
}