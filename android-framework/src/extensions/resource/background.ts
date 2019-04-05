import { UserSettingsAndroid } from '../../@types/application';
import { ResourceBackgroundOptions } from '../../@types/extension';
import { GradientColorStop, GradientTemplate } from '../../@types/resource';

import Resource from '../../resource';
import View from '../../view';

import { XMLNS_ANDROID } from '../../lib/constant';
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
    drawable?: string;
    width?: string;
    height?: string;
    gravity?: string;
    bitmap: BitmapData[] | false;
    rotate: StringMap[] | false;
    gradient: GradientTemplate | false;
}

interface BitmapData {
    src: string;
    gravity: string;
    tileMode: string;
    tileModeX: string;
    tileModeY: string;
}

interface ShapeSolidData {
    color: string;
    dashWidth: string;
    dashGap: string;
}

const $enum = squared.base.lib.enumeration;
const $color = squared.lib.color;
const $css = squared.lib.css;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): ShapeSolidData {
    const result = getColorAttribute(Resource.addColor(border.color));
    const borderWidth = parseInt(border.width);
    const style = border.style;
    const groove = style === 'groove';
    if (borderWidth > 1 && (groove || style === 'ridge')) {
        const color = $color.parseColor(border.color);
        if (color) {
            const reduced = $color.reduceColor(color.valueAsRGBA, groove || color.value === '#000000' ? 0.5 : -0.5);
            if (reduced) {
                const colorName = Resource.addColor(reduced);
                if (colorName !== '') {
                    if (direction === 0 || direction === 2) {
                        halfSize = !halfSize;
                    }
                    if (color.value === '#000000' && (groove && (direction === 1 || direction === 3) || !groove && (direction === 0 || direction === 2))) {
                        halfSize = !halfSize;
                    }
                    if (halfSize) {
                        switch (direction) {
                            case 0:
                            case 3:
                                return getColorAttribute(colorName);
                            case 1:
                            case 2:
                                return result;
                        }
                    }
                    else {
                        switch (direction) {
                            case 0:
                            case 3:
                                return result;
                            case 1:
                            case 2:
                                return getColorAttribute(colorName);
                        }
                    }
                }
            }
        }
    }
    else {
        let multiplier = 0;
        switch (style) {
            case 'dotted':
                multiplier = 1;
                break;
            case 'dashed':
                multiplier = 2;
                break;
        }
        if (multiplier > 0) {
            result.dashWidth = `${borderWidth * multiplier}px`;
            result.dashGap = `${borderWidth}px`;
        }
    }
    return result;
}

function getShapeStroke(border: BorderAttribute, direction = -1, hasInset = false, isInset = false): ExternalData | undefined {
    if (border) {
        if (!hasInset || isInset) {
            return {
                width: border.width,
                ...getBorderStyle(border, isInset ? direction : -1)
            };
        }
        else if (hasInset) {
            return {
                width: $util.formatPX(Math.ceil(parseFloat(border.width) / 2)),
                ...getBorderStyle(border, direction, true)
            };
        }
    }
    return undefined;
}

function getShapeCorners(stored: BoxStyle): StringMap | undefined {
    if (stored.borderRadius) {
        if (stored.borderRadius.length === 1) {
            return { radius: stored.borderRadius[0] };
        }
        else {
            let borderRadius: string[];
            if (stored.borderRadius.length === 8) {
                borderRadius = [];
                for (let i = 0; i < stored.borderRadius.length; i += 2) {
                    borderRadius.push($util.formatPX((parseFloat(stored.borderRadius[i]) + parseFloat(stored.borderRadius[i + 1])) / 2));
                }
            }
            else {
                borderRadius = stored.borderRadius;
            }
            const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
            const result = {};
            let valid = false;
            for (let i = 0; i < borderRadius.length; i++) {
                if (borderRadius[i] !== '0px') {
                    result[`${boxModel[i]}Radius`] = borderRadius[i];
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

function insertDoubleBorder(items: ExternalData[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, corners: StringMap[] | false) {
    const width = parseInt(border.width);
    const baseWidth = Math.floor(width / 3);
    const remainder = width % 3;
    const offset =  remainder === 2 ? 1 : 0;
    const leftWidth = baseWidth + offset;
    const rightWidth = baseWidth + offset;
    let indentWidth = `${$util.formatPX(width - baseWidth)}`;
    let hideWidth = `-${indentWidth}`;
    items.push({
        top: top ? '' : hideWidth,
        right: right ? '' : hideWidth,
        bottom: bottom ? '' : hideWidth,
        left: left ? '' :  hideWidth,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: $util.formatPX(leftWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
    if (width === 3) {
        indentWidth = `${$util.formatPX(width)}`;
        hideWidth = `-${indentWidth}`;
    }
    items.push({
        top: top ? indentWidth : hideWidth,
        right: right ? indentWidth : hideWidth,
        bottom: bottom ? indentWidth : hideWidth,
        left: left ? indentWidth : hideWidth,
        shape: {
            'android:shape': 'rectangle',
            stroke: {
                width: $util.formatPX(rightWidth),
                ...getBorderStyle(border)
            },
            corners
        }
    });
}

function checkBackgroundPosition(value: string, adjacent: string, fallback: string) {
    const initial = value === 'initial' || value === 'unset';
    if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
        return /^[a-z]+$/.test(value) ? `${initial ? fallback : value} 0px` : `${fallback} ${value}`;
    }
    else if (initial) {
        return '0px';
    }
    return value;
}

function setBodyBackground(name: string, parent: string, attr: string, value: string) {
    Resource.addTheme({
        name,
        parent,
        items: { [attr]: value }
    });
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
                result.centerX = $util.formatPercent(center.leftAsPercent * 100);
                result.centerY = $util.formatPercent(center.topAsPercent * 100);
            }
            break;
        }
        case 'radial': {
            const radial = <RadialGradient> gradient;
            const center = radial.center;
            const radius = radial.radius;
            if (hasStop) {
                result.gradientRadius = radius.toString();
                result.centerX = center.left.toString();
                result.centerY = center.top.toString();
            }
            else {
                result.gradientRadius = $util.formatPX(radius);
                result.centerX = $util.formatPercent(center.leftAsPercent * 100);
                result.centerY = $util.formatPercent(center.topAsPercent * 100);
            }
            break;
        }
        case 'linear': {
            const linear = <LinearGradient> gradient;
            const dimension = <Dimension> linear.dimension;
            const width = dimension.width;
            const height = dimension.height;
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

function getPercentOffset(direction: string, position: RectPosition, backgroundSize: string, bounds: RectDimension, dimension?: Dimension): number {
    if (dimension) {
        const orientation = position.orientation;
        const sign = backgroundSize === 'cover' || backgroundSize === 'contain' ? -1 : 1;
        if (direction === 'left' || direction === 'right') {
            if (backgroundSize !== 'cover') {
                const value = orientation.length === 4 ? orientation[1] : orientation[0];
                if ($util.isPercent(value)) {
                    return sign * (direction === 'left' ? position.leftAsPercent : position.rightAsPercent) * (bounds.width - dimension.width);
                }
            }
            else {
                return 0;
            }
        }
        else {
            if (backgroundSize !== 'contain') {
                const value = orientation.length === 4 ? orientation[3] : orientation[1];
                if ($util.isPercent(value)) {
                    return sign * (direction === 'top' ? position.topAsPercent : position.bottomAsPercent) * (bounds.height - dimension.height);
                }
            }
            else {
                return 0;
            }
        }
    }
    return position[direction];
}

const getColorAttribute = (value: string): ShapeSolidData => ({ color: `@color/${value}`, dashWidth: '', dashGap: '' });

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
    const result = `M${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height} Z`;
    return precision ? $math.truncateString(result, precision) : result;
}

export default class ResourceBackground<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceBackgroundOptions = {
        autoSizeBackgroundImage: true
    };

    public readonly eventOnly = true;

    public afterResources() {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        for (const node of this.application.processing.cache) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored && node.hasResource($enum.NODE_RESOURCE.BOX_STYLE)) {
                const backgroundRepeat = stored.backgroundRepeat.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundSize = stored.backgroundSize.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionX = stored.backgroundPositionX.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionY = stored.backgroundPositionY.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundImage: (string | GradientTemplate)[] = [];
                const backgroundPosition: RectPosition[] = [];
                const imageDimensions: Undefined<Dimension>[] = [];
                let imageLength = 0;
                if (node.hasResource($enum.NODE_RESOURCE.IMAGE_SOURCE)) {
                    if (stored.backgroundImage)  {
                        imageLength = stored.backgroundImage.length;
                        while (backgroundSize.length < imageLength) {
                            $util.concatArray(backgroundSize, backgroundSize.slice(0));
                        }
                        backgroundSize.length = imageLength;
                        for (let i = 0, j = 0; i < imageLength; i++) {
                            const value = stored.backgroundImage[i];
                            let remove = true;
                            if (typeof value === 'string') {
                                if (value !== 'initial') {
                                    backgroundImage[j] = Resource.addImageUrl(value);
                                    if (backgroundImage[j] !== '') {
                                        imageDimensions[j] = Resource.ASSETS.images.get($css.resolveURL(value));
                                        remove = false;
                                    }
                                }
                            }
                            else if (value.colorStops.length > 1) {
                                const gradient = createBackgroundGradient(value, node.localSettings.targetAPI);
                                if (gradient) {
                                    backgroundImage[j] = gradient;
                                    imageDimensions[j] = value.dimension;
                                    remove = false;
                                }
                            }
                            if (remove) {
                                backgroundRepeat.splice(i, 1);
                                backgroundSize.splice(i, 1);
                                imageLength--;
                            }
                            else {
                                const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                                const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                                backgroundPosition[j] = $css.getBackgroundPosition(`${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`, node.actualDimension, node.fontSize);
                                j++;
                            }
                        }
                    }
                    if (node.extracted) {
                        if (imageLength === 0) {
                            backgroundRepeat.length = 0;
                            backgroundSize.length = 0;
                        }
                        const images = node.extracted.filter(item => item.visible && (item.imageElement || item.tagName === 'IMAGE'));
                        for (let i = 0, j = imageLength; i < images.length; i++) {
                            const image = images[i];
                            const element = <HTMLImageElement> image.element;
                            const src = Resource.addImageSrc(element);
                            if (src !== '') {
                                backgroundImage[j] = src;
                                imageDimensions[j] = Resource.ASSETS.images.get(element.src);
                                backgroundRepeat[j] = 'no-repeat';
                                backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                                const position = image.tagName === 'IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left}px ${image.bounds.top - node.bounds.top}px`;
                                backgroundPosition[j] = $css.getBackgroundPosition(position, node.actualDimension, node.fontSize);
                                j++;
                            }
                        }
                    }
                    imageLength = backgroundImage.length;
                }
                const borders: (BorderAttribute | undefined)[] = [
                    stored.borderTop,
                    stored.borderRight,
                    stored.borderBottom,
                    stored.borderLeft
                ];
                const borderVisible: boolean[] = [];
                let borderStyle = true;
                let borderData: BorderAttribute | undefined;
                for (let i = 0; i < borders.length; i++) {
                    const item = borders[i];
                    if (item) {
                        borderVisible[i] = true;
                        if (borderData && borderStyle) {
                            borderStyle = $util.isEqual(borderData, item);
                        }
                        borderData = item;
                    }
                    else {
                        borderVisible[i] = false;
                    }
                }
                const hasBorder = borderData !== undefined || stored.borderRadius !== undefined;
                const companion = node.companion;
                if (companion && !companion.visible && companion.htmlElement && !Resource.isInheritedStyle(companion, 'backgroundColor')) {
                    const companionStyle: BoxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                    if (companionStyle && companionStyle.backgroundColor) {
                        stored.backgroundColor = companionStyle.backgroundColor;
                    }
                }
                if (imageLength || hasBorder) {
                    const images: BackgroundImageData[] = [];
                    let resourceName = '';
                    for (let i = imageLength - 1; i >= 0; i--) {
                        const value = backgroundImage[i];
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
                            if (backgroundRepeat[i] !== 'repeat') {
                                if (backgroundRepeat[i] !== 'repeat-x') {
                                    switch (position.horizontal) {
                                        case '0%':
                                        case 'left':
                                            resetPosition('left', 'right');
                                            gravityX = node.localizeString('left');
                                            break;
                                        case '50%':
                                        case 'center':
                                            resetPosition('left', 'right', true);
                                            gravityX = 'center_horizontal';
                                            break;
                                        case '100%':
                                        case 'right':
                                            resetPosition('right', 'left');
                                            gravityX = node.localizeString('right');
                                            break;
                                        default:
                                            if (position.right !== 0) {
                                                gravityX += node.localizeString('right');
                                            }
                                            else {
                                                gravityX += node.localizeString('left');
                                            }
                                            break;
                                    }
                                }
                                if (backgroundRepeat[i] !== 'repeat-y') {
                                    switch (position.vertical) {
                                        case '0%':
                                        case 'top':
                                            resetPosition('top', 'bottom');
                                            gravityY += 'top';
                                            break;
                                        case '50%':
                                        case 'center':
                                            resetPosition('top', 'bottom', true);
                                            gravityY += 'center_vertical';
                                            break;
                                        case '100%':
                                        case 'bottom':
                                            resetPosition('bottom', 'top');
                                            gravityY += 'bottom';
                                            break;
                                        default:
                                            if (position.bottom !== 0) {
                                                gravityY += 'bottom';
                                            }
                                            else {
                                                gravityY += 'top';
                                            }
                                            break;
                                    }
                                }
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
                            if (node.renderChildren.length === 0 && dimension) {
                                if (gravityX !== '' && tileModeY === 'repeat') {
                                    const tileWidth = node.hasWidth ? node.width + node.paddingLeft + node.paddingRight : node.bounds.width - (node.borderLeftWidth + node.borderRightWidth);
                                    if (dimension.width < tileWidth) {
                                        const layoutWidth = $util.convertInt(node.android('layout_width'));
                                        if (/(left|start)/.test(gravityX)) {
                                            position.right = tileWidth - dimension.width;
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                        else if (/(right|end)/.test(gravityX)) {
                                            position.left = tileWidth - dimension.width;
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                        else if (gravityX === 'center_horizontal') {
                                            position.left = Math.floor((tileWidth - dimension.width) / 2);
                                            width = dimension.width;
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                    }
                                }
                                if (gravityY !== '' && tileModeX === 'repeat') {
                                    const tileHeight = node.hasHeight ? node.height + node.paddingTop + node.paddingBottom : node.bounds.height - (node.borderTopWidth + node.borderBottomWidth);
                                    if (dimension.height < tileHeight) {
                                        const layoutHeight = $util.convertInt(node.android('layout_height'));
                                        if (gravityY === 'top') {
                                            position.bottom = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                        else if (gravityY === 'bottom') {
                                            position.top = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                        else if (gravityY === 'center_vertical') {
                                            position.top = Math.floor((tileHeight - dimension.height) / 2);
                                            height = dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                    }
                                }
                            }
                            switch (backgroundSize[i]) {
                                case 'auto':
                                case 'auto auto':
                                case 'initial':
                                case 'contain':
                                    break;
                                case 'cover':
                                    gravity = 'center';
                                    tileMode = '';
                                    tileModeX = '';
                                    tileModeY = '';
                                    break;
                                case '100%':
                                    gravityX = 'fill_horizontal';
                                    break;
                                case '100% 100%':
                                    gravityX = 'fill_horizontal';
                                    gravityY = 'fill_vertical';
                                    break;
                                default:
                                    backgroundSize[i].split(' ').forEach((size, index) => {
                                        if (size !== 'auto') {
                                            if (index === 0) {
                                                width = node.parseUnit(size, true, false) - node.contentBoxWidth;
                                            }
                                            else {
                                                if (size === '100%') {
                                                    gravityY = 'fill_vertical';
                                                }
                                                else {
                                                    height = node.parseUnit(size, false, false) - node.contentBoxHeight;
                                                }
                                            }
                                        }
                                    });
                                    break;
                            }
                            if (dimension) {
                                const backgroundClip = stored.backgroundClip;
                                const bounds = node.bounds;
                                switch (backgroundSize[i]) {
                                    case 'cover':
                                        if (dimension.width < bounds.width || dimension.height < bounds.height) {
                                            const ratio = Math.max(bounds.width / dimension.width, bounds.height / dimension.height);
                                            width = dimension.width * ratio;
                                            height = dimension.height * ratio;
                                        }
                                        else {
                                            width = 0;
                                            height = 0;
                                            gravityX = 'fill_horizontal';
                                            gravityY = 'fill_vertical';
                                        }
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
                                            gravityX = 'fill_horizontal';
                                            gravityY = 'fill_vertical';
                                        }
                                        break;
                                    default:
                                        if (width === 0 && (height > 0 || gravityY === 'fill_vertical') && gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX !== 'repeat') {
                                            width = dimension.width * (height === 0 ? bounds.height : height) / dimension.height;
                                        }
                                        if (height === 0 && (width > 0 || gravityX === 'fill_horizontal') && gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY !== 'repeat') {
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
                                if (width > 0) {
                                    imageData.width = $util.formatPX(width);
                                }
                                if (height > 0) {
                                    imageData.height = $util.formatPX(height);
                                }
                            }
                            if (gravity === undefined) {
                                if (gravityX === 'center_horizontal' && gravityY === 'center_vertical') {
                                    gravity = 'center';
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
                            if (tileMode === 'repeat' || tileModeX === 'repeat' || tileModeY === 'repeat') {
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
                            }
                        }
                        else if (dimension) {
                            if (value.item) {
                                const width = Math.round(dimension.width);
                                const height = Math.round(dimension.height);
                                imageData.width = $util.formatPX(width);
                                imageData.height = $util.formatPX(height);
                                const src = Resource.insertStoredAsset(
                                    'drawables',
                                    `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i + 1}`,
                                    $xml.applyTemplate('vector', VECTOR_TMPL, [{
                                        'xmlns:android': XMLNS_ANDROID.android,
                                        'xmlns:aapt': XMLNS_ANDROID.aapt,
                                        'android:width': imageData.width || $util.formatPX(width),
                                        'android:height': imageData.height || $util.formatPX(height),
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
                                }
                            }
                            else {
                                imageData.gradient = value;
                            }
                        }
                        if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                            if (position.bottom !== 0) {
                                imageData.bottom = $util.formatPX(getPercentOffset('bottom', position, backgroundSize[i], node.bounds, dimension) + bottom);
                                bottom = 0;
                            }
                            else if (position.top !== 0) {
                                imageData.top = $util.formatPX(getPercentOffset('top', position, backgroundSize[i], node.bounds, dimension) + top);
                                top = 0;
                            }
                            if (position.right !== 0) {
                                imageData.right = $util.formatPX(getPercentOffset('right', position, backgroundSize[i], node.bounds, dimension) + right);
                                right = 0;
                            }
                            else if (position.left !== 0) {
                                imageData.left = $util.formatPX(getPercentOffset('left', position, backgroundSize[i], node.bounds, dimension) + left);
                                left = 0;
                            }
                            if (top > 0) {
                                imageData.top = $util.formatPX(top);
                            }
                            if (right > 0) {
                                imageData.right = $util.formatPX(right);
                            }
                            if (bottom > 0) {
                                imageData.bottom = $util.formatPX(bottom);
                            }
                            if (left > 0) {
                                imageData.left = $util.formatPX(left);
                            }
                            images.push(imageData);
                        }
                    }
                    let solid: StringMap | undefined;
                    if (stored.backgroundColor) {
                        const colorName = Resource.addColor(stored.backgroundColor);
                        if (colorName !== '') {
                            solid = { color: `@color/${colorName}` };
                        }
                    }
                    const border = stored.border;
                    const corners = getShapeCorners(stored);
                    let layerListData: ExternalData[] | undefined;
                    let shapeData: ExternalData[] | undefined;
                    function createLayerList() {
                        const layerList: ExternalData[] = [{
                            'xmlns:android': XMLNS_ANDROID.android,
                            item: []
                        }];
                        if (solid) {
                            layerList[0].item.push({
                                shape: {
                                    'android:shape': 'rectangle',
                                    solid
                                }
                            });
                        }
                        for (const image of images) {
                            if (image.gradient) {
                                layerList[0].item.push({
                                    shape: {
                                        'android:shape': 'rectangle',
                                        gradient: image.gradient
                                    }
                                });
                            }
                            else {
                                layerList[0].item.push(image);
                            }
                        }
                        return layerList;
                    }
                    if (borderData === undefined || border && !(border.style === 'double' && parseInt(border.width) > 2 || (border.style === 'groove' || border.style === 'ridge') && parseInt(border.width) > 1)) {
                        const stroke = border ? getShapeStroke(border) : false;
                        if (images.length) {
                            layerListData = createLayerList();
                            if (corners || stroke) {
                                layerListData[0].item.push({
                                    shape: {
                                        'android:shape': 'rectangle',
                                        corners,
                                        stroke
                                    }
                                });
                            }
                        }
                        else {
                            shapeData = [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'android:shape': 'rectangle',
                                solid,
                                corners,
                                stroke
                            }];
                        }
                    }
                    else {
                        layerListData = createLayerList();
                        const visibleAll = borderVisible[1] && borderVisible[2];
                        const getHideWidth = (value: number) => value + (visibleAll ? 0 : value === 1 ? 1 : 2);
                        if (borderStyle && borderData && borderData.style !== 'groove' && borderData.style !== 'ridge') {
                            const width = parseInt(borderData.width);
                            if (borderData.style === 'double' && width > 2) {
                                insertDoubleBorder.apply(null, [
                                    layerListData[0].item,
                                    borderData,
                                    borderVisible[0],
                                    borderVisible[1],
                                    borderVisible[2],
                                    borderVisible[3],
                                    corners
                                ]);
                            }
                            else {
                                const hideWidth = `-${$util.formatPX(getHideWidth(width))}`;
                                const leftTop = !borderVisible[0] && !borderVisible[3];
                                const topOnly = !borderVisible[0] && borderVisible[1] && borderVisible[2] && borderVisible[3];
                                const leftOnly = borderVisible[0] && borderVisible[1] && borderVisible[2] && !borderVisible[3];
                                layerListData[0].item.push({
                                    top: borderVisible[0] ? '' : hideWidth,
                                    right: borderVisible[1] ? (borderVisible[3] || leftTop || leftOnly ? '' : borderData.width) : hideWidth,
                                    bottom: borderVisible[2] ? (borderVisible[0] || leftTop || topOnly ? '' : borderData.width) : hideWidth,
                                    left: borderVisible[3] ? '' : hideWidth,
                                    shape: {
                                        'android:shape': 'rectangle',
                                        corners,
                                        stroke: getShapeStroke(borderData)
                                    }
                                });
                            }
                        }
                        else {
                            const index = layerListData[0].item.length;
                            for (let i = 0; i < borders.length; i++) {
                                const item = borders[i];
                                if (item) {
                                    const width = parseInt(item.width);
                                    if (item.style === 'double' && width > 2) {
                                        insertDoubleBorder.apply(null, [
                                            layerListData[0].item,
                                            item,
                                            i === 0,
                                            i === 1,
                                            i === 2,
                                            i === 3,
                                            corners
                                        ]);
                                    }
                                    else {
                                        const hasInset = width > 1 && (item.style === 'groove' || item.style === 'ridge');
                                        const outsetWidth = hasInset ? Math.ceil(width / 2) : width;
                                        const baseWidth = getHideWidth(outsetWidth);
                                        const visible = !visibleAll && item.width === '1px';
                                        let hideWidth = `-${$util.formatPX(baseWidth)}`;
                                        layerListData[0].item.push({
                                            top:  i === 0 ? '' : `-${$util.formatPX(baseWidth + (visibleAll ? 1 : 0))}`,
                                            right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                            bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                            left: i === 3 ? '' : hideWidth,
                                            shape: {
                                                'android:shape': 'rectangle',
                                                corners,
                                                stroke: getShapeStroke(item, i, hasInset)
                                            }
                                        });
                                        if (hasInset) {
                                            hideWidth = `-${$util.formatPX(getHideWidth(width))}`;
                                            layerListData[0].item.splice(index, 0, {
                                                top:  i === 0 ? '' : `-${$util.formatPX(width + (visibleAll ? 1 : 0))}`,
                                                right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                left: i === 3 ? '' : hideWidth,
                                                shape: {
                                                    'android:shape': 'rectangle',
                                                    stroke: getShapeStroke(item, i, true, true)
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const filename = `${node.tagName.toLowerCase()}_${node.controlId}`;
                    if (shapeData) {
                        resourceName = Resource.insertStoredAsset(
                            'drawables',
                            filename,
                            $xml.applyTemplate('shape', SHAPE_TMPL, shapeData)
                        );
                    }
                    else if (layerListData) {
                        resourceName = Resource.insertStoredAsset(
                            'drawables',
                            filename,
                            $xml.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData)
                        );
                    }
                    if (this.options.autoSizeBackgroundImage && backgroundImage.length && !node.documentRoot && !node.is(CONTAINER_NODE.IMAGE) && node.renderParent && !node.renderParent.tableElement && node.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
                        let parentWidth = 0;
                        let parentHeight = 0;
                        for (const image of imageDimensions) {
                            if (image) {
                                parentWidth = Math.max(parentWidth, image.width);
                                parentHeight = Math.max(parentHeight, image.height);
                            }
                        }
                        if (parentWidth === 0) {
                            let current = node;
                            while (current && !current.documentBody) {
                                if (current.hasWidth) {
                                    parentWidth = current.actualWidth;
                                }
                                if (current.hasHeight) {
                                    parentHeight = current.actualHeight;
                                }
                                if (!current.pageFlow || parentWidth > 0 && parentHeight > 0) {
                                    break;
                                }
                                current = current.documentParent as T;
                            }
                        }
                        const width = node.cssInitial('width');
                        const height = node.cssInitial('height');
                        if (!$util.isLength(width) && width !== '100%') {
                            let backgroundWidth = node.bounds.width;
                            if (!node.is(CONTAINER_NODE.LINE)) {
                                backgroundWidth -= $util.isPercent(width) ? node.contentBoxWidth : node.borderLeftWidth + node.borderRightWidth;
                            }
                            if (backgroundWidth > 0 && (parentWidth === 0 || backgroundWidth < parentWidth)) {
                                node.css('width', $util.formatPX(backgroundWidth), true);
                            }
                        }
                        if (!$util.isLength(height) && height !== '100%' && (node.length === 0 || node.some(item => !item.multiline))) {
                            let backgroundHeight = node.bounds.height;
                            if (!node.is(CONTAINER_NODE.LINE)) {
                                backgroundHeight -= $util.isPercent(height) ? node.contentBoxHeight : node.borderTopWidth + node.borderBottomWidth;
                            }
                            if (backgroundHeight > 0 && (parentHeight === 0 || backgroundHeight < parentHeight)) {
                                node.css('height', $util.formatPX(backgroundHeight), true);
                                if (node.marginTop < 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
                                }
                                if (node.marginBottom < 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, null);
                                }
                            }
                        }
                    }
                    if (resourceName !== '') {
                        resourceName = `@drawable/${resourceName}`;
                        if (node.documentBody) {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:background', resourceName);
                        }
                        else {
                            node.android('background', resourceName, false);
                        }
                    }
                }
                else if (stored.backgroundColor) {
                    let colorName = Resource.addColor(stored.backgroundColor);
                    if (colorName !== '') {
                        colorName = `@color/${colorName}`;
                        if (node.documentBody) {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:windowBackground', colorName);
                        }
                        else {
                            const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                            if (fontStyle) {
                                fontStyle.backgroundColor = stored.backgroundColor;
                            }
                            else {
                                node.android('background', colorName, false);
                            }
                        }
                    }
                }
            }
        }
    }
}