import { ImageAsset, TemplateDataA } from '../../../../src/base/@types/application';
import { ResourceStoredMapAndroid, UserSettingsAndroid } from '../../@types/application';
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
const STORED = <ResourceStoredMapAndroid> Resource.STORED;

function getBorderStyle(border: BorderAttribute, direction = -1, halfSize = false): string {
    const borderWidth = parseInt(border.width);
    const solid = `android:color="@color/${border.color}"`;
    const dashed = `${solid} android:dashWidth="${borderWidth}px" android:dashGap="${borderWidth}px"`;
    const result = {
        solid,
        double: solid,
        inset: solid,
        outset: solid,
        dashed,
        dotted: dashed,
        groove: '',
        ridge: ''
    };
    const style = border.style;
    const groove = style === 'groove';
    if (borderWidth > 1 && (groove || style === 'ridge')) {
        const color = $color.parseColor(border.color);
        if (color) {
            const reduced = $color.reduceColor(color.valueAsRGBA, groove || color.value === '#000000' ? 0.5 : -0.5);
            if (reduced) {
                const colorName = Resource.addColor(reduced);
                if (colorName !== '') {
                    const attribute = `android:color="@color/${colorName}"`;
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
                                result[style] = attribute;
                                break;
                            case 1:
                            case 2:
                                result[style] = result.solid;
                                break;
                        }
                    }
                    else {
                        switch (direction) {
                            case 0:
                            case 3:
                                result[style] = result.solid;
                                break;
                            case 1:
                            case 2:
                                result[style] = attribute;
                                break;
                        }
                    }
                }
            }
        }
    }
    return result[style] || result.solid;
}

function getShapeAttribute(boxStyle: BoxStyle, attr: string, direction = -1, hasInset = false, isInset = false): StringMap[] | false {
    switch (attr) {
        case 'stroke':
            if (boxStyle.border && Resource.isBorderVisible(boxStyle.border)) {
                if (!hasInset || isInset) {
                    return [{
                        width: boxStyle.border.width,
                        borderStyle: getBorderStyle(boxStyle.border, isInset ? direction : -1)
                    }];
                }
                else if (hasInset) {
                    return [{
                        width: $util.formatPX(Math.ceil(parseInt(boxStyle.border.width) / 2)),
                        borderStyle: getBorderStyle(boxStyle.border, direction, true)
                    }];
                }
            }
            break;
        case 'radius':
            if (boxStyle.borderRadius) {
                if (boxStyle.borderRadius.length > 1) {
                    const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
                    const result = {};
                    let valid = false;
                    for (let i = 0; i < boxStyle.borderRadius.length; i++) {
                        if (boxStyle.borderRadius[i] !== '0px') {
                            result[`${boxModel[i]}Radius`] = boxStyle.borderRadius[i];
                            valid = true;
                        }
                    }
                    if (valid) {
                        return [result];
                    }
                }
                else if (boxStyle.borderRadius.length === 1) {
                    return [{ radius: boxStyle.borderRadius[0] }];
                }
            }
            break;

    }
    return false;
}

function insertDoubleBorder(layerList: LayerListTemplate, border: BorderAttribute, top: boolean, right: boolean, bottom: boolean, left: boolean, borderRadius: StringMap[] | false) {
    if (layerList.C) {
        const width = parseInt(border.width);
        const baseWidth = Math.floor(width / 3);
        const remainder = width % 3;
        const offset =  remainder === 2 ? 1 : 0;
        const leftWidth = baseWidth + offset;
        const rightWidth = baseWidth + offset;
        let indentWidth = `${$util.formatPX(width - baseWidth)}`;
        let hideWidth = `-${indentWidth}`;
        layerList.C.push({
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
        layerList.C.push({
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

function setBodyBackgroundColor(name: string, parent: string, value: string) {
    Resource.addTheme({
        name,
        parent,
        items: { 'android:windowBackground': value }
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
        result.startColor = Resource.addColor(colorStops[0].color, true);
        result.endColor = Resource.addColor(colorStops[colorStops.length - 1].color, true);
        if (colorStops.length > 2) {
            result.centerColor = Resource.addColor(colorStops[Math.floor(colorStops.length / 2)].color, true);
        }
    }
    return result;
}

export function convertColorStops(list: ColorStop[], precision?: number) {
    const result: GradientColorStop[] = [];
    for (const stop of list) {
        const color = `@color/${Resource.addColor(stop.color, true)}`;
        result.push({
            color,
            offset: $math.truncate(stop.offset, precision)
        });
    }
    return result;
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
            if (stored && !node.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_STYLE)) {
                const backgroundRepeat = stored.backgroundRepeat.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundSize = stored.backgroundSize.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionX = stored.backgroundPositionX.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionY = stored.backgroundPositionY.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundImage: (string | GradientTemplate)[] = [];
                const backgroundPosition: RectPosition[] = [];
                const imageDimensions: Undefined<Dimension>[] = [];
                let imageLength = 0;
                if (!node.hasBit('excludeResource', $enum.NODE_RESOURCE.IMAGE_SOURCE)) {
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
                                let position: string;
                                if (image.tagName === 'IMAGE') {
                                    position = '0px 0px';
                                }
                                else {
                                    position = `${image.bounds.left - node.bounds.left}px ${image.bounds.top - node.bounds.top}px`;
                                }
                                backgroundPosition[j] = $css.getBackgroundPosition(position, node.actualDimension, node.fontSize);
                                j++;
                            }
                        }
                    }
                    imageLength = backgroundImage.length;
                }
                const companion = node.companion;
                if (companion && !companion.visible && companion.htmlElement && !$css.isInheritedStyle(companion.element, 'backgroundColor')) {
                    const boxStyle: BoxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                    const backgroundColor = Resource.addColor(boxStyle.backgroundColor);
                    if (backgroundColor !== '') {
                        stored.backgroundColor = backgroundColor;
                    }
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
                        item.color = Resource.addColor(item.color);
                        borderStyle.add(getBorderStyle(item));
                        borderWidth.add(item.width);
                        borderData = item;
                    }
                }
                const hasBorder = borderData !== undefined || stored.borderRadius !== undefined;
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
                                }
                                const separator = gravity !== '' ? '|' : '';
                                switch (position.vertical) {
                                    case '0%':
                                    case 'top':
                                        resetVertical();
                                        gravity += separator + 'top';
                                        break;
                                    case '50%':
                                    case 'center':
                                        resetVertical();
                                        gravity += separator + 'center_vertical';
                                        break;
                                    case '100%':
                                    case 'bottom':
                                        resetVertical();
                                        gravity += separator + 'bottom';
                                        break;
                                }
                            }
                            if (backgroundRepeat[i] === 'no-repeat') {
                                tileMode = 'disabled';
                            }
                            else {
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
                                }
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
                        }
                        else {
                            if (value.colorStops) {
                                const dimension = <Dimension> imageDimensions[i];
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
                                const xml = $xml.createTemplate(TEMPLATES.VECTOR, vectorData, true);
                                let vectorName = Resource.getStoredName('drawables', xml);
                                if (vectorName === '') {
                                    vectorName = `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i}`;
                                    STORED.drawables.set(vectorName, xml);
                                }
                                imageData.src = vectorName;
                            }
                            else {
                                imageData.gradient = [value];
                            }
                        }
                        if (imageData.src || imageData.bitmap || imageData.gradient) {
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
                            layerList.B.push(imageData);
                        }
                    }
                    let backgroundColor: boolean | {}[] = false;
                    if (stored.backgroundColor) {
                        const colorName = Resource.addColor(stored.backgroundColor);
                        if (colorName !== '') {
                            const color = `@color/${colorName}`;
                            if (node.documentBody) {
                                setBodyBackgroundColor(settings.manifestThemeName, settings.manifestParentThemeName, color);
                            }
                            else {
                                backgroundColor = [{ color }];
                            }
                        }
                    }
                    const borderRadius = getShapeAttribute(stored, 'radius');
                    let template: StringMap;
                    let shape: TemplateDataA | undefined;
                    const border = stored.border;
                    if (border && !(border.style === 'double' && parseInt(border.width) > 2 || (border.style === 'groove' || border.style === 'ridge') && parseInt(border.width) > 1)) {
                        const stroke = getShapeAttribute(stored, 'stroke') || [];
                        if (backgroundImage.length === 0) {
                            if (borderRadius && borderRadius[0]['radius'] === undefined) {
                                borderRadius[0]['radius'] = '1px';
                            }
                            template = TEMPLATES.SHAPE;
                            shape = {
                                A: stroke,
                                B: backgroundColor,
                                C: borderRadius
                            };
                        }
                        else {
                            template = TEMPLATES.LAYER_LIST;
                            layerList.A = backgroundColor;
                            if (borderData || borderRadius) {
                                layerList.C = [{ stroke, corners: borderRadius }];
                            }
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
                                    layerList,
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
                                            layerList,
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
                        const xml = $xml.createTemplate(template, shape || layerList, layerList.B.some(item => !!item.src));
                        resourceName = Resource.getStoredName('drawables', xml);
                        if (resourceName === '') {
                            resourceName = `${node.tagName.toLowerCase()}_${node.controlId}`;
                            STORED.drawables.set(resourceName, xml);
                        }
                    }
                    if (backgroundImage.length) {
                        node.data('RESOURCE', 'backgroundImage', true);
                        if (this.options.autoSizeBackgroundImage &&
                            !node.documentRoot &&
                            !node.imageElement &&
                            !node.svgElement &&
                            node.renderParent && !node.renderParent.tableElement &&
                            !node.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.AUTOFIT))
                        {
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
                    node.android('background', `@drawable/${resourceName}`, false);
                }
                else if (stored.backgroundColor) {
                    let colorName = Resource.addColor(stored.backgroundColor);
                    if (colorName !== '') {
                        colorName = `@color/${colorName}`;
                        if (node.documentBody) {
                            setBodyBackgroundColor(settings.manifestThemeName, settings.manifestParentThemeName, colorName);
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