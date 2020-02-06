import { StyleAttribute } from '../../../@types/android/application';
import { ViewAttribute } from '../../../@types/android/node';

type View = android.base.View;

import { LOCALIZE_ANDROID, XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

const $lib = squared.lib;

const { truncate } = $lib.math;
const { isPlainObject } = $lib.util;

const REGEX_ID = /^@\+?id\//;

function calculateBias(start: number, end: number, accuracy = 3) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    else {
        return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
    }
}

export function convertLength(value: string | number, font = false, precision = 3) {
    if (typeof value === 'string') {
        value = parseFloat(value) || 0;
    }
    return !font ? Math.round(value) + 'dp' : truncate(value, precision) + 'sp';
}

export function getDocumentId(value: string) {
    return value.replace(REGEX_ID, '');
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

export function createViewAttribute(data?: ExternalData, options?: ViewAttribute): ViewAttribute {
    if (options === undefined) {
        options = { android: {} };
    }
    else if (options.android === undefined) {
        options.android = {};
    }
    if (data) {
        const { android, app } = data;
        if (android) {
            Object.assign(options.android, android);
        }
        if (app) {
            if (options.app === undefined) {
                options.app = {};
            }
            Object.assign(options.app, app);
        }
    }
    return options;
}

export function createStyleAttribute(data?: ExternalData) {
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