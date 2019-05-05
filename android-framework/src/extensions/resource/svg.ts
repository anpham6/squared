import { SvgLinearGradient, SvgMatrix, SvgPoint, SvgRadialGradient, SvgTransform } from '../../../../src/svg/@types/object';
import { ResourceStoredMapAndroid } from '../../@types/application';
import { ResourceSvgOptions } from '../../@types/extension';
import { GradientTemplate } from '../../@types/resource';

import Resource from '../../resource';
import View from '../../view';

import { convertColorStops } from './background';

import { XMLNS_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID } from '../../lib/enumeration';
import { VECTOR_GROUP, VECTOR_PATH } from '../../template/vector';

import ANIMATEDVECTOR_TMPL from '../../template/animated-vector';
import LAYERLIST_TMPL from '../../template/layer-list';
import SET_TMPL from '../../template/set';
import VECTOR_TMPL from '../../template/vector';

if (!squared.svg) {
    squared.svg = { lib: {} } as any;
}

import $Svg = squared.svg.Svg;
import $SvgAnimate = squared.svg.SvgAnimate;
import $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import $SvgBuild = squared.svg.SvgBuild;
import $SvgG = squared.svg.SvgG;
import $SvgPath = squared.svg.SvgPath;
import $SvgShape = squared.svg.SvgShape;

type SvgAnimation = squared.svg.SvgAnimation;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;

type SvgView = squared.svg.SvgView;

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
    animate?: $SvgAnimateTransform;
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

type AnimateCompanion = NumberValue<SvgAnimation>;

const $util = squared.lib.util;
const $css = squared.lib.css;
const $math = squared.lib.math;
const $xml = squared.lib.xml;
const $constS = squared.svg.lib.constant;
const $utilS = squared.svg.lib.util;

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

if ($constS) {
    Object.assign(INTERPOLATOR_ANDROID, {
        [$constS.KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
        [$constS.KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
        [$constS.KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
        [$constS.KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear
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

function getPathInterpolator(keySplines: string[] | undefined, index: number): string {
    if (keySplines && keySplines[index]) {
        return INTERPOLATOR_ANDROID[keySplines[index]] || createPathInterpolator(keySplines[index]);
    }
    return '';
}

function getPaintAttribute(value: string) {
    for (const attr in ATTRIBUTE_ANDROID) {
        if (ATTRIBUTE_ANDROID[attr].includes(value)) {
            return $util.convertCamelCase(attr);
        }
    }
    return '';
}

function createPathInterpolator(value: string) {
    if (INTERPOLATOR_ANDROID[value]) {
        return INTERPOLATOR_ANDROID[value];
    }
    else {
        const interpolatorName = `path_interpolator_${$util.convertWord(value)}`;
        if (!STORED.animators.has(interpolatorName)) {
            const xml = $util.formatString(INTERPOLATOR_XML, ...value.split(' '));
            STORED.animators.set(interpolatorName, xml);
        }
        return `@anim/${interpolatorName}`;
    }
}

function createTransformData(transform: SvgTransform[]) {
    const result: TransformData = {};
    for (let i = 0; i < transform.length; i++) {
        const item = transform[i];
        const m = item.matrix;
        switch (item.type) {
            case SVGTransform.SVG_TRANSFORM_SCALE:
                result.scaleX = m.a.toString();
                result.scaleY = m.d.toString();
                if (item.origin) {
                    result.pivotX = item.origin.x.toString();
                    result.pivotY = item.origin.y.toString();
                }
                break;
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                result.rotation = item.angle.toString();
                if (item.origin) {
                    result.pivotX = item.origin.x.toString();
                    result.pivotY = item.origin.y.toString();
                }
                else {
                    result.pivotX = '0';
                    result.pivotY = '0';
                }
                break;
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                result.translateX = m.e.toString();
                result.translateY = m.f.toString();
                break;
        }
    }
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
    for (const parent of getViewport(element)) {
        if (($utilS.SVG.svg(parent) || $utilS.SVG.use(parent)) && parent !== rootElement) {
            x += parent.x.baseVal.value;
            y += parent.y.baseVal.value;
        }
    }
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
    if (transforms.length && ($utilS.SVG.circle(element) || $utilS.SVG.ellipse(element))) {
        if (transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) && (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
            return groupTransforms(element, transforms);
        }
    }
    return [[], transforms];
}

function groupTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], ignoreClient = false): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length) {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        const items = transforms.slice(0).reverse();
        const rotateOrigin = transforms[0].fromCSS ? [] : $utilS.TRANSFORM.rotateOrigin(element).reverse();
        for (let i = 1; i < items.length; i++) {
            const itemA = items[i];
            const itemB = items[i - 1];
            if (itemA.type === itemB.type) {
                let matrix: SvgMatrix | undefined;
                switch (itemA.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        matrix = $utilS.MATRIX.clone(itemA.matrix);
                        matrix.e += itemB.matrix.e;
                        matrix.f += itemB.matrix.f;
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                        matrix = $utilS.MATRIX.clone(itemA.matrix);
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
        const current: SvgTransform[] = [];
        function restart() {
            host.push(current.slice(0));
            current.length = 0;
        }
        for (const item of items) {
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

function getPropertyValue(values: string[] | (string | number)[][], index: number, propertyIndex: number, keyFrames = false, baseValue?: string) {
    let value: string | undefined;
    const property = values[index];
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
    const result = new $SvgAnimate();
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
    let result: string[] | undefined = ATTRIBUTE_ANDROID[value];
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

function getTransformValues(item: $SvgAnimate) {
    switch (item.type) {
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return $SvgAnimateTransform.toRotateList(item.values);
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return $SvgAnimateTransform.toScaleList(item.values);
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return $SvgAnimateTransform.toTranslateList(item.values);
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
    const colorName = `@color/${Resource.addColor(value)}`;
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

function createFillGradient(gradient: Gradient, path: $SvgPath, precision?: number) {
    const result: GradientTemplate = {
        type: gradient.type,
        item: convertColorStops(gradient.colorStops, precision)
    };
    switch (gradient.type) {
        case 'radial': {
            const radial = <SvgRadialGradient> gradient;
            const points: Point[] = [];
            let cx!: number;
            let cy!: number;
            let cxDiameter!: number;
            let cyDiameter!: number;
            switch (path.element.tagName) {
                case 'path':
                    for (const command of $SvgBuild.getPathCommands(path.value)) {
                        $util.concatArray(points, command.value);
                    }
                case 'polygon':
                    if ($utilS.SVG.polygon(path.element)) {
                        $util.concatArray(points, $SvgBuild.clonePoints(path.element.points));
                    }
                    if (!points.length) {
                        return undefined;
                    }
                    [cx, cy, cxDiameter, cyDiameter] = $SvgBuild.minMaxPoints(points);
                    cxDiameter -= cx;
                    cyDiameter -= cy;
                    break;
                default:
                    if ($utilS.SVG.rect(path.element)) {
                        const rect = path.element;
                        cx = rect.x.baseVal.value;
                        cy = rect.y.baseVal.value;
                        cxDiameter = rect.width.baseVal.value;
                        cyDiameter = rect.height.baseVal.value;
                    }
                    else if ($utilS.SVG.circle(path.element)) {
                        const circle = path.element;
                        cx = circle.cx.baseVal.value - circle.r.baseVal.value;
                        cy = circle.cy.baseVal.value - circle.r.baseVal.value;
                        cxDiameter = circle.r.baseVal.value * 2;
                        cyDiameter = cxDiameter;
                    }
                    else if ($utilS.SVG.ellipse(path.element)) {
                        const ellipse = path.element;
                        cx = ellipse.cx.baseVal.value - ellipse.rx.baseVal.value;
                        cy = ellipse.cy.baseVal.value - ellipse.ry.baseVal.value;
                        cxDiameter = ellipse.rx.baseVal.value * 2;
                        cyDiameter = ellipse.ry.baseVal.value * 2;
                    }
                    else {
                        return undefined;
                    }
                    break;
            }
            result.centerX = (cx + cxDiameter * getRadiusPercent(radial.cxAsString)).toString();
            result.centerY = (cy + cyDiameter * getRadiusPercent(radial.cyAsString)).toString();
            result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($css.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
            if (radial.spreadMethod) {
                result.tileMode = getTileMode(radial.spreadMethod);
            }
            break;
        }
        case 'linear': {
            const linear = <SvgLinearGradient> gradient;
            result.startX = linear.x1.toString();
            result.startY = linear.y1.toString();
            result.endX = linear.x2.toString();
            result.endY = linear.y2.toString();
            if (linear.spreadMethod) {
                result.tileMode = getTileMode(linear.spreadMethod);
            }
        }
    }
    return result;
}

const isColorType = (attr: string) => attr === 'fill' || attr === 'stroke';

const getVectorName = (target: SvgView, section: string, index = -1) => `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;

const getRadiusPercent = (value: string) => $css.isPercent(value) ? parseFloat(value) / 100 : 0.5;

const getDrawableSrc = (name: string) => `@drawable/${name}`;

const getFillData = (ordering = ''): FillData => ({ ordering, objectAnimator: [] });

export default class ResourceSvg<T extends View> extends squared.base.Extension<T> {
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

    private SVG_INSTANCE!: $Svg;
    private VECTOR_DATA = new Map<string, ExternalData>();
    private ANIMATE_DATA = new Map<string, AnimateGroup>();
    private ANIMATE_TARGET = new Map<string, AnimateGroup>();
    private IMAGE_DATA: SvgImage[] = [];
    private SYNCHRONIZE_MODE = 0;
    private NAMESPACE_AAPT = false;

    public beforeInit() {
        if ($SvgBuild) {
            $SvgBuild.setName();
            this.application.controllerHandler.localSettings.svg.enabled = true;
        }
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement) {
                const svg = new $Svg(<SVGSVGElement> node.element);
                const supportedKeyFrames = node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW;
                this.SVG_INSTANCE = svg;
                this.VECTOR_DATA.clear();
                this.ANIMATE_DATA.clear();
                this.ANIMATE_TARGET.clear();
                this.IMAGE_DATA.length = 0;
                this.NAMESPACE_AAPT = false;
                this.SYNCHRONIZE_MODE = $constS.SYNCHRONIZE_MODE.FROMTO_ANIMATE | (supportedKeyFrames ? $constS.SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : $constS.SYNCHRONIZE_MODE.IGNORE_TRANSFORM);
                const templateName = `${node.tagName}_${$util.convertWord(node.controlId, true)}_viewbox`.toLowerCase();
                const getFilename = (prefix?: string, suffix?: string) => templateName + (prefix ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix ? `_${suffix.toLowerCase()}` : '');
                svg.build({
                    exclude: this.options.transformExclude,
                    residual: partitionTransforms,
                    precision: this.options.floatPrecisionValue
                });
                svg.synchronize({
                    keyTimeMode: this.SYNCHRONIZE_MODE,
                    framesPerSecond: this.application.controllerHandler.userSettings.framesPerSecond,
                    precision: this.options.floatPrecisionValue
                });
                this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
                const include = this.parseVectorData(svg);
                let vectorName = Resource.insertStoredAsset(
                    'drawables',
                    getFilename(),
                    $xml.applyTemplate('vector', VECTOR_TMPL, [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'xmlns:aapt': this.NAMESPACE_AAPT ? XMLNS_ANDROID.aapt : '',
                        'android:name': svg.name,
                        'android:width': $css.formatPX(svg.width),
                        'android:height': $css.formatPX(svg.height),
                        'android:viewportWidth': (svg.viewBox.width || svg.width).toString(),
                        'android:viewportHeight': (svg.viewBox.height || svg.height).toString(),
                        'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                        include
                    }])
                );
                let drawable = '';
                if (this.ANIMATE_DATA.size) {
                    const data: AnimatedVectorTemplate[] = [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'android:drawable': getDrawableSrc(vectorName),
                        target: []
                    }];
                    function insertTargetAnimation(name: string, targetSetTemplate: SetTemplate) {
                        if (targetSetTemplate.set.length) {
                            let modified = false;
                            if (targetSetTemplate.set.length > 1 && targetSetTemplate.set.every(item => item.ordering === '')) {
                                const setData: SetTemplate = {
                                    set: [],
                                    objectAnimator: []
                                };
                                for (const item of targetSetTemplate.set) {
                                    $util.concatArray(setData.set, item.set);
                                    $util.concatArray(setData.objectAnimator, item.objectAnimator);
                                }
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
                                    getFilename('anim', name),
                                    $xml.applyTemplate('set', SET_TMPL, [targetSetTemplate])
                                )
                            };
                            if (targetData.animation !== '') {
                                targetData.animation = `@anim/${targetData.animation}`;
                                data[0].target.push(targetData);
                            }
                        }
                    }
                    for (const [name, group] of this.ANIMATE_DATA.entries()) {
                        const sequentialMap = new Map<string, $SvgAnimate[]>();
                        const transformMap = new Map<string, $SvgAnimateTransform[]>();
                        const togetherData: SvgAnimation[] = [];
                        const isolatedData: SvgAnimation[] = [];
                        const togetherTargets: SvgAnimation[][] = [];
                        const isolatedTargets: SvgAnimation[][][] = [];
                        const transformTargets: SvgAnimation[][] = [];
                        const [companions, animations] = $util.partitionArray(group.animate, child => child.companion !== undefined);
                        const targetSetTemplate: SetTemplate = {
                            set: [],
                            objectAnimator: []
                        };
                        for (let i = 0; i < animations.length; i++) {
                            const item = animations[i];
                            if (item.setterType) {
                                if (ATTRIBUTE_ANDROID[item.attributeName] && $util.isString(item.to)) {
                                    if (item.duration > 0 && item.fillReplace) {
                                        isolatedData.push(item);
                                    }
                                    else {
                                        togetherData.push(item);
                                    }
                                }
                            }
                            else if ($SvgBuild.isAnimate(item)) {
                                const children = $util.filterArray(companions, child => (<AnimateCompanion> child.companion).value === item);
                                if (children.length) {
                                    children.sort((a, b) => (<AnimateCompanion> a.companion).key >= (<AnimateCompanion> b.companion).key ? 1 : 0);
                                    const sequentially: SvgAnimation[] = [];
                                    const after: SvgAnimation[] = [];
                                    for (let j = 0; j < children.length; j++) {
                                        const child = children[j];
                                        if ((<AnimateCompanion> child.companion).key <= 0) {
                                            sequentially.push(child);
                                            if (j === 0 && item.delay > 0) {
                                                child.delay += item.delay;
                                                item.delay = 0;
                                            }
                                        }
                                        else {
                                            after.push(child);
                                        }
                                    }
                                    sequentially.push(item);
                                    $util.concatArray(sequentially, after);
                                    sequentialMap.set(`sequentially_companion_${i}`, <$SvgAnimate[]> sequentially);
                                }
                                else {
                                    const synchronized = item.synchronized;
                                    if (synchronized) {
                                        if ($SvgBuild.isAnimateTransform(item)) {
                                            const values = transformMap.get(synchronized.value) || [];
                                            values.push(item);
                                            transformMap.set(synchronized.value, values);
                                        }
                                        else {
                                            const values = sequentialMap.get(synchronized.value) || [];
                                            values.push(item);
                                            sequentialMap.set(synchronized.value, values);
                                        }
                                    }
                                    else {
                                        if ($SvgBuild.isAnimateTransform(item)) {
                                            item.expandToValues();
                                        }
                                        if (item.iterationCount === -1) {
                                            isolatedData.push(item);
                                        }
                                        else if ((!item.fromToType || $SvgBuild.isAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
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
                                togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.key >= b.synchronized.key ? 1 : -1));
                            }
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.key >= b.synchronized.key ? 1 : -1));
                        }
                        for (const item of isolatedData) {
                            isolatedTargets.push([[item]]);
                        }
                        [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                            if (targets.length === 0) {
                                return;
                            }
                            const setData: SetData = {
                                ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                                set: [],
                                objectAnimator: []
                            };
                            for (const items of targets) {
                                let ordering = '';
                                let synchronized = false;
                                let checkBefore = false;
                                let useKeyFrames = true;
                                if (index <= 1 && items.some((item: $SvgAnimate) => !!item.synchronized && item.synchronized.value !== '')) {
                                    if (!$SvgBuild.isAnimateTransform(items[0])) {
                                        ordering = 'sequentially';
                                    }
                                    synchronized = true;
                                    useKeyFrames = false;
                                }
                                else if (index <= 1 && items.some((item: $SvgAnimate) => !!item.synchronized && item.synchronized.value === '')) {
                                    ordering = 'sequentially';
                                    synchronized = true;
                                    checkBefore = true;
                                }
                                else if (index <= 1 && items.some(item => item.companion !== undefined)) {
                                    ordering = 'sequentially';
                                }
                                else {
                                    if (index > 0) {
                                        ordering = 'sequentially';
                                    }
                                    if (index > 1 && $SvgBuild.isAnimateTransform(items[0])) {
                                        checkBefore = true;
                                    }
                                }
                                const fillBefore = getFillData();
                                const repeating = getFillData();
                                const fillCustom = getFillData();
                                const fillAfter = getFillData();
                                const together: PropertyValue[] = [];
                                (synchronized ? $util.partitionArray(items, (animate: $SvgAnimate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                    if (section === 1 && partition.length > 1) {
                                        fillCustom.ordering = 'sequentially';
                                    }
                                    const animatorMap = new Map<string, PropertyValueHolder[]>();
                                    for (const item of partition) {
                                        const valueType = getValueType(item.attributeName);
                                        if (valueType === undefined) {
                                            continue;
                                        }
                                        const requireBefore = item.delay > 0;
                                        let transforming = false;
                                        let transformOrigin: Point[] | undefined;
                                        const resetBeforeValue = (propertyName: string, value: string) => {
                                            if ($util.isString(value) && fillBefore.objectAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
                                                fillBefore.objectAnimator.push(this.createPropertyValue(propertyName, value, '0', valueType));
                                            }
                                        };
                                        const insertFillAfter = (propertyName: string, propertyValues?: PropertyValue[], startOffset?: number) => {
                                            if (!synchronized && item.fillReplace && valueType !== undefined) {
                                                let valueTo = item.replaceValue;
                                                if (!valueTo) {
                                                    if (transforming) {
                                                        valueTo = getTransformInitialValue(propertyName);
                                                    }
                                                    else if (item.parent && $SvgBuild.isShape(item.parent) && item.parent.path) {
                                                        valueTo = propertyName === 'pathData' ? item.parent.path.value : item.parent.path[getPaintAttribute(propertyName)];
                                                    }
                                                    if (!valueTo) {
                                                        valueTo = item.baseValue;
                                                    }
                                                }
                                                let previousValue: string | undefined;
                                                if (propertyValues && propertyValues.length) {
                                                    const lastValue = propertyValues[propertyValues.length - 1];
                                                    if ($util.isArray(lastValue.propertyValuesHolder)) {
                                                        const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                        previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                    }
                                                    else {
                                                        previousValue = lastValue.valueTo;
                                                    }
                                                }
                                                if ($util.isString(valueTo) && valueTo !== previousValue) {
                                                    valueTo = convertValueType(item, valueTo);
                                                    if (valueTo) {
                                                        switch (propertyName) {
                                                            case 'trimPathStart':
                                                            case 'trimPathEnd':
                                                                valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                                break;
                                                        }
                                                        fillAfter.objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                                    }
                                                }
                                                if (transformOrigin) {
                                                    if (propertyName.endsWith('X')) {
                                                        fillAfter.objectAnimator.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                    }
                                                    else if (propertyName.endsWith('Y')) {
                                                        fillAfter.objectAnimator.push(this.createPropertyValue('translateY', '0', '1', valueType));
                                                    }
                                                }
                                            }
                                        };
                                        if (item.setterType) {
                                            const propertyNames = getAttributePropertyName(item.attributeName);
                                            if (propertyNames) {
                                                const values = isColorType(item.attributeName) ? getColorValue<true>(item.to, true) : item.to.trim().split(' ');
                                                if (values.length === propertyNames.length && !values.some(value => value === '')) {
                                                    let companionBefore: PropertyValue[] | undefined;
                                                    let companionAfter: PropertyValue[] | undefined;
                                                    for (let i = 0; i < propertyNames.length; i++) {
                                                        let valueFrom: string | undefined;
                                                        if (valueType === 'pathType') {
                                                            valueFrom = values[i];
                                                        }
                                                        else if (requireBefore && item.baseValue) {
                                                            valueFrom = convertValueType(item, item.baseValue.trim().split(' ')[i]);
                                                        }
                                                        const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                        if (index > 1) {
                                                            fillCustom.objectAnimator.push(propertyValue);
                                                            insertFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                        }
                                                        else {
                                                            if (item.companion && item.companion.key <= 0) {
                                                                if (companionBefore === undefined) {
                                                                    companionBefore = [];
                                                                }
                                                                companionBefore.push(propertyValue);
                                                            }
                                                            else if (item.companion && item.companion.key > 0) {
                                                                if (companionAfter === undefined) {
                                                                    companionAfter = [];
                                                                }
                                                                companionAfter.push(propertyValue);
                                                            }
                                                            else {
                                                                together.push(propertyValue);
                                                            }
                                                        }
                                                    }
                                                    if (companionBefore) {
                                                        $util.concatArray(fillBefore.objectAnimator, companionBefore);
                                                    }
                                                    if (companionAfter) {
                                                        $util.concatArray(fillAfter.objectAnimator, companionAfter);
                                                    }
                                                }
                                            }
                                        }
                                        else if ($SvgBuild.isAnimate(item)) {
                                            let resetBefore = checkBefore;
                                            let repeatCount: string;
                                            if (section === 1) {
                                                repeatCount = partition.length > 1 ? '0' : '-1';
                                            }
                                            else {
                                                repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                            }
                                            const options = this.createPropertyValue('', '', item.duration.toString(), valueType, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                            if (item.keySplines === undefined) {
                                                if (item.timingFunction) {
                                                    options.interpolator = createPathInterpolator(item.timingFunction);
                                                }
                                                else if (this.options.animateInterpolator !== '') {
                                                    options.interpolator = this.options.animateInterpolator;
                                                }
                                            }
                                            const beforeValues: string[] = [];
                                            let propertyNames: string[] | undefined;
                                            let values: string[] | number[][] | undefined;
                                            if (!synchronized && options.valueType === 'pathType') {
                                                if (group.pathData) {
                                                    let transforms: SvgTransform[] | undefined;
                                                    let companion: $SvgShape | undefined;
                                                    if (item.parent && $SvgBuild.isShape(item.parent)) {
                                                        companion = item.parent;
                                                        if (item.parent.path) {
                                                            transforms = item.parent.path.transformed;
                                                        }
                                                    }
                                                    propertyNames = ['pathData'];
                                                    values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, this.options.floatPrecisionValue);
                                                }
                                            }
                                            else if ($SvgBuild.asAnimateTransform(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                if (propertyNames && values) {
                                                    if (checkBefore && item.keyTimes[0] === 0) {
                                                        resetBefore = false;
                                                    }
                                                    if (resetBefore || requireBefore) {
                                                        $util.concatArray(beforeValues, $util.objectMap<string, string>(propertyNames, value => getTransformInitialValue(value) || '0'));
                                                    }
                                                    transformOrigin = item.transformOrigin;
                                                }
                                                transforming = true;
                                            }
                                            else if ($SvgBuild.asAnimateMotion(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                if (propertyNames && values) {
                                                    const rotateValues = item.rotateValues;
                                                    if (rotateValues && rotateValues.length === values.length) {
                                                        propertyNames.push('rotation');
                                                        for (let i = 0; i < values.length; i++) {
                                                            values[i].push(rotateValues[i]);
                                                        }
                                                    }
                                                }
                                                transforming = true;
                                            }
                                            else {
                                                propertyNames = getAttributePropertyName(item.attributeName);
                                                switch (options.valueType) {
                                                    case 'intType':
                                                        values = $util.objectMap<string, string>(item.values, value => $util.convertInt(value).toString());
                                                        if (requireBefore && item.baseValue) {
                                                            $util.concatArray(beforeValues, $util.replaceMap<number, string>($SvgBuild.parseCoordinates(item.baseValue), value => Math.trunc(value).toString()));
                                                        }
                                                        break;
                                                    case 'floatType':
                                                        if (item.attributeName === 'stroke-dasharray') {
                                                            values = $util.objectMap<string, number[]>(item.values, value => $util.replaceMap<string, number>(value.split(' '), fraction => parseFloat(fraction)));
                                                        }
                                                        else {
                                                            values = item.values;
                                                        }
                                                        if (requireBefore && item.baseValue) {
                                                            $util.concatArray(beforeValues, $util.replaceMap<number, string>($SvgBuild.parseCoordinates(item.baseValue), value => value.toString()));
                                                        }
                                                        break;
                                                    default:
                                                        values = item.values.slice(0);
                                                        if (isColorType(item.attributeName)) {
                                                            if (requireBefore && item.baseValue) {
                                                                $util.concatArray(beforeValues, getColorValue<true>(item.baseValue, true));
                                                            }
                                                            for (let i = 0; i < values.length; i++) {
                                                                if (values[i] !== '') {
                                                                    values[i] = getColorValue(values[i]);
                                                                }
                                                            }
                                                        }
                                                        break;
                                                }
                                            }
                                            if (values && propertyNames) {
                                                const keyName = item.synchronized ? item.synchronized.key + item.synchronized.value :
                                                                                    index !== 0 || propertyNames.length > 1 ? JSON.stringify(options) : '';
                                                const keyTimes = item.keyTimes;
                                                for (let i = 0; i < propertyNames.length; i++) {
                                                    const propertyName = propertyNames[i];
                                                    if (resetBefore) {
                                                        resetBeforeValue(propertyName, beforeValues[i]);
                                                    }
                                                    if (useKeyFrames && keyTimes.length > 1) {
                                                        if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                            if (!resetBefore && requireBefore) {
                                                                resetBeforeValue(propertyName, beforeValues[i]);
                                                            }
                                                            const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                            const keyframe: KeyFrame[] = [];
                                                            for (let j = 0; j < keyTimes.length; j++) {
                                                                let value = getPropertyValue(values, j, i, true);
                                                                if (value !== '') {
                                                                    value = $math.truncateString(value, this.options.floatPrecisionValue);
                                                                }
                                                                keyframe.push({
                                                                    interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                                    fraction: keyTimes[j] === 0 && value === '' ? '' : $math.truncate(keyTimes[j], this.options.floatPrecisionKeyTime),
                                                                    value
                                                                });
                                                            }
                                                            propertyValuesHolder.push({ propertyName, keyframe });
                                                            if (!animatorMap.has(keyName)) {
                                                                if (keyName !== '') {
                                                                    animatorMap.set(keyName, propertyValuesHolder);
                                                                }
                                                                (section === 0 ? repeating : fillCustom).objectAnimator.push({ ...options, propertyValuesHolder });
                                                            }
                                                            transformOrigin = undefined;
                                                        }
                                                        else {
                                                            ordering = 'sequentially';
                                                            const translateData = getFillData('sequentially');
                                                            const objectAnimator = repeating.objectAnimator;
                                                            for (let j = 0; j < keyTimes.length; j++) {
                                                                const propertyOptions: PropertyValue = {
                                                                    ...options,
                                                                    propertyName,
                                                                    startOffset: j === 0 ? (item.delay + (keyTimes[j] > 0 ? Math.floor(keyTimes[j] * item.duration) : 0)).toString() : '',
                                                                    propertyValuesHolder: false
                                                                };
                                                                let valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                                if (valueTo) {
                                                                    let duration: number;
                                                                    if (j === 0) {
                                                                        if (!checkBefore && requireBefore) {
                                                                            propertyOptions.valueFrom = beforeValues[i];
                                                                        }
                                                                        else if (options.valueType === 'pathType') {
                                                                            propertyOptions.valueFrom = group.pathData || values[0].toString();
                                                                        }
                                                                        else {
                                                                            propertyOptions.valueFrom = item.baseValue || item.replaceValue || '';
                                                                        }
                                                                        duration = 0;
                                                                    }
                                                                    else {
                                                                        propertyOptions.valueFrom = getPropertyValue(values, j - 1, i).toString();
                                                                        duration = Math.floor((keyTimes[j] - keyTimes[j - 1]) * item.duration);
                                                                    }
                                                                    if (options.valueType === 'floatType') {
                                                                        valueTo = $math.truncateString(valueTo, this.options.floatPrecisionValue);
                                                                    }
                                                                    if (transformOrigin && transformOrigin[j]) {
                                                                        let direction: string | undefined;
                                                                        let translateTo = 0;
                                                                        if (propertyName.endsWith('X')) {
                                                                            direction = 'translateX';
                                                                            translateTo = transformOrigin[j].x;
                                                                        }
                                                                        else if (propertyName.endsWith('Y')) {
                                                                            direction = 'translateY';
                                                                            translateTo = transformOrigin[j].y;
                                                                        }
                                                                        if (direction) {
                                                                            const valueData = this.createPropertyValue(direction, $math.truncate(translateTo, this.options.floatPrecisionValue), duration.toString(), 'floatType');
                                                                            valueData.interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
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
                                                        if (Array.isArray(values[0])) {
                                                            const valueTo = values[values.length - 1][i];
                                                            if (values.length > 1) {
                                                                const from = values[0][i];
                                                                if (from !== valueTo) {
                                                                    propertyOptions.valueFrom = from.toString();
                                                                }
                                                            }
                                                            propertyOptions.valueTo = valueTo.toString();
                                                        }
                                                        else {
                                                            let valueFrom: string | undefined;
                                                            if (values.length > 1) {
                                                                valueFrom = values[0].toString();
                                                                propertyOptions.valueTo = values[values.length - 1].toString();
                                                            }
                                                            else {
                                                                valueFrom = item.from || (!checkBefore && requireBefore ? beforeValues[i] : '');
                                                                propertyOptions.valueTo = item.to;
                                                            }
                                                            if (options.valueType === 'pathType') {
                                                                propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                            }
                                                            else if (valueFrom && valueFrom !== propertyOptions.valueTo) {
                                                                propertyOptions.valueFrom = convertValueType(item, valueFrom);
                                                            }
                                                        }
                                                        if (propertyOptions.valueTo) {
                                                            if (options.valueType === 'floatType') {
                                                                propertyOptions.valueTo = $math.truncateString(propertyOptions.valueTo, this.options.floatPrecisionValue);
                                                            }
                                                            (section === 0 ? repeating : fillCustom).objectAnimator.push(propertyOptions);
                                                        }
                                                    }
                                                    if (section === 0 && !synchronized && item.iterationCount !== -1) {
                                                        insertFillAfter(propertyName, repeating.objectAnimator);
                                                    }
                                                }
                                                if (requireBefore && transformOrigin && transformOrigin.length) {
                                                    resetBeforeValue('translateX', '0');
                                                    resetBeforeValue('translateY', '0');
                                                }
                                            }
                                        }
                                    }
                                });
                                const valid = repeating.objectAnimator.length > 0 || fillCustom.objectAnimator.length > 0;
                                if (ordering === 'sequentially') {
                                    if (valid && fillBefore.objectAnimator.length === 1) {
                                        repeating.objectAnimator.unshift(fillBefore.objectAnimator[0]);
                                        fillBefore.objectAnimator.length = 0;
                                    }
                                    if (fillCustom.objectAnimator.length === 1) {
                                        repeating.objectAnimator.push(fillCustom.objectAnimator[0]);
                                        fillCustom.objectAnimator.length = 0;
                                    }
                                    if (valid && fillAfter.objectAnimator.length === 1) {
                                        repeating.objectAnimator.push(fillAfter.objectAnimator[0]);
                                        fillAfter.objectAnimator.length = 0;
                                    }
                                }
                                if (fillBefore.objectAnimator.length === 0 && fillCustom.objectAnimator.length === 0 && fillAfter.objectAnimator.length === 0) {
                                    if (ordering === 'sequentially' && repeating.objectAnimator.length === 1) {
                                        ordering = '';
                                    }
                                    if (setData.ordering !== 'sequentially' && ordering !== 'sequentially') {
                                        $util.concatArray(together, repeating.objectAnimator);
                                        repeating.objectAnimator.length = 0;
                                    }
                                }
                                if (repeating.objectAnimator.length || fillCustom.objectAnimator.length) {
                                    if (fillBefore.objectAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillBefore);
                                    }
                                    if (repeating.objectAnimator.length) {
                                        repeating.ordering = ordering;
                                        setData.set.push(repeating);
                                    }
                                    if (fillCustom.objectAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillCustom);
                                    }
                                    if (fillAfter.objectAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillAfter);
                                    }
                                }
                                if (together.length) {
                                    $util.concatArray(setData.objectAnimator, together);
                                }
                            }
                            if (setData.set.length || setData.objectAnimator.length) {
                                targetSetTemplate.set.push(setData);
                            }
                        });
                        insertTargetAnimation(name, targetSetTemplate);
                    }
                    for (const [name, target] of this.ANIMATE_TARGET.entries()) {
                        let objectAnimator: PropertyValue[] | undefined;
                        const insertResetValue = (propertyName: string, valueTo: string, valueType: string, valueFrom?: string, startOffset?: string) => {
                            if (objectAnimator === undefined) {
                                objectAnimator = [];
                            }
                            objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '0', valueType, valueFrom, startOffset));
                        };
                        for (const item of target.animate) {
                            if ($SvgBuild.asAnimateMotion(item)) {
                                if (item.parent && $SvgBuild.isShape(item.parent)) {
                                    const path = item.parent.path;
                                    if (path && path.value !== path.baseValue) {
                                        insertResetValue('pathData', path.baseValue, 'pathType', path.value);
                                        if (item.iterationCount !== -1 && !item.setterType) {
                                            insertResetValue('pathData', path.value, 'pathType', path.baseValue, item.getTotalDuration().toString());
                                        }
                                    }
                                }
                            }
                        }
                        if (objectAnimator) {
                            insertTargetAnimation(name, {
                                set: [{ set: undefined as any, objectAnimator }],
                                objectAnimator: undefined as any
                            });
                        }
                    }
                    if (data[0].target) {
                        vectorName = Resource.insertStoredAsset(
                            'drawables',
                            getFilename('anim'),
                            $xml.applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data)
                        );
                    }
                }
                if (this.IMAGE_DATA.length) {
                    const item: ExternalData[] = [];
                    if (vectorName !== '') {
                        item.push({ drawable: getDrawableSrc(vectorName) });
                    }
                    const data: ExternalData[] = [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        item
                    }];
                    for (const image of this.IMAGE_DATA) {
                        const scaleX = svg.width / svg.viewBox.width;
                        const scaleY = svg.height / svg.viewBox.height;
                        let x = image.getBaseValue('x', 0) * scaleX;
                        let y = image.getBaseValue('y', 0) * scaleY;
                        let width: number = image.getBaseValue('width', 0);
                        let height: number = image.getBaseValue('height', 0);
                        const offset = getParentOffset(image.element, <SVGSVGElement> svg.element);
                        x += offset.x;
                        y += offset.y;
                        width *= scaleX;
                        height *= scaleY;
                        const imageData: ExternalData = {
                            width: $css.formatPX(width),
                            height: $css.formatPX(height),
                            left: x !== 0 ? $css.formatPX(x) : '',
                            top: y !== 0 ? $css.formatPX(y) : ''
                        };
                        const src = getDrawableSrc(Resource.addImage({ mdpi: image.href }));
                        if (image.rotateAngle) {
                            imageData.rotate = {
                                drawable: src,
                                fromDegrees: image.rotateAngle.toString(),
                                visible: image.visible ? 'true' : 'false'
                            };
                        }
                        else {
                            imageData.drawable = src;
                        }
                        item.push(imageData);
                    }
                    drawable = Resource.insertStoredAsset(
                        'drawables',
                        templateName,
                        $xml.applyTemplate('layer-list', LAYERLIST_TMPL, data)
                    );
                }
                else {
                    drawable = vectorName;
                }
                if (drawable !== '') {
                    if (node.localSettings.targetAPI >= BUILD_ANDROID.LOLLIPOP) {
                        node.android('src', getDrawableSrc(drawable));
                    }
                    else {
                        node.app('srcCompat', getDrawableSrc(drawable));
                    }
                }
                if (!node.hasWidth) {
                    node.android('layout_width', 'wrap_content');
                }
                if (!node.hasHeight) {
                    node.android('layout_height', 'wrap_content');
                }
            }
        }
    }

    public afterFinalize() {
        this.application.controllerHandler.localSettings.svg.enabled = false;
    }

    private parseVectorData(group: SvgGroup, depth = 0) {
        const result = this.createGroup(group);
        const renderDepth = depth + result.length;
        let output = '';
        for (const item of group) {
            if (item.visible) {
                if ($SvgBuild.isShape(item)) {
                    if (item.path && item.path.value) {
                        const [path, groupArray] = this.createPath(item, item.path);
                        const pathArray: PathData[] = [];
                        if (item.path.strokeWidth && (item.path.strokeDasharray || item.path.strokeDashoffset)) {
                            const animateData = this.ANIMATE_DATA.get(item.name);
                            if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                const [strokeDash, pathData, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, this.options.floatPrecisionValue);
                                if (strokeDash) {
                                    const name = getVectorName(item, 'stroke');
                                    const strokeData: TransformData = { name };
                                    if (pathData !== '') {
                                        path.pathData = pathData;
                                    }
                                    if (clipPathData !== '') {
                                        strokeData['clip-path'] = [{ pathData: clipPathData }];
                                    }
                                    for (let i = 0; i < strokeDash.length; i++) {
                                        const strokePath = i === 0 ? path : { ...path };
                                        strokePath.name = `${name}_${i}`;
                                        if (animateData) {
                                            this.ANIMATE_DATA.set(strokePath.name, {
                                                element: animateData.element,
                                                animate: $util.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                            });
                                        }
                                        strokePath.trimPathStart = $math.truncate(strokeDash[i].start, this.options.floatPrecisionValue);
                                        strokePath.trimPathEnd = $math.truncate(strokeDash[i].end, this.options.floatPrecisionValue);
                                        pathArray.push(strokePath);
                                    }
                                    groupArray.unshift(strokeData);
                                    if (animateData) {
                                        this.ANIMATE_DATA.delete(item.name);
                                    }
                                }
                            }
                        }
                        if (pathArray.length === 0) {
                            pathArray.push(path);
                        }
                        if (groupArray.length) {
                            const enclosing = groupArray[groupArray.length - 1];
                            enclosing.path = pathArray;
                            output += $xml.applyTemplate('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                        }
                        else {
                            output += $xml.applyTemplate('path', VECTOR_PATH, pathArray, renderDepth + 1);
                        }
                    }
                }
                else if ($SvgBuild.isContainer(item)) {
                    if (item.length) {
                        output += this.parseVectorData(<SvgGroup> item, renderDepth);
                    }
                }
                else if ($SvgBuild.asImage(item)) {
                    if (!$SvgBuild.asPattern(group)) {
                        if (item.width === 0 || item.height === 0) {
                            const image = this.application.resourceHandler.getImage(item.href);
                            if (image && image.width > 0 && image.height > 0) {
                                item.width = image.width;
                                item.height = image.height;
                                item.setRect();
                            }
                        }
                        item.extract(this.options.transformExclude.image);
                        this.IMAGE_DATA.push(item);
                    }
                }
            }
        }
        if (result.length) {
            result[result.length - 1].include = output;
            return $xml.applyTemplate('group', VECTOR_GROUP, result, depth + 1);
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
        if ((target !== this.SVG_INSTANCE && $SvgBuild.asSvg(target) || $SvgBuild.asUseSymbol(target) || $SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
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
        if (target !== this.SVG_INSTANCE) {
            const baseData: TransformData = {};
            const [transforms] = groupTransforms(target.element, target.transforms, true);
            const groupName = getVectorName(target, 'animate');
            if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util.isString(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
                baseData.name = groupName;
            }
            if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
                baseData.name = groupName;
            }
            if (Object.keys(baseData).length) {
                Object.assign(groupBox, baseData);
                result.push(groupBox);
            }
            if (transforms.length) {
                const transformed: SvgTransform[] = [];
                for (const data of transforms) {
                    result.push(createTransformData(data));
                    $util.concatArray(transformed, data);
                }
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(target: $SvgShape, path: $SvgPath): [PathData, VectorGroupData[]] {
        const result: PathData = { name: target.name };
        const renderData: VectorGroupData[] = [];
        const clipElement: StringMap[] = [];
        if ($SvgBuild.asUse(target) && $util.isString(target.clipPath)) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if ($util.isString(path.clipPath)) {
            const shape = new $SvgShape(path.element);
            shape.build({
                exclude: this.options.transformExclude,
                residual: partitionTransforms,
                precision: this.options.floatPrecisionValue
            });
            shape.synchronize({
                keyTimeMode: this.SYNCHRONIZE_MODE,
                precision: this.options.floatPrecisionValue
            });
            this.createClipPath(shape, clipElement, path.clipPath);
        }
        const baseData: VectorGroupData = {};
        const groupName = getVectorName(target, 'group');
        if (this.queueAnimations(target, groupName, item => $SvgBuild.isAnimateTransform(item), '', target.name)) {
            baseData.name = groupName;
        }
        else if (clipElement.length) {
            baseData.name = '';
        }
        if ($SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
            baseData.translateX = target.x.toString();
            baseData.translateY = target.y.toString();
        }
        if (clipElement.length) {
            baseData['clip-path'] = clipElement;
        }
        if (Object.keys(baseData).length) {
            renderData.push(baseData);
        }
        if (path.transformResidual) {
            for (const item of path.transformResidual) {
                renderData.push(createTransformData(item));
            }
        }
        const opacity = getOuterOpacity(target);
        const useTarget = $SvgBuild.asUse(target);
        for (let attr in path) {
            let value = useTarget ? target[attr] || path[attr] : path[attr];
            if ($util.isString(value)) {
                switch (attr) {
                    case 'name':
                        break;
                    case 'value':
                        attr = 'pathData';
                        break;
                    case 'fill':
                    case 'stroke':
                        attr += 'Color';
                        if (value !== 'none' && (attr === 'stroke' || result['aapt:attr'] === undefined)) {
                            const colorName = Resource.addColor(value);
                            if (colorName !== '') {
                                value = `@color/${colorName}`;
                            }
                        }
                        else {
                            continue;
                        }
                        break;
                    case 'fillPattern':
                        const definition = this.SVG_INSTANCE.definitions.gradient.get(value);
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
                                    const gradient = createFillGradient(definition, path, this.options.floatPrecisionValue);
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
                            this.NAMESPACE_AAPT = true;
                        }
                        else {
                            continue;
                        }
                        break;
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
                        value = (($util.isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
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
        const replaceMap = new Map<number, FillReplace>();
        const transformResult: $SvgAnimate[] = [];
        const replaceResult: $SvgAnimate[] = [];
        const pathData = path.value;
        let previousPathData = pathData;
        let index = 0;
        for (const item of target.animations) {
            if ($SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                let time = Math.max(0, item.delay - 1);
                replaceMap.set(time, {
                    index,
                    time,
                    to: item.transformFrom,
                    reset: false,
                    animate: item
                });
                if (item.iterationCount !== -1 && item.fillReplace) {
                    time = item.delay + item.iterationCount * item.duration;
                    if (!replaceMap.has(time)) {
                        replaceMap.set(time, {
                            index,
                            time,
                            to: pathData,
                            reset: true
                        });
                    }
                }
                index++;
            }
        }
        const replaceData = Array.from(replaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
        for (let i = 0; i < replaceData.length; i++) {
            const item = replaceData[i];
            if (!item.reset || item.to !== previousPathData) {
                let valid = true;
                if (item.reset) {
                    invalid: {
                        for (let j = 0; j < i; j++) {
                            const previous = replaceData[j];
                            if (!previous.reset) {
                                for (let k = i + 1; k < replaceData.length; k++) {
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
                    for (let j = 0; j < itemTotal.length; j++) {
                        if (itemTotal[j] === 1) {
                            const transform = replaceData.find(data => data.index === j && data.animate !== undefined);
                            if (transform && transform.animate) {
                                previousType.add(transform.animate.type);
                            }
                        }
                    }
                    for (const type of previousType) {
                        const propertyName = getTransformPropertyName(type);
                        if (propertyName) {
                            const initialValue = $utilS.TRANSFORM.typeAsValue(type).split(' ');
                            for (let j = 0; j < initialValue.length; j++) {
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
        if (!this.queueAnimations(target, result.name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
            if (baseData.name !== groupName) {
                result.name = '';
            }
        }
        if (transformResult.length) {
            const data = this.ANIMATE_DATA.get(groupName);
            if (data) {
                $util.concatArray(data.animate, transformResult);
            }
        }
        if (replaceResult.length) {
            const data = this.ANIMATE_DATA.get(result.name);
            if (data) {
                $util.concatArray(data.animate, replaceResult);
            }
            else {
                this.ANIMATE_DATA.set(result.name, {
                    element: target.element,
                    animate: replaceResult,
                    pathData
                });
            }
        }
        return [result, renderData];
    }

    private createClipPath(target: SvgView, clipArray: StringMap[], clipPath: string) {
        let result = 0;
        clipPath.split(';').forEach((value, index, array) => {
            if (value.charAt(0) === '#') {
                const element = this.SVG_INSTANCE.definitions.clipPath.get(value);
                if (element) {
                    const g = new $SvgG(element);
                    g.build({
                        exclude: this.options.transformExclude,
                        residual: partitionTransforms,
                        precision: this.options.floatPrecisionValue
                    });
                    g.synchronize({
                        keyTimeMode: this.SYNCHRONIZE_MODE,
                        precision: this.options.floatPrecisionValue
                    });
                    g.each((child: $SvgShape) => {
                        if (child.path && child.path.value) {
                            let name = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                            if (!this.queueAnimations(child, name, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), child.path.value)) {
                                name = '';
                            }
                            clipArray.push({ name, pathData: child.path.value });
                        }
                    });
                }
                result++;
            }
            else {
                let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                if (!this.queueAnimations(target, name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
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
            const animate = $util.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
            if (animate.length) {
                this.ANIMATE_DATA.set(name, {
                    element: svg.element,
                    animate,
                    pathData
                });
                if (targetName) {
                    this.ANIMATE_TARGET.set(targetName, {
                        element: svg.element,
                        animate,
                        pathData
                    });
                }
                return true;
            }
        }
        return false;
    }

    private createPropertyValue(propertyName: string, valueTo: string, duration: string, valueType: string, valueFrom = '', startOffset = '', repeatCount = '0'): PropertyValue {
        return {
            propertyName,
            startOffset,
            duration,
            repeatCount,
            valueType,
            valueFrom: $util.isNumber(valueFrom) ? $math.truncateString(valueFrom, this.options.floatPrecisionValue) : valueFrom,
            valueTo: $util.isNumber(valueTo) ? $math.truncateString(valueTo, this.options.floatPrecisionValue) : valueTo,
            propertyValuesHolder: false
        };
    }
}