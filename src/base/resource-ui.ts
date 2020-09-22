import USER_AGENT = squared.lib.constant.USER_AGENT;

import { NODE_ALIGNMENT, NODE_RESOURCE } from './lib/constant';

import type ControllerUI from './controller-ui';
import type NodeUI from './node-ui';

import Resource from './resource';

import { appendSeparator } from './lib/util';

const { STRING } = squared.lib.regex;

const { isUserAgent } = squared.lib.client;
const { parseColor } = squared.lib.color;
const { CSS_PROPERTIES, calculate, convertAngle, formatPercent, formatPX, hasCoords, isCalc, isLength, isPercent, parseAngle, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { cos, equal, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = squared.lib.math;
const { getElementAsNode } = squared.lib.session;
const { convertCamelCase, hasValue, isEqual, isNumber, isString, iterateArray, splitPair, splitPairEnd } = squared.lib.util;

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];
const BORDER_OUTLINE = CSS_PROPERTIES.outline.value as string[];

const PATTERN_COLOR = '((?:rgb|hsl)a?\\(\\d+,\\s+\\d+%?,\\s+\\d+%?(?:,\\s+[\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]{3,})';
const PATTERN_COLORLENGTH = `${STRING.LENGTH_PERCENTAGE}|${STRING.CSS_ANGLE}|(?:${STRING.CSS_CALC}(?=,)|${STRING.CSS_CALC})`;
const PATTERN_COLORSTOP = `${PATTERN_COLOR}(?:\\s*(${PATTERN_COLORLENGTH})\\s*,?\\s*)*\\s*,?\\s*`;
const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w %]+)?)?),?\\s*((?:${PATTERN_COLORSTOP})+)\\))`, 'g');
const REGEXP_COLORSTOP = new RegExp(PATTERN_COLORSTOP, 'g');
const REGEXP_TRAILINGINDENT = /\n([^\S\n]*)?$/;
const CHAR_EMPTYSTRING = /^[\s\n]+$/;
const CHAR_LEADINGSPACE = /^\s+/;
const CHAR_TRAILINGSPACE = /\s+$/;

function parseColorStops(node: NodeUI, gradient: Gradient, value: string) {
    const { width, height } = gradient.dimension as Dimension;
    const result: ColorStop[] = [];
    let horizontal = true,
        extent = 1,
        size: number,
        repeat: Undef<boolean>;
    switch (gradient.type) {
       case 'linear': {
            const { repeating, angle } = gradient as LinearGradient;
            repeat = repeating;
            switch (angle) {
                case 0:
                case 180:
                case 360:
                    size = height;
                    horizontal = false;
                    break;
                case 90:
                case 270:
                    size = width;
                    break;
                default: {
                    size = Math.abs(width * sin(angle - 180)) + Math.abs(height * cos(angle - 180));
                    horizontal = width >= height;
                    break;
                }
            }
            break;
        }
        case 'radial': {
            const { repeating, radiusExtent, radius } = gradient as RadialGradient;
            horizontal = node.actualWidth >= node.actualHeight;
            repeat = repeating;
            extent = radiusExtent / radius;
            size = radius;
            break;
        }
        case 'conic':
            size = Math.min(width, height);
            break;
        default:
            return result;
    }
    let previousOffset = 0,
        match: Null<RegExpExecArray>;
    if (isUserAgent(USER_AGENT.SAFARI)) {
        const colors: [string, number, number][] = [];
        const length = value.length;
        const colorPattern = new RegExp(PATTERN_COLOR, 'g');
        while (match = colorPattern.exec(value)) {
            const color = match[1];
            const lastIndex = colorPattern.lastIndex;
            const index = lastIndex - color.length;
            if (/[a-z]/.test(color[0]) && /\d/.test(value[index - 1])) {
                continue;
            }
            if (colors.length) {
                colors[colors.length - 1][2] = index;
            }
            colors.push([color, lastIndex, length]);
        }
        let expanded = '';
        for (const item of colors) {
            const color = item[0];
            for (const unit of value.substring(item[1], item[2]).replace(/\s*,\s*$/, '').trim().split(/\s*,\s*/)) {
                expanded += (expanded !== '' ? ', ' : '') + color + ' ' + unit;
            }
        }
        value = expanded;
    }
    while (match = REGEXP_COLORSTOP.exec(value)) {
        const color = parseColor(match[1], 1, true);
        if (color) {
            let offset = -1;
            if (gradient.type === 'conic') {
                const angle = match[3];
                const unit = match[4];
                if (angle && unit) {
                    offset = convertAngle(angle, unit) / 360;
                }
            }
            else {
                const unit = match[2];
                if (unit) {
                    if (isPercent(unit)) {
                        offset = parseFloat(unit) / 100;
                    }
                    else if (isLength(unit)) {
                        offset = (horizontal ? node.parseWidth(unit, false) : node.parseHeight(unit, false)) / size;
                    }
                    else if (isCalc(unit)) {
                        offset = calculate(match[6], { boundingSize: size, fontSize: node.fontSize }) / size;
                        if (isNaN(offset)) {
                            offset = -1;
                        }
                    }
                    if (repeat && offset !== -1) {
                        offset *= extent;
                    }
                }
            }
            if (isNaN(offset)) {
                continue;
            }
            if (result.length === 0) {
                if (offset === -1) {
                    offset = 0;
                }
                else if (offset > 0) {
                    result.push({ color, offset: 0 });
                }
            }
            if (offset !== -1) {
                offset = Math.max(previousOffset, offset);
                previousOffset = offset;
            }
            result.push({ color, offset });
        }
    }
    const length = result.length;
    const lastStop = result[length - 1];
    if (lastStop.offset === -1) {
        lastStop.offset = 1;
    }
    let percent = 0;
    for (let i = 0; i < length; ++i) {
        const stop = result[i];
        if (stop.offset === -1) {
            if (i === 0) {
                stop.offset = 0;
            }
            else {
                for (let j = i + 1, k = 2; j < length - 1; ++k) {
                    const data = result[j++];
                    if (data.offset !== -1) {
                        stop.offset = (percent + data.offset) / k;
                        break;
                    }
                }
                if (stop.offset === -1) {
                    stop.offset = percent + lastStop.offset / (length - 1);
                }
            }
        }
        percent = stop.offset;
    }
    if (repeat) {
        if (percent < 100) {
            complete: {
                let basePercent = percent;
                const original = result.slice(0);
                while (percent < 100) {
                    for (let i = 0; i < length; ++i) {
                        const data = original[i];
                        percent = Math.min(basePercent + data.offset, 1);
                        result.push({ ...data, offset: percent });
                        if (percent === 1) {
                            break complete;
                        }
                    }
                    basePercent = percent;
                }
            }
        }
    }
    else if (percent < 1) {
        result.push({ ...result[length - 1], offset: 1 });
    }
    REGEXP_COLORSTOP.lastIndex = 0;
    return result;
}

function setBorderStyle(node: NodeUI, boxStyle: BoxStyle, attr: string, border: string[]) {
    let width = node[border[0]] as number;
    if (width > 0) {
        const style = node.css(border[1]) || 'solid';
        let color: Null<string | ColorData> = node.css(border[2]) || 'rgb(0, 0, 0)';
        switch (color) {
            case 'currentcolor':
            case 'currentColor':
                color = node.css('color');
                break;
        }
        if (width === 2 && (style === 'inset' || style === 'outset')) {
            width = 1;
        }
        color = parseColor(color, 1, true);
        if (color) {
            boxStyle[attr] = {
                width: formatPX(width),
                style,
                color
            } as BorderAttribute;
            return true;
        }
    }
    return false;
}

function setBackgroundOffset(node: NodeUI, boxStyle: BoxStyle, attr: "backgroundClip" | "backgroundOrigin") {
    switch (node.valueOf(attr) || (attr === 'backgroundClip' ? 'border-box' : 'padding-box')) {
        case 'border-box':
            return true;
        case 'padding-box':
            boxStyle[attr] = {
                top: node.borderTopWidth,
                right: node.borderRightWidth,
                bottom: node.borderBottomWidth,
                left: node.borderLeftWidth
            };
            break;
        case 'content-box':
            boxStyle[attr] = {
                top: node.borderTopWidth + node.paddingTop,
                right: node.borderRightWidth + node.paddingRight,
                bottom: node.borderBottomWidth + node.paddingBottom,
                left: node.borderLeftWidth + node.paddingLeft
            };
            break;
    }
    return false;
}

function hasEndingSpace(element: HTMLElement) {
    const value = element.textContent!;
    return value.charCodeAt(value.length - 1) === 32;
}

function newBoxRectPosition(orientation = ['left', 'top']) {
    return {
        static: true,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        topAsPercent: 0,
        leftAsPercent: 0,
        rightAsPercent: 0,
        bottomAsPercent: 0,
        horizontal: 'left',
        vertical: 'top',
        orientation
    } as BoxRectPosition;
}

const convertLength = (value: string, dimension: number, options?: ParseUnitOptions) => isPercent(value) ? Math.round((parseFloat(value) || 0) / 100 * dimension) : parseUnit(value, options);
const convertPercent = (value: string, dimension: number, options?: ParseUnitOptions) => isPercent(value) ? parseFloat(value) / 100 : parseUnit(value, options) / dimension;
const checkPreviousSibling = (node: Undef<NodeUI>) => !node || node.lineBreak || node.floating || node.plainText && CHAR_TRAILINGSPACE.test(node.textContent);

export default class ResourceUI<T extends NodeUI> extends Resource<T> implements squared.base.ResourceUI<T> {
    public static readonly STRING_SPACE = '&#160;';
    public static readonly STORED: ResourceStoredMap = {
        ids: new Map(),
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    public static getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions) {
        if (value) {
            let fontSize: Undef<number>,
                imageDimension: UndefNull<Dimension>,
                imageSize: Undef<string>,
                screenDimension: UndefNull<Dimension>;
            if (options) {
                ({ fontSize, imageDimension, imageSize, screenDimension } = options);
            }
            const { width, height } = dimension;
            const setImageOffset = (position: string, horizontal: boolean, direction: string, directionAsPercent: string) => {
                if (imageDimension && !isLength(position)) {
                    let offset = result[directionAsPercent];
                    if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                        const [sizeW, sizeH] = imageSize.split(/\s+/);
                        if (horizontal) {
                            let imageWidth = width;
                            if (isLength(sizeW, true)) {
                                if (isPercent(sizeW)) {
                                    imageWidth *= parseFloat(sizeW) / 100;
                                }
                                else {
                                    const unit = parseUnit(sizeW, { fontSize, screenDimension });
                                    if (unit) {
                                        imageWidth = unit;
                                    }
                                }
                            }
                            else if (sizeH) {
                                let percent = 1;
                                if (isPercent(sizeH)) {
                                    percent = (parseFloat(sizeH) / 100 * height) / imageDimension.height;
                                }
                                else if (isLength(sizeH)) {
                                    const unit = parseUnit(sizeH, { fontSize, screenDimension });
                                    if (unit) {
                                        percent = unit / imageDimension.height;
                                    }
                                }
                                imageWidth = percent * imageDimension.width;
                            }
                            offset *= imageWidth;
                        }
                        else {
                            let imageHeight = height;
                            if (isLength(sizeH, true)) {
                                if (isPercent(sizeH)) {
                                    imageHeight *= parseFloat(sizeH) / 100;
                                }
                                else {
                                    const unit = parseUnit(sizeH, { fontSize, screenDimension });
                                    if (unit) {
                                        imageHeight = unit;
                                    }
                                }
                            }
                            else if (sizeW) {
                                let percent = 1;
                                if (isPercent(sizeW)) {
                                    percent = (parseFloat(sizeW) / 100 * width) / imageDimension.width;
                                }
                                else if (isLength(sizeW)) {
                                    const unit = parseUnit(sizeW, { fontSize, screenDimension });
                                    if (unit) {
                                        percent = unit / imageDimension.width;
                                    }
                                }
                                imageHeight = percent * imageDimension.height;
                            }
                            offset *= imageHeight;
                        }
                    }
                    else {
                        offset *= horizontal ? imageDimension.width : imageDimension.height;
                    }
                    result[direction] -= offset;
                }
            };
            const orientation = value.split(/\s+/);
            if (orientation.length === 1) {
                orientation.push('center');
            }
            const result = newBoxRectPosition(orientation);
            const length = Math.min(orientation.length, 4);
            if (length === 2) {
                orientation.sort((a, b) => {
                    switch (a) {
                        case 'left':
                        case 'right':
                            return -1;
                        case 'top':
                        case 'bottom':
                            return 1;
                    }
                    switch (b) {
                        case 'left':
                        case 'right':
                            return 1;
                        case 'top':
                        case 'bottom':
                            return -1;
                    }
                    return 0;
                });
                let direction: string,
                    offsetParent: number;
                for (let i = 0; i < 2; ++i) {
                    let position = orientation[i];
                    const horizontal = i === 0;
                    if (horizontal) {
                        direction = 'left';
                        offsetParent = width;
                    }
                    else {
                        direction = 'top';
                        offsetParent = height;
                    }
                    const directionAsPercent = direction + 'AsPercent';
                    switch (position) {
                        case '0%':
                            if (horizontal) {
                                position = 'left';
                            }
                        case 'left':
                        case 'top':
                            break;
                        case '100%':
                            if (horizontal) {
                                position = 'right';
                            }
                        case 'right':
                        case 'bottom':
                            result[direction] = offsetParent;
                            result[directionAsPercent] = 1;
                            break;
                        case '50%':
                        case 'center':
                            position = 'center';
                            result[direction] = offsetParent / 2;
                            result[directionAsPercent] = 0.5;
                            break;
                        default: {
                            const percent = convertPercent(position, offsetParent, { fontSize, screenDimension });
                            if (percent > 1) {
                                orientation[i] = '100%';
                                position = horizontal ? 'right' : 'bottom';
                                result[position] = convertLength(formatPercent(percent - 1), offsetParent, { fontSize, screenDimension }) * -1;
                            }
                            else {
                                result[direction] = convertLength(position, offsetParent, { fontSize, screenDimension });
                            }
                            result[directionAsPercent] = percent;
                            break;
                        }
                    }
                    if (horizontal) {
                        result.horizontal = position;
                    }
                    else {
                        result.vertical = position;
                    }
                    setImageOffset(position, horizontal, direction, directionAsPercent);
                }
            }
            else {
                let horizontal = 0,
                    vertical = 0;
                const checkPosition = (position: string, nextPosition?: string) => {
                    switch (position) {
                        case 'left':
                        case 'right':
                            result.horizontal = position;
                            ++horizontal;
                            break;
                        case 'center':
                            if (length === 4) {
                                return false;
                            }
                            else {
                                let centerHorizontal = true;
                                if (nextPosition === undefined) {
                                    if (horizontal) {
                                        result.vertical = position;
                                        centerHorizontal = false;
                                    }
                                    else {
                                        result.horizontal = position;
                                    }
                                }
                                else {
                                    switch (nextPosition) {
                                        case 'left':
                                        case 'right':
                                            result.vertical = position;
                                            centerHorizontal = false;
                                            break;
                                        case 'top':
                                        case 'bottom':
                                            result.horizontal = position;
                                            break;
                                        default:
                                            return false;
                                    }
                                }
                                if (centerHorizontal) {
                                    result.left = width / 2;
                                    result.leftAsPercent = 0.5;
                                    setImageOffset(position, true, 'left', 'leftAsPercent');
                                }
                                else {
                                    result.top = height / 2;
                                    result.topAsPercent = 0.5;
                                    setImageOffset(position, false, 'top', 'topAsPercent');
                                }
                            }
                            break;
                        case 'top':
                        case 'bottom':
                            result.vertical = position;
                            ++vertical;
                            break;
                        default:
                            return false;
                    }
                    return horizontal < 2 && vertical < 2;
                };
                for (let i = 0; i < length; ++i) {
                    const position = orientation[i];
                    if (isLength(position, true)) {
                        const alignment = orientation[i - 1];
                        switch (alignment) {
                            case 'left':
                            case 'right': {
                                const location = convertLength(position, width, { fontSize, screenDimension });
                                const locationAsPercent = convertPercent(position, width, { fontSize, screenDimension });
                                if (alignment === 'right') {
                                    result.right = location;
                                    result.rightAsPercent = locationAsPercent;
                                    setImageOffset(position, true, 'right', 'rightAsPercent');
                                    result.left = width - location;
                                    result.leftAsPercent = 1 - locationAsPercent;
                                }
                                else {
                                    if (locationAsPercent > 1) {
                                        const percent = 1 - locationAsPercent;
                                        result.horizontal = 'right';
                                        result.right = convertLength(formatPercent(percent), width, { fontSize, screenDimension });
                                        result.rightAsPercent = percent;
                                        setImageOffset(position, true, 'right', 'rightAsPercent');
                                    }
                                    result.left = location;
                                    result.leftAsPercent = locationAsPercent;
                                }
                                setImageOffset(position, true, 'left', 'leftAsPercent');
                                break;
                            }
                            case 'top':
                            case 'bottom': {
                                const location = convertLength(position, height, { fontSize, screenDimension });
                                const locationAsPercent = convertPercent(position, height, { fontSize, screenDimension });
                                if (alignment === 'bottom') {
                                    result.bottom = location;
                                    result.bottomAsPercent = locationAsPercent;
                                    setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                    result.top = height - location;
                                    result.topAsPercent = 1 - locationAsPercent;
                                }
                                else {
                                    if (locationAsPercent > 1) {
                                        const percent = 1 - locationAsPercent;
                                        result.horizontal = 'bottom';
                                        result.bottom = convertLength(formatPercent(percent), height, { fontSize, screenDimension });
                                        result.bottomAsPercent = percent;
                                        setImageOffset(position, false, 'bottom', 'bottomAsPercent');
                                    }
                                    result.top = location;
                                    result.topAsPercent = locationAsPercent;
                                }
                                setImageOffset(position, false, 'top', 'topAsPercent');
                                break;
                            }
                            default:
                                return newBoxRectPosition();
                        }
                    }
                    else if (!checkPosition(position, orientation[i + 1])) {
                        return newBoxRectPosition();
                    }
                }
            }
            result.static = result.top === 0 && result.right === 0 && result.bottom === 0 && result.left === 0;
            return result;
        }
        return newBoxRectPosition();
    }

    public static isBackgroundVisible(object: Undef<BoxStyle>) {
        return !!object && ('backgroundImage' in object || 'borderTop' in object || 'borderRight' in object || 'borderBottom' in object || 'borderLeft' in object);
    }

    public static generateId(section: string, name: string, start = 1) {
        const ids = this.STORED.ids;
        const stored = ids.get(section);
        let result = name + (start >= 1 ? '_' + start : '');
        if (!stored) {
            ids.set(section, [result]);
        }
        else {
            do {
                if (!stored.includes(result)) {
                    stored.push(result);
                    break;
                }
                else {
                    result = name + '_' + ++start;
                }
            }
            while (true);
        }
        return result;
    }

    public static insertStoredAsset(asset: string, name: string, value: any) {
        const stored: Map<string, unknown> = ResourceUI.STORED[asset];
        if (stored && hasValue(value)) {
            let result = '';
            if (stored) {
                for (const data of stored) {
                    if (isEqual(value, data[1])) {
                        result = data[0];
                        break;
                    }
                }
            }
            if (result === '') {
                if (isNumber(name)) {
                    name = '__' + name;
                }
                let i = 0;
                do {
                    result = i === 0 ? name : name + '_' + i;
                    if (!stored.has(result)) {
                        stored.set(result, value);
                        break;
                    }
                }
                while (++i);
            }
            return result;
        }
        return '';
    }

    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean) {
        let result: string[] = [],
            numberArray = true;
        iterateArray(element.children, (item: HTMLOptionElement) => {
            if (item.disabled && !showDisabled) {
                return;
            }
            switch (item.tagName) {
                case 'OPTION': {
                    const value = item.text.trim() || item.value.trim();
                    if (value !== '') {
                        if (numberArray && !isNumber(value)) {
                            numberArray = false;
                        }
                        result.push(value);
                    }
                    break;
                }
                case 'OPTGROUP': {
                    const [groupStringArray, groupNumberArray] = this.getOptionArray(item, showDisabled);
                    if (groupStringArray) {
                        result = result.concat(groupStringArray);
                        numberArray = false;
                    }
                    else if (groupNumberArray) {
                        result = result.concat(groupNumberArray);
                    }
                    break;
                }
            }
        });
        return numberArray ? [undefined, result] : [result];
    }

    public static parseBackgroundImage(node: NodeUI, backgroundImage: string, screenDimension?: Null<Dimension>) {
        const backgroundSize = node.css('backgroundSize').split(/\s*,\s*/);
        const images: (string | Gradient)[] = [];
        const getGradientPosition = (value: string) => isString(value) ? value.includes('at ') ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : [value, value] as RegExpExecArray : null;
        const getAngle = (value: string, fallback = 0) => {
            value = value.trim();
            if (value !== '') {
                let degree = parseAngle(value, fallback);
                if (!isNaN(degree)) {
                    if (degree < 0) {
                        degree += 360;
                    }
                    return degree;
                }
            }
            return fallback;
        };
        let i = 0,
            match: Null<RegExpExecArray>;
        while (match = REGEXP_BACKGROUNDIMAGE.exec(backgroundImage)) {
            const value = match[0];
            if (value.startsWith('url(') || value === 'initial') {
                images.push(value);
            }
            else {
                const repeating = !!match[1];
                const type = match[2];
                const direction = match[3];
                const imageDimension = backgroundSize.length ? ResourceUI.getBackgroundSize(node, backgroundSize[i % backgroundSize.length], screenDimension) : null;
                const dimension = node.fitToScreen(imageDimension || node.actualDimension);
                let gradient: Undef<Gradient>;
                switch (type) {
                    case 'linear': {
                        const { width, height } = dimension;
                        let angle = 180;
                        switch (direction) {
                            case 'to top':
                                angle = 360;
                                break;
                            case 'to right top':
                                angle = 45;
                                break;
                            case 'to right':
                                angle = 90;
                                break;
                            case 'to right bottom':
                                angle = 135;
                                break;
                            case 'to bottom':
                                break;
                            case 'to left bottom':
                                angle = 225;
                                break;
                            case 'to left':
                                angle = 270;
                                break;
                            case 'to left top':
                                angle = 315;
                                break;
                            default:
                                if (direction) {
                                    angle = getAngle(direction, 180) || 360;
                                }
                                break;
                        }
                        let x = truncateFraction(offsetAngleX(angle, width)),
                            y = truncateFraction(offsetAngleY(angle, height));
                        if (x !== width && y !== height && !equal(Math.abs(x), Math.abs(y))) {
                            let opposite: number;
                            if (angle <= 90) {
                                opposite = relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                            }
                            else if (angle <= 180) {
                                opposite = relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                            }
                            else if (angle <= 270) {
                                opposite = relativeAngle({ x: 0, y: 0 }, { x: width * -1, y: height });
                            }
                            else {
                                opposite = relativeAngle({ x: 0, y: height }, { x: width * -1, y: 0 });
                            }
                            const a = Math.abs(opposite - angle);
                            x = truncateFraction(offsetAngleX(angle, triangulate(a, 90 - a, hypotenuse(width, height))[1]));
                            y = truncateFraction(offsetAngleY(angle, triangulate(90, 90 - angle, x)[0]));
                        }
                        gradient = {
                            type,
                            repeating,
                            dimension,
                            angle,
                            angleExtent: { x, y }
                        } as LinearGradient;
                        gradient.colorStops = parseColorStops(node, gradient, match[4]);
                        break;
                    }
                    case 'radial': {
                        const position = getGradientPosition(direction);
                        const center = ResourceUI.getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension });
                        const { left, top } = center;
                        const { width, height } = dimension;
                        let shape = 'ellipse',
                            closestSide = top,
                            farthestSide = top,
                            closestCorner = Infinity,
                            farthestCorner = -Infinity,
                            radius = 0,
                            radiusExtent = 0;
                        if (position) {
                            const name = position[1]?.trim();
                            if (name) {
                                if (name.startsWith('circle')) {
                                    shape = 'circle';
                                }
                                else {
                                    const [radiusX, radiusY] = splitPair(name, ' ', true);
                                    let minRadius = Infinity;
                                    if (radiusX) {
                                        minRadius = node.parseWidth(radiusX, false);
                                    }
                                    if (radiusY) {
                                        minRadius = Math.min(node.parseHeight(radiusY, false), minRadius);
                                    }
                                    radius = minRadius;
                                    radiusExtent = minRadius;
                                    if (length === 1 || radiusX === radiusY) {
                                        shape = 'circle';
                                    }
                                }
                            }
                        }
                        for (const corner of [[0, 0], [width, 0], [width, height], [0, height]]) {
                            const length = Math.round(hypotenuse(Math.abs(corner[0] - left), Math.abs(corner[1] - top)));
                            closestCorner = Math.min(length, closestCorner);
                            farthestCorner = Math.max(length, farthestCorner);
                        }
                        for (const side of [width - left, height - top, left]) {
                            closestSide = Math.min(side, closestSide);
                            farthestSide = Math.max(side, farthestSide);
                        }
                        const radial = {
                            type,
                            repeating,
                            dimension,
                            shape,
                            center,
                            closestSide,
                            farthestSide,
                            closestCorner,
                            farthestCorner
                        } as RadialGradient;
                        if (radius === 0 && radiusExtent === 0) {
                            radius = farthestCorner;
                            const extent = position && position[1]?.split(' ').pop() || '';
                            switch (extent) {
                                case 'closest-corner':
                                case 'closest-side':
                                case 'farthest-side': {
                                    const length = radial[convertCamelCase(extent)];
                                    if (repeating) {
                                        radiusExtent = length;
                                    }
                                    else {
                                        radius = length;
                                    }
                                    break;
                                }
                                default:
                                    radiusExtent = farthestCorner;
                                    break;
                            }
                        }
                        radial.radius = radius;
                        radial.radiusExtent = radiusExtent;
                        radial.colorStops = parseColorStops(node, radial, match[4]);
                        gradient = radial;
                        break;
                    }
                    case 'conic': {
                        const position = getGradientPosition(direction);
                        gradient = {
                            type,
                            dimension,
                            angle: getAngle(direction),
                            center: ResourceUI.getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension })
                        } as ConicGradient;
                        gradient.colorStops = parseColorStops(node, gradient, match[4]);
                        break;
                    }
                }
                images.push(gradient || 'initial');
            }
            ++i;
        }
        REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
        if (images.length) {
            return images;
        }
    }

    public static getBackgroundSize(node: NodeUI, value: string, screenDimension?: Null<Dimension>): Null<Dimension> {
        let width = 0,
            height = 0;
        switch (value) {
            case '':
            case 'cover':
            case 'contain':
            case '100% 100%':
            case 'auto':
            case 'auto auto':
            case 'initial':
                return null;
            default: {
                value.split(' ').forEach((size, index) => {
                    if (size === 'auto') {
                        size = '100%';
                    }
                    switch (index) {
                        case 0:
                            width = node.parseUnit(size, { parent: false, screenDimension });
                            break;
                        case 1:
                            height = node.parseUnit(size, { dimension: 'height', parent: false, screenDimension });
                            break;
                    }
                });
                break;
            }
        }
        return width && height ? { width: Math.round(width), height: Math.round(height) } : null;
    }

    public static hasLineBreak(node: NodeUI, lineBreak?: boolean, trim?: boolean) {
        if (node.naturalElements.length) {
            return node.naturalElements.some(item => item.lineBreak);
        }
        else if (!lineBreak && node.naturalChild) {
            const value = trim ? node.element!.textContent!.trim() : node.element!.textContent!;
            return value.includes('\n') && (node.preserveWhiteSpace || node.plainText && node.actualParent!.preserveWhiteSpace || node.css('whiteSpace') === 'pre-line');
        }
        return false;
    }

    public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]> {
        if (node.plainText) {
            const parent = node.actualParent!;
            if (parent.preserveWhiteSpace && parent.ancestors('pre', { startSelf: true }).length) {
                let nextSibling = node.nextSibling as Undef<NodeUI>;
                if (nextSibling && nextSibling.naturalElement) {
                    const textContent = node.textContent;
                    if (isString(textContent)) {
                        const match = REGEXP_TRAILINGINDENT.exec(textContent);
                        if (match) {
                            if (!nextSibling.textElement) {
                                nextSibling = nextSibling.find(item => item.naturalChild && item.textElement, { cascade: true, error: item => item.naturalChild && !item.textElement && item.isEmpty() }) as Undef<NodeUI>;
                            }
                            if (nextSibling) {
                                return [match[1] ? match[0] : '', nextSibling];
                            }
                        }
                    }
                }
            }
        }
    }

    public finalize(layouts: FileAsset[]) {}

    public reset() {
        super.reset();
        ResourceUI.resetDataMap(ResourceUI.STORED);
    }

    public writeRawImage(options: RawDataOptions) {
        const fileHandler = this.fileHandler;
        if (fileHandler) {
            const { mimeType, filename, data, encoding, width, height } = options;
            if (filename && data) {
                const asset = {
                    pathname: appendSeparator((this.userSettings as UserResourceSettingsUI).outputDirectory, this.controllerSettings.directory.image),
                    filename,
                    mimeType,
                    width,
                    height
                } as Partial<RawAsset>;
                if (typeof data === 'string') {
                    if (encoding === 'base64') {
                        asset.base64 = data.startsWith('data:image/') ? splitPairEnd(data, ',') : data;
                    }
                }
                else if (Array.isArray(data)) {
                    asset.bytes = data;
                }
                else {
                    return null;
                }
                fileHandler.addAsset(asset);
                return asset;
            }
        }
        return null;
    }

    public setBoxStyle(node: T) {
        const visibleStyle = node.visibleStyle;
        if (visibleStyle.background) {
            const boxStyle = {} as BoxStyle;
            let borderWidth = visibleStyle.borderWidth,
                backgroundColor = node.backgroundColor,
                backgroundImage: Undef<(string | Gradient)[]>;
            if (borderWidth) {
                if (node.borderTopWidth) {
                    setBorderStyle(node, boxStyle, 'borderTop', BORDER_TOP);
                }
                if (node.borderRightWidth) {
                    setBorderStyle(node, boxStyle, 'borderRight', BORDER_RIGHT);
                }
                if (node.borderBottomWidth) {
                    setBorderStyle(node, boxStyle, 'borderBottom', BORDER_BOTTOM);
                }
                if (node.borderLeftWidth) {
                    setBorderStyle(node, boxStyle, 'borderLeft', BORDER_LEFT);
                }
            }
            if (visibleStyle.outline && setBorderStyle(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                borderWidth = true;
            }
            if (backgroundColor === '' && !node.documentParent.visible && node.has('backgroundColor')) {
                backgroundColor = node.css('backgroundColor');
            }
            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                const value = node.backgroundImage;
                if (value !== '') {
                    backgroundImage = ResourceUI.parseBackgroundImage(node, value, node.localSettings.screenDimension);
                }
            }
            if (backgroundColor || backgroundImage || borderWidth) {
                boxStyle.backgroundColor = parseColor(backgroundColor, 1, node.inputElement)?.valueAsRGBA || '';
                boxStyle.backgroundImage = backgroundImage;
                Object.assign(boxStyle, node.cssAsObject('backgroundSize', 'backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY'));
                if (setBackgroundOffset(node, boxStyle, 'backgroundClip')) {
                    setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                }
                if (node.css('borderRadius') !== '0px') {
                    const [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius] = node.cssAsTuple('borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                    const [A, B] = splitPair(borderTopLeftRadius, ' ');
                    const [C, D] = splitPair(borderTopRightRadius, ' ');
                    const [E, F] = splitPair(borderBottomRightRadius, ' ');
                    const [G, H] = splitPair(borderBottomLeftRadius, ' ');
                    const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                    const horizontal = node.actualWidth >= node.actualHeight;
                    const radius = borderRadius[0];
                    if (borderRadius.every(value => value === radius)) {
                        borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                    }
                    const length = borderRadius.length;
                    if (length) {
                        const dimension = horizontal ? 'width' : 'height';
                        for (let i = 0; i < length; ++i) {
                            borderRadius[i] = formatPX(node.parseUnit(borderRadius[i], { dimension, parent: false }));
                        }
                        boxStyle.borderRadius = borderRadius;
                    }
                }
                node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
        else if (visibleStyle.outline) {
            const boxStyle = {} as BoxStyle;
            if (setBorderStyle(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
    }

    public setFontStyle(node: T) {
        if ((node.textElement || node.inlineText) && (!node.textEmpty || node.pseudoElement || node.visibleStyle.background) || node.inputElement) {
            const color = parseColor(node.css('color'));
            let fontWeight = node.css('fontWeight');
            if (!isNumber(fontWeight)) {
                switch (fontWeight) {
                    case 'lighter':
                        fontWeight = '200';
                        break;
                    case 'bold':
                        fontWeight = '700';
                        break;
                    case 'bolder':
                        fontWeight = '900';
                        break;
                    default:
                        fontWeight = '400';
                        break;
                }
            }
            node.data(ResourceUI.KEY_NAME, 'fontStyle', {
                fontFamily: node.css('fontFamily'),
                fontStyle: node.css('fontStyle'),
                fontSize: node.fontSize,
                fontWeight,
                color: color && color.valueAsRGBA || ''
            } as FontAttribute);
        }
    }

    public setValueString(node: T) {
        let value: Undef<string>,
            trimming: Undef<boolean>,
            inlined: Undef<boolean>;
        if (node.naturalChild) {
            const element = node.element as HTMLInputElement;
            let hint: Undef<string>;
            switch (element.tagName) {
                case 'INPUT':
                    value = getNamedItem(element, 'value');
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox': {
                            const companion = node.companion;
                            if (companion && !companion.visible) {
                                value = companion.textContent.trim();
                            }
                            break;
                        }
                        case 'submit':
                            if (value === '' && !node.visibleStyle.backgroundImage) {
                                value = isUserAgent(USER_AGENT.FIREFOX) ? 'Submit Query' : 'Submit';
                            }
                            break;
                        case 'reset':
                            if (value === '' && !node.visibleStyle.backgroundImage) {
                                value = 'Reset';
                            }
                            break;
                        case 'time':
                            if (value === '') {
                                hint = '--:-- --';
                            }
                            break;
                        case 'date':
                        case 'datetime-local':
                            if (value === '') {
                                switch (new Intl.DateTimeFormat().resolvedOptions().locale) {
                                    case 'en-US':
                                        hint = 'mm/dd/yyyy';
                                        break;
                                    default:
                                        hint = 'dd/mm/yyyy';
                                        break;
                                }
                                if (element.type === 'datetime-local') {
                                    hint += ' --:-- --';
                                }
                            }
                            break;
                        case 'week':
                            if (value === '') {
                                hint = 'Week: --, ----';
                            }
                            break;
                        case 'month':
                            if (value === '') {
                                hint = '--------- ----';
                            }
                            break;
                        case 'text':
                        case 'password':
                        case 'url':
                        case 'email':
                        case 'search':
                        case 'number':
                        case 'tel':
                            if (value === '') {
                                hint = element.placeholder;
                            }
                            break;
                        case 'file':
                            value = isUserAgent(USER_AGENT.FIREFOX) ? 'Browse...' : 'Choose File';
                            break;
                        case 'color': {
                            const borderColor = this.controllerSettings.style.inputColorBorderColor;
                            const backgroundColor = (parseColor(value) as ColorData || parseColor('rgb(0, 0, 0)')).valueAsRGBA;
                            const { width, height } = node.actualDimension;
                            const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${height - 8}px`;
                            const backgroundRepeat = 'no-repeat, no-repeat';
                            const backgroundPositionX = 'center, center';
                            const backgroundPositionY = 'center, center';
                            const backgroundImage = ResourceUI.parseBackgroundImage(node, `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`) as Gradient[];
                            value = '';
                            let boxStyle = node.data<BoxStyle>(ResourceUI.KEY_NAME, 'boxStyle');
                            if (boxStyle) {
                                const backgroundImageA = boxStyle.backgroundImage;
                                if (backgroundImageA) {
                                    boxStyle.backgroundSize = `${backgroundSize}, ${boxStyle.backgroundSize}`;
                                    boxStyle.backgroundRepeat = `${backgroundRepeat}, ${boxStyle.backgroundRepeat}`;
                                    boxStyle.backgroundPositionX = `${backgroundPositionX}, ${boxStyle.backgroundPositionX}`;
                                    boxStyle.backgroundPositionY = `${backgroundPositionY}, ${boxStyle.backgroundPositionY}`;
                                    backgroundImageA.unshift(...backgroundImage);
                                    break;
                                }
                            }
                            else {
                                boxStyle = {} as BoxStyle;
                            }
                            node.data(ResourceUI.KEY_NAME, 'boxStyle', Object.assign(boxStyle, {
                                backgroundSize,
                                backgroundRepeat,
                                backgroundPositionX,
                                backgroundPositionY,
                                backgroundImage
                            }));
                            break;
                        }
                        case 'range':
                            hint = value;
                            value = '';
                            break;
                    }
                    break;
                case 'TEXTAREA':
                    value = element.value;
                    hint = element.placeholder;
                    break;
                case 'IFRAME':
                    value = element.src;
                    break;
                default: {
                    trimming = true;
                    if (node.plainText || node.pseudoElement || node.hasAlign(NODE_ALIGNMENT.INLINE) && node.textElement) {
                        value = trimming ? node.textContent.replace(/&/g, '&amp;') : node.textContent;
                        inlined = true;
                    }
                    else if (node.inlineText) {
                        value = node.textEmpty ? ResourceUI.STRING_SPACE : node.tagName === 'BUTTON' ? node.textContent : this.removeExcludedFromText(node, element);
                    }
                    break;
                }
            }
            if (hint) {
                node.data(ResourceUI.KEY_NAME, 'hintString', hint);
            }
        }
        else if (node.inlineText) {
            value = node.textContent;
            trimming = true;
        }
        if (value) {
            value = value.replace(/\u00A0/g, ResourceUI.STRING_SPACE);
            switch (node.css('whiteSpace')) {
                case 'pre':
                case 'pre-wrap': {
                    if (!node.renderParent!.layoutVertical) {
                        value = value.replace(/^\s*\n/, '');
                    }
                    const preIndent = ResourceUI.checkPreIndent(node);
                    if (preIndent) {
                        const [indent, adjacent] = preIndent;
                        if (indent !== '') {
                            adjacent.textContent = indent + adjacent.textContent;
                        }
                        value = value.replace(REGEXP_TRAILINGINDENT, '');
                    }
                }
                case 'break-spaces':
                    value = value
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, ResourceUI.STRING_SPACE.repeat(node.toInt('tabSize', 8)))
                        .replace(/\s/g, ResourceUI.STRING_SPACE);
                    trimming = false;
                    break;
                case 'pre-line':
                    value = value
                        .replace(/\n/g, '\\n')
                        .replace(/\s{2,}/g, ' ');
                    trimming = false;
                    break;
                case 'nowrap':
                    value = value
                        .replace(/\n+/g, ' ')
                        .replace(/\s{2,}/g, ' ');
                    inlined = true;
                default: {
                    if (node.onlyChild && node.htmlElement) {
                        value = value
                            .replace(CHAR_LEADINGSPACE, '')
                            .replace(CHAR_TRAILINGSPACE, '');
                    }
                    else if (!node.naturalChild) {
                        if (!node.horizontalRowStart) {
                            const element = node.element;
                            const previousSibling = element && element.previousSibling;
                            if (previousSibling instanceof HTMLElement && !hasEndingSpace(previousSibling) && element!.textContent!.trim().startsWith(value.trim())) {
                                value = value.replace(CHAR_LEADINGSPACE, ResourceUI.STRING_SPACE);
                                break;
                            }
                        }
                        if (checkPreviousSibling(node.siblingsLeading[0])) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                    }
                    else {
                        if (node.horizontalRowStart || node.previousSibling?.blockStatic) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                        if (node.nextSibling?.blockStatic) {
                            value = value.replace(CHAR_TRAILINGSPACE, '');
                        }
                    }
                    break;
                }
            }
        }
        else if (node.naturalChildren.length === 0 && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data<BoxStyle>(ResourceUI.KEY_NAME, 'boxStyle')) && !isString(node.textContent)) {
            value = node.textContent;
        }
        if (value) {
            if (trimming) {
                if (!node.naturalChild) {
                    value = value.replace(CHAR_TRAILINGSPACE, node.horizontalRowEnd ? '' : ResourceUI.STRING_SPACE);
                }
                else if (node.pageFlow) {
                    const previousSibling = node.siblingsLeading[0];
                    const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                    let previousSpaceEnd: Undef<boolean>;
                    if (value.length > 1) {
                        if (checkPreviousSibling(previousSibling)) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                        else if (previousSibling.naturalElement) {
                            previousSpaceEnd = hasEndingSpace(previousSibling.element as HTMLElement) || previousSibling.lastStaticChild?.lineBreak;
                        }
                    }
                    if (inlined) {
                        const trailingSpace = !node.lineBreakTrailing && CHAR_TRAILINGSPACE.test(value);
                        if (CHAR_LEADINGSPACE.test(value) && previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                            value = ResourceUI.STRING_SPACE + value.trim();
                        }
                        else {
                            value = value.trim();
                        }
                        if (trailingSpace && nextSibling && !nextSibling.blockStatic && !nextSibling.floating) {
                            value += ResourceUI.STRING_SPACE;
                        }
                    }
                    else if (!CHAR_EMPTYSTRING.test(value)) {
                        value =
                            value.replace(CHAR_LEADINGSPACE, previousSibling && (
                                previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node))
                                ? ''
                                : ResourceUI.STRING_SPACE
                            );
                        value = value.replace(CHAR_TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic || nextSibling && nextSibling.floating ? '' : ResourceUI.STRING_SPACE);
                    }
                    else if (!node.inlineText) {
                        return;
                    }
                }
                else {
                    value = value.trim();
                }
            }
            if (value !== '') {
                node.data(ResourceUI.KEY_NAME, 'valueString', value);
            }
        }
    }

    public removeExcludedFromText(node: T, element: Element) {
        const { preserveWhiteSpace, sessionId } = node;
        const styled = element.children.length > 0 || element.tagName === 'CODE';
        const attr = styled ? 'innerHTML' : 'textContent';
        let value: string = element[attr] || '';
        element.childNodes.forEach((item: Element, index: number) => {
            const child = getElementAsNode<NodeUI>(item, sessionId);
            if (!child || !child.textElement || child.pseudoElement || !child.pageFlow || child.positioned || child.excluded) {
                if (child) {
                    if (styled && child.htmlElement) {
                        if (child.lineBreak) {
                            value = value.replace(!preserveWhiteSpace ? new RegExp(`\\s*${item.outerHTML}\\s*`) : item.outerHTML, child.lineBreakTrailing && child.previousSibling?.inlineStatic ? '' : '\\n');
                        }
                        else if (child.positioned) {
                            value = value.replace(item.outerHTML, '');
                        }
                        else if (!preserveWhiteSpace) {
                            value = value.replace(item.outerHTML, child.pageFlow && isString(child.textContent) ? ResourceUI.STRING_SPACE : '');
                        }
                        return;
                    }
                    else {
                        const textContent = child.plainText ? child.textContent : child[attr];
                        if (isString(textContent)) {
                            if (!preserveWhiteSpace) {
                                value = value.replace(textContent, '');
                            }
                            return;
                        }
                    }
                }
                else if (item.nodeName[0] !== '#') {
                    value = value.replace(item.outerHTML, !hasCoords(getComputedStyle(item).getPropertyValue('position')) && isString(item.textContent!) ? ResourceUI.STRING_SPACE : '');
                }
                if (!preserveWhiteSpace) {
                    if (index === 0) {
                        value = value.replace(CHAR_LEADINGSPACE, '');
                    }
                    else if (index === length - 1) {
                        value = value.replace(CHAR_TRAILINGSPACE, '');
                    }
                }
            }
        });
        if (!styled) {
            return value;
        }
        else if (!preserveWhiteSpace && CHAR_EMPTYSTRING.test(value)) {
            return node.blockStatic ? ResourceUI.STRING_SPACE : '';
        }
        return value.replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)));
    }

    get controllerSettings() {
        return (this.application.controllerHandler as ControllerUI<T>).localSettings;
    }

    get mapOfStored() {
        return ResourceUI.STORED;
    }
}