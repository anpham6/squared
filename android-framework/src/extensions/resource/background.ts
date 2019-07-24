import { UserSettingsAndroid } from '../../../../@types/android/application';
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

interface PositionAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

interface BackgroundImageData extends PositionAttribute {
    bitmap: BitmapData[] | false;
    rotate: StringMap[] | false;
    gradient: GradientTemplate | false;
    drawable?: string;
    width?: string;
    height?: string;
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

const {
    color: $color,
    css: $css,
    math: $math,
    regex: $regex,
    util: $util,
    xml: $xml
} = squared.lib;

const $e = squared.base.lib.enumeration;

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): ShapeStrokeData {
    const { style, color } = border;
    const width = roundFloat(border.width);
    const result = getStrokeColor(color);
    switch (style) {
        case 'solid':
            break;
        case 'dotted':
            result.dashWidth = $css.formatPX(width);
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
            result.dashWidth = $css.formatPX(dashWidth);
            result.dashGap = $css.formatPX(dashGap);
            break;
        }
        case 'inset':
        case 'outset':
        case 'groove':
        case 'ridge':
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
                const reduced = $color.reduceRGBA(rgba, percent, color.valueAsRGBA);
                if (reduced) {
                    return getStrokeColor(reduced);
                }
            }
    }
    return result;
}

function getBorderStroke(border: BorderAttribute, direction = -1, hasInset = false, isInset = false) {
    let result: ExternalData | undefined;
    if (border) {
        if (isAlternatingBorder(border.style)) {
            const width = parseFloat(border.width);
            result = getBorderStyle(border, direction, !isInset);
            if (isInset) {
                result.width = $css.formatPX(Math.ceil(width / 2) * 2);
            }
            else {
                result.width = hasInset ? $css.formatPX(Math.ceil(width / 2)) : $css.formatPX(roundFloat(border.width));
            }
        }
        else {
            result = getBorderStyle(border);
            result.width = $css.formatPX(roundFloat(border.width));
        }
    }
    return result;
}

function getBorderRadius(radius?: string[]): StringMap | undefined {
    if (radius) {
        const lengthA = radius.length;
        if (lengthA === 1) {
            return { radius: radius[0] };
        }
        else {
            let corners: string[];
            if (lengthA === 8) {
                corners = [];
                for (let i = 0; i < lengthA; i += 2) {
                    corners.push($css.formatPX((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2));
                }
            }
            else {
                corners = radius;
            }
            const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
            const result = {};
            let valid = false;
            const lengthB = corners.length;
            for (let i = 0; i < lengthB; i++) {
                if (corners[i] !== '0px') {
                    result[`${boxModel[i]}Radius`] = corners[i];
                    valid = true;
                }
            }
            if (valid) {
                return result;
            }
        }
    }
    return undefined;
}

function getBackgroundColor(value: string | undefined) {
    const color = getColorValue(value, false);
    return color !== '' ? { color } : undefined;
}

function isAlternatingBorder(value: string) {
    switch (value) {
        case 'groove':
        case 'ridge':
        case 'inset':
        case 'outset':
            return true;
        default:
            return false;
    }
}

function insertDoubleBorder(items: ExternalData[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, indentWidth = 0, corners?: StringMap) {
    const width = roundFloat(border.width);
    const borderWidth = Math.max(1, Math.floor(width / 3));
    const indentOffset = indentWidth > 0 ? $css.formatPX(indentWidth) : '';
    let hideOffset = '-' + $css.formatPX(borderWidth + indentWidth + 1);
    items.push({
        top: top ? indentOffset : hideOffset,
        right: right ? indentOffset : hideOffset,
        bottom: bottom ? indentOffset : hideOffset,
        left: left ? indentOffset :  hideOffset,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: $css.formatPX(borderWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
    const insetWidth = width - borderWidth + indentWidth;
    const drawOffset = $css.formatPX(insetWidth);
    hideOffset = '-' + $css.formatPX(insetWidth + 1);
    items.push({
        top: top ? drawOffset : hideOffset,
        right: right ? drawOffset : hideOffset,
        bottom: bottom ? drawOffset : hideOffset,
        left: left ? drawOffset : hideOffset,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: $css.formatPX(borderWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
}

function checkBackgroundPosition(value: string, adjacent: string, fallback: string) {
    const initial = value === 'initial' || value === 'unset';
    if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
        return $regex.CHAR.LOWERCASE.test(value) ? `${initial ? fallback : value} 0px` : `${fallback} ${value}`;
    }
    else if (initial) {
        return '0px';
    }
    return value;
}

function createBackgroundGradient(gradient: Gradient, api = BUILD_ANDROID.LOLLIPOP, precision?: number) {
    const result: GradientTemplate = {
        type: gradient.type,
        item: false
    };
    const hasStop = api >= BUILD_ANDROID.LOLLIPOP;
    switch (gradient.type) {
        case 'conic': {
            const conic = <ConicGradient> gradient;
            const center = conic.center;
            result.type = 'sweep';
            if (hasStop) {
                result.centerX = (center.left * 2).toString();
                result.centerY = (center.top * 2).toString();
            }
            else {
                result.centerX = $css.formatPercent(center.leftAsPercent);
                result.centerY = $css.formatPercent(center.topAsPercent);
            }
            break;
        }
        case 'radial': {
            const radial = <RadialGradient> gradient;
            const center = radial.center;
            if (hasStop) {
                result.gradientRadius = radial.radius.toString();
                result.centerX = center.left.toString();
                result.centerY = center.top.toString();
            }
            else {
                result.gradientRadius = $css.formatPX(radial.radius);
                result.centerX = $css.formatPercent(center.leftAsPercent);
                result.centerY = $css.formatPercent(center.topAsPercent);
            }
            break;
        }
        case 'linear': {
            const linear = <LinearGradient> gradient;
            const { width, height } = <Dimension> linear.dimension;
            const angle = linear.angle;
            let positionX = linear.angleExtent.x;
            let positionY = linear.angleExtent.y;
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
    }
    const colorStops = gradient.colorStops;
    if (hasStop) {
        result.item = convertColorStops(colorStops);
    }
    else {
        result.startColor = getColorValue(colorStops[0].color);
        result.endColor = getColorValue(colorStops[colorStops.length - 1].color);
        if (colorStops.length > 2) {
            result.centerColor = getColorValue(colorStops[Math.floor(colorStops.length / 2)].color);
        }
    }
    return result;
}

function getPercentOffset(direction: string, position: BoxRectPosition, backgroundSize: string, bounds: BoxRectDimension, dimension?: Dimension): number {
    if (dimension) {
        const orientation = position.orientation;
        const sign = backgroundSize === 'cover' || backgroundSize === 'contain' ? -1 : 1;
        if (direction === 'left' || direction === 'right') {
            if (backgroundSize !== 'cover') {
                const value = orientation.length === 4 ? orientation[1] : orientation[0];
                if ($css.isPercent(value)) {
                    const percent = direction === 'left' ? position.leftAsPercent : position.rightAsPercent;
                    let result = percent * (bounds.width - dimension.width);
                    if (sign === -1) {
                        result = Math.abs(result);
                        if (percent > 0) {
                            result *= -1;
                        }
                    }
                    return result;
                }
            }
            else {
                return 0;
            }
        }
        else if (backgroundSize !== 'contain') {
            const value = orientation.length === 4 ? orientation[3] : orientation[1];
            if ($css.isPercent(value)) {
                const percent = direction === 'top' ? position.topAsPercent : position.bottomAsPercent;
                let result = percent * (bounds.height - dimension.height);
                if (sign === -1) {
                    result = Math.abs(result);
                    if (percent > 0) {
                        result *= -1;
                    }
                }
                return result;
            }
        }
        else {
            return 0;
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
    if (border.style === 'double' && width === 2) {
        return 3;
    }
    return width;
}

function getColorValue(value: ColorData | string | undefined, transparency = true) {
    const color = Resource.addColor(value, transparency);
    return color !== '' ? `@color/${color}` : '';
}

const roundFloat = (value: string) => Math.round(parseFloat(value));

const getStrokeColor = (value: ColorData): ShapeStrokeData => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });

const isInsetBorder = (border: BorderAttribute) => border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && roundFloat(border.width) > 1;

export function convertColorStops(list: ColorStop[], precision?: number) {
    const result: GradientColorStop[] = [];
    for (const stop of list) {
        result.push({
            color: getColorValue(stop.color),
            offset: $math.truncate(stop.offset, precision)
        });
    }
    return result;
}

export function drawRect(width: number, height: number, x = 0, y = 0, precision?: number) {
    if (precision) {
        x = $math.truncate(x, precision) as any;
        y = $math.truncate(y, precision) as any;
        width = $math.truncate(x + width, precision) as any;
        height = $math.truncate(y + height, precision) as any;
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

    public afterResources() {
        const application = this.application;
        const settings = <UserSettingsAndroid> application.userSettings;
        this._resourceSvgInstance = this.controller.localSettings.svg.enabled ? <ResourceSvg<T>> application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
        function setDrawableBackground(node: T, value: string) {
            let drawable = Resource.insertStoredAsset('drawables', `${node.containerName.toLowerCase()}_${node.controlId}`, value);
            if (drawable !== '') {
                drawable = `@drawable/${drawable}`;
                if (node.documentBody && !setHtmlBackground(node)) {
                    if (node.backgroundColor !== '' || node.visibleStyle.backgroundImage && node.visibleStyle.backgroundRepeat) {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                        return;
                    }
                }
                node.android('background', drawable, false);
            }
        }
        function setHtmlBackground(node: T) {
            const parent = node.actualParent as T;
            if (!parent.visible) {
                const background = parent.android('background');
                if (background !== '') {
                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                    return true;
                }
            }
            return false;
        }
        const drawOutline = this.options.drawOutlineAsInsetBorder;
        for (const node of application.processing.cache) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored) {
                if (node.hasResource($e.NODE_RESOURCE.BOX_STYLE)) {
                    if (node.inputElement) {
                        const companion = node.companion;
                        if (companion && !companion.visible && companion.tagName === 'LABEL') {
                            const style: BoxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                            if (style && style.backgroundColor) {
                                stored.backgroundColor = style.backgroundColor;
                            }
                        }
                    }
                    let [shapeData, layerListData] = this.getDrawableBorder(
                        stored,
                        [stored.borderTop, stored.borderRight, stored.borderBottom, stored.borderLeft],
                        undefined,
                        this.getDrawableImages(node, stored),
                        drawOutline && stored.outline ? getIndentOffset(stored.outline) : 0,
                        false
                    );
                    const emptyBackground = shapeData === undefined && layerListData === undefined;
                    if (stored.outline && (drawOutline || emptyBackground)) {
                        const outline = stored.outline;
                        const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(
                            stored,
                            [],
                            outline
                        );
                        if (emptyBackground) {
                            shapeData = outlineShapeData;
                            layerListData = outlineLayerListData;
                        }
                        else if (layerListData && outlineLayerListData) {
                            layerListData[0].item = layerListData[0].item.concat(outlineLayerListData[0].item);
                        }
                    }
                    if (shapeData) {
                        setDrawableBackground(node, $xml.applyTemplate('shape', SHAPE_TMPL, shapeData));
                    }
                    else if (layerListData) {
                        setDrawableBackground(node, $xml.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                    }
                    else if (stored.backgroundColor) {
                        const color = getColorValue(stored.backgroundColor, false);
                        if (color !== '') {
                            if (node.documentBody) {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                            }
                            else {
                                const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.backgroundColor = stored.backgroundColor;
                                }
                                else {
                                    node.android('background', color, false);
                                }
                            }
                        }
                    }
                }
                else if (node.documentBody) {
                    setHtmlBackground(node);
                }
            }
        }
        this._resourceSvgInstance = undefined;
    }

    public getDrawableBorder(data: BoxStyle, borders: (BorderAttribute | undefined)[], outline?: BorderAttribute, images?: BackgroundImageData[], indentWidth = 0, borderOnly = true) {
        const borderVisible: boolean[] = [];
        const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
        const indentOffset = indentWidth > 0 ? $css.formatPX(indentWidth) : '';
        let borderStyle = true;
        let borderAll = true;
        let border: BorderAttribute | undefined;
        let borderData: BorderAttribute | undefined;
        let shapeData: ExternalData[] | undefined;
        let layerListData: ExternalData[] | undefined;
        if (borders.length) {
            for (let i = 0; i < 4; i++) {
                const item = borders[i];
                if (item) {
                    if (borderStyle && borderData) {
                        borderStyle = $util.isEqual(borderData, item);
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
        else if (outline) {
            border = outline;
            borderData = outline;
        }
        if (borderAll) {
            border = borderData;
        }
        if (border && !isAlternatingBorder(border.style) && !(border.style === 'double' && parseInt(border.width) > 1) || borderData === undefined && (corners || images && images.length)) {
            const stroke = border ? getBorderStroke(border) : false;
            if (images && images.length || indentWidth > 0) {
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
                    const hideOffset = '-' + $css.formatPX(width + indentWidth + 1);
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
                function setBorderStyle(layerList: ObjectMap<any>, index: number) {
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
                                const hideInsetOffset = '-' + $css.formatPX(width + indentWidth + 1);
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
                            const hideOffset = '-' + $css.formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
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
                setBorderStyle(layerListData[0], 0);
                setBorderStyle(layerListData[0], 3);
                setBorderStyle(layerListData[0], 2);
                setBorderStyle(layerListData[0], 1);
            }
        }
        return [shapeData, layerListData];
    }

    public getDrawableImages(node: T, data: BoxStyle) {
        const backgroundImage = data.backgroundImage;
        const extracted = node.extracted;
        if ((backgroundImage || extracted) && node.hasResource($e.NODE_RESOURCE.IMAGE_SOURCE)) {
            const resource = <android.base.Resource<T>> this.resource;
            const result: BackgroundImageData[] = [];
            const { width: boundsWidth, height: boundsHeight } = node.bounds;
            const backgroundRepeat = data.backgroundRepeat.split($regex.XML.SEPARATOR);
            const backgroundPositionX = data.backgroundPositionX.split($regex.XML.SEPARATOR);
            const backgroundPositionY = data.backgroundPositionY.split($regex.XML.SEPARATOR);
            const images: (string | GradientTemplate)[] = [];
            const backgroundPosition: BoxRectPosition[] = [];
            const imageDimensions: Undefined<Dimension>[] = [];
            let backgroundSize = data.backgroundSize.split($regex.XML.SEPARATOR);
            let length = 0;
            let resizable = true;
            if (backgroundImage) {
                length = backgroundImage.length;
                while (backgroundSize.length < length) {
                    backgroundSize = backgroundSize.concat(backgroundSize.slice(0));
                }
                backgroundSize.length = length;
                const resourceInstance = this._resourceSvgInstance;
                for (let i = 0, j = 0; i < length; i++) {
                    let value = backgroundImage[i];
                    let valid = false;
                    if (typeof value === 'string') {
                        if (value !== 'initial') {
                            if (resourceInstance) {
                                const [parentElement, element] = resourceInstance.createSvgElement(node, value);
                                if (parentElement && element) {
                                    const drawable = resourceInstance.createSvgDrawable(node, element);
                                    if (drawable !== '') {
                                        images[j] = drawable;
                                        imageDimensions[j] = { width: element.width.baseVal.value, height: element.height.baseVal.value };
                                        valid = true;
                                    }
                                    parentElement.removeChild(element);
                                }
                            }
                            if (!valid) {
                                const match = $regex.CSS.URL.exec(value);
                                if (match) {
                                    if (match[1].startsWith('data:image')) {
                                        const rawData = resource.getRawData(match[1]);
                                        if (rawData && rawData.base64) {
                                            images[j] = rawData.filename.substring(0, rawData.filename.lastIndexOf('.'));
                                            imageDimensions[j] = { width: rawData.width, height: rawData.height };
                                            resource.writeRawImage(rawData.filename, rawData.base64);
                                            valid = true;
                                        }
                                    }
                                    else {
                                        value = $util.resolvePath(match[1]);
                                        images[j] = Resource.addImage({ mdpi: value });
                                        if (images[j] !== '') {
                                            imageDimensions[j] = resource.getImage(value);
                                            valid = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (value.colorStops.length > 1) {
                        const gradient = createBackgroundGradient(value, node.localSettings.targetAPI);
                        if (gradient) {
                            images[j] = gradient;
                            imageDimensions[j] = value.dimension;
                            valid = true;
                        }
                    }
                    if (valid) {
                        const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                        const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                        backgroundPosition[j] = $css.getBackgroundPosition(`${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`, node.actualDimension, imageDimensions[j], node.fontSize);
                        j++;
                    }
                    else {
                        backgroundRepeat.splice(i, 1);
                        backgroundSize.splice(i, 1);
                        length--;
                    }
                }
            }
            if (extracted) {
                if (length === 0) {
                    backgroundRepeat.length = 0;
                    backgroundSize.length = 0;
                }
                const embedded = extracted.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE'));
                for (let i = 0, j = length; i < embedded.length; i++) {
                    const image = embedded[i];
                    const element = <HTMLImageElement> image.element;
                    const src = resource.addImageSrc(element);
                    if (src !== '') {
                        images[j] = src;
                        backgroundRepeat[j] = 'no-repeat';
                        backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                        backgroundPosition[j] = $css.getBackgroundPosition(
                            image.containerName === 'INPUT_IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left + node.borderLeftWidth}px ${image.bounds.top - node.bounds.top + node.borderTopWidth}px`,
                            node.actualDimension,
                            image.bounds,
                            node.fontSize
                        );
                        imageDimensions[j] = resource.getImage(element.src);
                        j++;
                    }
                }
            }
            length = images.length;
            let centerHorizontally = false;
            for (let i = length - 1; i >= 0; i--) {
                const value = images[i];
                if (!value) {
                    continue;
                }
                const position = backgroundPosition[i];
                const size = backgroundSize[i];
                const imageData: BackgroundImageData = {
                    bitmap: false,
                    rotate: false,
                    gradient: false
                };
                let dimension = imageDimensions[i];
                let dimenWidth = 0;
                let dimenHeight = 0;
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
                if (typeof value === 'string') {
                    function resetPosition(dirA: string, dirB: string, overwrite = false) {
                        if (position.orientation.length === 2 || overwrite) {
                            position[dirA] = 0;
                        }
                        position[dirB] = 0;
                    }
                    const src = `@drawable/${value}`;
                    const repeat = backgroundRepeat[i];
                    const repeating = repeat === 'repeat';
                    let gravityX = '';
                    let gravityY = '';
                    if (!repeating && repeat !== 'repeat-x') {
                        switch (position.horizontal) {
                            case 'left':
                            case '0%':
                                resetPosition('left', 'right');
                                gravityX = node.localizeString('left');
                                break;
                            case 'center':
                            case '50%':
                                resetPosition('left', 'right', true);
                                gravityX = STRING_ANDROID.CENTER_HORIZONTAL;
                                break;
                            case 'right':
                            case '100%':
                                resetPosition('right', 'left');
                                gravityX = node.localizeString('right');
                                break;
                            default:
                                gravityX += node.localizeString(position.right !== 0 ? 'right' : 'left');
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            while (position.left > 0) {
                                position.left -= dimenWidth;
                            }
                        }
                        else {
                            position.left = 0;
                        }
                        position.right = 0;
                        repeatX = true;
                    }
                    if (!repeating && repeat !== 'repeat-y') {
                        switch (position.vertical) {
                            case 'top':
                            case '0%':
                                resetPosition('top', 'bottom');
                                gravityY += 'top';
                                break;
                            case 'center':
                            case '50%':
                                resetPosition('top', 'bottom', true);
                                gravityY += STRING_ANDROID.CENTER_VERTICAL;
                                break;
                            case 'bottom':
                            case '100%':
                                resetPosition('bottom', 'top');
                                gravityY += 'bottom';
                                break;
                            default:
                                gravityY += position.bottom !== 0 ? 'bottom' : 'top';
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            while (position.top > 0) {
                                position.top -= dimenHeight;
                            }
                        }
                        else {
                            position.top = 0;
                        }
                        position.bottom = 0;
                        repeatY = true;
                    }
                    let width = 0;
                    let height = 0;
                    let tileMode = '';
                    let tileModeX = '';
                    let tileModeY = '';
                    let gravityAlign = '';
                    let gravity: string | undefined;
                    switch (repeat) {
                        case 'repeat':
                            tileMode = 'repeat';
                            break;
                        case 'repeat-x':
                            if (!node.documentBody) {
                                tileModeX = 'repeat';
                                if (!node.blockStatic && dimenWidth > boundsWidth) {
                                    width = dimenWidth;
                                }
                            }
                            else {
                                if (dimension && dimenWidth < boundsWidth) {
                                    tileModeX = 'repeat';
                                }
                                else {
                                    gravityX = 'fill_horizontal';
                                }
                            }
                            break;
                        case 'repeat-y':
                            if (!node.documentBody) {
                                tileModeY = 'repeat';
                                if (dimenHeight > boundsHeight) {
                                    height = dimenHeight;
                                }
                            }
                            else {
                                if (dimension && dimenHeight < boundsHeight) {
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
                    if (dimension) {
                        if (gravityX !== '' && tileModeY === 'repeat' && dimenWidth < boundsWidth) {
                            function resetX() {
                                if (gravityY === '' && gravityX !== '' && gravityX !== node.localizeString('left') && node.renderChildren.length) {
                                    tileModeY = 'disabled';
                                }
                                gravityAlign = gravityX;
                                gravityX = '';
                                tileModeX = 'disabled';
                            }
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
                            function resetY() {
                                if (gravityX === '' && gravityY !== '' && gravityY !== 'top' && node.renderChildren.length) {
                                    tileModeX = 'disabled';
                                }
                                gravityAlign += (gravityAlign !== '' ? '|' : '') + gravityY;
                                gravityY = '';
                                tileModeY = 'disabled';
                            }
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
                        case 'auto 100%':
                        case 'cover':
                            gravity = 'fill';
                            gravityX = 'fill_horizontal';
                            gravityY = 'fill_vertical';
                            tileMode = '';
                            tileModeX = '';
                            tileModeY = '';
                            position.left = 0;
                            position.top = 0;
                            if (node.documentBody) {
                                node.visibleStyle.backgroundRepeat = true;
                            }
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
                                else if (dimen !== 'auto') {
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
                        if (dimenWidth + position.left >= boundsWidth && (!node.blockStatic || node.hasPX('width', false))) {
                            tileModeX = '';
                            if (tileMode === 'repeat') {
                                tileModeY = 'repeat';
                                tileMode = '';
                            }
                        }
                        if (dimenHeight + position.top >= boundsHeight && !node.documentBody && !node.has('height', $e.CSS_UNIT.PERCENT)) {
                            tileModeY = '';
                            if (tileMode === 'repeat') {
                                tileModeX = 'repeat';
                                tileMode = '';
                            }
                        }
                        const canResizeHorizontal = () => gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX === '';
                        const canResizeVertical = () => gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY === '';
                        switch (size) {
                            case 'cover':
                                if (dimenWidth < boundsWidth || dimenHeight < boundsHeight) {
                                    width = 0;
                                    if (dimenHeight < boundsHeight) {
                                        const ratio = Math.max(boundsWidth / dimenWidth, boundsHeight / dimenHeight);
                                        height = dimenHeight * ratio;
                                    }
                                    else {
                                        height = 0;
                                    }
                                    gravity = 'top|center_horizontal|fill_horizontal';
                                }
                                else {
                                    width = 0;
                                    height = 0;
                                    gravity = 'fill';
                                }
                                resizable = false;
                                break;
                            case 'contain':
                                if (dimenWidth !== boundsWidth && dimenHeight !== boundsHeight) {
                                    const ratio = Math.min(boundsWidth / dimenWidth, boundsHeight / dimenHeight);
                                    width = dimenWidth * ratio;
                                    height = dimenHeight * ratio;
                                }
                                else {
                                    width = 0;
                                    height = 0;
                                }
                                resizable = false;
                                break;
                            default:
                                if (width === 0 && height > 0 && canResizeHorizontal()) {
                                    width = dimenWidth * (height === 0 ? boundsHeight : height) / dimenHeight;
                                }
                                if (height === 0 && width > 0 && canResizeVertical()) {
                                    height = dimenHeight * (width === 0 ? boundsWidth : width) / dimenWidth;
                                }
                                break;
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
                            if (clipLeft > clipRight) {
                                left = clipLeft - clipRight;
                            }
                            else if (clipLeft < clipRight) {
                                right = clipRight - clipLeft;
                            }
                            if (clipTop > clipBottom) {
                                top = clipTop - clipBottom;
                            }
                            else if (clipTop < clipBottom) {
                                bottom = clipBottom - clipTop;
                            }
                        }
                        else if (width === 0 && height === 0 && dimenWidth < boundsWidth && dimenHeight < boundsHeight && canResizeHorizontal() && canResizeVertical()) {
                            width = dimenWidth;
                            height = dimenHeight;
                        }
                        if (resizable && !node.documentRoot && !node.is(CONTAINER_NODE.IMAGE)) {
                            let fillX = false;
                            let fillY = false;
                            if (boundsWidth < dimenWidth && (!node.has('width', $e.CSS_UNIT.LENGTH, { map: 'initial', not: '100%' }) && !(node.blockStatic && centerHorizontally) || !node.pageFlow) && node.renderParent && !node.renderParent.tableElement) {
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
                            if (boundsHeight < dimenHeight && (!node.has('height', $e.CSS_UNIT.LENGTH, { map: 'initial', not: '100%' }) || !node.pageFlow)) {
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
                                else if (fillX) {
                                    gravityAlign += 'fill_horizontal';
                                }
                                else {
                                    gravityAlign += 'fill_vertical';
                                }
                            }
                        }
                        if (width > 0) {
                            imageData.width = $css.formatPX(width);
                        }
                        if (height > 0) {
                            imageData.height = $css.formatPX(height);
                        }
                    }
                    if (gravityAlign === '' && tileMode !== 'repeat') {
                        if (tileModeX !== '') {
                            if (tileModeY === '' && gravityY !== '' && gravityY !== 'fill_vertical') {
                                gravityAlign = gravityY;
                                gravityY = '';
                                if (node.renderChildren.length) {
                                    tileModeX = '';
                                }
                            }
                        }
                        else if (tileModeY !== '' && gravityX !== '' && gravityX !== 'fill_horizontal') {
                            gravityAlign = gravityX;
                            gravityX = '';
                            if (node.renderChildren.length) {
                                tileModeY = '';
                            }
                        }
                    }
                    if (gravity === undefined) {
                        if (gravityX === STRING_ANDROID.CENTER_HORIZONTAL && gravityY === STRING_ANDROID.CENTER_VERTICAL) {
                            if (dimension && dimenWidth <= boundsWidth && dimenHeight <= boundsHeight) {
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
                    if (node.documentBody || tileMode === 'repeat' || tileModeX !== '' || tileModeY !== '' || gravityAlign) {
                        if (gravityAlign) {
                            imageData.gravity = gravityAlign;
                        }
                        imageData.bitmap = [{
                            src,
                            gravity,
                            tileMode,
                            tileModeX,
                            tileModeY
                        }];
                    }
                    else {
                        imageData.gravity = gravity;
                        imageData.drawable = src;
                        if (gravity === 'center' || gravity.startsWith(STRING_ANDROID.CENTER_HORIZONTAL)) {
                            centerHorizontally = true;
                        }
                    }
                }
                else if (value.item) {
                    let width: number;
                    let height: number;
                    if (dimension) {
                        width = Math.round(dimenWidth);
                        height = Math.round(dimenHeight);
                    }
                    else {
                        width = Math.round(node.actualWidth);
                        height = Math.round(node.actualHeight);
                    }
                    if (size.split(' ').some(dimen => dimen !== '100%' && $css.isLength(dimen, true))) {
                        imageData.width = $css.formatPX(width);
                        imageData.height = $css.formatPX(height);
                    }
                    const src = Resource.insertStoredAsset(
                        'drawables',
                        `${node.containerName.toLowerCase()}_${node.controlId}_gradient_${i + 1}`,
                        $xml.applyTemplate('vector', VECTOR_TMPL, [{
                            'xmlns:android': XMLNS_ANDROID.android,
                            'xmlns:aapt': XMLNS_ANDROID.aapt,
                            'android:width': imageData.width || $css.formatPX(width),
                            'android:height': imageData.height || $css.formatPX(height),
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
                        imageData.drawable = `@drawable/${src}`;
                        if (position.static) {
                            imageData.gravity = 'fill';
                        }
                    }
                }
                else {
                    imageData.gradient = value;
                    if (position.static) {
                        imageData.gravity = 'fill';
                    }
                }
                if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                    const bounds = node.bounds;
                    if (position.bottom !== 0) {
                        imageData.bottom = $css.formatPX((repeatY ? position.bottom : getPercentOffset('bottom', position, size, bounds, dimension)) + bottom);
                        bottom = 0;
                    }
                    else if (position.top !== 0) {
                        imageData.top = $css.formatPX((repeatY ? position.top : getPercentOffset('top', position, size, bounds, dimension)) + top);
                        top = 0;
                    }
                    if (position.right !== 0) {
                        imageData.right = $css.formatPX((repeatX ? position.right : getPercentOffset('right', position, size, bounds, dimension)) + right);
                        right = 0;
                    }
                    else if (position.left !== 0) {
                        imageData.left = $css.formatPX((repeatX ? position.left : getPercentOffset('left', position, size, bounds, dimension)) + left);
                        left = 0;
                    }
                    if (top !== 0) {
                        imageData.top = $css.formatPX(top);
                    }
                    if (right !== 0) {
                        imageData.right = $css.formatPX(right);
                    }
                    if (bottom !== 0) {
                        imageData.bottom = $css.formatPX(bottom);
                    }
                    if (left !== 0) {
                        imageData.left = $css.formatPX(left);
                    }
                    result.push(imageData);
                }
            }
            return result;
        }
        return undefined;
    }
}