import { UserSettingsAndroid } from './types/application';
import { BackgroundGradient } from './template/resource/types/data';

import { EXT_ANDROID, RESERVED_JAVA } from './lib/constant';

import View from './view';

import $color = squared.lib.color;
import $dom = squared.lib.dom;
import $util = squared.lib.util;
import $xml = squared.lib.xml;

type ThemeTemplate = {
    output: {
        path: string;
        file: string;
    }
    items?: StringMap
};

function getHexARGB(value: ColorData | null) {
    return value ? (value.opaque ? value.valueARGB : value.valueRGB) : '';
}

function getRadiusPercent(value: string) {
    return $util.isPercent(value) ? parseInt(value) / 100 : 0.5;
}

export default class Resource<T extends View> extends squared.base.Resource<T> implements android.base.Resource<T> {
    public static createBackgroundGradient<T extends View>(node: T, gradients: Gradient[], svgPath?: squared.svg.SvgPath) {
        const result: BackgroundGradient[] = [];
        const hasStop = node.svgElement || gradients.some(item => item.colorStop.filter(stop => parseInt(stop.offset) > 0).length > 0);
        for (const item of gradients) {
            const gradient: BackgroundGradient = {
                type: item.type,
                startColor: !hasStop ? Resource.addColor(item.colorStop[0].color) : '',
                centerColor: !hasStop && item.colorStop.length > 2 ? Resource.addColor(item.colorStop[1].color) : '',
                endColor: !hasStop ? Resource.addColor(item.colorStop[item.colorStop.length - 1].color) : '',
                colorStop: []
            };
            switch (item.type) {
                case 'radial':
                    if (node.svgElement) {
                        if (svgPath && squared.svg.SvgBuild) {
                            const radial = <SvgRadialGradient> item;
                            const mapPoint: Point[] = [];
                            let cx: number | undefined;
                            let cy: number | undefined;
                            let cxDiameter: number | undefined;
                            let cyDiameter: number | undefined;
                            switch (svgPath.element.tagName) {
                                case 'path': {
                                    squared.svg.SvgBuild.toPathCommandList(svgPath.d).forEach(path => mapPoint.push(...path.points));
                                    if (!mapPoint.length) {
                                        break;
                                    }
                                }
                                case 'polygon': {
                                    if (svgPath.element instanceof SVGPolygonElement) {
                                        mapPoint.push(...squared.svg.SvgBuild.toPointList(svgPath.element.points));
                                    }
                                    cx = $util.minArray(mapPoint.map(pt => pt.x));
                                    cy = $util.minArray(mapPoint.map(pt => pt.y));
                                    cxDiameter = $util.maxArray(mapPoint.map(pt => pt.x)) - cx;
                                    cyDiameter = $util.maxArray(mapPoint.map(pt => pt.y)) - cy;
                                    break;
                                }
                                case 'rect': {
                                    const rect = <SVGRectElement> svgPath.element;
                                    cx = rect.x.baseVal.value;
                                    cy = rect.y.baseVal.value;
                                    cxDiameter = rect.width.baseVal.value;
                                    cyDiameter = rect.height.baseVal.value;
                                    break;
                                }
                                case 'circle': {
                                    const circle = <SVGCircleElement> svgPath.element;
                                    cx = circle.cx.baseVal.value - circle.r.baseVal.value;
                                    cy = circle.cy.baseVal.value - circle.r.baseVal.value;
                                    cxDiameter = circle.r.baseVal.value * 2;
                                    cyDiameter = cxDiameter;
                                    break;
                                }
                                case 'ellipse': {
                                    const ellipse = <SVGEllipseElement> svgPath.element;
                                    cx = ellipse.cx.baseVal.value - ellipse.rx.baseVal.value;
                                    cy = ellipse.cy.baseVal.value - ellipse.ry.baseVal.value;
                                    cxDiameter = ellipse.rx.baseVal.value * 2;
                                    cyDiameter = ellipse.ry.baseVal.value * 2;
                                    break;
                                }
                            }
                            if (cx !== undefined && cy !== undefined && cxDiameter !== undefined && cyDiameter !== undefined) {
                                const cxPercent = getRadiusPercent(radial.cxAsString);
                                const cyPercent = getRadiusPercent(radial.cyAsString);
                                gradient.centerX = (cx + cxDiameter * cxPercent).toString();
                                gradient.centerY = (cy + cyDiameter * cyPercent).toString();
                                gradient.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($util.isPercent(radial.rAsString) ? (parseInt(radial.rAsString) / 100) : 1)).toString();
                            }
                        }
                    }
                    else {
                        const radial = <RadialGradient> item;
                        let boxPosition: RectPosition | undefined;
                        if (radial.shapePosition && radial.shapePosition.length > 1) {
                            boxPosition = $dom.getBackgroundPosition(radial.shapePosition[1], node.bounds, node.dpi, node.fontSize, true, !hasStop);
                        }
                        if (hasStop) {
                            gradient.gradientRadius = node.bounds.width.toString();
                            if (boxPosition) {
                                gradient.centerX = boxPosition.left.toString();
                                gradient.centerY = boxPosition.top.toString();
                            }
                        }
                        else {
                            gradient.gradientRadius = $util.formatPX(node.bounds.width);
                            if (boxPosition) {
                                gradient.centerX = $util.convertPercent(boxPosition.left);
                                gradient.centerY = $util.convertPercent(boxPosition.top);
                            }
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
                    }
                    else {
                        const linear = <LinearGradient> item;
                        if (linear.angle !== undefined) {
                            if (hasStop) {
                                const x = Math.round(node.bounds.width / 2);
                                const y = Math.round(node.bounds.height / 2);
                                const util = squared.svg.lib.util;
                                if (util) {
                                    gradient.startX = Math.round(util.getRadiusX(linear.angle + 180, x) + x).toString();
                                    gradient.startY = Math.round(util.getRadiusY(linear.angle + 180, y) + y).toString();
                                    gradient.endX = Math.round(util.getRadiusX(linear.angle, x) + x).toString();
                                    gradient.endY = Math.round(util.getRadiusY(linear.angle, y) + y).toString();
                                }
                            }
                            else {
                                gradient.angle = (Math.floor(linear.angle / 45) * 45).toString();
                            }
                        }
                    }
                    break;
            }
            if (hasStop) {
                for (let i = 0; i < item.colorStop.length; i++) {
                    const stop = item.colorStop[i];
                    const color = `@color/${Resource.addColor(stop.color)}`;
                    let offset = parseInt(stop.offset);
                    if (i === 0) {
                        if (!node.svgElement && offset !== 0) {
                            gradient.colorStop.push({
                                color,
                                offset: '0',
                                opacity: stop.opacity
                            });
                        }
                    }
                    else if (offset === 0) {
                        if (i < item.colorStop.length - 1) {
                            offset = Math.round((parseInt(item.colorStop[i - 1].offset) + parseInt(item.colorStop[i + 1].offset)) / 2);
                        }
                        else {
                            offset = 100;
                        }
                    }
                    gradient.colorStop.push({
                        color,
                        offset: (offset / 100).toFixed(2),
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
                                    if ($util.REGEX_PATTERN.URI.test(value)) {
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
        let numberArray: string[] | null = [];
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
                        numberArray = null;
                        continue;
                    }
                    if (value !== '') {
                        stringArray.push($xml.replaceEntity(value));
                    }
                }
            }
        }
        return [stringArray.length ? stringArray : null, numberArray && numberArray.length ? numberArray : null];
    }

    public static addString(value: string, name = '', numberAlias = false) {
        if (value !== '') {
            if (name === '') {
                name = value.trim();
            }
            const numeric = $util.isNumber(value);
            if (!numeric || numberAlias) {
                for (const [resourceName, resourceValue] of Resource.STORED.strings.entries()) {
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
                if (Resource.STORED.strings.has(name)) {
                    name = Resource.generateId('string', name, 1);
                }
                Resource.STORED.strings.set(name, value);
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
            srcset.split(',').forEach(value => {
                const match = /^(.*?)\s*(\d+\.?\d*x)?$/.exec(value.trim());
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
            });
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

    public static addColor(value: ColorData | string | null) {
        if (typeof value === 'string') {
            value = $color.parseRGBA(value);
        }
        if (value && value.valueRGBA !== '#00000000') {
            const valueARGB = getHexARGB(value);
            let name = Resource.STORED.colors.get(valueARGB) || '';
            if (name === '') {
                const shade = $color.getColorByShade(value.valueRGB);
                if (shade) {
                    shade.name = $util.convertUnderscore(shade.name);
                    if (!value.opaque && shade.hex === value.valueRGB) {
                        name = shade.name;
                    }
                    else {
                        name = Resource.generateId('color', shade.name, 1);
                    }
                    Resource.STORED.colors.set(valueARGB, name);
                }
            }
            return name;
        }
        return '';
    }

    public addStyleTheme(template: string, data: ExternalData, options: ThemeTemplate) {
        if (options.items && $util.isArray(data.items)) {
            const items = Resource.formatOptions(options.items, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            for (const name in items) {
                data.items.push({
                    name,
                    value: items[name]
                });
            }
        }
        const xml = $xml.createTemplate($xml.parseTemplate(template), data);
        if (this.fileHandler) {
            this.fileHandler.addAsset(options.output.path, options.output.file, xml);
        }
    }

    get userSettings() {
        return this.application.userSettings as UserSettingsAndroid;
    }
}