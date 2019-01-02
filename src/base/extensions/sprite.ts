import { ImageAsset } from '../@types/application';

import { EXT_NAME } from '../lib/constant';

import Extension from '../extension';
import Node from '../node';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Sprite<T extends Node> extends Extension<T> {
    public condition(node: T) {
        let valid = false;
        if (node.hasWidth && node.hasHeight && node.length === 0 && !node.inlineText) {
            let url = node.css('backgroundImage');
            if (!$util.hasValue(url) || url === 'none') {
                url = '';
                const match = $util.REGEX_PATTERN.CSS_URL.exec(node.css('background'));
                if (match) {
                    url = match[0];
                }
            }
            if (url !== '') {
                url = $dom.cssResolveUrl(url);
                const image = <ImageAsset> this.application.session.image.get(url);
                if (image) {
                    const dpi = node.dpi;
                    const fontSize = node.fontSize;
                    const width = $dom.convertClientUnit(node.has('width') ? node.css('width') : node.css('minWidth'), node.bounds.width, dpi, fontSize);
                    const height = $dom.convertClientUnit(node.has('height') ? node.css('width') : node.css('minHeight'), node.bounds.height, dpi, fontSize);
                    const position = $dom.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, node.bounds, dpi, fontSize);
                    if (position.left <= 0 && position.top <= 0 && image.width > width && image.height > height) {
                        image.position = { x: position.left, y: position.top };
                        node.data(EXT_NAME.SPRITE, 'mainData', image);
                        valid = true;
                    }
                }
            }
        }
        return valid && (!$util.hasValue(node.dataset.use) || this.included(<HTMLElement> node.element));
    }
}