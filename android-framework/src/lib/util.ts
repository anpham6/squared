import { StyleAttribute } from '../@types/application';
import { ViewAttribute } from '../@types/node';

import { XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

const $util = squared.lib.util;

const REGEXP_RTL = {
    LEFT: /left/,
    LEFT_UPPER: /Left/g,
    RIGHT: /right/,
    RIGHT_UPPER: /Right/g
};
const REGEXP_UNIT = /([">])(-)?(\d+(?:\.\d+)?px)(["<])/g;

export function stripId(value: string) {
    return value ? value.replace(/@\+?id\//, '') : '';
}

export function createViewAttribute(options?: ExternalData): ViewAttribute {
    return {
        android: {},
        app: {},
        ...options
    };
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
    if (options && typeof options === 'object') {
        for (const attr in result) {
            if (typeof options[attr] === typeof result[attr]) {
                result[attr] = options[attr];
            }
        }
    }
    return result;
}

export function convertLength(value: string, dpi = 160, font = false) {
    let result = parseFloat(value);
    if (!isNaN(result)) {
        result /= dpi / 160;
        value = result >= 1 || result === 0 ? Math.floor(result).toString() : result.toPrecision(2);
        return value + (font ? 'sp' : 'dp');
    }
    return '0dp';
}

export function replaceLength(value: string, dpi = 160, format = 'dp', font = false) {
    if (format === 'dp' || font) {
        return value.replace(REGEXP_UNIT, (match, ...capture) => capture[0] + (capture[1] || '') + convertLength(capture[2], dpi, font) + capture[3]);
    }
    return value;
}

export function replaceRTL(value: string, rtl = true, api = BUILD_ANDROID.OREO) {
    if (rtl && api >= BUILD_ANDROID.JELLYBEAN_1) {
        value = value
            .replace(REGEXP_RTL.LEFT, 'start')
            .replace(REGEXP_RTL.LEFT_UPPER, 'Start')
            .replace(REGEXP_RTL.RIGHT, 'end')
            .replace(REGEXP_RTL.RIGHT_UPPER, 'End');
    }
    return value;
}

export function getXmlNs(...values: string[]) {
    return $util.joinMap(values, namespace => XMLNS_ANDROID[namespace] ? `xmlns:${namespace}="${XMLNS_ANDROID[namespace]}"` : '', ' ');
}