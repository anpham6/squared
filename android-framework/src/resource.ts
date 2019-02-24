import { ConicGradient, LinearGradient, RadialGradient } from '../../src/base/@types/node';
import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from './@types/application';
import { BackgroundGradient } from './@types/node';
import { SvgLinearGradient, SvgRadialGradient } from '../../src/svg/@types/object';

import View from './view';

import { RESERVED_JAVA } from './lib/constant';

type SvgPath = squared.svg.SvgPath;

const $Resource = squared.base.Resource;
const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const $SvgBuild = squared.svg && squared.svg.SvgBuild;
const $utilS = squared.svg && squared.svg.lib && squared.svg.lib.util;

const STORED = <ResourceStoredMapAndroid> $Resource.STORED;

function getRadiusPercent(value: string) {
    return $util.isPercent(value) ? parseInt(value) / 100 : 0.5;
}

function getTileMode(value: number) {
    switch (value) {
        case SVGGradientElement.SVG_SPREADMETHOD_PAD:
            return 'clamp';
        case SVGGradientElement.SVG_SPREADMETHOD_REFLECT:
            return 'mirror';
        case SVGGradientElement.SVG_SPREADMETHOD_REPEAT:
            return 'repeat';
    }
    return '';
}

export default class Resource<T extends View> extends squared.base.Resource<T> implements android.base.Resource<T> {
    public static createBackgroundGradient<T extends View>(node: T, gradients: Gradient[], path?: SvgPath) {
        const result: BackgroundGradient[] = [];
        for (const item of gradients) {
            const gradient: BackgroundGradient = { type: item.type, colorStops: [] };
            let hasStop: boolean;
            if (!node.svgElement && parseFloat(item.colorStops[0].offset) === 0 && ['100%', '360'].includes(item.colorStops[item.colorStops.length - 1].offset) && (item.colorStops.length === 2 || item.colorStops.length === 3 && ['50%', '180'].includes(item.colorStops[1].offset))) {
                gradient.startColor = Resource.addColor(item.colorStops[0].color, true);
                gradient.endColor = Resource.addColor(item.colorStops[item.colorStops.length - 1].color, true);
                if (item.colorStops.length === 3) {
                    gradient.centerColor = Resource.addColor(item.colorStops[1].color, true);
                }
                hasStop = false;
            }
            else {
                hasStop = true;
            }
            switch (item.type) {
                case 'radial':
                    if (node.svgElement) {
                        if (path && $SvgBuild && $utilS) {
                            const radial = <SvgRadialGradient> item;
                            const points: Point[] = [];
                            let cx!: number;
                            let cy!: number;
                            let cxDiameter!: number;
                            let cyDiameter!: number;
                            switch (path.element.tagName) {
                                case 'path':
                                    for (const command of $SvgBuild.getPathCommands(path.value)) {
                                        points.push(...command.value);
                                    }
                                case 'polygon':
                                    if (path.element instanceof SVGPolygonElement) {
                                        points.push(...$SvgBuild.clonePoints(path.element.points));
                                    }
                                    if (!points.length) {
                                        break;
                                    }
                                    [cx, cy, cxDiameter, cyDiameter] = $SvgBuild.minMaxPoints(points);
                                    cxDiameter -= cx;
                                    cyDiameter -= cy;
                                    break;
                                default:
                                    if ($utilS.SVG.rect(path.element)) {
                                        const rect = path.element;
                                        cx = rect.x.baseVal.value;
                                        cy = rect.y.baseVal.value;
                                        cxDiameter = rect.width.baseVal.value;
                                        cyDiameter = rect.height.baseVal.value;
                                    }
                                    else if ($utilS.SVG.circle(path.element)) {
                                        const circle = path.element;
                                        cx = circle.cx.baseVal.value - circle.r.baseVal.value;
                                        cy = circle.cy.baseVal.value - circle.r.baseVal.value;
                                        cxDiameter = circle.r.baseVal.value * 2;
                                        cyDiameter = cxDiameter;
                                    }
                                    else if ($utilS.SVG.ellipse(path.element)) {
                                        const ellipse = path.element;
                                        cx = ellipse.cx.baseVal.value - ellipse.rx.baseVal.value;
                                        cy = ellipse.cy.baseVal.value - ellipse.ry.baseVal.value;
                                        cxDiameter = ellipse.rx.baseVal.value * 2;
                                        cyDiameter = ellipse.ry.baseVal.value * 2;
                                    }
                                    else {
                                        return result;
                                    }
                                    break;
                            }
                            gradient.centerX = (cx + cxDiameter * getRadiusPercent(radial.cxAsString)).toString();
                            gradient.centerY = (cy + cyDiameter * getRadiusPercent(radial.cyAsString)).toString();
                            gradient.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($util.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
                            if (radial.spreadMethod) {
                                gradient.tileMode = getTileMode(radial.spreadMethod);
                            }
                        }
                    }
                    else {
                        const position = $dom.getBackgroundPosition((<RadialGradient> item).position[0], node.bounds, node.fontSize, true, !hasStop);
                        if (hasStop) {
                            gradient.gradientRadius = node.bounds.width.toString();
                            gradient.centerX = position.left.toString();
                            gradient.centerY = position.top.toString();
                        }
                        else {
                            gradient.gradientRadius = $util.formatPX(node.bounds.width);
                            gradient.centerX = $util.convertPercent(position.left);
                            gradient.centerY = $util.convertPercent(position.top);
                        }
                    }
                    break;
                case 'linear':
                    if (node.svgElement) {
                        const linear = <SvgLinearGradient> item;
                        gradient.startX = linear.x1.toString();
                        gradient.startY = linear.y1.toString();
                        gradient.endX = linear.x2.toString();
                        gradient.endY = linear.y2.toString();
                        if (linear.spreadMethod) {
                            gradient.tileMode = getTileMode(linear.spreadMethod);
                        }
                    }
                    else {
                        const linear = <LinearGradient> item;
                        if (hasStop) {
                            const x = Math.round(node.bounds.width / 2);
                            const y = Math.round(node.bounds.height / 2);
                            gradient.startX = Math.round(x + $math.distanceFromX(x, linear.angle + 180)).toString();
                            gradient.startY = Math.round(y + $math.distanceFromY(y, linear.angle + 180)).toString();
                            gradient.endX = Math.round(x + $math.distanceFromX(x, linear.angle)).toString();
                            gradient.endY = Math.round(y + $math.distanceFromY(y, linear.angle)).toString();
                        }
                        else {
                            gradient.angle = (Math.floor(linear.angle / 45) * 45).toString();
                        }
                    }
                    break;
                case 'conic':
                    if (!node.svgElement) {
                        gradient.type = 'sweep';
                        const position = $dom.getBackgroundPosition((<ConicGradient> item).position[0], node.bounds, node.fontSize, true, !hasStop);
                        if (hasStop) {
                            gradient.centerX = position.left.toString();
                            gradient.centerY = position.top.toString();
                        }
                        else {
                            gradient.centerX = $util.convertPercent(position.left);
                            gradient.centerY = $util.convertPercent(position.top);
                        }
                        break;
                    }
                default:
                    return result;
            }
            if (hasStop) {
                for (let i = 0; i < item.colorStops.length; i++) {
                    const stop = item.colorStops[i];
                    const color = `@color/${Resource.addColor(stop.color, true)}`;
                    let offset = parseInt(stop.offset);
                    if (gradient.type === 'sweep') {
                        offset *= 100 / 360;
                    }
                    else if (!node.svgElement && i === 0 && offset !== 0) {
                        gradient.colorStops.push({
                            color,
                            offset: '0',
                            opacity: stop.opacity
                        });
                    }
                    gradient.colorStops.push({
                        color,
                        offset: $math.truncateRange(offset / 100),
                        opacity: stop.opacity
                    });
                }
            }
            result.push(gradient);
        }
        return result;
    }

    public static formatOptions(options: ExternalData, numberAlias = false) {
        for (const namespace in options) {
            if (options.hasOwnProperty(namespace)) {
                const obj: ExternalData = options[namespace];
                if (typeof obj === 'object') {
                    for (const attr in obj) {
                        if (obj.hasOwnProperty(attr)) {
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
                                    if ($util.REGEXP_PATTERN.URI.test(value)) {
                                        value = this.addImage({ mdpi: value });
                                        if (value !== '') {
                                            obj[attr] = `@drawable/${value}`;
                                            continue;
                                        }
                                    }
                                    break;
                            }
                            const color = $color.parseRGBA(value);
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
        }
        return options;
    }

    public static getOptionArray(element: HTMLSelectElement) {
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
                        stringArray.push($xml.replaceEntity(value));
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
                foundTheme: {
                    for (const data of STORED.themes.values()) {
                        for (const style of data.values()) {
                            if (style.name) {
                                appTheme = style.name;
                                break foundTheme;
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
            if (!stored.has(theme.name)) {
                stored.set(theme.name, theme);
            }
            else {
                const data = <StyleAttribute> stored.get(theme.name);
                for (const attr in theme.items) {
                    data.items[attr] = theme.items[attr];
                }
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
                name = name.toLowerCase()
                    .replace(/[^a-z\d]/g, '_')
                    .replace(/_+/g, '_')
                    .split('_')
                    .slice(0, 4)
                    .join('_')
                    .replace(/_+$/g, '');
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
            for (const value of srcset.split(',')) {
                const match = /^(.+?)\s*(\d+\.?\d*x)?$/.exec(value.trim());
                if (match) {
                    if (!$util.hasValue(match[2])) {
                        match[2] = '1x';
                    }
                    const src = filepath + $util.lastIndexOf(match[1]);
                    switch (match[2]) {
                        case '0.75x':
                            images.ldpi = src;
                            break;
                        case '1x':
                            images.mdpi = src;
                            break;
                        case '1.5x':
                            images.hdpi = src;
                            break;
                        case '2x':
                            images.xhdpi = src;
                            break;
                        case '3x':
                            images.xxhdpi = src;
                            break;
                        case '4x':
                            images.xxxhdpi = src;
                            break;
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
        if (images && images.mdpi) {
            src = $util.lastIndexOf(images.mdpi);
            const format = $util.lastIndexOf(src, '.').toLowerCase();
            src = src.replace(/.\w+$/, '').replace(/-/g, '_');
            switch (format) {
                case 'bmp':
                case 'cur':
                case 'gif':
                case 'ico':
                case 'jpg':
                case 'png':
                    src = Resource.insertStoredAsset('images', prefix + src, images);
                    break;
                default:
                    src = '';
                    break;
            }
        }
        return src;
    }

    public static addImageUrl(value: string, prefix = '') {
        const url = $dom.cssResolveUrl(value);
        if (url !== '') {
            return this.addImage({ mdpi: url }, prefix);
        }
        return '';
    }

    public static addColor(value: ColorData | string | undefined, transparency = false) {
        if (typeof value === 'string') {
            value = $color.parseRGBA(value, undefined, transparency);
        }
        if (value && (value.valueRGBA !== '#00000000' || transparency)) {
            const argb = value.opaque ? value.valueARGB : value.valueRGB;
            let name = STORED.colors.get(argb) || '';
            if (name === '') {
                const shade = $color.getColorByShade(value.valueRGB);
                if (shade) {
                    shade.name = $util.convertUnderscore(shade.name);
                    if (!value.opaque && shade.value === value.valueRGB) {
                        name = shade.name;
                    }
                    else {
                        name = Resource.generateId('color', shade.name);
                    }
                    STORED.colors.set(argb, name);
                }
            }
            return name;
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
        return this.application.userSettings as UserSettingsAndroid;
    }
}