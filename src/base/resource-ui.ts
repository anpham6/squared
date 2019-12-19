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

type NodeUI = squared.base.NodeUI;

const STRING_SPACE = '&#160;';
const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING.LENGTH_PERCENTAGE}|${STRING.CSS_ANGLE}|(?:${STRING.CSS_CALC}(?=,)|${STRING.CSS_CALC}))?,?\\s*`;
const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at [\\w %]+)?)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
let REGEXP_COLORSTOP: RegExp | undefined;

function parseColorStops(node: NodeUI, gradient: Gradient, value: string) {
    if (REGEXP_COLORSTOP) {
        REGEXP_COLORSTOP.lastIndex = 0;
    }
    else {
        REGEXP_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');
    }
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
    let match: RegExpExecArray | null;
    let previousOffset = 0;
    while ((match = REGEXP_COLORSTOP.exec(value)) !== null) {
        const color = parseColor(match[1], 1, true);
        if (color) {
            let offset = -1;
            if (gradient.type === 'conic') {
                if (match[3] && match[4]) {
                    offset = convertAngle(match[3], match[4]) / 360;
                }
            }
            else if (match[2]) {
                if (isPercent(match[2])) {
                    offset = parseFloat(match[2]) / 100;
                }
                else {
                    if (isLength(match[2])) {
                        offset = node.parseUnit(match[2], item.horizontal ? 'width' : 'height', false) / size;
                    }
                    else if (isCalc(match[2])) {
                        offset = calculate(match[6], size, node.fontSize) / size;
                    }
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
                    if (result[j].offset !== -1) {
                        stop.offset = (percent + result[j].offset) / k;
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
                    for (let i = 0; i < length; i++) {
                        percent = Math.min(basePercent + original[i].offset, 1);
                        result.push({ ...original[i], offset: percent });
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
    return result;
}

function getAngle(value: string, fallback = 0) {
    if (value) {
        let degree = parseAngle(value.trim());
        if (degree < 0) {
            degree += 360;
        }
        return degree;
    }
    return fallback;
}

function replaceWhiteSpace(parent: NodeUI | undefined, node: NodeUI, value: string): [string, boolean] {
    value = value.replace(/\u00A0/g, STRING_SPACE);
    switch (node.css('whiteSpace')) {
        case 'nowrap':
            value = value.replace(/\n/g, ' ');
            break;
        case 'pre':
        case 'pre-wrap':
            if (parent?.layoutVertical === false) {
                value = value.replace(/^\s*?\n/, '');
            }
            value = value
                .replace(/\n/g, '\\n')
                .replace(/ /g, STRING_SPACE);
            break;
        case 'pre-line':
            value = value
                .replace(/\n/g, '\\n')
                .replace(/[ ]+/g, ' ');
            break;
        default:
            const { previousSibling, nextSibling } = node;
            if (previousSibling && (previousSibling.lineBreak || previousSibling.blockStatic) || node.onlyChild && node.htmlElement) {
                value = value.replace(CHAR.LEADINGSPACE, '');
            }
            if (nextSibling && (nextSibling.lineBreak || nextSibling.blockStatic) || node.onlyChild && node.htmlElement) {
                value = value.replace(CHAR.TRAILINGSPACE, '');
            }
            return [value, false];
    }
    return [value, true];
}

function getBackgroundSize(node: NodeUI, index: number, value?: string) {
    if (value) {
        const sizes = value.split(XML.SEPARATOR);
        return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length]);
    }
    return undefined;
}

function getGradientPosition(value: string) {
    if (value) {
        return value.indexOf('at ') !== -1 ? /(.+?)?\s*at (.+?)\s*$/.exec(value) : <RegExpExecArray> [value, value];
    }
    return null;
}

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
        const previous = this.ASSETS.ids.get(section) || [];
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
        this.ASSETS.ids.set(section, previous);
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

    public static getOptionArray(element: HTMLSelectElement, showDisabled = false) {
        const stringArray: string[] = [];
        let numberArray = true;
        const children = element.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = <HTMLOptionElement> children[i];
            if (!showDisabled && item.disabled) {
                continue;
            }
            const value = item.text.trim() || item.value.trim();
            if (value !== '') {
                if (numberArray && !isNumber(value)) {
                    numberArray = false;
                }
                stringArray.push(value);
            }
        }
        return numberArray ? [undefined, stringArray] : [stringArray];
    }

    public static isBackgroundVisible(object: BoxStyle | undefined) {
        return !!(object && (object.backgroundImage || object.borderTop || object.borderRight || object.borderBottom || object.borderLeft));
    }

    public static parseBackgroundImage(node: NodeUI) {
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '') {
            REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
            const images: (string | Gradient)[] = [];
            let match: RegExpExecArray | null;
            let i = 0;
            while ((match = REGEXP_BACKGROUNDIMAGE.exec(backgroundImage)) !== null) {
                if (match[0] === 'initial' || match[0].startsWith('url')) {
                    images.push(match[0]);
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
                                angle: getAngle(direction)
                            };
                            conic.center = getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize, imageDimension);
                            conic.colorStops = parseColorStops(node, conic, match[4]);
                            gradient = conic;
                            break;
                        }
                        case 'radial': {
                            const { width, height } = dimension;
                            const position = getGradientPosition(direction);
                            const radial = <RadialGradient> {
                                type,
                                repeating,
                                horizontal: node.actualWidth <= node.actualHeight,
                                dimension
                            };
                            const center = getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize, imageDimension);
                            const { left, top } = center;
                            radial.center = center;
                            radial.closestCorner = Number.POSITIVE_INFINITY;
                            radial.farthestCorner = Number.NEGATIVE_INFINITY;
                            let shape = 'ellipse';
                            if (position) {
                                const radius = position[1] && position[1].trim();
                                if (radius) {
                                    if (radius.startsWith('circle')) {
                                        shape = 'circle';
                                    }
                                    else {
                                        const radiusXY = radius.split(' ');
                                        let minRadius = Number.POSITIVE_INFINITY;
                                        const length = radiusXY.length;
                                        for (let j = 0; j < length; j++) {
                                            const axisRadius = node.parseUnit(radiusXY[j], j === 0 ? 'width' : 'height', false);
                                            if (axisRadius < minRadius) {
                                                minRadius = axisRadius;
                                            }
                                        }
                                        radial.radius = minRadius;
                                        radial.radiusExtent = minRadius;
                                        if (length === 1 || radiusXY[0] === radiusXY[1]) {
                                            shape = 'circle';
                                        }
                                    }
                                }
                            }
                            radial.shape = shape;
                            for (const corner of [[0, 0], [width, 0], [width, height], [0, height]]) {
                                const length = Math.round(Math.sqrt(Math.pow(Math.abs(corner[0] - left), 2) + Math.pow(Math.abs(corner[1] - top), 2)));
                                if (length < radial.closestCorner) {
                                    radial.closestCorner = length;
                                }
                                if (length > radial.farthestCorner) {
                                    radial.farthestCorner = length;
                                }
                            }
                            radial.closestSide = top;
                            radial.farthestSide = top;
                            for (const side of [width - left, height - top, left]) {
                                if (side < radial.closestSide) {
                                    radial.closestSide = side;
                                }
                                if (side > radial.farthestSide) {
                                    radial.farthestSide = side;
                                }
                            }
                            if (!radial.radius && !radial.radiusExtent) {
                                radial.radius = radial.farthestCorner;
                                const extent = position && position[1] ? position[1].split(' ').pop() : '';
                                switch (extent) {
                                    case 'closest-corner':
                                    case 'closest-side':
                                    case 'farthest-side':
                                        const length = radial[convertCamelCase(extent)];
                                        if (repeating) {
                                            radial.radiusExtent = length;
                                        }
                                        else {
                                            radial.radius = length;
                                        }
                                        break;
                                    default:
                                        radial.radiusExtent = radial.farthestCorner;
                                        break;
                                }
                            }
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
                            const linear = <LinearGradient> {
                                type,
                                repeating,
                                horizontal: angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315,
                                dimension,
                                angle
                            };
                            linear.colorStops = parseColorStops(node, linear, match[4]);
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
                            linear.angleExtent = { x, y };
                            gradient = linear;
                            break;
                        }
                    }
                    images.push(gradient || 'initial');
                }
                i++;
            }
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
        if (node.styleElement) {
            const parent = node.actualParent;
            if (parent && node.cssInitial(attr) === '') {
                return node.style[attr] === parent.style[attr];
            }
        }
        return false;
    }

    public static hasLineBreak(node: NodeUI, lineBreak = false, trim = false) {
        if (node.naturalElements.length) {
            return node.naturalElements.some(item => item.lineBreak);
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
        if (ResourceUI.STORED[asset]) {
            for (const [name, data] of ResourceUI.STORED[asset].entries()) {
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
        if (this.fileHandler) {
            this.fileHandler.addAsset({
                pathname: this.controllerSettings.directory.image,
                filename,
                base64
            });
        }
    }

    public setBoxStyle(node: T) {
        if (node.styleElement || node.visibleStyle.background) {
            const boxStyle: BoxStyle = {
                backgroundSize: node.css('backgroundSize'),
                backgroundRepeat: node.css('backgroundRepeat'),
                backgroundPositionX: node.css('backgroundPositionX'),
                backgroundPositionY: node.css('backgroundPositionY')
            };
            function setBorderStyle(attr: string, border: string[]) {
                const style = node.css(border[0]) || 'none';
                let width = formatPX(attr !== 'outline' ? node[border[1]] : convertFloat(node.style[border[1]]));
                let color = node.css(border[2]) || 'initial';
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
                    const borderColor = parseColor(color, 1, true);
                    if (borderColor) {
                        boxStyle[attr] = <BorderAttribute> {
                            width,
                            style,
                            color: borderColor
                        };
                    }
                }
            }
            function setBackgroundOffset(attr: 'backgroundClip' | 'backgroundOrigin') {
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
            if (setBackgroundOffset('backgroundClip') && node.has('backgroundOrigin')) {
                setBackgroundOffset('backgroundOrigin');
            }
            if (node.css('borderRadius') !== '0px') {
                const [A, B] = node.css('borderTopLeftRadius').split(' ');
                const [C, D] = node.css('borderTopRightRadius').split(' ');
                const [E, F] = node.css('borderBottomRightRadius').split(' ');
                const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                const horizontal = node.actualWidth >= node.actualHeight;
                if (borderRadius.every(radius => radius === borderRadius[0])) {
                    if (borderRadius[0] === '0px' || borderRadius[0] === '') {
                        borderRadius.length = 0;
                    }
                    else {
                        borderRadius.length = 1;
                    }
                }
                const length = borderRadius.length;
                if (length > 0) {
                    const dimension = horizontal ? 'width' : 'height';
                    for (let i = 0; i < length; i++) {
                        borderRadius[i] = node.convertPX(borderRadius[i], dimension, false);
                    }
                    boxStyle.borderRadius = borderRadius;
                }
            }
            if (node.visibleStyle.borderWidth) {
                if (node.borderTopWidth > 0) {
                    setBorderStyle('borderTop', BOX_BORDER[0]);
                }
                if (node.borderRightWidth > 0) {
                    setBorderStyle('borderRight', BOX_BORDER[1]);
                }
                if (node.borderBottomWidth > 0) {
                    setBorderStyle('borderBottom', BOX_BORDER[2]);
                }
                if (node.borderLeftWidth > 0) {
                    setBorderStyle('borderLeft', BOX_BORDER[3]);
                }
            }
            setBorderStyle('outline', BOX_BORDER[4]);
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
        if (((node.textElement || node.inlineText) && (!node.textEmpty || node.visibleStyle.background) || node.inputElement) && node.visible) {
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
        if (node.visible && !node.svgElement) {
            const renderParent = node.renderParent;
            const element = <HTMLInputElement> node.element;
            if (element) {
                let key = '';
                let value = '';
                let hint = '';
                let trimming = false;
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
                            [value] = replaceWhiteSpace(renderParent, node, textContent.replace(/&/g, '&amp;'));
                            inlined = true;
                            trimming = !(node.actualParent as T).preserveWhiteSpace;
                        }
                        else if (node.inlineText) {
                            key = textContent.trim();
                            [value, inlined] = replaceWhiteSpace(
                                renderParent,
                                node,
                                this.removeExcludedFromText(element, node.sessionId)
                            );
                            trimming = true;
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
                                if (textContent.length) {
                                    previousSpaceEnd = textContent.charCodeAt(textContent.length - 1) === 32;
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
                    if (item.htmlElement && attr === 'innerHTML') {
                        if (item.lineBreak) {
                            value = value.replace(new RegExp(`\\s*${item.toElementString('outerHTML')}\\s*`), '\\n');
                        }
                        else {
                            value = value.replace(item.toElementString('outerHTML'), item.pageFlow && item.textContent.trim() !== '' ? STRING_SPACE : '');
                        }
                        continue;
                    }
                    else if (isString(item[attr])) {
                        value = value.replace(item[attr], '');
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
            value = value.replace(ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
        }
        return value;
    }
}