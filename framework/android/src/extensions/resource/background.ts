import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import { BUILD_VERSION, SUPPORT_TAGNAME, SUPPORT_TAGNAME_X, XML_NAMESPACE } from '../../lib/constant';

import LAYERLIST_TMPL from '../../template/layer-list';
import SHAPE_TMPL from '../../template/shape';
import { VECTOR_TMPL } from '../../template/vector';

import type View from '../../view';
import type ResourceSvg from './svg';

import Resource from '../../resource';

import { applyTemplate } from '../../lib/util';

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
    vectorGradient?: boolean;
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
    width?: string;
    dashWidth?: string;
    dashGap?: string;
}

interface LayerList {
    'xmlns:android': string;
    item: LayerData[];
}

interface LayerData {
    top?: string;
    right?: string;
    left?: string;
    bottom?: string;
    shape?: StandardMap;
}

interface CornerRadiusData {
    radius?: string;
    topLeftRadius?: string;
    topRightRadius?: string;
    bottomRightRadius?: string;
    bottomLeftRadius?: string;
}

interface DrawableData {
    node?: View;
    images?: BackgroundImageData[];
    indentWidth?: number;
    borderOnly?: boolean;
    outline?: BorderAttribute;
}

interface WriteDrawableBackgroundOptions extends DrawableData {
    resourceData?: BackgroundImageData[];
    resourceName?: string;
}

const { asPercent, asPx, extractURL, formatPercent, formatPX, isLength, isPercent } = squared.lib.css;
const { truncate } = squared.lib.math;
const { capitalize, delimitString, lastItemOf, resolvePath, safeFloat, spliceArray, splitPair, splitPairStart } = squared.lib.util;

const CHAR_SEPARATOR = /\s*,\s*/;

function getBorderStyle(resourceId: number, border: BorderAttribute, direction = -1, halfSize = false) {
    const { style, color } = border;
    const result = createStrokeColor(resourceId, color);
    if (style !== 'solid') {
        const width = Math.round(border.width);
        switch (style) {
            case 'dotted':
                result.dashWidth = formatPX(width);
                result.dashGap = result.dashWidth;
                break;
            case 'dashed': {
                let dashWidth: number,
                    dashGap: number;
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
                if (color.value === '#000000') {
                    return result;
                }
                let percent = 0;
                if (width === 1) {
                    if (style === 'inset' || style === 'outset') {
                        percent = 0.5;
                    }
                }
                else {
                    const grayscale = color.grayscale;
                    switch (style) {
                        case 'ridge':
                        case 'outset':
                            if (!grayscale) {
                                halfSize = !halfSize;
                            }
                            break;
                        case 'groove':
                        case 'inset':
                            if (grayscale) {
                                halfSize = !halfSize;
                            }
                            break;
                    }
                    if (halfSize) {
                        switch (direction) {
                            case 0:
                            case 3:
                                direction = 1;
                                break;
                            default:
                                direction = 0;
                                break;
                        }
                    }
                    switch (direction) {
                        case 0:
                        case 3:
                            percent = grayscale ? 0.5 : 0.25;
                            break;
                        default:
                            percent = grayscale ? 0.75 : -0.25;
                            break;
                    }
                    if (grayscale && color.hsla.l > 50) {
                        percent *= -1;
                    }
                }
                if (percent) {
                    return createStrokeColor(resourceId, color.lighten(percent));
                }
                break;
            }
        }
    }
    return result;
}

function getBorderStroke(resourceId: number, border: BorderAttribute, direction = -1, hasInset?: boolean, isInset?: boolean) {
    let result: ShapeStrokeData;
    if (isAlternatingBorder(border.style)) {
        const width = border.width;
        result = getBorderStyle(resourceId, border, direction, isInset !== true);
        result.width = (isInset ? Math.ceil(width / 2) * 2 : hasInset ? Math.ceil(width / 2) : width) + 'px';
    }
    else {
        result = getBorderStyle(resourceId, border);
        result.width = formatPX(border.width);
    }
    return result;
}

function getCornerRadius(corners: string[]) {
    const [topLeft, topRight, bottomRight, bottomLeft] = corners;
    const result: CornerRadiusData = {};
    let valid: Undef<boolean>;
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
    if (valid) {
        return result;
    }
}

function getBackgroundColor(resourceId: number, value: Undef<ColorData>) {
    if (value) {
        const color = getColorValue(resourceId, value, false);
        if (color) {
            return { color };
        }
    }
}

function isAlternatingBorder(value: string, width = 0) {
    switch (value) {
        case 'groove':
        case 'ridge':
        case 'inset':
        case 'outset':
            return width !== 1;
    }
    return false;
}

function insertDoubleBorder(resourceId: number, items: StandardMap[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, indentWidth = 0, corners?: CornerRadiusData) {
    const width = Math.round(border.width);
    const borderWidth = Math.max(1, Math.floor(width / 3));
    const indentOffset = indentWidth ? formatPX(indentWidth) : '';
    let hideOffset = '-' + formatPX(borderWidth + indentWidth + 1);
    items.push({
        top: top ? indentOffset : hideOffset,
        right: right ? indentOffset : hideOffset,
        bottom: bottom ? indentOffset : hideOffset,
        left: left ? indentOffset : hideOffset,
        shape: { 'android:shape': 'rectangle', stroke: { width: formatPX(borderWidth), ...getBorderStyle(resourceId, border) }, corners }
    });
    const insetWidth = width - borderWidth + indentWidth;
    const drawOffset = formatPX(insetWidth);
    hideOffset = '-' + formatPX(insetWidth + 1);
    items.push({
        top: top ? drawOffset : hideOffset,
        right: right ? drawOffset : hideOffset,
        bottom: bottom ? drawOffset : hideOffset,
        left: left ? drawOffset : hideOffset,
        shape: { 'android:shape': 'rectangle', stroke: { width: formatPX(borderWidth), ...getBorderStyle(resourceId, border) }, corners }
    });
}

function createBackgroundGradient(resourceId: number, gradient: Gradient, api = BUILD_VERSION.LATEST, imageCount: number, borderRadius?: string[], precision?: number) {
    const { colorStops, type } = gradient;
    let positioning = api >= BUILD_VERSION.LOLLIPOP;
    const result = { type, positioning } as GradientTemplate;
    const length = colorStops.length;
    switch (type) {
        case 'conic': {
            const center = (gradient as ConicGradient).center;
            result.type = 'sweep';
            if (positioning) {
                result.centerX = center.left.toString();
                result.centerY = center.top.toString();
            }
            else {
                result.centerX = formatPercent(center.leftAsPercent);
                result.centerY = formatPercent(center.topAsPercent);
            }
            break;
        }
        case 'radial': {
            const { center, radius } = gradient as RadialGradient;
            if (positioning) {
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
            if (!positioning || borderRadius && imageCount === 1 && lastItemOf(colorStops)!.offset === 1 && (length === 2 || length === 3 && colorStops[1].offset === 0.5)) {
                result.angle = ((gradient as LinearGradient).angle + 90).toString();
                result.positioning = false;
                positioning = false;
            }
            else {
                const { angle, angleExtent, dimension } = gradient as LinearGradient;
                const { width, height } = dimension!;
                let { x, y } = angleExtent;
                if (angle <= 90) {
                    y += height;
                    result.startX = '0';
                    result.startY = height.toString();
                }
                else if (angle <= 180) {
                    result.startX = '0';
                    result.startY = '0';
                }
                else if (angle <= 270) {
                    x += width;
                    result.startX = width.toString();
                    result.startY = '0';
                }
                else {
                    x += width;
                    y += height;
                    result.startX = width.toString();
                    result.startY = height.toString();
                }
                result.endX = truncate(x, precision);
                result.endY = truncate(y, precision);
            }
            break;
        }
    }
    if (positioning) {
        result.item = convertColorStops(resourceId, colorStops);
    }
    else {
        result.startColor = getColorValue(resourceId, colorStops[0].color);
        result.endColor = getColorValue(resourceId, lastItemOf(colorStops)!.color);
        if (length > 2) {
            result.centerColor = getColorValue(resourceId, colorStops[Math.floor(length / 2)].color);
        }
    }
    return result;
}

function createLayerList(resourceId: number, images: Undef<BackgroundImageData[]>, corners?: Undef<CornerRadiusData>, boxStyle?: BoxStyle, stroke?: StandardMap | false, indentWidth = 0) {
    const item: LayerData[] = [];
    const result: LayerList[] = [{ 'xmlns:android': XML_NAMESPACE.android, item }];
    const solid = boxStyle && getBackgroundColor(resourceId, boxStyle.backgroundColor);
    if (solid && !(images && images.find(image => image.gradient))) {
        item.push({ shape: { 'android:shape': 'rectangle', solid, corners } });
    }
    if (images) {
        for (let i = 0, length = images.length; i < length; ++i) {
            const image = images[i];
            item.push(image.gradient ? { shape: { 'android:shape': 'rectangle', gradient: image.gradient, corners, solid: i === 0 ? solid : undefined } } : image);
        }
    }
    if (stroke) {
        const indentOffset = indentWidth ? formatPX(indentWidth) : '';
        item.push({
            top: indentOffset,
            right: indentOffset,
            left: indentOffset,
            bottom: indentOffset,
            shape: { 'android:shape': 'rectangle', stroke, corners }
        });
    }
    return result;
}

function getColorValue(resourceId: number, value: ColorData | string, transparency = true) {
    const color = Resource.addColor(resourceId, value, transparency);
    return color ? `@color/${color}` : '';
}

function setBorderStyle(resourceId: number, layerList: LayerList, index: number, borders: Undef<BorderAttribute>[], corners: Undef<CornerRadiusData>, indentWidth: number) {
    const border = borders[index];
    if (border) {
        const width = Math.round(border.width);
        if (border.style === 'double' && width > 1) {
            insertDoubleBorder(
                resourceId,
                layerList.item,
                border,
                index === 0,
                index === 1,
                index === 2,
                index === 3,
                indentWidth,
                corners
            );
        }
        else {
            const inset = width > 1 && border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && Math.round(border.width) > 1;
            if (inset) {
                const hideInsetOffset = '-' + formatPX(width + indentWidth + 1);
                layerList.item.push({
                    top: index === 0 ? '' : hideInsetOffset,
                    right: index === 1 ? '' : hideInsetOffset,
                    bottom: index === 2 ? '' : hideInsetOffset,
                    left: index === 3 ? '' : hideInsetOffset,
                    shape: { 'android:shape': 'rectangle', stroke: getBorderStroke(resourceId, border, index, inset, true) }
                });
            }
            const hideOffset = '-' + formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
            const indentOffset = indentWidth ? formatPX(indentWidth) : '';
            layerList.item.push({
                top: index === 0 ? indentOffset : hideOffset,
                right: index === 1 ? indentOffset : hideOffset,
                bottom: index === 2 ? indentOffset : hideOffset,
                left: index === 3 ? indentOffset : hideOffset,
                shape: { 'android:shape': 'rectangle', stroke: getBorderStroke(resourceId, border, index, inset), corners }
            });
        }
    }
}

function getBorderRadius(boxStyle: BoxStyle): Undef<CornerRadiusData> {
    const borderRadius = boxStyle.borderRadius;
    if (borderRadius) {
        switch (borderRadius.length) {
            case 1:
                return { radius: borderRadius[0] };
            case 8: {
                const result: string[] = new Array(4);
                for (let i = 0, j = 0; i < 8; i += 2) {
                    result[j++] = formatPX((safeFloat(borderRadius[i]) + safeFloat(borderRadius[i + 1])) / 2);
                }
                return getCornerRadius(result);
            }
        }
        return getCornerRadius(borderRadius);
    }
}

function getBorderAll(boxStyle: BoxStyle, fromImage: boolean, node?: View) {
    const borders = [
        boxStyle.borderTop,
        boxStyle.borderRight,
        boxStyle.borderBottom,
        boxStyle.borderLeft
    ];
    const borderVisible: boolean[] = new Array(4);
    let borderStyle = true,
        borderAll = true,
        borderData: Undef<BorderAttribute>;
    for (let i = 0; i < 4; ++i) {
        const item = borders[i];
        if (item) {
            if (node && item.color.transparent && node.isEmpty() && !node.inputElement && !node.controlElement) {
                let attr: Undef<keyof CacheValueUI>,
                    region!: number;
                if (i === 0 || i === 2) {
                    if (node.hasUnit('height', { percent: false }) && node.height) {
                        [attr, region] = i === 0 ? ['borderTopWidth', BOX_STANDARD.MARGIN_TOP] : ['borderBottomWidth', BOX_STANDARD.MARGIN_BOTTOM];
                    }
                }
                else if (node.hasUnit('width', { percent: false }) && node.width) {
                    [attr, region] = i === 1 ? ['borderRightWidth', BOX_STANDARD.MARGIN_RIGHT] : ['borderLeftWidth', BOX_STANDARD.MARGIN_LEFT];
                }
                if (attr) {
                    node.modifyBox(region, item.width);
                    node.setCacheValue(attr, 0);
                    node.unsetCache(i === 0 || i === 2 ? 'actualHeight' : 'actualWidth');
                    borderAll = false;
                    borderVisible[i] = false;
                    borders[i] = undefined;
                    continue;
                }
            }
            if (borderStyle && borderData && !(borderStyle = isBorderEqual(borderData, item))) {
                borderAll = false;
                if (fromImage) {
                    break;
                }
            }
            borderData = item;
            borderVisible[i] = true;
        }
        else {
            borderAll = false;
            if (fromImage) {
                break;
            }
            borderVisible[i] = false;
        }
    }
    return { borderAll, borderStyle, borderVisible, borders, borderData };
}

function convertShapeableImageView(resourceId: number, node: View, items: StringValue[], cut?: boolean) {
    const name = 'Material_ShapeableImageView_' + (cut ? 'Cut_' : '') + capitalize(node.controlId);
    items.sort((a, b) => a.key < b.key ? -1 : 1);
    Resource.STORED[resourceId]!.styles.set(name, { name, parent: '', items } as StyleAttribute);
    node.app('shapeAppearanceOverlay', `@style/${name}`);
    node.containerType = CONTAINER_NODE.IMAGE;
    node.setCacheState('controlName', SUPPORT_TAGNAME_X.SHAPEABLE_IMAGE_VIEW);
    (node.renderedAs as NodeXmlTemplate<View>).controlName = SUPPORT_TAGNAME_X.SHAPEABLE_IMAGE_VIEW;
    if (!cut) {
        if (node.api < BUILD_VERSION.Q) {
            node.app('srcCompat', node.android('src'));
            node.delete('android', 'src');
        }
    }
    else {
        node.data(Resource.KEY_NAME, 'boxStyleShapeableImageView', true);
    }
}

const createStrokeColor = (resourceId: number, value: ColorData): ShapeStrokeData => ({ color: getColorValue(resourceId, value) });
const isBorderEqual = (border: BorderAttribute, other: BorderAttribute) => border.style === border.style && border.width === other.width && border.color.rgbaAsString === other.color.rgbaAsString;
const getPixelUnit = (width: number, height: number) => `${width}px ${height}px`;
const checkBackgroundPosition = (value: string, adjacent: string, fallback: string) => value !== 'center' && value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1 ? /^[a-z]+$/.test(value) ? value + ' 0px' : fallback + ' ' + value : value;

export function convertColorStops(resourceId: number, list: ColorStop[], precision?: number) {
    return list.map(item => ({ color: getColorValue(resourceId, item.color), offset: truncate(item.offset, precision) }));
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
    return `M${x},${y} ${width},${y} ${width},${height} ${x},${height}Z`;
}

export default class ResourceBackground<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceBackgroundOptions = {
        outlineAsInsetBorder: true
    };
    public readonly eventOnly = true;

    private _resourceSvgInstance: Optional<ResourceSvg<T>> = null;

    public beforeParseDocument() {
        this._resourceSvgInstance = this.application.builtInExtensions.get(internal.android.EXT_ANDROID.RESOURCE_SVG) as Undef<ResourceSvg<T>>;
    }

    public afterResources(sessionId: string, resourceId: number, cache = this.application.getProcessingCache(sessionId)) {
        let themeBackground: Undef<boolean>;
        const deleteBodyWrapper = (body: T, wrapper: T) => {
            if (body !== wrapper && !wrapper.hasResource(NODE_RESOURCE.BOX_SPACING) && body.percentWidth === 0) {
                switch (body.cssInitial('maxWidth')) {
                    case '':
                    case 'auto':
                    case '100%': {
                        const children = wrapper.renderChildren;
                        if (children.length === 1) {
                            wrapper.removeTry({ replaceWith: children[0] });
                        }
                        break;
                    }
                }
            }
        };
        const setBodyBackground = (value: string) => {
            const { manifestThemeName: name, manifestParentThemeName: parent } = this.application.userSettings;
            Resource.addTheme(resourceId, {
                name,
                parent,
                items: {
                    'android:windowBackground': value,
                    'android:windowFullscreen': 'true',
                    'android:fitsSystemWindows': 'true'
                }
            }, this.controller.localSettings.directory.theme);
            themeBackground = true;
        };
        const setDrawableBackground = (node: T, value: string) => {
            if (value) {
                let drawable = this.saveDrawable(resourceId, node, value);
                if (!themeBackground) {
                    if (node.tagName === 'HTML') {
                        setBodyBackground(drawable);
                        return;
                    }
                    const innerWrapped = node.innerMostWrapped as T;
                    if (innerWrapped.documentBody && (node.backgroundColor || node.visibleStyle.backgroundRepeatY)) {
                        setBodyBackground(drawable);
                        deleteBodyWrapper(innerWrapped, node);
                        return;
                    }
                }
                if (node.is(CONTAINER_NODE.RANGE)) {
                    drawable = this.saveDrawable(resourceId, node, applyTemplate('layer-list', LAYERLIST_TMPL, createLayerList(resourceId, [{ drawable, height: Math.floor(node.bounds.height * this.controller.localSettings.style.rangeBackgroundCenterHeight) + 'px', gravity: 'center_vertical', order: 0 }] )), 'main');
                }
                if (node.data(Resource.KEY_NAME, 'boxStyleShapeableImageView')) {
                    if (node.api >= BUILD_VERSION.Q) {
                        node.android('src', drawable);
                    }
                    else {
                        node.app('srcCompat', drawable);
                    }
                }
                else {
                    node.android('background', drawable, false);
                }
            }
        };
        cache.each(node => {
            let stored = node.data<BoxStyle>(Resource.KEY_NAME, 'boxStyle'),
                boxImage: Undef<T[]>;
            if (node.inputElement) {
                const companion = node.companion;
                if (companion && !companion.visible && companion.tagName === 'LABEL') {
                    const backgroundColor = companion.data<BoxStyle>(Resource.KEY_NAME, 'boxStyle')?.backgroundColor;
                    if (backgroundColor) {
                        (stored ||= {} as BoxStyle).backgroundColor = backgroundColor;
                    }
                }
                switch (node.toElementString('type')) {
                    case 'radio':
                    case 'checkbox': {
                        let backgroundColor: Undef<ColorData>;
                        if (stored && (backgroundColor = stored.backgroundColor) && !backgroundColor.transparent) {
                            node.android('buttonTint', `@color/${Resource.addColor(resourceId, backgroundColor)}`);
                        }
                        return;
                    }
                    case 'image':
                        if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                            boxImage = [node];
                            stored ||= {} as BoxStyle;
                        }
                        break;
                }
            }
            if (stored) {
                if (node.imageContainer && node.renderedAs) {
                    const borderRadius = getBorderRadius(stored);
                    if (borderRadius) {
                        const items: StringValue[] = [{ key: 'cornerFamily', value: node.dataset.androidCornerFamily === 'cut' ? 'cut' : 'rounded' }];
                        const maxRadius = Math.min(node.bounds.width, node.bounds.height) / 2;
                        let radius: string;
                        for (const attr in borderRadius) {
                            let value = borderRadius[attr] as string;
                            const checkSize = (cssAttr: CssStyleAttr) => {
                                if (isPercent(radius = node.css(cssAttr))) {
                                    if (asPercent(value = radius) > 0.5) {
                                        value = '50%';
                                    }
                                }
                                else {
                                    const unit = asPx(value);
                                    if (unit > maxRadius) {
                                        value = '50%';
                                    }
                                }
                            };
                            switch (attr) {
                                case 'radius':
                                    checkSize('borderTopLeftRadius');
                                    items.push({ key: 'cornerSize', value });
                                    break;
                                case 'topLeftRadius':
                                    checkSize('borderTopLeftRadius');
                                    items.push({ key: 'cornerSizeTopLeft', value });
                                    break;
                                case 'topRightRadius':
                                    checkSize('borderTopRightRadius');
                                    items.push({ key: 'cornerSizeTopRight', value });
                                    break;
                                case 'bottomLeftRadius':
                                    checkSize('borderBottomLeftRadius');
                                    items.push({ key: 'cornerSizeBottomLeft', value });
                                    break;
                                case 'bottomRightRadius':
                                    checkSize('borderBottomRightRadius');
                                    items.push({ key: 'cornerSizeBottomRight', value });
                                    break;
                            }
                        }
                        const { borderAll, borderData } = getBorderAll(stored, true);
                        if (borderAll && borderData) {
                            node.app('strokeWidth', formatPX(Math.round(borderData.width)));
                            node.app('strokeColor', `@color/${Resource.addColor(resourceId, borderData.color)}`);
                            delete stored.borderTop;
                            delete stored.borderBottom;
                            delete stored.borderRight;
                            delete stored.borderLeft;
                        }
                        convertShapeableImageView(resourceId, node, items);
                        delete stored.borderRadius;
                        if (Object.keys(stored).length === 0) {
                            return;
                        }
                    }
                }
                const images = this.getDrawableImages(resourceId, node, stored, boxImage);
                const outline = stored.outline;
                let indentWidth = 0;
                if (outline && this.options.outlineAsInsetBorder) {
                    const width = Math.round(outline.width);
                    indentWidth = width === 2 && outline.style === 'double' ? 3 : width;
                }
                let [shapeData, layerList] = this.getDrawableBackground(resourceId, stored, { indentWidth, images, node });
                const emptyBackground = !shapeData && !layerList;
                if (outline && (this.options.outlineAsInsetBorder || emptyBackground)) {
                    const [outlineShapeData, outlineLayerList] = this.getDrawableBackground(resourceId, stored, { images: emptyBackground ? images : undefined, borderOnly: !emptyBackground, outline });
                    if (outlineShapeData) {
                        shapeData ||= outlineShapeData;
                    }
                    else if (outlineLayerList) {
                        if (layerList) {
                            layerList[0].item.push(...outlineLayerList[0].item);
                        }
                        else {
                            layerList = outlineLayerList;
                        }
                    }
                }
                if (shapeData) {
                    setDrawableBackground(node, applyTemplate('shape', SHAPE_TMPL, shapeData));
                }
                else if (layerList) {
                    setDrawableBackground(node, applyTemplate('layer-list', LAYERLIST_TMPL, layerList));
                }
                else {
                    const backgroundColor = stored.backgroundColor;
                    if (backgroundColor) {
                        const color = getColorValue(resourceId, backgroundColor, node.inputElement);
                        if (color) {
                            if (!themeBackground) {
                                if (node.tagName === 'HTML') {
                                    setBodyBackground(color);
                                    return;
                                }
                                const innerWrapped = node.innerMostWrapped as T;
                                if (innerWrapped.documentBody) {
                                    setBodyBackground(color);
                                    deleteBodyWrapper(innerWrapped, node);
                                    return;
                                }
                            }
                            const fontStyle = !node.is(CONTAINER_NODE.TEXT) && node.data<FontAttribute>(Resource.KEY_NAME, 'fontStyle');
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
        });
    }

    public writeDrawableBackground(node: T, boxStyle: BoxStyle, options: WriteDrawableBackgroundOptions = {}) {
        const resourceId = node.localSettings.resourceId;
        const [shapeData, layerList, corners] = this.getDrawableBackground(resourceId, boxStyle, options);
        let result: string;
        if (shapeData) {
            result = applyTemplate('shape', SHAPE_TMPL, shapeData);
        }
        else if (layerList) {
            result = applyTemplate('layer-list', LAYERLIST_TMPL, layerList);
        }
        else {
            return '';
        }
        const resourceName = options.resourceName;
        result = this.saveDrawable(resourceId, node, result, resourceName || 'system');
        if (result && options.resourceData) {
            for (const item of options.resourceData) {
                if (!item.drawable) {
                    item.drawable = result;
                    break;
                }
            }
            return this.saveDrawable(resourceId, node, applyTemplate('layer-list', LAYERLIST_TMPL, createLayerList(resourceId, options.resourceData, corners)), 'main' + (resourceName ? '_' + resourceName : ''));
        }
        return result;
    }

    public getDrawableBackground(resourceId: number, boxStyle: BoxStyle, { node, indentWidth = 0, images, borderOnly = false, outline }: DrawableData): [Null<StandardMap[]>, Null<LayerList[]>, Undef<CornerRadiusData>] {
        const corners = !borderOnly ? getBorderRadius(boxStyle) : undefined;
        let shapeData: Null<StandardMap[]> = null,
            layerList: Null<LayerList[]> = null,
            borderAll: boolean,
            borderStyle: boolean,
            borderVisible: boolean[],
            borders: Undef<BorderAttribute>[],
            border: Undef<BorderAttribute>,
            borderData: Undef<BorderAttribute>;
        if (outline) {
            borderAll = true;
            borderStyle = true;
            borderVisible = new Array(4).fill(true);
            borders = new Array(4).fill(outline);
            borderData = outline;
        }
        else {
            ({ borderAll, borderStyle, borderVisible, borders, borderData } = getBorderAll(boxStyle, false, node));
        }
        if (borderAll) {
            border = borderData;
        }
        if (node && (node.layoutFrame && !node.rendering || node.textElement && node.textEmpty) && node.renderedAs) {
            const transparent = new Array(4);
            let count = 0;
            for (let i = 0; i < 4; ++i) {
                const item = borders[i];
                if (item && item.color.transparent) {
                    transparent[i] = item;
                    ++count;
                }
            }
            if (count > 1 && count < 4) {
                let valid: Undef<boolean>;
                const resetBorder = (index: number, padding: number) => {
                    let item = index !== -1 && borders[index];
                    if (item) {
                        switch (index) {
                            case 0:
                                node.setCacheValue('borderTopWidth', 0);
                                break;
                            case 1:
                                node.setCacheValue('borderRightWidth', 0);
                                break;
                            case 2:
                                node.setCacheValue('borderBottomWidth', 0);
                                break;
                            case 3:
                                node.setCacheValue('borderLeftWidth', 0);
                                break;
                        }
                        borders[index] = undefined;
                        borderVisible[index] = false;
                    }
                    if (item = borders[padding]) {
                        const width = Math.ceil(item.width);
                        const setOffsetTop = (value: number, baseline?: boolean, inverted?: boolean) => {
                            if (!node.pageFlow) {
                                if (!baseline) {
                                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, value * (inverted ? index !== -1 ? 2 : 1 : -1));
                                }
                            }
                            else if (node.android('layout_alignBaseline')) {
                                if (baseline) {
                                    if (node.verticalAligned) {
                                        node.setCacheValue('verticalAlign', node.verticalAlign + value);
                                    }
                                    else if (node.positionRelative) {
                                        node.setCacheValue('top', node.top - value);
                                    }
                                }
                            }
                            else if (!node.baselineAltered) {
                                if (node.renderParent!.layoutConstraint) {
                                    const adjustment = node.bounds.top - node.documentParent.box.top;
                                    if (adjustment !== 0) {
                                        node.anchorParent('vertical', 0, undefined, true);
                                        node.delete('app', 'layout_constraintBaseline_toBaselineOf');
                                        node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                                        node.setCacheValue('top', 0);
                                        node.translateY(adjustment);
                                        node.baselineAltered = true;
                                    }
                                }
                                else {
                                    if (baseline) {
                                        value /= 2;
                                    }
                                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, value);
                                }
                            }
                        };
                        switch (padding) {
                            case 0:
                                setOffsetTop(width);
                                node.setCacheValue('borderTopWidth', 0);
                                break;
                            case 1:
                                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, width);
                                node.setCacheValue('borderRightWidth', 0);
                                break;
                            case 2:
                                setOffsetTop(width, false, true);
                                node.setCacheValue('borderBottomWidth', 0);
                                break;
                            case 3:
                                node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, width);
                                node.setCacheValue('borderLeftWidth', 0);
                                break;
                        }
                        if (!valid) {
                            setOffsetTop(width, true);
                            valid = true;
                        }
                        borders[padding] = undefined;
                        borderVisible[padding] = false;
                    }
                    border = undefined;
                    borderAll = false;
                };
                const [top, right, bottom, left] = borders;
                const items: StringValue[] = [];
                let width = 0,
                    height = 0,
                    backgroundColor: Undef<ColorData>;
                if (transparent[0] && transparent[2]) {
                    let value = Math.ceil(transparent[0].width);
                    width = value;
                    if (right) {
                        if (!right.color.transparent) {
                            items.push({ key: 'cornerFamilyTopLeft', value: 'cut' }, { key: 'cornerSizeTopLeft', value: formatPX(value) });
                            backgroundColor = right.color;
                            resetBorder(0, 1);
                        }
                        else {
                            resetBorder(-1, 1);
                        }
                    }
                    if (left) {
                        if (!left.color.transparent) {
                            items.push({ key: 'cornerFamilyTopRight', value: 'cut' }, { key: 'cornerSizeTopRight', value: formatPX(value) });
                            backgroundColor = left.color;
                            resetBorder(0, 3);
                        }
                        else {
                            resetBorder(-1, 3);
                        }
                    }
                    value = Math.ceil(transparent[2].width);
                    width = Math.max(width, value);
                    if (right) {
                        if (!right.color.transparent) {
                            items.push({ key: 'cornerFamilyBottomLeft', value: 'cut' }, { key: 'cornerSizeBottomLeft', value: formatPX(value) });
                            backgroundColor = right.color;
                            resetBorder(2, 1);
                        }
                        else {
                            resetBorder(-1, 1);
                        }
                    }
                    if (left) {
                        if (!left.color.transparent) {
                            items.push({ key: 'cornerFamilyBottomRight', value: 'cut' }, { key: 'cornerSizeBottomRight', value: formatPX(value) });
                            backgroundColor = left.color;
                            resetBorder(2, 3);
                        }
                        else {
                            resetBorder(-1, 3);
                        }
                    }
                }
                if (transparent[1] && transparent[3]) {
                    let value = Math.ceil(transparent[1].width);
                    height = value;
                    if (top) {
                        if (!top.color.transparent) {
                            items.push({ key: 'cornerFamilyBottomRight', value: 'cut' }, { key: 'cornerSizeBottomRight', value: formatPX(value) });
                            backgroundColor = top.color;
                            resetBorder(1, 0);
                        }
                        else {
                            resetBorder(-1, 0);
                        }
                    }
                    if (bottom) {
                        if (!bottom.color.transparent) {
                            items.push({ key: 'cornerFamilyTopRight', value: 'cut' }, { key: 'cornerSizeTopRight', value: formatPX(value) });
                            backgroundColor = bottom.color;
                            resetBorder(1, 2);
                        }
                        else {
                            resetBorder(-1, 2);
                        }
                    }
                    value = Math.ceil(transparent[3].width);
                    height = Math.max(height, value);
                    if (top) {
                        if (!top.color.transparent) {
                            items.push({ key: 'cornerFamilyBottomLeft', value: 'cut' }, { key: 'cornerSizeBottomLeft', value: formatPX(value) });
                            backgroundColor = top.color;
                            resetBorder(3, 0);
                        }
                        else {
                            resetBorder(-1, 0);
                        }
                    }
                    if (bottom) {
                        if (!bottom.color.transparent) {
                            items.push({ key: 'cornerFamilyTopLeft', value: 'cut' }, { key: 'cornerSizeTopLeft', value: formatPX(value) });
                            backgroundColor = bottom.color;
                            resetBorder(3, 2);
                        }
                        else {
                            resetBorder(-1, 2);
                        }
                    }
                }
                if (valid) {
                    if (backgroundColor) {
                        boxStyle.backgroundColor = backgroundColor;
                    }
                    convertShapeableImageView(resourceId, node, items, true);
                    if (!node.hasUnit('width')) {
                        node.css('width', formatPX(width || node.box.width), true);
                    }
                    if (!node.hasUnit('height')) {
                        node.css('height', formatPX(height || node.box.height), true);
                    }
                }
            }
        }
        if (border && !isAlternatingBorder(border.style, Math.round(border.width)) && !(border.style === 'double' && Math.floor(border.width) > 1) || !borderData && (corners || images && images.length)) {
            const stroke = border && getBorderStroke(resourceId, border);
            if (images && images.length || indentWidth || outline && borderOnly) {
                layerList = createLayerList(resourceId, images, corners, !borderOnly ? boxStyle : undefined, stroke, indentWidth);
            }
            else {
                shapeData = [{
                    'xmlns:android': XML_NAMESPACE.android,
                    'android:shape': 'rectangle',
                    stroke,
                    solid: !borderOnly && getBackgroundColor(resourceId, boxStyle.backgroundColor),
                    corners
                }];
            }
        }
        else if (borderData) {
            layerList = createLayerList(resourceId, images, corners, !borderOnly ? boxStyle : undefined);
            if (borderStyle && !isAlternatingBorder(borderData.style)) {
                const width = Math.round(borderData.width);
                if (borderData.style === 'double' && width > 1) {
                    insertDoubleBorder(
                        resourceId,
                        layerList[0].item,
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
                    const indentOffset = indentWidth ? formatPX(indentWidth) : '';
                    layerList[0].item.push({
                        top: borderVisible[0] ? indentOffset : hideOffset,
                        right: borderVisible[1] ? indentOffset : hideOffset,
                        bottom: borderVisible[2] ? indentOffset : hideOffset,
                        left: borderVisible[3] ? indentOffset : hideOffset,
                        shape: { 'android:shape': 'rectangle', stroke: getBorderStroke(resourceId, borderData), corners }
                    });
                }
            }
            else {
                const layerData = layerList[0];
                setBorderStyle(resourceId, layerData, 0, borders, corners, indentWidth);
                setBorderStyle(resourceId, layerData, 3, borders, corners, indentWidth);
                setBorderStyle(resourceId, layerData, 2, borders, corners, indentWidth);
                setBorderStyle(resourceId, layerData, 1, borders, corners, indentWidth);
            }
        }
        return [shapeData, layerList, corners];
    }

    public getDrawableImages(resourceId: number, node: T, data: BoxStyle, boxImage?: T[]) {
        const backgroundImage = data.backgroundImage;
        if (backgroundImage || boxImage) {
            const resource = this.resource as android.base.Resource<T>;
            const screenDimension = node.localSettings.screenDimension;
            const { bounds, fontSize } = node;
            const { width: boundsWidth, height: boundsHeight } = bounds;
            const documentBody = node.innerMostWrapped.documentBody;
            const result: BackgroundImageData[] = [];
            const svg: Undef<true>[] = [];
            const images: (string | GradientTemplate)[] = [];
            const imageDimensions: Null<Dimension>[] = [];
            const backgroundPosition: BoxRectPosition[] = [];
            const backgroundPositionX = data.backgroundPositionX.split(CHAR_SEPARATOR);
            const backgroundPositionY = data.backgroundPositionY.split(CHAR_SEPARATOR);
            const withinBorderWidth = (width: number) => width === boundsWidth || width === (boundsWidth - node.borderLeftWidth - node.borderRightWidth);
            const withinBorderHeight = (height: number) => height === boundsHeight || height === (boundsHeight - node.borderTopWidth - node.borderBottomWidth);
            let backgroundRepeat = data.backgroundRepeat.split(CHAR_SEPARATOR),
                backgroundSize = data.backgroundSize.split(CHAR_SEPARATOR),
                length = 0;
            if (backgroundImage) {
                const svgInstance = this._resourceSvgInstance;
                const q = backgroundImage.length;
                const fillAttribute = (attribute: string[]) => {
                    while (attribute.length < q) {
                        attribute.push(...attribute.slice(0));
                    }
                    attribute.length = q;
                    return attribute;
                };
                backgroundRepeat = fillAttribute(backgroundRepeat);
                backgroundSize = fillAttribute(backgroundSize);
                let modified: Undef<boolean>;
                for (let i = 0; i < q; ++i) {
                    let value = backgroundImage[i],
                        valid: Undef<boolean>;
                    if (typeof value === 'string') {
                        if (value !== 'initial') {
                            if (svgInstance && svgInstance.enabled) {
                                const [parentElement, element] = svgInstance.createSvgElement(node, value);
                                if (parentElement && element) {
                                    const drawable = svgInstance.createSvgDrawable(node, element, { size: backgroundSize[i] });
                                    if (drawable) {
                                        let dimension = node.data<squared.svg.Svg>(Resource.KEY_NAME, 'svg')?.viewBox;
                                        if (!dimension || !dimension.width || !dimension.height) {
                                            dimension = { width: element.width.baseVal.value, height: element.height.baseVal.value } as DOMRect;
                                        }
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
                                                else if (ratioHeight > 1) {
                                                    height = boundsHeight;
                                                    width /= ratioHeight;
                                                }
                                                else {
                                                    width = boundsWidth * (ratioWidth / ratioHeight);
                                                }
                                                dimension.width = width;
                                                dimension.height = height;
                                            }
                                        }
                                        images[length] = drawable;
                                        imageDimensions[length] = dimension;
                                        svg[length] = true;
                                        valid = true;
                                    }
                                    parentElement.removeChild(element);
                                }
                            }
                            if (!valid) {
                                const uri = extractURL(value);
                                if (uri) {
                                    if (uri.startsWith('data:image/')) {
                                        const rawData = resource.getRawData(resourceId, uri);
                                        if (rawData) {
                                            const { base64, filename } = rawData;
                                            if (base64 && filename) {
                                                images[length] = splitPairStart(filename, '.', false, true);
                                                imageDimensions[length] = rawData.width && rawData.height ? rawData as Dimension : null;
                                                resource.writeRawImage(resourceId, filename, rawData);
                                                valid = true;
                                            }
                                        }
                                    }
                                    else {
                                        value = resolvePath(uri);
                                        const src = resource.addImageSet(resourceId, { mdpi: value });
                                        if (src) {
                                            images[length] = src;
                                            imageDimensions[length] = resource.getImage(resourceId, value)!;
                                            valid = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (value.colorStops.length > 1) {
                        images[length] = createBackgroundGradient(resourceId, value, node.api, q, data.borderRadius);
                        imageDimensions[length] = value.dimension;
                        valid = true;
                    }
                    if (valid) {
                        const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                        const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                        backgroundPosition[length] = Resource.getBackgroundPosition(
                            checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'),
                            node.actualDimension,
                            {
                                fontSize,
                                imageDimension: imageDimensions[length],
                                imageSize: backgroundSize[i],
                                screenDimension
                            }
                        );
                        ++length;
                    }
                    else {
                        backgroundRepeat[i] = '';
                        backgroundSize[i] = '';
                        modified = true;
                    }
                }
                if (modified) {
                    spliceArray(backgroundRepeat, value => value === '');
                    spliceArray(backgroundSize, value => value === '');
                }
            }
            if (boxImage) {
                if (length === 0) {
                    backgroundRepeat = [];
                    backgroundSize = [];
                }
                for (const image of boxImage) {
                    const element = image.element as HTMLImageElement;
                    const src = resource.addImageSrc(resourceId, element);
                    if (src) {
                        const imageDimension = image.bounds;
                        images[length] = src;
                        backgroundRepeat[length] = 'no-repeat';
                        backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                        const position = Resource.getBackgroundPosition(
                            image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageDimension.left - bounds.left + node.borderLeftWidth, imageDimension.top - bounds.top + node.borderTopWidth),
                            node.actualDimension,
                            {
                                fontSize,
                                imageDimension,
                                screenDimension
                            }
                        );
                        const stored = resource.getImage(resourceId, element.src);
                        if (!node.hasUnit('width')) {
                            const offsetStart = (stored && stored.width || element.naturalWidth) + position.left - (node.paddingLeft + node.borderLeftWidth);
                            if (offsetStart > 0) {
                                node.modifyBox(BOX_STANDARD.PADDING_LEFT, offsetStart);
                            }
                        }
                        if (stored) {
                            stored.watch = image.watch;
                            stored.tasks = image.tasks;
                            imageDimensions[length] = stored;
                        }
                        backgroundPosition[length] = position;
                        ++length;
                    }
                }
            }
            for (let i = length - 1, j = 0; i >= 0; --i) {
                const value = images[i];
                const imageData: BackgroundImageData = { order: Infinity };
                if (typeof value === 'object' && !value.positioning) {
                    imageData.gravity = 'fill';
                    imageData.gradient = value;
                    imageData.order = j++;
                    result.push(imageData);
                    continue;
                }
                const position = backgroundPosition[i];
                const orientation = position.orientation;
                const k = orientation.length;
                const positionX = k >= 3 && isLength(orientation[1], true);
                const positionY = k >= 3 && isLength(orientation[k - 1], true);
                const size = backgroundSize[i];
                let repeat = backgroundRepeat[i],
                    dimension = imageDimensions[i] || null,
                    dimenWidth = NaN,
                    dimenHeight = NaN,
                    bitmap = svg[i] !== true,
                    autoFit = node.is(CONTAINER_NODE.IMAGE) || typeof value !== 'string',
                    top = 0,
                    right = 0,
                    bottom = 0,
                    left = 0,
                    width = 0,
                    height = 0,
                    negativeOffset = 0,
                    posTop = NaN,
                    posRight = NaN,
                    posBottom = NaN,
                    posLeft = NaN,
                    tileModeX = '',
                    tileModeY = '',
                    gravityX = '',
                    gravityY = '',
                    gravityAlign = '',
                    offsetX: Undef<boolean>,
                    offsetY: Undef<boolean>;
                if (dimension) {
                    if (!dimension.width || !dimension.height) {
                        dimension = null;
                    }
                    else {
                        dimenWidth = dimension.width;
                        dimenHeight = dimension.height;
                    }
                }
                if (repeat.indexOf(' ') !== -1) {
                    const [x, y] = splitPair(repeat, ' ');
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
                    case 'initial':
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
                        if (positionX) {
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
                        if (positionX) {
                            offsetX = true;
                        }
                        break;
                    default: {
                        const percent = position.leftAsPercent;
                        if (percent < 1) {
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
                        if (positionY) {
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
                        if (positionY) {
                            offsetY = true;
                        }
                        break;
                    default: {
                        const percent = position.topAsPercent;
                        if (percent < 1) {
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
                        if (node.ascend({ condition: item => item.hasUnit('width'), startSelf: true }).length) {
                            gravityX = '';
                            gravityY = '';
                        }
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
                        if (size) {
                            const [horizontal, vertical] = splitPair(size, ' ');
                            if (horizontal === '100%') {
                                gravityAlign = 'fill_horizontal';
                            }
                            else if (horizontal !== 'auto') {
                                const unit = node.parseWidth(horizontal, false);
                                if (tileModeX !== 'repeat' || withinBorderWidth(unit) || !bitmap) {
                                    width = unit;
                                }
                            }
                            if (vertical === '100%') {
                                gravityAlign = (gravityAlign ? '|' : '') + 'fill_vertical';
                            }
                            else if (vertical !== 'auto') {
                                const unit = node.parseHeight(vertical, false);
                                if (tileModeY !== 'repeat' || withinBorderHeight(unit) || !bitmap) {
                                    height = unit;
                                }
                            }
                            if (!bitmap && width && height) {
                                dimension = { width, height };
                                dimenWidth = width;
                                dimenHeight = height;
                            }
                        }
                        break;
                }
                let recalibrate = true,
                    resizedWidth: Undef<boolean>,
                    resizedHeight: Undef<boolean>,
                    unsizedWidth: Undef<boolean>,
                    unsizedHeight: Undef<boolean>;
                if (dimension) {
                    let fittedWidth = boundsWidth,
                        fittedHeight = boundsHeight;
                    if (size !== 'contain' && !node.hasWidth) {
                        const innerWidth = window.innerWidth;
                        const screenWidth = screenDimension.width;
                        const getFittedWidth = () => boundsHeight * (fittedWidth / boundsWidth);
                        if (boundsWidth === innerWidth) {
                            if (innerWidth >= screenWidth) {
                                fittedWidth = screenWidth;
                                fittedHeight = getFittedWidth();
                            }
                            else {
                                ({ width: fittedWidth, height: fittedHeight } = node.fitToScreen(bounds));
                            }
                        }
                        else if (innerWidth >= screenWidth) {
                            fittedWidth = node.actualBoxWidth(boundsWidth);
                            fittedHeight = getFittedWidth();
                        }
                    }
                    const ratioWidth = dimenWidth / fittedWidth;
                    const ratioHeight = dimenHeight / fittedHeight;
                    const getImageWidth = () => dimenWidth * height / dimenHeight;
                    const getImageHeight = () => dimenHeight * width / dimenWidth;
                    const getImageRatioWidth = () => fittedWidth * (ratioWidth / ratioHeight);
                    const getImageRatioHeight = () => fittedHeight * (ratioHeight / ratioWidth);
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
                                unsizedWidth = true;
                                unsizedHeight = true;
                                height = boundsHeight;
                                autoFit = true;
                                break;
                            }
                        case 'cover': {
                            const covering = size === 'cover';
                            resetGravityPosition(covering, !covering);
                            if (ratioWidth < ratioHeight) {
                                width = fittedWidth;
                                height = getImageRatioHeight();
                                if (height > boundsHeight) {
                                    const percent = position.topAsPercent;
                                    if (percent !== 0) {
                                        top = Math.round((boundsHeight - height) * percent);
                                    }
                                    const attr = node.layoutConstraint || node.layoutRelative ? 'minHeight' : 'height';
                                    if (!node.hasUnit(attr)) {
                                        node.css(attr, formatPX(boundsHeight - node.contentBoxHeight));
                                    }
                                    if (!offsetX) {
                                        gravityAlign = 'center_horizontal|fill_horizontal';
                                    }
                                }
                                else {
                                    if (height < boundsHeight) {
                                        width = fittedWidth * boundsHeight / height;
                                        height = boundsHeight;
                                    }
                                    if (!offsetX) {
                                        gravityAlign = 'center_horizontal|fill';
                                    }
                                }
                            }
                            else if (ratioWidth > ratioHeight) {
                                width = getImageRatioWidth();
                                height = fittedHeight;
                                if (width > boundsWidth) {
                                    if (node.hasWidth) {
                                        const percent = position.leftAsPercent;
                                        if (percent !== 0) {
                                            left = Math.round((boundsWidth - width) * percent);
                                        }
                                    }
                                    if (!offsetY) {
                                        gravityAlign = 'center_vertical|fill_vertical';
                                    }
                                }
                                else {
                                    if (width < boundsWidth) {
                                        width = boundsWidth;
                                        height = fittedHeight * boundsWidth / width;
                                    }
                                    if (!offsetY) {
                                        gravityAlign = 'center_vertical|fill';
                                    }
                                }
                                offsetX = false;
                            }
                            else {
                                gravityAlign = 'fill';
                            }
                            offsetY = false;
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
                            if (height && !width) {
                                width = getImageWidth();
                            }
                            if (width && !height) {
                                height = getImageHeight();
                            }
                            if (width && height && withinBorderWidth(width) && withinBorderHeight(height)) {
                                tileModeX = '';
                                tileModeY = '';
                            }
                            break;
                    }
                }
                if (data.backgroundClip && bitmap) {
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
                        right += clipRight;
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
                }
                else if (recalibrate) {
                    if (data.backgroundOrigin) {
                        if (tileModeX !== 'repeat') {
                            if (!isNaN(posRight)) {
                                right += data.backgroundOrigin.right;
                            }
                            else {
                                left += data.backgroundOrigin.left;
                            }
                        }
                        if (tileModeY !== 'repeat') {
                            if (!isNaN(posBottom)) {
                                bottom += data.backgroundOrigin.bottom;
                            }
                            else {
                                top += data.backgroundOrigin.top;
                            }
                        }
                    }
                    if (!autoFit && !documentBody) {
                        if (width === 0 && dimenWidth > boundsWidth) {
                            width = boundsWidth - (offsetX ? Math.min(position.left, 0) : 0);
                            let fill = true;
                            if (gravityX && tileModeY === 'repeat') {
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
                                            tileModeY = '';
                                        }
                                        else {
                                            gravityX = '';
                                        }
                                        posLeft = NaN;
                                        posRight = 0;
                                        break;
                                    case 'center_horizontal':
                                        gravityX += '|fill_vertical';
                                        tileModeY = '';
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
                                            tileModeY = '';
                                        }
                                        else {
                                            gravityX = '';
                                        }
                                        posLeft = 0;
                                        posRight = NaN;
                                        break;
                                }
                                offsetX = false;
                                gravityY = '';
                            }
                            if (fill) {
                                gravityAlign = delimitString({ value: gravityAlign, delimiter: '|', not: ['fill'] }, 'fill_horizontal');
                            }
                            if (tileModeX !== 'disabled') {
                                tileModeX = '';
                            }
                            resizedWidth = true;
                        }
                        if (height === 0 && dimenHeight > boundsHeight) {
                            height = boundsHeight;
                            let fill = true;
                            if (gravityY && tileModeX === 'repeat') {
                                switch (gravityY) {
                                    case 'top':
                                        if (offsetY) {
                                            bottom += boundsHeight - dimenHeight;
                                            const offset = position.top;
                                            if (offset < 0) {
                                                negativeOffset = offset;
                                            }
                                            height = 0;
                                            bottom -= offset;
                                            fill = false;
                                            gravityY = 'bottom';
                                            tileModeX = '';
                                            posTop = NaN;
                                            posBottom = 0;
                                        }
                                        break;
                                    case 'center_vertical':
                                        gravityY += '|fill_horizontal';
                                        tileModeX = '';
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
                                        }
                                        else {
                                            gravityY = '';
                                        }
                                        tileModeX = '';
                                        posTop = 0;
                                        posBottom = NaN;
                                        break;
                                }
                                gravityX = '';
                                offsetY = false;
                            }
                            if (fill) {
                                gravityAlign = delimitString({ value: gravityAlign, delimiter: '|', not: ['fill'] }, 'fill_vertical');
                            }
                            if (tileModeY !== 'disabled') {
                                tileModeY = '';
                            }
                            resizedHeight = true;
                        }
                    }
                }
                switch (node.controlName) {
                    case SUPPORT_TAGNAME.TOOLBAR:
                    case SUPPORT_TAGNAME_X.TOOLBAR:
                        gravityX = '';
                        gravityY = '';
                        gravityAlign = 'fill';
                        break;
                }
                if (!autoFit) {
                    if (width === 0 && dimenWidth < boundsWidth && tileModeX === 'disabled') {
                        width = dimenWidth;
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
                                if (width && !unsizedWidth) {
                                    tileModeX = '';
                                }
                                else if (unsizedHeight) {
                                    width = dimenWidth;
                                    gravityAlign = delimitString({ value: gravityAlign, delimiter: '|', not: ['fill'] }, 'fill_horizontal');
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
                            case 'left':
                            case 'start':
                                if (!isNaN(posLeft)) {
                                    tileModeY = '';
                                }
                                gravityX = '';
                                break;
                            case 'center_horizontal':
                                if (node.rendering) {
                                    tileModeY = '';
                                }
                                break;
                            case 'right':
                            case 'end':
                                if (height && !unsizedHeight) {
                                    tileModeY = '';
                                }
                                else if (unsizedWidth) {
                                    height = dimenHeight;
                                    gravityAlign = delimitString({ value: gravityAlign, delimiter: '|', not: ['fill'] }, 'fill_vertical');
                                    if (dimenWidth >= dimenHeight) {
                                        tileModeY = '';
                                    }
                                }
                                break;
                        }
                        gravityY = '';
                    }
                    if (gravityX && !resizedWidth) {
                        gravityAlign = delimitString({ value: gravityAlign, delimiter: '|' }, gravityX);
                        gravityX = '';
                    }
                    if (gravityY && !resizedHeight) {
                        gravityAlign = delimitString({ value: gravityAlign, delimiter: '|' }, gravityY);
                        gravityY = '';
                    }
                }
                else if (width === 0 && height === 0 && gravityAlign === 'fill') {
                    bitmap = false;
                }
                let src: Undef<string>;
                if (typeof value === 'string') {
                    src = `@drawable/${value}`;
                }
                else if (value.item) {
                    if (width === 0) {
                        width = dimension ? dimension.width : node.fitToScreen(node.actualDimension).width;
                    }
                    if (height === 0) {
                        height = dimension ? dimension.height : node.fitToScreen(node.actualDimension).height;
                    }
                    const gradient = Resource.insertStoredAsset(
                        resourceId,
                        'drawables',
                        `${node.controlId}_gradient_${i + 1}`,
                        applyTemplate('vector', VECTOR_TMPL, [{
                            'xmlns:android': XML_NAMESPACE.android,
                            'xmlns:aapt': XML_NAMESPACE.aapt,
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
                    if (gradient) {
                        src = `@drawable/${gradient}`;
                        imageData.order = j++;
                        imageData.vectorGradient = true;
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
                let gravity = '';
                if (gravityX === 'center_horizontal' && gravityY === 'center_vertical') {
                    gravity = 'center';
                }
                else if (gravityAlign === 'center_horizontal|center_vertical') {
                    gravityAlign = 'center';
                }
                else {
                    gravity = delimitString({ value: gravityX, delimiter: '|' }, gravityY);
                }
                if (src) {
                    if (bitmap && (!autoFit && (gravityAlign && gravity || tileModeX === 'repeat' || tileModeY === 'repeat' || documentBody) || unsizedWidth || unsizedHeight)) {
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
                        imageData.gravity = delimitString({ value: gravity, delimiter: '|' }, gravityAlign);
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
                        if (width) {
                            imageData.width = formatPX(width);
                        }
                        if (height) {
                            imageData.height = formatPX(height);
                        }
                        result.push(imageData);
                    }
                }
            }
            return result.sort((a, b) => a.order - b.order);
        }
    }

    private saveDrawable(resourceId: number, node: T, value: string, suffix?: string) {
        return value ? `@drawable/${Resource.insertStoredAsset(resourceId, 'drawables', (node.containerName + '_' + node.controlId + (suffix ? '_' + suffix : '')).toLowerCase(), value)}` : '';
    }
}