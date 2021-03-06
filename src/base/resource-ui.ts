import USER_AGENT = squared.lib.constant.USER_AGENT;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;

import type ApplicationUI from './application-ui';
import type NodeUI from './node-ui';
import type NodeList from './nodelist';

import Resource from './resource';

import { CSS, STRING } from './lib/regex';

import { appendSeparator, generateUUID } from './lib/util';

const { CSS_BORDER_SET } = squared.lib.internal;
const { TAG_ATTR, TAG_OPEN } = squared.lib.regex.STRING;

const { isUserAgent } = squared.lib.client;
const { parseColor } = squared.lib.color;
const { asPercent, calculateAll, convertAngle, formatPercent, formatPX, getStyle, hasCoords, isCalc, isLength, parseAngle, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { cos, equal, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = squared.lib.math;
const { getElementAsNode } = squared.lib.session;
const { convertBase64, convertCamelCase, escapePattern, hasValue, isEqual, isNumber, isString, iterateArray, lastItemOf, replaceAll, splitPair, startsWith } = squared.lib.util;

const [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT, BORDER_OUTLINE] = CSS_BORDER_SET;

const REGEXP_COLORSTOP = new RegExp(STRING.CSS_COLORSTOP, 'g');
const REGEXP_TRAILINGINDENT = /\n([^\S\n]*)?$/;
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
                default:
                    size = Math.abs(width * sin(angle - 180)) + Math.abs(height * cos(angle - 180));
                    horizontal = width >= height;
                    break;
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
    while (match = REGEXP_COLORSTOP.exec(value)) {
        const color = parseColor(match[1]);
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
                    const n = asPercent(unit);
                    if (!isNaN(n)) {
                        offset = n;
                    }
                    else if (isLength(unit)) {
                        offset = (horizontal ? node.parseWidth(unit, false) : node.parseHeight(unit, false)) / size;
                    }
                    else if (isCalc(unit)) {
                        offset = calculateAll(unit, { boundingSize: size, fontSize: node.fontSize, screenDimension: node.localSettings.screenDimension }) / size;
                    }
                    if (repeat && offset !== -1) {
                        offset *= extent;
                    }
                }
            }
            if (!isNaN(offset)) {
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
    }
    const lastStop = lastItemOf(result);
    if (lastStop) {
        if (lastStop.offset === -1) {
            lastStop.offset = 1;
        }
        let percent = 0;
        const length = result.length;
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
            result.push({ ...lastStop, offset: 1 });
        }
    }
    REGEXP_COLORSTOP.lastIndex = 0;
    return result;
}

function setBorderStyle(node: NodeUI, boxStyle: BoxStyle, attr: "borderTop" | "borderRight" | "borderBottom" | "borderLeft" | "outline", border: CssStyleAttr[]) {
    let width = node[border[1]] as number;
    if (width > 0) {
        const style = node.css(border[0]) || 'solid';
        let color: Null<string | ColorData> = node.css(border[2]) || 'rgb(0, 0, 0)';
        if (startsWith(color, 'current')) {
            color = node.css('color');
        }
        if (width === 2 && (style === 'inset' || style === 'outset')) {
            width = 1;
        }
        if (color = parseColor(color)) {
            boxStyle[attr] = { width, style, color } as BorderAttribute;
            return true;
        }
    }
    return false;
}

function setBackgroundClip(node: NodeUI, boxStyle: BoxStyle, attr: CssStyleAttr = "backgroundClip") {
    switch (node.valueOf(attr) || (attr === 'backgroundClip' ? 'border-box' : 'padding-box')) {
        case 'border-box':
            if (attr === "backgroundClip") {
                setBackgroundClip(node, boxStyle, 'backgroundOrigin');
            }
            break;
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
}

function hasEndingSpace(element: HTMLElement) {
    const ch = lastItemOf(element.textContent!);
    return ch === ' ' || ch === '\t';
}

function newBoxRectPosition(orientation = ['left', 'top']): BoxRectPosition {
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
    };
}

function replaceSvgAttribute(src: string, tagName: string, attrs: NumString[], uuid: string, start: boolean) {
    const length = attrs.length;
    let i = 0;
    while (i < length) {
        const attr = attrs[i++];
        tagName = (i === 0 && start ? '' : '!' + uuid) + `(${tagName})`;
        const style = ' ' + attr + `="${attrs[i++]}"`;
        const match = new RegExp(`<${tagName}(${TAG_OPEN}+?)${attr}\\s*${TAG_ATTR}(${TAG_OPEN}*)>`, 'i').exec(src);
        src = match ? replaceAll(src, match[0], '<!' + uuid + match[1] + match[2] + style + match[6] + '>', 1) : src.replace(new RegExp(`<${tagName}`, 'i'), (...capture) => '<!' + uuid + capture[1] + style);
    }
    return src;
}

function replaceSvgValues(src: string, children: HTMLCollection | SVGElement[], dimension?: Dimension) {
    for (let i = 0, length = children.length; i < length; ++i) {
        const item = children[i];
        const uuid = generateUUID('10');
        const tagName = item.tagName.toLowerCase();
        let start = true;
        switch (tagName) {
            case 'svg':
            case 'use':
            case 'rect':
            case 'pattern':
                try {
                    src = replaceSvgAttribute(src,
                        tagName,
                        [
                            'width', dimension && dimension.width || (item as SVGSVGElement).width.baseVal.value,
                            'height', dimension && dimension.height || (item as SVGSVGElement).height.baseVal.value
                        ],
                        uuid,
                        true
                    );
                    start = false;
                }
                catch {
                }
            case 'symbol':
            case 'g':
            case 'path':
            case 'line':
            case 'ellipse':
            case 'circle':
            case 'polyline':
            case 'polygon': {
                const { stroke, strokeWidth, strokeDasharray, strokeDashoffset, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeOpacity, fill, fillRule, fillOpacity, clipPath, clipRule } = getStyle(item);
                const strokeColor = parseColor(stroke);
                const fillColor = parseColor(fill);
                src = replaceSvgAttribute(
                    src,
                    tagName,
                    [
                        'stroke', strokeColor && !strokeColor.transparent ? strokeColor.valueAsRGBA : 'none',
                        'stroke-width', strokeWidth,
                        'stroke-dasharray', strokeDasharray,
                        'stroke-dashoffset', strokeDashoffset,
                        'stroke-linecap', strokeLinecap,
                        'stroke-linejoin', strokeLinejoin,
                        'stroke-miterlimit', strokeMiterlimit,
                        'stroke-opacity', strokeOpacity,
                        'fill', fillColor && !fillColor.transparent ? fillColor.valueAsRGBA : 'none',
                        'fill-rule', fillRule,
                        'fill-opacity', fillOpacity,
                        'clip-path', clipPath,
                        'clip-rule', clipRule
                    ],
                    uuid,
                    start
                );
                src = replaceSvgValues(src, item.children);
                break;
            }
            case 'stop': {
                const { stopColor, stopOpacity } = getStyle(item);
                const color = parseColor(stopColor);
                src = replaceSvgAttribute(
                    src,
                    tagName,
                    [
                        'stop-color', color && !color.transparent ? color.valueAsRGBA : 'none',
                        'stop-opacity', stopOpacity
                    ],
                    uuid,
                    true
                );
                break;
            }
        }
    }
    return src;
}

function parseLength(value: string, dimension: number, options?: ParseUnitOptions) {
    const n = asPercent(value);
    return !isNaN(n) ? Math.round(n * dimension) : parseUnit(value, options);
}

function parsePercent(value: string, dimension: number, options?: ParseUnitOptions) {
    const n = asPercent(value);
    return !isNaN(n) ? n : parseUnit(value, options) / dimension;
}

const checkPreviousSibling = (node: Undef<NodeUI>) => !node || node.lineBreak || node.floating || node.plainText && CHAR_TRAILINGSPACE.test(node.textContent);

export default class ResourceUI<T extends NodeUI> extends Resource<T> implements squared.base.ResourceUI<T> {
    public static readonly STORED: ResourceSessionStored = [];

    public static generateId(resourceId: number, section: string, name: string, start = 1) {
        const stored = this.STORED[resourceId];
        if (stored) {
            const data = stored.ids.get(section);
            let result = name + (start >= 1 ? '_' + start : '');
            if (data) {
                do {
                    if (!data.includes(result)) {
                        data.push(result);
                        break;
                    }
                    else {
                        result = name + '_' + ++start;
                    }
                }
                while (true);
            }
            else {
                stored.ids.set(section, [result]);
            }
            return result;
        }
        return '';
    }

    public static insertStoredAsset(resourceId: number, type: string, name: string, value: unknown) {
        const stored = this.STORED[resourceId];
        if (stored && hasValue(value)) {
            const data = stored[type];
            if (data instanceof Map) {
                for (const item of data) {
                    if (isEqual(value, item[1])) {
                        return item[0];
                    }
                }
                if (!isNaN(+name)) {
                    name = '__' + name;
                }
                let result = '',
                    i = 0;
                do {
                    result = i === 0 ? name : name + '_' + i;
                    if (!data.has(result)) {
                        data.set(result, value);
                        break;
                    }
                }
                while (++i);
                return result;
            }
        }
        return '';
    }

    public static getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions) {
        if (value && value !== 'left top' && value !== '0% 0%') {
            let imageDimension: Optional<Dimension>,
                imageSize: Undef<string>;
            if (options) {
                ({ imageDimension, imageSize } = options);
            }
            const { width, height } = dimension;
            const setImageOffset = (position: string, horizontal: boolean, direction: string, directionAsPercent: string) => {
                if (imageDimension && !isLength(position)) {
                    let offset = result[directionAsPercent];
                    if (imageSize && imageSize !== 'auto' && imageSize !== 'initial') {
                        const [sizeW, sizeH] = imageSize.split(/\s+/);
                        let imageOffset: number,
                            n: number;
                        if (horizontal) {
                            imageOffset = width;
                            if (!isNaN(n = asPercent(sizeW))) {
                                imageOffset *= n;
                            }
                            else if (isLength(sizeW)) {
                                imageOffset = parseUnit(sizeW, options) || imageOffset;
                            }
                            else if (sizeH) {
                                let percent = 1;
                                if (!isNaN(n = asPercent(sizeH))) {
                                    percent = (n * height) / imageDimension.height;
                                }
                                else if (isLength(sizeH)) {
                                    const unit = parseUnit(sizeH, options);
                                    if (unit) {
                                        percent = unit / imageDimension.height;
                                    }
                                }
                                imageOffset = percent * imageDimension.width;
                            }
                        }
                        else {
                            imageOffset = height;
                            if (!isNaN(n = asPercent(sizeH))) {
                                imageOffset *= n;
                            }
                            else if (isLength(sizeH)) {
                                imageOffset = parseUnit(sizeH, options) || imageOffset;
                            }
                            else if (sizeW) {
                                let percent = 1;
                                if (!isNaN(n = asPercent(sizeW))) {
                                    percent = (n * width) / imageDimension.width;
                                }
                                else if (isLength(sizeW)) {
                                    const unit = parseUnit(sizeW, options);
                                    if (unit) {
                                        percent = unit / imageDimension.width;
                                    }
                                }
                                imageOffset = percent * imageDimension.height;
                            }
                        }
                        offset *= imageOffset;
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
                            const percent = parsePercent(position, offsetParent, options);
                            if (percent > 1) {
                                orientation[i] = '100%';
                                position = horizontal ? 'right' : 'bottom';
                                result[position] = parseLength(formatPercent(percent - 1), offsetParent, options) * -1;
                            }
                            else {
                                result[direction] = parseLength(position, offsetParent, options);
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
                        case 'center': {
                            if (length === 4) {
                                return false;
                            }
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
                            break;
                        }
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
                                const location = parseLength(position, width, options);
                                const locationAsPercent = parsePercent(position, width, options);
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
                                        result.right = parseLength(formatPercent(percent), width, options);
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
                                const location = parseLength(position, height, options);
                                const locationAsPercent = parsePercent(position, height, options);
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
                                        result.bottom = parseLength(formatPercent(percent), height, options);
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

    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean) {
        const result: string[] = [];
        let numberArray = true;
        iterateArray(element.children, (item: HTMLOptionElement) => {
            if (item.disabled && !showDisabled) {
                return;
            }
            switch (item.tagName) {
                case 'OPTION': {
                    const value = item.text.trim() || item.value.trim();
                    if (value) {
                        if (numberArray && isNaN(+value)) {
                            numberArray = false;
                        }
                        result.push(value);
                    }
                    break;
                }
                case 'OPTGROUP': {
                    const [groupStringArray, groupNumberArray] = this.getOptionArray(item, showDisabled);
                    if (groupStringArray) {
                        result.push(...groupStringArray);
                        numberArray = false;
                    }
                    else if (groupNumberArray) {
                        result.push(...groupNumberArray);
                    }
                    break;
                }
            }
        });
        return numberArray ? [undefined, result] : [result];
    }

    public static parseBackgroundImage(node: NodeUI, backgroundImage: string) {
        const backgroundSize = node.css('backgroundSize').split(/\s*,\s*/);
        const images: (string | Gradient)[] = [];
        const getGradientPosition = (value: string) => isString(value) ? value.indexOf('at ') !== -1 ? /(.*?)at\s+(.+?)(?:\s+|$)$/.exec(value) : [value, value] as RegExpExecArray : null;
        const getAngle = (value: string, fallback = 0) => {
            if (value = value.trim()) {
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
        CSS.BACKGROUNDIMAGE_G.lastIndex = 0;
        let i = 0,
            match: Null<RegExpExecArray>;
        while (match = CSS.BACKGROUNDIMAGE_G.exec(backgroundImage)) {
            const value = match[0];
            if (startsWith(value, 'url(') || value === 'initial') {
                images.push(value);
            }
            else {
                const repeating = !!match[1];
                const type = match[2];
                const direction = match[3];
                const imageDimension = backgroundSize.length ? ResourceUI.getBackgroundSize(node, backgroundSize[i % backgroundSize.length]) : null;
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
                        const center = ResourceUI.getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension: node.localSettings.screenDimension });
                        const { left, top } = center;
                        const { width, height } = dimension;
                        let shape = 'ellipse',
                            closestSide = top,
                            farthestSide = top,
                            closestCorner = Infinity,
                            farthestCorner = -Infinity,
                            radius = 0,
                            radiusExtent = 0,
                            shapeAt: Undef<string>;
                        if (position && (shapeAt = position[1].trim())) {
                            if (startsWith(shapeAt, 'circle')) {
                                shape = 'circle';
                            }
                            else {
                                const [radiusX, radiusY] = splitPair(shapeAt, ' ');
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
                        const getCorner = (right: number, bottom: number) => Math.round(hypotenuse(Math.abs(right - left), Math.abs(bottom - top)));
                        const setCorners = (...values: number[]) => {
                            closestCorner = Math.min(closestCorner, ...values);
                            farthestCorner = Math.max(farthestCorner, ...values);
                        };
                        const setSides = (...values: number[]) => {
                            closestSide = Math.min(closestSide, ...values);
                            farthestSide = Math.max(farthestSide, ...values);
                        };
                        setCorners(
                            getCorner(0, 0),
                            getCorner(width, 0),
                            getCorner(width, height),
                            getCorner(0, height)
                        );
                        setSides(
                            width - left,
                            height - top,
                            left
                        );
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
                            const extent = shapeAt && shapeAt.split(' ').pop() || '';
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
                            center: ResourceUI.getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension: node.localSettings.screenDimension })
                        } as ConicGradient;
                        gradient.colorStops = parseColorStops(node, gradient, match[4]);
                        break;
                    }
                }
                images.push(gradient || 'initial');
            }
            ++i;
        }
        if (images.length) {
            return images;
        }
    }

    public static getBackgroundSize(node: NodeUI, value: string, dimension?: Dimension): Null<Dimension> {
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
                let width = NaN,
                    height = NaN;
                value.split(' ').forEach((size, index) => {
                    if (size === 'auto' && !dimension) {
                        size = '100%';
                    }
                    if (index === 0) {
                        width = node.parseWidth(size, false);
                    }
                    else {
                        height = node.parseHeight(size, false);
                    }
                });
                if (dimension) {
                    if (isNaN(width) && height) {
                        width = dimension.width * height / dimension.height;
                    }
                    if (isNaN(height) && width) {
                        height = dimension.height * width / dimension.width;
                    }
                }
                return width && height ? { width: Math.round(width), height: Math.round(height) } : null;
            }
        }
    }

    public static hasLineBreak(node: NodeUI, lineBreak?: boolean, trim?: boolean) {
        if (node.naturalElements.length) {
            return node.naturalElements.some(item => item.lineBreak);
        }
        else if (!lineBreak && node.naturalChild) {
            let value = node.textContent;
            if (trim) {
                value = value.trim();
            }
            return value.indexOf('\n') !== -1 && (node.preserveWhiteSpace || node.plainText && node.actualParent!.preserveWhiteSpace || node.css('whiteSpace') === 'pre-line');
        }
        return false;
    }

    public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]> {
        if (node.plainText) {
            const parent = node.actualParent!;
            if (parent.preserveWhiteSpace && parent.ancestors('pre', { startSelf: true }).length) {
                let nextSibling = node.nextSibling as Optional<NodeUI>;
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

    public readonly application!: ApplicationUI<T>;

    public createThread(resourceId: number) {
        const data = ResourceUI.STORED[resourceId] ||= {} as ResourceStoredMap;
        data.ids = new Map();
        data.strings = new Map();
        data.arrays = new Map();
        data.fonts = new Map();
        data.colors = new Map();
        data.images = new Map();
        super.createThread(...(arguments as unknown) as [number]);
    }

    public clear() {
        ResourceUI.STORED.length = 0;
        super.clear();
    }

    public setData(rendering: NodeList<T>) {
        rendering.each(node => {
            if (node.renderExclude) {
                return;
            }
            if (node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
                this.setBoxStyle(node);
            }
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING) && (node.visible && !node.imageContainer || node.labelFor)) {
                if (node.hasResource(NODE_RESOURCE.FONT_STYLE)) {
                    this.setFontStyle(node);
                }
                this.setValueString(node);
            }
        });
    }

    public writeRawImage(resourceId: number, filename: string, options: RawDataOptions) {
        let { base64, content } = options;
        if (base64 || content || options.buffer) {
            if (!base64) {
                if (options.buffer) {
                    base64 = convertBase64(options.buffer);
                }
                else if (content && options.encoding === 'base64') {
                    base64 = startsWith(content, 'data:') ? splitPair(content, ',', true)[1] : content;
                }
                else {
                    return;
                }
            }
            if (options.mimeType === 'image/svg+xml') {
                content = window.atob(base64);
                base64 = undefined;
            }
            else {
                content = undefined;
            }
            const pathname = appendSeparator(this.application.userSettings.outputDirectory, this.controllerSettings.directory.image);
            const other = ResourceUI.ASSETS[resourceId]!.other;
            let result: Undef<RawAsset>;
            if (other) {
                result = other.find(item => item.pathname === pathname && item.filename === filename);
                if (result) {
                    if (content && result.content === content || base64 && result.base64 === base64) {
                        return result;
                    }
                    const ext = ResourceUI.getExtension(filename);
                    const basename = filename.substring(0, filename.length - ext.length);
                    let i = 1;
                    do {
                        filename = `${basename}_${i}.${ext}`;
                    }
                    while (other.find(item => item.pathname === pathname && item.filename === filename) && ++i);
                }
            }
            result = {
                pathname,
                filename,
                content,
                base64,
                mimeType: options.mimeType,
                width: options.width,
                height: options.height,
                tasks: options.tasks,
                watch: options.watch
            } as RawAsset;
            this.addAsset(resourceId, result);
            return result;
        }
    }

    public writeRawSvg(resourceId: number, element: SVGSVGElement, dimension?: Dimension) {
        const content = replaceSvgValues(element.outerHTML.trim().replace(/\s+/g, ' '), [element], dimension)
            .replace(/["']/g, (...capture) => '\\' + capture[0])
            .replace(/<!\d+/g, '<');
        const uri = 'data:image/svg+xml,' + content;
        this.addRawData(resourceId, uri, { mimeType: 'image/svg+xml', content });
        return uri;
    }

    public setBoxStyle(node: T) {
        const visibleStyle = node.visibleStyle;
        if (visibleStyle.background) {
            const boxStyle = {} as BoxStyle;
            let borderWidth = visibleStyle.borderWidth,
                backgroundColor = node.backgroundColor;
            if (borderWidth) {
                setBorderStyle(node, boxStyle, 'borderTop', BORDER_TOP);
                setBorderStyle(node, boxStyle, 'borderRight', BORDER_RIGHT);
                setBorderStyle(node, boxStyle, 'borderBottom', BORDER_BOTTOM);
                setBorderStyle(node, boxStyle, 'borderLeft', BORDER_LEFT);
            }
            if (visibleStyle.outline && setBorderStyle(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                borderWidth = true;
            }
            if (!backgroundColor && !node.documentParent.visible && node.has('backgroundColor')) {
                backgroundColor = node.css('backgroundColor');
            }
            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                const value = node.backgroundImage;
                if (value) {
                    boxStyle.backgroundImage = ResourceUI.parseBackgroundImage(node, value);
                }
            }
            if (visibleStyle.borderRadius) {
                const [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius] = node.cssAsTuple('borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                const [A, B] = splitPair(borderTopLeftRadius, ' ');
                const [C, D] = splitPair(borderTopRightRadius, ' ');
                const [E, F] = splitPair(borderBottomRightRadius, ' ');
                const [G, H] = splitPair(borderBottomLeftRadius, ' ');
                const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                const horizontal = node.actualWidth >= node.actualHeight;
                const radius = borderRadius[0];
                if (borderRadius.every(value => value === radius)) {
                    borderRadius.length = !radius || radius === '0px' ? 0 : 1;
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
            if (backgroundColor || borderWidth || boxStyle.backgroundImage || boxStyle.borderRadius) {
                const color = parseColor(backgroundColor);
                if (color && (!color.transparent || node.inputElement)) {
                    boxStyle.backgroundColor = color;
                }
                Object.assign(boxStyle, node.cssAsObject('backgroundSize', 'backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY'));
                setBackgroundClip(node, boxStyle);
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
        if ((node.textElement || node.inlineText) && (!node.textEmpty || node.pseudoElement || node.visibleStyle.background) || node.inputElement && !node.controlElement) {
            let fontWeight = node.css('fontWeight');
            if (!isNumber(fontWeight)) {
                switch (fontWeight) {
                    case 'lighter':
                    case 'bolder':
                        fontWeight = node.style.fontWeight;
                        break;
                    case 'bold':
                        fontWeight = '700';
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
                color: parseColor(node.css('color'))
            } as FontAttribute);
        }
    }

    public setValueString(node: T) {
        let value: Undef<string>,
            trimming: Undef<boolean>,
            inlined: Undef<boolean>;
        if (node.naturalChild) {
            const element = node.element as HTMLInputElement;
            let hint: Undef<string>,
                hintColor: Optional<ColorData>;
            const setHintColor = () => {
                const elementData = node.elementData;
                if (elementData) {
                    const styleMap = elementData['styleMap::placeholder'];
                    if (styleMap && styleMap.color) {
                        hintColor = parseColor(styleMap.color, isNumber(styleMap.opacity) ? +styleMap.opacity! : 1);
                    }
                }
            };
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
                            if (!value && !node.visibleStyle.backgroundImage) {
                                value = isUserAgent(USER_AGENT.FIREFOX) ? 'Submit Query' : 'Submit';
                            }
                            break;
                        case 'reset':
                            if (!value && !node.visibleStyle.backgroundImage) {
                                value = 'Reset';
                            }
                            break;
                        case 'time':
                            if (!value) {
                                hint = '--:-- --';
                            }
                            break;
                        case 'date':
                        case 'datetime-local':
                            if (!value) {
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
                            if (!value) {
                                hint = 'Week: --, ----';
                            }
                            break;
                        case 'month':
                            if (!value) {
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
                            if (!value) {
                                hint = element.placeholder;
                                setHintColor();
                            }
                            break;
                        case 'file':
                            value = isUserAgent(USER_AGENT.FIREFOX) ? 'Browse...' : 'Choose File';
                            break;
                        case 'color': {
                            const borderColor = this.controllerSettings.style[element.disabled ? 'buttonDisabledBorderColor' : 'buttonBorderColor'];
                            const backgroundColor = (parseColor(value) || parseColor('black')!).valueAsRGBA;
                            const { width, height } = node.actualDimension;
                            const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${height - 8}px`;
                            const backgroundRepeat = 'no-repeat, no-repeat';
                            const backgroundPositionX = 'center, center';
                            const backgroundPositionY = 'center, center';
                            const backgroundImage = ResourceUI.parseBackgroundImage(node, `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`) as Gradient[];
                            value = '';
                            let boxStyle = node.data<BoxStyle>(ResourceUI.KEY_NAME, 'boxStyle');
                            if (boxStyle) {
                                if (boxStyle.backgroundImage) {
                                    boxStyle.backgroundSize = `${backgroundSize}, ${boxStyle.backgroundSize}`;
                                    boxStyle.backgroundRepeat = `${backgroundRepeat}, ${boxStyle.backgroundRepeat}`;
                                    boxStyle.backgroundPositionX = `${backgroundPositionX}, ${boxStyle.backgroundPositionX}`;
                                    boxStyle.backgroundPositionY = `${backgroundPositionY}, ${boxStyle.backgroundPositionY}`;
                                    boxStyle.backgroundImage.unshift(...backgroundImage);
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
                    setHintColor();
                    break;
                case 'IFRAME':
                    value = element.src;
                    break;
                default:
                    trimming = true;
                    if (node.plainText || node.pseudoElement || node.hasAlign(NODE_ALIGNMENT.INLINE) && node.textElement) {
                        value = replaceAll(node.textContent, '&', '&amp;');
                        inlined = true;
                    }
                    else if (node.inlineText) {
                        value = node.textEmpty ? this.STRING_SPACE : node.tagName === 'BUTTON' ? node.textContent : this.removeExcludedText(node, element);
                    }
                    break;
            }
            if (hint) {
                node.data(ResourceUI.KEY_NAME, 'hintString', hint);
                if (hintColor) {
                    node.data(ResourceUI.KEY_NAME, 'hintColor', hintColor);
                }
            }
        }
        else if (node.inlineText) {
            value = node.textContent;
            trimming = true;
        }
        if (value) {
            value = this.preFormatString(value);
            switch (node.css('whiteSpace')) {
                case 'pre':
                case 'pre-wrap': {
                    if (!node.renderParent!.layoutVertical) {
                        value = value.replace(/^(?:^|\s+)\n/, '');
                    }
                    const preIndent = ResourceUI.checkPreIndent(node);
                    if (preIndent) {
                        const [indent, adjacent] = preIndent;
                        if (indent) {
                            adjacent.textContent = indent + adjacent.textContent;
                        }
                        value = value.replace(REGEXP_TRAILINGINDENT, '');
                    }
                }
                case 'break-spaces':
                    value = replaceAll(value, '\n', this.STRING_NEWLINE);
                    value = replaceAll(value, '\t', this.STRING_SPACE.repeat(node.toInt('tabSize', 8))).replace(/\s/g, this.STRING_SPACE);
                    trimming = false;
                    break;
                case 'pre-line':
                    value = replaceAll(value, '\n', this.STRING_NEWLINE).replace(/\s{2,}/g, ' ');
                    trimming = false;
                    break;
                case 'nowrap':
                    inlined = true;
                default:
                    value = value
                        .replace(/\n+/g, ' ')
                        .replace(/\s{2,}/g, ' ');
                    if (node.onlyStaticChild && node.htmlElement) {
                        value = value
                            .replace(CHAR_LEADINGSPACE, '')
                            .replace(CHAR_TRAILINGSPACE, '');
                    }
                    else if (!node.naturalChild) {
                        if (node.horizontalRowStart) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                        else {
                            const previousSibling = node.element?.previousSibling;
                            if (previousSibling && previousSibling instanceof HTMLElement && !hasEndingSpace(previousSibling)) {
                                value = value.replace(CHAR_LEADINGSPACE, this.STRING_SPACE);
                                break;
                            }
                            if (checkPreviousSibling(node.siblingsLeading[0])) {
                                value = value.replace(CHAR_LEADINGSPACE, '');
                            }
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
        else if (node.naturalChildren.length === 0 && !node.hasUnit('height') && ResourceUI.isBackgroundVisible(node.data<BoxStyle>(ResourceUI.KEY_NAME, 'boxStyle')) && !isString(node.textContent)) {
            value = node.textContent;
        }
        if (value) {
            if (trimming) {
                if (!node.naturalChild) {
                    value = value.replace(CHAR_TRAILINGSPACE, node.horizontalRowEnd ? '' : this.STRING_SPACE);
                }
                else if (node.pageFlow) {
                    const previousSibling = node.siblingsLeading[0] as Undef<T>;
                    const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                    let previousSpaceEnd: Undef<boolean>;
                    if (value.length > 1) {
                        if (checkPreviousSibling(previousSibling)) {
                            value = value.replace(CHAR_LEADINGSPACE, '');
                        }
                        else if (previousSibling!.naturalElement) {
                            previousSpaceEnd = hasEndingSpace(previousSibling!.element as HTMLElement) || previousSibling!.lastStaticChild?.lineBreak;
                        }
                    }
                    if (inlined) {
                        const trailingSpace = !node.lineBreakTrailing && CHAR_TRAILINGSPACE.test(value);
                        if (CHAR_LEADINGSPACE.test(value) && previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                            value = this.STRING_SPACE + value.trim();
                        }
                        else {
                            value = value.trim();
                        }
                        if (trailingSpace && nextSibling && !nextSibling.blockStatic && !nextSibling.floating) {
                            value += this.STRING_SPACE;
                        }
                    }
                    else if (value.trim()) {
                        value = value
                            .replace(CHAR_LEADINGSPACE, previousSibling && (
                                previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node))
                                ? ''
                                : this.STRING_SPACE
                            )
                            .replace(CHAR_TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic || nextSibling && nextSibling.floating ? '' : this.STRING_SPACE);
                    }
                    else if (!node.inlineText) {
                        return;
                    }
                }
                else {
                    value = value.trim();
                }
            }
            if (value) {
                node.data(ResourceUI.KEY_NAME, 'valueString', value);
            }
        }
    }

    public getImageDimension(resourceId: number, uri: string) {
        const image = this.getImage(resourceId, uri);
        return image ? { width: image.width, height: image.height } : { width: NaN, height: NaN };
    }

    public preFormatString(value: string) {
        return replaceAll(value, '\u00A0', this.STRING_SPACE);
    }

    public removeExcludedText(node: T, element: Element) {
        const styled = element.children.length > 0 || element.tagName === 'CODE';
        const attr = styled ? 'innerHTML' : 'textContent';
        let value = element[attr];
        if (!value) {
            return '';
        }
        const { preserveWhiteSpace, sessionId } = node;
        const childNodes = element.childNodes;
        for (let i = 0, length = childNodes.length; i < length; ++i) {
            const item = childNodes[i] as Element;
            const child = getElementAsNode<NodeUI>(item, sessionId);
            if (!child) {
                const nodeName = item.nodeName;
                if (nodeName[0] !== '#') {
                    value = replaceAll(value, item.outerHTML, nodeName === 'WBR' ? this.STRING_WBR : !hasCoords(getStyle(item).position) && isString(item.textContent!) ? this.STRING_SPACE : '', 1);
                }
                if (!preserveWhiteSpace) {
                    if (i === 0) {
                        value = value.replace(CHAR_LEADINGSPACE, '');
                    }
                    else if (i === length - 1) {
                        value = value.replace(CHAR_TRAILINGSPACE, '');
                    }
                }
            }
            else if (!child.textElement || child.pseudoElement || !child.pageFlow || child.positioned || child.excluded) {
                if (styled) {
                    if (child.lineBreak) {
                        const previousSibling = child.previousSibling;
                        value = value.replace(!preserveWhiteSpace ? new RegExp(`\\s*${escapePattern(item.outerHTML)}\\s*`) : item.outerHTML, child.lineBreakTrailing && previousSibling && previousSibling.inlineStatic || !previousSibling && !node.pageFlow ? '' : this.STRING_NEWLINE);
                    }
                    else if (child.positioned) {
                        value = replaceAll(value, item.outerHTML, '', 1);
                    }
                    else if (child.display === 'contents') {
                        value = replaceAll(value, item.outerHTML, child.textContent, 1);
                    }
                    else if (!preserveWhiteSpace) {
                        value = replaceAll(value, item.outerHTML, child.pageFlow && child.display !== 'none' && isString(child.textContent) ? this.STRING_SPACE : '', 1);
                    }
                }
                else if (!preserveWhiteSpace) {
                    const textContent = child.textContent;
                    if (textContent) {
                        value = replaceAll(value, textContent, '', 1);
                    }
                }
            }
        }
        if (!styled) {
            return value;
        }
        if (!preserveWhiteSpace && !value.trim()) {
            return node.blockStatic ? this.STRING_SPACE : '';
        }
        return value;
    }

    get controllerSettings() {
        return this.application.controllerHandler.localSettings;
    }

    get STRING_SPACE() {
        return '&#160;';
    }
    get STRING_NEWLINE() {
        return '&#10;';
    }
    get STRING_WBR() {
        return '&#8203;';
    }
}