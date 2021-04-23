import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

function getItemType(node: NodeUI, checked?: boolean) {
    if (node.display === 'list-item') {
        const value = node.css('listStyleType');
        if (value !== 'none') {
            node.css('listStyleType', value);
            return 1;
        }
    }
    return node.marginLeft < 0 && node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat && (checked || node.actualParent!.every(item => item.blockStatic)) ? 2 : 0;
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let NUMERALS: string[];

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
    NUMERALS ||= [
        '', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'
    ];
    const digits = value.toString().split('');
    let result = '',
        i = 3;
    while (i--) {
        result = (NUMERALS[+digits.pop()! + (i * 10)] || '') + result;
    }
    return 'M'.repeat(+digits.join('')) + result;
}

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
        return !node.isEmpty() && !!node.find((item: T) => getItemType(item) > 0);
    }

    public condition() { return true; }

    public processNode(node: T) {
        const ordered = node.tagName === 'OL';
        const inside = node.valueOf('listStylePosition') === 'inside';
        let i = ordered && node.toElementInt('start') || 1;
        node.each((item: T) => {
            const mainData: ListData = {};
            this.data.set(item, mainData);
            switch (getItemType(item, true)) {
                case 1: {
                    const listStyleImage = item.css('listStyleImage');
                    if (listStyleImage !== 'none') {
                        mainData.imageSrc = listStyleImage;
                    }
                    else {
                        const type = item.css('listStyleType');
                        if (ordered) {
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
                                default:
                                    ordinal = '○';
                                    break;
                            }
                        }
                        mainData.ordinal = ordinal;
                    }
                    if (inside && !item.valueOf('listStylePosition')) {
                        item.css('listStylePosition', 'inside');
                    }
                    ++i;
                    break;
                }
                case 2:
                    mainData.imageSrc = item.backgroundImage;
                    mainData.imagePosition = item.css('backgroundPosition');
                    item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                    break;
            }
        });
    }
}