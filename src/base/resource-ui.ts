import { ControllerUISettings, FileAsset, ResourceStoredMap, UserUISettings } from '../../@types/base/application';

import Resource from './resource';

import { NODE_RESOURCE } from './lib/enumeration';

const $lib = squared.lib;
const { USER_AGENT, isUserAgent } = $lib.client;
const { parseColor } = $lib.color;
const { BOX_BORDER, calculate, convertAngle, formatPX, getBackgroundPosition, getInheritedStyle, isCalc, isLength, isParentStyle, isPercent, parseAngle } = $lib.css;
const { isEqual, offsetAngleX, offsetAngleY, relativeAngle, triangulate, truncateFraction } = $lib.math;
const { CHAR, ESCAPE, STRING, XML } = $lib.regex;
const { getElementAsNode } = $lib.session;
const { convertCamelCase, convertFloat, hasValue, isEqual: isEqualObject, isNumber, isString, trimEnd, trimStart } = $lib.util;
const { STRING_TABSPACE } = $lib.xml;

type NodeUI = squared.base.NodeUI;

const STRING_SPACE = '&#160;';
const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING.LENGTH_PERCENTAGE}|${STRING.CSS_ANGLE}|(?:${STRING.CSS_CALC}(?=,)|${STRING.CSS_CALC}))?,?\\s*`;
const REGEX_URL = /^url/;
const REGEX_NOBREAKSPACE = /\u00A0/g;
const REGEX_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at [\\w %]+)?)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
const REGEX_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');

function parseColorStops(node: NodeUI, gradient: Gradient, value: string) {
    const item = <RadialGradient> gradient;
    const repeating = item.repeating === true;
    let extent = 1;
    let size: number;
    if (repeating && gradient.type === 'radial') {
        extent = item.radiusExtent / item.radius;
        size = item.radius;
    }
    else {
        size = item.horizontal ? (<Dimension> gradient.dimension).width : (<Dimension> gradient.dimension).height;
    }
    const result: ColorStop[] = [];
    let previousOffset = 0;
    let match: RegExpExecArray | null;
    while ((match = REGEX_COLORSTOP.exec(value)) !== null) {
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
                if (isPercent(unit)) {
                    offset = parseFloat(unit) / 100;
                }
                else if (isLength(unit)) {
                    offset = node.parseUnit(unit, item.horizontal ? 'width' : 'height', false) / size;
                }
                else if (isCalc(unit)) {
                    offset = calculate(match[6], size, node.fontSize) / size;
                }
                if (repeating && offset !== -1) {
                    offset *= extent;
                }
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
    for (let i = 0; i < length; i++) {
        const stop = result[i];
        if (stop.offset === -1) {
            if (i === 0) {
                stop.offset = 0;
            }
            else {
                for (let j = i + 1, k = 2; j < length - 1; j++, k++) {
                    const data = result[j];
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
    if (repeating) {
        if (percent < 100) {
            complete: {
                const original = result.slice(0);
                let basePercent = percent;
                while (percent < 100) {
                    for (const data of original) {
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
    REGEX_COLORSTOP.lastIndex = 0;
    return result;
}

function getAngle(value: string, fallback = 0) {
    value = value.trim();
    if (value !== '') {
        let degree = parseAngle(value);
        if (degree < 0) {
            degree += 360;
        }
        return degree;
    }
    return fallback;
}

function replaceWhiteSpace(node: NodeUI, value: string): [string, boolean, boolean] {
    let inlined = false;
    value = value.replace(REGEX_NOBREAKSPACE, STRING_SPACE);
    switch (node.css('whiteSpace')) {
        case 'nowrap':
            value = value.replace(/\n/g, ' ');
            inlined = true;
            break;
        case 'pre':
        case 'pre-wrap':
            if (node.renderParent?.layoutVertical === false) {
                value = value.replace(/^\s*?\n/, '');
            }
            value = value
                .replace(/\n/g, '\\n')
                .replace(/\t/g, STRING_TABSPACE)
                .replace(/\s/g, STRING_SPACE);
            return [value, true, false];
        case 'pre-line':
            value = value
                .replace(/\n/g, '\\n')
                .replace(/[ ]+/g, ' ');
            return [value, true, false];
    }
    if (node.onlyChild && node.htmlElement) {
        value = value
            .replace(CHAR.LEADINGSPACE, '')
            .replace(CHAR.TRAILINGSPACE, '');
    }
    else {
        const { previousSibling, nextSibling } = node;
        if (previousSibling && (previousSibling.lineBreak || previousSibling.blockStatic)) {
            value = value.replace(CHAR.LEADINGSPACE, '');
        }
        if (nextSibling && (nextSibling.lineBreak || nextSibling.blockStatic)) {
            value = value.replace(CHAR.TRAILINGSPACE, '');
        }
    }
    return [value, inlined, true];
}

function getBackgroundSize(node: NodeUI, index: number, value?: string) {
    if (value) {
        const sizes = value.split(XML.SEPARATOR);
        return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length]);
    }
    return undefined;
}

function setBorderStyle(node: NodeUI, boxStyle: BoxStyle, attr: string, border: string[]) {
    const style = node.css(border[0]) || 'none';
    let width = formatPX(attr !== 'outline' ? node[border[1]] : convertFloat(node.style[border[1]]));
    let color: string | ColorData | undefined = node.css(border[2]) || 'initial';
    switch (color) {
        case 'initial':
            color = 'rgb(0, 0, 0)';
            break;
        case 'inherit':
        case 'currentcolor':
            color = getInheritedStyle(<HTMLElement> node.element, border[2]);
            break;
    }
    if (width !== '0px' && style !== 'none') {
        if (width === '2px' && (style === 'inset' || style === 'outset')) {
            width = '1px';
        }
        color = parseColor(color, 1, true);
        if (color) {
            boxStyle[attr] = <BorderAttribute> {
                width,
                style,
                color
            };
        }
    }
}
function setBackgroundOffset(node: NodeUI, boxStyle: BoxStyle, attr: 'backgroundClip' | 'backgroundOrigin') {
    switch (node.css(attr)) {
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

const getGradientPosition = (value: string) => isString(value) ? (value.indexOf('at ') !== -1 ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : <RegExpExecArray> [value, value]) : null;

export default abstract class ResourceUI<T extends NodeUI> extends Resource<T> implements squared.base.ResourceUI<T> {
    public static KEY_NAME = 'squared.resource';

    public static STORED: ResourceStoredMap = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    public static generateId(section: string, name: string, start = 1) {
        const prefix = name;
        let i = start;
        if (start === 1) {
            name += '_' + i;
        }
        const ids = this.ASSETS.ids;
        const previous = ids.get(section) || [];
        do {
            if (!previous.includes(name)) {
                previous.push(name);
                break;
            }
            else {
                name = prefix + '_' + ++i;
            }
        }
        while (true);
        ids.set(section, previous);
        return name;
    }

    public static insertStoredAsset(asset: string, name: string, value: any) {
        const stored: Map<string, any> = ResourceUI.STORED[asset];
        if (stored && hasValue(value)) {
            let result = this.getStoredName(asset, value);
            if (result === '') {
                if (isNumber(name)) {
                    name = '__' + name;
                }
                let i = 0;
                do {
                    result = name;
                    if (i > 0) {
                        result += '_' + i;
                    }
                    if (!stored.has(result)) {
                        stored.set(result, value);
                    }
                    i++;
                }
                while (stored.has(result) && stored.get(result) !== value);
            }
            return result;
        }
        return '';
    }

    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled = false) {
        let result: string[] = [];
        let numberArray = true;
        const children = element.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = <HTMLOptionElement> children[i];
            if (!showDisabled && item.disabled) {
                continue;
            }
            if (item.tagName === 'OPTION') {
                const value = item.text.trim() || item.value.trim();
                if (value !== '') {
                    if (numberArray && !isNumber(value)) {
                        numberArray = false;
                    }
                    result.push(value);
                }
            }
            else if (item.tagName === 'OPTGROUP') {
                const [groupStringArray, groupNumberArray] = this.getOptionArray(item, showDisabled);
                if (groupStringArray) {
                    result = result.concat(groupStringArray);
                    numberArray = false;
                }
                else if (groupNumberArray) {
                    result = result.concat(groupNumberArray);
                }
            }
        }
        return numberArray ? [undefined, result] : [result];
    }

    public static isBackgroundVisible(object: BoxStyle | undefined) {
        return !!(object && (object.backgroundImage || object.borderTop || object.borderRight || object.borderBottom || object.borderLeft));
    }

    public static parseBackgroundImage(node: NodeUI) {
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '') {
            const images: (string | Gradient)[] = [];
            let match: RegExpExecArray | null;
            let i = 0;
            while ((match = REGEX_BACKGROUNDIMAGE.exec(backgroundImage)) !== null) {
                const value = match[0];
                if (REGEX_URL.test(value) || value === 'initial') {
                    images.push(value);
                }
                else {
                    const repeating = match[1] === 'repeating';
                    const type = match[2];
                    const direction = match[3];
                    const imageDimension = getBackgroundSize(node, i, node.css('backgroundSize'));
                    const dimension = imageDimension || node.actualDimension;
                    let gradient: Gradient | undefined;
                    switch (type) {
                        case 'conic': {
                            const position = getGradientPosition(direction);
                            const conic = <ConicGradient> {
                                type,
                                dimension,
                                angle: getAngle(direction),
                                center: getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize, imageDimension)
                            };
                            conic.colorStops = parseColorStops(node, conic, match[4]);
                            gradient = conic;
                            break;
                        }
                        case 'radial': {
                            const { width, height } = dimension;
                            const position = getGradientPosition(direction);
                            const center = getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize, imageDimension);
                            const { left, top } = center;
                            let shape = 'ellipse';
                            let closestSide = top;
                            let farthestSide = top;
                            let closestCorner = Number.POSITIVE_INFINITY;
                            let farthestCorner = Number.NEGATIVE_INFINITY;
                            let radius = 0;
                            let radiusExtent = 0;
                            if (position) {
                                const name = position[1]?.trim();
                                if (name) {
                                    if (name.startsWith('circle')) {
                                        shape = 'circle';
                                    }
                                    else {
                                        let minRadius = Number.POSITIVE_INFINITY;
                                        const radiusXY = name.split(' ');
                                        const length = radiusXY.length;
                                        for (let j = 0; j < length; j++) {
                                            minRadius = Math.min(node.parseUnit(radiusXY[j], j === 0 ? 'width' : 'height', false), minRadius);
                                        }
                                        radius = minRadius;
                                        radiusExtent = minRadius;
                                        if (length === 1 || radiusXY[0] === radiusXY[1]) {
                                            shape = 'circle';
                                        }
                                    }
                                }
                            }
                            for (const corner of [[0, 0], [width, 0], [width, height], [0, height]]) {
                                const length = Math.round(Math.sqrt(Math.pow(Math.abs(corner[0] - left), 2) + Math.pow(Math.abs(corner[1] - top), 2)));
                                closestCorner = Math.min(length, closestCorner);
                                farthestCorner = Math.max(length, farthestCorner);
                            }
                            for (const side of [width - left, height - top, left]) {
                                closestSide = Math.min(side, closestSide);
                                farthestSide = Math.max(side, farthestSide);
                            }
                            const radial = <RadialGradient> {
                                type,
                                repeating,
                                horizontal: node.actualWidth <= node.actualHeight,
                                dimension,
                                shape,
                                center,
                                closestSide,
                                farthestSide,
                                closestCorner,
                                farthestCorner
                            };
                            if (radius === 0 && radiusExtent === 0) {
                                radius = farthestCorner;
                                const extent = position?.[1]?.split(' ').pop() || '';
                                switch (extent) {
                                    case 'closest-corner':
                                    case 'closest-side':
                                    case 'farthest-side':
                                        const length = radial[convertCamelCase(extent)];
                                        if (repeating) {
                                            radiusExtent = length;
                                        }
                                        else {
                                            radius = length;
                                        }
                                        break;
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
                            let x = truncateFraction(offsetAngleX(angle, width));
                            let y = truncateFraction(offsetAngleY(angle, height));
                            if (x !== width && y !== height && !isEqual(Math.abs(x), Math.abs(y))) {
                                let opposite: number;
                                if (angle <= 90) {
                                    opposite = relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                }
                                else if (angle <= 180) {
                                    opposite = relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                }
                                else if (angle <= 270) {
                                    opposite = relativeAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                }
                                else {
                                    opposite = relativeAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                }
                                const a = Math.abs(opposite - angle);
                                x = truncateFraction(
                                    offsetAngleX(
                                        angle,
                                        triangulate(a, 90 - a, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)))[1]
                                    )
                                );
                                y = truncateFraction(
                                    offsetAngleY(
                                        angle,
                                        triangulate(90, 90 - angle, x)[0]
                                    )
                                );
                            }
                            const linear = <LinearGradient> {
                                type,
                                repeating,
                                horizontal: angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315,
                                dimension,
                                angle,
                                angleExtent: { x, y }
                            };
                            linear.colorStops = parseColorStops(node, linear, match[4]);
                            gradient = linear;
                            break;
                        }
                    }
                    images.push(gradient || 'initial');
                }
                i++;
            }
            REGEX_BACKGROUNDIMAGE.lastIndex = 0;
            if (images.length) {
                return images;
            }
        }
        return undefined;
    }

    public static getBackgroundSize(node: NodeUI, value: string): Dimension | undefined {
        let width = 0;
        let height = 0;
        switch (value) {
            case '':
            case 'cover':
            case 'contain':
            case '100% 100%':
            case 'auto':
            case 'auto auto':
            case 'initial':
                return undefined;
            default:
                const dimensions = value.split(' ');
                const length = dimensions.length;
                if (length === 1) {
                    dimensions[1] = dimensions[0];
                }
                for (let i = 0; i < length; i++) {
                    let size = dimensions[i];
                    if (size === 'auto') {
                        size = '100%';
                    }
                    if (i === 0) {
                        width = node.parseUnit(size, 'width', false);
                    }
                    else {
                        height = node.parseUnit(size, 'height', false);
                    }
                }
                break;
        }
        return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
    }

    public static isInheritedStyle(node: NodeUI, attr: string) {
        return node.styleElement && node.cssInitial(attr) === '' && node.style[attr] === node.actualParent?.style[attr];
    }

    public static hasLineBreak(node: NodeUI, lineBreak = false, trim = false) {
        const naturalElements = node.naturalElements;
        if (naturalElements.length) {
            return naturalElements.some(item => item.lineBreak);
        }
        else if (!lineBreak && node.naturalChild) {
            const element = <Element> node.element;
            let value = element.textContent as string;
            if (trim) {
                value = value.trim();
            }
            if (/\n/.test(value)) {
                if (node.plainText && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                    return true;
                }
                return node.css('whiteSpace').startsWith('pre');
            }
        }
        return false;
    }

    private static getStoredName(asset: string, value: any): string {
        const stored = ResourceUI.STORED[asset];
        if (stored) {
            for (const [name, data] of stored.entries()) {
                if (isEqualObject(value, data)) {
                    return name;
                }
            }
        }
        return '';
    }

    public fileHandler?: squared.base.FileUI<T>;
    public abstract controllerSettings: ControllerUISettings;

    public abstract get userSettings(): UserUISettings;

    public finalize(layouts: FileAsset[]) {}

    public reset() {
        super.reset();
        for (const name in ResourceUI.STORED) {
            ResourceUI.STORED[name].clear();
        }
    }

    public writeRawImage(filename: string, base64: string) {
        this.fileHandler?.addAsset({
            pathname: this.controllerSettings.directory.image,
            filename,
            base64
        });
    }

    public setBoxStyle(node: T) {
        if (node.styleElement || node.visibleStyle.background) {
            const boxStyle: BoxStyle = {
                backgroundSize: node.css('backgroundSize'),
                backgroundRepeat: node.css('backgroundRepeat'),
                backgroundPositionX: node.css('backgroundPositionX'),
                backgroundPositionY: node.css('backgroundPositionY')
            };
            if (setBackgroundOffset(node, boxStyle, 'backgroundClip') && node.has('backgroundOrigin')) {
                setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
            }
            if (node.css('borderRadius') !== '0px') {
                const [A, B] = node.css('borderTopLeftRadius').split(' ');
                const [C, D] = node.css('borderTopRightRadius').split(' ');
                const [E, F] = node.css('borderBottomRightRadius').split(' ');
                const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                const horizontal = node.actualWidth >= node.actualHeight;
                const radius = borderRadius[0];
                if (borderRadius.every(value => value === radius)) {
                    borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                }
                const length = borderRadius.length;
                if (length) {
                    const dimension = horizontal ? 'width' : 'height';
                    for (let i = 0; i < length; i++) {
                        borderRadius[i] = node.convertPX(borderRadius[i], dimension, false);
                    }
                    boxStyle.borderRadius = borderRadius;
                }
            }
            if (node.visibleStyle.borderWidth) {
                if (node.borderTopWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderTop', BOX_BORDER[0]);
                }
                if (node.borderRightWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderRight', BOX_BORDER[1]);
                }
                if (node.borderBottomWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderBottom', BOX_BORDER[2]);
                }
                if (node.borderLeftWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderLeft', BOX_BORDER[3]);
                }
            }
            setBorderStyle(node, boxStyle, 'outline', BOX_BORDER[4]);
            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                boxStyle.backgroundImage = ResourceUI.parseBackgroundImage(node);
            }
            let backgroundColor = node.backgroundColor;
            if (backgroundColor === '' && !node.documentParent.visible) {
                backgroundColor = node.css('backgroundColor');
            }
            if (backgroundColor !== '') {
                boxStyle.backgroundColor = parseColor(backgroundColor)?.valueAsRGBA || '';
            }
            node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
        }
    }

    public setFontStyle(node: T) {
        if ((node.textElement || node.inlineText) && (!node.textEmpty || node.visibleStyle.background) || node.inputElement) {
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
            node.data(ResourceUI.KEY_NAME, 'fontStyle', <FontAttribute> {
                fontFamily: node.css('fontFamily').trim(),
                fontStyle: node.css('fontStyle'),
                fontSize: formatPX(node.fontSize),
                fontWeight,
                color: color?.valueAsRGBA || ''
            });
        }
    }

    public setValueString(node: T) {
        const element = <HTMLInputElement> node.element;
        if (element) {
            let key = '';
            let value = '';
            let hint = '';
            let trimming = true;
            let inlined = false;
            switch (element.tagName) {
                case 'INPUT':
                    value = element.value;
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox':
                            const companion = node.companion;
                            if (companion?.visible === false) {
                                value = companion.textContent.trim();
                            }
                            break;
                        case 'submit':
                            if (value === '' && !node.visibleStyle.backgroundImage) {
                                value = 'Submit';
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
                                switch ((new Intl.DateTimeFormat()).resolvedOptions().locale) {
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
                    }
                    break;
                case 'TEXTAREA':
                    value = element.value;
                    break;
                case 'IFRAME':
                    value = element.src;
                    break;
                default:
                    const textContent = node.textContent;
                    if (node.plainText || node.pseudoElement) {
                        key = textContent.trim();
                        [value, inlined, trimming] = replaceWhiteSpace(node, textContent.replace(/&/g, '&amp;'));
                        inlined = true;
                    }
                    else if (node.inlineText) {
                        key = textContent.trim();
                        [value, inlined, trimming] = replaceWhiteSpace(node, this.removeExcludedFromText(element, node.sessionId));
                    }
                    else if (node.naturalElements.length === 0 && textContent && textContent.trim() === '' && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle'))) {
                        value = textContent;
                    }
                    break;
            }
            if (value !== '') {
                if (trimming) {
                    const previousSibling = node.siblingsLeading[0];
                    let previousSpaceEnd = false;
                    if (value.length > 1) {
                        if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && CHAR.TRAILINGSPACE.test(previousSibling.textContent)) {
                            value = value.replace(CHAR.LEADINGSPACE, '');
                        }
                        else if (previousSibling.naturalElement) {
                            const textContent = previousSibling.textContent;
                            const length = textContent.length;
                            if (length) {
                                previousSpaceEnd = textContent.charCodeAt(length - 1) === 32;
                            }
                        }
                    }
                    if (inlined) {
                        const trailingSpace = !node.lineBreakTrailing && CHAR.TRAILINGSPACE.test(value);
                        if (previousSibling && CHAR.LEADINGSPACE.test(value) && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                            value = STRING_SPACE + value.trim();
                        }
                        else {
                            value = value.trim();
                        }
                        if (trailingSpace) {
                            const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                            if (nextSibling?.blockStatic === false) {
                                value += STRING_SPACE;
                            }
                        }
                    }
                    else if (value.trim() !== '') {
                        value = value.replace(CHAR.LEADINGSPACE, previousSibling && (
                            previousSibling.block ||
                            previousSibling.lineBreak ||
                            previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                            node.multiline && ResourceUI.hasLineBreak(node)) ? '' : STRING_SPACE
                        );
                        value = value.replace(CHAR.TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic ? '' : STRING_SPACE);
                    }
                    else if (!node.inlineText) {
                        return;
                    }
                }
                if (value !== '') {
                    node.data(ResourceUI.KEY_NAME, 'valueString', { key, value });
                }
            }
            if (hint !== '') {
                node.data(ResourceUI.KEY_NAME, 'hintString', hint);
            }
        }
        else if (node.inlineText) {
            const value = node.textContent;
            if (value) {
                node.data(ResourceUI.KEY_NAME, 'valueString', { key: value, value });
            }
        }
    }

    private removeExcludedFromText(element: Element, sessionId: string) {
        const attr = element.children.length || element.tagName === 'CODE' ? 'innerHTML' : 'textContent';
        let value: string = element[attr] || '';
        const children = element.childNodes;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const child = <Element> children[i];
            const item = getElementAsNode(child, sessionId) as NodeUI | undefined;
            if (item === undefined || !item.textElement || !item.pageFlow || item.positioned || item.pseudoElement || item.excluded || item.dataset.target) {
                if (item) {
                    const preserveWhitespace = (item.actualParent as T).preserveWhiteSpace;
                    if (item.htmlElement && attr === 'innerHTML') {
                        const outerHTML = item.toElementString('outerHTML');
                        if (item.lineBreak) {
                            value = value.replace(!preserveWhitespace ? new RegExp(`\\s*${outerHTML}\\s*`) : outerHTML, '\\n');
                        }
                        else if (!preserveWhitespace) {
                            value = value.replace(outerHTML, item.pageFlow && item.textContent.trim() !== '' ? STRING_SPACE : '');
                        }
                        continue;
                    }
                    else if (isString(item[attr])) {
                        if (!preserveWhitespace) {
                            value = value.replace(item[attr], '');
                        }
                        continue;
                    }
                }
                else if (child instanceof HTMLElement) {
                    const position = getComputedStyle(child).getPropertyValue('position');
                    value = value.replace(child.outerHTML, position !== 'absolute' && position !== 'fixed' && (child.textContent as string).trim() !== '' ? STRING_SPACE : '');
                }
                if (i === 0) {
                    value = trimStart(value, ' ');
                }
                else if (i === length - 1) {
                    value = trimEnd(value, ' ');
                }
            }
        }
        if (attr === 'innerHTML') {
            return value.replace(ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
        }
        return value;
    }
}