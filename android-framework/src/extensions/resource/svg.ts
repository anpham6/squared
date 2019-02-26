import { TemplateData, TemplateDataA, TemplateDataAA, TemplateDataAAA } from '../../../../src/base/@types/application';
import { SvgMatrix, SvgPoint, SvgTransform } from '../../../../src/svg/@types/object';
import { ResourceStoredMapAndroid } from '../../@types/application';
import { ResourceSvgOptions } from '../../@types/extension';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID } from '../../lib/enumeration';
import { getXmlNs } from '../../lib/util';

import ANIMATEDVECTOR_TMPL from '../../template/resource/embedded/animated-vector';
import LAYERLIST_TMPL from '../../template/resource/embedded/layer-list';
import SETOBJECTANIMATOR_TMPL from '../../template/resource/embedded/set-objectanimator';
import VECTOR_TMPL from '../../template/resource/embedded/vector';

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

interface AnimatedTargetData extends TemplateDataAA {
    name: string;
    animationName?: string;
}

interface SetOrdering {
    name?: string;
    ordering?: string;
}

interface GroupTemplateData extends TemplateDataAA {
    region: TransformData[][];
    clipRegion: StringMap[];
    path: TransformData[][];
    clipPath: StringMap[];
    BB: TemplateData[];
}

interface SetTemplateData extends SetOrdering, TemplateDataAA {
    AA: AnimatorTemplateData<boolean>[];
    BB: TogetherTemplateData[];
}

interface AnimatorTemplateData<T> extends SetOrdering, TemplateDataAAA {
    fillBefore: T extends true ? FillTemplateData[] : false;
    repeating: PropertyValue[];
    fillCustom: T extends true ? FillTemplateData[] : false;
    fillAfter: T extends true ? FillTemplateData[] : false;
}

interface FillTemplateData extends SetOrdering, ExternalData {
    values: PropertyValue[];
}

interface TogetherTemplateData extends SetOrdering, ExternalData {
    together: PropertyValue[];
}

interface PathTemplateData extends Partial<$SvgPath> {
    name: string;
    clipElement: StringMap[];
    fillPattern: any;
    trimPathStart?: string;
    trimPathEnd?: string;
    trimPathOffset?: string;
}

interface TransformData {
    groupName?: string;
    translateX?: string;
    translateY?: string;
    scaleX?: string;
    scaleY?: string;
    rotation?: string;
    pivotX?: string;
    pivotY?: string;
}

interface AnimateGroup {
    element: SVGGraphicsElement;
    animate: SvgAnimation[];
    pathData?: string;
}

interface PropertyValueHolder {
    propertyName: string;
    keyframes: KeyFrame[];
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
    propertyValues: PropertyValueHolder[] | boolean;
}

interface FillReplace {
    index: number;
    time: number;
    to: string;
    reset: boolean;
    animate?: $SvgAnimateTransform;
}

type AnimateCompanion = NumberValue<SvgAnimation>;

const $util = squared.lib.util;
const $math = squared.lib.math;
const $xml = squared.lib.xml;
const $constS = squared.svg.lib.constant;
const $utilS = squared.svg.lib.util;

const TEMPLATES: ObjectMap<StringMap> = {};
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
	android:controlY2="{3}" />`;

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

function getPathInterpolator(keySplines: string[] | undefined, index: number) {
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

function getVectorName(target: SvgView, section: string, index = -1) {
    return `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;
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

function createTransformData(transform: SvgTransform[] | null) {
    const result: TransformData = {};
    if (transform) {
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
    let result = parseFloat(target.opacity);
    let current = target.parent;
    while (current) {
        const opacity = parseFloat(current['opacity'] || '1');
        if (!isNaN(opacity) && opacity < 1) {
            result *= opacity;
        }
        current = current['parent'];
    }
    return result;
}

function partitionTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length && ($utilS.SVG.circle(element) || $utilS.SVG.ellipse(element))) {
        const index = transforms.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
        if (index !== -1 && (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
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
    let result: string | undefined;
    const value = values[index];
    if (value) {
        result = Array.isArray(value) ? value[propertyIndex].toString() : value;
    }
    else if (!keyFrames && index === 0) {
        result = baseValue;
    }
    return result || '';
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
    result.from = from !== undefined ? from : to;
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

function getTransformValues(item: $SvgAnimateTransform) {
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

function isColorType(attr: string) {
    return attr === 'fill' || attr === 'stroke';
}

function getColorValue<T>(value: string, asArray = false) {
    const name = Resource.addColor(value);
    value = name !== '' ? `@color/${name}` : '';
    return (asArray ? [value] : value) as T extends true ? string[] : string;
}

function convertValueType<T = string | string[]>(item: SvgAnimation, value: string) {
    if (isColorType(item.attributeName)) {
        return getColorValue<T>(value);
    }
    return value.trim() || undefined;
}

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

    private NODE_INSTANCE!: T;
    private SVG_INSTANCE!: $Svg;
    private VECTOR_DATA = new Map<string, GroupTemplateData>();
    private ANIMATE_DATA = new Map<string, AnimateGroup>();
    private IMAGE_DATA: SvgImage[] = [];
    private SYNCHRONIZE_MODE = 0;
    private NAMESPACE_AAPT = false;

    public beforeInit() {
        if ($SvgBuild) {
            if (TEMPLATES.ANIMATED === undefined) {
                TEMPLATES.ANIMATED = $xml.parseTemplate(ANIMATEDVECTOR_TMPL);
                TEMPLATES.LAYER_LIST = $xml.parseTemplate(LAYERLIST_TMPL);
                TEMPLATES.SET_OBJECTANIMATOR = $xml.parseTemplate(SETOBJECTANIMATOR_TMPL);
            }
            $SvgBuild.setName();
            this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
        }
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement) {
                const svg = new $Svg(<SVGSVGElement> node.element);
                const supportedKeyFrames = node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW;
                this.NODE_INSTANCE = node;
                this.SVG_INSTANCE = svg;
                this.VECTOR_DATA.clear();
                this.ANIMATE_DATA.clear();
                this.IMAGE_DATA.length = 0;
                this.NAMESPACE_AAPT = false;
                this.SYNCHRONIZE_MODE = $constS.SYNCHRONIZE_MODE.FROMTO_ANIMATE | (supportedKeyFrames ? $constS.SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : $constS.SYNCHRONIZE_MODE.IGNORE_TRANSFORM);
                svg.build(this.options.transformExclude, partitionTransforms, this.options.floatPrecisionValue);
                svg.synchronize(this.SYNCHRONIZE_MODE, this.options.floatPrecisionValue);
                this.parseVectorData(svg);
                this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
                const templateName = $util.convertWord(`${node.tagName}_${node.controlId}_viewbox`, true).toLowerCase();
                const getFilename = (prefix = '', suffix = '') => templateName + (prefix !== '' ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix !== '' ? `_${suffix.toLowerCase()}` : '');
                let drawable = '';
                let vectorName = '';
                {
                    const template = $xml.parseTemplate(VECTOR_TMPL);
                    let xml = $xml.createTemplate(template, <TemplateDataA> {
                        namespace: this.NAMESPACE_AAPT ? getXmlNs('aapt') : '',
                        name: svg.name,
                        width: $util.formatPX(svg.width),
                        height: $util.formatPX(svg.height),
                        viewportWidth: (svg.viewBox.width || svg.width).toString(),
                        viewportHeight: (svg.viewBox.height || svg.height).toString(),
                        alpha: parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                        A: [],
                        B: [{ templateName: svg.name }]
                    });
                    const output = new Map<string, string>();
                    template['__ROOT__'] = template['A'];
                    for (const [name, data] of this.VECTOR_DATA.entries()) {
                        output.set(name, $xml.createTemplate(template, data));
                    }
                    const entries = Array.from(output.entries()).reverse();
                    for (let i = 0; i < entries.length; i++) {
                        let partial = entries[i][1];
                        for (let j = i; j < entries.length; j++) {
                            const hash = `!!${entries[j][0]}!!`;
                            if (partial.indexOf(hash) !== -1) {
                                partial = partial.replace(hash, entries[j][1]);
                                break;
                            }
                        }
                        xml = xml.replace(`!!${entries[i][0]}!!`, partial);
                    }
                    xml = $xml.formatTemplate(xml);
                    vectorName = Resource.getStoredName('drawables', xml);
                    if (vectorName === '') {
                        vectorName = getFilename();
                        STORED.drawables.set(vectorName, xml);
                    }
                }
                if (this.ANIMATE_DATA.size) {
                    const data: TemplateDataA = { vectorName, A: []
                    };
                    for (const [name, group] of this.ANIMATE_DATA.entries()) {
                        const targetData: AnimatedTargetData = { name };
                        const targetSetData: TemplateDataA = { A: [] };
                        const sequentialMap = new Map<string, $SvgAnimate[]>();
                        const transformMap = new Map<string, $SvgAnimateTransform[]>();
                        const together: SvgAnimation[] = [];
                        const isolated: SvgAnimation[] = [];
                        const togetherTargets: SvgAnimation[][] = [];
                        const isolatedTargets: SvgAnimation[][][] = [];
                        const transformTargets: SvgAnimation[][] = [];
                        const [companions, groupAnimate] = $util.partitionArray(group.animate, child => child.companion !== undefined);
                        for (let i = 0; i < groupAnimate.length; i++) {
                            const item = groupAnimate[i];
                            if (item.setterType) {
                                if (ATTRIBUTE_ANDROID[item.attributeName] && $util.hasValue(item.to)) {
                                    if (item.duration > 0 && item.fillReplace) {
                                        isolated.push(item);
                                    }
                                    else {
                                        together.push(item);
                                    }
                                }
                            }
                            else if ($SvgBuild.isAnimate(item)) {
                                const children = $util.filterArray(companions, child => (<AnimateCompanion> child.companion).value === item);
                                if (children.length) {
                                    children.sort((a, b) => (<AnimateCompanion> a.companion).index >= (<AnimateCompanion> b.companion).index ? 1 : 0);
                                    const sequentially: SvgAnimation[] = [];
                                    const after: SvgAnimation[] = [];
                                    for (const child of children) {
                                        if ((<AnimateCompanion> child.companion).index <= 0) {
                                            sequentially.push(child);
                                        }
                                        else {
                                            after.push(child);
                                        }
                                    }
                                    sequentially.push(item);
                                    sequentially.push(...after);
                                    sequentialMap.set(`sequentially_companion_${i}`, <$SvgAnimate[]> sequentially);
                                }
                                else {
                                    const synchronized = item.synchronized;
                                    if (synchronized) {
                                        if ($SvgBuild.asAnimateTransform(item)) {
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
                                    else if ($SvgBuild.asAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    else if (item.iterationCount === -1) {
                                        isolated.push(item);
                                    }
                                    else if ((!item.fromToType || $SvgBuild.asAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
                                        togetherTargets.push([item]);
                                    }
                                    else if (item.fillReplace) {
                                        isolated.push(item);
                                    }
                                    else {
                                        together.push(item);
                                    }
                                }
                            }
                        }
                        if (together.length) {
                            togetherTargets.push(together);
                        }
                        for (const [keyName, item] of sequentialMap.entries()) {
                            if (keyName.startsWith('sequentially_companion')) {
                                togetherTargets.push(item);
                            }
                            else {
                                togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                            }
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                        }
                        for (const item of isolated) {
                            isolatedTargets.push([[item]]);
                        }
                        [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                            const setData: SetTemplateData = {
                                ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                                AA: [],
                                BB: []
                            };
                            for (const items of targets) {
                                let ordering: string;
                                let synchronized: boolean;
                                let fillBefore: boolean;
                                let useKeyFrames: boolean;
                                if (index <= 1 && items.some((item: $SvgAnimate) => item.synchronized !== undefined && item.synchronized.value !== '')) {
                                    ordering = $SvgBuild.asAnimateTransform(items[0]) ? '' : 'sequentially';
                                    synchronized = true;
                                    fillBefore = false;
                                    useKeyFrames = false;
                                }
                                else if (index <= 1 && items.some((item: $SvgAnimate) => item.synchronized !== undefined && item.synchronized.value === '')) {
                                    ordering = 'sequentially';
                                    synchronized = true;
                                    fillBefore = true;
                                    useKeyFrames = true;
                                }
                                else if (index <= 1 && items.some(item => item.companion !== undefined)) {
                                    ordering = 'sequentially';
                                    synchronized = false;
                                    fillBefore = false;
                                    useKeyFrames = true;
                                }
                                else {
                                    ordering = index === 0 ? '' : 'sequentially';
                                    synchronized = false;
                                    fillBefore = index > 1 && $SvgBuild.asAnimateTransform(items[0]);
                                    useKeyFrames = true;
                                }
                                const animatorData: AnimatorTemplateData<true> = {
                                    ordering,
                                    fillBefore: [],
                                    repeating: [],
                                    fillCustom: [],
                                    fillAfter: []
                                };
                                const fillBeforeData: FillTemplateData = { values: [] };
                                const fillCustomData: FillTemplateData = { values: [] };
                                const fillAfterData: FillTemplateData = { values: [] };
                                const togetherData: TogetherTemplateData = { together: [] };
                                (synchronized ? $util.partitionArray(items, (animate: $SvgAnimate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                    if (section === 1 && partition.length > 1) {
                                        fillCustomData.ordering = 'sequentially';
                                    }
                                    const animatorMap = new Map<string, PropertyValueHolder[]>();
                                    for (const item of partition) {
                                        const valueType = getValueType(item.attributeName);
                                        if (valueType === undefined) {
                                            continue;
                                        }
                                        const insertBeforeValue = (attr: string, value: string) => {
                                            if (value !== '' && fillBeforeData.values.findIndex(before => before.propertyName === attr) === -1) {
                                                fillBeforeData.values.push(this.createPropertyValue(attr, value, '0', valueType));
                                            }
                                        };
                                        const requireBefore = item.delay > 0;
                                        let transforming = false;
                                        let transformOrigin: Point[] | undefined;
                                        const setFillAfter = (propertyName: string, fillAfter: FillTemplateData, propertyValues?: PropertyValue[], startOffset?: number) => {
                                            if (!synchronized && item.fillReplace && valueType !== undefined) {
                                                let valueTo = item.replaceValue;
                                                if (!valueTo) {
                                                    if (transforming) {
                                                        valueTo = getTransformInitialValue(propertyName);
                                                    }
                                                    else if (item.parent && $SvgBuild.isShape(item.parent) && item.parent.path) {
                                                        if (propertyName === 'pathData') {
                                                            valueTo = item.parent.path.value;
                                                        }
                                                        else {
                                                            valueTo = item.parent.path[getPaintAttribute(propertyName)];
                                                        }
                                                    }
                                                    if (!valueTo) {
                                                        valueTo = item.baseValue;
                                                    }
                                                }
                                                let previousValue: string | undefined;
                                                if (propertyValues && propertyValues.length) {
                                                    const lastValue = propertyValues[propertyValues.length - 1];
                                                    if ($util.isArray(lastValue.propertyValues)) {
                                                        const propertyValue = lastValue.propertyValues[lastValue.propertyValues.length - 1];
                                                        previousValue = propertyValue.keyframes[propertyValue.keyframes.length - 1].value;
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
                                                        fillAfter.values.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                                    }
                                                }
                                                if (transformOrigin) {
                                                    if (propertyName.endsWith('X')) {
                                                        fillAfter.values.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                    }
                                                    else if (propertyName.endsWith('Y')) {
                                                        fillAfter.values.push(this.createPropertyValue('translateY', '0', '1', valueType));
                                                    }
                                                }
                                            }
                                        };
                                        if (item.setterType) {
                                            const propertyNames = getAttributePropertyName(item.attributeName);
                                            if (propertyNames) {
                                                const values = isColorType(item.attributeName) ? getColorValue<true>(item.to, true) : item.to.trim().split(' ');
                                                if (values.length === propertyNames.length && !values.some(value => value === '')) {
                                                    let companionBefore: FillTemplateData | undefined;
                                                    let companionAfter: FillTemplateData | undefined;
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
                                                            fillCustomData.values.push(propertyValue);
                                                            setFillAfter(propertyNames[i], fillAfterData, undefined, index > 1 ? item.duration : 0);
                                                        }
                                                        else {
                                                            if (item.companion && item.companion.index <= 0) {
                                                                if (companionBefore === undefined) {
                                                                    companionBefore = { values: [] };
                                                                    animatorData.fillBefore.push(companionBefore);
                                                                }
                                                                companionBefore.values.push(propertyValue);
                                                            }
                                                            else if (item.companion && item.companion.index > 0) {
                                                                if (companionAfter === undefined) {
                                                                    companionAfter = { values: [] };
                                                                    animatorData.fillAfter.push(companionAfter);
                                                                }
                                                                companionAfter.values.push(propertyValue);
                                                            }
                                                            else {
                                                                togetherData.together.push(propertyValue);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if ($SvgBuild.isAnimate(item)) {
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
                                            let propertyNames: string[] | undefined;
                                            let values: string[] | number[][] | undefined;
                                            const beforeValues: string[] = [];
                                            if (!synchronized && options.valueType === 'pathType') {
                                                if (group.pathData) {
                                                    propertyNames = ['pathData'];
                                                    let transforms: SvgTransform[] | undefined;
                                                    let companion: $SvgShape | undefined;
                                                    if (item.parent && $SvgBuild.isShape(item.parent)) {
                                                        companion = item.parent;
                                                        if (item.parent.path) {
                                                            transforms = item.parent.path.transformed;
                                                        }
                                                    }
                                                    values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, companion, transforms, this.options.floatPrecisionValue);
                                                }
                                            }
                                            else if ($SvgBuild.asAnimateTransform(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                if (propertyNames === undefined) {
                                                    continue;
                                                }
                                                values = getTransformValues(item);
                                                if (fillBefore || requireBefore) {
                                                    beforeValues.push(...$util.objectMap<string, string>(propertyNames, value => getTransformInitialValue(value) || '0'));
                                                }
                                                transformOrigin = item.transformOrigin;
                                                transforming = true;
                                            }
                                            else {
                                                propertyNames = getAttributePropertyName(item.attributeName);
                                                switch (options.valueType) {
                                                    case 'intType':
                                                        values = $util.objectMap<string, string>(item.values, value => $util.convertInt(value).toString());
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues.push(...$util.replaceMap<number, string>($SvgBuild.parseCoordinates(item.baseValue), value => Math.trunc(value).toString()));
                                                        }
                                                        break;
                                                    case 'floatType':
                                                        switch (item.attributeName) {
                                                            case 'stroke-dasharray':
                                                                values = $util.objectMap<string, number[]>(item.values, value => $util.replaceMap<string, number>(value.split(' '), fraction => parseFloat(fraction)));
                                                                break;
                                                            default:
                                                                values = item.values;
                                                                break;
                                                        }
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues.push(...$util.replaceMap<number, string>($SvgBuild.parseCoordinates(item.baseValue), value => value.toString()));
                                                        }
                                                        break;
                                                    default:
                                                        values = item.values.slice(0);
                                                        if (isColorType(item.attributeName)) {
                                                            if (requireBefore && item.baseValue) {
                                                                beforeValues.push(...getColorValue<true>(item.baseValue, true));
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
                                                const keyName =  item.synchronized ? item.synchronized.index + item.synchronized.value : (index !== 0 || propertyNames.length > 1 ? JSON.stringify(options) : '');
                                                for (let i = 0; i < propertyNames.length; i++) {
                                                    const propertyName = propertyNames[i];
                                                    if (fillBefore && beforeValues[i]) {
                                                        insertBeforeValue(propertyName, beforeValues[i]);
                                                    }
                                                    if (useKeyFrames && item.keyTimes.length > 1) {
                                                        if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                            if (!fillBefore && requireBefore) {
                                                                insertBeforeValue(propertyName, beforeValues[i]);
                                                            }
                                                            const propertyValues = animatorMap.get(keyName) || [];
                                                            const keyframes: KeyFrame[] = [];
                                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                                let value = getPropertyValue(values, j, i, true);
                                                                if (value !== '') {
                                                                    value = $math.truncateString(value, this.options.floatPrecisionValue);
                                                                }
                                                                keyframes.push({
                                                                    interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                                    fraction: item.keyTimes[j] === 0 && value === '' ? '' : $math.truncateRange(item.keyTimes[j], this.options.floatPrecisionKeyTime),
                                                                    value
                                                                });
                                                            }
                                                            propertyValues.push({ propertyName, keyframes });
                                                            if (!animatorMap.has(keyName)) {
                                                                if (keyName !== '') {
                                                                    animatorMap.set(keyName, propertyValues);
                                                                }
                                                                (section === 0 ? animatorData.repeating : fillCustomData.values).push({ ...options, propertyValues });
                                                            }
                                                            transformOrigin = undefined;
                                                        }
                                                        else {
                                                            animatorData.ordering = 'sequentially';
                                                            const translateData: AnimatorTemplateData<false> = {
                                                                ordering: 'sequentially',
                                                                fillBefore: false,
                                                                repeating: [],
                                                                fillCustom: false,
                                                                fillAfter: false
                                                            };
                                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                                const propertyOptions: PropertyValue = {
                                                                    ...options,
                                                                    propertyName,
                                                                    startOffset: j === 0 ? (item.delay + (item.keyTimes[j] > 0 ? Math.floor(item.keyTimes[j] * item.duration) : 0)).toString() : '',
                                                                    propertyValues: false
                                                                };
                                                                const valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                                if (valueTo) {
                                                                    if (options.valueType === 'pathType') {
                                                                        const pathData = j === 0 ? group.pathData : getPropertyValue(values, j - 1, i);
                                                                        if (pathData) {
                                                                            propertyOptions.valueFrom = pathData;
                                                                        }
                                                                        else {
                                                                            continue;
                                                                        }
                                                                    }
                                                                    else if (j === 0 && !fillBefore && requireBefore) {
                                                                        propertyOptions.valueFrom = beforeValues[i];
                                                                    }
                                                                    const duration = j === 0 ? 0 : Math.floor((item.keyTimes[j] - (j > 0 ? item.keyTimes[j - 1] : 0)) * item.duration);
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
                                                                            const valueData = this.createPropertyValue(direction, translateTo.toString(), duration.toString(), 'floatType');
                                                                            valueData.interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
                                                                            translateData.repeating.push(valueData);
                                                                        }
                                                                    }
                                                                    propertyOptions.interpolator = j > 0 ? getPathInterpolator(item.keySplines, j - 1) : '';
                                                                    propertyOptions.duration = duration.toString();
                                                                    propertyOptions.valueTo = valueTo;
                                                                    animatorData.repeating.push(propertyOptions);
                                                                }
                                                            }
                                                            if (translateData.repeating.length) {
                                                                setData.AA.push(translateData);
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        const propertyOptions: PropertyValue = {
                                                            ...options,
                                                            propertyName,
                                                            interpolator: item.duration > 1 ? getPathInterpolator(item.keySplines, 0) : '',
                                                            propertyValues: false
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
                                                                valueFrom = item.from || (!fillBefore && requireBefore ? beforeValues[i] : '');
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
                                                            (section === 0 ? animatorData.repeating : fillCustomData.values).push(propertyOptions);
                                                        }
                                                    }
                                                    if (section === 0 && !synchronized) {
                                                        setFillAfter(propertyName, fillAfterData, animatorData.repeating);
                                                    }
                                                }
                                                if (requireBefore && transformOrigin && transformOrigin.length) {
                                                    insertBeforeValue('translateX', '0');
                                                    insertBeforeValue('translateY', '0');
                                                }
                                            }
                                        }
                                    }
                                });
                                const valid = animatorData.repeating.length > 0 || fillCustomData.values.length > 0;
                                if (valid && fillBeforeData.values.length) {
                                    if (fillBeforeData.values.length === 1) {
                                        animatorData.repeating.unshift(fillBeforeData.values[0]);
                                    }
                                    else {
                                        animatorData.fillBefore.push(fillBeforeData);
                                    }
                                }
                                if (fillCustomData.values.length) {
                                    if (fillBeforeData.values.length === 1) {
                                        animatorData.repeating.push(fillCustomData.values[0]);
                                    }
                                    else {
                                        animatorData.fillCustom.push(fillCustomData);
                                    }
                                }
                                if (valid && fillAfterData.values.length) {
                                    if (fillAfterData.values.length === 1) {
                                        animatorData.repeating.push(fillAfterData.values[0]);
                                    }
                                    else {
                                        animatorData.fillAfter.push(fillAfterData);
                                    }
                                }
                                const filled = animatorData.fillBefore.length > 0 || animatorData.fillCustom.length > 0 || animatorData.fillAfter.length > 0;
                                if (!filled && animatorData.ordering === 'sequentially' && animatorData.repeating.length === 1) {
                                    animatorData.ordering = '';
                                }
                                if (!filled && setData.ordering !== 'sequentially' && animatorData.ordering !== 'sequentially' && animatorData.repeating.every(repeat => repeat.propertyValues === false)) {
                                    togetherData.together.push(...animatorData.repeating);
                                    animatorData.repeating.length = 0;
                                }
                                else if (valid) {
                                    setData.AA.push(animatorData);
                                }
                                if (togetherData.together.length) {
                                    setData.BB.push(togetherData);
                                }
                            }
                            if (setData.AA.length || setData.BB.length) {
                                targetSetData.A.push(setData);
                            }
                        });
                        if (targetSetData.A.length) {
                            const xml = $xml.createTemplate(TEMPLATES.SET_OBJECTANIMATOR, targetSetData);
                            targetData.animationName = Resource.getStoredName('animators', xml);
                            if (targetData.animationName === '') {
                                targetData.animationName = getFilename('anim', name);
                                STORED.animators.set(targetData.animationName, xml);
                            }
                            data.A.push(targetData);
                        }
                    }
                    if (data.A.length) {
                        const xml = $xml.createTemplate(TEMPLATES.ANIMATED, data);
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = getFilename('anim');
                            STORED.drawables.set(vectorName, xml);
                        }
                    }
                }
                if (this.IMAGE_DATA.length) {
                    const D: StringMap[] = [];
                    for (const item of this.IMAGE_DATA) {
                        const scaleX = svg.width / svg.viewBox.width;
                        const scaleY = svg.height / svg.viewBox.height;
                        let x = item.getBaseValue('x', 0) * scaleX;
                        let y = item.getBaseValue('y', 0) * scaleY;
                        let width: number = item.getBaseValue('width', 0);
                        let height: number = item.getBaseValue('height', 0);
                        const offset = getParentOffset(item.element, <SVGSVGElement> svg.element);
                        x += offset.x;
                        y += offset.y;
                        width *= scaleX;
                        height *= scaleY;
                        const data: ExternalData = {
                            width: $util.formatPX(width),
                            height: $util.formatPX(height),
                            left: x !== 0 ? $util.formatPX(x) : '',
                            top: y !== 0 ? $util.formatPX(y) : '',
                            src: Resource.addImage({ mdpi: item.href }),
                            rotate: []
                        };
                        if (item.rotateAngle) {
                            data.rotate.push({
                                src: data.src,
                                fromDegrees: item.rotateAngle.toString(),
                                visible: item.visible ? 'true' : 'false'
                            });
                            data.src = '';
                        }
                        else if (!item.visible) {
                            continue;
                        }
                        D.push(data);
                    }
                    const xml = $xml.formatTemplate(
                        $xml.createTemplate(TEMPLATES.LAYER_LIST, <TemplateDataA> {
                            A: [],
                            B: false,
                            C: [{ src: vectorName }],
                            D,
                            E: false,
                            F: false
                        })
                    );
                    drawable = Resource.getStoredName('drawables', xml);
                    if (drawable === '') {
                        drawable = templateName;
                        STORED.drawables.set(drawable, xml);
                    }
                }
                else {
                    drawable = vectorName;
                }
                if (drawable !== '') {
                    if (node.localSettings.targetAPI >= BUILD_ANDROID.LOLLIPOP) {
                        node.android('src', `@drawable/${drawable}`);
                    }
                    else {
                        node.app('srcCompat', `@drawable/${drawable}`);
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
        this.application.controllerHandler.localSettings.unsupported.tagName.add('svg');
    }

    private parseVectorData(group: SvgGroup) {
        const groupData = this.createGroup(group);
        for (const item of group) {
            const CCC: ExternalData[] = [];
            const DDD: StringMap[] = [];
            const render: TransformData[][] = [[]];
            const clipGroup: StringMap[] = [];
            if ($SvgBuild.isShape(item)) {
                if (item.visible && item.path && item.path.value) {
                    const pathData = this.createPath(item, item.path, render);
                    if (pathData.strokeWidth && (pathData.strokeDasharray || pathData.strokeDashoffset)) {
                        const animateData = this.ANIMATE_DATA.get(item.name);
                        if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                            const [strokeDash, pathValue, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, false, this.options.floatPrecisionValue);
                            if (strokeDash) {
                                const groupName = getVectorName(item, 'stroke');
                                if (pathValue && clipPathData) {
                                    pathData.value = pathValue;
                                    clipGroup.push({ clipPathData });
                                }
                                for (let i = 0; i < strokeDash.length; i++) {
                                    const pathObject = i === 0 ? pathData : Object.assign({}, pathData);
                                    pathObject.name = `${groupName}_${i}`;
                                    if (animateData) {
                                        this.ANIMATE_DATA.set(pathObject.name, {
                                            element: animateData.element,
                                            animate: $util.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                        });
                                    }
                                    pathObject.trimPathStart = $math.truncateRange(strokeDash[i].start, this.options.floatPrecisionValue);
                                    pathObject.trimPathEnd = $math.truncateRange(strokeDash[i].end, this.options.floatPrecisionValue);
                                    CCC.push(pathObject);
                                }
                                if (animateData) {
                                    this.ANIMATE_DATA.delete(item.name);
                                }
                                render[0].push({ groupName });
                            }
                        }
                    }
                    if (CCC.length === 0) {
                        CCC.push(pathData);
                    }
                }
                else {
                    continue;
                }
            }
            else if ($SvgBuild.asImage(item)) {
                if (!$SvgBuild.asPattern(group)) {
                    if (item.width === 0 || item.height === 0) {
                        const image = this.application.session.image.get(item.href);
                        if (image && image.width > 0 && image.height > 0) {
                            item.width = image.width;
                            item.height = image.height;
                            item.setRect();
                        }
                    }
                    item.extract(this.options.transformExclude.image);
                    if (item.visible || item.rotateAngle !== undefined) {
                        this.IMAGE_DATA.push(item);
                    }
                }
                continue;
            }
            else if ($SvgBuild.isContainer(item)) {
                if (item.visible && item.length) {
                    this.parseVectorData(<SvgGroup> item);
                    DDD.push({ templateName: item.name });
                }
                else {
                    continue;
                }
            }
            groupData.BB.push({ render, clipGroup, CCC, DDD });
        }
        this.VECTOR_DATA.set(group.name, groupData);
    }

    private createGroup(target: SvgGroup) {
        const region: TransformData[][] = [[]];
        const clipRegion: StringMap[] = [];
        const path: TransformData[][] = [[]];
        const clipPath: StringMap[] = [];
        const result: GroupTemplateData = {
            region,
            clipRegion,
            path,
            clipPath,
            BB: []
        };
        const groupData: TransformData = {};
        if ((target !== this.SVG_INSTANCE && $SvgBuild.asSvg(target) || $SvgBuild.asUseSymbol(target) || $SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
            groupData.groupName = getVectorName(target, 'main');
            groupData.translateX = target.x.toString();
            groupData.translateY = target.y.toString();
        }
        if (target.clipRegion !== '') {
            this.createClipPath(target, clipRegion, target.clipRegion);
        }
        if (clipRegion.length || Object.keys(groupData).length) {
            region[0].push(groupData);
        }
        if (target !== this.SVG_INSTANCE) {
            const baseData: TransformData = {};
            const [transforms] = groupTransforms(target.element, target.transforms, true);
            const groupName = getVectorName(target, 'animate');
            if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util.hasValue(target.clipPath) && this.createClipPath(target, clipPath, target.clipPath)) {
                baseData.groupName = groupName;
            }
            if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
                baseData.groupName = groupName;
            }
            if (Object.keys(baseData).length) {
                path[0].push(baseData);
            }
            if (transforms.length) {
                const transformed: SvgTransform[] = [];
                for (const data of transforms) {
                    path[0].push(createTransformData(data));
                    transformed.push(...data);
                }
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(target: $SvgShape, path: $SvgPath, render: TransformData[][]) {
        const clipElement: StringMap[] = [];
        const result: PathTemplateData = {
            name: target.name,
            clipElement,
            fillPattern: false
        };
        const setColorPattern = (attr: string, checkPattern = false) => {
            if (checkPattern) {
                const pattern = `${attr}Pattern`;
                const value = result[pattern];
                if (value) {
                    const gradient = this.SVG_INSTANCE.definitions.gradient.get(value);
                    if (gradient) {
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
                                const gradients = Resource.createBackgroundGradient(this.NODE_INSTANCE, [gradient], path);
                                if (gradients.length) {
                                    result[attr] = '';
                                    result[pattern] = [{ gradients }];
                                    this.NAMESPACE_AAPT = true;
                                    return;
                                }
                                break;
                            }
                        }
                    }
                    result[pattern] = false;
                }
            }
            const colorName = Resource.addColor(result[attr]);
            if (colorName !== '') {
                result[attr] = `@color/${colorName}`;
            }
        };
        if ($SvgBuild.asUse(target) && $util.hasValue(target.clipPath)) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if ($util.hasValue(path.clipPath)) {
            const shape = new $SvgShape(path.element);
            shape.build(this.options.transformExclude, partitionTransforms);
            shape.synchronize(this.SYNCHRONIZE_MODE, this.options.floatPrecisionValue);
            this.createClipPath(shape, clipElement, path.clipPath);
        }
        const baseData: TransformData = {};
        const groupName = getVectorName(target, 'group');
        if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
            baseData.groupName = groupName;
        }
        else if (clipElement.length) {
            baseData.groupName = '';
        }
        if ($SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
            baseData.translateX = target.x.toString();
            baseData.translateY = target.y.toString();
        }
        if (Object.keys(baseData).length) {
            render[0].push(baseData);
        }
        if (path.transformResidual) {
            for (const item of path.transformResidual) {
                render[0].push(createTransformData(item));
            }
        }
        const opacity = getOuterOpacity(target);
        for (const attr in path) {
            let value = path[attr];
            if ($util.isString(value)) {
                switch (attr) {
                    case 'fillRule':
                        if (value === 'evenodd') {
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
                        break;
                    case 'strokeLinecap':
                        if (value === 'butt') {
                            continue;
                        }
                        break;
                    case 'strokeLinejoin':
                        if (value === 'miter') {
                            continue;
                        }
                        break;
                    case 'strokeMiterlimit':
                        if (value === '4') {
                            continue;
                        }
                        break;
                }
                result[attr] = value;
            }
        }
        setColorPattern('fill', true);
        setColorPattern('stroke');
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
                    const itemTotal: (number | undefined)[] = [];
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
            result.name = '';
        }
        if (transformResult.length) {
            const data = this.ANIMATE_DATA.get(groupName);
            if (data) {
                data.animate.push(...transformResult);
            }
        }
        if (replaceResult.length) {
            const data = this.ANIMATE_DATA.get(result.name);
            if (data) {
                data.animate.push(...replaceResult);
            }
            else {
                this.ANIMATE_DATA.set(result.name, {
                    element: target.element,
                    animate: replaceResult,
                    pathData
                });
            }
        }
        return result;
    }

    private createClipPath(target: SvgView, clipArray: StringMap[], clipPath: string) {
        let result = 0;
        clipPath.split(';').forEach((value, index, array) => {
            if (value.charAt(0) === '#') {
                const element = this.SVG_INSTANCE.definitions.clipPath.get(value);
                if (element) {
                    const g = new $SvgG(element);
                    g.build(this.options.transformExclude, partitionTransforms);
                    g.synchronize(this.SYNCHRONIZE_MODE, this.options.floatPrecisionValue);
                    g.each((child: $SvgShape) => {
                        if (child.path && child.path.value) {
                            let clipName = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                            if (!this.queueAnimations(child, clipName, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), child.path.value)) {
                                clipName = '';
                            }
                            clipArray.push({ clipName, clipPathData: child.path.value });
                        }
                    });
                }
                result++;
            }
            else {
                let clipName = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                if (!this.queueAnimations(target, clipName, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
                    clipName = '';
                }
                clipArray.push({ clipName, clipPathData: value });
                result++;
            }
        });
        return result > 0;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, boolean>, pathData = '') {
        if (svg.animations.length) {
            const animate = $util.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration > 0 || item.setterType) && predicate(item, index, array));
            if (animate.length) {
                this.ANIMATE_DATA.set(name, {
                    element: svg.element,
                    animate,
                    pathData
                });
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
            propertyValues: false
        };
    }
}