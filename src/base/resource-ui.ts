import { ControllerUISettings, FileAsset, ResourceStoredMap, UserUISettings } from './@types/application';

import Resource from './resource';
import ControllerUI from './controller-ui';
import FileUI from './file-ui';
import NodeUI from './node-ui';

import { NODE_RESOURCE } from './lib/enumeration';

const $client = squared.lib.client;
const $color = squared.lib.color;
const $const = squared.lib.constant;
const $css = squared.lib.css;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $util = squared.lib.util;

const STRING_SPACE = '&#160;';
const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[A-Za-z\\d]{3,8}|[a-z]+)\\s*(${$regex.STRING.LENGTH_PERCENTAGE}|${$regex.STRING.CSS_ANGLE}|(?:${$regex.STRING.CSS_CALC}(?=,)|${$regex.STRING.CSS_CALC}))?,?\\s*`;
const REGEXP_U00A0  = /\u00A0/g;
const REGEXP_NEWLINE = /\n/g;
const REGEXP_AMPERSAND = /&/g;
const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\([^)]+\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?(?:\\s*at [\\w %]+)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
let REGEXP_COLORSTOP: RegExp | undefined;

function removeExcluded(node: NodeUI, element: Element, attr: string) {
    let value: string = element[attr];
    const children = node.actualChildren;
    const length = children.length;
    for (let i = 0; i < length; i++) {
        const item = <NodeUI> children[i];
        if (!item.textElement || !item.pageFlow || item.positioned || item.pseudoElement || item.excluded || item.dataset.target) {
            if (item.htmlElement && attr === 'innerHTML') {
                if (item.lineBreak) {
                    value = value.replace(new RegExp(`\\s*${(<Element> item.element).outerHTML}\\s*`), '\\n');
                }
                else {
                    value = value.replace((<Element> item.element).outerHTML, item.pageFlow && item.textContent ? STRING_SPACE : '');
                }
            }
            else if ($util.isString(item[attr])) {
                value = value.replace(item[attr], '');
            }
            else if (i === 0) {
                value = $util.trimStart(value, ' ');
            }
            else if (i === length - 1) {
                value = $util.trimEnd(value, ' ');
            }
        }
    }
    if (attr === 'innerHTML') {
        value = value.replace($regex.ESCAPE.ENTITY, (match, capture) => String.fromCharCode(parseInt(capture)));
    }
    return value;
}

function parseColorStops(node: NodeUI, gradient: Gradient, value: string, opacity: string) {
    if (REGEXP_COLORSTOP === undefined) {
        REGEXP_COLORSTOP = new RegExp(STRING_COLORSTOP, 'g');
    }
    else {
        REGEXP_COLORSTOP.lastIndex = 0;
    }
    const radial = <RadialGradient> gradient;
    const dimension = radial.horizontal ? $const.CSS.WIDTH : $const.CSS.HEIGHT;
    const repeating = radial.repeating === true;
    const extent = repeating && gradient.type === 'radial' ? radial.radiusExtent / radial.radius : 1;
    const result: ColorStop[] = [];
    let match: RegExpExecArray | null;
    let previousOffset = 0;
    while ((match = REGEXP_COLORSTOP.exec(value)) !== null) {
        const color = $color.parseColor(match[1], opacity, true);
        if (color) {
            let offset = -1;
            if (gradient.type === 'conic') {
                if (match[3] && match[4]) {
                    offset = $css.convertAngle(match[3], match[4]) / 360;
                }
            }
            else if (match[2]) {
                if ($css.isPercent(match[2])) {
                    offset = parseFloat(match[2]) / 100;
                }
                else if (repeating) {
                    const size: number = gradient.type === 'radial' ? radial.radius : (<Dimension> gradient.dimension)[dimension];
                    if ($css.isLength(match[2])) {
                        offset = node.parseUnit(match[2], dimension, false) / size;
                    }
                    else if ($css.isCalc(match[2])) {
                        offset = $css.calculate(match[6], size, node.fontSize) / size;
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
        const item = result[i];
        if (item.offset === -1) {
            if (i === 0) {
                item.offset = 0;
            }
            else {
                for (let j = i + 1, k = 2; j < length - 1; j++, k++) {
                    if (result[j].offset !== -1) {
                        item.offset = (percent + result[j].offset) / k;
                        break;
                    }
                }
                if (item.offset === -1) {
                    item.offset = percent + lastStop.offset / (length - 1);
                }
            }
        }
        percent = item.offset;
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

function parseAngle(value: string) {
    if (value) {
        let degree = $css.parseAngle(value.trim());
        if (degree < 0) {
            degree += 360;
        }
        return degree;
    }
    return 0;
}

function replaceWhiteSpace(parent: NodeUI, node: NodeUI, element: Element, value: string): [string, boolean] {
    value = value.replace(REGEXP_U00A0, STRING_SPACE);
    switch (node.css('whiteSpace')) {
        case 'nowrap':
            value = value.replace(REGEXP_NEWLINE, ' ');
            break;
        case 'pre':
        case 'pre-wrap':
            if (!parent.layoutVertical) {
                value = value.replace(/^\s*?\n/, '');
            }
            value = value
                .replace(REGEXP_NEWLINE, '\\n')
                .replace(/\s/g, STRING_SPACE);
            break;
        case 'pre-line':
            value = value
                .replace(REGEXP_NEWLINE, '\\n')
                .replace(/\s+/g, ' ');
            break;
        default:
            if (element.previousSibling && ControllerUI.causesLineBreak(<Element> element.previousSibling, node.sessionId) || node.singleChild && node.htmlElement) {
                value = value.replace($regex.CHAR.LEADINGSPACE, '');
            }
            if (element.nextSibling && ControllerUI.causesLineBreak(<Element> element.nextSibling, node.sessionId) || node.singleChild && node.htmlElement) {
                value = value.replace($regex.CHAR.TRAILINGSPACE, '');
            }
            return [value, false];
    }
    return [value, true];
}

function getBackgroundSize(node: NodeUI, index: number, value?: string) {
    if (value) {
        const sizes = value.split($regex.XML.SEPARATOR);
        return ResourceUI.getBackgroundSize(node, sizes[index % sizes.length]);
    }
    return undefined;
}

const getGradientPosition = (value: string) => value ? /(.+?)?\s*at (.+?)$/.exec(value) : null;

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
            name += `_${i.toString()}`;
        }
        const previous = this.ASSETS.ids.get(section) || [];
        do {
            if (!previous.includes(name)) {
                previous.push(name);
                break;
            }
            else {
                name = `${prefix}_${(++i).toString()}`;
            }
        }
        while (true);
        this.ASSETS.ids.set(section, previous);
        return name;
    }

    public static insertStoredAsset(asset: string, name: string, value: any) {
        const stored: Map<string, any> = ResourceUI.STORED[asset];
        if (stored && $util.hasValue(value)) {
            let result = this.getStoredName(asset, value);
            if (result === '') {
                if ($util.isNumber(name)) {
                    name = `__${name}`;
                }
                let i = 0;
                do {
                    result = name;
                    if (i > 0) {
                        result += `_${i}`;
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
                if (numberArray && !$util.isNumber(value)) {
                    numberArray = false;
                }
                stringArray.push(value);
            }
        }
        return numberArray ? [undefined, stringArray] : [stringArray];
    }

    public static isBackgroundVisible(object: BoxStyle | undefined) {
        return object !== undefined && (!!object.backgroundImage || !!object.borderTop || !!object.borderRight || !!object.borderBottom || !!object.borderLeft);
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
                    if (dimensions[i] === $const.CSS.AUTO) {
                        dimensions[i] = $const.CSS.PERCENT_100;
                    }
                    if (i === 0) {
                        width = node.parseUnit(dimensions[i], $const.CSS.WIDTH, false);
                    }
                    else {
                        height = node.parseUnit(dimensions[i], $const.CSS.HEIGHT, false);
                    }
                }
                break;
        }
        return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
    }

    public static isInheritedStyle(node: NodeUI, attr: string) {
        if (node.styleElement) {
            const actualParent = node.actualParent;
            if (actualParent && node.cssInitial(attr) === '') {
                return node.style[attr] === actualParent.style[attr];
            }
        }
        return false;
    }

    public static hasLineBreak(node: NodeUI, lineBreak = false, trim = false) {
        if (node.actualChildren.length) {
            return node.actualChildren.some(item => item.lineBreak);
        }
        else if (!lineBreak && node.naturalElement) {
            const element = <Element> node.element;
            let value = element.textContent as string;
            if (trim) {
                value = value.trim();
            }
            if (/\n/.test(value)) {
                if (node.plainText && $css.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
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
                if ($util.isEqual(value, data)) {
                    return name;
                }
            }
        }
        return '';
    }

    public fileHandler?: FileUI<T>;

    public abstract get userSettings(): UserUISettings;

    public finalize(layouts: FileAsset[]) {}

    public reset() {
        super.reset();
        for (const name in ResourceUI.STORED) {
            ResourceUI.STORED[name].clear();
        }
        if (this.fileHandler) {
            this.fileHandler.reset();
        }
    }

    public writeRawImage(filename: string, base64: string) {
        if (this.fileHandler) {
            this.fileHandler.addAsset({
                pathname: (<ControllerUISettings> this.application.controllerHandler.localSettings).directory.image,
                filename,
                base64
            });
        }
    }

    public setBoxStyle(node: T) {
        if (node.visible && node.styleElement) {
            const boxStyle: BoxStyle = {
                backgroundSize: node.css('backgroundSize'),
                backgroundRepeat: node.css('backgroundRepeat'),
                backgroundPositionX: node.css('backgroundPositionX'),
                backgroundPositionY: node.css('backgroundPositionY')
            };
            const element = <HTMLElement> node.element;
            const opacity = node.css('opacity');
            function setBorderStyle(attr: string, border: string[]) {
                const style = node.css(border[0]) || $const.CSS.NONE;
                let width = $css.formatPX(attr !== 'outline' ? node[border[1]] : $util.convertFloat(node.style[border[1]]));
                let color = node.css(border[2]) || 'initial';
                switch (color) {
                    case 'initial':
                        color = 'rgb(0, 0, 0)';
                        break;
                    case 'inherit':
                    case 'currentcolor':
                        color = $css.getInheritedStyle(element, border[2]);
                        break;
                }
                if (style !== $const.CSS.NONE && width !== $const.CSS.PX_0) {
                    if (width === '2px' && (style === 'inset' || style === 'outset')) {
                        width = '1px';
                    }
                    const borderColor = $color.parseColor(color, opacity, true);
                    if (borderColor) {
                        boxStyle[attr] = <BorderAttribute> {
                            width,
                            style,
                            color: borderColor
                        };
                    }
                }
            }
            switch (node.css('backgroundClip')) {
                case 'padding-box':
                    boxStyle.backgroundClip = {
                        top: node.borderTopWidth,
                        right: node.borderRightWidth,
                        bottom: node.borderBottomWidth,
                        left: node.borderLeftWidth
                    };
                    break;
                case 'content-box':
                    boxStyle.backgroundClip = {
                        top: node.borderTopWidth + node.paddingTop,
                        right: node.borderRightWidth + node.paddingRight,
                        bottom: node.borderBottomWidth + node.paddingBottom,
                        left: node.borderLeftWidth + node.paddingLeft
                    };
                    break;
            }
            if (node.css('borderRadius') !== $const.CSS.PX_0) {
                const [A, B] = node.css('borderTopLeftRadius').split(' ');
                const [C, D] = node.css('borderTopRightRadius').split(' ');
                const [E, F] = node.css('borderBottomRightRadius').split(' ');
                const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                const borderRadius = !B && !D && !F && !H ? [A, C, E, G] : [A, B || A, C, D || C, E, F || E, G, H || G];
                const horizontal = node.actualWidth >= node.actualHeight;
                if (borderRadius.every(radius => radius === borderRadius[0])) {
                    if (borderRadius[0] === $const.CSS.PX_0 || borderRadius[0] === '') {
                        borderRadius.length = 0;
                    }
                    else {
                        borderRadius.length = 1;
                    }
                }
                const length = borderRadius.length;
                if (length) {
                    for (let i = 0; i < length; i++) {
                        borderRadius[i] = node.convertPX(borderRadius[i], horizontal ? $const.CSS.WIDTH : $const.CSS.HEIGHT, false);
                    }
                    boxStyle.borderRadius = borderRadius;
                }
            }
            if (!node.css('border').startsWith('0px none')) {
                setBorderStyle('borderTop', $css.BOX_BORDER[0]);
                setBorderStyle('borderRight', $css.BOX_BORDER[1]);
                setBorderStyle('borderBottom', $css.BOX_BORDER[2]);
                setBorderStyle('borderLeft', $css.BOX_BORDER[3]);
                setBorderStyle('outline', $css.BOX_BORDER[4]);
            }
            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                REGEXP_BACKGROUNDIMAGE.lastIndex = 0;
                const images: (string | Gradient)[] = [];
                let match: RegExpExecArray | null;
                let i = 0;
                while ((match = REGEXP_BACKGROUNDIMAGE.exec(node.backgroundImage)) !== null) {
                    if (match[0] === 'initial' || match[0].startsWith('url')) {
                        images.push(match[0]);
                    }
                    else {
                        const repeating = match[1] === 'repeating';
                        const type = match[2];
                        const direction = match[3];
                        const dimension = getBackgroundSize(node, i, boxStyle.backgroundSize) || node.actualDimension;
                        let gradient: Gradient | undefined;
                        switch (type) {
                            case 'conic': {
                                const position = getGradientPosition(direction);
                                const conic = <ConicGradient> {
                                    type,
                                    dimension,
                                    angle: parseAngle(direction)
                                };
                                conic.center = $css.getBackgroundPosition(position && position[2] || $const.CSS.CENTER, dimension, node.fontSize);
                                conic.colorStops = parseColorStops(node, conic, match[4], opacity);
                                gradient = conic;
                                break;
                            }
                            case 'radial': {
                                const position = getGradientPosition(direction);
                                const radial = <RadialGradient> {
                                    type,
                                    repeating,
                                    horizontal: node.actualWidth <= node.actualHeight,
                                    dimension,
                                    shape: position && position[1] && position[1].startsWith('circle') ? 'circle' : 'ellipse'
                                };
                                radial.center = $css.getBackgroundPosition(position && position[2] || $const.CSS.CENTER, dimension, node.fontSize);
                                radial.closestCorner = Number.POSITIVE_INFINITY;
                                radial.farthestCorner = Number.NEGATIVE_INFINITY;
                                for (const corner of [[0, 0], [dimension.width, 0], [dimension.width, dimension.height], [0, dimension.height]]) {
                                    const length = Math.round(Math.sqrt(Math.pow(Math.abs(corner[0] - radial.center.left), 2) + Math.pow(Math.abs(corner[1] - radial.center.top), 2)));
                                    if (length < radial.closestCorner) {
                                        radial.closestCorner = length;
                                    }
                                    if (length > radial.farthestCorner) {
                                        radial.farthestCorner = length;
                                    }
                                }
                                radial.closestSide = radial.center.top;
                                radial.farthestSide = radial.center.top;
                                for (const side of [dimension.width - radial.center.left, dimension.height - radial.center.top, radial.center.left]) {
                                    if (side < radial.closestSide) {
                                        radial.closestSide = side;
                                    }
                                    if (side > radial.farthestSide) {
                                        radial.farthestSide = side;
                                    }
                                }
                                radial.radius = radial.farthestCorner;
                                const extent = position && position[1] ? position[1].split(' ').pop() : '';
                                switch (extent) {
                                    case 'closest-corner':
                                    case 'closest-side':
                                    case 'farthest-side':
                                        const length = radial[$util.convertCamelCase(extent)];
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
                                radial.colorStops = parseColorStops(node, radial, match[4], opacity);
                                gradient = radial;
                                break;
                            }
                            case 'linear': {
                                let angle = 180;
                                switch (direction) {
                                    case 'to top':
                                        angle = 0;
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
                                            angle = parseAngle(direction);
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
                                linear.colorStops = parseColorStops(node, linear, match[4], opacity);
                                const width = dimension.width;
                                const height = dimension.height;
                                let x = $math.truncateFraction($math.offsetAngleX(angle, width));
                                let y = $math.truncateFraction($math.offsetAngleY(angle, height));
                                if (x !== width && y !== height && !$math.isEqual(Math.abs(x), Math.abs(y))) {
                                    let oppositeAngle: number;
                                    if (angle <= 90) {
                                        oppositeAngle = $math.relativeAngle({ x: 0, y: height }, { x: width, y: 0 });
                                    }
                                    else if (angle <= 180) {
                                        oppositeAngle = $math.relativeAngle({ x: 0, y: 0 }, { x: width, y: height });
                                    }
                                    else if (angle <= 270) {
                                        oppositeAngle = $math.relativeAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                    }
                                    else {
                                        oppositeAngle = $math.relativeAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                    }
                                    let a = Math.abs(oppositeAngle - angle);
                                    let b = 90 - a;
                                    const lenX = $math.triangulate(a, b, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
                                    x = $math.truncateFraction($math.offsetAngleX(angle, lenX[1]));
                                    a = 90;
                                    b = 90 - angle;
                                    const lenY = $math.triangulate(a, b, x);
                                    y = $math.truncateFraction($math.offsetAngleY(angle, lenY[0]));
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
                    boxStyle.backgroundImage = images;
                }
            }
            const backgroundColor = node.documentParent.visible ? node.backgroundColor : node.css('backgroundColor');
            if (backgroundColor !== '') {
                const color = $color.parseColor(backgroundColor, opacity);
                boxStyle.backgroundColor = color ? color.valueAsRGBA : '';
            }
            if (boxStyle.borderTop && boxStyle.borderRight && boxStyle.borderBottom && boxStyle.borderLeft) {
                let valid = true;
                for (const attr in boxStyle.borderTop) {
                    const value = boxStyle.borderTop[attr];
                    if (value !== boxStyle.borderRight[attr] || value !== boxStyle.borderBottom[attr] || value !== boxStyle.borderLeft[attr]) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    boxStyle.border = boxStyle.borderTop;
                }
            }
            node.data(ResourceUI.KEY_NAME, 'boxStyle', boxStyle);
        }
    }

    public setFontStyle(node: T) {
        if (!(node.element === null || node.renderChildren.length || node.imageElement || node.svgElement || node.tagName === 'HR' || node.textEmpty && !node.visibleStyle.background)) {
            const color = $color.parseColor(node.css('color'), node.css('opacity'));
            let fontWeight = node.css('fontWeight');
            if (!$util.isNumber(fontWeight)) {
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
                fontSize: $css.formatPX(node.fontSize),
                fontWeight,
                color: color ? color.valueAsRGBA : ''
            });
        }
    }

    public setValueString(node: T) {
        if (node.visible && !node.svgElement) {
            const element = <HTMLInputElement> node.element;
            const renderParent = node.renderParent;
            if (element && renderParent) {
                let name = '';
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
                                if (node.companion && !node.companion.visible) {
                                    value = node.companion.textContent;
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
                                value = $client.isUserAgent($client.USER_AGENT.FIREFOX) ? 'Browse...' : 'Choose File';
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
                        if (node.plainText) {
                            name = textContent.trim();
                            [value] = replaceWhiteSpace(
                                renderParent,
                                node,
                                element,
                                textContent.replace(REGEXP_AMPERSAND, '&amp;')
                            );
                            inlined = true;
                            trimming = true;
                        }
                        else if (node.inlineText) {
                            name = textContent.trim();
                            [value, inlined] = replaceWhiteSpace(
                                renderParent,
                                node,
                                element,
                                removeExcluded(node, element, element.children.length || element.tagName === 'CODE' ? 'innerHTML' : 'textContent')
                            );
                            trimming = true;
                        }
                        else if (textContent.trim() === '' && ResourceUI.isBackgroundVisible(node.data(ResourceUI.KEY_NAME, 'boxStyle'))) {
                            value = textContent;
                        }
                        break;
                }
                if (value !== '') {
                    if (trimming) {
                        const previousSibling = node.siblingsLeading[0];
                        let previousSpaceEnd = false;
                        if (value.length > 1) {
                            if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && $regex.CHAR.TRAILINGSPACE.test(previousSibling.textContent)) {
                                value = value.replace($regex.CHAR.LEADINGSPACE, '');
                            }
                            else if (previousSibling.naturalElement) {
                                const textContent = previousSibling.textContent;
                                if (textContent.length) {
                                    previousSpaceEnd = textContent.charCodeAt(textContent.length - 1) === 32;
                                }
                            }
                        }
                        if (inlined) {
                            const original = value;
                            value = value.trim();
                            if (previousSibling && $regex.CHAR.LEADINGSPACE.test(original) && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd) {
                                value = STRING_SPACE + value;
                            }
                            if (!node.lineBreakTrailing && $regex.CHAR.TRAILINGSPACE.test(original)) {
                                const nextSibling = node.siblingsTrailing.find(item => !item.excluded || item.lineBreak);
                                if (nextSibling && !nextSibling.blockStatic) {
                                    value += STRING_SPACE;
                                }
                            }
                        }
                        else if (value.trim() !== '') {
                            value = value.replace($regex.CHAR.LEADINGSPACE, previousSibling && (
                                previousSibling.block ||
                                previousSibling.lineBreak ||
                                previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                node.multiline && ResourceUI.hasLineBreak(node)) ? '' : STRING_SPACE
                            );
                            value = value.replace($regex.CHAR.TRAILINGSPACE, node.display === 'table-cell' || node.lineBreakTrailing || node.blockStatic ? '' : STRING_SPACE);
                        }
                        else if (!node.inlineText) {
                            return;
                        }
                    }
                    if (value !== '') {
                        node.data(ResourceUI.KEY_NAME, 'valueString', { name, value });
                    }
                }
                if (hint !== '') {
                    node.data(ResourceUI.KEY_NAME, 'hintString', hint);
                }
            }
        }
    }

    get stored() {
        return ResourceUI.STORED;
    }
}