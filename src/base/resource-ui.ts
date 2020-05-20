
import Resource from './resource';
import NodeUI from './node-ui';

import { NODE_ALIGNMENT, NODE_RESOURCE } from './lib/enumeration';

const { USER_AGENT, isUserAgent } = squared.lib.client;
const { parseColor } = squared.lib.color;
const { CSS_PROPERTIES, calculate, convertAngle, formatPX, getBackgroundPosition, getInheritedStyle, isCalc, isLength, isParentStyle, isPercent, parseAngle } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { cos, equal, hypotenuse, offsetAngleX, offsetAngleY, relativeAngle, sin, triangulate, truncateFraction } = squared.lib.math;
const { STRING } = squared.lib.regex;
const { getElementAsNode } = squared.lib.session;
const { appendSeparator, convertCamelCase, convertFloat, hasValue, isEqual, isNumber, isString, iterateArray } = squared.lib.util;
const { STRING_SPACE } = squared.lib.xml;

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];
const BORDER_OUTLINE = CSS_PROPERTIES.outline.value as string[];

const STRING_COLORSTOP = `((?:rgb|hsl)a?\\(\\d+,\\s+\\d+%?,\\s+\\d+%?(?:,\\s+[\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${STRING.LENGTH_PERCENTAGE}|${STRING.CSS_ANGLE}|(?:${STRING.CSS_CALC}(?=,)|${STRING.CSS_CALC}))?,?\\s*`;
const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w %]+)?)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
const REGEXP_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');
const REGEXP_TRAILINGINDENT = /\n([^\S\n]*)?$/;
const CHAR_LEADINGSPACE = /^\s+/;
const CHAR_TRAILINGSPACE = /\s+$/;

function parseColorStops(node: NodeUI, gradient: Gradient, value: string) {
    const { width, height } = gradient.dimension as Dimension;
    const result: ColorStop[] = [];
    let repeat = false;
    let horizontal = true;
    let extent = 1;
    let size: number;
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
    let previousOffset = 0;
    let match: Null<RegExpExecArray>;
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
                    let i = 0;
                    while (i < length) {
                        const data = original[i++];
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

function getBackgroundSize(node: NodeUI, index: number, value: string, screenDimension?: Dimension) {
    if (value !== '') {
        const sizes = value.split(/\s*,\s*/);
        return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length], screenDimension);
    }
    return undefined;
}

function setBorderStyle(node: NodeUI, boxStyle: BoxStyle, attr: string, border: string[]) {
    const style = node.css(border[1]) || 'none';
    if (style !== 'none') {
        let width = formatPX(attr !== 'outline' ? node[border[0]] : convertFloat(node.style[border[0]]));
        if (width !== '0px') {
            let color: Undef<string | ColorData> = node.css(border[2]) || 'initial';
            switch (color) {
                case 'initial':
                    color = 'rgb(0, 0, 0)';
                    break;
                case 'inherit':
                case 'currentcolor':
                case 'currentColor':
                    color = getInheritedStyle(node.element as HTMLElement, border[2]);
                    break;
            }
            if (width === '2px' && (style === 'inset' || style === 'outset')) {
                width = '1px';
            }
            color = parseColor(color, 1, true);
            if (color) {
                boxStyle[attr] = {
                    width,
                    style,
                    color
                } as BorderAttribute;
                return true;
            }
        }
    }
    return false;
}

function setBackgroundOffset(node: NodeUI, boxStyle: BoxStyle, attr: 'backgroundClip' | 'backgroundOrigin') {
    let value = node.css(attr);
    if (value === 'initial') {
        value = attr === 'backgroundClip' ? 'border-box' : 'padding-box';
    }
    switch (value) {
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

function getAngle(value: string, fallback = 0) {
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
}

function getGradientPosition(value: string) {
    return isString(value)
        ? value.includes('at ')
            ? /(.+?)?\s*at (.+?)\s*$/.exec(value)
            : [value, value] as RegExpExecArray
        : null;
}

export default abstract class ResourceUI<T extends NodeUI> extends Resource<T> implements squared.base.ResourceUI<T> {
    public static STORED: ResourceStoredMap = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    public static isBackgroundVisible(object: Undef<BoxStyle>) {
        return !!object && ('backgroundImage' in object || 'borderTop' in object || 'borderRight' in object || 'borderBottom' in object || 'borderLeft' in object);
    }

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
            let result = '';
            if (stored) {
                for (const [id, data] of stored.entries()) {
                    if (isEqual(value, data)) {
                        result = id;
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

    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled = false) {
        let result: string[] = [];
        let numberArray = true;
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

    public static parseBackgroundImage(node: NodeUI, backgroundImage: string, screenDimension?: Dimension) {
        if (backgroundImage !== '') {
            REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
            const images: (string | Gradient)[] = [];
            let i = 0;
            let match: Null<RegExpExecArray>;
            while (match = REGEXP_BACKGROUNDIMAGE.exec(backgroundImage)) {
                const value = match[0];
                if (value.startsWith('url(') || value === 'initial') {
                    images.push(value);
                }
                else {
                    const repeating = !!match[1];
                    const type = match[2];
                    const direction = match[3];
                    const imageDimension = getBackgroundSize(node, i, node.css('backgroundSize'), screenDimension);
                    const dimension = NodeUI.refitScreen(node, imageDimension || node.actualDimension);
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
                            let x = truncateFraction(offsetAngleX(angle, width)), y = truncateFraction(offsetAngleY(angle, height));
                            if (x !== width && y !== height && !equal(Math.abs(x), Math.abs(y))) {
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
                                            triangulate(a, 90 - a, hypotenuse(width, height))[1]
                                        )
                                    );
                                y = truncateFraction(
                                        offsetAngleY(
                                            angle,
                                            triangulate(90, 90 - angle, x)[0]
                                        )
                                    );
                            }
                            const linear = {
                                type,
                                repeating,
                                dimension,
                                angle,
                                angleExtent: { x, y }
                            } as LinearGradient;
                            linear.colorStops = parseColorStops(node, linear, match[4]);
                            gradient = linear;
                            break;
                        }
                        case 'radial': {
                            const position = getGradientPosition(direction);
                            const center = getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension });
                            const { left, top } = center;
                            const { width, height } = dimension;
                            let shape = 'ellipse';
                            let closestSide = top;
                            let farthestSide = top;
                            let closestCorner = Infinity;
                            let farthestCorner = -Infinity;
                            let radius = 0;
                            let radiusExtent = 0;
                            if (position) {
                                const name = position[1]?.trim();
                                if (name) {
                                    if (name.startsWith('circle')) {
                                        shape = 'circle';
                                    }
                                    else {
                                        let minRadius = Infinity;
                                        const radiusXY = name.split(' ');
                                        for (let j = 0; j < radiusXY.length; ++j) {
                                            minRadius = Math.min(j === 0 ? node.parseWidth(radiusXY[j], false) : node.parseHeight(radiusXY[j], false), minRadius);
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
                                const extent = position?.[1]?.split(' ').pop() || '';
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
                            const conic = {
                                type,
                                dimension,
                                angle: getAngle(direction),
                                center: getBackgroundPosition(position?.[2] || 'center', dimension, { fontSize: node.fontSize, imageDimension, screenDimension })
                            } as ConicGradient;
                            conic.colorStops = parseColorStops(node, conic, match[4]);
                            gradient = conic;
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
        return undefined;
    }

    public static getBackgroundSize(node: NodeUI, value: string, screenDimension?: Dimension): Undef<Dimension> {
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
            default: {
                const dimensions = value.split(/\s+/);
                for (let i = 0; i < dimensions.length; ++i) {
                    let size = dimensions[i];
                    if (size === 'auto') {
                        size = '100%';
                    }
                    switch (i) {
                        case 0:
                            width = node.parseUnit(size, 'width', false, screenDimension);
                            break;
                        case 1:
                            height = node.parseUnit(size, 'height', false, screenDimension);
                            break;
                    }
                }
                break;
            }
        }
        return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
    }

    public static hasLineBreak(node: NodeUI, lineBreak = false, trim = false) {
        if (node.naturalElements.length) {
            return node.naturalElements.some(item => item.lineBreak);
        }
        else if (!lineBreak && node.naturalChild) {
            const element = node.element as Element;
            let value = element.textContent as string;
            if (trim) {
                value = value.trim();
            }
            return value.includes('\n') && (node.plainText && isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap') || node.css('whiteSpace').startsWith('pre'));
        }
        return false;
    }

    public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]> {
        if (node.plainText) {
            const parent = node.actualParent as NodeUI;
            if (parent.preserveWhiteSpace && parent.ascend({ condition: item => item.tagName === 'PRE', startSelf: true }).length) {
                let nextSibling = node.nextSibling as Undef<NodeUI>;
                if (nextSibling?.naturalElement) {
                    const textContent = node.textContent;
                    if (textContent.trim() !== '') {
                        const match = REGEXP_TRAILINGINDENT.exec(textContent);
                        if (match) {
                            if (!nextSibling.textElement) {
                                nextSibling = nextSibling.find(item => item.naturalChild && item.textElement, { cascade: true, error: item => item.naturalChild && !item.textElement && item.length === 0 }) as Undef<NodeUI>;
                            }
                            if (nextSibling) {
                                return [match[1] ? match[0] : '', nextSibling];
                            }
                        }
                    }
                }
            }
        }
        return undefined;
    }

    public abstract get userSettings(): UserSettingsUI;

    public finalize(layouts: FileAsset[]) {}

    public reset() {
        super.reset();
        const STORED = ResourceUI.STORED;
        for (const name in STORED) {
            STORED[name].clear();
        }
    }

    public writeRawImage(filename: string, base64: string) {
        const fileHandler = this.fileHandler;
        if (fileHandler) {
            const asset = { pathname: appendSeparator(this.userSettings.outputDirectory, this.controllerSettings.directory.image), filename, base64 } as Partial<RawAsset>;
            fileHandler.addAsset(asset);
            return asset;
        }
        return undefined;
    }

    public setBoxStyle(node: T) {
        if ((node.styleElement || node.visibleStyle.background) && node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
            const boxStyle = {} as BoxStyle;
            let borderWidth = node.visibleStyle.borderWidth;
            if (borderWidth) {
                if (node.borderTopWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderTop', BORDER_TOP);
                }
                if (node.borderRightWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderRight', BORDER_RIGHT);
                }
                if (node.borderBottomWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderBottom', BORDER_BOTTOM);
                }
                if (node.borderLeftWidth > 0) {
                    setBorderStyle(node, boxStyle, 'borderLeft', BORDER_LEFT);
                }
            }
            if (setBorderStyle(node, boxStyle, 'outline', BORDER_OUTLINE)) {
                borderWidth = true;
            }
            let backgroundColor = node.backgroundColor;
            let backgroundImage: Undef<(string | Gradient)[]>;
            if (backgroundColor === '' && node.has('backgroundColor') && !node.documentParent.visible) {
                backgroundColor = node.css('backgroundColor');
            }
            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                backgroundImage = ResourceUI.parseBackgroundImage(node, node.backgroundImage, node.localSettings.screenDimension);
            }
            if (backgroundColor || backgroundImage || borderWidth || node.data(Resource.KEY_NAME, 'embedded')) {
                boxStyle.backgroundColor = parseColor(backgroundColor)?.valueAsRGBA || '';
                boxStyle.backgroundImage = backgroundImage;
                Object.assign(boxStyle, node.cssAsObject('backgroundSize', 'backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY'));
                if (setBackgroundOffset(node, boxStyle, 'backgroundClip')) {
                    setBackgroundOffset(node, boxStyle, 'backgroundOrigin');
                }
                if (node.css('borderRadius') !== '0px') {
                    const [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius] = node.cssAsTuple('borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius');
                    const [A, B] = borderTopLeftRadius.split(' ');
                    const [C, D] = borderTopRightRadius.split(' ');
                    const [E, F] = borderBottomRightRadius.split(' ');
                    const [G, H] = borderBottomLeftRadius.split(' ');
                    const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                    const horizontal = node.actualWidth >= node.actualHeight;
                    const radius = borderRadius[0];
                    if (borderRadius.every(value => value === radius)) {
                        borderRadius.length = radius === '0px' || radius === '' ? 0 : 1;
                    }
                    const length = borderRadius.length;
                    if (length) {
                        const dimension = horizontal ? 'width' : 'height';
                        let i = 0;
                        while (i < length) {
                            borderRadius[i] = formatPX(node.parseUnit(borderRadius[i++], dimension, false));
                        }
                        boxStyle.borderRadius = borderRadius;
                    }
                }
                node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
    }

    public setFontStyle(node: T) {
        if ((node.textElement || node.inlineText) && (!node.textEmpty || node.visibleStyle.background || node.pseudoElement) || node.inputElement) {
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
                fontFamily: node.css('fontFamily').trim(),
                fontStyle: node.css('fontStyle'),
                fontSize: node.fontSize,
                fontWeight,
                color: color?.valueAsRGBA || ''
            } as FontAttribute);
        }
    }

    public setValueString(node: T) {
        const element = node.element as HTMLInputElement;
        if (element) {
            let value = '';
            let hint = '';
            let trimming = false;
            let inlined = false;
            switch (element.tagName) {
                case 'INPUT':
                    value = getNamedItem(element, 'value');
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox': {
                            const companion = node.companion;
                            if (companion?.visible === false) {
                                value = companion.textContent.trim();
                            }
                            break;
                        }
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
                        case 'color': {
                            const borderColor = this.controllerSettings.style.inputColorBorderColor;
                            const backgroundColor = (parseColor(value) as ColorData || parseColor('rgb(0, 0, 0)')).valueAsRGBA;
                            const { width, height } = node.actualDimension;
                            const backgroundSize = `${width - 10}px ${height - 10}px, ${width - 8}px ${height - 8}px`;
                            const backgroundRepeat = 'no-repeat, no-repeat';
                            const backgroundPositionX = 'center, center', backgroundPositionY = 'center, center';
                            const backgroundImage = ResourceUI.parseBackgroundImage(node, `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(${borderColor}, ${borderColor})`) as Gradient[];
                            value = '';
                            let boxStyle: BoxStyle = node.data(ResourceUI.KEY_NAME, 'boxStyle');
                            if (boxStyle) {
                                const backgroundImageA = boxStyle.backgroundImage;
                                if (backgroundImageA) {
                                    boxStyle.backgroundSize = backgroundSize + ', ' + boxStyle.backgroundSize;
                                    boxStyle.backgroundRepeat = backgroundRepeat + ', ' + boxStyle.backgroundRepeat;
                                    boxStyle.backgroundPositionX = backgroundPositionX + ', ' + boxStyle.backgroundPositionX;
                                    boxStyle.backgroundPositionY = backgroundPositionY + ', ' + boxStyle.backgroundPositionY;
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
                    break;
                case 'IFRAME':
                    value = element.src;
                    break;
                default: {
                    trimming = true;
                    if (node.plainText || node.pseudoElement || node.hasAlign(NODE_ALIGNMENT.INLINE) && node.textElement) {
                        value = node.textContent.replace(/&/g, '&amp;');
                        inlined = true;
                    }
                    else if (node.inlineText) {
                        value = node.textEmpty ? STRING_SPACE : this.removeExcludedFromText(node, element);
                    }
                    if (value !== '') {
                        value = value.replace(/\u00A0/g, STRING_SPACE);
                        switch (node.css('whiteSpace')) {
                            case 'pre':
                            case 'pre-wrap': {
                                if (node.renderParent?.layoutVertical === false) {
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
                                value = value
                                    .replace(/\n/g, '\\n')
                                    .replace(/\t/g, STRING_SPACE.repeat(node.toInt('tabSize', 8)))
                                    .replace(/\s/g, STRING_SPACE);
                                inlined = true;
                                trimming = false;
                                break;
                            }
                            case 'pre-line':
                                value
                                    .replace(/\n/g, '\\n')
                                    .replace(/\s+/g, ' ');
                                inlined = true;
                                trimming = false;
                                break;
                            case 'nowrap':
                                value = value.replace(/\n+/g, ' ');
                                inlined = true;
                            default: {
                                const trimBoth = node.onlyChild && node.htmlElement;
                                if (trimBoth || node.previousSibling?.blockStatic) {
                                    value = value.replace(CHAR_LEADINGSPACE, '');
                                }
                                if (trimBoth || node.nextSibling?.blockStatic) {
                                    value = value.replace(CHAR_TRAILINGSPACE, '');
                                }
                            }
                        }
                    }
                    else if (node.naturalChildren.length === 0 && !node.hasPX('height') && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle')) && node.textContent.trim() === '') {
                        value = node.textContent;
                    }
                    break;
                }
            }
            if (value !== '') {
                if (trimming) {
                    if (node.pageFlow) {
                        const previousSibling = node.siblingsLeading[0];
                        const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                        let previousSpaceEnd = false;
                        if (value.length > 1) {
                            if (!previousSibling || previousSibling.multiline || previousSibling.lineBreak || previousSibling.floating ||  previousSibling.plainText && CHAR_TRAILINGSPACE.test(previousSibling.textContent)) {
                                value = value.replace(CHAR_LEADINGSPACE, '');
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
                            const trailingSpace = !node.lineBreakTrailing && CHAR_TRAILINGSPACE.test(value);
                            if (CHAR_LEADINGSPACE.test(value) && previousSibling?.block === false && !previousSibling.lineBreak && !previousSpaceEnd) {
                                value = STRING_SPACE + value.trim();
                            }
                            else {
                                value = value.trim();
                            }
                            if (trailingSpace && nextSibling?.blockStatic === false && !nextSibling.floating) {
                                value += STRING_SPACE;
                            }
                        }
                        else if (value.trim() !== '') {
                            value = value.replace(CHAR_LEADINGSPACE, previousSibling && (
                                previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node)) ? '' : STRING_SPACE
                            );
                            value = value.replace(CHAR_TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic || nextSibling?.floating ? '' : STRING_SPACE);
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
            if (hint !== '') {
                node.data(ResourceUI.KEY_NAME, 'hintString', hint);
            }
        }
        else if (node.inlineText) {
            const value = node.textContent;
            if (value !== '') {
                node.data(ResourceUI.KEY_NAME, 'valueString', value);
            }
        }
    }

    protected removeExcludedFromText(node: T, element: Element) {
        const styled = element.children.length > 0 || element.tagName === 'CODE';
        const preserveWhitespace = node.preserveWhiteSpace;
        const attr = styled ? 'innerHTML' : 'textContent';
        let value: string = element[attr] || '';
        const sessionId = node.sessionId;
        element.childNodes.forEach((item: Element, index: number) => {
            const child = getElementAsNode<NodeUI>(item, sessionId);
            if (!child || !child.textElement || !child.pageFlow || child.positioned || child.pseudoElement || child.excluded) {
                if (child) {
                    if (styled && child.htmlElement) {
                        const outerHTML = child.toElementString('outerHTML');
                        if (child.lineBreak) {
                            value = value.replace(!preserveWhitespace ? new RegExp(`\\s*${outerHTML}\\s*`) : outerHTML, '\\n');
                        }
                        else if (child.positioned) {
                            value = value.replace(outerHTML, '');
                        }
                        else if (!preserveWhitespace) {
                            value = value.replace(outerHTML, child.pageFlow && child.textContent.trim() !== '' ? STRING_SPACE : '');
                        }
                        return;
                    }
                    else {
                        const textContent = child.plainText ? child.textContent : child[attr];
                        if (isString(textContent)) {
                            if (!preserveWhitespace) {
                                value = value.replace(textContent, '');
                            }
                            return;
                        }
                    }
                }
                else if (item instanceof HTMLElement) {
                    const position = getComputedStyle(item).getPropertyValue('position');
                    value = value.replace(item.outerHTML, position !== 'absolute' && position !== 'fixed' && item.textContent!.trim() !== '' ? STRING_SPACE : '');
                }
                if (!preserveWhitespace) {
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
        else if (!preserveWhitespace && /^[\s\n]+$/.test(value)) {
            return node.blockStatic ? STRING_SPACE : '';
        }
        return value
            .replace(/^\\n\\n/, '\\n')
            .replace(/\\n\\n$/, '\\n')
            .replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)));
    }

    get controllerSettings() {
        return (this.application.controllerHandler as squared.base.ControllerUI<T>).localSettings;
    }
}