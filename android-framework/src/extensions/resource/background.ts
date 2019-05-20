import { UserSettingsAndroid } from '../../@types/application';
import { ResourceBackgroundOptions } from '../../@types/extension';
import { GradientColorStop, GradientTemplate } from '../../@types/resource';

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

const $color = squared.lib.color;
const $const = squared.lib.constant;
const $css = squared.lib.css;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $e = squared.base.lib.enumeration;

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): ShapeStrokeData {
    const style = border.style;
    const width = roundFloat(border.width);
    let lighten = false;
    switch (style) {
        case 'inset':
        case 'outset':
            lighten = true;
        case 'groove':
        case 'ridge':
            if (style === 'outset' || style === 'ridge') {
                halfSize = !halfSize;
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
            let percent = 1;
            switch (direction) {
                case 0:
                case 3:
                    if (lighten) {
                        percent = width === 1 ? -0.5 : -0.25;
                    }
                    break;
                case 1:
                case 2:
                    percent = lighten ? -0.5 : -0.75;
                    break;
            }
            if (percent !== 1) {
                const reduced = $color.reduceRGBA(border.color.rgba, percent, border.color.valueAsARGB);
                if (reduced) {
                    const colorName = Resource.addColor(reduced, true);
                    if (colorName !== '') {
                        return getStrokeColor(colorName);
                    }
                }
            }
            break;
    }
    const result = getStrokeColor(Resource.addColor(border.color, true));
    switch (style) {
        case 'dotted':
        case 'dashed':
            result.dashWidth = $css.formatPX(width * (style === 'dashed' ? 2 : 1));
            result.dashGap = $css.formatPX(width);
            break;
    }
    return result;
}

function getBorderStroke(border: BorderAttribute, direction = -1, offset = 0, hasInset = false, isInset = false): ExternalData | undefined {
    if (border) {
        const style = border.style;
        if (isAlternatingBorder(style)) {
            const width = parseFloat(border.width);
            if (isInset) {
                return {
                    width: $css.formatPX(Math.ceil(width / 2) * 2 + offset),
                    ...getBorderStyle(border, direction)
                };
            }
            else {
                return {
                    width: hasInset ? $css.formatPX(Math.ceil(width / 2) + offset) : $css.formatPX(roundFloat(border.width) + offset),
                    ...getBorderStyle(border, direction, true)
                };
            }
        }
        else {
            return {
                width: $css.formatPX(roundFloat(border.width) + offset),
                ...getBorderStyle(border)
            };
        }
    }
    return undefined;
}

function getBorderRadius(radius?: string[]): StringMap | undefined {
    if (radius) {
        if (radius.length === 1) {
            return { radius: radius[0] };
        }
        else {
            let corners: string[];
            if (radius.length === 8) {
                corners = [];
                for (let i = 0; i < radius.length; i += 2) {
                    corners.push($css.formatPX((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2));
                }
            }
            else {
                corners = radius;
            }
            const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
            const result = {};
            let valid = false;
            for (let i = 0; i < corners.length; i++) {
                if (corners[i] !== $const.CSS.PX_0) {
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
    const color = Resource.addColor(value);
    return color !== '' ? { color: `@color/${color}` } : undefined;
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
    let hideOffset = '-' + $css.formatPX(borderWidth + indentWidth);
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
    hideOffset = '-' + drawOffset;
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
        return $const.CSS.PX_0;
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
        result.startColor = `@color/${Resource.addColor(colorStops[0].color, true)}`;
        result.endColor = `@color/${Resource.addColor(colorStops[colorStops.length - 1].color, true)}`;
        if (colorStops.length > 2) {
            result.centerColor = `@color/${Resource.addColor(colorStops[Math.floor(colorStops.length / 2)].color, true)}`;
        }
    }
    return result;
}

function getPercentOffset(direction: string, position: BoxRectPosition, backgroundSize: string, bounds: BoxRectDimension, dimension?: Dimension): number {
    if (dimension) {
        const orientation = position.orientation;
        const sign = backgroundSize === 'cover' || backgroundSize === 'contain' ? -1 : 1;
        if (direction === $const.CSS.LEFT || direction === $const.CSS.RIGHT) {
            if (backgroundSize !== 'cover') {
                const value = orientation.length === 4 ? orientation[1] : orientation[0];
                if ($css.isPercent(value)) {
                    const percent = direction === $const.CSS.LEFT ? position.leftAsPercent : position.rightAsPercent;
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
                const percent = direction === $const.CSS.TOP ? position.topAsPercent : position.bottomAsPercent;
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
    const solid = !borderOnly ? getBackgroundColor(boxStyle.backgroundColor) : undefined;
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
            'android:windowFullscreen': 'true'
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

const roundFloat = (value: string) => Math.round(parseFloat(value));

const getStrokeColor = (value: string): ShapeStrokeData => ({ color: `@color/${value}`, dashWidth: '', dashGap: '' });

const isInsetBorder = (border: BorderAttribute) => isAlternatingBorder(border.style) || border.style === 'double' && roundFloat(border.width) > 1;

export function convertColorStops(list: ColorStop[], precision?: number) {
    const result: GradientColorStop[] = [];
    for (const stop of list) {
        result.push({
            color: `@color/${Resource.addColor(stop.color, true)}`,
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

export default class ResourceBackground<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceBackgroundOptions = {
        autoSizeBackgroundImage: true,
        drawOutlineAsInsetBorder: true
    };
    public readonly eventOnly = true;

    private _resourceSvgInstance?: ResourceSvg<T>;

    public afterInit() {
        this._resourceSvgInstance = this.application.controllerHandler.localSettings.svg.enabled ? <ResourceSvg<T>> this.application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
    }

    public afterResources() {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        function setDrawableBackground(node: T, value: string) {
            let drawable = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}`, value);
            if (drawable !== '') {
                drawable = `@drawable/${drawable}`;
                if (node.documentBody) {
                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                }
                else {
                    node.android('background', drawable, false);
                }
            }
        }
        for (const node of this.application.processing.cache) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored && node.hasResource($e.NODE_RESOURCE.BOX_STYLE)) {
                if (node.inputElement) {
                    const companion = node.companion;
                    if (companion && !companion.visible && companion.tagName === 'LABEL' && !Resource.isInheritedStyle(companion, 'backgroundColor')) {
                        const style: BoxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                        if (style && style.backgroundColor) {
                            stored.backgroundColor = style.backgroundColor;
                        }
                    }
                }
                const images = this.getDrawableImages(node, stored);
                let [shapeData, layerListData] = this.getDrawableBorder(stored, [stored.borderTop, stored.borderRight, stored.borderBottom, stored.borderLeft], stored.border, images, this.options.drawOutlineAsInsetBorder && stored.outline ? getIndentOffset(stored.outline) : 0, false);
                const emptyBackground = shapeData === undefined && layerListData === undefined;
                if (stored.outline && (this.options.drawOutlineAsInsetBorder || emptyBackground)) {
                    const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(stored, [stored.outline, stored.outline, stored.outline, stored.outline], emptyBackground ? stored.outline : undefined);
                    if (emptyBackground) {
                        shapeData = outlineShapeData;
                        layerListData = outlineLayerListData;
                    }
                    else if (layerListData && outlineLayerListData) {
                        $util.concatArray(layerListData[0].item, outlineLayerListData[0].item);
                    }
                }
                if (shapeData) {
                    setDrawableBackground(node, $xml.applyTemplate('shape', SHAPE_TMPL, shapeData));
                }
                else if (layerListData) {
                    setDrawableBackground(node, $xml.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                }
                else if (stored.backgroundColor) {
                    let color = Resource.addColor(stored.backgroundColor);
                    if (color !== '') {
                        color = `@color/${color}`;
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
        }
    }

    public getDrawableBorder(data: BoxStyle, borders: (BorderAttribute | undefined)[], border?: BorderAttribute, images?: BackgroundImageData[], indentWidth = 0, borderOnly = true) {
        const borderVisible: boolean[] = [];
        const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
        const indentOffset = indentWidth > 0 ? $css.formatPX(indentWidth) : '';
        let borderStyle = true;
        let borderData: BorderAttribute | undefined;
        let shapeData: ExternalData[] | undefined;
        let layerListData: ExternalData[] | undefined;
        for (let i = 0; i < borders.length; i++) {
            const item = borders[i];
            if (item) {
                if (borderStyle && borderData) {
                    borderStyle = $util.isEqual(borderData, item);
                }
                borderData = item;
                borderVisible[i] = true;
            }
            else {
                borderVisible[i] = false;
            }
        }
        if (border && !isInsetBorder(border) || borderData === undefined && (corners || images && images.length)) {
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
                shapeData = createShapeData(stroke, !borderOnly ? getBackgroundColor(data.backgroundColor) : undefined, corners);
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
                    const hideOffset = '-' + $css.formatPX(width + indentWidth);
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
                function setBorderStyle(layerList: ObjectMap<any>, index: number, offset = 0) {
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
                            const inset = width > 1 && isAlternatingBorder(item.style);
                            if (inset) {
                                const hideInsetOffset = '-' + $css.formatPX(width + indentWidth);
                                layerList.item.push({
                                    top:  index === 0 ? '' : hideInsetOffset,
                                    right: index === 1 ? '' : hideInsetOffset,
                                    bottom: index === 2 ? '' : hideInsetOffset,
                                    left: index === 3 ? '' : hideInsetOffset,
                                    shape: {
                                        'android:shape': 'rectangle',
                                        stroke: getBorderStroke(item, index, offset, inset, true)
                                    }
                                });
                            }
                            const hideOffset = '-' + $css.formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth);
                            layerList.item.push({
                                top:  index === 0 ? indentOffset : hideOffset,
                                right: index === 1 ? indentOffset : hideOffset,
                                bottom: index === 2 ? indentOffset : hideOffset,
                                left: index === 3 ? indentOffset : hideOffset,
                                shape: {
                                    'android:shape': 'rectangle',
                                    corners,
                                    stroke: getBorderStroke(item, index, offset, inset)
                                }
                            });
                        }
                    }
                }
                setBorderStyle(layerListData[0], 0);
                setBorderStyle(layerListData[0], 1);
                setBorderStyle(layerListData[0], 3);
                setBorderStyle(layerListData[0], 2);
            }
        }
        return [shapeData, layerListData];
    }

    public getDrawableImages(node: T, data: BoxStyle) {
        const backgroundRepeat = data.backgroundRepeat.split($regex.XML.SEPARATOR);
        const backgroundSize = data.backgroundSize.split($regex.XML.SEPARATOR);
        const backgroundPositionX = data.backgroundPositionX.split($regex.XML.SEPARATOR);
        const backgroundPositionY = data.backgroundPositionY.split($regex.XML.SEPARATOR);
        const backgroundImage: (string | GradientTemplate)[] = [];
        const backgroundPosition: BoxRectPosition[] = [];
        const imageDimensions: Undefined<Dimension>[] = [];
        const result: BackgroundImageData[] = [];
        let imageLength = 0;
        let resizable = true;
        if (node.hasResource($e.NODE_RESOURCE.IMAGE_SOURCE)) {
            if (data.backgroundImage)  {
                imageLength = data.backgroundImage.length;
                while (backgroundSize.length < imageLength) {
                    $util.concatArray(backgroundSize, backgroundSize.slice(0));
                }
                backgroundSize.length = imageLength;
                for (let i = 0, j = 0; i < imageLength; i++) {
                    let value = data.backgroundImage[i];
                    let valid = false;
                    if (typeof value === 'string') {
                        if (value !== 'initial') {
                            if (this._resourceSvgInstance) {
                                const [parentElement, element] = this._resourceSvgInstance.createSvgElement(node, value);
                                if (parentElement && element) {
                                    const drawable = this._resourceSvgInstance.createSvgDrawable(node, element);
                                    if (drawable !== '') {
                                        backgroundImage[j] = drawable;
                                        imageDimensions[j] = { width: element.width.baseVal.value, height: element.height.baseVal.value };
                                        valid = true;
                                    }
                                    parentElement.removeChild(element);
                                }
                            }
                            if (!valid) {
                                const match = $regex.CSS.URL.exec(value);
                                if (match) {
                                    if (match[1].startsWith('data:image/')) {
                                        const rawData = this.application.resourceHandler.getRawData(match[1]);
                                        if (rawData && rawData.base64) {
                                            backgroundImage[j] = rawData.filename.substring(0, rawData.filename.lastIndexOf('.'));
                                            imageDimensions[j] = { width: rawData.width, height: rawData.height };
                                            this.application.resourceHandler.writeRawImage(rawData.filename, rawData.base64);
                                            valid = true;
                                        }
                                    }
                                    else {
                                        value = $util.resolvePath(match[1]);
                                        backgroundImage[j] = Resource.addImage({ mdpi: value });
                                        if (backgroundImage[j] !== '') {
                                            imageDimensions[j] = this.application.resourceHandler.getImage(value);
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
                            backgroundImage[j] = gradient;
                            imageDimensions[j] = value.dimension;
                            valid = true;
                        }
                    }
                    if (valid) {
                        const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                        const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                        backgroundPosition[j] = $css.getBackgroundPosition(`${checkBackgroundPosition(x, y, $const.CSS.LEFT)} ${checkBackgroundPosition(y, x, $const.CSS.TOP)}`, node.actualDimension, node.fontSize);
                        j++;
                    }
                    else {
                        backgroundRepeat.splice(i, 1);
                        backgroundSize.splice(i, 1);
                        imageLength--;
                    }
                }
            }
            if (node.extracted) {
                if (imageLength === 0) {
                    backgroundRepeat.length = 0;
                    backgroundSize.length = 0;
                }
                const extracted = node.extracted.filter(item => item.visible && (item.imageElement || item.tagName === 'INPUT_IMAGE'));
                for (let i = 0, j = imageLength; i < extracted.length; i++) {
                    const image = extracted[i];
                    const element = <HTMLImageElement> image.element;
                    const src = (<android.base.Resource<T>> this.application.resourceHandler).addImageSrc(element);
                    if (src !== '') {
                        backgroundImage[j] = src;
                        backgroundRepeat[j] = 'no-repeat';
                        backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                        backgroundPosition[j] = $css.getBackgroundPosition(
                            image.tagName === 'INPUT_IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left}px ${image.bounds.top - node.bounds.top}px`,
                            node.actualDimension,
                            node.fontSize
                        );
                        imageDimensions[j] = this.application.resourceHandler.getImage(element.src);
                        j++;
                    }
                }
            }
            imageLength = backgroundImage.length;
        }
        let centerHorizontally = false;
        let overflowVertically = false;
        for (let i = imageLength - 1; i >= 0; i--) {
            const value = backgroundImage[i];
            if (!$util.hasValue(value)) {
                continue;
            }
            const bounds = node.bounds;
            const position = backgroundPosition[i];
            const imageData: BackgroundImageData = {
                bitmap: false,
                rotate: false,
                gradient: false
            };
            let dimension = imageDimensions[i];
            if (dimension && (dimension.width === 0 || dimension.height === 0)) {
                dimension = undefined;
            }
            let top = 0;
            let right = 0;
            let bottom = 0;
            let left = 0;
            if (typeof value === 'string') {
                function resetPosition(directionA: string, directionB: string, overwrite = false) {
                    if (position.orientation.length === 2 || overwrite) {
                        position[directionA] = 0;
                    }
                    position[directionB] = 0;
                }
                const src = `@drawable/${value}`;
                let gravityX = '';
                let gravityY = '';
                if (backgroundRepeat[i] !== 'repeat-x') {
                    switch (position.horizontal) {
                        case $const.CSS.PERCENT_0:
                        case $const.CSS.LEFT:
                            resetPosition($const.CSS.LEFT, $const.CSS.RIGHT);
                            gravityX = node.localizeString($const.CSS.LEFT);
                            break;
                        case $const.CSS.PERCENT_50:
                        case $const.CSS.CENTER:
                            resetPosition($const.CSS.LEFT, $const.CSS.RIGHT, true);
                            gravityX = STRING_ANDROID.CENTER_HORIZONTAL;
                            break;
                        case $const.CSS.PERCENT_100:
                        case $const.CSS.RIGHT:
                            resetPosition($const.CSS.RIGHT, $const.CSS.LEFT);
                            gravityX = node.localizeString($const.CSS.RIGHT);
                            break;
                        default:
                            if (position.right !== 0) {
                                gravityX += node.localizeString($const.CSS.RIGHT);
                            }
                            else {
                                gravityX += node.localizeString($const.CSS.LEFT);
                            }
                            break;
                    }
                }
                else {
                    if (dimension) {
                        while (position.left > 0) {
                            position.left -= dimension.width;
                        }
                    }
                    else {
                        position.left = 0;
                    }
                    position.right = 0;
                    gravityX = node.localizeString($const.CSS.LEFT);
                }
                if (backgroundRepeat[i] !== 'repeat-y') {
                    switch (position.vertical) {
                        case $const.CSS.PERCENT_0:
                        case $const.CSS.TOP:
                            resetPosition($const.CSS.TOP, $const.CSS.BOTTOM);
                            gravityY += $const.CSS.TOP;
                            break;
                        case $const.CSS.PERCENT_50:
                        case $const.CSS.CENTER:
                            resetPosition($const.CSS.TOP, $const.CSS.BOTTOM, true);
                            gravityY += STRING_ANDROID.CENTER_VERTICAL;
                            break;
                        case $const.CSS.PERCENT_100:
                        case $const.CSS.BOTTOM:
                            resetPosition($const.CSS.BOTTOM, $const.CSS.TOP);
                            gravityY += $const.CSS.BOTTOM;
                            break;
                        default:
                            if (position.bottom !== 0) {
                                gravityY += $const.CSS.BOTTOM;
                            }
                            else {
                                gravityY += $const.CSS.TOP;
                            }
                            break;
                    }
                }
                else {
                    if (dimension) {
                        while (position.top > 0) {
                            position.top -= dimension.height;
                        }
                    }
                    else {
                        position.top = 0;
                    }
                    position.bottom = 0;
                    gravityY = $const.CSS.TOP;
                }
                let width = 0;
                let height = 0;
                let tileMode = '';
                let tileModeX = '';
                let tileModeY = '';
                let gravity: string | undefined;
                switch (backgroundRepeat[i]) {
                    case 'repeat':
                        tileMode = 'repeat';
                        break;
                    case 'repeat-x':
                        tileModeX = 'repeat';
                        break;
                    case 'repeat-y':
                        tileModeY = 'repeat';
                        break;
                    default:
                        tileMode = 'disabled';
                        break;
                }
                if (dimension) {
                    if (gravityX !== '' && tileModeY === 'repeat' && dimension.width < bounds.width) {
                        switch (gravityX) {
                            case $const.CSS.START:
                            case $const.CSS.LEFT:
                                position.left = node.borderLeftWidth;
                                position.right = 0;
                                break;
                            case $const.CSS.END:
                            case $const.CSS.RIGHT:
                                position.left = 0;
                                position.right = node.borderRightWidth;
                                break;
                            case STRING_ANDROID.CENTER_HORIZONTAL:
                                position.left = 0;
                                position.right = 0;
                                break;
                        }
                        width = dimension.width;
                    }
                    if (gravityY !== '' && tileModeX === 'repeat' && dimension.height < bounds.height) {
                        switch (gravityY) {
                            case $const.CSS.TOP:
                                position.top = node.borderTopWidth;
                                position.bottom = 0;
                                imageData.gravity = gravityY;
                                gravityY = '';
                                break;
                            case $const.CSS.BOTTOM:
                                position.top = 0;
                                position.bottom = node.borderBottomWidth;
                                imageData.gravity = gravityY;
                                gravityY = '';
                                break;
                            case STRING_ANDROID.CENTER_VERTICAL:
                                position.top = 0;
                                position.bottom = 0;
                                imageData.gravity = gravityY;
                                gravityY = '';
                                break;
                        }
                        height = dimension.height;
                    }
                    if (!node.blockStatic || node.hasWidth) {
                        if (dimension.width >= bounds.width) {
                            tileModeX = '';
                            if (tileMode === 'repeat') {
                                tileModeY = 'repeat';
                                tileMode = '';
                            }
                        }
                        if (dimension.height >= bounds.height) {
                            tileModeY = '';
                            if (tileMode === 'repeat') {
                                tileModeX = 'repeat';
                                tileMode = '';
                            }
                        }
                    }
                }
                switch (backgroundSize[i]) {
                    case $const.CSS.AUTO:
                    case 'auto auto':
                    case 'initial':
                    case 'contain':
                        break;
                    case '100% 100%':
                        gravityX = 'fill_horizontal';
                        gravityY = 'fill_vertical';
                    case 'cover':
                        gravity = '';
                        tileMode = '';
                        tileModeX = '';
                        tileModeY = '';
                        break;
                    case $const.CSS.PERCENT_100:
                        gravityX = 'fill_horizontal';
                        tileModeX = '';
                        if (tileMode === 'repeat') {
                            tileMode = '';
                            tileModeY = 'repeat';
                        }
                        break;
                    default:
                        backgroundSize[i].split(' ').forEach((size, index) => {
                            if (size !== $const.CSS.AUTO) {
                                if (index === 0) {
                                    if (size === $const.CSS.PERCENT_100) {
                                        gravityX = 'fill_horizontal';
                                    }
                                    else {
                                        width = node.parseUnit(size, $const.CSS.WIDTH, false);
                                    }
                                }
                                else {
                                    if (size === $const.CSS.PERCENT_100) {
                                        gravityY = 'fill_vertical';
                                    }
                                    else {
                                        height = node.parseUnit(size, $const.CSS.HEIGHT, false);
                                    }
                                }
                            }
                        });
                        break;
                }
                if (dimension) {
                    const backgroundClip = data.backgroundClip;
                    const canResizeHorizontal = () => gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX !== 'repeat';
                    const canResizeVertical = () => gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY !== 'repeat';
                    switch (backgroundSize[i]) {
                        case 'cover':
                            if (dimension.width < bounds.width || dimension.height < bounds.height) {
                                width = 0;
                                if (dimension.height < bounds.height) {
                                    const ratio = Math.max(bounds.width / dimension.width, bounds.height / dimension.height);
                                    height = dimension.height * ratio;
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
                            if (dimension.width !== bounds.width && dimension.height !== bounds.height) {
                                const ratio = Math.min(bounds.width / dimension.width, bounds.height / dimension.height);
                                width = dimension.width * ratio;
                                height = dimension.height * ratio;
                            }
                            else {
                                width = 0;
                                height = 0;
                            }
                            resizable = false;
                            break;
                        default:
                            if (width === 0 && height > 0 && canResizeHorizontal()) {
                                width = dimension.width * (height === 0 ? bounds.height : height) / dimension.height;
                            }
                            if (height === 0 && width > 0 && canResizeVertical()) {
                                height = dimension.height * (width === 0 ? bounds.width : width) / dimension.width;
                            }
                            break;
                    }
                    if (backgroundClip) {
                        if (width === 0) {
                            width = bounds.width;
                        }
                        else {
                            width += node.contentBoxWidth;
                        }
                        if (height === 0) {
                            height = bounds.height;
                        }
                        else {
                            height += node.contentBoxHeight;
                        }
                        width -= backgroundClip.left + backgroundClip.right;
                        height -= backgroundClip.top + backgroundClip.bottom;
                        if (backgroundClip.left > backgroundClip.right) {
                            left = backgroundClip.left - backgroundClip.right;
                        }
                        else if (backgroundClip.left < backgroundClip.right) {
                            right = backgroundClip.right - backgroundClip.left;
                        }
                        if (backgroundClip.top > backgroundClip.bottom) {
                            top = backgroundClip.top - backgroundClip.bottom;
                        }
                        else if (backgroundClip.top < backgroundClip.bottom) {
                            bottom = backgroundClip.bottom - backgroundClip.top;
                        }
                    }
                    else if (width === 0 && height === 0 && dimension.width < node.bounds.width && dimension.height < node.bounds.height && canResizeHorizontal() && canResizeVertical()) {
                        width = dimension.width;
                        height = dimension.height;
                    }
                    if (width > 0) {
                        imageData.width = $css.formatPX(width);
                    }
                    if (height > 0) {
                        imageData.height = $css.formatPX(height);
                    }
                }
                if (gravity === undefined) {
                    if (gravityX === STRING_ANDROID.CENTER_HORIZONTAL && gravityY === STRING_ANDROID.CENTER_VERTICAL) {
                        gravity = $const.CSS.CENTER;
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
                            gravity += (gravity !== '' ? '|' : '') + gravityY;
                        }
                    }
                }
                if (node.documentBody || tileMode === 'repeat' || tileModeX === 'repeat' || tileModeY === 'repeat') {
                    if (node.documentBody) {
                        if (gravity !== '') {
                            if (!/fill(?!_)/.test(gravity)) {
                                gravity += '|fill';
                            }
                            imageData.gravity = gravity;
                            gravity = '';
                        }
                        else {
                            imageData.gravity = 'fill';
                        }
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
                    imageData.drawable = src;
                    imageData.gravity = gravity;
                    if (gravity === $const.CSS.CENTER || gravity.startsWith(STRING_ANDROID.CENTER_HORIZONTAL)) {
                        centerHorizontally = true;
                    }
                }
                overflowVertically = true;
            }
            else if (value.item) {
                let width: number;
                let height: number;
                if (dimension) {
                    width = Math.round(dimension.width);
                    height = Math.round(dimension.height);
                }
                else {
                    width = Math.round(node.actualWidth);
                    height = Math.round(node.actualHeight);
                }
                if (backgroundSize[i].split(' ').some(size => size !== $const.CSS.PERCENT_100 && $css.isLength(size, true))) {
                    imageData.width = $css.formatPX(width);
                    imageData.height = $css.formatPX(height);
                }
                const src = Resource.insertStoredAsset(
                    'drawables',
                    `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i + 1}`,
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
                if (position.bottom !== 0) {
                    imageData.bottom = $css.formatPX(getPercentOffset($const.CSS.BOTTOM, position, backgroundSize[i], node.bounds, dimension) + bottom);
                    bottom = 0;
                }
                else if (position.top !== 0) {
                    imageData.top = $css.formatPX(getPercentOffset($const.CSS.TOP, position, backgroundSize[i], node.bounds, dimension) + top);
                    top = 0;
                }
                if (position.right !== 0) {
                    imageData.right = $css.formatPX(getPercentOffset($const.CSS.RIGHT, position, backgroundSize[i], node.bounds, dimension) + right);
                    right = 0;
                }
                else if (position.left !== 0) {
                    imageData.left = $css.formatPX(getPercentOffset($const.CSS.LEFT, position, backgroundSize[i], node.bounds, dimension) + left);
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
        if (this.options.autoSizeBackgroundImage && overflowVertically && resizable && !node.is(CONTAINER_NODE.IMAGE) && !node.documentRoot && node.renderParent && !node.renderParent.tableElement) {
            let imageWidth = 0;
            let imageHeight = 0;
            for (const image of imageDimensions) {
                if (image) {
                    imageWidth = Math.max(imageWidth, image.width);
                    imageHeight = Math.max(imageHeight, image.height);
                }
            }
            if (imageWidth === 0) {
                let current = node;
                while (current) {
                    if (current.hasWidth) {
                        imageWidth = current.bounds.width;
                    }
                    if (current.hasHeight) {
                        imageHeight = current.bounds.height;
                    }
                    if (imageWidth > 0 && imageHeight > 0 || current.documentBody || !current.pageFlow) {
                        break;
                    }
                    current = current.actualParent as T;
                }
            }
            if ((!node.has($const.CSS.WIDTH, $e.CSS_STANDARD.LENGTH, { map: 'initial', not: $const.CSS.PERCENT_100 }) && !(node.blockStatic && centerHorizontally) || !node.pageFlow) && (imageWidth === 0 || node.bounds.width < imageWidth)) {
                const width = node.bounds.width - (node.contentBox ? node.contentBoxWidth : 0);
                if (width > 0) {
                    node.css($const.CSS.WIDTH, $css.formatPX(width), true);
                }
            }
            if ((!node.has($const.CSS.HEIGHT, $e.CSS_STANDARD.LENGTH, { map: 'initial', not: $const.CSS.PERCENT_100 }) || !node.pageFlow) && (imageHeight === 0 || node.bounds.height < imageHeight)) {
                const height = node.bounds.height - (node.contentBox ? node.contentBoxHeight : 0);
                if (height > 0) {
                    node.css($const.CSS.HEIGHT, $css.formatPX(height), true);
                    if (node.marginBottom < 0) {
                        node.modifyBox($e.BOX_STANDARD.MARGIN_BOTTOM);
                    }
                }
            }
        }
        return result;
    }
}