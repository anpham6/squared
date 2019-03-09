import { ResourceAssetMap, ResourceStoredMap, SessionData, UserSettings } from './@types/application';
import { ConicGradient, LinearGradient, RadialGradient } from './@types/node';

import Application from './application';
import File from './file';
import Node from './node';
import NodeList from './nodelist';

import { NODE_RESOURCE } from './lib/enumeration';

const $color = squared.lib.color;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $element = squared.lib.element;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const REGEXP_COLORSTOP = `(?:\\s*(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[a-zA-Z\\d]{3,}|[a-z]+)\\s*(\\d+%|${$util.REGEXP_STRING.DEGREE}|${$util.REGEXP_STRING.UNIT})?,?\\s*)`;
const REGEXP_POSITION = /(.+?)?\s*at (.+?)$/;
const REGEXP_BACKGROUNDIMAGE = `(?:initial|url\\("?.+?"?\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner)?(?:\\s*at [\\w %]+)?),?\\s*(${REGEXP_COLORSTOP}+)\\))`;

function replaceExcluded<T extends Node>(element: HTMLElement, attr: string) {
    let value: string = element[attr];
    for (let i = 0; i < element.children.length; i++) {
        const item = $dom.getElementAsNode<T>(element.children[i]);
        if (item && (item.excluded || item.dataset.target && $util.isString(item[attr]))) {
            value = value.replace(item[attr], '');
        }
    }
    return value;
}

function parseColorStops<T extends Node>(node: T, gradient: Gradient, value: string, opacity: string, index: number, backgroundSize?: string) {
    const result: ColorStop[] = [];
    const pattern = new RegExp(REGEXP_COLORSTOP, 'g');
    const conic = gradient.type === 'conic';
    let match: RegExpExecArray | null;
    let width = node.bounds.width;
    let height = node.bounds.height;
    if (backgroundSize) {
        const sizes = backgroundSize.split($util.REGEXP_COMPILED.SEPARATOR);
        const dimension = Resource.getBackgroundSize(node, sizes[index % sizes.length]);
        if (dimension) {
            width = dimension.width;
            height = dimension.height;
            gradient.dimension = dimension;
        }
    }
    while ((match = pattern.exec(value)) !== null) {
        const color = $color.parseColor(match[1], opacity, true);
        if (color) {
            const item: ColorStop = { color, offset: -1 };
            if (conic) {
                if (match[3] && match[4]) {
                    item.offset = $util.convertAngle(match[3], match[4]) / 360;
                }
            }
            else if (match[2]) {
                if ($util.isPercent(match[2])) {
                    item.offset = parseFloat(match[2]) / 100;
                }
                else if (gradient.repeating && $util.isUnit(match[2])) {
                    item.offset = node.calculateUnit(match[2], gradient.horizontal, false) / (gradient.horizontal ? width : height);
                }
            }
            if (result.length === 0) {
                if (item.offset === -1) {
                    item.offset = 0;
                }
                else if (item.offset > 0) {
                    result.push({
                        color,
                        offset: 0
                    });
                }
            }
            result.push(item);
        }
    }
    const lastStop = result[result.length - 1];
    if (lastStop.offset === -1) {
        lastStop.offset = 1;
    }
    let percent = 0;
    for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (item.offset === -1) {
            if (i === 0) {
                item.offset = 0;
            }
            else {
                for (let j = i + 1, k = 2; j < result.length - 1; j++, k++) {
                    if (result[j].offset !== -1) {
                        item.offset = (percent + result[j].offset) / k;
                        break;
                    }
                }
                if (item.offset === -1) {
                    item.offset = percent + lastStop.offset / (result.length - 1);
                }
            }
        }
        percent = item.offset;
    }
    if (gradient.repeating) {
        if (percent < 100) {
            const original = result.slice(0);
            complete: {
                let basePercent = percent;
                while (percent < 100) {
                    for (let i = 0; i < original.length; i++) {
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
    else {
        if (percent < 1) {
            const color = { ...result[result.length - 1] };
            color.offset = 1;
            result.push(color);
        }
    }
    return result;
}

function parseAngle(value: string | undefined) {
    if (value) {
        const match = new RegExp($util.REGEXP_STRING.DEGREE).exec(value.trim());
        if (match) {
            let angle = $util.convertAngle(match[1], match[2]) % 360;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        }
    }
    return 0;
}

function replaceWhiteSpace<T extends Node>(node: T, element: Element, value: string): [string, boolean] {
    const renderParent = node.renderParent;
    if (node.multiline && renderParent && !renderParent.layoutVertical) {
        value = value.replace(/^\s*\n/, '');
    }
    switch (node.css('whiteSpace')) {
        case 'nowrap':
            value = value.replace(/\n/g, ' ');
            break;
        case 'pre':
        case 'pre-wrap':
            if (renderParent && !renderParent.layoutVertical) {
                value = value.replace(/^\n/, '');
            }
            value = value
                .replace(/\n/g, '\\n')
                .replace(/\s/g, '&#160;');
            break;
        case 'pre-line':
            value = value
                .replace(/\n/g, '\\n')
                .replace(/\s+/g, ' ');
            break;
        default:
            if (element.previousSibling && $element.isLineBreak(<Element> element.previousSibling)) {
                value = value.replace(/^\s+/, '');
            }
            if (element.nextSibling && $element.isLineBreak(<Element> element.nextSibling)) {
                value = value.replace(/\s+$/, '');
            }
            return [value, false];
    }
    return [value, true];
}

export default abstract class Resource<T extends Node> implements squared.base.Resource<T> {
    public static KEY_NAME = 'squared.resource';

    public static ASSETS: ResourceAssetMap = {
        ids: new Map(),
        images: new Map()
    };

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

    public static getStoredName(asset: string, value: any): string {
        if (Resource.STORED[asset]) {
            for (const [name, data] of Resource.STORED[asset].entries()) {
                if (JSON.stringify(value) === JSON.stringify(data)) {
                    return name;
                }
            }
        }
        return '';
    }

    public static insertStoredAsset(asset: string, name: string, value: any) {
        const stored: Map<string, any> = Resource.STORED[asset];
        if (stored) {
            let result = this.getStoredName(asset, value);
            if (result === '') {
                if ($util.isNumber(name) || /^\d/.test(name)) {
                    name = `__${name}`;
                }
                if ($util.hasValue(value)) {
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
            }
            return result;
        }
        return '';
    }

    public static isBorderVisible(border: BorderAttribute | undefined) {
        return !!border && !(border.style === 'none' || border.width === '0px' || border.color === '' || border.color.length === 9 && border.color.endsWith('00'));
    }

    public static hasDrawableBackground(object: BoxStyle | undefined) {
        return !!object && (!!object.backgroundImage || this.isBorderVisible(object.borderTop) || this.isBorderVisible(object.borderRight) || this.isBorderVisible(object.borderBottom) || this.isBorderVisible(object.borderLeft) || !!object.borderRadius);
    }

    public static getBackgroundSize<T extends Node>(node: T, value: string): Dimension | undefined {
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
                if (dimensions.length === 1) {
                    dimensions[1] = dimensions[0];
                }
                for (let i = 0; i < dimensions.length; i++) {
                    if (dimensions[i] === 'auto') {
                        dimensions[i] = '100%';
                    }
                    if (i === 0) {
                        width = node.calculateUnit(dimensions[i], true, false);
                    }
                    else {
                        height = node.calculateUnit(dimensions[i], false, false);
                    }
                }
                break;
        }
        return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
    }

    public fileHandler?: File<T>;

    protected constructor(
        public application: Application<T>,
        public cache: NodeList<T>)
    {
    }

    public abstract get userSettings(): UserSettings;

    public finalize(data: SessionData<NodeList<T>>) {}

    public reset() {
        for (const name in Resource.ASSETS) {
            Resource.ASSETS[name] = new Map();
        }
        for (const name in Resource.STORED) {
            Resource.STORED[name] = new Map();
        }
        if (this.fileHandler) {
            this.fileHandler.reset();
        }
    }

    public setBoxStyle() {
        for (const node of this.cache) {
            if (node.visible && node.styleElement) {
                const boxStyle: Optional<BoxStyle> = {
                    borderTop: undefined,
                    borderRight: undefined,
                    borderBottom: undefined,
                    borderLeft: undefined,
                    borderRadius: undefined,
                    backgroundColor: undefined,
                    backgroundSize: undefined,
                    backgroundRepeat: undefined,
                    backgroundPositionX: undefined,
                    backgroundPositionY: undefined,
                    backgroundImage: undefined
                };
                for (const attr in boxStyle) {
                    const value = node.css(attr);
                    switch (attr) {
                        case 'borderTop':
                        case 'borderRight':
                        case 'borderBottom':
                        case 'borderLeft': {
                            let borderColor = node.css(`${attr}Color`);
                            switch (borderColor.toLowerCase()) {
                                case 'initial':
                                    borderColor = '#000000';
                                    break;
                                case 'inherit':
                                case 'currentcolor':
                                    borderColor = $css.getInheritedStyle(node.element, `${attr}Color`);
                                    break;
                            }
                            const style = node.css(`${attr}Style`) || 'none';
                            let width = node.css(`${attr}Width`) || '1px';
                            let color: ColorData | undefined;
                            switch (style) {
                                case 'none':
                                    break;
                                case 'inset':
                                    if (width === '0px') {
                                        width = '1px';
                                    }
                                default:
                                    color = $color.parseColor(borderColor, node.css('opacity'));
                                    break;
                            }
                            boxStyle[attr] = <BorderAttribute> {
                                width,
                                style,
                                color: color ? color.valueAsRGBA : ''
                            };
                            break;
                        }
                        case 'borderRadius': {
                            const top = node.css('borderTopLeftRadius');
                            const right = node.css('borderTopRightRadius');
                            const bottom = node.css('borderBottomLeftRadius');
                            const left = node.css('borderBottomRightRadius');
                            if (top === right && right === bottom && bottom === left) {
                                boxStyle.borderRadius = $util.convertInt(top) > 0 ? [top] : undefined;
                            }
                            else {
                                boxStyle.borderRadius = [top, right, bottom, left];
                            }
                            break;
                        }
                        case 'backgroundColor':
                            if (!node.has('backgroundColor') && (value === node.cssAscend('backgroundColor', false, true) || node.documentParent.visible && $css.isInheritedStyle(node.element, 'backgroundColor'))) {
                                boxStyle.backgroundColor = '';
                            }
                            else {
                                const color = $color.parseColor(value, node.css('opacity'));
                                boxStyle.backgroundColor = color ? color.valueAsRGBA : '';
                            }
                            break;
                        case 'backgroundImage':
                            if (value !== 'none' && !node.hasBit('excludeResource', NODE_RESOURCE.IMAGE_SOURCE)) {
                                const images: (string | Gradient)[] = [];
                                const opacity = node.css('opacity');
                                const pattern = new RegExp(REGEXP_BACKGROUNDIMAGE, 'g');
                                let match: RegExpExecArray | null;
                                let i = 0;
                                while ((match = pattern.exec(value)) !== null) {
                                    const [complete, repeating, type, direction, colorStop] = match;
                                    if (complete === 'initial' || complete.startsWith('url')) {
                                        images.push(complete);
                                    }
                                    else {
                                        const gradient: Gradient = {
                                            type,
                                            repeating: repeating === 'repeating',
                                            fontSize: node.fontSize
                                        } as any;
                                        switch (type) {
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
                                                gradient.horizontal = angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315;
                                                gradient.colorStops = parseColorStops(node, gradient, colorStop, opacity, i, boxStyle.backgroundSize);
                                                (<LinearGradient> gradient).angle = angle;
                                                break;
                                            }
                                            case 'radial': {
                                                gradient.horizontal = node.bounds.width <= node.bounds.height;
                                                gradient.colorStops = parseColorStops(node, gradient, colorStop, opacity, i, boxStyle.backgroundSize);
                                                (<RadialGradient> gradient).position = (() => {
                                                    const result = ['center', 'ellipse'];
                                                    if (direction) {
                                                        const position = REGEXP_POSITION.exec(direction);
                                                        if (position) {
                                                            switch (position[1]) {
                                                                case 'ellipse':
                                                                case 'circle':
                                                                case 'closest-side':
                                                                case 'closest-corner':
                                                                case 'farthest-side':
                                                                case 'farthest-corner':
                                                                    result[1] = position[1];
                                                                    break;
                                                            }
                                                            if (position[2]) {
                                                                result[0] = position[2];
                                                            }
                                                        }
                                                    }
                                                    return result;
                                                })();
                                                break;
                                            }
                                            case 'conic': {
                                                gradient.colorStops = parseColorStops(node, gradient, colorStop, opacity, i, boxStyle.backgroundSize);
                                                (<ConicGradient> gradient).angle = parseAngle(direction),
                                                (<ConicGradient> gradient).position = (() => {
                                                    if (direction) {
                                                        const position = REGEXP_POSITION.exec(direction);
                                                        if (position) {
                                                            return [position[2]];
                                                        }
                                                    }
                                                    return ['center'];
                                                })();
                                                break;
                                            }
                                        }
                                        images.push(gradient);
                                    }
                                    i++;
                                }
                                if (images.length) {
                                    boxStyle.backgroundImage = images;
                                }
                            }
                            break;
                        case 'backgroundSize':
                        case 'backgroundRepeat':
                        case 'backgroundPositionX':
                        case 'backgroundPositionY':
                            boxStyle[attr] = value;
                            break;
                    }
                }
                const borderTop = JSON.stringify(boxStyle.borderTop);
                if (borderTop === JSON.stringify(boxStyle.borderRight) && borderTop === JSON.stringify(boxStyle.borderBottom) && borderTop === JSON.stringify(boxStyle.borderLeft)) {
                    boxStyle.border = boxStyle.borderTop;
                }
                node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
    }

    public setFontStyle() {
        for (const node of this.cache) {
            const backgroundImage = Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'));
            if (!(node.element === null ||
                node.renderChildren.length ||
                node.imageElement ||
                node.svgElement ||
                node.tagName === 'HR' ||
                node.inlineText && !backgroundImage && !node.preserveWhiteSpace && node.element.innerHTML.trim() === ''))
            {
                const opacity = node.css('opacity');
                const color = $color.parseColor(node.css('color'), opacity);
                let fontFamily = node.css('fontFamily');
                let fontSize = node.css('fontSize');
                let fontWeight = node.css('fontWeight');
                if ($util.isUserAgent($util.USER_AGENT.EDGE) && !node.has('fontFamily')) {
                    switch (node.tagName) {
                        case 'TT':
                        case 'CODE':
                        case 'KBD':
                        case 'SAMP':
                            fontFamily = 'monospace';
                            break;
                    }
                }
                if ($util.convertInt(fontSize) === 0) {
                    switch (fontSize) {
                        case 'xx-small':
                            fontSize = '8px';
                            break;
                        case 'x-small':
                            fontSize = '10px';
                            break;
                        case 'small':
                            fontSize = '13px';
                            break;
                        case 'medium':
                            fontSize = '16px';
                            break;
                        case 'large':
                            fontSize = '18px';
                            break;
                        case 'x-large':
                            fontSize = '24px';
                            break;
                        case 'xx-large':
                            fontSize = '32px';
                            break;
                    }
                }
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
                const result: FontAttribute = {
                    fontFamily,
                    fontStyle: node.css('fontStyle'),
                    fontSize,
                    fontWeight,
                    color: color ? color.valueAsRGBA : ''
                };
                node.data(Resource.KEY_NAME, 'fontStyle', result);
            }
        }
    }

    public setValueString() {
        for (const node of this.cache) {
            const element = <HTMLInputElement> node.element;
            if (element && node.visible) {
                let name = '';
                let value = '';
                let inlineTrim = false;
                let performTrim = true;
                switch (element.tagName) {
                    case 'INPUT':
                        switch (element.type) {
                            case 'text':
                            case 'number':
                            case 'email':
                            case 'search':
                            case 'submit':
                            case 'reset':
                            case 'button':
                                value = element.value.trim();
                                break;
                            default:
                                if (node.companion && !node.companion.visible) {
                                    value = node.companion.textContent.trim();
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        value = element.innerText;
                        break;
                    case 'TEXTAREA':
                        value = element.value.trim();
                        break;
                    default:
                        if (node.plainText) {
                            name = node.textContent.trim();
                            value = node.textContent.replace(/&[A-Za-z]+;/g, match => match.replace('&', '&amp;'));
                            [value, inlineTrim] = replaceWhiteSpace(node, element, value);
                        }
                        else if (node.inlineText) {
                            name = node.textContent.trim();
                            if (element.tagName === 'CODE') {
                                value = replaceExcluded(element, 'innerHTML');
                            }
                            else if ($element.hasLineBreak(element, true)) {
                                value = replaceExcluded(element, 'innerHTML')
                                    .replace(/\s*<br[^>]*>\s*/g, '\\n')
                                    .replace(/(<([^>]+)>)/ig, '');
                            }
                            else {
                                value = replaceExcluded(element, 'textContent');
                            }
                            [value, inlineTrim] = replaceWhiteSpace(node, element, value);
                        }
                        else if (node.htmlElement && element.innerText.trim() === '' && Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'))) {
                            value = element.innerText;
                            performTrim = false;
                        }
                        break;
                }
                if (this.application.userSettings.replaceCharacterEntities) {
                    value = $xml.replaceEntity(value);
                }
                if (value !== '') {
                    if (performTrim) {
                        const previousSibling = node.previousSiblings().pop();
                        const nextSibling = node.nextSiblings().shift();
                        let previousSpaceEnd = false;
                        if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && /\s+$/.test(previousSibling.textContent)) {
                            value = value.replace(/^\s+/, '');
                        }
                        else if (previousSibling.element) {
                            previousSpaceEnd = /\s+$/.test((<HTMLElement> previousSibling.element).innerText || previousSibling.textContent);
                        }
                        if (inlineTrim) {
                            const original = value;
                            value = value.trim();
                            if (previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd && /^\s+/.test(original)) {
                                value = '&#160;' + value;
                            }
                            if (nextSibling && !nextSibling.lineBreak && /\s+$/.test(original)) {
                                value += '&#160;';
                            }
                        }
                        else {
                            if (!/^\s+$/.test(value)) {
                                value = value.replace(/^\s+/, previousSibling && (
                                    previousSibling.block ||
                                    previousSibling.lineBreak ||
                                    previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                    node.multiline && $element.hasLineBreak(element)) ? '' : '&#160;'
                                );
                                value = value.replace(/\s+$/, node.display === 'table-cell' || nextSibling && nextSibling.lineBreak || node.blockStatic ? '' : '&#160;');
                            }
                            else if (value.length) {
                                value = '&#160;' + value.substring(1);
                            }
                        }
                    }
                    if (value !== '') {
                        node.data(Resource.KEY_NAME, 'valueString', { name, value });
                    }
                }
            }
        }
    }

    get stored() {
        return Resource.STORED;
    }
}