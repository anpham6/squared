import { StyleAttribute } from '../@types/application';
import { ViewAttribute } from '../@types/node';

import View from '../view';

import { XMLNS_ANDROID } from './constant';
import { BUILD_ANDROID } from './enumeration';

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

export function stripId(value: string) {
    return value ? value.replace(/^@\+?id\//, '') : '';
}

export function getHorizontalBias(node: View) {
    const parent = node.documentParent;
    const left = Math.max(0, node.actualRect('left', 'bounds') - parent.box.left);
    const right = Math.max(0, parent.box.right - node.actualRect('right', 'bounds'));
    return calculateBias(left, right, node.localSettings.floatPrecision);
}

export function getVerticalBias(node: View) {
    const parent = node.documentParent;
    const top = Math.max(0, node.actualRect('top', 'bounds') - parent.box.top);
    const bottom = Math.max(0, parent.box.bottom - node.actualRect('bottom', 'bounds'));
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
    if (options && typeof options === 'object') {
        for (const attr in result) {
            if (typeof options[attr] === typeof result[attr]) {
                result[attr] = options[attr];
            }
        }
    }
    return result;
}

export function localizeString(value: string, rtl: boolean, api: number) {
    if (rtl && api >= BUILD_ANDROID.JELLYBEAN_1) {
        switch (value) {
            case 'left':
                return 'start';
            case 'right':
                return 'end';
            case 'layout_marginLeft':
                return 'layout_marginStart';
            case 'layout_marginRight':
                return 'layout_marginEnd';
            case 'paddingLeft':
                return 'paddingStart';
            case 'paddingRight':
                return 'paddingEnd';
            case 'layout_alignParentLeft':
                return 'layout_alignParentStart';
            case 'layout_alignParentRight':
                return 'layout_alignParentEnd';
            case 'layout_alignLeft':
                return 'layout_alignStart';
            case 'layout_alignRight':
                return 'layout_alignEnd';
            case 'layout_toRightOf':
                return 'layout_toEndOf';
            case 'layout_toLeftOf':
                return 'layout_toStartOf';
            case 'layout_constraintLeft_toLeftOf':
                return 'layout_constraintStart_toStartOf';
            case 'layout_constraintRight_toRightOf':
                return 'layout_constraintEnd_toEndOf';
            case 'layout_constraintLeft_toRightOf':
                return 'layout_constraintStart_toEndOf';
            case 'layout_constraintRight_toLeftOf':
                return 'layout_constraintEnd_toStartOf';
        }
    }
    return value;
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