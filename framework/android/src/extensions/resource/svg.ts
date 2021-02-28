import SYNCHRONIZE_MODE = squared.svg.constant.SYNCHRONIZE_MODE;

import { BUILD_VERSION, XML_NAMESPACE } from '../../lib/constant';
import { VECTOR_GROUP, VECTOR_PATH, VECTOR_TMPL } from '../../template/vector';

import ANIMATEDVECTOR_TMPL from '../../template/animated-vector';
import LAYERLIST_TMPL from '../../template/layer-list';
import SET_TMPL from '../../template/set';

import type View from '../../view';

import Resource from '../../resource';

import { convertColorStops } from './background';
import { applyTemplate, formatString } from '../../lib/util';

if (!squared.svg) {
    Object.assign(squared, { svg: { lib: { constant: {}, util: {} } } });
}

import Svg = squared.svg.Svg;
import SvgAnimate = squared.svg.SvgAnimate;
import SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import SvgBuild = squared.svg.SvgBuild;
import SvgG = squared.svg.SvgG;
import SvgPath = squared.svg.SvgPath;
import SvgShape = squared.svg.SvgShape;

type SvgAnimation = squared.svg.SvgAnimation;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;
type SvgView = squared.svg.SvgView;

type AnimateCompanion = NumberValue<SvgAnimation>;

interface AnimatedVectorTemplate {
    'xmlns:android': string;
    'android:drawable': string;
    target: AnimatedVectorTarget[];
}

interface AnimatedVectorTarget {
    name: string;
    animation?: string;
}

interface SetData extends SetOrdering, FillData {
    set: FillData[];
}

interface SetTemplate extends SetOrdering, FillData {
    'xmlns:android'?: string;
    'android:ordering'?: string;
    set: SetData[];
}

interface SetOrdering {
    ordering?: string;
}

interface FillData extends SetOrdering {
    objectAnimator: PropertyValue[];
}

interface PropertyValueHolder {
    propertyName: string;
    keyframe: Keyframe[];
}

interface Keyframe {
    interpolator: string;
    fraction: string;
    value: string;
}

interface PropertyValue {
    propertyName?: string;
    startOffset?: string;
    duration?: string;
    repeatCount?: string;
    valueType?: string;
    valueFrom?: string;
    valueTo?: string;
    interpolator?: string;
    propertyValuesHolder: PropertyValueHolder[] | boolean;
}

interface FillReplace {
    index: number;
    time: number;
    to: string;
    reset: boolean;
    animate?: SvgAnimateTransform;
}

interface PathData {
    name: string;
    pathData?: string;
    fillColor?: string;
    fillAlpha?: string;
    fillType?: string;
    strokeColor?: string;
    strokeAlpha?: string;
    strokeWidth?: string;
    strokeLineCap?: string;
    strokeLineJoin?: string;
    strokeMiterLimit?: string;
    trimPathStart?: string;
    trimPathEnd?: string;
    trimPathOffset?: string;
}

interface TransformData extends StandardMap {
    name?: string;
    translateX?: string;
    translateY?: string;
    scaleX?: string;
    scaleY?: string;
    rotation?: string;
    pivotX?: string;
    pivotY?: string;
}

interface VectorGroupData extends TransformData {
    'clip-path'?: StringMap[];
    path?: PathData[];
    include?: string;
}

interface AnimateGroup {
    element: SVGGraphicsElement;
    animate: SvgAnimation[];
    pathData?: string;
}

const KEYSPLINE_NAME = SvgAnimate ? SvgAnimate.KEYSPLINE_NAME : null;

const { FILE } = squared.lib.regex;

const { extractURL, formatPX } = squared.lib.css;
const { truncate } = squared.lib.math;
const { convertCamelCase, convertInt, convertPercent, convertWord, hasKeys, isArray, isNumber, lastItemOf, partitionArray, plainMap, replaceMap, startsWith } = squared.lib.util;

const { CACHE_VIEWNAME, MATRIX, SVG, TRANSFORM, getAttribute, getRootOffset } = squared.svg.lib.util;

const INTERPOLATOR_NAME = {
    accelerate_decelerate: '@android:anim/accelerate_decelerate_interpolator',
    accelerate:	'@android:anim/accelerate_interpolator',
    anticipate:	'@android:anim/anticipate_interpolator',
    anticipate_overshoot: '@android:anim/anticipate_overshoot_interpolator',
    bounce:	'@android:anim/bounce_interpolator',
    cycle: '@android:anim/cycle_interpolator',
    decelerate:	'@android:anim/decelerate_interpolator',
    linear: '@android:anim/linear_interpolator',
    overshoot: '@android:anim/overshoot_interpolator'
};

const PATH_ATTRIBUTES = [
    'name',
    'value',
    'fill',
    'stroke',
    'fillPattern',
    'fillRule',
    'strokeWidth',
    'fillOpacity',
    'strokeOpacity',
    'strokeLinecap',
    'strokeLinejoin',
    'strokeLineJoin',
    'strokeMiterlimit'
];

if (KEYSPLINE_NAME) {
    Object.assign(INTERPOLATOR_NAME, {
        [KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_NAME.accelerate,
        [KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_NAME.decelerate,
        [KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_NAME.accelerate_decelerate,
        [KEYSPLINE_NAME['linear']]: INTERPOLATOR_NAME.linear
    });
}

const INTERPOLATOR_XML = `<?xml version="1.0" encoding="utf-8"?>
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
	android:controlX1="{0}"
	android:controlY1="{1}"
	android:controlX2="{2}"
    android:controlY2="{3}" />
`;

const ATTRIBUTE_PATH = {
    'stroke': ['strokeColor'],
    'fill': ['fillColor'],
    'opacity': ['alpha'],
    'stroke-opacity': ['strokeAlpha'],
    'fill-opacity': ['fillAlpha'],
    'stroke-width': ['strokeWidth'],
    'stroke-dasharray': ['trimPathStart', 'trimPathEnd'],
    'stroke-dashoffset': ['trimPathOffset'],
    'd': ['pathData'],
    'clip-path': ['pathData']
};

function getPathInterpolator(resourceId: number, keySplines: Null<string[]>, index: number) {
    const name = keySplines && keySplines[index];
    return name ? INTERPOLATOR_NAME[name] as string || createPathInterpolator(resourceId, name) : '';
}

function createPathInterpolator(resourceId: number, value: string) {
    const interpolator: string = INTERPOLATOR_NAME[value];
    if (interpolator) {
        return interpolator;
    }
    const animators = Resource.STORED[resourceId]!.animators;
    const name = 'path_interpolator_' + convertWord(value);
    if (!animators.has(name)) {
        animators.set(name, formatString(INTERPOLATOR_XML, ...value.split(/\s+/)));
    }
    return `@anim/${name}`;
}

function createTransformData(transform: SvgTransform[]) {
    const result: TransformData = {};
    for (let i = 0, length = transform.length; i < length; ++i) {
        const { matrix, origin, angle, type } = transform[i];
        switch (type) {
            case SVGTransform.SVG_TRANSFORM_SCALE:
                result.scaleX = matrix.a.toString();
                result.scaleY = matrix.d.toString();
                if (origin) {
                    result.pivotX = origin.x.toString();
                    result.pivotY = origin.y.toString();
                }
                break;
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                result.rotation = angle.toString();
                if (origin) {
                    result.pivotX = origin.x.toString();
                    result.pivotY = origin.y.toString();
                }
                else {
                    result.pivotX = '0';
                    result.pivotY = '0';
                }
                break;
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                result.translateX = matrix.e.toString();
                result.translateY = matrix.f.toString();
                break;
        }
    }
    return result;
}

function getOuterOpacity(target: SvgView) {
    let value = +target.opacity,
        current = target.parent;
    while (current) {
        const opacity = +(current['opacity'] || '1');
        if (!isNaN(opacity) && opacity < 1) {
            value *= opacity;
        }
        current = current.parent;
    }
    return value;
}

function residualHandler(element: SVGGraphicsElement, transforms: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
    return (
        (SVG.circle(element) || SVG.ellipse(element)) &&
        transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) &&
        (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))
            ? groupTransforms(element, transforms)
            : [[], transforms]
    );
}

function groupTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], ignoreClient?: boolean): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length) {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        const rotateOrigin = transforms[0].fromStyle ? [] : TRANSFORM.rotateOrigin(element).reverse();
        const items = transforms.slice(0).reverse();
        let current: SvgTransform[] = [];
        const restart = () => {
            host.push(current.slice(0));
            current = [];
        };
        for (let i = 1; i < items.length; ++i) {
            const itemA = items[i];
            const itemB = items[i - 1];
            if (itemA.type === itemB.type) {
                let matrix: Undef<SvgMatrix>;
                switch (itemA.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        matrix = MATRIX.clone(itemA.matrix);
                        matrix.e += itemB.matrix.e;
                        matrix.f += itemB.matrix.f;
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                        matrix = MATRIX.clone(itemA.matrix);
                        matrix.a *= itemB.matrix.a;
                        matrix.d *= itemB.matrix.d;
                        break;
                    }
                }
                if (matrix) {
                    itemA.matrix = matrix;
                    items.splice(--i, 1);
                }
            }
        }
        for (let i = 0, length = items.length; i < length; ++i) {
            const item = items[i];
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_MATRIX:
                case SVGTransform.SVG_TRANSFORM_SKEWX:
                case SVGTransform.SVG_TRANSFORM_SKEWY:
                    client.push(item);
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    if (!ignoreClient && host.length === 0 && current.length === 0) {
                        client.push(item);
                    }
                    else {
                        current.push(item);
                        restart();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    while (rotateOrigin.length) {
                        const origin = rotateOrigin.shift() as SvgPoint;
                        if (origin.angle === item.angle) {
                            if (origin.x !== 0 || origin.y !== 0) {
                                item.origin = origin;
                            }
                            break;
                        }
                    }
                    if (!item.origin && current.length === 1 && current[0].type === SVGTransform.SVG_TRANSFORM_SCALE) {
                        current.push(item);
                        continue;
                    }
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    if (current.length) {
                        restart();
                    }
                    current.push(item);
                    break;
            }
        }
        if (current.length) {
            host.push(current);
        }
        return [host.reverse(), client];
    }
    return [[], transforms];
}

function getPropertyValue(values: string[] | NumString[][], index: number, propertyIndex: number, keyframes?: boolean, baseValue?: string) {
    const property = values[index];
    let value: Undef<string>;
    if (property) {
        value = Array.isArray(property) ? property[propertyIndex].toString() : property;
    }
    else if (!keyframes && index === 0) {
        value = baseValue;
    }
    return value || '';
}

function getValueType(attr: string) {
    switch (attr) {
        case 'fill':
        case 'stroke':
            return '';
        case 'opacity':
        case 'stroke-opacity':
        case 'stroke-dasharray':
        case 'stroke-dashoffset':
        case 'fill-opacity':
        case 'transform':
            return 'floatType';
        case 'stroke-width':
            return 'intType';
        case 'd':
        case 'x':
        case 'x1':
        case 'x2':
        case 'cx':
        case 'y':
        case 'y1':
        case 'y2':
        case 'cy':
        case 'r':
        case 'rx':
        case 'ry':
        case 'width':
        case 'height':
        case 'points':
            return 'pathType';
        default:
            if (getTransformInitialValue(attr)) {
                return 'floatType';
            }
    }
}

function createAnimateFromTo(attributeName: string, delay: number, to: string, from?: string) {
    const result = new SvgAnimate();
    result.attributeName = attributeName;
    result.delay = delay;
    result.duration = 1;
    result.from = from || to;
    result.to = to;
    result.fillForwards = true;
    result.convertToValues();
    return result;
}

function getAttributePropertyName(value: string, checkTransform = true) {
    let result: Undef<string[]> = ATTRIBUTE_PATH[value];
    if (!result && checkTransform && getTransformInitialValue(value)) {
        result = [value];
    }
    return result;
}

function getTransformPropertyName(type: number): Undef<string[]> {
    switch (type) {
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return ['translateX', 'translateY'];
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return ['scaleX', 'scaleY', 'pivotX', 'pivotY'];
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return ['rotation', 'pivotX', 'pivotY'];
    }
}

function getTransformValues(item: SvgAnimate): Null<number[][]> {
    switch (item.type) {
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return SvgAnimateTransform.toRotateList(item.values);
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return SvgAnimateTransform.toScaleList(item.values);
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return SvgAnimateTransform.toTranslateList(item.values);
        default:
            return null;
    }
}

function getTransformInitialValue(name: string): Undef<string> {
    switch (name) {
        case 'rotation':
        case 'pivotX':
        case 'pivotY':
        case 'translateX':
        case 'translateY':
            return '0';
        case 'scaleX':
        case 'scaleY':
            return '1';
    }
}

function getColorValue<T>(resourceId: number, value: string, asArray?: T) {
    let colorName = Resource.addColor(resourceId, value);
    if (colorName) {
        colorName = `@color/${colorName}`;
        return (asArray ? [colorName] : colorName) as T extends boolean ? string[] : string;
    }
}

function getTileMode(value: number) {
    switch (value) {
        case SVGGradientElement.SVG_SPREADMETHOD_PAD:
            return 'clamp';
        case SVGGradientElement.SVG_SPREADMETHOD_REFLECT:
            return 'mirror';
        case SVGGradientElement.SVG_SPREADMETHOD_REPEAT:
            return 'repeat';
        default:
            return '';
    }
}

function createFillGradient(resourceId: number, gradient: Gradient, path: SvgPath, precision?: number) {
    const { colorStops, type } = gradient;
    const result: GradientTemplate = {
        type,
        item: convertColorStops(resourceId, colorStops, precision),
        positioning: false
    };
    switch (type) {
        case 'radial': {
            const { cxAsString, cyAsString, rAsString, spreadMethod } = gradient as SvgRadialGradient;
            const element = path.element;
            const getRadiusPercent = (value: string) => convertPercent(value, 0.5);
            const points: Point[] = [];
            let cx!: number,
                cy!: number,
                cxDiameter!: number,
                cyDiameter!: number;
            switch (element.tagName) {
                case 'path':
                    for (const command of SvgBuild.toPathCommands(path.value)) {
                        points.push(...command.value);
                    }
                case 'polygon':
                    if (SVG.polygon(element)) {
                        points.push(...SvgBuild.clonePoints(element.points));
                    }
                    if (points.length === 0) {
                        return;
                    }
                    ({ left: cx, top: cy, right: cxDiameter, bottom: cyDiameter } = SvgBuild.minMaxOf(points));
                    cxDiameter -= cx;
                    cyDiameter -= cy;
                    break;
                default:
                    if (SVG.rect(element)) {
                        cx = element.x.baseVal.value;
                        cy = element.y.baseVal.value;
                        cxDiameter = element.width.baseVal.value;
                        cyDiameter = element.height.baseVal.value;
                    }
                    else if (SVG.circle(element)) {
                        cxDiameter = element.r.baseVal.value;
                        cx = element.cx.baseVal.value - cxDiameter;
                        cy = element.cy.baseVal.value - cxDiameter;
                        cxDiameter *= 2;
                        cyDiameter = cxDiameter;
                    }
                    else if (SVG.ellipse(element)) {
                        cxDiameter = element.rx.baseVal.value;
                        cyDiameter = element.ry.baseVal.value;
                        cx = element.cx.baseVal.value - cxDiameter;
                        cy = element.cy.baseVal.value - cyDiameter;
                        cxDiameter *= 2;
                        cyDiameter *= 2;
                    }
                    else {
                        return;
                    }
                    break;
            }
            result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
            result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
            result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * convertPercent(rAsString, 1)).toString();
            if (spreadMethod) {
                result.tileMode = getTileMode(spreadMethod);
            }
            break;
        }
        case 'linear': {
            const { x1, y1, x2, y2, spreadMethod } = gradient as SvgLinearGradient;
            result.startX = x1.toString();
            result.startY = y1.toString();
            result.endX = x2.toString();
            result.endY = y2.toString();
            if (spreadMethod) {
                result.tileMode = getTileMode(spreadMethod);
            }
        }
    }
    return result;
}

function sortSynchronized(a: SvgAnimate, b: SvgAnimate) {
    const syncA = a.synchronized;
    const syncB = b.synchronized;
    return syncA && syncB ? syncA.key >= syncB.key ? 1 : -1 : 0;
}

function insertTargetAnimation(resourceId: number, data: AnimatedVectorTemplate[], name: string, targetSetTemplate: SetTemplate, templateName: string, imageLength: number) {
    const templateSet = targetSetTemplate.set;
    const length = templateSet.length;
    if (length) {
        let modified: Undef<boolean>;
        if (length > 1 && templateSet.every(item => !item.ordering)) {
            const setData: SetTemplate = {
                set: [],
                objectAnimator: []
            };
            for (let i = 0; i < length; ++i) {
                const item = templateSet[i];
                setData.set.push(...item.set as SetData[]);
                setData.objectAnimator.push(...item.objectAnimator);
            }
            targetSetTemplate = setData;
        }
        while (targetSetTemplate.set.length === 1) {
            const setData = targetSetTemplate.set[0] as SetTemplate;
            if ((!modified || !setData.ordering) && setData.objectAnimator.length === 0) {
                targetSetTemplate = setData;
                modified = true;
            }
            else {
                break;
            }
        }
        targetSetTemplate['xmlns:android'] = XML_NAMESPACE.android;
        if (modified) {
            targetSetTemplate['android:ordering'] = targetSetTemplate.ordering;
            delete targetSetTemplate.ordering;
        }
        const targetData: AnimatedVectorTarget = {
            name,
            animation: Resource.insertStoredAsset(
                resourceId,
                'animators',
                getTemplateFilename(templateName, imageLength, 'anim', name),
                applyTemplate('set', SET_TMPL, [targetSetTemplate])
            )
        };
        if (targetData.animation) {
            targetData.animation = `@anim/${targetData.animation}`;
            data[0].target.push(targetData);
        }
    }
}

function createPropertyValue(propertyName: string, valueType: string, valueTo: string, duration: string, precision: number, valueFrom = '', startOffset = '', repeatCount = '0'): PropertyValue {
    return {
        propertyName,
        startOffset,
        duration,
        repeatCount,
        valueType,
        valueFrom: isNumber(valueFrom) ? truncate(valueFrom, precision) : valueFrom,
        valueTo: isNumber(valueTo) ? truncate(valueTo, precision) : valueTo,
        propertyValuesHolder: false
    };
}

function resetBeforeValue(propertyName: string, valueType: string, valueTo: Undef<string>, animator: PropertyValue[], precision: number) {
    if (valueTo && animator.findIndex(before => before.propertyName === propertyName) === -1) {
        animator.push(createPropertyValue(propertyName, valueType, valueTo, '0', precision));
    }
}

function insertFillAfter(resourceId: number, propertyName: string, valueType: string, item: SvgAnimation, synchronized: Undef<boolean>, transforming: Undef<boolean>, precision: number, afterAnimator: PropertyValue[], transformOrigin?: Null<Point[]>, propertyValues?: PropertyValue[], startOffset?: number) {
    if (!synchronized && item.fillReplace) {
        let valueTo = item.replaceValue;
        if (!valueTo) {
            if (transforming) {
                valueTo = getTransformInitialValue(propertyName);
            }
            else {
                const parent = item.parent;
                if (parent) {
                    if (SvgBuild.isShape(parent)) {
                        const path = parent.path;
                        if (path) {
                            if (propertyName === 'pathData') {
                                valueTo = path.value;
                            }
                            else {
                                for (const attr in ATTRIBUTE_PATH) {
                                    if ((ATTRIBUTE_PATH[attr] as string[]).includes(propertyName)) {
                                        valueTo = path[convertCamelCase(attr)];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            valueTo ||= item.baseValue;
        }
        let previousValue: Undef<string>;
        if (propertyValues && propertyValues.length) {
            const lastValue = lastItemOf(propertyValues)!;
            if (isArray(lastValue.propertyValuesHolder)) {
                const propertyValue = lastItemOf(lastValue.propertyValuesHolder)!;
                previousValue = lastItemOf(propertyValue.keyframe)!.value;
            }
            else {
                previousValue = lastValue.valueTo;
            }
        }
        if (valueTo && valueTo !== previousValue && (valueTo = convertValueType(resourceId, item, valueTo))) {
            switch (propertyName) {
                case 'trimPathStart':
                case 'trimPathEnd':
                    valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                    break;
            }
            afterAnimator.push(createPropertyValue(propertyName, valueType, valueTo, '1', precision, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
        }
        if (transformOrigin) {
            if (lastItemOf(propertyName) === 'X') {
                afterAnimator.push(createPropertyValue('translateX', valueType, '0', '1', precision));
            }
            else if (lastItemOf(propertyName) === 'Y') {
                afterAnimator.push(createPropertyValue('translateY', valueType, '0', '1', precision));
            }
        }
    }
}

const convertValueType = (resourceId: number, item: SvgAnimation, value: string) => isColorType(item.attributeName) ? getColorValue(resourceId, value) : value.trim() || undefined;
const getTemplateFilename = (templateName: string, length: number, prefix?: string, suffix?: string) => templateName + (prefix ? '_' + prefix : '') + (length ? '_vector' : '') + (suffix ? '_' + suffix.toLowerCase() : '');
const isColorType = (attr: string) => attr === 'fill' || attr === 'stroke';
const getVectorName = (target: SvgView, section: string, index = -1) => target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
const getDrawableSrc = (name: string) => `@drawable/${name}`;
const getFillData = (ordering = '') => ({ ordering, objectAnimator: [] }) as FillData;

export default class ResourceSvg<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceSvgOptions = {
        transformExclude: {
            ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY]
        },
        floatPrecisionKeyTime: 5,
        floatPrecision: 3,
        animateInterpolator: ''
    };
    public readonly eventOnly = true;

    private _svgInstance!: Svg;
    private _vectorData = new Map<string, StandardMap>();
    private _animateData = new Map<string, AnimateGroup>();
    private _animateTarget = new Map<string, AnimateGroup>();
    private _imageData: SvgImage[] = [];
    private _synchronizeMode = 0;
    private _namespaceAapt = false;

    public beforeParseDocument() {
        if (SvgBuild) {
            CACHE_VIEWNAME.clear();
            this.controller.localSettings.use.svg = true;
        }
    }

    public afterResources(sessionId: string, resourceId: number) {
        if (SvgBuild) {
            const contentMap: StringMap = {};
            for (const data of Resource.ASSETS[resourceId]!.rawData) {
                const item = data[1];
                if (item.mimeType === 'image/svg+xml' && item.content) {
                    contentMap[data[0]] = item.content;
                }
            }
            const { cache, keyframesMap } = this.application.getProcessing(sessionId)!;
            const addSvgElement = (node: T, element: SVGSVGElement, parentElement?: HTMLElement) => {
                const drawable = this.createSvgDrawable(node, element, keyframesMap, contentMap);
                if (drawable) {
                    if (node.api >= BUILD_VERSION.LOLLIPOP) {
                        node.android('src', getDrawableSrc(drawable));
                    }
                    else {
                        node.app('srcCompat', getDrawableSrc(drawable));
                    }
                }
                if (!node.hasWidth) {
                    node.setLayoutWidth('wrap_content');
                }
                if (!node.hasHeight) {
                    node.setLayoutHeight('wrap_content');
                }
                if (node.baseline) {
                    node.android('baselineAlignBottom', 'true');
                }
                const svg = node.data<Svg>(Resource.KEY_NAME, 'svg');
                if (svg) {
                    const title = svg.getTitle();
                    const desc = svg.getDesc();
                    if (title) {
                        node.android('tooltipText', Resource.addString(resourceId, title, `svg_${node.controlId.toLowerCase()}_title`, true));
                    }
                    if (desc) {
                        node.android('contentDescription', Resource.addString(resourceId, desc, `svg_${node.controlId.toLowerCase()}_desc`, true));
                    }
                }
                if (parentElement) {
                    parentElement.removeChild(element);
                }
            };
            cache.each(node => {
                if (node.imageElement) {
                    const [parentElement, element] = this.createSvgElement(node, node.toElementString('src'));
                    if (element) {
                        addSvgElement(node, element, parentElement);
                    }
                }
                else if (node.svgElement && node.visible) {
                    addSvgElement(node, node.element as SVGSVGElement);
                }
            });
        }
    }

    public afterFinalize() {
        if (SvgBuild) {
            this.controller.localSettings.use.svg = false;
        }
    }

    public createSvgElement(node: T, src: string): [Undef<HTMLElement>, Undef<SVGSVGElement>] | [] {
        src = extractURL(src) || src;
        if (FILE.SVG.test(src) || startsWith(src, 'data:image/svg+xml')) {
            const fileAsset = this.resource.getRawData(node.localSettings.resourceId, src);
            if (fileAsset) {
                const parentElement = (node.actualParent || node.documentParent).element as HTMLElement;
                parentElement.insertAdjacentHTML('beforeend', fileAsset.content!);
                const lastElementChild = parentElement.lastElementChild;
                if (lastElementChild instanceof SVGSVGElement) {
                    const element = lastElementChild;
                    if (element.width.baseVal.value === 0) {
                        element.setAttribute('width', node.actualWidth.toString());
                    }
                    if (element.height.baseVal.value === 0) {
                        element.setAttribute('height', node.actualHeight.toString());
                    }
                    return [parentElement, element];
                }
            }
        }
        return [];
    }

    public createSvgDrawable(node: T, element: SVGSVGElement, keyframesMap?: KeyframesMap, contentMap?: StringMap) {
        const { transformExclude: exclude, floatPrecision: precision, floatPrecisionKeyTime } = this.options;
        const svg = new Svg(element);
        if (contentMap) {
            svg.contentMap = contentMap;
        }
        this._imageData = [];
        const resourceId = node.localSettings.resourceId;
        const supportedKeyframes = node.api >= BUILD_VERSION.MARSHMALLOW;
        const keyTimeMode = SYNCHRONIZE_MODE.FROMTO_ANIMATE | (supportedKeyframes ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.IGNORE_TRANSFORM);
        const animateData = this._animateData;
        const imageData = this._imageData;
        this._svgInstance = svg;
        this._vectorData.clear();
        animateData.clear();
        this._animateTarget.clear();
        this._namespaceAapt = false;
        this._synchronizeMode = keyTimeMode;
        const templateName = (node.tagName + '_' + convertWord(node.controlId, true) + '_viewbox').toLowerCase();
        svg.build({ contentMap, keyframesMap, exclude, residualHandler, precision });
        svg.synchronize({ keyTimeMode, framesPerSecond: this.controller.userSettings.framesPerSecond, precision });
        this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
        const vectorData = this.parseVectorData(resourceId, svg);
        const imageLength = imageData.length;
        let vectorName: Undef<string>;
        if (vectorData) {
            const { width, height } = node.fitToScreen({ width: svg.width, height: svg.height });
            vectorName = Resource.insertStoredAsset(
                resourceId,
                'drawables',
                getTemplateFilename(templateName, imageLength),
                applyTemplate('vector', VECTOR_TMPL, [{
                    'xmlns:android': XML_NAMESPACE.android,
                    'xmlns:aapt': this._namespaceAapt ? XML_NAMESPACE.aapt : '',
                    'android:name': animateData.size ? svg.name : '',
                    'android:width': formatPX(width),
                    'android:height': formatPX(height),
                    'android:viewportWidth': (svg.viewBox.width || width).toString(),
                    'android:viewportHeight': (svg.viewBox.height || height).toString(),
                    'android:alpha': +svg.opacity < 1 ? svg.opacity : '',
                    include: vectorData
                }])
            );
            if (animateData.size) {
                const data: AnimatedVectorTemplate[] = [{
                    'xmlns:android': XML_NAMESPACE.android,
                    'android:drawable': getDrawableSrc(vectorName),
                    target: []
                }];
                for (const [name, group] of animateData) {
                    const sequentialMap = new Map<string, SvgAnimate[]>();
                    const transformMap = new Map<string, SvgAnimateTransform[]>();
                    const togetherData: SvgAnimation[] = [];
                    const isolatedData: SvgAnimation[] = [];
                    const togetherTargets: SvgAnimation[][] = [];
                    const transformTargets: SvgAnimation[][] = [];
                    const [companions, animations] = partitionArray(group.animate, child => 'companion' in child);
                    const targetSetTemplate: SetTemplate = { set: [], objectAnimator: [] };
                    for (let i = 0, length = animations.length; i < length; ++i) {
                        const item = animations[i];
                        if (item.setterType) {
                            if (ATTRIBUTE_PATH[item.attributeName] && item.to) {
                                if (item.fillReplace && item.duration > 0) {
                                    isolatedData.push(item);
                                }
                                else {
                                    togetherData.push(item);
                                }
                            }
                        }
                        else if (SvgBuild.isAnimate(item)) {
                            const children = companions.filter((child: SvgAnimation) => (child.companion as AnimateCompanion).value === item);
                            const q = children.length;
                            if (q) {
                                children.sort((a, b) => (a.companion as AnimateCompanion).key >= (b.companion as AnimateCompanion).key ? 1 : 0);
                                const sequentially: SvgAnimation[] = [];
                                const after: SvgAnimation[] = [];
                                for (let j = 0; j < q; ++j) {
                                    const child = children[j];
                                    if ((child.companion as AnimateCompanion).key <= 0) {
                                        sequentially.push(child);
                                        if (j === 0) {
                                            child.delay += item.delay;
                                            item.delay = 0;
                                        }
                                    }
                                    else {
                                        after.push(child);
                                    }
                                }
                                sequentially.push(item, ...after);
                                sequentialMap.set('sequentially_companion_' + i, sequentially as SvgAnimate[]);
                            }
                            else {
                                const synchronized = item.synchronized;
                                if (synchronized) {
                                    const value = synchronized.value;
                                    if (SvgBuild.isAnimateTransform(item)) {
                                        const values = transformMap.get(value);
                                        if (values) {
                                            values.push(item);
                                        }
                                        else {
                                            transformMap.set(value, [item]);
                                        }
                                    }
                                    else {
                                        const values = sequentialMap.get(value);
                                        if (values) {
                                            values.push(item);
                                        }
                                        else {
                                            sequentialMap.set(value, [item]);
                                        }
                                    }
                                }
                                else {
                                    if (SvgBuild.isAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    if (item.iterationCount === -1) {
                                        isolatedData.push(item);
                                    }
                                    else if ((!item.fromToType || SvgBuild.isAnimateTransform(item) && item.transformOrigin) && !(supportedKeyframes && getValueType(item.attributeName) !== 'pathType')) {
                                        togetherTargets.push([item]);
                                    }
                                    else if (item.fillReplace) {
                                        isolatedData.push(item);
                                    }
                                    else {
                                        togetherData.push(item);
                                    }
                                }
                            }
                        }
                    }
                    if (togetherData.length) {
                        togetherTargets.push(togetherData);
                    }
                    for (const [keyName, item] of sequentialMap) {
                        if (startsWith(keyName, 'sequentially_companion')) {
                            togetherTargets.push(item);
                        }
                        else {
                            togetherTargets.push(item.sort(sortSynchronized));
                        }
                    }
                    for (const item of transformMap.values()) {
                        transformTargets.push(item.sort(sortSynchronized));
                    }
                    const combined = [togetherTargets, transformTargets];
                    for (let i = 0, length = isolatedData.length; i < length; ++i) {
                        combined.push([[isolatedData[i]]]);
                    }
                    for (let index = 0, length = combined.length; index < length; ++index) {
                        const targets = combined[index];
                        const t = targets.length;
                        if (t === 0) {
                            continue;
                        }
                        const setData: SetData = {
                            ordering: index === 0 || t === 1 ? '' : 'sequentially',
                            set: [],
                            objectAnimator: []
                        };
                        for (let y = 0; y < t; ++y) {
                            const items = targets[y];
                            let ordering = '',
                                synchronized: Undef<boolean>,
                                checkBefore: Undef<boolean>,
                                useKeyframes = true;
                            if (index <= 1 && items.some((item: SvgAnimate) => item.synchronized && item.synchronized.value)) {
                                if (!SvgBuild.isAnimateTransform(items[0])) {
                                    ordering = 'sequentially';
                                }
                                synchronized = true;
                                useKeyframes = false;
                            }
                            else if (index <= 1 && items.some((item: SvgAnimate) => item.synchronized && !item.synchronized.value)) {
                                ordering = 'sequentially';
                                synchronized = true;
                                checkBefore = true;
                            }
                            else if (index <= 1 && items.some(item => 'companion' in item)) {
                                ordering = 'sequentially';
                            }
                            else {
                                if (index > 0) {
                                    ordering = 'sequentially';
                                }
                                if (index > 1 && SvgBuild.isAnimateTransform(items[0])) {
                                    checkBefore = true;
                                }
                            }
                            const together: PropertyValue[] = [];
                            const fillBefore = getFillData();
                            const repeating = getFillData();
                            const fillCustom = getFillData();
                            const fillAfter = getFillData();
                            let beforeAnimator = fillBefore.objectAnimator,
                                afterAnimator = fillAfter.objectAnimator,
                                objectAnimator = repeating.objectAnimator,
                                customAnimator = fillCustom.objectAnimator;
                            const targeted = synchronized ? partitionArray(items, (animate: SvgAnimate) => animate.iterationCount !== -1) : [items];
                            for (let i = 0, u = targeted.length; i < u; ++i) {
                                const partition = targeted[i];
                                const v = partition.length;
                                if (i === 1 && v > 1) {
                                    fillCustom.ordering = 'sequentially';
                                }
                                const animatorMap = new Map<string, PropertyValueHolder[]>();
                                for (let j = 0; j < v; ++j) {
                                    const item = partition[j];
                                    const valueType = getValueType(item.attributeName);
                                    if (valueType === undefined) {
                                        continue;
                                    }
                                    const requireBefore = item.delay > 0;
                                    let transforming: Undef<boolean>,
                                        transformOrigin: Null<Point[]> = null;
                                    if (item.setterType) {
                                        const propertyNames = getAttributePropertyName(item.attributeName);
                                        if (propertyNames) {
                                            const values = isColorType(item.attributeName) ? getColorValue(resourceId, item.to, true) : item.to.trim().split(/\s+/);
                                            if (values && values.length === propertyNames.length && !values.some(value => !value)) {
                                                let companionBefore: Undef<PropertyValue[]>,
                                                    companionAfter: Undef<PropertyValue[]>;
                                                for (let k = 0, q = propertyNames.length; k < q; ++k) {
                                                    let valueFrom: Undef<string>;
                                                    if (valueType === 'pathType') {
                                                        valueFrom = values[k];
                                                    }
                                                    else if (requireBefore) {
                                                        if (item.baseValue) {
                                                            valueFrom = convertValueType(resourceId, item, item.baseValue.trim().split(/\s+/)[k]);
                                                        }
                                                    }
                                                    const propertyValue = createPropertyValue(propertyNames[k], valueType, values[k], '1', precision, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                    if (index > 1) {
                                                        customAnimator.push(propertyValue);
                                                        insertFillAfter(resourceId, propertyNames[k], valueType, item, synchronized, transforming, precision, afterAnimator, transformOrigin, undefined, index > 1 ? item.duration : 0);
                                                    }
                                                    else {
                                                        const companion = item.companion;
                                                        if (companion) {
                                                            if (companion.key <= 0) {
                                                                (companionBefore ||= []).push(propertyValue);
                                                            }
                                                            else if (companion.key > 0) {
                                                                (companionAfter ||= []).push(propertyValue);
                                                            }
                                                        }
                                                        else {
                                                            together.push(propertyValue);
                                                        }
                                                    }
                                                }
                                                if (companionBefore) {
                                                    beforeAnimator.push(...companionBefore);
                                                }
                                                if (companionAfter) {
                                                    afterAnimator.push(...companionAfter);
                                                }
                                            }
                                        }
                                    }
                                    else if (SvgBuild.isAnimate(item)) {
                                        let resetBefore = checkBefore,
                                            values: Null<string[] |number[][]> = null,
                                            repeatCount: string,
                                            beforeValues: Undef<string[]>,
                                            propertyNames: Undef<string[]>;
                                        if (i === 1) {
                                            repeatCount = v > 1 ? '0' : '-1';
                                        }
                                        else {
                                            repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                        }
                                        const options = createPropertyValue('', valueType, '', item.duration.toString(), precision, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                        if (!synchronized && valueType === 'pathType') {
                                            if (group.pathData) {
                                                const parent = item.parent;
                                                let transforms: Null<SvgTransform[]> = null,
                                                    parentContainer: Null<SvgShape> = null;
                                                if (parent && SvgBuild.isShape(parent)) {
                                                    parentContainer = parent;
                                                    if (parent.path) {
                                                        transforms = parent.path.transformed;
                                                    }
                                                }
                                                propertyNames = ['pathData'];
                                                values = SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, parentContainer, precision);
                                            }
                                        }
                                        else if (SvgBuild.asAnimateTransform(item)) {
                                            propertyNames = getTransformPropertyName(item.type);
                                            values = getTransformValues(item);
                                            if (propertyNames && values) {
                                                if (checkBefore && item.keyTimes[0] === 0) {
                                                    resetBefore = false;
                                                }
                                                if (resetBefore || requireBefore) {
                                                    beforeValues = plainMap(propertyNames, value => getTransformInitialValue(value) || '0');
                                                }
                                                if (item.transformOrigin) {
                                                    transformOrigin = item.transformOrigin;
                                                }
                                            }
                                            transforming = true;
                                        }
                                        else if (SvgBuild.asAnimateMotion(item)) {
                                            propertyNames = getTransformPropertyName(item.type);
                                            values = getTransformValues(item);
                                            const rotateValues = item.rotateValues;
                                            if (rotateValues && propertyNames && values) {
                                                const q = values.length;
                                                if (rotateValues.length === q) {
                                                    propertyNames.push('rotation');
                                                    for (let k = 0; k < q; ++k) {
                                                        values[k].push(rotateValues[k]);
                                                    }
                                                }
                                            }
                                            transforming = true;
                                        }
                                        else {
                                            propertyNames = getAttributePropertyName(item.attributeName);
                                            switch (valueType) {
                                                case 'intType':
                                                    values = plainMap(item.values, value => convertInt(value).toString());
                                                    if (requireBefore && item.baseValue) {
                                                        beforeValues = replaceMap(SvgBuild.parseCoordinates(item.baseValue), value => Math.trunc(value).toString());
                                                    }
                                                    break;
                                                case 'floatType':
                                                    if (item.attributeName === 'stroke-dasharray') {
                                                        values = plainMap(item.values, value => replaceMap(value.split(' '), fraction => +fraction));
                                                    }
                                                    else {
                                                        values = item.values;
                                                    }
                                                    if (requireBefore && item.baseValue) {
                                                        beforeValues = replaceMap(SvgBuild.parseCoordinates(item.baseValue), value => value.toString());
                                                    }
                                                    break;
                                                default:
                                                    values = item.values.slice(0);
                                                    if (isColorType(item.attributeName)) {
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues = getColorValue(resourceId, item.baseValue, true);
                                                        }
                                                        for (let k = 0, r = values.length; k < r; ++k) {
                                                            if (values[k]) {
                                                                values[k] = getColorValue(resourceId, values[k]) || values[k - 1] || '';
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        if (!item.keySplines) {
                                            const timingFunction = item.timingFunction;
                                            options.interpolator = timingFunction ? createPathInterpolator(resourceId, timingFunction) : this.options.animateInterpolator;
                                        }
                                        if (values && propertyNames) {
                                            const { keyTimes, synchronized: syncData } = item;
                                            const q = propertyNames.length;
                                            const keyName = syncData ? syncData.key + syncData.value : index !== 0 || q > 1 ? JSON.stringify(options) : '';
                                            for (let k = 0, r = keyTimes.length; k < q; ++k) {
                                                const propertyName = propertyNames[k];
                                                if (resetBefore && beforeValues) {
                                                    resetBeforeValue(propertyName, valueType, beforeValues[k], beforeAnimator, precision);
                                                }
                                                if (useKeyframes && r > 1) {
                                                    if (supportedKeyframes && valueType !== 'pathType') {
                                                        if (!resetBefore && requireBefore && beforeValues) {
                                                            resetBeforeValue(propertyName, valueType, beforeValues[k], beforeAnimator, precision);
                                                        }
                                                        const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                        const keyframe: Keyframe[] = [];
                                                        for (let l = 0; l < r; ++l) {
                                                            let value = getPropertyValue(values, l, k, true);
                                                            if (value && valueType === 'floatType') {
                                                                value = truncate(value, precision);
                                                            }
                                                            keyframe.push({
                                                                interpolator: l && value && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(resourceId, item.keySplines, l - 1) : '',
                                                                fraction: keyTimes[l] === 0 && !value ? '' : truncate(keyTimes[l], floatPrecisionKeyTime),
                                                                value
                                                            });
                                                        }
                                                        propertyValuesHolder.push({ propertyName, keyframe });
                                                        if (!animatorMap.has(keyName)) {
                                                            if (keyName) {
                                                                animatorMap.set(keyName, propertyValuesHolder);
                                                            }
                                                            (i === 0 ? objectAnimator : customAnimator).push({ ...options, propertyValuesHolder });
                                                        }
                                                        transformOrigin = null;
                                                    }
                                                    else {
                                                        ordering = 'sequentially';
                                                        const translateData = getFillData('sequentially');
                                                        for (let l = 0; l < r; ++l) {
                                                            const keyTime = keyTimes[l];
                                                            const propertyOptions: PropertyValue = {
                                                                ...options,
                                                                propertyName,
                                                                startOffset: l === 0 ? (item.delay + (keyTime > 0 ? Math.floor(keyTime * item.duration) : 0)).toString() : '',
                                                                propertyValuesHolder: false
                                                            };
                                                            let valueTo = getPropertyValue(values, l, k, false, valueType === 'pathType' ? group.pathData : item.baseValue);
                                                            if (valueTo) {
                                                                let duration: number;
                                                                if (l === 0) {
                                                                    if (!checkBefore && requireBefore && beforeValues) {
                                                                        propertyOptions.valueFrom = beforeValues[k];
                                                                    }
                                                                    else if (valueType === 'pathType') {
                                                                        propertyOptions.valueFrom = group.pathData || values[0].toString();
                                                                    }
                                                                    else {
                                                                        propertyOptions.valueFrom = item.baseValue || item.replaceValue || '';
                                                                    }
                                                                    duration = 0;
                                                                }
                                                                else {
                                                                    propertyOptions.valueFrom = getPropertyValue(values, l - 1, k).toString();
                                                                    duration = Math.floor((keyTime - keyTimes[l - 1]) * item.duration);
                                                                }
                                                                if (valueType === 'floatType') {
                                                                    valueTo = truncate(valueTo, precision);
                                                                }
                                                                const origin = transformOrigin && transformOrigin[l];
                                                                if (origin) {
                                                                    let translateTo = 0,
                                                                        direction: Undef<string>;
                                                                    if (lastItemOf(propertyName) === 'X') {
                                                                        translateTo = origin.x;
                                                                        direction = 'translateX';
                                                                    }
                                                                    else if (lastItemOf(propertyName) === 'Y') {
                                                                        translateTo = origin.y;
                                                                        direction = 'translateY';
                                                                    }
                                                                    if (direction) {
                                                                        const valueData = createPropertyValue(direction, 'floatType', truncate(translateTo, precision), duration.toString(), precision);
                                                                        valueData.interpolator = createPathInterpolator(resourceId, KEYSPLINE_NAME!['step-start']);
                                                                        translateData.objectAnimator.push(valueData);
                                                                    }
                                                                }
                                                                if (l > 0) {
                                                                    propertyOptions.interpolator = getPathInterpolator(resourceId, item.keySplines, l - 1);
                                                                }
                                                                propertyOptions.duration = duration.toString();
                                                                propertyOptions.valueTo = valueTo;
                                                                objectAnimator.push(propertyOptions);
                                                            }
                                                        }
                                                        if (translateData.objectAnimator.length) {
                                                            setData.set.push(translateData);
                                                        }
                                                    }
                                                }
                                                else {
                                                    const propertyOptions: PropertyValue = {
                                                        ...options,
                                                        propertyName,
                                                        interpolator: item.duration > 1 ? getPathInterpolator(resourceId, item.keySplines, 0) : '',
                                                        propertyValuesHolder: false
                                                    };
                                                    const s = values.length;
                                                    let valueTo: NumString;
                                                    if (Array.isArray(values[0])) {
                                                        valueTo = values[s - 1][k];
                                                        if (s > 1) {
                                                            const from = values[0][k];
                                                            if (from !== valueTo) {
                                                                propertyOptions.valueFrom = from.toString();
                                                            }
                                                        }
                                                        propertyOptions.valueTo = valueTo.toString();
                                                    }
                                                    else {
                                                        let valueFrom: Undef<string>;
                                                        if (s > 1) {
                                                            valueFrom = values[0].toString();
                                                            valueTo = values[s - 1].toString();
                                                        }
                                                        else {
                                                            valueFrom = item.from || (!checkBefore && requireBefore && beforeValues ? beforeValues[j] : '');
                                                            valueTo = item.to;
                                                        }
                                                        if (valueType === 'pathType') {
                                                            propertyOptions.valueFrom = valueFrom || group.pathData || valueTo;
                                                        }
                                                        else if (valueFrom && valueFrom !== valueTo) {
                                                            propertyOptions.valueFrom = convertValueType(resourceId, item, valueFrom);
                                                        }
                                                        propertyOptions.valueTo = valueTo;
                                                    }
                                                    if (valueTo !== '') {
                                                        if (valueType === 'floatType') {
                                                            propertyOptions.valueTo = truncate(valueTo, precision);
                                                        }
                                                        (i === 0 ? objectAnimator : customAnimator).push(propertyOptions);
                                                    }
                                                }
                                                if (i === 0 && !synchronized && item.iterationCount !== -1) {
                                                    insertFillAfter(resourceId, propertyName, valueType, item, synchronized, transforming, precision, afterAnimator, transformOrigin, objectAnimator);
                                                }
                                            }
                                            if (requireBefore && transformOrigin && transformOrigin.length) {
                                                resetBeforeValue('translateX', valueType, '0', beforeAnimator, precision);
                                                resetBeforeValue('translateY', valueType, '0', beforeAnimator, precision);
                                            }
                                        }
                                    }
                                }
                            }
                            const valid = objectAnimator.length > 0 || customAnimator.length > 0;
                            if (ordering === 'sequentially') {
                                if (valid && beforeAnimator.length === 1) {
                                    objectAnimator.unshift(beforeAnimator[0]);
                                    beforeAnimator = [];
                                }
                                if (customAnimator.length === 1) {
                                    objectAnimator.push(customAnimator[0]);
                                    customAnimator = [];
                                }
                                if (valid && afterAnimator.length === 1) {
                                    objectAnimator.push(afterAnimator[0]);
                                    afterAnimator = [];
                                }
                            }
                            if (beforeAnimator.length === 0 && customAnimator.length === 0 && afterAnimator.length === 0) {
                                if (ordering === 'sequentially' && objectAnimator.length === 1) {
                                    ordering = '';
                                }
                                if (setData.ordering !== 'sequentially' && ordering !== 'sequentially') {
                                    together.push(...objectAnimator);
                                    objectAnimator = [];
                                }
                            }
                            if (objectAnimator.length || customAnimator.length) {
                                if (beforeAnimator.length) {
                                    setData.ordering = 'sequentially';
                                    setData.set.push(fillBefore);
                                }
                                if (objectAnimator.length) {
                                    repeating.ordering = ordering;
                                    setData.set.push(repeating);
                                }
                                if (customAnimator.length) {
                                    setData.ordering = 'sequentially';
                                    setData.set.push(fillCustom);
                                }
                                if (afterAnimator.length) {
                                    setData.ordering = 'sequentially';
                                    setData.set.push(fillAfter);
                                }
                            }
                            if (together.length) {
                                setData.objectAnimator.push(...together);
                            }
                        }
                        if (setData.set.length || setData.objectAnimator.length) {
                            targetSetTemplate.set.push(setData);
                        }
                    }
                    insertTargetAnimation(resourceId, data, name, targetSetTemplate, templateName, imageLength);
                }
                for (const [name, target] of this._animateTarget) {
                    const animate = target.animate;
                    const objectAnimator: PropertyValue[] = [];
                    for (let i = 0, length = animate.length; i < length; ++i) {
                        const item = animate[i];
                        if (SvgBuild.asAnimateMotion(item)) {
                            const parent = item.parent;
                            if (parent && SvgBuild.isShape(parent)) {
                                const path = parent.path;
                                if (path) {
                                    const { value, baseValue } = path;
                                    if (value !== baseValue) {
                                        objectAnimator.push(createPropertyValue('pathData', 'pathType', baseValue, '0', precision, value));
                                        if (item.iterationCount !== -1 && !item.setterType) {
                                            objectAnimator.push(createPropertyValue('pathData', 'pathType', value, '0', precision, baseValue, item.getTotalDuration().toString()));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (objectAnimator.length) {
                        insertTargetAnimation(
                            resourceId,
                            data,
                            name,
                            {
                                set: [{ set: [], objectAnimator }],
                                objectAnimator: []
                            },
                            templateName,
                            imageLength
                        );
                    }
                }
                if (data[0].target) {
                    vectorName = Resource.insertStoredAsset(resourceId, 'drawables', getTemplateFilename(templateName, imageLength, 'anim'), applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data));
                }
            }
        }
        if (imageLength) {
            const resource = this.resource as android.base.Resource<T>;
            const item: StandardMap[] = [];
            const layerData: StandardMap[] = [{ 'xmlns:android': XML_NAMESPACE.android, item }];
            if (vectorName) {
                item.push({ drawable: getDrawableSrc(vectorName) });
            }
            for (let i = 0; i < imageLength; ++i) {
                const image = imageData[i];
                const { x, y } = getRootOffset(image.element, svg.element);
                const box = svg.viewBox;
                const scaleX = svg.width / box.width;
                const scaleY = svg.height / box.height;
                const left: number = (image.getBaseValue('x', 0)! * scaleX) + x;
                const top: number = (image.getBaseValue('y', 0)! * scaleY) + y;
                const data: StandardMap = {
                    width: formatPX(image.getBaseValue('width', 0)! * scaleX),
                    height: formatPX(image.getBaseValue('height', 0)! * scaleY),
                    left: left !== 0 ? formatPX(left) : '',
                    top: top !== 0 ? formatPX(top) : ''
                };
                const src = getDrawableSrc(resource.addImageSet(resourceId, { mdpi: image.href }));
                if (image.rotateAngle) {
                    data.rotate = {
                        drawable: src,
                        fromDegrees: image.rotateAngle.toString(),
                        visible: image.visible ? 'true' : 'false'
                    };
                }
                else {
                    data.drawable = src;
                }
                item.push(data);
            }
            return Resource.insertStoredAsset(resourceId, 'drawables', templateName, applyTemplate('layer-list', LAYERLIST_TMPL, layerData));
        }
        node.data(Resource.KEY_NAME, 'svg', svg);
        return vectorName;
    }

    private parseVectorData(resourceId: number, group: SvgGroup, depth = 0) {
        const floatPrecision = this.options.floatPrecision;
        const result = this.createGroup(group);
        const length = result.length;
        const renderDepth = depth + length;
        let output = '';
        group.each(item => {
            if (item.visible) {
                if (SvgBuild.isShape(item)) {
                    const itemPath = item.path;
                    if (itemPath && itemPath.value) {
                        const [path, groupArray] = this.createPath(resourceId, item, itemPath);
                        const pathArray: PathData[] = [];
                        if (+itemPath.strokeWidth && (itemPath.strokeDasharray || itemPath.strokeDashoffset)) {
                            const animateData = this._animateData.get(item.name);
                            if (!animateData || animateData.animate.every(animate => startsWith(animate.attributeName, 'stroke-dash'))) {
                                const [animations, strokeDash, pathData, clipPathData] = itemPath.extractStrokeDash(animateData?.animate, floatPrecision);
                                if (strokeDash) {
                                    if (animateData) {
                                        this._animateData.delete(item.name);
                                        if (animations) {
                                            animateData.animate = animations;
                                        }
                                    }
                                    const name = getVectorName(item, 'stroke');
                                    const strokeData: TransformData = { name };
                                    if (pathData) {
                                        path.pathData = pathData;
                                    }
                                    if (clipPathData) {
                                        strokeData['clip-path'] = [{ pathData: clipPathData }];
                                    }
                                    for (let i = 0, q = strokeDash.length; i < q; ++i) {
                                        const strokePath = i === 0 ? path : { ...path };
                                        const dash = strokeDash[i];
                                        strokePath.name = name + '_' + i;
                                        if (animateData) {
                                            this._animateData.set(strokePath.name, {
                                                element: animateData.element,
                                                animate: animateData.animate.filter(animate => animate.id === null || animate.id === i)
                                            });
                                        }
                                        strokePath.trimPathStart = truncate(dash.start, floatPrecision);
                                        strokePath.trimPathEnd = truncate(dash.end, floatPrecision);
                                        pathArray.push(strokePath);
                                    }
                                    groupArray.unshift(strokeData);
                                }
                            }
                        }
                        if (pathArray.length === 0) {
                            pathArray.push(path);
                        }
                        if (groupArray.length) {
                            const enclosing = groupArray[groupArray.length - 1];
                            enclosing.path = pathArray;
                            output += applyTemplate('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                        }
                        else {
                            output += applyTemplate('path', VECTOR_PATH, pathArray, renderDepth + 1);
                        }
                    }
                }
                else if (SvgBuild.isContainer(item)) {
                    if (!item.isEmpty()) {
                        output += this.parseVectorData(resourceId, item, renderDepth);
                    }
                }
                else if (SvgBuild.asImage(item)) {
                    if (!SvgBuild.asPattern(group)) {
                        item.renderStatic(this.options.transformExclude.image);
                        this._imageData.push(item);
                    }
                }
            }
        });
        if (length) {
            result[length - 1].include = output;
            return applyTemplate('group', VECTOR_GROUP, result, depth + 1);
        }
        return output;
    }

    private createGroup(target: SvgGroup) {
        const clipMain: StringMap[] = [];
        const clipBox: StringMap[] = [];
        const groupMain: VectorGroupData = { 'clip-path': clipMain };
        const groupBox: VectorGroupData = { 'clip-path': clipBox };
        const result: VectorGroupData[] = [];
        const transformData: TransformData = {};
        if ((SvgBuild.asSvg(target) && !target.documentRoot || SvgBuild.isUse(target)) && (target.x !== 0 || target.y !== 0)) {
            transformData.name = getVectorName(target, 'main');
            transformData.translateX = target.x.toString();
            transformData.translateY = target.y.toString();
        }
        this.createClipPath(target, clipMain, target.clipRegion);
        if (clipMain.length || hasKeys(transformData)) {
            Object.assign(groupMain, transformData);
            result.push(groupMain);
        }
        if (target !== this._svgInstance) {
            const baseData: TransformData = {};
            const groupName = getVectorName(target, 'animate');
            const transforms = groupTransforms(target.element, target.transforms, true)[0];
            if ((SvgBuild.asG(target) || SvgBuild.asUseSymbol(target)) && this.createClipPath(target, clipBox, target.clipPath)) {
                baseData.name = groupName;
            }
            if (this.queueAnimations(target, groupName, item => SvgBuild.asAnimateTransform(item))) {
                baseData.name = groupName;
            }
            if (baseData.name) {
                Object.assign(groupBox, baseData);
                result.push(groupBox);
            }
            const length = transforms.length;
            if (length) {
                const transformed: SvgTransform[] = [];
                for (let i = 0; i < length; ++i) {
                    const data = transforms[i];
                    result.push(createTransformData(data));
                    transformed.push(...data);
                }
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(resourceId: number, target: SvgShape, path: SvgPath): [PathData, VectorGroupData[]] {
        const result: PathData = { name: target.name };
        const renderData: VectorGroupData[] = [];
        const clipElement: StringMap[] = [];
        const baseData: VectorGroupData = {};
        const groupName = getVectorName(target, 'group');
        const opacity = getOuterOpacity(target);
        const useTarget = SvgBuild.asUseShape(target);
        const clipPath = path.clipPath;
        if (clipPath) {
            const { transformExclude: exclude, floatPrecision: precision } = this.options;
            const shape = new SvgShape(path.element);
            shape.build({ exclude, residualHandler, precision });
            shape.synchronize({ keyTimeMode: this._synchronizeMode, precision });
            this.createClipPath(shape, clipElement, clipPath);
        }
        if (SvgBuild.asUseShape(target) && target.clipPath !== clipPath) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if (this.queueAnimations(target, groupName, item => SvgBuild.isAnimateTransform(item), '', target.name)) {
            baseData.name = groupName;
        }
        else if (clipElement.length) {
            baseData.name = '';
        }
        if (SvgBuild.asUseShape(target) && (target.x !== 0 || target.y !== 0)) {
            baseData.translateX = target.x.toString();
            baseData.translateY = target.y.toString();
        }
        if (clipElement.length) {
            baseData['clip-path'] = clipElement;
        }
        if (hasKeys(baseData)) {
            renderData.push(baseData);
        }
        path.transformResidual?.forEach(item => renderData.push(createTransformData(item)));
        for (let i = 0, length = PATH_ATTRIBUTES.length; i < length; ++i) {
            let attr = PATH_ATTRIBUTES[i],
                value: string = path[attr] || useTarget && target[attr];
            if (value) {
                switch (attr) {
                    case 'name':
                        break;
                    case 'value':
                        attr = 'pathData';
                        break;
                    case 'fill':
                        attr = 'fillColor';
                        if (value !== 'none' && !result['aapt:attr']) {
                            const colorName = Resource.addColor(resourceId, value);
                            if (colorName) {
                                value = `@color/${colorName}`;
                            }
                        }
                        else {
                            continue;
                        }
                        break;
                    case 'stroke':
                        attr = 'strokeColor';
                        if (value !== 'none') {
                            const colorName = Resource.addColor(resourceId, value);
                            if (colorName) {
                                value = `@color/${colorName}`;
                            }
                        }
                        else {
                            continue;
                        }
                        break;
                    case 'fillPattern': {
                        const pattern = this._svgInstance.findFillPattern(value);
                        if (pattern) {
                            switch (path.element.tagName) {
                                case 'path':
                                    if (!/[zZ]\s*$/.test(path.value)) {
                                        break;
                                    }
                                case 'rect':
                                case 'polygon':
                                case 'polyline':
                                case 'circle':
                                case 'ellipse': {
                                    const gradient = createFillGradient(resourceId, pattern, path, this.options.floatPrecision);
                                    if (gradient) {
                                        result['aapt:attr'] = {
                                            name: 'android:fillColor',
                                            gradient
                                        };
                                        result.fillColor = '';
                                        this._namespaceAapt = true;
                                    }
                                }
                            }
                        }
                        continue;
                    }
                    case 'fillRule':
                        if (value === 'evenodd') {
                            attr = 'fillType';
                            value = 'evenOdd';
                        }
                        else {
                            continue;
                        }
                        break;
                    case 'strokeWidth':
                        if (value === '0') {
                            continue;
                        }
                        break;
                    case 'fillOpacity':
                    case 'strokeOpacity':
                        value = ((isNumber(value) ? +value : 1) * opacity).toString();
                        if (value === '1') {
                            continue;
                        }
                        attr = attr === 'fillOpacity' ? 'fillAlpha' : 'strokeAlpha';
                        break;
                    case 'strokeLinecap':
                        if (value === 'butt') {
                            continue;
                        }
                        attr = 'strokeLineCap';
                        break;
                    case 'strokeLinejoin':
                        if (value === 'miter') {
                            continue;
                        }
                        attr = 'strokeLineJoin';
                        break;
                    case 'strokeMiterlimit':
                        if (value === '4') {
                            continue;
                        }
                        attr = 'strokeMiterLimit';
                        break;
                    default:
                        continue;
                }
                result[attr] = value;
            }
        }
        if (!result.strokeWidth) {
            result.strokeColor = '';
        }
        else if (!result.strokeColor) {
            result.strokeWidth = '';
        }
        const fillReplaceMap = new Map<number, FillReplace>();
        const transformResult: SvgAnimate[] = [];
        const replaceResult: SvgAnimate[] = [];
        const pathData = path.value;
        const animations = target.animations;
        let previousPathData = pathData,
            index = 0;
        for (let i = 0, length = animations.length; i < length; ++i) {
            const item = animations[i];
            if (SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                let time = Math.max(0, item.delay - 1);
                fillReplaceMap.set(time, {
                    index,
                    time,
                    to: item.transformFrom,
                    reset: false,
                    animate: item
                });
                if (item.iterationCount !== -1 && item.fillReplace) {
                    time = item.delay + item.iterationCount * item.duration;
                    if (!fillReplaceMap.has(time)) {
                        fillReplaceMap.set(time, {
                            index,
                            time,
                            to: pathData,
                            reset: true
                        });
                    }
                }
                ++index;
            }
        }
        const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => a.time - b.time);
        for (let i = 0, length = replaceData.length; i < length; ++i) {
            const item = replaceData[i];
            if (!item.reset || item.to !== previousPathData) {
                let valid = true;
                if (item.reset) {
                    invalid: {
                        for (let j = 0; j < i; ++j) {
                            const previous = replaceData[j];
                            if (!previous.reset) {
                                for (let k = i + 1; k < length; ++k) {
                                    switch (replaceData[k].index) {
                                        case previous.index:
                                            valid = false;
                                        case item.index:
                                            break invalid;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    const itemTotal: number[] = [];
                    const previousType = new Set<number>();
                    for (let j = 0; j < i; ++j) {
                        const previous = replaceData[j];
                        itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                    }
                    for (let j = 0, q = itemTotal.length; j < q; ++j) {
                        if (itemTotal[j] === 1) {
                            const animate = replaceData.find(data => data.index === j && 'animate' in data)?.animate;
                            if (animate) {
                                previousType.add(animate.type);
                            }
                        }
                    }
                    for (const type of previousType) {
                        const propertyName = getTransformPropertyName(type);
                        if (propertyName) {
                            const initialValue = TRANSFORM.typeAsValue(type).split(' ');
                            for (let j = 0, q = initialValue.length; j < q; ++j) {
                                transformResult.push(createAnimateFromTo(propertyName[j], item.time, initialValue[j], ''));
                            }
                        }
                    }
                }
                if (valid) {
                    replaceResult.push(createAnimateFromTo('d', item.time, item.to));
                    previousPathData = item.to;
                }
            }
        }
        if (!this.queueAnimations(target, result.name, item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0 && baseData.name !== groupName) {
            result.name = '';
        }
        const animateData = this._animateData;
        if (transformResult.length) {
            const data = animateData.get(groupName);
            if (data) {
                data.animate.push(...transformResult);
            }
        }
        if (replaceResult.length) {
            const data = animateData.get(result.name);
            if (data) {
                data.animate.push(...replaceResult);
            }
            else {
                animateData.set(result.name, {
                    element: target.element,
                    animate: replaceResult,
                    pathData
                });
            }
        }
        return [result, renderData];
    }

    private createClipPath(target: SvgView, clipArray: StringMap[], clipPath: string) {
        let valid = false;
        if (clipPath) {
            const definitions = this._svgInstance.definitions;
            const keyTimeMode = this._synchronizeMode;
            const { transformExclude: exclude, floatPrecision: precision } = this.options;
            clipPath.split(';').forEach((value, index, array) => {
                if (value[0] === '#') {
                    const element = (definitions.clipPath.get(value) as unknown) as SVGGElement;
                    if (element) {
                        const g = new SvgG(element);
                        g.build({ exclude, residualHandler, precision });
                        g.synchronize({ keyTimeMode, precision });
                        g.each((child: SvgShape) => {
                            const path = child.path;
                            if (path) {
                                const pathData = path.value;
                                if (pathData) {
                                    let name = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                                    if (!this.queueAnimations(child, name, item => SvgBuild.asAnimate(item) || SvgBuild.asSet(item), pathData)) {
                                        name = '';
                                    }
                                    clipArray.push({ name, pathData, fillType: getAttribute(child.element, 'fill-rule', true) === 'evenodd' ? 'evenOdd' : '' });
                                    valid = true;
                                }
                            }
                        });
                    }
                }
                else {
                    let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                    if (!this.queueAnimations(target, name, item => item.attributeName === 'clip-path' && (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)), value)) {
                        name = '';
                    }
                    clipArray.push({ name, pathData: value, fillType: getAttribute(target.element, 'fill-rule', true) === 'evenodd' ? 'evenOdd' : '' });
                    valid = true;
                }
            });
        }
        return valid;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, boolean>, pathData = '', targetName?: string) {
        if (svg.animations.length) {
            const animate = svg.animations.filter((item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
            if (animate.length) {
                const element = svg.element;
                this._animateData.set(name, {
                    element,
                    animate,
                    pathData
                });
                if (targetName) {
                    this._animateTarget.set(targetName, {
                        element,
                        animate,
                        pathData
                    });
                }
                return true;
            }
        }
        return false;
    }
}