import { StyleAttribute } from '../@types/application';
import { ViewAttribute } from '../@types/node';

import View from '../view';

import { LOCALIZE_ANDROID, XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

const {
    constant: $const,
    math: $math,
    util: $util
} = squared.lib;

const REGEXP_ID = /^@\+?id\//;

function calculateBias(start: number, end: number, accuracy = 4) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    else {
        return parseFloat(Math.max(start / (start + end), 0).toPrecision(accuracy));
    }
}

export function convertLength(value: string, dpi = 160, font = false, precision = 3) {
    let result = parseFloat(value);
    if (!isNaN(result)) {
        if (dpi !== 160) {
            result /= dpi / 160;
            return (result !== 0 && result > -1 && result < 1 ? result.toPrecision(precision)  : $math.truncate(result, precision - 1)) + (font ? 'sp' : 'dp');
        }
        else {
            return Math.round(result) + (font ? 'sp' : 'dp');
        }
    }
    return '0dp';
}

export function getDocumentId(value: string) {
    return value.replace(REGEXP_ID, '');
}

export function getHorizontalBias(node: View) {
    const parent = node.documentParent;
    const left = Math.max(0, node.actualRect($const.CSS.LEFT, 'bounds') - parent.box.left);
    const right = Math.max(0, parent.box.right - node.actualRect($const.CSS.RIGHT, 'bounds'));
    return calculateBias(left, right, node.localSettings.floatPrecision);
}

export function getVerticalBias(node: View) {
    const parent = node.documentParent;
    const top = Math.max(0, node.actualRect($const.CSS.TOP, 'bounds') - parent.box.top);
    const bottom = Math.max(0, parent.box.bottom - node.actualRect($const.CSS.BOTTOM, 'bounds'));
    return calculateBias(top, bottom, node.localSettings.floatPrecision);
}

export function createViewAttribute(options?: ExternalData, android = {}, app = {}): ViewAttribute {
    return { android, app, ...options };
}

export function createStyleAttribute(options?: ExternalData) {
    const result: StyleAttribute = {
        output: {
            path: 'res/values',
            file: ''
        },
        name: '',
        parent: '',
        items: {}
    };
    if ($util.isPlainObject(options)) {
        for (const attr in result) {
            if (typeof options[attr] === typeof result[attr]) {
                result[attr] = options[attr];
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
        if (value.indexOf(`${namespace}:`) !== -1) {
            output += `\n\t${getXmlNs(namespace)}`;
        }
    }
    return output;
}