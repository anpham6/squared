import { ListData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { NODE_RESOURCE } from '../lib/enumeration';

const { convertListStyle } = squared.lib.css;

const hasSingleImage = (node: NodeUI) => node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat;

export default abstract class List<T extends NodeUI> extends ExtensionUI<T> {
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
            if (length > 0) {
                const floated = new Set<string>();
                const children = node.children;
                let blockStatic = 0;
                let inlineVertical = 0;
                let floating = 0;
                let blockAlternate = 0;
                let imageType = 0;
                let listType = 0;
                for (let i = 0; i < length; i++) {
                    const item = children[i] as T;
                    const listStyleType = item.css('listStyleType') !== 'none';
                    if (item.display === 'list-item' && (listStyleType || item.innerBefore)) {
                        listType++;
                    }
                    else if (item.marginLeft < 0 && !listStyleType && hasSingleImage(item)) {
                        imageType++;
                    }
                    if (item.blockStatic) {
                        blockStatic++;
                    }
                    else {
                        blockStatic = Number.POSITIVE_INFINITY;
                    }
                    if (item.inlineVertical) {
                        inlineVertical++;
                    }
                    else {
                        blockStatic = Number.POSITIVE_INFINITY;
                    }
                    if (item.floating) {
                        floated.add(item.float);
                        floating++;
                        blockAlternate = Number.POSITIVE_INFINITY;
                    }
                    else if (i === 0 || i === length - 1 || item.blockStatic || (children[i - 1] as T).blockStatic && (children[i + 1] as T).blockStatic) {
                        blockAlternate++;
                        floating = Number.POSITIVE_INFINITY;
                    }
                    else {
                        floating = Number.POSITIVE_INFINITY;
                        blockAlternate = Number.POSITIVE_INFINITY;
                    }
                    if (blockStatic === Number.POSITIVE_INFINITY && inlineVertical === Number.POSITIVE_INFINITY && blockAlternate === Number.POSITIVE_INFINITY && floating === Number.POSITIVE_INFINITY) {
                        return false;
                    }
                }
                return (imageType > 0 || listType > 0) && (blockStatic === length || inlineVertical === length || floating === length && floated.size === 1 || blockAlternate === length);
            }
        }
        return false;
    }

    public processNode(node: T) {
        const ordered = node.tagName === 'OL';
        let i = ordered && node.toElementInt('start') || 1;
        node.each((item: T) => {
            const mainData = List.createDataAttribute();
            const value = item.css('listStyleType');
            const listItem = item.display === 'list-item';
            if (listItem || value && value !== 'none' || hasSingleImage(item)) {
                if (item.has('listStyleImage')) {
                    mainData.imageSrc = item.css('listStyleImage');
                }
                else {
                    if (ordered && listItem && item.tagName === 'LI') {
                        i = item.toElementInt('value', i);
                    }
                    let ordinal = convertListStyle(value, i);
                    if (ordinal === '') {
                        switch (value) {
                            case 'disc':
                                ordinal = '●';
                                break;
                            case 'square':
                                ordinal = '■';
                                break;
                            case 'none':
                                let src = '';
                                let position = '';
                                if (!item.visibleStyle.backgroundRepeat) {
                                    src = item.backgroundImage;
                                    position = item.css('backgroundPosition');
                                }
                                if (src && src !== 'none') {
                                    mainData.imageSrc = src;
                                    mainData.imagePosition = position;
                                    item.exclude(NODE_RESOURCE.IMAGE_SOURCE);
                                }
                                break;
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
                if (listItem) {
                    i++;
                }
            }
            item.data(EXT_NAME.LIST, 'mainData', mainData);
        });
        return undefined;
    }
}