import { ListData } from '../@types/extension';

import Extension from '../extension';
import Node from '../node';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD, NODE_RESOURCE } from '../lib/enumeration';

const $css = squared.lib.css;

const hasSingleImage = (node: Node) => node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat;

export default abstract class List<T extends Node> extends Extension<T> {
    public static createDataAttribute(): ListData {
        return {
            ordinal: '',
            imageSrc: '',
            imagePosition: ''
        };
    }

    public condition(node: T) {
        if (super.condition(node)) {
            const length = node.length;
            if (length) {
                const floated = new Set<string>();
                let blockStatic = 0;
                let inlineVertical = 0;
                let floating = 0;
                let blockAlternate = 0;
                let imageType = 0;
                let listType = 0;
                for (let i = 0; i < length; i++) {
                    const item = node.children[i];
                    const listStyleType = item.css('listStyleType') !== 'none';
                    if (item.display === 'list-item') {
                        if (listStyleType || item.beforePseudoChild || hasSingleImage(item)) {
                            listType++;
                        }
                    }
                    else if (hasSingleImage(item) && !listStyleType && item.marginLeft < 0) {
                        imageType++;
                    }
                    if (item.blockStatic) {
                        blockStatic++;
                    }
                    if (item.inlineVertical) {
                        inlineVertical++;
                    }
                    if (item.floating) {
                        floated.add(item.float);
                        floating++;
                    }
                    else if (i === 0 || i === length - 1 || item.blockStatic || node.children[i - 1].blockStatic && node.children[i + 1].blockStatic) {
                        blockAlternate++;
                    }
                }
                return (imageType > 0 || listType > 0) && (blockStatic === length || inlineVertical === length || floating === length && floated.size === 1 || blockAlternate === length);
            }
        }
        return false;
    }

    public processNode(node: T) {
        let i = 1;
        node.each(item => {
            const mainData = List.createDataAttribute();
            const value = item.css('listStyleType');
            if (item.display === 'list-item' || value && value !== 'none' || hasSingleImage(item)) {
                if (item.has('listStyleImage')) {
                    mainData.imageSrc = item.css('listStyleImage');
                }
                else {
                    mainData.ordinal = $css.convertListStyle(value, i);
                    if (mainData.ordinal === '') {
                        switch (value) {
                            case 'disc':
                                mainData.ordinal = '●';
                                break;
                            case 'square':
                                mainData.ordinal = '■';
                                break;
                            case 'none':
                                let src = '';
                                let position = '';
                                if (!item.visibleStyle.backgroundRepeat) {
                                    src = item.css('backgroundImage');
                                    position = item.css('backgroundPosition');
                                }
                                if (src && src !== 'none') {
                                    mainData.imageSrc = src;
                                    mainData.imagePosition = position;
                                    item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                }
                                break;
                            default:
                                mainData.ordinal = '○';
                                break;
                        }
                    }
                    else {
                        mainData.ordinal += '.';
                    }
                }
                i++;
            }
            item.data(EXT_NAME.LIST, 'mainData', mainData);
        });
        return undefined;
    }

    public postBaseLayout(node: T) {
        node.modifyBox(BOX_STANDARD.PADDING_LEFT, null);
    }
}