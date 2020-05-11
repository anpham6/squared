import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';
import { NODE_RESOURCE } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;

const { convertListStyle } = squared.lib.css;
const { isNumber } = squared.lib.util;

const hasSingleImage = (visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;

export default abstract class List<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute = (): ListData => ({ ordinal: '', imageSrc: '', imagePosition: '' });

    public condition(node: T) {
        const length = node.length;
        if (length) {
            const floated = new Set<string>();
            let blockStatic = true;
            let inlineVertical = true;
            let floating = true;
            let blockAlternate = true;
            let bulletVisible = false;
            const children = node.children;
            for (let i = 0; i < length; ++i) {
                const item = children[i] as T;
                const type = item.css('listStyleType');
                if (item.display === 'list-item' && (type !== 'none' || item.innerBefore) || item.marginLeft < 0 && type === 'none' && hasSingleImage(item.visibleStyle)) {
                    bulletVisible = true;
                }
                if (floating || blockAlternate) {
                    if (item.floating) {
                        floated.add(item.float);
                        blockAlternate = false;
                    }
                    else if (i === 0 || i === length - 1 || item.blockStatic || (children[i - 1] as T).blockStatic && (children[i + 1] as T).blockStatic) {
                        floating = false;
                    }
                    else {
                        floating = false;
                        blockAlternate = false;
                    }
                }
                if (!item.blockStatic) {
                    blockStatic = false;
                }
                if (!item.inlineVertical) {
                    inlineVertical = false;
                }
                if (!blockStatic && !inlineVertical && !blockAlternate && !floating) {
                    return false;
                }
            }
            return bulletVisible && (blockStatic || inlineVertical || floating && floated.size === 1 || blockAlternate);
        }
        return false;
    }

    public processNode(node: T) {
        const ordered = node.tagName === 'OL';
        let i = ordered && node.toElementInt('start') || 1;
        node.each((item: T) => {
            const mainData = List.createDataAttribute();
            const type = item.css('listStyleType');
            const enabled = item.display === 'list-item';
            if (enabled || type !== '' && type !== 'none' || hasSingleImage(item.visibleStyle)) {
                if (item.has('listStyleImage')) {
                    mainData.imageSrc = item.css('listStyleImage');
                }
                else {
                    if (ordered && enabled && item.tagName === 'LI') {
                        const value = item.attributes['value'];
                        if (isNumber(value)) {
                            i = Math.floor(parseFloat(value));
                        }
                    }
                    let ordinal = convertListStyle(type, i);
                    if (ordinal === '') {
                        switch (type) {
                            case 'disc':
                                ordinal = '●';
                                break;
                            case 'square':
                                ordinal = '■';
                                break;
                            case 'none': {
                                let src = '';
                                let position = '';
                                if (!item.visibleStyle.backgroundRepeat) {
                                    src = item.backgroundImage;
                                    position = item.css('backgroundPosition');
                                }
                                if (src !== '' && src !== 'none') {
                                    mainData.imageSrc = src;
                                    mainData.imagePosition = position;
                                    item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                }
                                break;
                            }
                            default:
                                ordinal = '○';
                                break;
                        }
                    }
                    else {
                        ordinal += '.';
                    }
                    mainData.ordinal = ordinal;
                }
                if (enabled) {
                    ++i;
                }
            }
            item.data(EXT_NAME.LIST, 'mainData', mainData);
        });
        return undefined;
    }
}