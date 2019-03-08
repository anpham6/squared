import { ImageAsset, TemplateDataA } from '../../../../src/base/@types/application';
import { ResourceStoredMapAndroid } from '../../@types/application';
import { ResourceBackgroundOptions } from '../../@types/extension';
import { GradientTemplate } from '../../resource';

import Resource from '../../resource';
import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';
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
const $dom = squared.lib.dom;
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
            const reduced = $color.reduceColor(color.valueAsRGBA, groove || color.valueAsRGB === '#000000' ? 0.5 : -0.5);
            if (reduced) {
                const colorValue = Resource.addColor(reduced);
                if (colorValue !== '') {
                    const colorName = `android:color="@color/${colorValue}"`;
                    if (direction === 0 || direction === 2) {
                        halfSize = !halfSize;
                    }
                    if (color.valueAsRGB === '#000000' && (groove && (direction === 1 || direction === 3) || !groove && (direction === 0 || direction === 2))) {
                        halfSize = !halfSize;
                    }
                    if (halfSize) {
                        switch (direction) {
                            case 0:
                                result[style] = colorName;
                                break;
                            case 1:
                                result[style] = result.solid;
                                break;
                            case 2:
                                result[style] = result.solid;
                                break;
                            case 3:
                                result[style] = colorName;
                                break;
                        }
                    }
                    else {
                        switch (direction) {
                            case 0:
                                result[style] = result.solid;
                                break;
                            case 1:
                                result[style] = colorName;
                                break;
                            case 2:
                                result[style] = colorName;
                                break;
                            case 3:
                                result[style] = result.solid;
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
            return false;
        case 'backgroundColor':
            return $util.hasValue(boxStyle.backgroundColor) ? [{ color: boxStyle.backgroundColor }] : false;
        case 'radius':
            if (boxStyle.borderRadius) {
                if (boxStyle.borderRadius.length === 1) {
                    if (boxStyle.borderRadius[0] !== '0px') {
                        return [{ radius: boxStyle.borderRadius[0] }];
                    }
                }
                else if (boxStyle.borderRadius.length > 1) {
                    const result = {};
                    for (let i = 0; i < boxStyle.borderRadius.length; i++) {
                        result[`${['topLeft', 'topRight', 'bottomRight', 'bottomLeft'][i]}Radius`] = boxStyle.borderRadius[i];
                    }
                    return [result];
                }
            }
            return false;

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
            stroke: [{ width: $util.formatPX(leftWidth), borderStyle: getBorderStyle(border) }],
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
            stroke: [{ width: $util.formatPX(rightWidth), borderStyle: getBorderStyle(border) }],
            corners: borderRadius
        });
    }
}

function checkBackgroundPosition(value: string, adjacent: string, defaultPosition: string) {
    const initial = value === 'initial' || value === 'unset';
    if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
        if (/^[a-z]+$/.test(value)) {
            return `${initial ? defaultPosition : value} 0px`;
        }
        else {
            return `${defaultPosition} ${value}`;
        }
    }
    else if (initial) {
        return '0px';
    }
    return value;
}

function getPercentOffset(position: RectPosition, direction: string, bounds: RectDimension, dimension?: Dimension) {
    if (dimension) {
        switch (direction) {
            case 'left':
            case 'right':
                if ($util.isPercent(position.originalX)) {
                    return parseInt(position.originalX) / 100 * (bounds.width - dimension.width);
                }
                break;
            case 'top':
            case 'bottom':
                if ($util.isPercent(position.originalY)) {
                    return parseInt(position.originalY) / 100 * (bounds.height - dimension.height);
                }
                break;
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
        for (const node of this.application.processing.cache.duplicate().sort(a => !a.visible ? -1 : 0)) {
            const stored: BoxStyle = node.data(Resource.KEY_NAME, 'boxStyle');
            if (stored && !node.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_STYLE)) {
                const backgroundRepeat = stored.backgroundRepeat.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundSize = stored.backgroundSize.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionX = stored.backgroundPositionX.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundPositionY = stored.backgroundPositionY.split($util.REGEXP_COMPILED.SEPARATOR);
                const backgroundImage: (string | GradientTemplate)[] = [];
                const backgroundPosition: string[] = [];
                const imageDimensions: Undefined<ImageAsset>[] = [];
                let imageLength = 0;
                if (stored.backgroundImage && !node.hasBit('excludeResource', $enum.NODE_RESOURCE.IMAGE_SOURCE)) {
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
                                    imageDimensions[j] = Resource.ASSETS.images.get($dom.resolveURL(value));
                                    remove = false;
                                }
                            }
                        }
                        else if (value.colorStops.length > 1) {
                            if (value.dimension === undefined) {
                                value.dimension = node.bounds;
                            }
                            const gradient = Resource.createBackgroundGradient(value);
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
                            backgroundPosition[j] = `${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`;
                            j++;
                        }
                    }
                }
                const companion = node.companion;
                if (companion && !companion.visible && companion.htmlElement && !$dom.cssFromParent(companion.element, 'backgroundColor')) {
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
                if (borderData !== undefined || imageLength) {
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
                        const position = $dom.getBackgroundPosition(backgroundPosition[i], node.bounds, node.fontSize);
                        let gravity = position.horizontal === 'center' && position.vertical === 'center' ? 'center' : `${position.horizontal === 'center' ? 'center_horizontal' : position.horizontal}|${position.vertical === 'center' ? 'center_vertical' : position.vertical}`;
                        let dimension: ImageAsset | Dimension | undefined;
                        if (typeof value === 'string') {
                            dimension = imageDimensions[i];
                            const imageRepeat = !dimension || dimension.width < node.bounds.width || dimension.height < node.bounds.height;
                            let width = '';
                            let height = '';
                            let tileMode = '';
                            let tileModeX = '';
                            let tileModeY = '';
                            switch (backgroundRepeat[i]) {
                                case 'repeat-x':
                                    if (imageRepeat) {
                                        tileModeX = 'repeat';
                                    }
                                    break;
                                case 'repeat-y':
                                    if (imageRepeat) {
                                        tileModeY = 'repeat';
                                    }
                                    break;
                                case 'no-repeat':
                                    tileMode = 'disabled';
                                    break;
                                case 'repeat':
                                    if (imageRepeat) {
                                        tileMode = 'repeat';
                                    }
                                    break;
                            }
                            if (gravity !== '' && dimension && dimension.width > 0 && dimension.height > 0 && node.renderChildren.length === 0) {
                                if (tileModeY === 'repeat') {
                                    let tileWidth = 0;
                                    if (node.hasWidth) {
                                        tileWidth = node.width + node.paddingLeft + node.paddingRight;
                                    }
                                    else {
                                        tileWidth = node.bounds.width - (node.borderLeftWidth + node.borderRightWidth);
                                    }
                                    if (dimension.width < tileWidth) {
                                        const layoutWidth = $util.convertInt(node.android('layout_width'));
                                        if (gravity.indexOf('left') !== -1) {
                                            position.right = tileWidth - dimension.width;
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.bounds.width));
                                            }
                                        }
                                        else if (gravity.indexOf('right') !== -1) {
                                            position.left = tileWidth - dimension.width;
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.bounds.width));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_horizontal') !== -1) {
                                            position.left = Math.floor((tileWidth - dimension.width) / 2);
                                            width = $util.formatPX(dimension.width);
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util.formatPX(node.bounds.width));
                                            }
                                        }
                                    }
                                }
                                if (tileModeX === 'repeat') {
                                    let tileHeight = 0;
                                    if (node.hasHeight) {
                                        tileHeight = node.height + node.paddingTop + node.paddingBottom;
                                    }
                                    else {
                                        tileHeight = node.bounds.height - (node.borderTopWidth + node.borderBottomWidth);
                                    }
                                    if (dimension.height < tileHeight) {
                                        const layoutHeight = $util.convertInt(node.android('layout_height'));
                                        if (gravity.indexOf('top') !== -1) {
                                            position.bottom = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.bounds.height));
                                            }
                                        }
                                        else if (gravity.indexOf('bottom') !== -1) {
                                            position.top = tileHeight - dimension.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.bounds.height));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_vertical') !== -1) {
                                            position.top = Math.floor((tileHeight - dimension.height) / 2);
                                            height = $util.formatPX(dimension.height);
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util.formatPX(node.bounds.height));
                                            }
                                        }
                                    }
                                }
                            }
                            if (backgroundImage.length === 1 && node.of(CONTAINER_NODE.IMAGE, $enum.NODE_ALIGNMENT.SINGLE)) {
                                if (position.left > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, position.left);
                                }
                                if (position.top > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, position.top);
                                }
                                let scaleType = '';
                                switch (gravity) {
                                    case 'left|top':
                                    case 'left|center_vertical':
                                    case 'left|bottom':
                                        scaleType = 'fitStart';
                                        break;
                                    case 'right|top':
                                    case 'right|center_vertical':
                                    case 'right|bottom':
                                        scaleType = 'fitEnd';
                                        break;
                                    case 'center':
                                    case 'center_horizontal|top':
                                    case 'center_horizontal|bottom':
                                        scaleType = 'center';
                                        break;
                                }
                                node.android('scaleType', scaleType);
                                node.android('src', `@drawable/${value}`);
                                if (borderData === undefined) {
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
                                                if (dimensions[j] !== 'auto' && dimensions[j] !== '100%') {
                                                    if (j === 0) {
                                                        width = node.convertPX(backgroundSize[i], true, false);
                                                    }
                                                    else {
                                                        height = node.convertPX(backgroundSize[i], false, false);
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                }
                                if (width !== '' && height !== '') {
                                    imageData.width = width;
                                    imageData.height = height;
                                }
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
                                dimension = imageDimensions[i] || Resource.getBackgroundSize(node, backgroundSize[i]);
                                let width: number;
                                let height: number;
                                if (dimension) {
                                    width = dimension.width;
                                    height = dimension.height;
                                    imageData.width = $util.formatPX(dimension.width);
                                    imageData.height = $util.formatPX(dimension.height.toString());
                                }
                                else {
                                    width = Math.round(node.bounds.width);
                                    height = Math.round(node.bounds.height);
                                }
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
                                imageData.top = $util.formatPX(getPercentOffset(position, 'top', node.bounds, dimension));
                            }
                            if (position.right !== 0) {
                                imageData.right = $util.formatPX(getPercentOffset(position, 'right', node.bounds, dimension));
                            }
                            if (position.bottom !== 0) {
                                imageData.bottom = $util.formatPX(getPercentOffset(position, 'bottom', node.bounds, dimension));
                            }
                            if (position.left !== 0) {
                                imageData.left = $util.formatPX(getPercentOffset(position, 'left', node.bounds, dimension));
                            }
                            layerList.B.push(imageData);
                        }
                    }
                    stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    const backgroundColor = getShapeAttribute(stored, 'backgroundColor');
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
                            const sizeParent: ImageAsset = { width: 0, height: 0 };
                            for (const image of imageDimensions) {
                                if (image) {
                                    sizeParent.width = Math.max(sizeParent.width, image.width);
                                    sizeParent.height = Math.max(sizeParent.height, image.height);
                                }
                            }
                            if (sizeParent.width === 0) {
                                let current = node;
                                while (current && !current.documentBody) {
                                    if (current.hasWidth) {
                                        sizeParent.width = current.bounds.width;
                                    }
                                    if (current.hasHeight) {
                                        sizeParent.height = current.bounds.height;
                                    }
                                    if (!current.pageFlow || (sizeParent.width > 0 && sizeParent.height > 0)) {
                                        break;
                                    }
                                    current = current.documentParent as T;
                                }
                            }
                            if (!node.has('width', $enum.CSS_STANDARD.UNIT)) {
                                const width = node.bounds.width + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderLeftWidth + node.borderRightWidth);
                                if (sizeParent.width === 0 || (width > 0 && width < sizeParent.width)) {
                                    node.css('width', $util.formatPX(width), true);
                                }
                            }
                            if (!node.has('height', $enum.CSS_STANDARD.UNIT)) {
                                const height = node.bounds.height + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderTopWidth + node.borderBottomWidth);
                                if (sizeParent.height === 0 || (height > 0 && height < sizeParent.height)) {
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
                    const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                    if (fontStyle) {
                        fontStyle.backgroundColor = stored.backgroundColor;
                    }
                    else {
                        stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                        if (stored.backgroundColor !== '') {
                            node.android('background', `@color/${stored.backgroundColor}`, false);
                        }
                    }
                }
            }
        }
    }
}