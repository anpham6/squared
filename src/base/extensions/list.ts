import { ExtensionResult } from '../types/application';
import { ListData } from '../types/extension';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD, NODE_RESOURCE } from '../lib/enumeration';

import Extension from '../extension';
import Node from '../node';
import NodeList from '../nodelist';

import $util = squared.lib.util;

function hasSingleImage<T extends Node>(node: T) {
    return node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat;
}

export default abstract class List<T extends Node> extends Extension<T> {
    public static createDataAttribute(): ListData {
        return {
            ordinal: '',
            imageSrc: '',
            imagePosition: ''
        };
    }

    public condition(node: T) {
        return super.condition(node) && node.length > 0 && (
            node.every(item => item.blockStatic) ||
            node.every(item => item.inlineVertical) ||
            node.every(item => item.floating) && NodeList.floated(node.children).size === 1 ||
            node.every((item, index) => !item.floating && (
                index === 0 ||
                index === node.length - 1 ||
                item.blockStatic ||
                item.inlineFlow && (node.item(index - 1) as T).blockStatic && (node.item(index + 1) as T).blockStatic
            ))
        ) && (
            node.some(item => item.display === 'list-item' && (item.css('listStyleType') !== 'none' || hasSingleImage(item))) ||
            node.every(item => item.tagName !== 'LI' && item.cssInitial('listStyleType') === 'none' && hasSingleImage(item))
        );
    }

    public processNode(node: T): ExtensionResult<T> {
        let i = 0;
        node.each(item => {
            const mainData = List.createDataAttribute();
            if (item.display === 'list-item' || item.has('listStyleType') || hasSingleImage(item)) {
                let src = item.css('listStyleImage');
                if (src && src !== 'none') {
                    mainData.imageSrc = src;
                }
                else {
                    switch (item.css('listStyleType')) {
                        case 'disc':
                            mainData.ordinal = '●';
                            break;
                        case 'square':
                            mainData.ordinal = '■';
                            break;
                        case 'decimal':
                            mainData.ordinal = `${(i + 1).toString()}.`;
                            break;
                        case 'decimal-leading-zero':
                            mainData.ordinal = `${(i < 9 ? '0' : '') + (i + 1).toString()}.`;
                            break;
                        case 'lower-alpha':
                        case 'lower-latin':
                            mainData.ordinal = `${$util.convertAlpha(i).toLowerCase()}.`;
                            break;
                        case 'upper-alpha':
                        case 'upper-latin':
                            mainData.ordinal = `${$util.convertAlpha(i)}.`;
                            break;
                        case 'lower-roman':
                            mainData.ordinal = `${$util.convertRoman(i + 1).toLowerCase()}.`;
                            break;
                        case 'upper-roman':
                            mainData.ordinal = `${$util.convertRoman(i + 1)}.`;
                            break;
                        case 'none':
                            src = '';
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
                i++;
            }
            item.data(EXT_NAME.LIST, 'mainData', mainData);
        });
        return { output: '' };
    }

    public postBaseLayout(node: T) {
        node.modifyBox(BOX_STANDARD.MARGIN_LEFT, null);
        node.modifyBox(BOX_STANDARD.PADDING_LEFT, null);
    }
}