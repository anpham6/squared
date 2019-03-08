import { ConicGradient, LinearGradient, RadialGradient } from '../../src/base/@types/node';
import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from './@types/application';

import View from './view';

import { RESERVED_JAVA } from './lib/constant';

const $Resource = squared.base.Resource;
const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const STORED = <ResourceStoredMapAndroid> $Resource.STORED;

type GradientColorStop = {
    color: string;
    offset: string;
};

export interface GradientTemplate {
    type: string;
    colorStops: GradientColorStop[] | false;
    startColor?: string;
    endColor?: string;
    centerColor?: string;
    angle?: string;
    startX?: string;
    startY?: string;
    endX?: string;
    endY?: string;
    centerX?: string;
    centerY?: string;
    gradientRadius?: string;
    tileMode?: string;
}

export default class Resource<T extends View> extends squared.base.Resource<T> implements android.base.Resource<T> {
    public static convertColorStops(list: ColorStop[], precision?: number) {
        const result: GradientColorStop[] = [];
        for (const stop of list) {
            const color = `@color/${Resource.addColor(stop.color, true)}`;
            result.push({
                color,
                offset: $math.truncate(stop.offset, precision)
            });
        }
        return result;
    }

    public static createBackgroundGradient(gradient: Gradient, precision?: number) {
        if (gradient.dimension === undefined) {
            return undefined;
        }
        const dimension = gradient.dimension;
        const result: GradientTemplate = {
            type: gradient.type,
            colorStops: false
        };
        let hasStop = true;
        if (gradient.type !== 'linear' && (gradient.colorStops.length === 2 || gradient.colorStops.length === 3 && gradient.colorStops[1].offset === 0.5) && gradient.colorStops[0].offset <= 0 && gradient.colorStops[gradient.colorStops.length - 1].offset === 1) {
            result.startColor = Resource.addColor(gradient.colorStops[0].color, true);
            result.endColor = Resource.addColor(gradient.colorStops[gradient.colorStops.length - 1].color, true);
            if (gradient.colorStops.length === 3) {
                result.centerColor = Resource.addColor(gradient.colorStops[1].color, true);
            }
            hasStop = false;
        }
        switch (gradient.type) {
            case 'radial': {
                const position = $dom.cssBackgroundPosition((<RadialGradient> gradient).position[0], dimension, gradient.fontSize, !hasStop);
                if (hasStop) {
                    result.gradientRadius = dimension.width.toString();
                    result.centerX = position.left.toString();
                    result.centerY = position.top.toString();
                }
                else {
                    result.gradientRadius = $util.formatPX(dimension.width);
                    result.centerX = $util.formatPercent(position.left * 100);
                    result.centerY = $util.formatPercent(position.top * 100);
                }
                break;
            }
            case 'linear': {
                const linear = <LinearGradient> gradient;
                const angle = linear.angle;
                let width: number;
                let height: number;
                if (linear.dimension) {
                    width = linear.dimension.width;
                    height = linear.dimension.height;
                }
                else {
                    width = Math.round(dimension.width);
                    height = Math.round(dimension.height);
                }
                let positionX = $math.offsetAngleX(angle, width);
                let positionY = $math.offsetAngleY(angle, height);
                if (!$math.isEqual(Math.abs(positionX), Math.abs(positionY))) {
                    let oppositeAngle: number;
                    if (angle <= 90) {
                        oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: width, y: 0 });
                    }
                    else if (angle <= 180) {
                        oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: width, y: height });
                    }
                    else if (angle <= 270) {
                        oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: -width, y: height });
                    }
                    else {
                        oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: -width, y: 0 });
                    }
                    let a = Math.abs(oppositeAngle - angle);
                    let b = 90 - a;
                    const lenX = $math.trianguleASA(a, b, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
                    positionX = $math.truncateFraction($math.offsetAngleX(angle, lenX[1]));
                    a = 90;
                    b = 90 - angle;
                    const lenY = $math.trianguleASA(a, b, positionX);
                    positionY = $math.truncateFraction($math.offsetAngleY(angle, lenY[0]));
                }
                if (angle <= 90) {
                    positionY += height;
                    result.startX = '0';
                    result.startY = height.toString();
                }
                else if (angle <= 180) {
                    result.startX = '0';
                    result.startY = '0';
                }
                else if (angle <= 270) {
                    positionX += width;
                    result.startX = width.toString();
                    result.startY = '0';
                }
                else {
                    positionX += width;
                    positionY += height;
                    result.startX = width.toString();
                    result.startY = height.toString();
                }
                result.endX = $math.truncate(positionX, precision);
                result.endY = $math.truncate(positionY, precision);
                break;
            }
            case 'conic': {
                result.type = 'sweep';
                const position = $dom.cssBackgroundPosition((<ConicGradient> gradient).position[0], <DOMRect> { width: dimension.width * 2, height: dimension.height * 2 }, gradient.fontSize, !hasStop);
                if (hasStop) {
                    result.centerX = position.left.toString();
                    result.centerY = position.top.toString();
                }
                else {
                    result.centerX = $util.formatPercent(position.left * 100);
                    result.centerY = $util.formatPercent(position.top * 100);
                }
                break;
            }
        }
        if (hasStop) {
            result.colorStops = Resource.convertColorStops(gradient.colorStops);
        }
        return result;
    }

    public static formatOptions(options: ExternalData, numberAlias = false) {
        for (const namespace in options) {
            if (options.hasOwnProperty(namespace)) {
                const obj: ExternalData = options[namespace];
                if (typeof obj === 'object') {
                    for (const attr in obj) {
                        let value = obj[attr].toString();
                        switch (attr) {
                            case 'text':
                                if (!value.startsWith('@string/')) {
                                    value = this.addString(value, '', numberAlias);
                                    if (value !== '') {
                                        obj[attr] = `@string/${value}`;
                                        continue;
                                    }
                                }
                                break;
                            case 'src':
                            case 'srcCompat':
                                if ($util.REGEXP_COMPILED.URI.test(value)) {
                                    value = this.addImage({ mdpi: value });
                                    if (value !== '') {
                                        obj[attr] = `@drawable/${value}`;
                                        continue;
                                    }
                                }
                                break;
                        }
                        const color = $color.parseColor(value);
                        if (color) {
                            const colorValue = this.addColor(color);
                            if (colorValue !== '') {
                                obj[attr] = `@color/${colorValue}`;
                            }
                        }
                    }
                }
            }
        }
        return options;
    }

    public static getOptionArray(element: HTMLSelectElement, replaceEntities = false) {
        const stringArray: string[] = [];
        let numberArray: string[] | undefined = [];
        let i = -1;
        while (++i < element.children.length) {
            const item = <HTMLOptionElement> element.children[i];
            const value = item.text.trim();
            if (value !== '') {
                if (numberArray && stringArray.length === 0 && $util.isNumber(value)) {
                    numberArray.push(value);
                }
                else {
                    if (numberArray && numberArray.length) {
                        i = -1;
                        numberArray = undefined;
                        continue;
                    }
                    if (value !== '') {
                        stringArray.push(replaceEntities ? $xml.replaceEntity(value) : value);
                    }
                }
            }
        }
        return [stringArray.length ? stringArray : undefined, numberArray && numberArray.length ? numberArray : undefined];
    }

    public static addTheme(...values: Required<StyleAttribute>[]) {
        for (const theme of values) {
            const path = $util.isString(theme.output.path) ? theme.output.path : '';
            const file = $util.isString(theme.output.file) ? theme.output.file : 'themes.xml';
            const filename = `${$util.trimString(path.trim(), '/')}/${$util.trimString(file.trim(), '/')}`;
            const stored = STORED.themes.get(filename) || new Map<string, StyleAttribute>();
            let appTheme = '';
            if (theme.name === '' || theme.name.charAt(0) === '.') {
                found: {
                    for (const data of STORED.themes.values()) {
                        for (const style of data.values()) {
                            if (style.name) {
                                appTheme = style.name;
                                break found;
                            }
                        }
                    }
                }
                if (appTheme === '') {
                    appTheme = 'AppTheme';
                }
            }
            else {
                appTheme = theme.name;
            }
            theme.name = appTheme + (theme.name.charAt(0) === '.' ? theme.name : '');
            Resource.formatOptions(theme.items);
            const storedTheme = <StyleAttribute> stored.get(theme.name);
            if (storedTheme) {
                for (const attr in theme.items) {
                    storedTheme.items[attr] = theme.items[attr];
                }
            }
            else {
                stored.set(theme.name, theme);
            }
            STORED.themes.set(filename, stored);
        }
    }

    public static addString(value: string, name = '', numberAlias = false) {
        if (value !== '') {
            if (name === '') {
                name = value.trim();
            }
            const numeric = $util.isNumber(value);
            if (!numeric || numberAlias) {
                for (const [resourceName, resourceValue] of STORED.strings.entries()) {
                    if (resourceValue === value) {
                        return resourceName;
                    }
                }
                const partial = name
                    .replace(/[^\w]/g, '_')
                    .replace(/^_+/, '')
                    .replace(/_+$/, '')
                    .split(/_+/);
                if (partial.length > 1) {
                    if (partial.length > 4) {
                        partial.length = 4;
                    }
                    name = partial.join('_');
                }
                else {
                    name = partial[0];
                }
                name = name.toLowerCase();
                if (numeric || /^\d/.test(name) || RESERVED_JAVA.includes(name)) {
                    name = `__${name}`;
                }
                else if (name === '') {
                    name = `__symbol${Math.ceil(Math.random() * 100000)}`;
                }
                if (STORED.strings.has(name)) {
                    name = Resource.generateId('string', name);
                }
                STORED.strings.set(name, value);
            }
            return name;
        }
        return '';
    }

    public static addImageSrcSet(element: HTMLImageElement, prefix = '') {
        const images: StringMap = {};
        const srcset = element.srcset.trim();
        if (srcset !== '') {
            const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
            for (const value of srcset.split($util.REGEXP_COMPILED.SEPARATOR)) {
                const match = /^(.+?)\s*(?:(\d*\.?\d*)x)?$/.exec(value.trim());
                if (match) {
                    if (!$util.hasValue(match[2])) {
                        match[2] = '1';
                    }
                    const src = filepath + $util.fromLastIndexOf(match[1]);
                    const size = parseFloat(match[2]);
                    if (size <= 0.75) {
                        images.ldpi = src;
                    }
                    else if (size <= 1) {
                        images.mdpi = src;
                    }
                    else if (size <= 1.5) {
                        images.hdpi = src;
                    }
                    else if (size <= 2) {
                        images.xhdpi = src;
                    }
                    else if (size <= 3) {
                        images.xxhdpi = src;
                    }
                    else {
                        images.xxxhdpi = src;
                    }
                }
            }
        }
        if (images.mdpi === undefined) {
            images.mdpi = element.src;
        }
        return this.addImage(images, prefix);
    }

    public static addImage(images: StringMap, prefix = '') {
        let src = '';
        if (images.mdpi) {
            src = $util.fromLastIndexOf(images.mdpi);
            const format = $util.fromLastIndexOf(src, '.').toLowerCase();
            switch (format) {
                case 'bmp':
                case 'cur':
                case 'gif':
                case 'ico':
                case 'jpg':
                case 'png':
                    src = Resource.insertStoredAsset('images', prefix + src.substring(0, src.length - format.length - 1).replace(/[^\w+]/g, '_'), images);
                    break;
                default:
                    src = '';
                    break;
            }
        }
        return src;
    }

    public static addImageUrl(value: string, prefix = '') {
        value = $dom.cssResolveURL(value) || $util.resolvePath(value);
        return value !== '' ? this.addImage({ mdpi: value }, prefix) : '';
    }

    public static addColor(color: ColorData | string | undefined, transparency = false) {
        if (typeof color === 'string') {
            color = $color.parseColor(color, undefined, transparency);
        }
        if (color && (!color.transparent || transparency)) {
            const keyName = color.opaque ? color.valueAsARGB : color.value;
            let colorName = STORED.colors.get(keyName);
            if (colorName) {
                return colorName;
            }
            const shade = $color.findColorShade(color.value);
            if (shade) {
                if (color.value === shade.value && !color.opaque) {
                    colorName = shade.name;
                }
                else {
                    colorName = Resource.generateId('color', shade.name);
                }
                STORED.colors.set(keyName, colorName);
                return colorName;
            }
        }
        return '';
    }

    constructor(application: squared.base.Application<T>, cache: squared.base.NodeList<T>) {
        super(application, cache);
        STORED.styles = new Map();
        STORED.themes = new Map();
        STORED.dimens = new Map();
        STORED.drawables = new Map();
        STORED.animators = new Map();
    }

    get userSettings() {
        return <UserSettingsAndroid> this.application.userSettings;
    }
}