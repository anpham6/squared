import ExtensionUI from '../extension-ui';

import { NODE_RESOURCE } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;

const { convertListStyle } = squared.lib.css;
const { isNumber } = squared.lib.util;

function isListItem(node: NodeUI) {
    if (node.display === 'list-item') {
        return true;
    }
    switch (node.tagName) {
        case 'DT':
        case 'DD':
            return true;
        default:
            return false;
    }
}

const hasSingleImage = (visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;

export default abstract class List<T extends NodeUI> extends ExtensionUI<T> {
    public condition(node: T) {
        const length = node.length;
        if (length > 0) {
            const children = node.children;
            let blockStatic = true,
                inlineVertical = true,
                floating = true,
                blockAlternate = true,
                bulletVisible = false,
                floated: Undef<Set<string>>;
            for (let i = 0; i < length; ++i) {
                const item = children[i] as T;
                const type = item.css('listStyleType') !== 'none';
                if (isListItem(item) && (type || item.innerBefore) || !type && item.marginLeft < 0 && hasSingleImage(item.visibleStyle)) {
                    bulletVisible = true;
                }
                if (floating || blockAlternate) {
                    if (item.floating) {
                        if (!floated) {
                            floated = new Set<string>();
                        }
                        floated.add(item.float);
                        blockAlternate = false;
                    }
                    else {
                        floating = false;
                        if (i > 0 && i < length - 1 && !item.blockStatic && !(children[i - 1]!.blockStatic && children[i + 1]!.blockStatic)) {
                            blockAlternate = false;
                        }
                    }
                }
                if (item.blockStatic) {
                    floating = false;
                }
                else {
                    blockStatic = false;
                }
                if (!item.inlineVertical) {
                    inlineVertical = false;
                }
                if (!blockStatic && !inlineVertical && !blockAlternate && !floating) {
                    return false;
                }
            }
            return bulletVisible && (blockStatic || inlineVertical || floated?.size === 1 || blockAlternate);
        }
        return false;
    }

    public processNode(node: T) {
        const ordered = node.tagName === 'OL';
        let i = ordered && node.toElementInt('start') || 1;
        node.each((item: T) => {
            const mainData: ListData = {};
            if (isListItem(item) || hasSingleImage(item.visibleStyle)) {
                const listItem = item.display === 'list-item';
                const type = listItem ? item.css('listStyleType') : 'none';
                if (item.has('listStyleImage')) {
                    mainData.imageSrc = item.css('listStyleImage');
                }
                else {
                    if (ordered && item.tagName === 'LI') {
                        const value = item.attributes['value'];
                        if (value && isNumber(value)) {
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
                                let src = '',
                                    position = '';
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
                ++i;
            }
            item.data(this.name, 'mainData', mainData);
        });
        return undefined;
    }
}