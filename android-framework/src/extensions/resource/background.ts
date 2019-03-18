import { ImageAsset, TemplateDataA } from '../../../../src/base/@types/application';
import { UserSettingsAndroid } from '../../@types/application';
import { ResourceBackgroundOptions } from '../../@types/extension';
import { GradientColorStop, GradientTemplate } from '../../@types/resource';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID, CONTAINER_NODE } from '../../lib/enumeration';
import { getXmlNs } from '../../lib/util';

import LAYERLIST_TMPL from '../../template/resource/embedded/layer-list';
import SHAPE_TMPL from '../../template/resource/embedded/shape';
import VECTOR_TMPL from '../../template/resource/embedded/vector';

interface LayerListTemplate {
    A: StringMap[] | false;
    B: BackgroundImageData[];
    C: BorderData[] | false;
}

interface PositionAttribute {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

interface BorderData extends PositionAttribute {
    stroke: StringMap[] | false;
    corners: StringMap[] | false;
}

interface BackgroundImageData extends PositionAttribute {
    src?: string;
    width?: string;
    height?: string;
    bitmap: BitmapData[] | false;
    rotate: StringMap[] | false;
    gradient: GradientTemplate[] | false;
}

interface BitmapData {
    src: string;
    gravity: string;
    tileMode: string;
    tileModeX: string;
    tileModeY: string;
}

const $SvgBuild = squared.svg && squared.svg.SvgBuild;
const $enum = squared.base.lib.enumeration;
const $color = squared.lib.color;
const $css = squared.lib.css;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const TEMPLATES = {
    LAYER_LIST: $xml.parseTemplate(LAYERLIST_TMPL),
    SHAPE: $xml.parseTemplate(SHAPE_TMPL),
    VECTOR: $xml.parseTemplate(VECTOR_TMPL)
};

function getColorAttribute(value: string) {
    return `android:color="@color/${value}"`;
}

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): string {
    const solid = getColorAttribute(Resource.addColor(border.color));
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
                                return solid;
                        }
                    }
                    else {
                        switch (direction) {
                            case 0:
                            case 3:
                                return solid;
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
            return `${solid} android:dashWidth="${borderWidth * multiplier}px" android:dashGap="${borderWidth}px"`;
        }
    }
    return solid;
}

function getShapeAttribute(boxStyle: BoxStyle, attr: string, direction = -1, hasInset = false, isInset = false): StringMap[] | false {
    switch (attr) {
        case 'stroke':
            if (Resource.isBorderVisible(boxStyle.border)) {
                if (!hasInset || isInset) {
                    return [{
                        width: boxStyle.border.width,
                        borderStyle: getBorderStyle(boxStyle.border, isInset ? direction : -1)
                    }];
                }
                else if (hasInset) {
                    return [{
                        width: $util.formatPX(Math.ceil(parseFloat(boxStyle.border.width) / 2)),
                        borderStyle: getBorderStyle(boxStyle.border, direction, true)
                    }];
                }
            }
            break;
        case 'radius':
            if (boxStyle.borderRadius) {
                if (boxStyle.borderRadius.length === 1) {
                    return [{ radius: boxStyle.borderRadius[0] }];
                }
                else {
                    let borderRadius: string[];
                    if (boxStyle.borderRadius.length === 8) {
                        borderRadius = [];
                        for (let i = 0; i < boxStyle.borderRadius.length; i += 2) {
                            borderRadius.push($util.formatPX((parseFloat(boxStyle.borderRadius[i]) + parseFloat(boxStyle.borderRadius[i + 1])) / 2));
                        }
                    }
                    else {
                        borderRadius = boxStyle.borderRadius;
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
                        return [result];
                    }
                }
            }
            break;

    }
    return false;
}

function insertDoubleBorder(items: BorderData[], border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, borderRadius: StringMap[] | false) {
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
        stroke: [{
            width: $util.formatPX(leftWidth),
            borderStyle: getBorderStyle(border)
        }],
        corners: borderRadius
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
        stroke: [{
            width: $util.formatPX(rightWidth),
            borderStyle: getBorderStyle(border)
        }],
        corners: borderRadius
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
        colorStops: false
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
        result.colorStops = convertColorStops(colorStops);
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

function getPercentOffset(direction: string, position: RectPosition, bounds: RectDimension, dimension: Dimension) {
    if (direction === 'left') {
        if ($util.isPercent(position.horizontal)) {
            return parseFloat(position.horizontal) / 100 * (bounds.width - dimension.width);
        }
    }
    else {
        if ($util.isPercent(position.horizontal)) {
            return parseFloat(position.horizontal) / 100 * (bounds.height - dimension.height);
        }
    }
    return position[direction];
}

export default class ResourceBackground<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceBackgroundOptions = {
        autoSizeBackgroundImage: true
    };

    public readonly eventOnly = true;

    public afterResources() {
        const settings = <UserSettingsAndroid> this.application.userSettings;
        for (const node of this.application.processing.cache.duplicate().sort(a => !a.visible ? -1 : 0)) {
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
                const borders: BorderAttribute[] = [
                    stored.borderTop,
                    stored.borderRight,
                    stored.borderBottom,
                    stored.borderLeft
                ];
                const borderVisible: boolean[] = [];
                const borderStyle = new Set<string>();
                const borderWidth = new Set<string>();
                let borderData: BorderAttribute | undefined;
                for (let i = 0; i < borders.length; i++) {
                    const item = borders[i];
                    borderVisible[i] = Resource.isBorderVisible(item);
                    if (borderVisible[i]) {
                        borderStyle.add(getBorderStyle(item));
                        borderWidth.add(item.width);
                        borderData = item;
                    }
                }
                const hasBorder = borderData !== undefined || stored.borderRadius !== undefined;
                const companion = node.companion;
                if (companion && !companion.visible && companion.htmlElement && !$css.isInheritedStyle(companion.element, 'backgroundColor')) {
                    const companionStyle: BoxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                    if (companionStyle.backgroundColor) {
                        stored.backgroundColor = companionStyle.backgroundColor;
                    }
                }
                if (imageLength || hasBorder) {
                    const layerList: LayerListTemplate = {
                        A: false,
                        B: [],
                        C: false
                    };
                    let resourceName = '';
                    for (let i = imageLength - 1; i >= 0; i--) {
                        const value = backgroundImage[i];
                        const imageData: BackgroundImageData = {
                            bitmap: false,
                            rotate: false,
                            gradient: false
                        };
                        const imageSingle = node.of(CONTAINER_NODE.IMAGE, $enum.NODE_ALIGNMENT.SINGLE) && imageLength === 1;
                        const position = backgroundPosition[i];
                        if (typeof value === 'string') {
                            const dimension = <Undefined<ImageAsset>> imageDimensions[i];
                            function resetHorizontal() {
                                if (!imageSingle) {
                                    position.left = 0;
                                    position.right = 0;
                                }
                            }
                            function resetVertical() {
                                if (!imageSingle) {
                                    position.top = 0;
                                    position.bottom = 0;
                                }
                            }
                            let width = '';
                            let height = '';
                            let gravity = '';
                            let tileMode = '';
                            let tileModeX = '';
                            let tileModeY = '';
                            if ((position.horizontal === 'center' || position.horizontal === '50%') && (position.vertical === 'center' || position.vertical === '50%')) {
                                resetHorizontal();
                                resetVertical();
                                gravity = 'center';
                            }
                            else {
                                switch (position.horizontal) {
                                    case '0%':
                                    case 'left':
                                        resetHorizontal();
                                        gravity = node.localizeString('left');
                                        break;
                                    case '50%':
                                    case 'center':
                                        resetHorizontal();
                                        gravity = 'center_horizontal';
                                        break;
                                    case '100%':
                                    case 'right':
                                        resetHorizontal();
                                        gravity = node.localizeString('right');
                                        break;
                                    default:
                                        if (position.right !== 0) {
                                            gravity += node.localizeString('right');
                                        }
                                        else {
                                            gravity += node.localizeString('left');
                                        }
                                        break;
                                }
                                gravity += '|';
                                switch (position.vertical) {
                                    case '0%':
                                    case 'top':
                                        resetVertical();
                                        gravity += 'top';
                                        break;
                                    case '50%':
                                    case 'center':
                                        resetVertical();
                                        gravity += 'center_vertical';
                                        break;
                                    case '100%':
                                    case 'bottom':
                                        resetVertical();
                                        gravity += 'bottom';
                                        break;
                                    default:
                                        if (position.bottom !== 0) {
                                            gravity += 'bottom';
                                        }
                                        else {
                                            gravity += 'top';
                                        }
                                        break;
                                }
                            }
                            switch (backgroundRepeat[i]) {
                                case 'repeat':
                                    if (!dimension || dimension.width < node.actualWidth || dimension.height < node.actualHeight) {
                                        tileMode = 'repeat';
                                    }
                                    break;
                                case 'repeat-x':
                                    if (!dimension || dimension.width < node.actualWidth) {
                                        tileModeX = 'repeat';
                                    }
                                    break;
                                case 'repeat-y':
                                    if (!dimension || dimension.height < node.actualHeight) {
                                        tileModeY = 'repeat';
                                    }
                                    break;
                                default:
                                    tileMode = 'disabled';
                                    if (dimension && (node.inputElement || node.imageElement)) {
                                        width = $util.formatPX(dimension.width);
                                        height = $util.formatPX(dimension.height);
                                    }
                                    break;
                            }
                            if (gravity !== '' && node.renderChildren.length === 0 && dimension && dimension.width > 0 && dimension.height > 0) {
                                if (tileModeY === 'repeat') {
                                    const tileWidth = node.hasWidth ? node.width + node.paddingLeft + node.paddingRight : node.bounds.width - (node.borderLeftWidth + node.borderRightWidth);
                                    if (dimension.width < tileWidth) {
                                        const layoutWidth = $util.convertInt(node.android('layout_width'));
                                        if (gravity.indexOf('left') !== -1 || gravity.indexOf('start') !== -1) {
                                            position.right = tileWidth - dimension.width;
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                        else if (gravity.indexOf('right') !== -1 || gravity.indexOf('end') !== -1) {
                                            position.left = tileWidth - dimension.width;
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_horizontal') !== -1) {
                                            position.left = Math.floor((tileWidth - dimension.width) / 2);
                                            width = $util.formatPX(dimension.width);
                                            if (!node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.actualWidth));
                                            }
                                        }
                                    }
                                }
                                if (tileModeX === 'repeat') {
                                    const tileHeight = node.hasHeight ? node.height + node.paddingTop + node.paddingBottom : node.bounds.height - (node.borderTopWidth + node.borderBottomWidth);
                                    if (dimension.height < tileHeight) {
                                        const layoutHeight = $util.convertInt(node.android('layout_height'));
                                        if (gravity.indexOf('top') !== -1) {
                                            position.bottom = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                        else if (gravity.indexOf('bottom') !== -1) {
                                            position.top = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_vertical') !== -1) {
                                            position.top = Math.floor((tileHeight - dimension.height) / 2);
                                            height = $util.formatPX(dimension.height);
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.actualHeight));
                                            }
                                        }
                                    }
                                }
                            }
                            if (imageSingle) {
                                let scaleType: string | undefined;
                                if (/^(left|start)/.test(gravity)) {
                                    scaleType = 'fitStart';
                                }
                                else if (/^(right|end)/.test(gravity)) {
                                    scaleType = 'fitEnd';
                                }
                                else if (gravity === 'center' || gravity.startsWith('center_horizontal')) {
                                    scaleType = 'center';
                                }
                                if (scaleType) {
                                    node.android('scaleType', scaleType);
                                }
                                if (position.left > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, position.left);
                                }
                                if (position.top > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, position.top);
                                }
                                node.android('src', `@drawable/${value}`);
                                if (!hasBorder) {
                                    return;
                                }
                            }
                            else {
                                if (!(backgroundSize[i] === 'auto' || backgroundSize[i] === 'auto auto' || backgroundSize[i] === 'initial')) {
                                    switch (backgroundSize[i]) {
                                        case 'cover':
                                        case 'contain':
                                        case '100% 100%':
                                            width = '';
                                            height = '';
                                            tileMode = '';
                                            tileModeX = '';
                                            tileModeY = '';
                                            gravity = '';
                                            break;
                                        default:
                                            const dimensions = backgroundSize[i].split(' ');
                                            if (dimensions[0] === '100%') {
                                                tileModeX = '';
                                            }
                                            else if (dimensions[1] === '100%') {
                                                tileModeY = '';
                                            }
                                            for (let j = 0; j < dimensions.length; j++) {
                                                const size = dimensions[j];
                                                if (size !== 'auto' && size !== '100%') {
                                                    if (j === 0) {
                                                        width = node.convertPX(size, true, false);
                                                    }
                                                    else {
                                                        height = node.convertPX(size, false, false);
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                }
                                imageData.width = width;
                                imageData.height = height;
                                if (gravity !== '' || tileMode !== '' || tileModeX !== '' || tileModeY !== '') {
                                    imageData.bitmap = [{
                                        src: value,
                                        gravity,
                                        tileMode,
                                        tileModeX,
                                        tileModeY,
                                    }];
                                }
                                else {
                                    imageData.src = value;
                                }
                            }
                            if (position.top !== 0) {
                                imageData.top = $util.formatPX(position.top);
                            }
                            if (position.right !== 0) {
                                imageData.right = $util.formatPX(position.right);
                            }
                            if (position.bottom !== 0) {
                                imageData.bottom = $util.formatPX(position.bottom);
                            }
                            if (position.left !== 0) {
                                imageData.left = $util.formatPX(position.left);
                            }
                        }
                        else {
                            const dimension = <Dimension> imageDimensions[i];
                            if (value.colorStops) {
                                const width = Math.round(dimension.width);
                                const height = Math.round(dimension.height);
                                imageData.width = $util.formatPX(width);
                                imageData.height = $util.formatPX(height);
                                const vectorData: TemplateDataA = {
                                    namespace: getXmlNs('aapt'),
                                    width: imageData.width || $util.formatPX(width),
                                    height: imageData.height || $util.formatPX(height),
                                    viewportWidth: width.toString(),
                                    viewportHeight: height.toString(),
                                    alpha: '',
                                    A: [{
                                        region: [[]],
                                        clipRegion: false,
                                        path: [[]],
                                        clipPath: false,
                                        BB: [{
                                            render: [[]],
                                            CCC: [{
                                                value: $SvgBuild.drawRect(width, height),
                                                clipElement: false,
                                                fillPattern: [{ gradients: [value] }]
                                            }],
                                            DDD: false
                                        }]
                                    }],
                                    B: false
                                };
                                imageData.src = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i}`, $xml.createTemplate(TEMPLATES.VECTOR, vectorData, true));
                            }
                            else {
                                imageData.gradient = [value];
                            }
                            if (position.top !== 0) {
                                imageData.top = $util.formatPX(getPercentOffset('top', position, node.bounds, dimension));
                            }
                            if (position.left !== 0) {
                                imageData.left = $util.formatPX(getPercentOffset('left', position, node.bounds, dimension));
                            }
                        }
                        if (imageData.src || imageData.bitmap || imageData.gradient) {
                            layerList.B.push(imageData);
                        }
                    }
                    let backgroundColor: boolean | {}[] = false;
                    if (stored.backgroundColor) {
                        const colorName = Resource.addColor(stored.backgroundColor);
                        if (colorName !== '') {
                            backgroundColor = [{ color: `@color/${colorName}` }];
                        }
                    }
                    const borderRadius = getShapeAttribute(stored, 'radius');
                    let template: StringMap;
                    let shape: TemplateDataA | undefined;
                    const border = stored.border;
                    if (border && !(border.style === 'double' && parseInt(border.width) > 2 || (border.style === 'groove' || border.style === 'ridge') && parseInt(border.width) > 1)) {
                        const stroke = getShapeAttribute(stored, 'stroke');
                        if (backgroundImage.length) {
                            template = TEMPLATES.LAYER_LIST;
                            layerList.A = backgroundColor;
                            if (borderData || borderRadius) {
                                layerList.C = [{ stroke, corners: borderRadius }];
                            }
                        }
                        else {
                            template = TEMPLATES.SHAPE;
                            shape = {
                                A: stroke as [],
                                B: backgroundColor,
                                C: borderRadius
                            };
                        }
                    }
                    else {
                        template = TEMPLATES.LAYER_LIST;
                        layerList.A = backgroundColor;
                        layerList.C = [];
                        const visibleAll = borderVisible[1] && borderVisible[2];
                        function getHideWidth(value: number) {
                            return value + (visibleAll ? 0 : value === 1 ? 1 : 2);
                        }
                        if (borderStyle.size === 1 && borderWidth.size === 1 && borderData && !(borderData.style === 'groove' || borderData.style === 'ridge')) {
                            const width = parseInt(borderData.width);
                            if (borderData.style === 'double' && width > 2) {
                                insertDoubleBorder.apply(null, [
                                    layerList.C,
                                    borderData,
                                    borderVisible[0],
                                    borderVisible[1],
                                    borderVisible[2],
                                    borderVisible[3],
                                    borderRadius
                                ]);
                            }
                            else  {
                                const hideWidth = `-${$util.formatPX(getHideWidth(width))}`;
                                const leftTop = !borderVisible[0] && !borderVisible[3];
                                const topOnly = !borderVisible[0] && borderVisible[1] && borderVisible[2] && borderVisible[3];
                                const leftOnly = borderVisible[0] && borderVisible[1] && borderVisible[2] && !borderVisible[3];
                                layerList.C.push({
                                    top: borderVisible[0] ? '' : hideWidth,
                                    right: borderVisible[1] ? (borderVisible[3] || leftTop || leftOnly ? '' : borderData.width) : hideWidth,
                                    bottom: borderVisible[2] ? (borderVisible[0] || leftTop || topOnly ? '' : borderData.width) : hideWidth,
                                    left: borderVisible[3] ? '' : hideWidth,
                                    stroke: getShapeAttribute(<BoxStyle> { border: borderData }, 'stroke'),
                                    corners: borderRadius
                                });
                            }
                        }
                        else {
                            for (let i = 0; i < borders.length; i++) {
                                if (borderVisible[i]) {
                                    const item = borders[i];
                                    const width = parseInt(item.width);
                                    if (item.style === 'double' && width > 2) {
                                        insertDoubleBorder.apply(null, [
                                            layerList.C,
                                            item,
                                            i === 0,
                                            i === 1,
                                            i === 2,
                                            i === 3,
                                            borderRadius
                                        ]);
                                    }
                                    else {
                                        const hasInset = width > 1 && (item.style === 'groove' || item.style === 'ridge');
                                        const outsetWidth = hasInset ? Math.ceil(width / 2) : width;
                                        const baseWidth = getHideWidth(outsetWidth);
                                        const visible = !visibleAll && item.width === '1px';
                                        let hideWidth = `-${$util.formatPX(baseWidth)}`;
                                        let hideTopWidth = `-${$util.formatPX(baseWidth + (visibleAll ? 1 : 0))}`;
                                        layerList.C.push({
                                            top:  i === 0 ? '' : hideTopWidth,
                                            right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                            bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                            left: i === 3 ? '' : hideWidth,
                                            stroke: getShapeAttribute(<BoxStyle> { border: item }, 'stroke', i, hasInset),
                                            corners: borderRadius
                                        });
                                        if (hasInset) {
                                            hideWidth = `-${$util.formatPX(getHideWidth(width))}`;
                                            hideTopWidth = `-${$util.formatPX(width + (visibleAll ? 1 : 0))}`;
                                            layerList.C.unshift({
                                                top:  i === 0 ? '' : hideTopWidth,
                                                right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                left: i === 3 ? '' : hideWidth,
                                                stroke: getShapeAttribute(<BoxStyle> { border: item }, 'stroke', i, true, true),
                                                corners: false
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (template) {
                        resourceName = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}`, $xml.createTemplate(template, shape || layerList, layerList.B.some(item => !!item.src)));
                    }
                    if (backgroundImage.length) {
                        node.data('RESOURCE', 'backgroundImage', true);
                        if (this.options.autoSizeBackgroundImage && !node.documentRoot && !node.imageElement && !node.svgElement && node.renderParent && !node.renderParent.tableElement && node.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
                            let parentWidth = 0;
                            let parentHeight = 0;
                            if (node.tagName !== 'IMAGE') {
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
                                        if (!current.pageFlow || (parentWidth > 0 && parentHeight > 0)) {
                                            break;
                                        }
                                        current = current.documentParent as T;
                                    }
                                }
                            }
                            if (!node.has('width', $enum.CSS_STANDARD.LENGTH)) {
                                const width = node.bounds.width + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderLeftWidth + node.borderRightWidth);
                                if (parentWidth === 0 || (width > 0 && width < parentWidth)) {
                                    node.css('width', $util.formatPX(width), true);
                                }
                            }
                            if (!node.has('height', $enum.CSS_STANDARD.LENGTH)) {
                                const height = node.bounds.height + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderTopWidth + node.borderBottomWidth);
                                if (parentHeight === 0 || (height > 0 && height < parentHeight)) {
                                    node.css('height', $util.formatPX(height), true);
                                    if (node.marginTop < 0) {
                                        node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
                                    }
                                    if (node.marginBottom < 0) {
                                        node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, null);
                                    }
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