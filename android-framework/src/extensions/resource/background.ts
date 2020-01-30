import { ResourceBackgroundOptions } from '../../../../@types/android/extension';
import { GradientColorStop, GradientTemplate } from '../../../../@types/android/resource';

import Resource from '../../resource';
import ResourceSvg from './svg';
import View from '../../view';

import { EXT_ANDROID, STRING_ANDROID, XMLNS_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from '../../lib/enumeration';

import LAYERLIST_TMPL from '../../template/layer-list';
import SHAPE_TMPL from '../../template/shape';
import VECTOR_TMPL from '../../template/vector';

const $lib = squared.lib;
const { reduceRGBA } = $lib.color;
const { formatPercent, formatPX, getBackgroundPosition, isLength, isPercent } = $lib.css;
const { truncate } = $lib.math;
const { CHAR, CSS, XML } = $lib.regex;
const { flatArray, isEqual, resolvePath } = $lib.util;
const { applyTemplate } = $lib.xml;

const { BOX_STANDARD, CSS_UNIT, NODE_RESOURCE } = squared.base.lib.enumeration;

interface PositionAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

interface BackgroundImageData extends PositionAttribute {
    bitmap?: BitmapData[];
    rotate?: StringMap[];
    gradient?: GradientTemplate;
    drawable?: string;
    width?: number | string;
    height?: number | string;
    gravity?: string;
}

interface BitmapData {
    src: string;
    gravity: string;
    tileMode: string;
    tileModeX: string;
    tileModeY: string;
}

interface ShapeStrokeData {
    color: string;
    dashWidth: string;
    dashGap: string;
}

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): ShapeStrokeData {
    const { style, color } = border;
    const width = roundFloat(border.width);
    const result = getStrokeColor(color);
    switch (style) {
        case 'solid':
            break;
        case 'dotted':
            result.dashWidth = formatPX(width);
            result.dashGap = result.dashWidth;
            break;
        case 'dashed': {
            let dashWidth: number;
            let dashGap: number;
            switch (width) {
                case 1:
                case 2:
                    dashWidth = width * 3;
                    dashGap = dashWidth - 1;
                    break;
                case 3:
                    dashWidth = 6;
                    dashGap = 3;
                    break;
                default:
                    dashWidth = width * 2;
                    dashGap = 4;
                    break;
            }
            result.dashWidth = formatPX(dashWidth);
            result.dashGap = formatPX(dashGap);
            break;
        }
        case 'inset':
        case 'outset':
        case 'groove':
        case 'ridge': {
            const rgba = color.rgba;
            let percent = 1;
            if (width === 1) {
                if (style === 'inset' || style === 'outset') {
                    percent = 0.5;
                }
            }
            else {
                const grayScale = rgba.r === rgba.g && rgba.g === rgba.b;
                let offset = 0;
                if (style === 'ridge') {
                    halfSize = !halfSize;
                    offset += 0.25;
                }
                else if (style === 'groove') {
                    offset += 0.25;
                }
                else {
                    if (grayScale) {
                        if (style === 'inset') {
                            halfSize = !halfSize;
                        }
                    }
                    else if (style === 'outset') {
                        halfSize = !halfSize;
                    }
                }
                if (halfSize) {
                    switch (direction) {
                        case 0:
                        case 3:
                            direction = 1;
                            break;
                        case 1:
                        case 2:
                            direction = 0;
                            break;
                    }
                }
                switch (direction) {
                    case 0:
                    case 3:
                        if (grayScale) {
                            percent = 0.5 + offset;
                        }
                        break;
                    case 1:
                    case 2:
                        percent = grayScale ? 0.75 + offset : -0.75;
                        break;
                }
            }
            if (percent !== 1) {
                const reduced = reduceRGBA(rgba, percent, color.valueAsRGBA);
                if (reduced) {
                    return getStrokeColor(reduced);
                }
            }
            break;
        }
    }
    return result;
}

function getBorderStroke(border: BorderAttribute, direction = -1, hasInset = false, isInset = false) {
    if (border) {
        let result: Undef<ExternalData>;
        if (isAlternatingBorder(border.style)) {
            const width = parseFloat(border.width);
            result = getBorderStyle(border, direction, !isInset);
            if (isInset) {
                result.width = formatPX(Math.ceil(width / 2) * 2);
            }
            else {
                result.width = formatPX(hasInset ? Math.ceil(width / 2) : roundFloat(border.width));
            }
        }
        else {
            result = getBorderStyle(border);
            result.width = formatPX(roundFloat(border.width));
        }
        return result;
    }
    return undefined;
}

function getBorderRadius(radius?: string[]): Undef<StringMap> {
    if (radius) {
        const length = radius.length;
        if (length === 1) {
            return { radius: radius[0] };
        }
        else {
            if (length === 8) {
                const corners = new Array(4);
                for (let i = 0, j = 0; i < length; i += 2) {
                    corners[j++] = formatPX((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2);
                }
                return getCornerRadius(corners);
            }
            else {
                return getCornerRadius(radius);
            }
        }
    }
    return undefined;
}

function getCornerRadius(corners: string[]) {
    const [topLeft, topRight, bottomRight, bottomLeft] = corners;
    const result: StringMap = {};
    let valid = false;
    if (topLeft !== '0px') {
        result.topLeftRadius = topLeft;
        valid = true;
    }
    if (topRight !== '0px') {
        result.topRightRadius = topRight;
        valid = true;
    }
    if (bottomRight !== '0px') {
        result.bottomRightRadius = bottomRight;
        valid = true;
    }
    if (bottomLeft !== '0px') {
        result.bottomLeftRadius = bottomLeft;
        valid = true;
    }
    return valid ? result : undefined;
}

function getBackgroundColor(value?: string) {
    const color = getColorValue(value, false);
    return color !== '' ? { color } : undefined;
}

function isAlternatingBorder(value: string, width = 0) {
    switch (value) {
        case 'groove':
        case 'ridge':
        case 'inset':
        case 'outset':
            return width !== 1;
        default:
            return false;
    }
}

function insertDoubleBorder(items: ExternalData[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, indentWidth = 0, corners?: StringMap) {
    const width = roundFloat(border.width);
    const borderWidth = Math.max(1, Math.floor(width / 3));
    const indentOffset = indentWidth > 0 ? formatPX(indentWidth) : '';
    let hideOffset = '-' + formatPX(borderWidth + indentWidth + 1);
    items.push({
        top: top ? indentOffset : hideOffset,
        right: right ? indentOffset : hideOffset,
        bottom: bottom ? indentOffset : hideOffset,
        left: left ? indentOffset :  hideOffset,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: formatPX(borderWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
    const insetWidth = width - borderWidth + indentWidth;
    const drawOffset = formatPX(insetWidth);
    hideOffset = '-' + formatPX(insetWidth + 1);
    items.push({
        top: top ? drawOffset : hideOffset,
        right: right ? drawOffset : hideOffset,
        bottom: bottom ? drawOffset : hideOffset,
        left: left ? drawOffset : hideOffset,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: formatPX(borderWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
}

function checkBackgroundPosition(value: string, adjacent: string, fallback: string) {
    if (!value.includes(' ') && adjacent.includes(' ')) {
        return CHAR.LOWERCASE.test(value) ? (value === 'initial' ? fallback : value) + ' 0px' : fallback + ' ' + value;
    }
    else if (value === 'initial') {
        return '0px';
    }
    return value;
}

function createBackgroundGradient(gradient: Gradient, api = BUILD_ANDROID.LOLLIPOP, precision?: number) {
    const type = gradient.type;
    const result: GradientTemplate = {
        type,
        item: false
    };
    const hasStop = api >= BUILD_ANDROID.LOLLIPOP;
    switch (type) {
        case 'conic': {
            const center = (<ConicGradient> gradient).center;
            result.type = 'sweep';
            if (hasStop) {
                result.centerX = (center.left * 2).toString();
                result.centerY = (center.top * 2).toString();
            }
            else {
                result.centerX = formatPercent(center.leftAsPercent);
                result.centerY = formatPercent(center.topAsPercent);
            }
            break;
        }
        case 'radial': {
            const { center, radius } = <RadialGradient> gradient;
            if (hasStop) {
                result.gradientRadius = radius.toString();
                result.centerX = center.left.toString();
                result.centerY = center.top.toString();
            }
            else {
                result.gradientRadius = formatPX(radius);
                result.centerX = formatPercent(center.leftAsPercent);
                result.centerY = formatPercent(center.topAsPercent);
            }
            break;
        }
        case 'linear': {
            const { angle, angleExtent, dimension } = <LinearGradient> gradient;
            let positionX = angleExtent.x;
            let positionY = angleExtent.y;
            if (angle <= 90) {
                const height = (<Dimension> dimension).height;
                positionY += height;
                result.startX = '0';
                result.startY = height.toString();
            }
            else if (angle <= 180) {
                result.startX = '0';
                result.startY = '0';
            }
            else if (angle <= 270) {
                const width = (<Dimension> dimension).width;
                positionX += width;
                result.startX = width.toString();
                result.startY = '0';
            }
            else {
                const { width, height } = <Dimension> dimension;
                positionX += width;
                positionY += height;
                result.startX = width.toString();
                result.startY = height.toString();
            }
            result.endX = truncate(positionX, precision);
            result.endY = truncate(positionY, precision);
            break;
        }
    }
    const colorStops = gradient.colorStops;
    if (hasStop) {
        result.item = convertColorStops(colorStops);
    }
    else {
        const length = colorStops.length;
        result.startColor = getColorValue(colorStops[0].color);
        result.endColor = getColorValue(colorStops[length - 1].color);
        if (length > 2) {
            result.centerColor = getColorValue(colorStops[Math.floor(length / 2)].color);
        }
    }
    return result;
}

function resetPosition(position: BoxRectPosition, dirA: string, dirB: string, overwrite = false) {
    if (position.orientation.length === 2 || overwrite) {
        position[dirA] = 0;
    }
    position[dirB] = 0;
}

function getPercentOffset(direction: string, position: BoxRectPosition, bounds: BoxRectDimension, dimension?: Dimension): number {
    if (dimension) {
        const orientation = position.orientation;
        if (direction === 'left' || direction === 'right') {
            const value = orientation.length === 4 ? orientation[1] : orientation[0];
            if (isPercent(value)) {
                return (direction === 'left' ? position.leftAsPercent : position.rightAsPercent) * (bounds.width - dimension.width);
            }
        }
        else {
            const value = orientation.length === 4 ? orientation[3] : orientation[1];
            if (isPercent(value)) {
                return (direction === 'top' ? position.topAsPercent : position.bottomAsPercent) * (bounds.height - dimension.height);
            }
        }
    }
    return position[direction];
}

function createLayerList(boxStyle: BoxStyle, images?: BackgroundImageData[], borderOnly = true) {
    const result: ExternalData[] = [{
        'xmlns:android': XMLNS_ANDROID.android,
        item: []
    }];
    const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
    if (solid) {
        result[0].item.push({
            shape: {
                'android:shape': 'rectangle',
                solid
            }
        });
    }
    if (images) {
        for (const image of images) {
            if (image.gradient) {
                result[0].item.push({
                    shape: {
                        'android:shape': 'rectangle',
                        gradient: image.gradient
                    }
                });
            }
            else {
                result[0].item.push(image);
            }
        }
    }
    return result;
}

function createShapeData(stroke?: ObjectMap<any> | false, solid?: StringMap | false, corners?: ObjectMap<string> | false) {
    return [{
        'xmlns:android': XMLNS_ANDROID.android,
        'android:shape': 'rectangle',
        stroke,
        solid,
        corners
    }];
}

function setBodyBackground(name: string, parent: string, value: string) {
    Resource.addTheme({
        name,
        parent,
        items: {
            'android:windowBackground': value,
            'android:windowFullscreen': 'true',
            'android:fitsSystemWindows': 'true'
        }
    });
}

function getIndentOffset(border: BorderAttribute) {
    const width = roundFloat(border.width);
    return width === 2 && border.style === 'double' ? 3 : width;
}

function getColorValue(value: Undef<ColorData | string>, transparency = true) {
    const color = Resource.addColor(value, transparency);
    return color !== '' ? '@color/' + color : '';
}

function fillBackgroundAttribute(attribute: string[], length: number) {
    while (attribute.length < length) {
        attribute = attribute.concat(attribute.slice(0));
    }
    attribute.length = length;
    return attribute;
}

function setBorderStyle(layerList: ObjectMap<any>, borders: Undef<BorderAttribute>[], index: number, corners: Undef<StringMap>, indentWidth: number, indentOffset: string) {
    const item = borders[index];
    if (item) {
        const width = roundFloat(item.width);
        if (item.style === 'double' && width > 1) {
            insertDoubleBorder(
                layerList.item,
                item,
                index === 0,
                index === 1,
                index === 2,
                index === 3,
                indentWidth,
                corners
            );
        }
        else {
            const inset = width > 1 && isInsetBorder(item);
            if (inset) {
                const hideInsetOffset = '-' + formatPX(width + indentWidth + 1);
                layerList.item.push({
                    top:  index === 0 ? '' : hideInsetOffset,
                    right: index === 1 ? '' : hideInsetOffset,
                    bottom: index === 2 ? '' : hideInsetOffset,
                    left: index === 3 ? '' : hideInsetOffset,
                    shape: {
                        'android:shape': 'rectangle',
                        stroke: getBorderStroke(item, index, inset, true)
                    }
                });
            }
            const hideOffset = '-' + formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
            layerList.item.push({
                top:  index === 0 ? indentOffset : hideOffset,
                right: index === 1 ? indentOffset : hideOffset,
                bottom: index === 2 ? indentOffset : hideOffset,
                left: index === 3 ? indentOffset : hideOffset,
                shape: {
                    'android:shape': 'rectangle',
                    corners,
                    stroke: getBorderStroke(item, index, inset)
                }
            });
        }
    }
}

const roundFloat = (value: string) => Math.round(parseFloat(value));
const getStrokeColor = (value: ColorData): ShapeStrokeData => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
const isInsetBorder = (border: BorderAttribute) => border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && roundFloat(border.width) > 1;
const getPixelUnit = (width: number, height: number) => `${width}px ${height}px`;
const constrictedWidth = (node: View) => !node.inline && !node.floating && node.hasPX('width', true, true) && node.cssInitial('width') !== '100%';

export function convertColorStops(list: ColorStop[], precision?: number) {
    const result: GradientColorStop[] = [];
    for (const stop of list) {
        result.push({
            color: getColorValue(stop.color),
            offset: truncate(stop.offset, precision)
        });
    }
    return result;
}

export function drawRect(width: number, height: number, x = 0, y = 0, precision?: number) {
    if (precision) {
        x = truncate(x, precision) as any;
        y = truncate(y, precision) as any;
        width = truncate(x + width, precision) as any;
        height = truncate(y + height, precision) as any;
    }
    else {
        width += x;
        height += y;
    }
    return `M${x},${y} ${width},${y} ${width},${height} ${x},${height} Z`;
}

export default class ResourceBackground<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceBackgroundOptions = {
        drawOutlineAsInsetBorder: true
    };
    public readonly eventOnly = true;

    private _maxScreenWidth = Number.POSITIVE_INFINITY;
    private _maxScreenHeight = Number.POSITIVE_INFINITY;
    private _resourceSvgInstance?: ResourceSvg<T>;

    public beforeParseDocument() {
        const application = <android.base.Application<T>> this.application;
        const { resolutionDPI, resolutionScreenWidth, resolutionScreenHeight } = application.userSettings;
        const dpiRatio = 160 / resolutionDPI;
        this._maxScreenWidth = resolutionScreenWidth * dpiRatio;
        this._maxScreenHeight = resolutionScreenHeight * dpiRatio;
        this._resourceSvgInstance = this.controller.localSettings.svg.enabled ? <ResourceSvg<T>> application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
    }

    public afterResources() {
        const settings = (<android.base.Application<T>> this.application).userSettings;
        let themeBackground = false;
        function setDrawableBackground(node: T, value: string) {
            if (value !== '') {
                const drawable = '@drawable/' + Resource.insertStoredAsset('drawables', node.containerName.toLowerCase() + '_' + node.controlId, value);
                if (!themeBackground) {
                    if (node.documentBody) {
                        themeBackground = true;
                        if (!setHtmlBackground(node) && (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY) && node.css('backgroundImage') !== 'none') {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            return;
                        }
                    }
                    else if (node.tagName === 'HTML') {
                        themeBackground = true;
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                        return;
                    }
                }
                node.android('background', drawable, false);
            }
        }
        function setHtmlBackground(node: T) {
            const parent = <Null<T>> node.actualParent;
            if (parent?.visible === false) {
                const background = parent.android('background');
                if (background !== '') {
                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                    return true;
                }
            }
            return false;
        }
        const drawOutline = this.options.drawOutlineAsInsetBorder;
        for (const node of this.cacheProcessing) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored && node.hasResource(NODE_RESOURCE.BOX_STYLE)) {
                if (node.inputElement) {
                    const companion = node.companion;
                    if (companion?.tagName === 'LABEL' && !companion.visible) {
                        const backgroundColor = (<BoxStyle> companion.data(Resource.KEY_NAME, 'boxStyle'))?.backgroundColor;
                        if (backgroundColor) {
                            stored.backgroundColor = backgroundColor;
                        }
                    }
                }
                const images = this.getDrawableImages(node, stored);
                const outline = stored.outline;
                let [shapeData, layerListData] = this.getDrawableBorder(stored, undefined, images, drawOutline && outline ? getIndentOffset(outline) : 0);
                const emptyBackground = shapeData === undefined && layerListData === undefined;
                if (outline && (drawOutline || emptyBackground)) {
                    const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(stored, outline, emptyBackground ? images : undefined, undefined, !emptyBackground);
                    if (outlineShapeData) {
                        if (shapeData === undefined) {
                            shapeData = outlineShapeData;
                        }
                    }
                    else if (outlineLayerListData) {
                        if (layerListData) {
                            layerListData[0].item = layerListData[0].item.concat(outlineLayerListData[0].item);
                        }
                        else {
                            layerListData = outlineLayerListData;
                        }
                    }
                }
                if (shapeData) {
                    setDrawableBackground(node, applyTemplate('shape', SHAPE_TMPL, shapeData));
                }
                else if (layerListData) {
                    setDrawableBackground(node, applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                }
                else {
                    const backgroundColor = stored.backgroundColor;
                    if (backgroundColor) {
                        const color = getColorValue(backgroundColor, false);
                        if (color !== '') {
                            if (node.documentBody) {
                                if (!themeBackground) {
                                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                    themeBackground = true;
                                }
                                else {
                                    node.android('background', color, false);
                                }
                            }
                            else {
                                const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.backgroundColor = backgroundColor;
                                }
                                else {
                                    node.android('background', color, false);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public getDrawableBorder(data: BoxStyle, outline?: BorderAttribute, images?: BackgroundImageData[], indentWidth = 0, borderOnly = false) {
        const borders: Undef<BorderAttribute>[] = new Array(4);
        const borderVisible: boolean[] = new Array(4);
        const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
        const indentOffset = indentWidth > 0 ? formatPX(indentWidth) : '';
        let borderStyle = true;
        let borderAll = true;
        let border: Undef<BorderAttribute>;
        let borderData: Undef<BorderAttribute>;
        let shapeData: Undef<ExternalData[]>;
        let layerListData: Undef<ExternalData[]>;
        if (outline) {
            borderData = outline;
            for (let i = 0; i < 4; i++) {
                borders[i] = outline;
                borderVisible[i] = true;
            }
        }
        else {
            borders[0] = data.borderTop;
            borders[1] = data.borderRight;
            borders[2] = data.borderBottom;
            borders[3] = data.borderLeft;
            for (let i = 0; i < 4; i++) {
                const item = borders[i];
                if (item) {
                    if (borderStyle && borderData) {
                        borderStyle = isEqual(borderData, item);
                        if (!borderStyle) {
                            borderAll = false;
                        }
                    }
                    borderData = item;
                    borderVisible[i] = true;
                }
                else {
                    borderVisible[i] = false;
                    borderAll = false;
                }
            }
        }
        if (borderAll) {
            border = borderData;
        }
        if (border && !isAlternatingBorder(border.style, roundFloat(border.width)) && !(border.style === 'double' && parseInt(border.width) > 1) || borderData === undefined && (corners || images?.length)) {
            const stroke = border ? getBorderStroke(border) : false;
            if (images?.length || indentWidth > 0 || borderOnly) {
                layerListData = createLayerList(data, images, borderOnly);
                if (corners || stroke) {
                    layerListData[0].item.push({
                        top: indentOffset,
                        right: indentOffset,
                        left: indentOffset,
                        bottom: indentOffset,
                        shape: {
                            'android:shape': 'rectangle',
                            corners,
                            stroke
                        }
                    });
                }
            }
            else {
                shapeData = createShapeData(stroke, !borderOnly && getBackgroundColor(data.backgroundColor), corners);
            }
        }
        else if (borderData) {
            layerListData = createLayerList(data, images, borderOnly);
            if (borderStyle && !isAlternatingBorder(borderData.style)) {
                const width = roundFloat(borderData.width);
                if (borderData.style === 'double' && width > 1) {
                    insertDoubleBorder(
                        layerListData[0].item,
                        borderData,
                        borderVisible[0],
                        borderVisible[1],
                        borderVisible[2],
                        borderVisible[3],
                        indentWidth,
                        corners
                    );
                }
                else {
                    const hideOffset = '-' + formatPX(width + indentWidth + 1);
                    layerListData[0].item.push({
                        top: borderVisible[0] ? indentOffset : hideOffset,
                        right: borderVisible[1] ? indentOffset : hideOffset,
                        bottom: borderVisible[2] ? indentOffset : hideOffset,
                        left: borderVisible[3] ? indentOffset : hideOffset,
                        shape: {
                            'android:shape': 'rectangle',
                            corners,
                            stroke: getBorderStroke(borderData)
                        }
                    });
                }
            }
            else {
                setBorderStyle(layerListData[0], borders, 0, corners, indentWidth, indentOffset);
                setBorderStyle(layerListData[0], borders, 3, corners, indentWidth, indentOffset);
                setBorderStyle(layerListData[0], borders, 2, corners, indentWidth, indentOffset);
                setBorderStyle(layerListData[0], borders, 1, corners, indentWidth, indentOffset);
            }
        }
        return [shapeData, layerListData];
    }

    public getDrawableImages(node: T, data: BoxStyle) {
        const backgroundImage = data.backgroundImage;
        const extracted = node.extracted;
        if ((backgroundImage || extracted) && node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
            const resource = <android.base.Resource<T>> this.resource;
            const bounds = node.bounds;
            let { width: boundsWidth, height: boundsHeight } = bounds;
            if (node.documentBody) {
                boundsWidth = this._maxScreenWidth;
                boundsHeight = this._maxScreenHeight;
            }
            else if (node.documentRoot) {
                if (!constrictedWidth(node)) {
                    boundsWidth = this._maxScreenWidth;
                }
                if (node.cssInitial('height') === '100%' || node.cssInitial('minHeight') === '100%') {
                    boundsHeight = this._maxScreenHeight;
                }
            }
            else if (node.ascend({ condition: (item: T) => constrictedWidth(item) && (!item.layoutElement || item === node), startSelf: true }).length === 0) {
                boundsWidth = Math.min(boundsWidth, this._maxScreenWidth);
            }
            const result: BackgroundImageData[] = [];
            const images: (string | GradientTemplate)[] = [];
            const imageDimensions: Undef<Dimension>[] = [];
            const imageSvg: boolean[] = [];
            const backgroundPosition: BoxRectPosition[] = [];
            const backgroundPositionX = data.backgroundPositionX.split(XML.SEPARATOR);
            const backgroundPositionY = data.backgroundPositionY.split(XML.SEPARATOR);
            let backgroundRepeat = data.backgroundRepeat.split(XML.SEPARATOR);
            let backgroundSize = data.backgroundSize.split(XML.SEPARATOR);
            let length = 0;
            let resizable = true;
            if (backgroundImage) {
                const resourceInstance = this._resourceSvgInstance;
                const lengthA = backgroundImage.length;
                backgroundRepeat = fillBackgroundAttribute(backgroundRepeat, lengthA);
                backgroundSize = fillBackgroundAttribute(backgroundSize, lengthA);
                let modified = false;
                for (let i = 0; i < lengthA; i++) {
                    let value = backgroundImage[i];
                    let valid = false;
                    if (typeof value === 'string') {
                        if (value !== 'initial') {
                            if (resourceInstance) {
                                const [parentElement, element] = resourceInstance.createSvgElement(node, value);
                                if (parentElement && element) {
                                    const drawable = resourceInstance.createSvgDrawable(node, element);
                                    if (drawable !== '') {
                                        images[length] = drawable;
                                        imageSvg[length] = true;
                                        const dimension = <DOMRect> node.data(Resource.KEY_NAME, 'svgViewBox') || { width: element.width.baseVal.value, height: element.height.baseVal.value };
                                        if (!node.svgElement) {
                                            let { width, height } = dimension;
                                            if (width > boundsWidth || height > boundsHeight) {
                                                const ratioWidth = width / boundsWidth;
                                                const ratioHeight = height / boundsHeight;
                                                if (ratioWidth > ratioHeight) {
                                                    if (ratioWidth > 1) {
                                                        width = boundsWidth;
                                                        height /= ratioWidth;
                                                    }
                                                    else {
                                                        height = boundsHeight * (ratioHeight / ratioWidth);
                                                    }
                                                }
                                                else {
                                                    if (ratioHeight > 1) {
                                                        height = boundsHeight;
                                                        width /= ratioHeight;
                                                    }
                                                    else {
                                                        width = boundsWidth * (ratioWidth / ratioHeight);
                                                    }
                                                }
                                            }
                                            dimension.width = width;
                                            dimension.height = height;
                                        }
                                        imageDimensions[length] = dimension;
                                        valid = true;
                                    }
                                    parentElement.removeChild(element);
                                }
                            }
                            if (!valid) {
                                const match = CSS.URL.exec(value);
                                if (match) {
                                    const uri = match[1];
                                    if (/^data:image/.test(uri)) {
                                        const rawData = resource.getRawData(uri);
                                        if (rawData?.base64) {
                                            images[length] = rawData.filename.substring(0, rawData.filename.lastIndexOf('.'));
                                            imageDimensions[length] = rawData;
                                            resource.writeRawImage(rawData.filename, rawData.base64);
                                            valid = true;
                                        }
                                    }
                                    else {
                                        value = resolvePath(uri);
                                        images[length] = resource.addImageSet({ mdpi: value });
                                        if (images[length] !== '') {
                                            imageDimensions[length] = resource.getImage(value);
                                            valid = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (value.colorStops.length > 1) {
                        const gradient = createBackgroundGradient(value, node.api);
                        if (gradient) {
                            images[length] = gradient;
                            imageDimensions[length] = value.dimension;
                            valid = true;
                        }
                    }
                    if (valid) {
                        const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                        const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                        backgroundPosition[length] = getBackgroundPosition(checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'), node.actualDimension, node.fontSize, imageDimensions[length], backgroundSize[i]);
                        length++;
                    }
                    else {
                        backgroundRepeat[i] = undefined as any;
                        backgroundSize[i] = undefined as any;
                        modified = true;
                    }
                }
                if (modified) {
                    backgroundRepeat = flatArray(backgroundRepeat);
                    backgroundSize = flatArray(backgroundSize);
                }
            }
            if (extracted) {
                if (length === 0) {
                    backgroundRepeat.length = 0;
                    backgroundSize.length = 0;
                }
                const embedded = extracted.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE'));
                for (let i = 0; i < embedded.length; i++) {
                    const image = embedded[i];
                    const element = <HTMLImageElement> image.element;
                    const src = resource.addImageSrc(element);
                    if (src !== '') {
                        const imageBounds = image.bounds;
                        images[length] = src;
                        backgroundRepeat[length] = 'no-repeat';
                        backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                        const position = getBackgroundPosition(
                            image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageBounds.left - bounds.left + node.borderLeftWidth, imageBounds.top - bounds.top + node.borderTopWidth),
                            node.actualDimension,
                            node.fontSize,
                            imageBounds
                        );
                        const stored = resource.getImage(element.src);
                        if (!node.hasPX('width')) {
                            const offsetStart = (stored ? stored.width : 0) + position.left - (node.paddingLeft + node.borderLeftWidth);
                            if (offsetStart > 0) {
                                node.modifyBox(BOX_STANDARD.PADDING_LEFT, offsetStart);
                            }
                        }
                        imageDimensions[length] = stored;
                        backgroundPosition[length] = position;
                        length++;
                    }
                }
            }
            for (let i = length - 1; i >= 0; i--) {
                const value = images[i];
                const position = backgroundPosition[i];
                const size = backgroundSize[i];
                const imageData: BackgroundImageData = {};
                let dimension = imageDimensions[i];
                let dimenWidth = NaN;
                let dimenHeight = NaN;
                if (dimension) {
                    if (!dimension.width || !dimension.height) {
                        dimension = undefined;
                    }
                    else {
                        dimenWidth = dimension.width;
                        dimenHeight = dimension.height;
                    }
                }
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                let repeatX = true;
                let repeatY = true;
                let recalibrate = true;
                if (typeof value === 'string') {
                    const resetBackground = () => {
                        tileMode = '';
                        tileModeX = '';
                        tileModeY = '';
                        repeating = false;
                        if (node.documentBody) {
                            const visibleStyle = node.visibleStyle;
                            visibleStyle.backgroundRepeat = true;
                            visibleStyle.backgroundRepeatY = true;
                        }
                    };
                    const resetGravityPosition = () => {
                        gravityX = '';
                        gravityY = '';
                        position.top = 0;
                        position.right = 0;
                        position.bottom = 0;
                        position.left = 0;
                        resizable = false;
                        recalibrate = false;
                    };
                    const canResizeHorizontal = () => resizable && gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX === '';
                    const canResizeVertical = () => resizable && gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY === '';
                    const src = '@drawable/' + value;
                    let repeat = backgroundRepeat[i];
                    if (repeat.includes(' ')) {
                        const [x, y] = repeat.split(' ');
                        if (x === 'no-repeat') {
                            repeat = y === 'no-repeat' ? 'no-repeat' : 'repeat-y';
                        }
                        else if (y === 'no-repeat') {
                            repeat = 'repeat-x';
                        }
                        else {
                            repeat = 'repeat';
                        }
                    }
                    else if (repeat === 'space' || repeat === 'round') {
                        repeat = 'repeat';
                    }
                    const svg = imageSvg[i] === true;
                    let repeating = repeat === 'repeat';
                    let width = 0;
                    let height = 0;
                    let tileMode = '';
                    let tileModeX = '';
                    let tileModeY = '';
                    let gravityX = '';
                    let gravityY = '';
                    let gravityAlign = '';
                    let gravity: Undef<string>;
                    if (!repeating && repeat !== 'repeat-x') {
                        switch (position.horizontal) {
                            case 'left':
                            case '0%':
                                resetPosition(position, 'left', 'right');
                                gravityX = node.localizeString('left');
                                break;
                            case 'center':
                            case '50%':
                                resetPosition(position, 'left', 'right', true);
                                gravityX = STRING_ANDROID.CENTER_HORIZONTAL;
                                break;
                            case 'right':
                            case '100%':
                                resetPosition(position, 'right', 'left');
                                gravityX = node.localizeString('right');
                                break;
                            default:
                                gravityX = node.localizeString(position.right !== 0 ? 'right' : 'left');
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            let x = position.left;
                            if (x > 0) {
                                do {
                                    x -= dimenWidth;
                                }
                                while (x > 0);
                                repeatX = true;
                                position.left = x;
                            }
                            else {
                                repeatX = dimenWidth < boundsWidth;
                            }
                        }
                        else {
                            position.left = 0;
                            repeatX = true;
                        }
                        position.right = 0;
                    }
                    if (!repeating && repeat !== 'repeat-y') {
                        switch (position.vertical) {
                            case 'top':
                            case '0%':
                                resetPosition(position, 'top', 'bottom');
                                gravityY = 'top';
                                if (isNaN(dimenHeight)) {
                                    height = boundsHeight;
                                }
                                break;
                            case 'center':
                            case '50%':
                                resetPosition(position, 'top', 'bottom', true);
                                gravityY = STRING_ANDROID.CENTER_VERTICAL;
                                break;
                            case 'bottom':
                            case '100%':
                                resetPosition(position, 'bottom', 'top');
                                gravityY = 'bottom';
                                break;
                            default:
                                gravityY = position.bottom !== 0 ? 'bottom' : 'top';
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            let y = position.top;
                            if (y > 0) {
                                do {
                                    y -= dimenHeight;
                                }
                                while (y > 0);
                                position.top = y;
                                repeatY = true;
                            }
                            else {
                                repeatY = node.element === document.body || dimenHeight < boundsHeight;
                                if (y === 0) {
                                    gravityY = 'top';
                                }
                            }
                        }
                        else {
                            position.top = 0;
                            gravityY = 'top';
                            repeatY = true;
                        }
                        position.bottom = 0;
                    }
                    if (repeating) {
                        if (repeatX && repeatY) {
                            tileMode = 'repeat';
                        }
                        else {
                            if (repeatX) {
                                tileModeX = 'repeat';
                            }
                            if (repeatY) {
                                tileModeY = 'repeat';
                            }
                            repeating = false;
                        }
                    }
                    else {
                        switch (repeat) {
                            case 'repeat-x':
                                if (!node.documentBody) {
                                    if (!node.blockStatic && dimenWidth > boundsWidth) {
                                        width = dimenWidth;
                                    }
                                    else {
                                        tileModeX = 'repeat';
                                    }
                                }
                                else {
                                    if (dimenWidth < boundsWidth) {
                                        tileModeX = 'repeat';
                                    }
                                    else {
                                        gravityX = 'fill_horizontal';
                                    }
                                }
                                break;
                            case 'repeat-y':
                                if (!node.documentBody) {
                                    if (dimenHeight > boundsHeight) {
                                        height = dimenHeight;
                                    }
                                    else {
                                        tileModeY = 'repeat';
                                    }
                                }
                                else {
                                    if (dimenHeight < boundsHeight) {
                                        tileModeY = 'repeat';
                                    }
                                    else {
                                        gravityY = 'fill_vertical';
                                    }
                                }
                                break;
                            default:
                                tileMode = 'disabled';
                                break;
                        }
                    }
                    if (dimension) {
                        if (gravityX !== '' && tileModeY === 'repeat' && dimenWidth < boundsWidth) {
                            const resetX = () => {
                                if (gravityY === '' && gravityX !== node.localizeString('left') && node.renderChildren.length) {
                                    tileModeY = '';
                                }
                                gravityAlign = gravityX;
                                gravityX = '';
                                tileModeX = '';
                            };
                            switch (gravityX) {
                                case 'start':
                                case 'left':
                                    position.left += node.borderLeftWidth;
                                    position.right = 0;
                                    resetX();
                                    break;
                                case 'end':
                                case 'right':
                                    position.left = 0;
                                    position.right += node.borderRightWidth;
                                    resetX();
                                    break;
                                case STRING_ANDROID.CENTER_HORIZONTAL:
                                    position.left = 0;
                                    position.right = 0;
                                    resetX();
                                    break;
                            }
                        }
                        if (gravityY !== '' && tileModeX === 'repeat' && dimenHeight < boundsHeight) {
                            const resetY = () => {
                                if (gravityX === '' && gravityY !== 'top' && node.renderChildren.length) {
                                    tileModeX = '';
                                }
                                gravityAlign += (gravityAlign !== '' ? '|' : '') + gravityY;
                                gravityY = '';
                                tileModeY = 'disabled';
                            };
                            switch (gravityY) {
                                case 'top':
                                    position.top += node.borderTopWidth;
                                    position.bottom = 0;
                                    resetY();
                                    break;
                                case 'bottom':
                                    position.top = 0;
                                    position.bottom += node.borderBottomWidth;
                                    resetY();
                                    break;
                                case STRING_ANDROID.CENTER_VERTICAL:
                                    position.top = 0;
                                    position.bottom = 0;
                                    resetY();
                                    break;
                            }
                        }
                    }
                    switch (size) {
                        case 'auto':
                        case 'auto auto':
                        case 'initial':
                        case 'contain':
                            break;
                        case '100%':
                        case '100% 100%':
                        case '100% auto':
                        case 'auto 100%': {
                            if (!repeating && tileModeX !== 'repeat' && tileModeY !== 'repeat' && (dimenWidth < boundsWidth || dimenHeight < boundsHeight)) {
                                const ratioWidth = dimenWidth / boundsWidth;
                                const ratioHeight = dimenHeight / boundsHeight;
                                if (ratioWidth < ratioHeight) {
                                    width = boundsWidth;
                                    height = boundsHeight * (ratioHeight / ratioWidth);
                                    resetGravityPosition();
                                }
                                else if (ratioWidth > ratioHeight) {
                                    width = boundsWidth * (ratioWidth / ratioHeight);
                                    height = boundsHeight;
                                    resetGravityPosition();
                                }
                            }
                            if (dimenWidth > boundsWidth) {
                                gravityX = '';
                            }
                            if (dimenHeight > boundsHeight) {
                                gravityY = '';
                            }
                            resizable = false;
                            break;
                        }
                        case 'cover':
                            resetBackground();
                            break;
                        case 'round':
                            gravity = 'fill';
                            gravityX = 'fill_horizontal';
                            gravityY = 'fill_vertical';
                            resetBackground();
                            break;
                        default:
                            size.split(' ').forEach((dimen, index) => {
                                if (dimen === '100%') {
                                    if (index === 0) {
                                        gravityX = 'fill_horizontal';
                                    }
                                    else {
                                        gravityY = 'fill_vertical';
                                    }
                                }
                                else if (!repeating && dimen !== 'auto') {
                                    if (index === 0) {
                                        width = node.parseUnit(dimen, 'width', false);
                                    }
                                    else {
                                        height = node.parseUnit(dimen, 'height', false);
                                    }
                                }
                            });
                            break;
                    }
                    if (dimension) {
                        switch (size) {
                            case 'cover': {
                                const ratioWidth = dimenWidth / boundsWidth;
                                const ratioHeight = dimenHeight / boundsHeight;
                                if (ratioWidth < ratioHeight) {
                                    width = boundsWidth;
                                    height = boundsHeight * (ratioHeight / ratioWidth);
                                    left = 0;
                                    if (height > boundsHeight) {
                                        if (node.hasHeight) {
                                            top = boundsHeight - height;
                                            if (position.topAsPercent > 0) {
                                                top = Math.round(top * position.topAsPercent);
                                            }
                                        }
                                        else {
                                            node.css('height', formatPX(boundsHeight - node.contentBoxHeight));
                                        }
                                    }
                                    else {
                                        top = 0;
                                    }
                                    gravity = '';
                                }
                                else if (ratioWidth > ratioHeight) {
                                    width = boundsWidth * (ratioWidth / ratioHeight);
                                    height = boundsHeight;
                                    if (node.hasWidth && width > boundsWidth) {
                                        left = boundsWidth - width;
                                        if (position.leftAsPercent > 0) {
                                            left = Math.round(left * position.leftAsPercent);
                                        }
                                    }
                                    else {
                                        left = 0;
                                    }
                                    top = 0;
                                    gravity = '';
                                }
                                else {
                                    left = 0;
                                    top = 0;
                                    gravity = 'fill';
                                }
                                resetGravityPosition();
                                break;
                            }
                            case 'contain': {
                                const ratioWidth = dimenWidth / boundsWidth;
                                const ratioHeight = dimenHeight / boundsHeight;
                                if (ratioWidth > ratioHeight) {
                                    gravityAlign = 'fill_horizontal|center_vertical';
                                    width = 0;
                                    height = boundsHeight * (ratioHeight / ratioWidth);
                                    gravity = '';
                                }
                                else if (ratioWidth < ratioHeight) {
                                    gravityAlign = 'fill_vertical|center_horizontal';
                                    width = boundsWidth * (ratioWidth / ratioHeight);
                                    height = 0;
                                    gravity = '';
                                }
                                else {
                                    gravity = 'fill';
                                }
                                resetGravityPosition();
                                break;
                            }
                            default:
                                if (width === 0 && height > 0 && canResizeHorizontal()) {
                                    width = dimenWidth * height / dimenHeight;
                                }
                                if (height === 0 && width > 0 && canResizeVertical()) {
                                    height = dimenHeight * width / dimenWidth;
                                }
                                break;
                        }
                    }
                    if (data.backgroundClip) {
                        const { top: clipTop, right: clipRight, left: clipLeft, bottom: clipBottom } = data.backgroundClip;
                        if (width === 0) {
                            width = boundsWidth;
                        }
                        else {
                            width += node.contentBoxWidth;
                        }
                        if (height === 0) {
                            height = boundsHeight;
                        }
                        else {
                            height += node.contentBoxHeight;
                        }
                        width -= clipLeft + clipRight;
                        height -= clipTop + clipBottom;
                        if (gravityX === 'right' || gravityX === 'end') {
                            position.right += clipRight;
                            left = 0;
                        }
                        else if (position.right !== 0) {
                            right += clipRight;
                        }
                        else {
                            left += clipLeft;
                        }
                        if (gravityY === 'bottom') {
                            position.bottom += clipBottom;
                            top = 0;
                        }
                        else if (position.bottom !== 0) {
                            bottom += clipBottom;
                        }
                        else {
                            top += clipTop;
                        }
                        gravity = '';
                        gravityX = '';
                        gravityY = '';
                        recalibrate = false;
                    }
                    else if (width === 0 && height === 0 && dimenWidth < boundsWidth && dimenHeight < boundsHeight && canResizeHorizontal() && canResizeVertical() && !svg) {
                        width = dimenWidth;
                        height = dimenHeight;
                    }
                    if (recalibrate) {
                        if (!repeating) {
                            const backgroundOrigin = data.backgroundOrigin;
                            if (backgroundOrigin) {
                                if (tileModeX !== 'repeat') {
                                    if (gravityX === 'right' || gravityX === 'end') {
                                        position.right += backgroundOrigin.right;
                                        left = 0;
                                    }
                                    else if (position.leftAsPercent !== 0 || position.rightAsPercent === 0) {
                                        if (position.right !== 0) {
                                            right -= backgroundOrigin.left;
                                        }
                                        else {
                                            left += backgroundOrigin.left;
                                        }
                                    }
                                    else {
                                        if (position.right !== 0) {
                                            right += backgroundOrigin.right;
                                        }
                                        else {
                                            left -= backgroundOrigin.right;
                                        }
                                    }
                                }
                                if (tileModeY !== 'repeat') {
                                    if (gravityY === 'bottom') {
                                        position.bottom += backgroundOrigin.bottom;
                                        top = 0;
                                    }
                                    else if (position.topAsPercent !== 0 || position.bottomAsPercent === 0) {
                                        if (position.bottom !== 0) {
                                            bottom -= backgroundOrigin.top;
                                        }
                                        else {
                                            top += backgroundOrigin.top;
                                        }
                                    }
                                    else {
                                        if (position.bottom !== 0) {
                                            bottom += backgroundOrigin.bottom;
                                        }
                                        else {
                                            top -= backgroundOrigin.bottom;
                                        }
                                    }
                                }
                                recalibrate = false;
                            }
                        }
                        if (!node.documentBody && !node.is(CONTAINER_NODE.IMAGE) && !svg) {
                            if (resizable) {
                                let fillX = false;
                                let fillY = false;
                                if (boundsWidth < dimenWidth && (!node.has('width', CSS_UNIT.LENGTH, { map: 'initial', not: '100%' }) && !(node.blockStatic && gravity && (gravity === 'center' || gravity.includes(STRING_ANDROID.CENTER_HORIZONTAL))) || !node.pageFlow)) {
                                    width = boundsWidth - (node.contentBox ? node.contentBoxWidth : 0);
                                    fillX = true;
                                    if (tileMode !== 'disabled') {
                                        switch (position.horizontal) {
                                            case 'left':
                                            case '0px':
                                                tileModeX = 'repeat';
                                                break;
                                        }
                                    }
                                }
                                if (boundsHeight < dimenHeight && (!node.has('height', CSS_UNIT.LENGTH, { map: 'initial', not: '100%' }) || !node.pageFlow)) {
                                    height = boundsHeight - (node.contentBox ? node.contentBoxHeight : 0);
                                    fillY = true;
                                }
                                if (fillX || fillY) {
                                    if (gravityAlign !== '') {
                                        gravityAlign += '|';
                                    }
                                    if (fillX && fillY) {
                                        gravityAlign += 'fill';
                                    }
                                    else {
                                        gravityAlign += fillX ? 'fill_horizontal' : 'fill_vertical';
                                    }
                                }
                            }
                            else if (boundsHeight < dimenHeight && !node.hasPX('height') && node.length === 0) {
                                height = boundsHeight;
                                gravityAlign = '';
                                if (gravityY === '') {
                                    gravityY = 'top';
                                }
                            }
                        }
                    }
                    if (width > 0) {
                        imageData.width = width;
                    }
                    if (height > 0) {
                        imageData.height = height;
                    }
                    if (gravityAlign === '') {
                        if ((width || dimenWidth) + position.left >= boundsWidth && (!node.blockStatic || node.hasPX('width', false))) {
                            tileModeX = '';
                            if (!resizable && !height && position.left < 0 && gravity !== 'fill' && !gravityX.includes('fill_horizontal')) {
                                gravityX += (gravityX !== '' ? '|' : '') + 'fill_horizontal';
                            }
                            if (tileMode === 'repeat') {
                                tileModeY = 'repeat';
                                tileMode = '';
                            }
                        }
                        if ((height || dimenHeight) + position.top >= boundsHeight && !node.documentBody && !node.percentHeight) {
                            tileModeY = '';
                            if (!resizable && position.top < 0 && gravity !== 'fill' && !gravityY.includes('fill_vertical') && !node.hasPX('height')) {
                                gravityY += (gravityY !== '' ? '|' : '') + 'fill_vertical';
                            }
                            if (tileMode === 'repeat') {
                                tileModeX = 'repeat';
                                tileMode = '';
                            }
                        }
                        if (tileMode !== 'repeat' && gravity !== 'fill') {
                            if (tileModeX !== '') {
                                if (tileModeY === '' && (gravityY === '' || gravityY.includes('top') || gravityY.includes('fill_vertical'))) {
                                    gravityAlign = gravityY;
                                    gravityY = '';
                                    if (node.renderChildren.length) {
                                        tileModeX = '';
                                    }
                                }
                            }
                            else if (tileModeY !== '' && (gravityX === '' || gravityX.includes('start') || gravityX.includes('left') || gravityX.includes('fill_horizontal'))) {
                                gravityAlign = gravityX;
                                gravityX = '';
                                if (node.renderChildren.length) {
                                    tileModeY = '';
                                }
                            }
                        }
                    }
                    if (gravity === undefined) {
                        if (gravityX === STRING_ANDROID.CENTER_HORIZONTAL && gravityY === STRING_ANDROID.CENTER_VERTICAL) {
                            if (dimenWidth <= boundsWidth && dimenHeight <= boundsHeight) {
                                gravityAlign += (gravityAlign !== '' ? '|' : '') + 'center';
                                gravity = '';
                            }
                            else {
                                gravity = 'center';
                            }
                        }
                        else if (gravityX === 'fill_horizontal' && gravityY === 'fill_vertical') {
                            gravity = 'fill';
                        }
                        else {
                            gravity = '';
                            if (gravityX !== '') {
                                gravity += gravityX;
                            }
                            if (gravityY !== '') {
                                gravity += (gravity ? '|' : '') + gravityY;
                            }
                        }
                        if (gravityX === 'fill_horizontal') {
                            gravityX = '';
                        }
                        if (gravityY === 'fill_vertical') {
                            gravityY = '';
                        }
                    }
                    const covering = size === 'cover' || size === 'contain';
                    if (node.documentBody && !covering && tileModeX !== 'repeat' && gravity !== '' && gravityAlign === '') {
                        imageData.gravity = gravity;
                        imageData.drawable = src;
                    }
                    else if ((tileMode === 'repeat' || tileModeX !== '' || tileModeY !== '' || gravityAlign !== '' && gravity !== '' || covering || !resizable && height > 0) && !svg) {
                        switch (gravity) {
                            case 'top':
                                if (tileModeY === 'repeat' && !node.hasHeight && !node.layoutLinear && !(node.layoutRelative && node.horizontalRows === undefined)) {
                                    gravity = '';
                                    tileModeY = '';
                                }
                                break;
                            case 'bottom':
                                if (gravityAlign === '') {
                                    gravityAlign = gravity;
                                    gravity = '';
                                    tileMode = '';
                                    tileModeX = tileModeX === '' ? 'disabled' : '';
                                    tileModeY = tileModeY === '' ? 'disabled' : '';
                                }
                                break;
                        }
                        imageData.gravity = gravityAlign;
                        imageData.bitmap = [{
                            src,
                            gravity,
                            tileMode,
                            tileModeX,
                            tileModeY
                        }];
                    }
                    else {
                        imageData.gravity = gravity || gravityAlign;
                        imageData.drawable = src;
                    }
                }
                else if (value.item) {
                    const [width, height] = dimension ? [Math.round(dimenWidth), Math.round(dimenHeight)] : [Math.round(node.actualWidth), Math.round(node.actualHeight)];
                    if (size.split(' ').some(dimen => dimen !== '100%' && isLength(dimen, true))) {
                        imageData.width = width;
                        imageData.height = height;
                    }
                    const src = Resource.insertStoredAsset(
                        'drawables',
                        `${node.controlId}_gradient_${i + 1}`,
                        applyTemplate('vector', VECTOR_TMPL, [{
                            'xmlns:android': XMLNS_ANDROID.android,
                            'xmlns:aapt': XMLNS_ANDROID.aapt,
                            'android:width': imageData.width || formatPX(width),
                            'android:height': imageData.height || formatPX(height),
                            'android:viewportWidth': width.toString(),
                            'android:viewportHeight': height.toString(),
                            'path': {
                                pathData: drawRect(width, height),
                                'aapt:attr': {
                                    name: 'android:fillColor',
                                    gradient: value
                                }
                            }
                        }])
                    );
                    if (src !== '') {
                        imageData.drawable = '@drawable/' + src;
                        if (position.static && node.tagName !== 'HTML') {
                            imageData.gravity = 'fill';
                        }
                    }
                }
                else {
                    imageData.gradient = value;
                    if (position.static && node.tagName !== 'HTML') {
                        imageData.gravity = 'fill';
                    }
                }
                if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                    if (position.bottom !== 0) {
                        bottom = (repeatY || !recalibrate ? position.bottom : getPercentOffset('bottom', position, bounds, dimension)) + bottom;
                    }
                    else if (position.top !== 0) {
                        top = (repeatY || !recalibrate ? position.top : getPercentOffset('top', position, bounds, dimension)) + top;
                    }
                    if (position.right !== 0) {
                        right = (repeatX || !recalibrate ? position.right : getPercentOffset('right', position, bounds, dimension)) + right;
                    }
                    else if (position.left !== 0) {
                        left = (repeatX || !recalibrate ? position.left : getPercentOffset('left', position, bounds, dimension)) + left;
                    }
                    const width = imageData.width as number;
                    const height = imageData.height as number;
                    if (top !== 0) {
                        if (top < 0 && height > boundsHeight) {
                            top = Math.max(top, boundsHeight - height);
                        }
                        imageData.top = formatPX(top);
                    }
                    if (right !== 0) {
                        imageData.right = formatPX(right);
                    }
                    if (bottom !== 0) {
                        imageData.bottom = formatPX(bottom);
                    }
                    if (left !== 0) {
                        if (left < 0 && width > boundsWidth) {
                            left = Math.max(left, boundsWidth - width);
                        }
                        imageData.left = formatPX(left);
                    }
                    if (width) {
                        imageData.width = formatPX(width);
                    }
                    if (height) {
                        imageData.height = formatPX(height);
                    }
                    result.push(imageData);
                }
            }
            return result;
        }
        return undefined;
    }
}