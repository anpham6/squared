import { ResourceAssetMap, ResourceStoredMap, SessionData, UserSettings } from './@types/application';
import { LinearGradient, RadialGradient } from './@types/node';

import { NODE_RESOURCE } from './lib/enumeration';

import Application from './application';
import File from './file';
import Node from './node';
import NodeList from './nodelist';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

function colorStop(parse: boolean) {
    return `${parse ? '' : '(?:'},?\\s*(${parse ? '' : '?:'}rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|[a-z]+)\\s*(${parse ? '' : '?:'}\\d+%)?${parse ? '' : ')'}`;
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

    public static generateId(section: string, name: string, start: number) {
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

    public static getStoredName(asset: string, value: any) {
        const stored: Map<string, any> = Resource.STORED[asset];
        if (stored) {
            for (const [name, data] of Resource.STORED[asset].entries()) {
                if (JSON.stringify(value) === JSON.stringify(data)) {
                    return name as string;
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
        for (const node of this.cache.elements) {
            const boxStyle: BoxStyle = {
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
            } as any;
            for (const attr in boxStyle) {
                const value = node.css(attr);
                switch (attr) {
                    case 'borderTop':
                    case 'borderRight':
                    case 'borderBottom':
                    case 'borderLeft': {
                        let cssColor = node.css(`${attr}Color`);
                        switch (cssColor.toLowerCase()) {
                            case 'initial':
                                cssColor = '#000000';
                                break;
                            case 'inherit':
                            case 'currentcolor':
                                cssColor = $dom.cssInherit(node.element, `${attr}Color`);
                                break;
                        }
                        let width = node.css(`${attr}Width`) || '1px';
                        const style = node.css(`${attr}Style`) || 'none';
                        if (style === 'inset' && width === '0px') {
                            width = '1px';
                        }
                        const color = $color.parseRGBA(cssColor, node.css('opacity'));
                        boxStyle[attr] = <BorderAttribute> {
                            width,
                            style,
                            color: style !== 'none' && color ? color.valueRGBA : ''
                        };
                        break;
                    }
                    case 'borderRadius': {
                        const [top, right, bottom, left] = [
                            node.css('borderTopLeftRadius'),
                            node.css('borderTopRightRadius'),
                            node.css('borderBottomLeftRadius'),
                            node.css('borderBottomRightRadius')
                        ];
                        if (top === right && right === bottom && bottom === left) {
                            boxStyle.borderRadius = $util.convertInt(top) === 0 ? undefined : [top];
                        }
                        else {
                            boxStyle.borderRadius = [top, right, bottom, left];
                        }
                        break;
                    }
                    case 'backgroundColor': {
                        if (!node.has('backgroundColor') && (value === node.cssParent('backgroundColor', false, true) || node.documentParent.visible && $dom.cssFromParent(node.element, 'backgroundColor'))) {
                            boxStyle.backgroundColor = '';
                        }
                        else {
                            const color = $color.parseRGBA(value, node.css('opacity'));
                            boxStyle.backgroundColor = color ? color.valueRGBA : '';
                        }
                        break;
                    }
                    case 'background':
                    case 'backgroundImage': {
                        if (value !== 'none' && !node.hasBit('excludeResource', NODE_RESOURCE.IMAGE_SOURCE)) {
                            const gradients: Gradient[] = [];
                            let pattern = new RegExp(`([a-z\-]+)-gradient\\(([\\w\\s%]+)?(${colorStop(false)}+)\\)`, 'g');
                            let match: RegExpExecArray | null;
                            while ((match = pattern.exec(value)) !== null) {
                                let gradient: Gradient;
                                if (match[1] === 'linear') {
                                    if (!/^to/.test(match[2]) && !/deg$/.test(match[2])) {
                                        match[3] = match[2] + match[3];
                                        match[2] = '180deg';
                                    }
                                    gradient = <LinearGradient> {
                                        type: 'linear',
                                        angle: (() => {
                                            switch (match[2]) {
                                                case 'to top':
                                                    return 0;
                                                case 'to right top':
                                                    return 45;
                                                case 'to right':
                                                    return 90;
                                                case 'to right bottom':
                                                    return 135;
                                                case 'to bottom':
                                                    return 180;
                                                case 'to left bottom':
                                                    return 225;
                                                case 'to left':
                                                    return 270;
                                                case 'to left top':
                                                    return 315;
                                                default:
                                                    return $util.convertInt(match[2]);
                                            }
                                        })(),
                                        colorStop: []
                                    };
                                }
                                else {
                                    gradient = <RadialGradient> {
                                        type: 'radial',
                                        position: (() => {
                                            const result = ['ellipse', 'center'];
                                            if (match[2]) {
                                                const shape = match[2].split('at').map(item => item.trim());
                                                switch (shape[0]) {
                                                    case 'ellipse':
                                                    case 'circle':
                                                    case 'closest-side':
                                                    case 'closest-corner':
                                                    case 'farthest-side':
                                                    case 'farthest-corner':
                                                        result[0] = shape[0];
                                                        break;
                                                    default:
                                                        result[1] = shape[0];
                                                        break;
                                                }
                                                if (shape[1]) {
                                                    result[1] = shape[1];
                                                }
                                            }
                                            return result;
                                        })(),
                                        colorStop: []
                                    };
                                }
                                const stopMatch = match[3].trim().split(new RegExp(colorStop(true), 'g'));
                                const opacity = node.css('opacity');
                                for (let i = 0; i < stopMatch.length; i += 3) {
                                    const rgba = stopMatch[i + 1];
                                    if (rgba) {
                                        const color = $color.parseRGBA(rgba, opacity);
                                        if (color && color.visible) {
                                            gradient.colorStop.push({
                                                color: color.valueRGBA,
                                                offset: stopMatch[i + 2] || '0%',
                                                opacity: color.alpha
                                            });
                                        }
                                    }
                                }
                                if (gradient.colorStop.length > 1) {
                                    gradients.push(gradient);
                                }
                            }
                            if (gradients.length) {
                                boxStyle.backgroundGradient = gradients;
                            }
                            else {
                                const images: string[] = [];
                                pattern = new RegExp($util.REGEX_PATTERN.CSS_URL, 'g');
                                match = null;
                                while ((match = pattern.exec(value)) !== null) {
                                    if (match) {
                                        images.push(match[0]);
                                    }
                                }
                                if (images.length) {
                                    boxStyle.backgroundImage = images;
                                }
                            }
                        }
                        break;
                    }
                    case 'backgroundSize':
                    case 'backgroundRepeat':
                    case 'backgroundPositionX':
                    case 'backgroundPositionY': {
                        boxStyle[attr] = value;
                        break;
                    }
                }
            }
            const borderTop = JSON.stringify(boxStyle.borderTop);
            if (borderTop === JSON.stringify(boxStyle.borderRight) && borderTop === JSON.stringify(boxStyle.borderBottom) && borderTop === JSON.stringify(boxStyle.borderLeft)) {
                boxStyle.border = boxStyle.borderTop;
            }
            node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
        }
    }

    public setFontStyle() {
        for (const node of this.cache) {
            const backgroundImage = Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'));
            if (!(node.renderChildren.length ||
                !node.element ||
                node.imageElement ||
                node.svgElement ||
                node.tagName === 'HR' ||
                node.inlineText && !backgroundImage && !node.preserveWhiteSpace && node.element.innerHTML.trim() === ''))
            {
                const opacity = node.css('opacity');
                const color = $color.parseRGBA(node.css('color'), opacity);
                let backgroundColor: ColorData | null;
                if (backgroundImage ||
                    node.cssParent('backgroundColor', false, true) === node.css('backgroundColor') && (node.plainText || node.style.backgroundColor !== node.cssInitial('backgroundColor')) ||
                    !node.has('backgroundColor') && node.documentParent.visible && $dom.cssFromParent(node.element, 'backgroundColor'))
                {
                    backgroundColor = null;
                }
                else {
                    backgroundColor = $color.parseRGBA(node.css('backgroundColor'), opacity);
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
                    color: color ? color.valueRGBA : '',
                    backgroundColor: backgroundColor ? backgroundColor.valueRGBA : ''
                };
                node.data(Resource.KEY_NAME, 'fontStyle', result);
            }
        }
    }

    public setValueString() {
        function replaceWhiteSpace(node: T, value: string): [string, boolean] {
            const renderParent = node.renderParent;
            if (node.multiLine && renderParent && !renderParent.layoutVertical) {
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
                    value = value.replace(/\n/g, '\\n');
                    value = value.replace(/\s/g, '&#160;');
                    break;
                case 'pre-line':
                    value = value.replace(/\n/g, '\\n');
                    value = value.replace(/\s+/g, ' ');
                    break;
                default:
                    const element = node.element;
                    if (element) {
                        if (element.previousSibling && $dom.isLineBreak(<Element> element.previousSibling)) {
                            value = value.replace(/^\s+/, '');
                        }
                        if (element.nextSibling && $dom.isLineBreak(<Element> element.nextSibling)) {
                            value = value.replace(/\s+$/, '');
                        }
                    }
                    return [value, false];
            }
            return [value, true];
        }
        for (const node of this.cache.visible) {
            const element = node.element;
            if (element) {
                let name = '';
                let value = '';
                let inlineTrim = false;
                let performTrim = true;
                if (element instanceof HTMLInputElement) {
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
                else if (element instanceof HTMLTextAreaElement) {
                    value = element.value.trim();
                }
                else if (element instanceof HTMLElement) {
                    if (element.tagName === 'BUTTON') {
                        value = element.innerText;
                    }
                    else if (node.inlineText) {
                        name = node.textContent.trim();
                        if (element.tagName === 'CODE') {
                            value = $xml.replaceEntity(element.innerHTML);
                        }
                        else if ($dom.hasLineBreak(element, true)) {
                            value = $xml.replaceEntity(element.innerHTML);
                            value = value.replace(/\s*<br[^>]*>\s*/g, '\\n');
                            value = value.replace(/(<([^>]+)>)/ig, '');
                        }
                        else {
                            value = $xml.replaceEntity(node.textContent);
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
                        if (previousSibling === undefined || previousSibling.multiLine || previousSibling.lineBreak || previousSibling.plainText && /\s+$/.test(previousSibling.textContent)) {
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
                                value = value + '&#160;';
                            }
                        }
                        else {
                            if (!/^\s+$/.test(value)) {
                                value = value.replace(/^\s+/,
                                    previousSibling && (
                                        previousSibling.block ||
                                        previousSibling.lineBreak ||
                                        previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                        node.multiLine && $dom.hasLineBreak(element)
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