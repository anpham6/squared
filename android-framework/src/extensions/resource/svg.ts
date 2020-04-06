import type { SvgLinearGradient, SvgMatrix, SvgPoint, SvgRadialGradient, SvgTransform } from '../../../../@types/svg/object';
import type { ResourceStoredMapAndroid } from '../../../../@types/android/application';
import type { ResourceSvgOptions } from '../../../../@types/android/extension';
import type { GradientTemplate } from '../../../../@types/android/resource';

import Resource from '../../resource';

import { convertColorStops } from './background';

import { XMLNS_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID } from '../../lib/enumeration';
import { VECTOR_GROUP, VECTOR_PATH } from '../../template/vector';

import ANIMATEDVECTOR_TMPL from '../../template/animated-vector';
import LAYERLIST_TMPL from '../../template/layer-list';
import SET_TMPL from '../../template/set';
import VECTOR_TMPL from '../../template/vector';

if (squared.svg === undefined) {
    Object.assign(squared, { svg: { lib: { constant: {}, util: {} } } });
}

import Svg = squared.svg.Svg;
import SvgAnimate = squared.svg.SvgAnimate;
import SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import SvgBuild = squared.svg.SvgBuild;
import SvgG = squared.svg.SvgG;
import SvgPath = squared.svg.SvgPath;
import SvgShape = squared.svg.SvgShape;

type View = android.base.View;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;
type SvgView = squared.svg.SvgView;

const $lib = squared.lib;
const $svg_lib = squared.svg.lib;

const { extractURL, formatPX, isPercent } = $lib.css;
const { truncate } = $lib.math;
const { CHAR, FILE } = $lib.regex;
const { convertCamelCase, convertInt, convertWord, formatString, isArray, isNumber, isString, objectMap, partitionArray, replaceMap } = $lib.util;
const { applyTemplate } = $lib.xml;

const { KEYSPLINE_NAME, SYNCHRONIZE_MODE } = $svg_lib.constant;
const { MATRIX, SVG, TRANSFORM } = $svg_lib.util;

const NodeUI = squared.base.NodeUI;

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
    keyframe: KeyFrame[];
}

interface KeyFrame {
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

interface TransformData {
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

const STORED = <ResourceStoredMapAndroid> Resource.STORED;
const INTERPOLATOR_ANDROID = {
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
const PATH_ATTRIBUTES = ['name', 'value', 'fill', 'stroke', 'fillPattern', 'fillRule', 'strokeWidth', 'fillOpacity', 'strokeOpacity',  'strokeLinecap', 'strokeLinejoin', 'strokeLineJoin', 'strokeMiterlimit'];

if (KEYSPLINE_NAME) {
    Object.assign(INTERPOLATOR_ANDROID, {
        [KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
        [KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
        [KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
        [KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear
    });
}

const INTERPOLATOR_XML = `<?xml version="1.0" encoding="utf-8"?>
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
	android:controlX1="{0}"
	android:controlY1="{1}"
	android:controlX2="{2}"
    android:controlY2="{3}" />
`;
const ATTRIBUTE_ANDROID = {
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

function getPathInterpolator(keySplines: Undef<string[]>, index: number): string {
    const name = keySplines?.[index];
    return name ? INTERPOLATOR_ANDROID[name] || createPathInterpolator(name) : '';
}

function getPaintAttribute(value: string) {
    for (const attr in ATTRIBUTE_ANDROID) {
        if (ATTRIBUTE_ANDROID[attr].includes(value)) {
            return convertCamelCase(attr);
        }
    }
    return '';
}

function createPathInterpolator(value: string) {
    const interpolator = INTERPOLATOR_ANDROID[value];
    if (interpolator) {
        return interpolator;
    }
    else {
        const name = `path_interpolator_${convertWord(value)}`;
        if (!STORED.animators.has(name)) {
            STORED.animators.set(name, formatString(INTERPOLATOR_XML, ...value.split(CHAR.SPACE)));
        }
        return `@anim/${name}`;
    }
}

function createTransformData(transform: SvgTransform[]) {
    const result: TransformData = {};
    transform.forEach(item => {
        const { matrix, origin, type } = item;
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
                result.rotation = item.angle.toString();
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
    });
    return result;
}

function getViewport(element: SVGGraphicsElement) {
    const result: SVGGraphicsElement[] = [];
    let parent = element.parentElement;
    while (parent) {
        result.push(<SVGGraphicsElement> (parent as unknown));
        parent = parent.parentElement;
        if (parent instanceof HTMLElement) {
            break;
        }
    }
    return result;
}

function getParentOffset(element: SVGGraphicsElement, rootElement: SVGGraphicsElement) {
    let x = 0;
    let y = 0;
    getViewport(element).forEach(parent => {
        if ((SVG.svg(parent) || SVG.use(parent)) && parent !== rootElement) {
            x += parent.x.baseVal.value;
            y += parent.y.baseVal.value;
        }
    });
    return { x, y };
}

function getOuterOpacity(target: SvgView) {
    let value = parseFloat(target.opacity);
    let current = target.parent;
    while (current) {
        const opacity = parseFloat(current['opacity'] || '1');
        if (!isNaN(opacity) && opacity < 1) {
            value *= opacity;
        }
        current = current.parent;
    }
    return value;
}

function partitionTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
    const length = transforms.length;
    if (length && (SVG.circle(element) || SVG.ellipse(element))) {
        if (transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) && (rx !== ry || length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
            return groupTransforms(element, transforms);
        }
    }
    return [[], transforms];
}

function groupTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], ignoreClient = false): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length) {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        const rotateOrigin = transforms[0].fromCSS ? [] : TRANSFORM.rotateOrigin(element).reverse();
        const items = transforms.slice(0).reverse();
        const current: SvgTransform[] = [];
        const restart = () => {
            host.push(current.slice(0));
            current.length = 0;
        };
        for (let i = 1; i < items.length; i++) {
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
        items.forEach(item => {
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
                        const origin = <SvgPoint> rotateOrigin.shift();
                        if (origin.angle === item.angle) {
                            if (origin.x !== 0 || origin.y !== 0) {
                                item.origin = origin;
                            }
                            break;
                        }
                    }
                    if (item.origin === undefined && current.length === 1 && current[0].type === SVGTransform.SVG_TRANSFORM_SCALE) {
                        current.push(item);
                        return;
                    }
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    if (current.length) {
                        restart();
                    }
                    current.push(item);
                    break;
            }
        });
        if (current.length) {
            host.push(current);
        }
        return [host.reverse(), client];
    }
    return [[], transforms];
}

function getPropertyValue(values: string[] | (string | number)[][], index: number, propertyIndex: number, keyFrames = false, baseValue?: string) {
    const property = values[index];
    let value: Undef<string>;
    if (property) {
        value = Array.isArray(property) ? property[propertyIndex].toString() : property;
    }
    else if (!keyFrames && index === 0) {
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
            return undefined;
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
    let result: Undef<string[]> = ATTRIBUTE_ANDROID[value];
    if (result === undefined && checkTransform && getTransformInitialValue(value)) {
        result = [value];
    }
    return result;
}

function getTransformPropertyName(type: number) {
    switch (type) {
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return ['translateX', 'translateY'];
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return ['scaleX', 'scaleY', 'pivotX', 'pivotY'];
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return ['rotation', 'pivotX', 'pivotY'];
    }
    return undefined;
}

function getTransformValues(item: SvgAnimate) {
    switch (item.type) {
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return SvgAnimateTransform.toRotateList(item.values);
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return SvgAnimateTransform.toScaleList(item.values);
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return SvgAnimateTransform.toTranslateList(item.values);
    }
    return undefined;
}

function getTransformInitialValue(name: string) {
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
    return undefined;
}

function getColorValue<T>(value: string, asArray = false) {
    const colorName = '@color/' + Resource.addColor(value);
    return (asArray ? [colorName] : colorName) as T extends true ? string[] : string;
}

function convertValueType<T = string | string[]>(item: SvgAnimation, value: string) {
    if (isColorType(item.attributeName)) {
        return getColorValue<T>(value);
    }
    return value.trim() || undefined;
}

function getTileMode(value: number) {
    switch (value) {
        case SVGGradientElement.SVG_SPREADMETHOD_PAD:
            return 'clamp';
        case SVGGradientElement.SVG_SPREADMETHOD_REFLECT:
            return 'mirror';
        case SVGGradientElement.SVG_SPREADMETHOD_REPEAT:
            return 'repeat';
    }
    return '';
}

function createFillGradient(gradient: Gradient, path: SvgPath, precision?: number) {
    const { colorStops, type } = gradient;
    const result: GradientTemplate = { type, item: convertColorStops(colorStops, precision), positioning: false };
    switch (type) {
        case 'radial': {
            const { cxAsString, cyAsString, rAsString, spreadMethod } = <SvgRadialGradient> gradient;
            const element = path.element;
            let points: Point[] = [];
            let cx!: number;
            let cy!: number;
            let cxDiameter!: number;
            let cyDiameter!: number;
            switch (element.tagName) {
                case 'path':
                    SvgBuild.getPathCommands(path.value).forEach(command => points = points.concat(command.value));
                case 'polygon':
                    if (SVG.polygon(element)) {
                        points = points.concat(SvgBuild.clonePoints(element.points));
                    }
                    if (!points.length) {
                        return undefined;
                    }
                    [cx, cy, cxDiameter, cyDiameter] = SvgBuild.minMaxPoints(points);
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
                        return undefined;
                    }
                    break;
            }
            result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
            result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
            result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * (isPercent(rAsString) ? parseFloat(rAsString) / 100 : 1)).toString();
            if (spreadMethod) {
                result.tileMode = getTileMode(spreadMethod);
            }
            break;
        }
        case 'linear': {
            const { x1, y1, x2, y2, spreadMethod } = <SvgLinearGradient> gradient;
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
    if (syncA && syncB) {
        return syncA.key >= syncB.key ? 1 : -1;
    }
    return 0;
}

function insertTargetAnimation(data: AnimatedVectorTemplate[], name: string, targetSetTemplate: SetTemplate, templateName: string, imageLength: number) {
    const templateSet = targetSetTemplate.set;
    const length = templateSet.length;
    if (length) {
        let modified = false;
        if (length > 1 && templateSet.every(item => item.ordering === '')) {
            const setData: SetTemplate = {
                set: [],
                objectAnimator: []
            };
            templateSet.forEach(item => {
                setData.set = setData.set.concat(<SetData[]> item.set);
                setData.objectAnimator = setData.objectAnimator.concat(item.objectAnimator);
            });
            targetSetTemplate = setData;
        }
        while (targetSetTemplate.set.length === 1) {
            const setData = <SetTemplate> targetSetTemplate.set[0];
            if ((!modified || setData.ordering === '') && setData.objectAnimator.length === 0) {
                targetSetTemplate = setData;
                modified = true;
            }
            else {
                break;
            }
        }
        targetSetTemplate['xmlns:android'] = XMLNS_ANDROID.android;
        if (modified) {
            targetSetTemplate['android:ordering'] = targetSetTemplate.ordering;
            targetSetTemplate.ordering = undefined;
        }
        const targetData: AnimatedVectorTarget = {
            name,
            animation: Resource.insertStoredAsset(
                'animators',
                getTemplateFilename(templateName, imageLength, 'anim', name),
                applyTemplate('set', SET_TMPL, [targetSetTemplate])
            )
        };
        if (targetData.animation !== '') {
            targetData.animation = `@anim/${targetData.animation}`;
            data[0].target.push(targetData);
        }
    }
}

const getTemplateFilename = (templateName: string, length: number, prefix?: string, suffix?: string) => templateName + (prefix ? '_' + prefix : '') + (length ? '_vector' : '') + (suffix ? '_' + suffix.toLowerCase() : '');
const isColorType = (attr: string) => attr === 'fill' || attr === 'stroke';
const getVectorName = (target: SvgView, section: string, index = -1) => target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
const getRadiusPercent = (value: string) => isPercent(value) ? parseFloat(value) / 100 : 0.5;
const getDrawableSrc = (name: string) => `@drawable/${name}`;
const getFillData = (ordering = ''): FillData => ({ ordering, objectAnimator: [] });

export default class ResourceSvg<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceSvgOptions = {
        transformExclude: {
            path: [],
            line: [],
            rect: [],
            ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            polyline: [],
            polygon: [],
            image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY]
        },
        floatPrecisionKeyTime: 5,
        floatPrecisionValue: 3,
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
            SvgBuild.setName();
            this.controller.localSettings.svg.enabled = true;
        }
    }

    public afterResources() {
        if (SvgBuild) {
            let parentElement: Undef<HTMLElement>;
            let element: Undef<SVGSVGElement>;
            this.cacheProcessing.each(node => {
                if (node.imageElement) {
                    [parentElement, element] = this.createSvgElement(node, node.src);
                }
                else if (node.svgElement) {
                    element = <SVGSVGElement> node.element;
                }
                if (element) {
                    const drawable = this.createSvgDrawable(node, element);
                    if (drawable !== '') {
                        if (node.api >= BUILD_ANDROID.LOLLIPOP) {
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
                    if (parentElement) {
                        parentElement.removeChild(element);
                        parentElement = undefined;
                    }
                    element = undefined;
                }
            });
        }
    }

    public afterFinalize() {
        this.controller.localSettings.svg.enabled = false;
    }

    public createSvgElement(node: T, src: string): [Undef<HTMLElement>, Undef<SVGSVGElement>] | [] {
        const value = extractURL(src);
        if (value !== '') {
            src = value;
        }
        if (FILE.SVG.test(src) || src.startsWith('data:image/svg+xml')) {
            const fileAsset = this.resource.getRawData(src);
            if (fileAsset) {
                const parentElement = <HTMLElement> (node.actualParent || node.documentParent).element;
                parentElement.insertAdjacentHTML('beforeend', fileAsset.content);
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

    public createSvgDrawable(node: T, element: SVGSVGElement) {
        const { floatPrecisionValue: precision, floatPrecisionKeyTime, transformExclude: exclude } = this.options;
        const svg = new Svg(element);
        const supportedKeyFrames = node.api >= BUILD_ANDROID.MARSHMALLOW;
        const keyTimeMode = SYNCHRONIZE_MODE.FROMTO_ANIMATE | (supportedKeyFrames ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.IGNORE_TRANSFORM);
        const animateData = this._animateData;
        const imageData = this._imageData;
        this._svgInstance = svg;
        this._vectorData.clear();
        animateData.clear();
        this._animateTarget.clear();
        imageData.length = 0;
        this._namespaceAapt = false;
        this._synchronizeMode = keyTimeMode;
        const templateName = `${node.tagName}_${convertWord(node.controlId, true)}_viewbox`.toLowerCase();
        svg.build({ exclude, residual: partitionTransforms, precision });
        svg.synchronize({ keyTimeMode, framesPerSecond: this.controller.userSettings.framesPerSecond, precision });
        this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
        const vectorData = this.parseVectorData(svg);
        const viewBox = svg.viewBox;
        const imageLength = imageData.length;
        let drawable: string;
        let vectorName: string;
        {
            const { width, height } = NodeUI.refitScreen(node, { width: svg.width, height: svg.height });
            vectorName = Resource.insertStoredAsset(
                'drawables',
                getTemplateFilename(templateName, imageLength),
                applyTemplate('vector', VECTOR_TMPL, [{
                    'xmlns:android': XMLNS_ANDROID.android,
                    'xmlns:aapt': this._namespaceAapt ? XMLNS_ANDROID.aapt : '',
                    'android:name': animateData.size ? svg.name : '',
                    'android:width': formatPX(width),
                    'android:height': formatPX(height),
                    'android:viewportWidth': (viewBox.width || width).toString(),
                    'android:viewportHeight': (viewBox.height || height).toString(),
                    'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                    include: vectorData
                }])
            );
        }
        if (animateData.size) {
            const data: AnimatedVectorTemplate[] = [{
                'xmlns:android': XMLNS_ANDROID.android,
                'android:drawable': getDrawableSrc(vectorName),
                target: []
            }];
            for (const [name, group] of animateData.entries()) {
                const sequentialMap = new Map<string, SvgAnimate[]>();
                const transformMap = new Map<string, SvgAnimateTransform[]>();
                const togetherData: SvgAnimation[] = [];
                const isolatedData: SvgAnimation[] = [];
                const togetherTargets: SvgAnimation[][] = [];
                const isolatedTargets: SvgAnimation[][][] = [];
                const transformTargets: SvgAnimation[][] = [];
                const [companions, animations] = partitionArray(group.animate, child => 'companion' in child);
                const targetSetTemplate: SetTemplate = { set: [], objectAnimator: [] };
                const length = animations.length;
                for (let i = 0; i < length; i++) {
                    const item = animations[i];
                    if (item.setterType) {
                        if (ATTRIBUTE_ANDROID[item.attributeName] && isString(item.to)) {
                            if (item.fillReplace && item.duration > 0) {
                                isolatedData.push(item);
                            }
                            else {
                                togetherData.push(item);
                            }
                        }
                    }
                    else if (SvgBuild.isAnimate(item)) {
                        const children = companions.filter((child: SvgAnimation) => (<AnimateCompanion> child.companion).value === item);
                        if (children.length) {
                            children.sort((a, b) => (<AnimateCompanion> a.companion).key >= (<AnimateCompanion> b.companion).key ? 1 : 0);
                            const sequentially: SvgAnimation[] = [];
                            const after: SvgAnimation[] = [];
                            const r = children.length;
                            for (let j = 0; j < r; j++) {
                                const child = children[j];
                                if ((<AnimateCompanion> child.companion).key <= 0) {
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
                            sequentially.push(item);
                            sequentialMap.set(`sequentially_companion_${i}`, <SvgAnimate[]> sequentially.concat(after));
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
                                else if ((!item.fromToType || SvgBuild.isAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
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
                for (const [keyName, item] of sequentialMap.entries()) {
                    if (keyName.startsWith('sequentially_companion')) {
                        togetherTargets.push(item);
                    }
                    else {
                        togetherTargets.push(item.sort(sortSynchronized));
                    }
                }
                for (const item of transformMap.values()) {
                    transformTargets.push(item.sort(sortSynchronized));
                }
                isolatedData.forEach(item => isolatedTargets.push([[item]]));
                [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                    if (targets.length === 0) {
                        return;
                    }
                    const setData: SetData = {
                        ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                        set: [],
                        objectAnimator: []
                    };
                    targets.forEach(items => {
                        let ordering = '';
                        let synchronized = false;
                        let checkBefore = false;
                        let useKeyFrames = true;
                        if (index <= 1 && items.some((item: SvgAnimate) => !!item.synchronized && item.synchronized.value !== '')) {
                            if (!SvgBuild.isAnimateTransform(items[0])) {
                                ordering = 'sequentially';
                            }
                            synchronized = true;
                            useKeyFrames = false;
                        }
                        else if (index <= 1 && items.some((item: SvgAnimate) => !!item.synchronized && item.synchronized.value === '')) {
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
                        const fillBefore = getFillData();
                        const repeating = getFillData();
                        const fillCustom = getFillData();
                        const fillAfter = getFillData();
                        const objectAnimator = repeating.objectAnimator;
                        const customAnimator = fillCustom.objectAnimator;
                        let beforeAnimator = fillBefore.objectAnimator;
                        let afterAnimator = fillAfter.objectAnimator;
                        let together: PropertyValue[] = [];
                        (synchronized ? partitionArray(items, (animate: SvgAnimate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                            if (section === 1 && partition.length > 1) {
                                fillCustom.ordering = 'sequentially';
                            }
                            const animatorMap = new Map<string, PropertyValueHolder[]>();
                            partition.forEach(item => {
                                const valueType = getValueType(item.attributeName);
                                if (valueType === undefined) {
                                    return;
                                }
                                const requireBefore = item.delay > 0;
                                let transforming = false;
                                let transformOrigin: Undef<Point[]>;
                                const resetBeforeValue = (propertyName: string, value: string) => {
                                    if (isString(value) && beforeAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
                                        beforeAnimator.push(this.createPropertyValue(propertyName, value, '0', valueType));
                                    }
                                };
                                const insertFillAfter = (propertyName: string, propertyValues?: PropertyValue[], startOffset?: number) => {
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
                                                            valueTo = propertyName === 'pathData' ? path.value : path[getPaintAttribute(propertyName)];
                                                        }
                                                    }
                                                }
                                            }
                                            if (!valueTo) {
                                                valueTo = item.baseValue;
                                            }
                                        }
                                        let previousValue: Undef<string>;
                                        if (propertyValues?.length) {
                                            const lastValue = propertyValues[propertyValues.length - 1];
                                            if (isArray(lastValue.propertyValuesHolder)) {
                                                const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                            }
                                            else {
                                                previousValue = lastValue.valueTo;
                                            }
                                        }
                                        if (isString(valueTo) && valueTo !== previousValue) {
                                            valueTo = convertValueType(item, valueTo);
                                            if (valueTo) {
                                                switch (propertyName) {
                                                    case 'trimPathStart':
                                                    case 'trimPathEnd':
                                                        valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                        break;
                                                }
                                                afterAnimator.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                            }
                                        }
                                        if (transformOrigin) {
                                            if (propertyName.endsWith('X')) {
                                                afterAnimator.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                            }
                                            else if (propertyName.endsWith('Y')) {
                                                afterAnimator.push(this.createPropertyValue('translateY', '0', '1', valueType));
                                            }
                                        }
                                    }
                                };
                                if (item.setterType) {
                                    const propertyNames = getAttributePropertyName(item.attributeName);
                                    if (propertyNames) {
                                        const values = isColorType(item.attributeName) ? getColorValue<true>(item.to, true) : item.to.trim().split(' ');
                                        const q = propertyNames.length;
                                        if (values.length === q && !values.some(value => value === '')) {
                                            let companionBefore: Undef<PropertyValue[]>;
                                            let companionAfter: Undef<PropertyValue[]>;
                                            for (let i = 0; i < q; i++) {
                                                let valueFrom: Undef<string>;
                                                if (valueType === 'pathType') {
                                                    valueFrom = values[i];
                                                }
                                                else if (requireBefore) {
                                                    const baseValue = item.baseValue;
                                                    if (baseValue) {
                                                        valueFrom = convertValueType(item, baseValue.trim().split(' ')[i]);
                                                    }
                                                }
                                                const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                if (index > 1) {
                                                    customAnimator.push(propertyValue);
                                                    insertFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                }
                                                else {
                                                    const companion = item.companion;
                                                    if (companion) {
                                                        if (companion.key <= 0) {
                                                            if (companionBefore === undefined) {
                                                                companionBefore = [];
                                                            }
                                                            companionBefore.push(propertyValue);
                                                        }
                                                        else if (companion.key > 0) {
                                                            if (companionAfter === undefined) {
                                                                companionAfter = [];
                                                            }
                                                            companionAfter.push(propertyValue);
                                                        }
                                                    }
                                                    else {
                                                        together.push(propertyValue);
                                                    }
                                                }
                                            }
                                            if (companionBefore) {
                                                beforeAnimator = beforeAnimator.concat(companionBefore);
                                            }
                                            if (companionAfter) {
                                                afterAnimator = afterAnimator.concat(companionAfter);
                                            }
                                        }
                                    }
                                }
                                else if (SvgBuild.isAnimate(item)) {
                                    let resetBefore = checkBefore;
                                    let repeatCount: string;
                                    if (section === 1) {
                                        repeatCount = partition.length > 1 ? '0' : '-1';
                                    }
                                    else {
                                        repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                    }
                                    const options = this.createPropertyValue('', '', item.duration.toString(), valueType, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                    let beforeValues: Undef<string[]>;
                                    let propertyNames: Undef<string[]>;
                                    let values:  Undef<string[] |number[][]>;
                                    if (!synchronized && valueType === 'pathType') {
                                        if (group.pathData) {
                                            const parent = item.parent;
                                            let transforms: Undef<SvgTransform[]>;
                                            let companion: Undef<SvgShape>;
                                            if (parent && SvgBuild.isShape(parent)) {
                                                companion = parent;
                                                transforms = parent.path?.transformed;
                                            }
                                            propertyNames = ['pathData'];
                                            values = SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, precision);
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
                                                beforeValues = objectMap(propertyNames, value => getTransformInitialValue(value) || '0');
                                            }
                                            transformOrigin = item.transformOrigin;
                                        }
                                        transforming = true;
                                    }
                                    else if (SvgBuild.asAnimateMotion(item)) {
                                        propertyNames = getTransformPropertyName(item.type);
                                        values = getTransformValues(item);
                                        if (propertyNames && values) {
                                            const rotateValues = item.rotateValues;
                                            const q = values.length;
                                            if (rotateValues?.length === q) {
                                                propertyNames.push('rotation');
                                                for (let i = 0; i < q; i++) {
                                                    values[i].push(rotateValues[i]);
                                                }
                                            }
                                        }
                                        transforming = true;
                                    }
                                    else {
                                        propertyNames = getAttributePropertyName(item.attributeName);
                                        switch (valueType) {
                                            case 'intType':
                                                values = objectMap(item.values, value => convertInt(value).toString());
                                                if (requireBefore) {
                                                    const baseValue = item.baseValue;
                                                    if (baseValue) {
                                                        beforeValues = replaceMap(SvgBuild.parseCoordinates(baseValue), (value: number) => Math.trunc(value).toString());
                                                    }
                                                }
                                                break;
                                            case 'floatType':
                                                if (item.attributeName === 'stroke-dasharray') {
                                                    values = objectMap(item.values, value => replaceMap(value.split(' '), (fraction: string) => parseFloat(fraction)));
                                                }
                                                else {
                                                    values = item.values;
                                                }
                                                if (requireBefore) {
                                                    const baseValue = item.baseValue;
                                                    if (baseValue) {
                                                        beforeValues = replaceMap(SvgBuild.parseCoordinates(baseValue), (value: number) => value.toString());
                                                    }
                                                }
                                                break;
                                            default:
                                                values = item.values.slice(0);
                                                if (isColorType(item.attributeName)) {
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = getColorValue<true>(baseValue, true);
                                                        }
                                                    }
                                                    const q = values.length;
                                                    for (let i = 0; i < q; i++) {
                                                        if (values[i] !== '') {
                                                            values[i] = getColorValue(values[i]);
                                                        }
                                                    }
                                                }
                                                break;
                                        }
                                    }
                                    if (item.keySplines === undefined) {
                                        const timingFunction = item.timingFunction;
                                        options.interpolator = isString(timingFunction) ? createPathInterpolator(timingFunction) : this.options.animateInterpolator;
                                    }
                                    if (values && propertyNames) {
                                        const { keyTimes, synchronized: syncData } = item;
                                        const q = propertyNames.length;
                                        const r = keyTimes.length;
                                        const keyName = syncData ? syncData.key + syncData.value : (index !== 0 || q > 1 ? JSON.stringify(options) : '');
                                        for (let i = 0; i < q; i++) {
                                            const propertyName = propertyNames[i];
                                            if (resetBefore && beforeValues) {
                                                resetBeforeValue(propertyName, beforeValues[i]);
                                            }
                                            if (useKeyFrames && r > 1) {
                                                if (supportedKeyFrames && valueType !== 'pathType') {
                                                    if (!resetBefore && requireBefore && beforeValues) {
                                                        resetBeforeValue(propertyName, beforeValues[i]);
                                                    }
                                                    const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                    const keyframe: KeyFrame[] = [];
                                                    for (let j = 0; j < r; j++) {
                                                        let value = getPropertyValue(values, j, i, true);
                                                        if (value && valueType === 'floatType') {
                                                            value = truncate(value, precision);
                                                        }
                                                        keyframe.push({
                                                            interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                            fraction: keyTimes[j] === 0 && value === '' ? '' : truncate(keyTimes[j], floatPrecisionKeyTime),
                                                            value
                                                        });
                                                    }
                                                    propertyValuesHolder.push({ propertyName, keyframe });
                                                    if (!animatorMap.has(keyName)) {
                                                        if (keyName !== '') {
                                                            animatorMap.set(keyName, propertyValuesHolder);
                                                        }
                                                        (section === 0 ? objectAnimator : customAnimator).push({ ...options, propertyValuesHolder });
                                                    }
                                                    transformOrigin = undefined;
                                                }
                                                else {
                                                    ordering = 'sequentially';
                                                    const translateData = getFillData('sequentially');
                                                    for (let j = 0; j < r; j++) {
                                                        const keyTime = keyTimes[j];
                                                        const propertyOptions: PropertyValue = {
                                                            ...options,
                                                            propertyName,
                                                            startOffset: j === 0 ? (item.delay + (keyTime > 0 ? Math.floor(keyTime * item.duration) : 0)).toString() : '',
                                                            propertyValuesHolder: false
                                                        };
                                                        let valueTo = getPropertyValue(values, j, i, false, valueType === 'pathType' ? group.pathData : item.baseValue);
                                                        if (valueTo) {
                                                            let duration: number;
                                                            if (j === 0) {
                                                                if (!checkBefore && requireBefore && beforeValues) {
                                                                    propertyOptions.valueFrom = beforeValues[i];
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
                                                                propertyOptions.valueFrom = getPropertyValue(values, j - 1, i).toString();
                                                                duration = Math.floor((keyTime - keyTimes[j - 1]) * item.duration);
                                                            }
                                                            if (valueType === 'floatType') {
                                                                valueTo = truncate(valueTo, precision);
                                                            }
                                                            const origin = transformOrigin?.[j];
                                                            if (origin) {
                                                                let direction: Undef<string>;
                                                                let translateTo = 0;
                                                                if (propertyName.endsWith('X')) {
                                                                    direction = 'translateX';
                                                                    translateTo = origin.x;
                                                                }
                                                                else if (propertyName.endsWith('Y')) {
                                                                    direction = 'translateY';
                                                                    translateTo = origin.y;
                                                                }
                                                                if (direction) {
                                                                    const valueData = this.createPropertyValue(direction, truncate(translateTo, precision), duration.toString(), 'floatType');
                                                                    valueData.interpolator = createPathInterpolator(KEYSPLINE_NAME['step-start']);
                                                                    translateData.objectAnimator.push(valueData);
                                                                }
                                                            }
                                                            if (j > 0) {
                                                                propertyOptions.interpolator = getPathInterpolator(item.keySplines, j - 1);
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
                                                    interpolator: item.duration > 1 ? getPathInterpolator(item.keySplines, 0) : '',
                                                    propertyValuesHolder: false
                                                };
                                                const s = values.length;
                                                if (Array.isArray(values[0])) {
                                                    const valueTo = values[s - 1][i];
                                                    if (s > 1) {
                                                        const from = values[0][i];
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
                                                        propertyOptions.valueTo = values[s - 1].toString();
                                                    }
                                                    else {
                                                        valueFrom = item.from || (!checkBefore && requireBefore && beforeValues ? beforeValues[i] : '');
                                                        propertyOptions.valueTo = item.to;
                                                    }
                                                    if (valueType === 'pathType') {
                                                        propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                    }
                                                    else if (valueFrom !== propertyOptions.valueTo && valueFrom) {
                                                        propertyOptions.valueFrom = convertValueType(item, valueFrom);
                                                    }
                                                }
                                                const valueA = propertyOptions.valueTo;
                                                if (valueA) {
                                                    if (valueType === 'floatType') {
                                                        propertyOptions.valueTo = truncate(valueA, precision);
                                                    }
                                                    (section === 0 ? objectAnimator : customAnimator).push(propertyOptions);
                                                }
                                            }
                                            if (section === 0 && !synchronized && item.iterationCount !== -1) {
                                                insertFillAfter(propertyName, objectAnimator);
                                            }
                                        }
                                        if (requireBefore && transformOrigin?.length) {
                                            resetBeforeValue('translateX', '0');
                                            resetBeforeValue('translateY', '0');
                                        }
                                    }
                                }
                            });
                        });
                        const valid = objectAnimator.length > 0 || customAnimator.length > 0;
                        if (ordering === 'sequentially') {
                            if (valid && beforeAnimator.length === 1) {
                                objectAnimator.unshift(beforeAnimator[0]);
                                beforeAnimator.length = 0;
                            }
                            if (customAnimator.length === 1) {
                                objectAnimator.push(customAnimator[0]);
                                customAnimator.length = 0;
                            }
                            if (valid && afterAnimator.length === 1) {
                                objectAnimator.push(afterAnimator[0]);
                                afterAnimator.length = 0;
                            }
                        }
                        if (beforeAnimator.length === 0 && customAnimator.length === 0 && afterAnimator.length === 0) {
                            if (ordering === 'sequentially' && objectAnimator.length === 1) {
                                ordering = '';
                            }
                            if (setData.ordering !== 'sequentially' && ordering !== 'sequentially') {
                                together = together.concat(objectAnimator);
                                objectAnimator.length = 0;
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
                            setData.objectAnimator = setData.objectAnimator.concat(together);
                        }
                    });
                    if (setData.set.length || setData.objectAnimator.length) {
                        targetSetTemplate.set.push(setData);
                    }
                });
                insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength);
            }
            for (const [name, target] of this._animateTarget.entries()) {
                let objectAnimator: Undef<PropertyValue[]>;
                const insertResetValue = (propertyName: string, valueTo: string, valueType: string, valueFrom?: string, startOffset?: string) => {
                    if (objectAnimator === undefined) {
                        objectAnimator = [];
                    }
                    objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '0', valueType, valueFrom, startOffset));
                };
                target.animate.forEach(item => {
                    if (SvgBuild.asAnimateMotion(item)) {
                        const parent = item.parent;
                        if (parent && SvgBuild.isShape(parent)) {
                            const path = parent.path;
                            if (path) {
                                const { value, baseValue } = path;
                                if (value !== baseValue) {
                                    insertResetValue('pathData', baseValue, 'pathType', value);
                                    if (item.iterationCount !== -1 && !item.setterType) {
                                        insertResetValue('pathData', value, 'pathType', baseValue, item.getTotalDuration().toString());
                                    }
                                }
                            }
                        }
                    }
                });
                if (objectAnimator) {
                    insertTargetAnimation(
                        data,
                        name,
                        {
                            set: [{ set: undefined as any, objectAnimator }],
                            objectAnimator: undefined as any
                        },
                        templateName,
                        imageLength
                    );
                }
            }
            if (data[0].target) {
                vectorName = Resource.insertStoredAsset('drawables', getTemplateFilename(templateName, imageLength, 'anim'), applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data));
            }
        }
        if (imageLength) {
            const resource = <android.base.Resource<T>> this.resource;
            const item: StandardMap[] = [];
            const layerData: StandardMap[] = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
            if (vectorName !== '') {
                item.push({ drawable: getDrawableSrc(vectorName) });
            }
            imageData.forEach(image => {
                const box = svg.viewBox;
                const scaleX = svg.width / box.width;
                const scaleY = svg.height / box.height;
                let x = image.getBaseValue('x', 0) * scaleX;
                let y = image.getBaseValue('y', 0) * scaleY;
                let w: number = image.getBaseValue('width', 0);
                let h: number = image.getBaseValue('height', 0);
                const offset = getParentOffset(image.element, svg.element);
                x += offset.x;
                y += offset.y;
                w *= scaleX;
                h *= scaleY;
                const data: StandardMap = {
                    width: formatPX(w),
                    height: formatPX(h),
                    left: x !== 0 ? formatPX(x) : '',
                    top: y !== 0 ? formatPX(y) : ''
                };
                const src = getDrawableSrc(resource.addImageSet({ mdpi: image.href }));
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
            });
            drawable = Resource.insertStoredAsset('drawables', templateName, applyTemplate('layer-list', LAYERLIST_TMPL, layerData));
        }
        else {
            drawable = vectorName;
        }
        node.data(Resource.KEY_NAME, 'svgViewBox', viewBox);
        return drawable;
    }

    private createPropertyValue(propertyName: string, valueTo: string, duration: string, valueType: string, valueFrom = '', startOffset = '', repeatCount = '0'): PropertyValue {
        const floatPrecisionValue = this.options.floatPrecisionValue;
        return {
            propertyName,
            startOffset,
            duration,
            repeatCount,
            valueType,
            valueFrom: isNumber(valueFrom) ? truncate(valueFrom, floatPrecisionValue) : valueFrom,
            valueTo: isNumber(valueTo) ? truncate(valueTo, floatPrecisionValue) : valueTo,
            propertyValuesHolder: false
        };
    }

    private parseVectorData(group: SvgGroup, depth = 0) {
        const floatPrecisionValue = this.options.floatPrecisionValue;
        const result = this.createGroup(group);
        const length = result.length;
        const renderDepth = depth + length;
        let output = '';
        group.each(item => {
            if (item.visible) {
                if (SvgBuild.isShape(item)) {
                    const itemPath = item.path;
                    if (itemPath?.value) {
                        const [path, groupArray] = this.createPath(item, itemPath);
                        const pathArray: PathData[] = [];
                        if (parseFloat(itemPath.strokeWidth) > 0 && (itemPath.strokeDasharray || itemPath.strokeDashoffset)) {
                            const animateData = this._animateData.get(item.name);
                            if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                const [animations, strokeDash, pathData, clipPathData] = itemPath.extractStrokeDash(animateData?.animate, floatPrecisionValue);
                                if (strokeDash) {
                                    if (animateData) {
                                        this._animateData.delete(item.name);
                                        if (animations) {
                                            animateData.animate = animations;
                                        }
                                    }
                                    const name = getVectorName(item, 'stroke');
                                    const strokeData: TransformData = { name };
                                    if (pathData !== '') {
                                        path.pathData = pathData;
                                    }
                                    if (clipPathData !== '') {
                                        strokeData['clip-path'] = [{ pathData: clipPathData }];
                                    }
                                    const q = strokeDash.length;
                                    for (let i = 0; i < q; i++) {
                                        const strokePath = i === 0 ? path : { ...path };
                                        const dash = strokeDash[i];
                                        strokePath.name = `${name}_${i}`;
                                        if (animateData) {
                                            this._animateData.set(strokePath.name, {
                                                element: animateData.element,
                                                animate: animateData.animate.filter(animate => animate.id === undefined || animate.id === i)
                                            });
                                        }
                                        strokePath.trimPathStart = truncate(dash.start, floatPrecisionValue);
                                        strokePath.trimPathEnd = truncate(dash.end, floatPrecisionValue);
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
                    if (item.length) {
                        output += this.parseVectorData(item, renderDepth);
                    }
                }
                else if (SvgBuild.asImage(item)) {
                    if (!SvgBuild.asPattern(group)) {
                        item.extract(this.options.transformExclude.image);
                        this._imageData.push(item);
                    }
                }
            }
        });
        if (length) {
            result[length - 1].include = output;
            return applyTemplate('group', VECTOR_GROUP, result, depth + 1);
        }
        else {
            return output;
        }
    }

    private createGroup(target: SvgGroup) {
        const clipMain: StringMap[] = [];
        const clipBox: StringMap[] = [];
        const groupMain: VectorGroupData = { 'clip-path': clipMain };
        const groupBox: VectorGroupData = { 'clip-path': clipBox };
        const result: VectorGroupData[] = [];
        const transformData: TransformData = {};
        if ((SvgBuild.asSvg(target) && !target.documentRoot || SvgBuild.asUseSymbol(target) || SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
            transformData.name = getVectorName(target, 'main');
            transformData.translateX = target.x.toString();
            transformData.translateY = target.y.toString();
        }
        if (target.clipRegion !== '') {
            this.createClipPath(target, clipMain, target.clipRegion);
        }
        if (clipMain.length || Object.keys(transformData).length) {
            Object.assign(groupMain, transformData);
            result.push(groupMain);
        }
        if (target !== this._svgInstance) {
            const baseData: TransformData = {};
            const [transforms] = groupTransforms(target.element, target.transforms, true);
            const groupName = getVectorName(target, 'animate');
            if ((SvgBuild.asG(target) || SvgBuild.asUseSymbol(target)) && isString(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
                baseData.name = groupName;
            }
            if (this.queueAnimations(target, groupName, item => SvgBuild.asAnimateTransform(item))) {
                baseData.name = groupName;
            }
            if (Object.keys(baseData).length) {
                Object.assign(groupBox, baseData);
                result.push(groupBox);
            }
            if (transforms.length) {
                let transformed: SvgTransform[] = [];
                transforms.forEach(data => {
                    result.push(createTransformData(data));
                    transformed = transformed.concat(data);
                });
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(target: SvgShape, path: SvgPath): [PathData, VectorGroupData[]] {
        const precision = this.options.floatPrecisionValue;
        const result: PathData = { name: target.name };
        const renderData: VectorGroupData[] = [];
        const clipElement: StringMap[] = [];
        const baseData: VectorGroupData = {};
        const groupName = getVectorName(target, 'group');
        const opacity = getOuterOpacity(target);
        const useTarget = SvgBuild.asUse(target);
        if (SvgBuild.asUse(target) && isString(target.clipPath)) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if (isString(path.clipPath)) {
            const shape = new SvgShape(path.element);
            shape.build({ exclude: this.options.transformExclude, residual: partitionTransforms, precision });
            shape.synchronize({ keyTimeMode: this._synchronizeMode, precision });
            this.createClipPath(shape, clipElement, path.clipPath);
        }
        if (this.queueAnimations(target, groupName, item => SvgBuild.isAnimateTransform(item), '', target.name)) {
            baseData.name = groupName;
        }
        else if (clipElement.length) {
            baseData.name = '';
        }
        if (SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
            baseData.translateX = target.x.toString();
            baseData.translateY = target.y.toString();
        }
        if (clipElement.length) {
            baseData['clip-path'] = clipElement;
        }
        if (Object.keys(baseData).length) {
            renderData.push(baseData);
        }
        path.transformResidual?.forEach(item => renderData.push(createTransformData(item)));
        PATH_ATTRIBUTES.forEach(attr => {
            let value = useTarget && target[attr] || path[attr];
            if (value) {
                switch (attr) {
                    case 'name':
                        break;
                    case 'value':
                        attr = 'pathData';
                        break;
                    case 'fill':
                        attr = 'fillColor';
                        if (value !== 'none' && result['aapt:attr'] === undefined) {
                            const colorName = Resource.addColor(value);
                            if (colorName !== '') {
                                value = `@color/${colorName}`;
                            }
                        }
                        else {
                            return;
                        }
                        break;
                    case 'stroke':
                        attr = 'strokeColor';
                        if (value !== 'none') {
                            const colorName = Resource.addColor(value);
                            if (colorName !== '') {
                                value = `@color/${colorName}`;
                            }
                        }
                        else {
                            return;
                        }
                        break;
                    case 'fillPattern': {
                        const definition = this._svgInstance.definitions.gradient.get(value);
                        let valid = false;
                        if (definition) {
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
                                    const gradient = createFillGradient(definition, path, precision);
                                    if (gradient) {
                                        value = {
                                            name: 'android:fillColor',
                                            gradient
                                        };
                                        valid = true;
                                    }
                                    break;
                                }
                            }
                        }
                        if (valid) {
                            attr = 'aapt:attr';
                            result.fillColor = '';
                            this._namespaceAapt = true;
                        }
                        else {
                            return;
                        }
                        break;
                    }
                    case 'fillRule':
                        if (value === 'evenodd') {
                            attr = 'fillType';
                            value = 'evenOdd';
                        }
                        else {
                            return;
                        }
                        break;
                    case 'strokeWidth':
                        if (value === '0') {
                            return;
                        }
                        break;
                    case 'fillOpacity':
                    case 'strokeOpacity':
                        value = ((isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
                        if (value === '1') {
                            return;
                        }
                        attr = attr === 'fillOpacity' ? 'fillAlpha' : 'strokeAlpha';
                        break;
                    case 'strokeLinecap':
                        if (value === 'butt') {
                            return;
                        }
                        attr = 'strokeLineCap';
                        break;
                    case 'strokeLinejoin':
                        if (value === 'miter') {
                            return;
                        }
                        attr = 'strokeLineJoin';
                        break;
                    case 'strokeMiterlimit':
                        if (value === '4') {
                            return;
                        }
                        attr = 'strokeMiterLimit';
                        break;
                    default:
                        return;
                }
                result[attr] = value;
            }
        });
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
        let previousPathData = pathData;
        let index = 0;
        target.animations.forEach(item => {
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
                index++;
            }
        });
        const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
        const q = replaceData.length;
        for (let i = 0; i < q; i++) {
            const item = replaceData[i];
            if (!item.reset || item.to !== previousPathData) {
                let valid = true;
                if (item.reset) {
                    invalid: {
                        for (let j = 0; j < i; j++) {
                            const previous = replaceData[j];
                            if (!previous.reset) {
                                for (let k = i + 1; k < q; k++) {
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
                    for (let j = 0; j < i; j++) {
                        const previous = replaceData[j];
                        itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                    }
                    const r = itemTotal.length;
                    for (let j = 0; j < r; j++) {
                        if (itemTotal[j] === 1) {
                            const animate = replaceData.find(data => data.index === j && 'animate' in data)?.animate;
                            if (animate) {
                                previousType.add(animate.type);
                            }
                        }
                    }
                    previousType.forEach(type => {
                        const propertyName = getTransformPropertyName(type);
                        if (propertyName) {
                            const initialValue = TRANSFORM.typeAsValue(type).split(' ');
                            const s = initialValue.length;
                            for (let j = 0; j < s; j++) {
                                transformResult.push(createAnimateFromTo(propertyName[j], item.time, initialValue[j], ''));
                            }
                        }
                    });
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
                data.animate = data.animate.concat(transformResult);
            }
        }
        if (replaceResult.length) {
            const data = animateData.get(result.name);
            if (data) {
                data.animate = data.animate.concat(replaceResult);
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
        const { transformExclude: exclude, floatPrecisionValue: precision } = this.options;
        const definitions = this._svgInstance.definitions;
        const keyTimeMode = this._synchronizeMode;
        let result = 0;
        clipPath.split(';').forEach((value, index, array) => {
            if (value.charAt(0) === '#') {
                const element = <SVGGElement> (definitions.clipPath.get(value) as unknown);
                if (element) {
                    const g = new SvgG(element);
                    g.build({ exclude, residual: partitionTransforms, precision });
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
                                clipArray.push({ name, pathData });
                            }
                        }
                    });
                }
                result++;
            }
            else {
                let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                if (!this.queueAnimations(target, name, item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
                    name = '';
                }
                clipArray.push({ name, pathData: value });
                result++;
            }
        });
        return result > 0;
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