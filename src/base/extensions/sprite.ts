import ExtensionUI from '../extension-ui';

const { getBackgroundPosition, resolveURL } = squared.lib.css;

export default abstract class Sprite<T extends squared.base.NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.length === 0 && node.hasWidth && node.hasHeight;
    }

    public condition(node: T) {
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '' && (!node.use || this.included(node.element as HTMLElement))) {
            const image = (this.resource.getRawData(backgroundImage) || this.resource.getImage(resolveURL(backgroundImage))) as ImageAsset;
            if (image) {
                const dimension = node.actualDimension;
                const [backgroundPositionX, backgroundPositionY] = node.cssAsTuple('backgroundPositionX', 'backgroundPositionY');
                const position = getBackgroundPosition(backgroundPositionX + ' ' + backgroundPositionY, dimension, { fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension });
                const pattern = /^0[a-z%]+|left|start|top/;
                const x = (position.left < 0 || pattern.test(backgroundPositionX)) && image.width > dimension.width;
                const y = (position.top < 0 || pattern.test(backgroundPositionY)) && image.height > dimension.height;
                if ((x || y) && (x || position.left === 0) && (y || position.top === 0)) {
                    node.data(this.name, 'mainData', { image, position });
                    return true;
                }
            }
        }
        return false;
    }
}