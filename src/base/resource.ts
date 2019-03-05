import { ResourceAssetMap, ResourceStoredMap, SessionData, UserSettings } from './@types/application';
import { ConicGradient, LinearGradient, RadialGradient } from './@types/node';

import Application from './application';
import File from './file';
import Node from './node';
import NodeList from './nodelist';

import { NODE_RESOURCE } from './lib/enumeration';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const REGEXP_COLORSTOP = `(?:\\s*(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[a-zA-Z\\d]{3,}|[a-z]+)\\s*(\\d+%|${$util.REGEXP_STRING.DEGREE}|${$util.REGEXP_STRING.UNIT})?,?\\s*)`;
const REGEXP_POSITION = /(.+?)?\s*at (.+?)$/;

function replaceExcluded<T extends Node>(element: HTMLElement, attr: string) {
    let value: string = element[attr];
    for (let i = 0; i < element.children.length; i++) {
        const item = $dom.getElementAsNode<T>(<HTMLElement> element.children[i]);
        if (item && (item.excluded || $util.hasValue(item.dataset.target) && $util.isString(item[attr]))) {
            value = value.replace(item[attr], '');
        }
    }
    return value;
}

function parseColorStops<T extends Node>(node: T, type: string, value: string, opacity: string, repeating = false, horizontal = true) {
    const result: ColorStop[] = [];
    const pattern = new RegExp(REGEXP_COLORSTOP, 'g');
    const conic = type === 'conic';
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null) {
        const color = $color.parseColor(match[1], opacity, true);
        if (color) {
            const item: ColorStop = {
                color: color.valueAsRGBA,
                opacity: color.alpha,
                offset: ''
            };
            if (conic) {
                if (match[3] && match[4]) {
                    item.offset = $util.convertAngle(match[3], match[4]).toString();
                }
            }
            else if (match[2]) {
                if ($util.isPercent(match[2])) {
                    item.offset = match[2];
                }
                else if (repeating && $util.isUnit(match[2])) {
                    item.offset = $util.formatPercent(parseFloat(node.convertPX(match[2], horizontal, false)) / (horizontal ? node.bounds.width : node.bounds.height), false);
                }
            }
            result.push(item);
        }
    }
    const lastStop = result[result.length - 1];
    if (lastStop.offset === '') {
        lastStop.offset = conic ? '360' : '100%';
    }
    let percent = 0;
    for (let i = 0; i < result.length; i++) {
        const item = result[i];
        if (item.offset === '') {
            if (i === 0) {
                item.offset = '0';
            }
            else {
                for (let j = i + 1, k = 2; j < result.length - 1; j++, k++) {
                    if (result[j].offset !== '') {
                        item.offset = ((percent + parseFloat(result[j].offset)) / k).toString();
                        break;
                    }
                }
                if (item.offset === '') {
                    item.offset = (percent + parseFloat(lastStop.offset) / (result.length - 1)).toString();
                }
            }
            if (!conic) {
                item.offset += '%';
            }
        }
        percent = parseFloat(item.offset);
    }
    if (repeating) {
        if (percent < 100) {
            const original = result.slice(0);
            complete: {
                let basePercent = percent;
                while (percent < 100) {
                    for (let i = 0; i < original.length; i++) {
                        percent = Math.min(basePercent + parseFloat(original[i].offset), 100);
                        result.push({ ...original[i], offset: `${percent}%` });
                        if (percent === 100) {
                            break complete;
                        }
                    }
                    basePercent = percent;
                }
            }
        }
    }
    else {
        if (conic && percent < 360 || !conic && percent < 100) {
            const colorFill = Object.assign({}, result[result.length - 1]);
            colorFill.offset = conic ? '360' : '100%';
            result.push(colorFill);
        }
    }
    return result;
}

function parseAngle(value: string | undefined) {
    if (value) {
        const match = new RegExp($util.REGEXP_STRING.DEGREE).exec(value.trim());
        if (match) {
            return $util.convertAngle(match[1], match[2]) % 360;
        }
    }
    return 0;
}

function replaceWhiteSpace<T extends Node>(node: T, value: string): [string, boolean] {
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
            value = value.replace(/\n/g, '\\n').replace(/\s/g, '&#160;');
            break;
        case 'pre-line':
            value = value.replace(/\n/g, '\\n').replace(/\s+/g, ' ');
            break;
        default:
            const element = node.element;
            if (element) {
                if ($dom.isLineBreak(<Element> element.previousSibling)) {
                    value = value.replace(/^\s+/, '');
                }
                if ($dom.isLineBreak(<Element> element.nextSibling)) {
                    value = value.replace(/\s+$/, '');
                }
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
        return !!border && !(
            border.style === 'none' ||
            border.width === '0px' ||
            border.color === '' ||
            border.color.length === 9 && border.color.endsWith('00')
        );
    }

    public static hasDrawableBackground(object: BoxStyle | undefined) {
        return !!object && (
            this.isBorderVisible(object.borderTop) ||
            this.isBorderVisible(object.borderRight) ||
            this.isBorderVisible(object.borderBottom) ||
            this.isBorderVisible(object.borderLeft) ||
            !!object.backgroundImage ||
            !!object.borderRadius ||
            !!object.backgroundGradient
        );
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
                const boxStyle: Nullable<BoxStyle> = {
                    background: null,
                    borderTop: null,
                    borderRight: null,
                    borderBottom: null,
                    borderLeft: null,
                    borderRadius: null,
                    backgroundColor: null,
                    backgroundSize: null,
                    backgroundImage: null,
                    backgroundRepeat: null,
                    backgroundPositionX: null,
                    backgroundPositionY: null
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
                                    borderColor = $dom.cssInheritStyle(node.element, `${attr}Color`);
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
                            if (!node.has('backgroundColor') && (value === node.cssAscend('backgroundColor', false, true) || node.documentParent.visible && $dom.cssFromParent(node.element, 'backgroundColor'))) {
                                boxStyle.backgroundColor = '';
                            }
                            else {
                                const color = $color.parseColor(value, node.css('opacity'));
                                boxStyle.backgroundColor = color ? color.valueAsRGBA : '';
                            }
                            break;
                        case 'background':
                        case 'backgroundImage':
                            if (value !== 'none' && !node.hasBit('excludeResource', NODE_RESOURCE.IMAGE_SOURCE)) {
                                const gradients: Gradient[] = [];
                                const opacity = node.css('opacity');
                                let pattern = new RegExp(`(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner)?(?:\\s*at [\\w %]+)?),?\\s*(${REGEXP_COLORSTOP}+)\\)`, 'g');
                                let match: RegExpExecArray | null;
                                while ((match = pattern.exec(value)) !== null) {
                                    const repeating = match[1] === 'repeating';
                                    let gradient!: Gradient;
                                    switch (match[2]) {
                                        case 'linear': {
                                            if (!match[3]) {
                                                match[3] = 'to bottom';
                                            }
                                            let angle: number;
                                            switch (match[3]) {
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
                                                    angle = 180;
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
                                                    angle = parseAngle(match[3]);
                                                    break;
                                            }
                                            const horizontal = angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315;
                                            gradient = <LinearGradient> {
                                                type: match[2],
                                                angle,
                                                horizontal,
                                                colorStops: parseColorStops(node, match[2], match[4], opacity, repeating, horizontal)
                                            };
                                            break;
                                        }
                                        case 'radial': {
                                            const horizontal = node.bounds.width <= node.bounds.height;
                                            gradient = <RadialGradient> {
                                                type: match[2],
                                                position: (() => {
                                                    const result = ['center', 'ellipse'];
                                                    if (match[3]) {
                                                        const position = REGEXP_POSITION.exec(match[3]);
                                                        if (position) {
                                                            if (position[1]) {
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
                                                            }
                                                            if (position[2]) {
                                                                result[0] = position[2];
                                                            }
                                                        }
                                                    }
                                                    return result;
                                                })(),
                                                horizontal,
                                                colorStops: parseColorStops(node, match[2], match[4], opacity, repeating, horizontal)
                                            };
                                            break;
                                        }
                                        case 'conic': {
                                            gradient = <ConicGradient> {
                                                type: match[2],
                                                angle: parseAngle(match[3]),
                                                position: (() => {
                                                    if (match[3]) {
                                                        const position = REGEXP_POSITION.exec(match[3]);
                                                        if (position) {
                                                            return [position[2]];
                                                        }
                                                    }
                                                    return ['center'];
                                                })(),
                                                colorStops: parseColorStops(node, match[2], match[4], opacity)
                                            };
                                            break;
                                        }
                                    }
                                    if (gradient.colorStops.length > 1) {
                                        gradients.push(gradient);
                                    }
                                }
                                if (gradients.length) {
                                    boxStyle.backgroundGradient = gradients;
                                }
                                else {
                                    const images: string[] = [];
                                    pattern = new RegExp($util.REGEXP_PATTERN.URL, 'g');
                                    while ((match = pattern.exec(value)) !== null) {
                                        images.push(match[0]);
                                    }
                                    if (images.length) {
                                        boxStyle.backgroundImage = images;
                                    }
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
                let backgroundColor: ColorData | undefined;
                if (!(backgroundImage ||
                    node.css('backgroundColor') === node.cssAscend('backgroundColor', false, true) && (node.plainText || node.style.backgroundColor !== node.cssInitial('backgroundColor')) ||
                    node.documentParent.visible && !node.has('backgroundColor') && $dom.cssFromParent(node.element, 'backgroundColor')))
                {
                    backgroundColor = $color.parseColor(node.css('backgroundColor'), opacity);
                }
                let fontFamily = node.css('fontFamily');
                let fontSize = node.css('fontSize');
                let fontWeight = node.css('fontWeight');
                if ($dom.isUserAgent($dom.USER_AGENT.EDGE) && !node.has('fontFamily')) {
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
                    color: color ? color.valueAsRGBA : '',
                    backgroundColor: backgroundColor ? backgroundColor.valueAsRGBA : ''
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
                if (element.tagName === 'INPUT') {
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
                }
                else if (element.tagName === 'TEXTAREA') {
                    value = element.value.trim();
                }
                else if (node.htmlElement) {
                    if (element.tagName === 'BUTTON') {
                        value = element.innerText;
                    }
                    else if (node.inlineText) {
                        name = node.textContent.trim();
                        if (element.tagName === 'CODE') {
                            value = $xml.replaceEntity(replaceExcluded(element, 'innerHTML'));
                        }
                        else if ($dom.hasLineBreak(element, true)) {
                            value = $xml.replaceEntity(replaceExcluded(element, 'innerHTML'))
                                .replace(/\s*<br[^>]*>\s*/g, '\\n')
                                .replace(/(<([^>]+)>)/ig, '');
                        }
                        else {
                            value = $xml.replaceEntity(replaceExcluded(element, 'textContent'));
                        }
                        [value, inlineTrim] = replaceWhiteSpace(node, value);
                    }
                    else if (element.innerText.trim() === '' && Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'))) {
                        value = $xml.replaceEntity(element.innerText);
                        performTrim = false;
                    }
                }
                else if (node.plainText) {
                    name = node.textContent.trim();
                    value = $xml.replaceEntity(node.textContent);
                    value = value.replace(/&[A-Za-z]+;/g, match => match.replace('&', '&amp;'));
                    [value, inlineTrim] = replaceWhiteSpace(node, value);
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
                                value = value.replace(/^\s+/,
                                    previousSibling && (
                                        previousSibling.block ||
                                        previousSibling.lineBreak ||
                                        previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                        node.multiline && $dom.hasLineBreak(element)
                                    ) ? '' : '&#160;'
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