import { NODE_RESOURCE } from '../lib/constant';

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

import { convertListStyle } from '../lib/util';

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
    public is(node: T) {
        return !node.isEmpty() && !!node.find((item: T) => {
            const type = item.css('listStyleType') !== 'none';
            return (type || item.innerBefore?.pageFlow) && isListItem(item) || !type && item.marginLeft < 0 && hasSingleImage(item.visibleStyle);
        });
    }

    public condition(node: T) {
        let blockStatic = true,
            inlineVertical = true,
            floating = true,
            blockAlternate = true,
            floated: Undef<Set<string>>;
        const children = node.children;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i] as T;
            if (floating || blockAlternate) {
                if (item.floating) {
                    (floated ||= new Set<string>()).add(item.float);
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
        return blockStatic || inlineVertical || blockAlternate || !!floated && floated.size === 1;
    }

    public processNode(node: T) {
        const ordered = node.tagName === 'OL';
        let i = ordered && node.toElementInt('start') || 1;
        node.each((item: T) => {
            const mainData: ListData = {};
            this.data.set(item, mainData);
            if (isListItem(item) || hasSingleImage(item.visibleStyle)) {
                const type = item.display === 'list-item' ? item.css('listStyleType') : 'none';
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
                    if (ordinal) {
                        ordinal += '.';
                    }
                    else {
                        switch (type) {
                            case 'disc':
                                ordinal = '●';
                                break;
                            case 'square':
                                ordinal = '■';
                                break;
                            case 'none':
                                if (!item.visibleStyle.backgroundRepeat) {
                                    const src = item.backgroundImage;
                                    if (src) {
                                        mainData.imageSrc = src;
                                        mainData.imagePosition = item.css('backgroundPosition');
                                        item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                    }
                                }
                                return;
                            default:
                                ordinal = '○';
                                break;
                        }
                    }
                    mainData.ordinal = ordinal;
                }
                ++i;
            }
        });
    }
}