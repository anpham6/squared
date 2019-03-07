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
const $utilS = $SvgBuild && squared.svg.lib.util;

const STORED = <ResourceStoredMapAndroid> $Resource.STORED;

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

const getRadiusPercent = (value: string) => $util.isPercent(value) ? parseInt(value) / 100 : 0.5;

export default class Resource<T extends View> extends squared.base.Resource<T> implements android.base.Resource<T> {
    public static createBackgroundGradient<T extends View>(gradient: Gradient, node?: T, path?: SvgPath, precision?: number) {
        const result: BackgroundGradient = {
            type: gradient.type,
            colorStops: []
        };
        let hasStop = true;
        if (node && gradient.type !== 'linear' && (gradient.colorStops.length === 2 || gradient.colorStops.length === 3 && gradient.colorStops[1].offset === 0.5) && gradient.colorStops[0].offset <= 0 && gradient.colorStops[gradient.colorStops.length - 1].offset === 1) {
            result.startColor = Resource.addColor(gradient.colorStops[0].color, true);
            result.endColor = Resource.addColor(gradient.colorStops[gradient.colorStops.length - 1].color, true);
            if (gradient.colorStops.length === 3) {
                result.centerColor = Resource.addColor(gradient.colorStops[1].color, true);
            }
            hasStop = false;
        }
        switch (gradient.type) {
            case 'radial': {
                if (path && $SvgBuild) {
                    const radial = <SvgRadialGradient> gradient;
                    const points: Point[] = [];
                    let cx!: number;
                    let cy!: number;
                    let cxDiameter!: number;
                    let cyDiameter!: number;
                    switch (path.element.tagName) {
                        case 'path':
                            for (const command of $SvgBuild.getPathCommands(path.value)) {
                                $util.concatArray(points, command.value);
                            }
                        case 'polygon':
                            if ($utilS.SVG.polygon(path.element)) {
                                $util.concatArray(points, $SvgBuild.clonePoints(path.element.points));
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
                                return undefined;
                            }
                            break;
                    }
                    result.centerX = (cx + cxDiameter * getRadiusPercent(radial.cxAsString)).toString();
                    result.centerY = (cy + cyDiameter * getRadiusPercent(radial.cyAsString)).toString();
                    result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($util.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
                    if (radial.spreadMethod) {
                        result.tileMode = getTileMode(radial.spreadMethod);
                    }
                }
                else if (node) {
                    const position = $dom.getBackgroundPosition((<RadialGradient> gradient).position[0], node.bounds, node.fontSize, true, !hasStop);
                    if (hasStop) {
                        result.gradientRadius = node.bounds.width.toString();
                        result.centerX = position.left.toString();
                        result.centerY = position.top.toString();
                    }
                    else {
                        result.gradientRadius = $util.formatPX(node.bounds.width);
                        result.centerX = $util.formatPercent(position.left * 100);
                        result.centerY = $util.formatPercent(position.top * 100);
                    }
                }
                break;
            }
            case 'linear': {
                if (path && $SvgBuild) {
                    const linear = <SvgLinearGradient> gradient;
                    result.startX = linear.x1.toString();
                    result.startY = linear.y1.toString();
                    result.endX = linear.x2.toString();
                    result.endY = linear.y2.toString();
                    if (linear.spreadMethod) {
                        result.tileMode = getTileMode(linear.spreadMethod);
                    }
                }
                else if (node) {
                    const linear = <LinearGradient> gradient;
                    const angle = linear.angle;
                    let width: number;
                    let height: number;
                    if (linear.dimension) {
                        width = linear.dimension.width;
                        height = linear.dimension.height;
                    }
                    else {
                        width = Math.round(node.bounds.width);
                        height = Math.round(node.bounds.height);
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
                }
                break;
            }
            case 'conic': {
                if (node) {
                    result.type = 'sweep';
                    const position = $dom.getBackgroundPosition((<ConicGradient> gradient).position[0], <DOMRect> { width: node.bounds.width * 2, height: node.bounds.height * 2 }, node.fontSize, true, !hasStop);
                    if (hasStop) {
                        result.centerX = position.left.toString();
                        result.centerY = position.top.toString();
                    }
                    else {
                        result.centerX = $util.formatPercent(position.left * 100);
                        result.centerY = $util.formatPercent(position.top * 100);
                    }
                }
                else {
                    return undefined;
                }
                break;
            }
        }
        if (hasStop) {
            let offset = 0;
            for (let i = 0; i < gradient.colorStops.length; i++) {
                const stop = gradient.colorStops[i];
                const color = `@color/${Resource.addColor(stop.color, true)}`;
                offset = Math.max(stop.offset, offset);
                if (i === 0 && offset > 0) {
                    result.colorStops.push({
                        color,
                        offset: '0'
                    });
                }
                result.colorStops.push({
                    color,
                    offset: $math.truncate(offset)
                });
            }
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
                                if ($util.REGEXP_PATTERN.URI.test(value)) {
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
            for (const value of srcset.split($util.REGEXP_PATTERN.SEPARATOR)) {
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
        value = $dom.resolveURL(value) || $util.resolvePath(value);
        return value !== '' ? this.addImage({ mdpi: value }, prefix) : '';
    }

    public static addColor(value: ColorData | string | undefined, transparency = false) {
        if (typeof value === 'string') {
            value = $color.parseColor(value, undefined, transparency);
        }
        if (value && (value.valueAsRGBA !== '#00000000' || transparency)) {
            const argb = value.opaque ? value.valueAsARGB : value.valueAsRGB;
            let name = STORED.colors.get(argb);
            if (name) {
                return name;
            }
            const shade = $color.findColorShade(value.valueAsRGB);
            if (shade) {
                shade.name = $util.convertUnderscore(shade.name);
                if (!value.opaque && shade.value === value.valueAsRGB) {
                    name = shade.name;
                }
                else {
                    name = Resource.generateId('color', shade.name);
                }
                STORED.colors.set(argb, name);
                return name;
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