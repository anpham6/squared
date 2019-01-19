import { FileAsset } from '../../../src/base/@types/application';
import { StyleAttribute } from '../@types/application';
import { ViewAttribute } from '../@types/node';

import { XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

const $util = squared.lib.util;
const $xml = squared.lib.xml;

export function stripId(value: string) {
    return value ? value.replace(/@\+?id\//, '') : '';
}

export function createViewAttribute(options?: ExternalData): ViewAttribute {
    return {
        android: {},
        app: {},
        ...(options && typeof options === 'object' ? options : {})
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

export function validateString(value: string) {
    return value ? value.trim().replace(/[^\w$\-_.]/g, '_') : '';
}

export function convertUnit(value: string, dpi = 160, font = false) {
    if (value) {
        let result = parseFloat(value);
        if (!isNaN(result)) {
            result /= dpi / 160;
            value = result >= 1 || result === 0 ? Math.floor(result).toString() : result.toFixed(2);
            return value + (font ? 'sp' : 'dp');
        }
    }
    return '0dp';
}

export function replaceUnit(value: string, dpi = 160, format = 'dp', font = false) {
    if (format === 'dp' || font) {
        return value.replace(/([">])(-)?(\d+(?:\.\d+)?px)(["<])/g, (match, ...capture) => capture[0] + (capture[1] || '') + convertUnit(capture[2], dpi, font) + capture[3]);
    }
    return value;
}

export function replaceTab(value: string, spaces = 4, preserve = false) {
    return $xml.replaceTab(value, spaces, preserve);
}

export function calculateBias(start: number, end: number, accuracy = 4) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    else {
        return parseFloat(Math.max(start / (start + end), 0).toFixed(accuracy));
    }
}

export function replaceRTL(value: string, rtl = true, api = BUILD_ANDROID.OREO) {
    value = value ? value.trim() : '';
    if (rtl && api >= BUILD_ANDROID.JELLYBEAN_1) {
        value = value.replace(/left/g, 'start').replace(/right/g, 'end');
        value = value.replace(/Left/g, 'Start').replace(/Right/g, 'End');
    }
    return value;
}

export function getAppTheme(assets: FileAsset[]) {
    for (const theme of assets) {
        const match = /<style\s+name="([\w$]+)"\s+parent="Theme\.[\w$.]+"/.exec(theme.content);
        if (match) {
            return match[1];
        }
    }
    return '';
}

export function getXmlNs(...values: string[]) {
    return $util.flatMap(values, namespace => XMLNS_ANDROID[namespace] ? `xmlns:${namespace}="${XMLNS_ANDROID[namespace]}"` : '').join(' ');
}