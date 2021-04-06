import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

function isListItem(node: NodeUI) {
    if (node.display === 'list-item') {
        return true;
    }
    switch (node.tagName) {
        case 'DT':
        case 'DD':
            return true;
    }
    return false;
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERALS = [
    '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
];

function convertAlpha(value: number) {
    if (value >= 0) {
        let result = '';
        const length = ALPHA.length;
        while (value >= length) {
            const base = Math.floor(value / length);
            if (base > 1 && base <= length) {
                result += ALPHA[base - 1];
                value -= base * length;
            }
            else if (base) {
                result += 'Z';
                value -= Math.pow(length, 2);
                result += convertAlpha(value);
                return result;
            }
            const index = value % length;
            result += ALPHA[index];
            value -= index + length;
        }
        return ALPHA[value] + result;
    }
    return value.toString();
}

function convertRoman(value: number) {
    const digits = value.toString().split('');
    let result = '',
        i = 3;
    while (i--) {
        result = (NUMERALS[+digits.pop()! + (i * 10)] || '') + result;
    }
    return 'M'.repeat(+digits.join('')) + result;
}

const hasSingleImage = (visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat;

export function convertListStyle(name: string, value: number, fallback?: boolean) {
    switch (name) {
        case 'decimal':
            return value.toString();
        case 'decimal-leading-zero':
            return (value < 9 ? '0' : '') + value.toString();
        case 'upper-alpha':
        case 'upper-latin':
            if (value >= 1) {
                return convertAlpha(value - 1);
            }
            break;
        case 'lower-alpha':
        case 'lower-latin':
            if (value >= 1) {
                return convertAlpha(value - 1).toLowerCase();
            }
            break;
        case 'upper-roman':
            return convertRoman(value);
        case 'lower-roman':
            return convertRoman(value).toLowerCase();
    }
    return fallback ? value.toString() : '';
}

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
                        const n = +item.attributes.value!;
                        if (!isNaN(n)) {
                            i = Math.floor(n);
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