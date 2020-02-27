import { ResourceBackgroundOptions } from '../../../../@types/android/extension';
import { GradientTemplate } from '../../../../@types/android/resource';

import Resource from '../../resource';
import ResourceSvg from './svg';
import View from '../../view';

import { EXT_ANDROID, SUPPORT_ANDROID, SUPPORT_ANDROID_X, XMLNS_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from '../../lib/enumeration';

import LAYERLIST_TMPL from '../../template/layer-list';
import SHAPE_TMPL from '../../template/shape';
import VECTOR_TMPL from '../../template/vector';

const $lib = squared.lib;

const { reduceRGBA } = $lib.color;
const { formatPercent, formatPX, getBackgroundPosition } = $lib.css;
const { truncate } = $lib.math;
const { CHAR, CSS, XML } = $lib.regex;
const { delimitString, flatArray, isEqual, objectMap, resolvePath } = $lib.util;
const { applyTemplate } = $lib.xml;

const { BOX_STANDARD, NODE_RESOURCE } = squared.base.lib.enumeration;

const NodeUI = squared.base.NodeUI;

interface PositionAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

interface BackgroundImageData extends PositionAttribute {
    start?: string;
    end?: string;
    bitmap?: BitmapData[];
    rotate?: StringMap[];
    gradient?: GradientTemplate;
    drawable?: string;
    width?: string;
    height?: string;
    gravity?: string;
    order: number;
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
        let result: Undef<StandardMap>;
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

function insertDoubleBorder(items: StandardMap[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, indentWidth = 0, corners?: StringMap) {
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
    const result: GradientTemplate = { type, item: false, positioning: true };
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
            const { width, height } = <Dimension> dimension;
            let positionX = angleExtent.x;
            let positionY = angleExtent.y;
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

function createLayerList(boxStyle: BoxStyle, images?: BackgroundImageData[], borderOnly = true) {
    const item: StandardMap[] = [];
    const result: StandardMap[] = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
    const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
    if (solid) {
        item.push({ shape: { 'android:shape': 'rectangle', solid } });
    }
    if (images) {
        for (const image of images) {
            const gradient = image.gradient;
            if (gradient) {
                item.push({ shape: { 'android:shape': 'rectangle', gradient } });
            }
            else {
                item.push(image);
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
const isCenterAlignment = (horizontal: string, vertical: string) => horizontal === 'center_horizontal' && vertical === 'center_vertical';

export function convertColorStops(list: ColorStop[], precision?: number) {
    return objectMap(list, item => ({ color: getColorValue(item.color), offset: truncate(item.offset, precision) }));
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

    private _resourceSvgInstance?: ResourceSvg<T>;

    public beforeParseDocument() {
        const application = <android.base.Application<T>> this.application;
        const controller = <android.base.Controller<T>> this.controller;
        this._resourceSvgInstance = controller.localSettings.svg.enabled ? <ResourceSvg<T>> application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
    }

    public afterResources() {
        const settings = (<android.base.Application<T>> this.application).userSettings;
        const drawOutline = this.options.drawOutlineAsInsetBorder;
        let themeBackground = false;
        const setBodyBackground = (name: string, parent: string, value: string) => {
            Resource.addTheme({
                name,
                parent,
                items: {
                    'android:windowBackground': value,
                    'android:windowFullscreen': 'true',
                    'android:fitsSystemWindows': 'true'
                }
            });
            themeBackground = true;
        };
        const deleteBodyWrapper = (body: T, wrapper: T) => {
            if (body !== wrapper && !wrapper.hasResource(NODE_RESOURCE.BOX_SPACING) && body.percentWidth === 0) {
                const maxWidth = body.cssInitial('maxWidth');
                if (maxWidth === '' || maxWidth === 'auto' || maxWidth === '100%') {
                    const children = wrapper.renderChildren;
                    if (children.length === 1) {
                        wrapper.removeTry(children[0]);
                    }
                }
            }
        };
        const setDrawableBackground = (node: T, value: string) => {
            if (value !== '') {
                const drawable = '@drawable/' + Resource.insertStoredAsset('drawables', node.containerName.toLowerCase() + '_' + node.controlId, value);
                if (!themeBackground) {
                    const innerWrapped = node.innerMostWrapped as T;
                    if (innerWrapped.documentBody) {
                        if (!setHtmlBackground(node) && (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY)) {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            deleteBodyWrapper(innerWrapped, node);
                            return;
                        }
                    }
                    else if (node.tagName === 'HTML') {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                        return;
                    }
                }
                node.android('background', drawable, false);
            }
        };
        const setHtmlBackground = (node: T) => {
            const parent = <Null<T>> node.actualParent;
            if (parent?.visible === false) {
                const background = parent.android('background');
                if (background !== '') {
                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                    return true;
                }
            }
            return false;
        };
        for (const node of this.cacheProcessing) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored) {
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
                            if (!themeBackground) {
                                const innerWrapped = node.innerMostWrapped as T;
                                if (innerWrapped.documentBody) {
                                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                    deleteBodyWrapper(innerWrapped, node);
                                    continue;
                                }
                            }
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

    public getDrawableBorder(data: BoxStyle, outline?: BorderAttribute, images?: BackgroundImageData[], indentWidth = 0, borderOnly = false) {
        const borders: Undef<BorderAttribute>[] = new Array(4);
        const borderVisible: boolean[] = new Array(4);
        const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
        const indentOffset = indentWidth > 0 ? formatPX(indentWidth) : '';
        let borderStyle = true;
        let borderAll = true;
        let border: Undef<BorderAttribute>;
        let borderData: Undef<BorderAttribute>;
        let shapeData: Undef<StandardMap[]>;
        let layerListData: Undef<StandardMap[]>;
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
                const layer = layerListData[0];
                setBorderStyle(layer, borders, 0, corners, indentWidth, indentOffset);
                setBorderStyle(layer, borders, 3, corners, indentWidth, indentOffset);
                setBorderStyle(layer, borders, 2, corners, indentWidth, indentOffset);
                setBorderStyle(layer, borders, 1, corners, indentWidth, indentOffset);
            }
        }
        return [shapeData, layerListData];
    }

    public getDrawableImages(node: T, data: BoxStyle) {
        const backgroundImage = data.backgroundImage;
        if (backgroundImage || node.extracted && node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
            const resource = <android.base.Resource<T>> this.resource;
            const bounds = node.bounds;
            const screenDimension = node.localSettings.screenDimension;
            let { width: boundsWidth, height: boundsHeight } = bounds;
            if (node.documentBody) {
                boundsWidth = screenDimension.width;
                boundsHeight = screenDimension.height;
            }
            else if (node.documentRoot) {
                if (!constrictedWidth(node)) {
                    boundsWidth = screenDimension.width;
                }
                if (node.cssInitial('height') === '100%' || node.cssInitial('minHeight') === '100%') {
                    boundsHeight = screenDimension.height;
                }
            }
            else if (node.ascend({ condition: (item: T) => constrictedWidth(item) && (!item.layoutElement || item === node), startSelf: true }).length === 0) {
                boundsWidth = Math.min(boundsWidth, screenDimension.width);
            }
            const result: BackgroundImageData[] = [];
            const images: (string | GradientTemplate)[] = [];
            const imageDimensions: Undef<Dimension>[] = [];
            const backgroundPosition: BoxRectPosition[] = [];
            const backgroundPositionX = data.backgroundPositionX.split(XML.SEPARATOR);
            const backgroundPositionY = data.backgroundPositionY.split(XML.SEPARATOR);
            let backgroundRepeat = data.backgroundRepeat.split(XML.SEPARATOR);
            let backgroundSize = data.backgroundSize.split(XML.SEPARATOR);
            let length = 0;
            if (backgroundImage) {
                const svgInstance = this._resourceSvgInstance;
                const q = backgroundImage.length;
                backgroundRepeat = fillBackgroundAttribute(backgroundRepeat, q);
                backgroundSize = fillBackgroundAttribute(backgroundSize, q);
                let modified = false;
                for (let i = 0; i < q; i++) {
                    let value = backgroundImage[i];
                    let valid = false;
                    if (typeof value === 'string') {
                        if (value !== 'initial') {
                            if (svgInstance) {
                                const [parentElement, element] = svgInstance.createSvgElement(node, value);
                                if (parentElement && element) {
                                    const drawable = svgInstance.createSvgDrawable(node, element);
                                    if (drawable !== '') {
                                        images[length] = drawable;
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
                                    if (uri.startsWith('data:image/')) {
                                        const rawData = resource.getRawData(uri);
                                        if (rawData) {
                                            const { base64, filename } = rawData;
                                            if (base64) {
                                                images[length] = filename.substring(0, filename.lastIndexOf('.'));
                                                imageDimensions[length] = rawData;
                                                resource.writeRawImage(filename, base64);
                                                valid = true;
                                            }
                                        }
                                    }
                                    else {
                                        value = resolvePath(uri);
                                        const src = resource.addImageSet({ mdpi: value });
                                        images[length] = src;
                                        if (src !== '') {
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
                        backgroundPosition[length] = getBackgroundPosition(checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'), node.actualDimension, {
                            fontSize: node.fontSize,
                            imageDimension: imageDimensions[length],
                            imageSize: backgroundSize[i],
                            screenDimension
                        });
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
            if (node.extracted) {
                if (length === 0) {
                    backgroundRepeat.length = 0;
                    backgroundSize.length = 0;
                }
                const embedded = node.extracted.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE'));
                for (const image of embedded) {
                    const element = <HTMLImageElement> image.element;
                    const src = resource.addImageSrc(element);
                    if (src !== '') {
                        const imageDimension = image.bounds;
                        images[length] = src;
                        backgroundRepeat[length] = 'no-repeat';
                        backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                        const position = getBackgroundPosition(
                            image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageDimension.left - bounds.left + node.borderLeftWidth, imageDimension.top - bounds.top + node.borderTopWidth),
                            node.actualDimension,
                            {
                                fontSize: node.fontSize,
                                imageDimension,
                                screenDimension
                            }
                        );
                        const stored = resource.getImage(element.src);
                        if (!node.hasPX('width')) {
                            const offsetStart = (stored?.width || 0) + position.left - (node.paddingLeft + node.borderLeftWidth);
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
            const documentBody = node.innerMostWrapped.documentBody;
            for (let i = length - 1, j = 0; i >= 0; i--) {
                const value = images[i];
                const imageData: BackgroundImageData = { order: Number.POSITIVE_INFINITY };
                if (typeof value === 'object' && !value.positioning) {
                    imageData.gravity = 'fill';
                    imageData.gradient = value;
                    continue;
                }
                const position = backgroundPosition[i];
                const size = backgroundSize[i];
                const padded = position.orientation.length === 4;
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
                let posTop = NaN;
                let posRight = NaN;
                let posBottom = NaN;
                let posLeft = NaN;
                let negativeOffset = 0;
                let offsetX = false;
                let offsetY = false;
                let width = 0;
                let height = 0;
                let tileModeX = '';
                let tileModeY = '';
                let gravityX = '';
                let gravityY = '';
                let gravityAlign = '';
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
                switch (repeat) {
                    case 'repeat':
                        tileModeX = 'repeat';
                        tileModeY = 'repeat';
                        break;
                    case 'repeat-x':
                        tileModeX = 'repeat';
                        tileModeY = 'disabled';
                        break;
                    case 'repeat-y':
                        tileModeX = 'disabled';
                        tileModeY = 'repeat';
                        break;
                    default:
                        tileModeX = 'disabled';
                        tileModeY = 'disabled';
                        break;
                }
                switch (position.horizontal) {
                    case 'left':
                    case '0%':
                    case '0px':
                        gravityX = node.localizeString('left');
                        if (padded) {
                            posLeft = 0;
                            offsetX = true;
                        }
                        break;
                    case 'center':
                    case '50%':
                        gravityX = 'center_horizontal';
                        break;
                    case 'right':
                    case '100%':
                        gravityX = node.localizeString('right');
                        posRight = 0;
                        if (padded) {
                            offsetX = true;
                        }
                        break;
                    default: {
                        const percent = position.leftAsPercent;
                        if (percent === 0.5) {
                            gravityX = 'center_horizontal';
                            if (padded) {
                                posLeft = 0;
                                offsetX = true;
                            }
                        }
                        else if (percent < 1) {
                            gravityX = 'left';
                            posLeft = 0;
                            offsetX = true;
                        }
                        else {
                            gravityX = 'right';
                            posRight = 0;
                            offsetX = true;
                        }
                        break;
                    }
                }
                switch (position.vertical) {
                    case 'top':
                    case '0%':
                    case '0px':
                        gravityY = 'top';
                        if (padded) {
                            posTop = 0;
                            offsetY = true;
                        }
                        break;
                    case 'center':
                    case '50%':
                        gravityY = 'center_vertical';
                        break;
                    case 'bottom':
                    case '100%':
                        gravityY = 'bottom';
                        posBottom = 0;
                        if (padded) {
                            offsetY = true;
                        }
                        break;
                    default: {
                        const percent = position.topAsPercent;
                        if (percent === 0.5) {
                            gravityY = 'center_vertical';
                            if (padded) {
                                posTop = 0;
                                offsetY = true;
                            }
                        }
                        else if (percent < 1) {
                            gravityY = 'top';
                            posTop = 0;
                            offsetY = true;
                        }
                        else {
                            gravityY = 'bottom';
                            posBottom = 0;
                            offsetY = true;
                        }
                        break;
                    }
                }
                switch (size) {
                    case 'auto':
                    case 'auto auto':
                    case 'initial':
                        if (typeof value !== 'string') {
                            gravityAlign = 'fill';
                        }
                        break;
                    case '100%':
                    case '100% 100%':
                    case '100% auto':
                    case 'auto 100%':
                    case 'contain':
                    case 'cover':
                    case 'round':
                        tileModeX = '';
                        tileModeY = '';
                        gravityAlign = 'fill';
                        if (documentBody) {
                            const visibleStyle = node.visibleStyle;
                            visibleStyle.backgroundRepeat = true;
                            visibleStyle.backgroundRepeatY = true;
                        }
                        break;
                    default:
                        if (size !== '') {
                            size.split(' ').forEach((dimen, index) => {
                                if (dimen === '100%') {
                                    if (index === 0) {
                                        gravityAlign = 'fill_horizontal';
                                    }
                                    else {
                                        gravityAlign = delimitString({ value: gravityAlign }, 'fill_vertical');
                                    }
                                }
                                else if (dimen !== 'auto') {
                                    if (index === 0) {
                                        if (tileModeX !== 'repeat') {
                                            width = node.parseUnit(dimen, 'width', false);
                                        }
                                    }
                                    else if (tileModeY !== 'repeat') {
                                        height = node.parseUnit(dimen, 'height', false);
                                    }
                                }
                            });
                        }
                        break;
                }
                let autoFit = node.is(CONTAINER_NODE.IMAGE) || typeof value !== 'string';
                let resizedWidth = false;
                let resizedHeight = false;
                let unsizedWidth = false;
                let unsizedHeight = false;
                let recalibrate = true;
                if (dimension) {
                    const ratioWidth = dimenWidth / boundsWidth;
                    const ratioHeight = dimenHeight / boundsHeight;
                    const getImageWidth = () => dimenWidth * height / dimenHeight;
                    const getImageHeight = () => dimenHeight * width / dimenWidth;
                    const getImageRatioWidth = () => boundsWidth * (ratioWidth / ratioHeight);
                    const getImageRatioHeight = () => boundsHeight * (ratioHeight / ratioWidth);
                    const resetGravityPosition = (gravity: boolean, coordinates: boolean) => {
                        tileModeX = '';
                        tileModeY = '';
                        gravityAlign = '';
                        if (gravity) {
                            gravityX = '';
                            gravityY = '';
                        }
                        if (coordinates) {
                            posTop = NaN;
                            posRight = NaN;
                            posBottom = NaN;
                            posLeft = NaN;
                            offsetX = false;
                            offsetY = false;
                        }
                        recalibrate = false;
                    };
                    switch (size) {
                        case '100%':
                        case '100% 100%':
                        case '100% auto':
                        case 'auto 100%':
                            if (dimenHeight >= boundsHeight) {
                                if (dimenWidth < boundsWidth) {
                                    width = getImageRatioWidth();
                                    height = boundsHeight;
                                }
                                else {
                                    unsizedWidth = true;
                                    unsizedHeight = true;
                                    height = boundsHeight;
                                }
                                autoFit = true;
                                break;
                            }
                        case 'cover': {
                            const covering = size === 'cover';
                            resetGravityPosition(covering, !covering);
                            if (ratioWidth < ratioHeight) {
                                width = boundsWidth;
                                height = getImageRatioHeight();
                                if (height > boundsHeight) {
                                    const percent = position.topAsPercent;
                                    if (percent !== 0) {
                                        top = Math.round((boundsHeight - height) * percent);
                                    }
                                    if (!node.hasPX('height')) {
                                        node.css('height', formatPX(boundsHeight - node.contentBoxHeight));
                                    }
                                }
                            }
                            else if (ratioWidth > ratioHeight) {
                                width = getImageRatioWidth();
                                height = boundsHeight;
                                if (node.hasWidth && width > boundsWidth) {
                                    const percent = position.leftAsPercent;
                                    if (percent !== 0) {
                                        left = Math.round((boundsWidth - width) * percent);
                                    }
                                }
                            }
                            else {
                                gravityAlign = 'fill';
                            }
                            break;
                        }
                        case 'contain':
                            resetGravityPosition(true, true);
                            if (ratioWidth > ratioHeight) {
                                height = getImageRatioHeight();
                                width = dimenWidth < boundsWidth ? getImageWidth() : boundsWidth;
                                gravityY = 'center_vertical';
                                gravityAlign = 'fill_horizontal';
                            }
                            else if (ratioWidth < ratioHeight) {
                                width = getImageRatioWidth();
                                height = dimenHeight < boundsHeight ? getImageHeight() : boundsHeight;
                                gravityX = 'center_horizontal';
                                gravityAlign = 'fill_vertical';
                            }
                            else {
                                gravityAlign = 'fill';
                            }
                            break;
                        default:
                            if (width === 0 && height > 0) {
                                width = getImageWidth();
                            }
                            if (height === 0 && width > 0) {
                                height = getImageHeight();
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
                    if (!isNaN(posRight)) {
                        right += clipRight
                    }
                    else {
                        left += clipLeft;
                    }
                    if (!isNaN(posBottom)) {
                        bottom += clipBottom;
                    }
                    else {
                        top += clipTop;
                    }
                    gravityX = '';
                    gravityY = '';
                    recalibrate = false;
                }
                else if (recalibrate) {
                    const backgroundOrigin = data.backgroundOrigin;
                    if (backgroundOrigin) {
                        if (tileModeX !== 'repeat') {
                            if (!isNaN(posRight)) {
                                right += backgroundOrigin.right;
                            }
                            else {
                                left += backgroundOrigin.left;
                            }
                        }
                        if (tileModeY !== 'repeat') {
                            if (!isNaN(posBottom)) {
                                bottom += backgroundOrigin.bottom;
                            }
                            else {
                                top += backgroundOrigin.top;
                            }
                        }
                        recalibrate = false;
                    }
                    else {
                        if (tileModeX !== 'repeat') {
                            switch (gravityX) {
                                case 'start':
                                case 'left':
                                    if (position.left === 0) {
                                        const borderWidth = node.borderLeftWidth;
                                        if (borderWidth > 0 && dimenWidth < boundsWidth) {
                                            left += borderWidth;
                                        }
                                    }
                                    break;
                                case 'right':
                                    if (position.right === 0) {
                                        const borderWidth = node.borderRightWidth;
                                        if (borderWidth > 0 && dimenWidth < boundsWidth) {
                                            right += borderWidth;
                                        }
                                    }
                                    break;
                            }
                        }
                        if (tileModeY !== 'repeat') {
                            switch (gravityY) {
                                case 'top':
                                    if (position.top === 0) {
                                        const borderWidth = node.borderTopWidth;
                                        if (borderWidth > 0 && dimenHeight < boundsHeight) {
                                            top += borderWidth;
                                        }
                                    }
                                    break;
                                case 'bottom':
                                    if (position.bottom === 0) {
                                        const borderWidth = node.borderBottomWidth;
                                        if (borderWidth > 0 && dimenHeight < boundsHeight) {
                                            bottom += borderWidth;
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                    if (!autoFit && !documentBody) {
                        if (dimenWidth > boundsWidth) {
                            width = boundsWidth - (offsetX ? Math.min(position.left, 0) : 0);
                            let fill = true;
                            if (tileModeY === 'repeat' && gravityX !== '') {
                                let clearTile = false;
                                switch (gravityX) {
                                    case 'start':
                                    case 'left':
                                        right += boundsWidth - dimenWidth;
                                        if (offsetX) {
                                            const offset = position.left;
                                            if (offset < 0) {
                                                negativeOffset = offset;
                                            }
                                            width = 0;
                                            right -= offset;
                                            fill = false;
                                            gravityX = 'right';
                                            clearTile = true;
                                        }
                                        else {
                                            gravityX = '';
                                            clearTile = dimenWidth / 2 >= boundsWidth;
                                        }
                                        posLeft = NaN;
                                        posRight = 0;
                                        break;
                                    case 'center_horizontal':
                                        gravityX += '|fill_vertical';
                                        clearTile = true;
                                        break;
                                    case 'right':
                                        left += boundsWidth - dimenWidth;
                                        if (offsetX) {
                                            const offset = position.right;
                                            if (offset < 0) {
                                                negativeOffset = offset;
                                            }
                                            width = 0;
                                            left -= offset;
                                            fill = false;
                                            gravityX = node.localizeString('left');
                                            clearTile = true;
                                        }
                                        else {
                                            gravityX = '';
                                            clearTile = dimenWidth / 2 >= boundsWidth;
                                        }
                                        posLeft = 0;
                                        posRight = NaN;
                                        break;
                                }
                                offsetX = false;
                                if (clearTile) {
                                    tileModeY = '';
                                }
                                gravityY = '';
                            }
                            if (fill) {
                                gravityAlign = delimitString({ value: gravityAlign }, 'fill_horizontal');
                            }
                            if (tileModeX !== 'disabled') {
                                tileModeX = '';
                            }
                            resizedWidth = true;
                        }
                        if (dimenHeight > boundsHeight) {
                            height = boundsHeight;
                            let fill = true;
                            if (tileModeX === 'repeat' && gravityY !== '') {
                                let clearTile = false;
                                switch (gravityY) {
                                    case 'top':
                                        bottom += boundsHeight - dimenHeight;
                                        if (offsetY) {
                                            const offset = position.top;
                                            if (offset < 0) {
                                                negativeOffset = offset;
                                            }
                                            height = 0;
                                            bottom -= offset;
                                            fill = false;
                                            gravityY = 'bottom';
                                            clearTile = true;
                                        }
                                        else {
                                            gravityY = '';
                                            clearTile = dimenHeight / 2 >= boundsHeight;
                                        }
                                        posTop = NaN;
                                        posBottom = 0;
                                        break;
                                    case 'center_vertical':
                                        gravityY += '|fill_horizontal';
                                        clearTile = true;
                                        break;
                                    case 'bottom':
                                        top += boundsHeight - dimenHeight;
                                        if (offsetY) {
                                            const offset = position.bottom;
                                            if (offset < 0) {
                                                negativeOffset = offset;
                                            }
                                            height = 0;
                                            top -= offset;
                                            fill = false;
                                            gravityY = 'top';
                                            clearTile = true;
                                        }
                                        else {
                                            gravityY = '';
                                            clearTile = dimenHeight / 2 >= boundsHeight;
                                        }
                                        posTop = 0;
                                        posBottom = NaN;
                                        break;
                                }
                                if (clearTile) {
                                    tileModeX = '';
                                }
                                gravityX = '';
                                offsetY = false;
                            }
                            if (tileModeY !== 'disabled') {
                                tileModeY = '';
                            }
                            if (fill) {
                                gravityAlign = delimitString({ value: gravityAlign }, 'fill_vertical');
                            }
                            resizedHeight = true;
                        }
                    }
                }
                switch (node.controlName) {
                    case SUPPORT_ANDROID.TOOLBAR:
                    case SUPPORT_ANDROID_X.TOOLBAR:
                        gravityY = '';
                        gravityAlign = delimitString({ value: gravityAlign }, 'fill_vertical');
                        break;
                }
                if (!autoFit) {
                    if (width === 0 && dimenWidth < boundsWidth && tileModeX === 'disabled') {
                        width = dimenWidth
                        unsizedWidth = true;
                    }
                    if (height === 0 && dimenHeight < boundsHeight && tileModeY === 'disabled') {
                        height = dimenHeight;
                        unsizedHeight = true;
                    }
                    const originalX = gravityX;
                    if (tileModeX === 'repeat') {
                        switch (gravityY) {
                            case 'top':
                                if (!isNaN(posTop)) {
                                    tileModeX = '';
                                }
                                gravityY = '';
                                break;
                            case 'bottom':
                                if (width > 0 && !unsizedWidth) {
                                    tileModeX = '';
                                }
                                else if (unsizedHeight) {
                                    width = dimenWidth;
                                    gravityAlign = delimitString({ value: gravityAlign }, 'fill_horizontal');
                                    if (dimenHeight >= dimenWidth) {
                                        tileModeX = '';
                                    }
                                }
                                break;
                        }
                        gravityX = '';
                    }
                    if (tileModeY === 'repeat') {
                        switch (originalX) {
                            case 'start':
                            case 'left':
                                if (!isNaN(posLeft)) {
                                    tileModeY = '';
                                }
                                gravityX = '';
                                break;
                            case 'center_horizontal':
                                tileModeY = '';
                                break;
                            case 'right':
                            case 'end':
                                if (height > 0 && !unsizedHeight) {
                                    tileModeY = '';
                                }
                                else if (unsizedWidth) {
                                    height = dimenHeight;
                                    gravityAlign = delimitString({ value: gravityAlign }, 'fill_vertical');
                                    if (dimenWidth >= dimenHeight) {
                                        tileModeY = '';
                                    }
                                }
                                break;
                        }
                        gravityY = '';
                    }
                    if (gravityX !== '' && !resizedWidth) {
                        gravityAlign = delimitString({ value: gravityAlign }, gravityX);
                        gravityX = '';
                    }
                    if (gravityY !== '' && !resizedHeight) {
                        gravityAlign = delimitString({ value: gravityAlign }, gravityY);
                        gravityY = '';
                    }
                }
                let src: Undef<string>
                if (typeof value === 'string') {
                    src = '@drawable/' + value;
                }
                else if (value.item) {
                    if (width === 0) {
                        width = (dimension || NodeUI.refitScreen(node, node.actualDimension)).width;
                    }
                    if (height === 0) {
                        height = (dimension || NodeUI.refitScreen(node, node.actualDimension)).height;
                    }
                    const gradient = Resource.insertStoredAsset(
                        'drawables',
                        `${node.controlId}_gradient_${i + 1}`,
                        applyTemplate('vector', VECTOR_TMPL, [{
                            'xmlns:android': XMLNS_ANDROID.android,
                            'xmlns:aapt': XMLNS_ANDROID.aapt,
                            'android:width': formatPX(width),
                            'android:height': formatPX(height),
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
                    if (gradient !== '') {
                        src = '@drawable/' + gradient;
                        imageData.order = j++;
                    }
                    if (gravityX === 'left' || gravityX === 'start') {
                        gravityX = '';
                    }
                    if (gravityY === 'top') {
                        gravityY = '';
                    }
                    if (gravityAlign !== 'fill') {
                        if (tileModeX === 'repeat' && tileModeY === 'repeat') {
                            gravityAlign = 'fill';
                        }
                        else if (tileModeX === 'repeat') {
                            if (gravityAlign === 'fill_vertical') {
                                gravityAlign = 'fill';
                            }
                            else {
                                gravityAlign = 'fill_horizontal';
                            }
                        }
                        else if (tileModeY === 'repeat') {
                            if (gravityAlign === 'fill_horizontal') {
                                gravityAlign = 'fill';
                            }
                            else {
                                gravityAlign = 'fill_vertical';
                            }
                        }
                    }
                }
                const gravity = isCenterAlignment(gravityX, gravityY) ? 'center' : delimitString({ value: '' }, gravityX, gravityY);
                if (src) {
                    if (!autoFit && (gravityAlign !== '' && gravity !== '' || tileModeX === 'repeat' || tileModeY === 'repeat' || documentBody) || unsizedWidth || unsizedHeight) {
                        let tileMode = '';
                        if (tileModeX === 'disabled' && tileModeY === 'disabled') {
                            tileMode = 'disabled';
                            tileModeX = '';
                            tileModeY = '';
                        }
                        else if (tileModeX === 'repeat' && tileModeY === 'repeat') {
                            tileMode = 'repeat';
                            tileModeX = '';
                            tileModeY = '';
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
                        imageData.gravity = delimitString({ value: gravity }, gravityAlign);
                        imageData.drawable = src;
                    }
                    if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                        if (!isNaN(posBottom)) {
                            if (offsetY) {
                                bottom += position.bottom;
                            }
                            bottom += posBottom;
                            if (bottom !== 0) {
                                imageData.bottom = formatPX(bottom);
                            }
                            if (negativeOffset < 0) {
                                imageData.top = formatPX(negativeOffset);
                            }
                        }
                        else {
                            if (offsetY) {
                                top += position.top;
                            }
                            if (!isNaN(posTop)) {
                                top += posTop;
                            }
                            if (top !== 0) {
                                imageData.top = formatPX(top);
                            }
                            if (negativeOffset < 0) {
                                imageData.bottom = formatPX(negativeOffset);
                            }
                        }
                        if (!isNaN(posRight)) {
                            if (offsetX) {
                                right += position.right;
                            }
                            right += posRight;
                            if (right !== 0) {
                                imageData[node.localizeString('right')] = formatPX(right);
                            }
                            if (negativeOffset < 0) {
                                imageData[node.localizeString('left')] = formatPX(negativeOffset);
                            }
                        }
                        else {
                            if (offsetX) {
                                left += position.left;
                            }
                            if (!isNaN(posLeft)) {
                                left += posLeft;
                            }
                            if (left !== 0) {
                                imageData[node.localizeString('left')] = formatPX(left);
                            }
                            if (negativeOffset < 0) {
                                imageData[node.localizeString('right')] = formatPX(negativeOffset);
                            }
                        }
                        if (width > 0) {
                            imageData.width = formatPX(width);
                        }
                        if (height > 0) {
                            imageData.height = formatPX(height);
                        }
                        result.push(imageData);
                    }
                }
            }
            return result.sort((a, b) => {
                const orderA = a.order;
                const orderB = b.order;
                if (orderA === orderB) {
                    return 0;
                }
                return orderA < orderB ? -1 : 1;
            });
        }
        return undefined;
    }
}