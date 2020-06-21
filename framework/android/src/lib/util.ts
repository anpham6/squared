import { LOCALIZE_ANDROID, XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

type View = android.base.View;

const { truncate } = squared.lib.math;
const { capitalize, isPlainObject } = squared.lib.util;

const { BOX_STANDARD } = squared.base.lib.enumeration;

function calculateBias(start: number, end: number, accuracy = 3) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
}

export function convertLength(value: string | number, font?: boolean, precision = 3) {
    if (typeof value === 'string') {
        value = parseFloat(value);
    }
    return !font ? Math.round(value) + 'dp' : truncate(value, precision) + 'sp';
}

export function getDocumentId(value: string) {
    return value.replace(/^@\+?id\//, '');
}

export function isHorizontalAlign(value: string) {
    switch (value) {
        case 'left':
        case 'start':
        case 'right':
        case 'end':
        case 'center_horizontal':
            return true;
    }
    return false;
}

export function isVerticalAlign(value: string) {
    switch (value) {
        case 'top':
        case 'bottom':
        case 'center_vertical':
            return true;
    }
    return false;
}

export function getDataSet(dataset: StringMap | DOMStringMap, prefix: string) {
    let result: Undef<StringMap>;
    for (const attr in dataset) {
        if (attr.startsWith(prefix)) {
            if (!result) {
                result = {};
            }
            result[capitalize(attr.substring(prefix.length), false)] = dataset[attr] as string;
        }
    }
    return result;
}

export function getHorizontalBias(node: View) {
    const parent = node.documentParent;
    const box = parent.box;
    const left = Math.max(0, node.actualRect('left', 'bounds') - box.left);
    const right = Math.max(0, box.right - node.actualRect('right', 'bounds'));
    return calculateBias(left, right, node.localSettings.floatPrecision);
}

export function getVerticalBias(node: View) {
    const parent = node.documentParent;
    const box = parent.box;
    const top = Math.max(0, node.actualRect('top', 'bounds') - box.top);
    const bottom = Math.max(0, box.bottom - node.actualRect('bottom', 'bounds'));
    return calculateBias(top, bottom, node.localSettings.floatPrecision);
}

export function adjustAbsolutePaddingOffset(parent: View, direction: number, value: number) {
    if (value > 0) {
        if (parent.documentBody) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    if (parent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0) {
                        value -= parent.marginTop;
                    }
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value -= parent.marginRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    if (parent.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0) {
                        value -= parent.marginBottom;
                    }
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value -= parent.marginLeft;
                    break;
            }
        }
        if (parent.getBox(direction)[0] === 0) {
            switch (direction) {
                case BOX_STANDARD.PADDING_TOP:
                    value += parent.borderTopWidth - parent.paddingTop;
                    break;
                case BOX_STANDARD.PADDING_RIGHT:
                    value += parent.borderRightWidth - parent.paddingRight;
                    break;
                case BOX_STANDARD.PADDING_BOTTOM:
                    value += parent.borderBottomWidth - parent.paddingBottom;
                    break;
                case BOX_STANDARD.PADDING_LEFT:
                    value += parent.borderLeftWidth - parent.paddingLeft;
                    break;
            }
        }
        return Math.max(value, 0);
    }
    else if (value < 0) {
        switch (direction) {
            case BOX_STANDARD.PADDING_TOP:
                value += parent.marginTop;
                break;
            case BOX_STANDARD.PADDING_RIGHT:
                value += parent.marginRight;
                break;
            case BOX_STANDARD.PADDING_BOTTOM:
                value += parent.marginBottom;
                break;
            case BOX_STANDARD.PADDING_LEFT:
                value += parent.marginLeft;
                break;
        }
        return value;
    }
    return 0;
}

export function createViewAttribute(data?: StandardMap) {
    const options: ViewAttribute = { android: {} };
    if (data) {
        if (data.android) {
            Object.assign(options.android, data.android);
        }
        if (data.app) {
            if (!options.app) {
                options.app = {};
            }
            Object.assign(options.app, data.app);
        }
    }
    return options;
}

export function createStyleAttribute(data?: StandardMap) {
    const result: StyleAttribute = {
        output: {
            path: 'res/values',
            file: ''
        },
        name: '',
        parent: '',
        items: {}
    };
    if (isPlainObject(data)) {
        for (const attr in result) {
            if (typeof data[attr] === typeof result[attr]) {
                result[attr] = data[attr];
            }
        }
    }
    return result;
}

export function localizeString(value: string, rtl: boolean, api: number): string {
    return rtl && api >= BUILD_ANDROID.JELLYBEAN_1 && LOCALIZE_ANDROID[value] || value;
}

export function getXmlNs(value: string) {
    return XMLNS_ANDROID[value] ? `xmlns:${value}="${XMLNS_ANDROID[value]}"` : '';
}

export function getRootNs(value: string) {
    let output = '';
    for (const namespace in XMLNS_ANDROID) {
        if (value.includes(namespace + ':')) {
            output += '\n\t' + getXmlNs(namespace);
        }
    }
    return output;
}