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
    animationName: string;
}

interface SetOrdering {
    name?: string;
    ordering?: string;
}

interface GroupTemplateData extends TemplateDataAA {
    group: TransformData[][];
    BB: TemplateData[];
}

interface SetTemplateData extends SetOrdering, TemplateDataAA {
    AA: AnimatorTemplateData[];
}

interface AnimatorTemplateData extends SetOrdering, TemplateDataAAA {
    fillBefore: TemplateData[] | false;
    repeating: TemplateData[];
    indefinite: TemplateData[] | false;
    fillAfter: TemplateData[] | false;
}

interface FillTemplateData extends SetOrdering, ExternalData {
    values: TemplateData[];
}

interface PathTemplateData extends Partial<$SvgPath> {
    name: string;
    render: TransformData[][];
    clipElement: StringMap[];
    fillPattern: any;
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

interface PropertyValue {
    propertyName: string;
    keyframes: KeyFrame[];
}

interface KeyFrame {
    interpolator: string;
    fraction: string;
    value: string;
}

type FillReplace = {
    index: number;
    time: number;
    to: string;
    reset: boolean;
    animate?: $SvgAnimateTransform;
};

const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $constS = squared.svg.lib.constant;
const $utilS = squared.svg.lib.util;

const TEMPLATES: ObjectMap<StringMap> = {};
const STORED = Resource.STORED as ResourceStoredMapAndroid;

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
    'stroke': 'strokeColor',
    'fill': 'fillColor',
    'opacity': 'alpha',
    'stroke-opacity': 'strokeAlpha',
    'fill-opacity': 'fillAlpha',
    'stroke-width': 'strokeWidth',
    'd': 'pathData',
    'clip-path': 'pathData'
};

function getPaintAttribute(value: string) {
    for (const attr in ATTRIBUTE_ANDROID) {
        if (ATTRIBUTE_ANDROID[attr] === value) {
            return $util.convertCamelCase(attr);
        }
    }
    return '';
}

function getVectorName(target: SvgView, section: string, index = -1) {
    return `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;
}

function createPathInterpolator(value: string) {
    const interpolatorName = `path_interpolator_${$util.convertWord(value)}`;
    if (!STORED.animators.has(interpolatorName)) {
        const xml = $util.formatString(INTERPOLATOR_XML, ...value.split(' '));
        STORED.animators.set(interpolatorName, xml);
    }
    return `@anim/${interpolatorName}`;
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
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    result.rotation = item.angle.toString();
                    if (item.origin) {
                        result.pivotX = item.origin.x.toString();
                        result.pivotY = item.origin.y.toString();
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

function getParentOffset(element: SVGGraphicsElement, baseElement: SVGGraphicsElement) {
    let x = 0;
    let y = 0;
    getViewport(element).forEach(parent => {
        if (($utilS.SVG.svg(parent) || $utilS.SVG.use(parent)) && parent !== baseElement) {
            x += parent.x.baseVal.value;
            y += parent.y.baseVal.value;
        }
    });
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

function partitionTransforms(element: SVGGraphicsElement, transform: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
    if (transform.length && ($utilS.SVG.circle(element) || $utilS.SVG.ellipse(element))) {
        const index = transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
        if (index !== -1 && (rx !== ry || transform.length > 1 && transform.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
            return segmentTransforms(element, transform);
        }
    }
    return [[], transform];
}

function segmentTransforms(element: SVGGraphicsElement, transform: SvgTransform[]): [SvgTransform[][], SvgTransform[]] {
    if (transform.length) {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        const partition = transform.slice(0).reverse();
        const rotations = transform[0].css ? [] : $utilS.getTransformRotate(element);
        rotations.reverse();
        for (let i = 1; i < partition.length; i++) {
            const item = partition[i];
            const previous = partition[i - 1];
            if (item.type === previous.type) {
                let matrix: SvgMatrix | undefined;
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        matrix = $utilS.MATRIX.clone(item.matrix);
                        matrix.e += previous.matrix.e;
                        matrix.f += previous.matrix.f;
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                        matrix = $utilS.MATRIX.clone(item.matrix);
                        matrix.a *= previous.matrix.a;
                        matrix.d *= previous.matrix.d;
                        break;
                    }
                }
                if (matrix) {
                    item.matrix = matrix;
                    partition.splice(--i, 1);
                }
            }
        }
        for (let i = 0; i < partition.length; i++) {
            const item = partition[i];
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_MATRIX:
                case SVGTransform.SVG_TRANSFORM_SKEWX:
                case SVGTransform.SVG_TRANSFORM_SKEWY:
                    client.push(item);
                    break;
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    host.push([item]);
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    if (host.length === 0) {
                        client.push(item);
                    }
                    else {
                        host.push([item]);
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    if (rotations.length) {
                        const origin = rotations.shift() as SvgPoint;
                        if (origin.angle === item.angle) {
                            item.origin = origin;
                        }
                    }
                    host.push([item]);
                    break;
            }
        }
        return [host.reverse(), client];
    }
    return [[], transform];
}

function getValueType(attributeName: string) {
    switch (attributeName) {
        case 'fill':
        case 'stroke':
            return '';
        case 'opacity':
        case 'stroke-opacity':
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
            if (getTransformInitialValue(attributeName)) {
                return 'floatType';
            }
            return undefined;
    }
}

function isColorType(attributeName: string) {
    return attributeName === 'fill' || attributeName === 'stroke';
}

function createAnimateFromTo(attributeName: string, begin: number, to: string, from?: string) {
    const result = new $SvgAnimate();
    result.attributeName = attributeName;
    result.begin = begin;
    result.duration = 1;
    result.from = from !== undefined ? from : to;
    result.to = to;
    result.fillForwards = true;
    result.convertToValues();
    return result;
}

function getTransformPropertyName(type: number) {
    switch (type) {
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return ['translateX', 'translateY'];
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return ['scaleX', 'scaleY'];
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

function getAttributePropertyName(value: string, checkTransform = true) {
    let result: string | undefined = ATTRIBUTE_ANDROID[value];
    if (result === undefined && checkTransform && getTransformInitialValue(value)) {
        result = value;
    }
    return result;
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

export default class ResourceSvg<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceSvgOptions = {
        excludeFromTransform: {
            path: [],
            line: [],
            rect: [],
            ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            polyline: [],
            polygon: [],
            image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY]
        },
        vectorAnimateInterpolator: ''
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
            if (TEMPLATES['ANIMATED'] === undefined) {
                TEMPLATES.ANIMATED = $xml.parseTemplate(ANIMATEDVECTOR_TMPL);
                TEMPLATES.LAYER_LIST = $xml.parseTemplate(LAYERLIST_TMPL);
                TEMPLATES.SET_OBJECTANIMATOR = $xml.parseTemplate(SETOBJECTANIMATOR_TMPL);
            }
            $SvgBuild.setName();
        }
        this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
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
                svg.build(this.options.excludeFromTransform, partitionTransforms);
                svg.synchronize(this.SYNCHRONIZE_MODE);
                this.parseVectorData(svg);
                this.queueAnimations(
                    svg,
                    svg.name,
                    item => item.attributeName === 'opacity'
                );
                const templateName = $util.convertWord(`${node.tagName}_${node.controlId}_viewbox`, true).toLowerCase();
                const getFilename = (prefix = '', suffix = '') => {
                    return templateName + (prefix !== '' ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix !== '' ? `_${suffix.toLowerCase()}` : '');
                };
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
                    const data: TemplateDataA = {
                        vectorName,
                        A: []
                    };
                    for (const [name, group] of this.ANIMATE_DATA.entries()) {
                        const targetData: AnimatedTargetData = {
                            name,
                            animationName: getFilename('animation', name)
                        };
                        const targetSetData: TemplateDataA = { A: [] };
                        const animatorMap = new Map<string, PropertyValue[]>();
                        const sequentialMap = new Map<string, $SvgAnimate[]>();
                        const transformMap = new Map<string, $SvgAnimateTransform[]>();
                        const together: $SvgAnimate[] = [];
                        const isolated: $SvgAnimate[] = [];
                        const togetherTargets: $SvgAnimate[][] = [];
                        const isolatedTargets: $SvgAnimate[][][] = [];
                        const transformTargets: $SvgAnimate[][] = [];
                        for (const item of group.animate as $SvgAnimate[]) {
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
                            else {
                                if ($SvgBuild.asSet(item)) {
                                    if (ATTRIBUTE_ANDROID[item.attributeName] && $util.hasValue(item.to)) {
                                        together.push(item);
                                    }
                                }
                                else {
                                    if ($SvgBuild.asAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    if (item.repeatCount === -1) {
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
                        for (const item of sequentialMap.values()) {
                            togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.ordinal >= b.synchronized.ordinal ? 1 : -1));
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.ordinal >= b.synchronized.ordinal ? 1 : -1));
                        }
                        for (const item of isolated) {
                            isolatedTargets.push([[item]]);
                        }
                        [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                            const setData: SetTemplateData = {
                                ordering: index === 0 ? '' : 'sequentially',
                                AA: []
                            };
                            animatorMap.clear();
                            for (const items of targets) {
                                let ordering: string;
                                let synchronized: boolean;
                                let requireFill: boolean;
                                let fillBefore: boolean;
                                let useKeyFrames: boolean;
                                if (items.every(item => item.synchronized !== undefined && item.synchronized.value !== '')) {
                                    ordering = $SvgBuild.asAnimateTransform(items[0]) ? '' : 'sequentially';
                                    synchronized = true;
                                    requireFill = false;
                                    fillBefore = false;
                                    useKeyFrames = $SvgBuild.asAnimateTransform(items[0]);
                                }
                                else if (items.every(item => item.synchronized !== undefined && item.synchronized.value === '')) {
                                    ordering = 'sequentially';
                                    synchronized = true;
                                    requireFill = false;
                                    fillBefore = true;
                                    useKeyFrames = true;
                                }
                                else {
                                    ordering = index === 0 ? '' : 'sequentially';
                                    synchronized = false;
                                    requireFill = true;
                                    fillBefore = false;
                                    useKeyFrames = true;
                                }
                                const animatorData: AnimatorTemplateData = {
                                    ordering,
                                    fillBefore: [],
                                    repeating: [],
                                    indefinite: [],
                                    fillAfter: []
                                };
                                const fillBeforeData: FillTemplateData = {
                                    values: []
                                };
                                const indefiniteData: FillTemplateData = {
                                    values: []
                                };
                                const fillAfterData: FillTemplateData = {
                                    values: []
                                };
                                const [indefinite, repeating] = synchronized ? $util.partitionArray(items, animate => animate.repeatCount === -1) : [[], items];
                                if (indefinite.length === 1) {
                                    repeating.push(indefinite[0]);
                                    indefinite.length = 0;
                                }
                                for (const item of repeating) {
                                    const valueType = getValueType(item.attributeName);
                                    let transforming = false;
                                    let transformOrigin: Point[] | undefined;
                                    function getFillAfter(propertyName: string) {
                                        if (!synchronized && item.fillReplace) {
                                            let valueTo: string | undefined;
                                            if (transforming) {
                                                valueTo = getTransformInitialValue(propertyName);
                                            }
                                            else if (item.parent && $SvgBuild.asShape(item.parent) && item.parent.path) {
                                                let attr: string;
                                                if (propertyName === 'pathData') {
                                                    attr = 'value';
                                                }
                                                else {
                                                    attr = getPaintAttribute(propertyName);
                                                }
                                                if (attr !== '') {
                                                    valueTo = item.parent.path[attr];
                                                }
                                            }
                                            const result: TemplateData[] = [];
                                            if ($util.isString(valueTo)) {
                                                result.push({
                                                    propertyName,
                                                    duration: '1',
                                                    repeatCount: '0',
                                                    valueType: valueType || '',
                                                    valueFrom: valueType === 'pathType' ? valueTo : '',
                                                    valueTo
                                                });
                                            }
                                            if (transformOrigin) {
                                                let translateName: string | undefined;
                                                if (propertyName.endsWith('X')) {
                                                    translateName = 'translateX';
                                                }
                                                else if (propertyName.endsWith('Y')) {
                                                    translateName = 'translateY';
                                                }
                                                if (translateName) {
                                                    result.push({
                                                        propertyName: translateName,
                                                        duration: '1',
                                                        repeatCount: '0',
                                                        valueType: 'floatType',
                                                        valueTo: '0'
                                                    });
                                                }
                                            }
                                            return result;
                                        }
                                        return undefined;
                                    }
                                    if ($SvgBuild.asSet(item)) {
                                        let valueTo: string | undefined;
                                        let valueFrom = '';
                                        if (isColorType(item.attributeName)) {
                                            const colorName = Resource.addColor(item.to);
                                            if (colorName !== '') {
                                                valueTo = `@color/${colorName}`;
                                            }
                                        }
                                        else {
                                            valueTo = item.to;
                                            if (valueType === 'pathType') {
                                                valueFrom = valueTo;
                                            }
                                        }
                                        if (valueTo) {
                                            animatorData.repeating.push({
                                                propertyName: ATTRIBUTE_ANDROID[item.attributeName],
                                                propertyValues: false,
                                                startOffset: item.begin > 0 ? item.begin.toString() : '',
                                                duration: '1',
                                                repeatCount: '0',
                                                valueType: valueType || '',
                                                valueFrom,
                                                valueTo
                                            });
                                        }
                                    }
                                    else if (valueType !== undefined) {
                                        const options: TemplateData = {
                                            startOffset: item.begin > 0 ? item.begin.toString() : '',
                                            valueType,
                                            duration: item.duration.toString(),
                                            repeatCount: item.repeatCount !== -1 ? Math.ceil(item.repeatCount - 1).toString() : '-1'
                                        };
                                        if (!synchronized) {
                                            if (item.fillBackwards) {
                                                options.fillEnabled = 'true';
                                                options.fillBefore = 'true';
                                            }
                                            if (item.alternate) {
                                                options.repeatMode = 'reverse';
                                            }
                                        }
                                        let propertyName: string[] | undefined;
                                        let values: string[] | number[][] | undefined;
                                        let beforeValues: string[] | undefined;
                                        if ($SvgBuild.asAnimateTransform(item)) {
                                            propertyName = getTransformPropertyName(item.type);
                                            values = getTransformValues(item);
                                            if (fillBefore && propertyName) {
                                                beforeValues = propertyName.map(value => getTransformInitialValue(value) || '0');
                                            }
                                            transformOrigin = item.transformOrigin;
                                            transforming = true;
                                        }
                                        else {
                                            const attribute = getAttributePropertyName(item.attributeName);
                                            switch (options.valueType) {
                                                case 'intType':
                                                    values = item.values.map(value => $util.convertInt(value).toString());
                                                    if (attribute) {
                                                        propertyName = [attribute];
                                                    }
                                                    break;
                                                case 'floatType':
                                                    values = item.values.map(value => $util.convertFloat(value).toString());
                                                    if (attribute) {
                                                        propertyName = [attribute];
                                                    }
                                                    break;
                                                case 'pathType':
                                                    if (group.pathData) {
                                                        pathType: {
                                                            values = item.values.slice(0);
                                                            if (item.attributeName === 'points') {
                                                                for (let i = 0; i < values.length; i++) {
                                                                    const value = values[i];
                                                                    if (value !== '') {
                                                                        const points = $SvgBuild.convertNumberList($SvgBuild.toNumberList(value));
                                                                        if (points.length) {
                                                                            values[i] = item.parent && item.parent.element.tagName === 'polygon' ? $SvgBuild.getPolygon(points) : $SvgBuild.getPolyline(points);
                                                                        }
                                                                        else {
                                                                            break pathType;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            else if (item.attributeName !== 'd') {
                                                                for (let i = 0; i < values.length; i++) {
                                                                    const value = values[i];
                                                                    if (value !== '') {
                                                                        const pathPoints = $SvgBuild.toPathCommandList(group.pathData);
                                                                        if (pathPoints.length <= 1) {
                                                                            break pathType;
                                                                        }
                                                                        let x: number | undefined;
                                                                        let y: number | undefined;
                                                                        let rx: number | undefined;
                                                                        let ry: number | undefined;
                                                                        let width: number | undefined;
                                                                        let height: number | undefined;
                                                                        switch (item.attributeName) {
                                                                            case 'x':
                                                                            case 'x1':
                                                                            case 'x2':
                                                                            case 'cx':
                                                                                x = parseFloat(value);
                                                                                if (isNaN(x)) {
                                                                                    break pathType;
                                                                                }
                                                                                break;
                                                                            case 'y':
                                                                            case 'y1':
                                                                            case 'y2':
                                                                            case 'cy':
                                                                                y = parseFloat(value);
                                                                                if (isNaN(y)) {
                                                                                    break pathType;
                                                                                }
                                                                                break;
                                                                            case 'r':
                                                                                rx = parseFloat(value);
                                                                                if (isNaN(rx)) {
                                                                                    break pathType;
                                                                                }
                                                                                ry = rx;
                                                                                break;
                                                                            case 'rx':
                                                                                rx = parseFloat(value);
                                                                                if (isNaN(rx)) {
                                                                                    break pathType;
                                                                                }
                                                                                break;
                                                                            case 'ry':
                                                                                ry = parseFloat(value);
                                                                                if (isNaN(ry)) {
                                                                                    break pathType;
                                                                                }
                                                                            case 'width':
                                                                                width = parseFloat(value);
                                                                                if (isNaN(width) || width < 0) {
                                                                                    break pathType;
                                                                                }
                                                                                break;
                                                                            case 'height':
                                                                                height = parseFloat(value);
                                                                                if (isNaN(height) || height < 0) {
                                                                                    break pathType;
                                                                                }
                                                                                break;
                                                                        }
                                                                        if (x !== undefined || y !== undefined) {
                                                                            const commandA = pathPoints[0];
                                                                            const commandB = pathPoints[pathPoints.length - 1];
                                                                            const pointA = commandA.points[0];
                                                                            const pointB = commandB.points[commandB.points.length - 1];
                                                                            let recalibrate = false;
                                                                            if (x !== undefined) {
                                                                                switch (item.attributeName) {
                                                                                    case 'x':
                                                                                        x -= pointA.x;
                                                                                        recalibrate = true;
                                                                                        break;
                                                                                    case 'x1':
                                                                                    case 'cx':
                                                                                        pointA.x = x;
                                                                                        commandA.coordinates[0] = x;
                                                                                        break;
                                                                                    case 'x2':
                                                                                        pointB.x = x;
                                                                                        commandB.coordinates[0] = x;
                                                                                        break;
                                                                                }
                                                                            }
                                                                            if (y !== undefined) {
                                                                                switch (item.attributeName) {
                                                                                    case 'y':
                                                                                        y -= pointA.y;
                                                                                        recalibrate = true;
                                                                                        break;
                                                                                    case 'y1':
                                                                                    case 'cy':
                                                                                        pointA.y = y;
                                                                                        commandA.coordinates[1] = y;
                                                                                        break;
                                                                                    case 'y2':
                                                                                        pointB.y = y;
                                                                                        commandB.coordinates[1] = y;
                                                                                        break;
                                                                                }
                                                                            }
                                                                            if (recalibrate) {
                                                                                for (const path of pathPoints) {
                                                                                    if (!path.relative) {
                                                                                        for (let j = 0, k = 0; j < path.coordinates.length; j += 2, k++) {
                                                                                            const pt = path.points[k];
                                                                                            if (x !== undefined) {
                                                                                                path.coordinates[j] += x;
                                                                                                pt.x += x;
                                                                                            }
                                                                                            if (y !== undefined) {
                                                                                                path.coordinates[j + 1] += y;
                                                                                                pt.y += y;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        else if (rx !== undefined || ry !== undefined) {
                                                                            for (const path of pathPoints) {
                                                                                if (path.command.toUpperCase() === 'A') {
                                                                                    if (rx !== undefined) {
                                                                                        path.radiusX = rx;
                                                                                        path.coordinates[0] = rx * 2 * (path.coordinates[0] < 0 ? -1 : 1);
                                                                                    }
                                                                                    if (ry !== undefined) {
                                                                                        path.radiusY = ry;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        else if (width !== undefined || height !== undefined) {
                                                                            for (const path of pathPoints) {
                                                                                switch (path.command) {
                                                                                    case 'h':
                                                                                        if (width !== undefined) {
                                                                                            path.coordinates[0] = width * (path.coordinates[0] < 0 ? -1 : 1);
                                                                                        }
                                                                                        break;
                                                                                    case 'v':
                                                                                        if (height !== undefined) {
                                                                                            path.coordinates[1] = height;
                                                                                        }
                                                                                        break;
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            values[i] = values[i - 1] || group.pathData;
                                                                            continue;
                                                                        }
                                                                        values[i] = $SvgBuild.fromPathCommandList(pathPoints);
                                                                    }
                                                                }
                                                            }
                                                            propertyName = ['pathData'];
                                                        }
                                                    }
                                                    break;
                                                default:
                                                    if (attribute) {
                                                        values = item.values.slice(0);
                                                        propertyName = [attribute];
                                                        if (isColorType(item.attributeName)) {
                                                            for (let i = 0; i < values.length; i++) {
                                                                if (i === 0 && values[i] === '' && item.baseFrom) {
                                                                    values[i] = item.baseFrom;
                                                                }
                                                                const colorName = Resource.addColor(values[i]);
                                                                if (colorName !== '') {
                                                                    values[i] = `@color/${colorName}`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        if (values && propertyName) {
                                            const keyName = index !== 0 ? JSON.stringify(options) : '';
                                            function getValue(valueIndex: number, propertyIndex: number) {
                                                if (values) {
                                                    if (Array.isArray(values[valueIndex])) {
                                                        const fromTo = values[valueIndex][propertyIndex];
                                                        if (fromTo !== undefined) {
                                                            return fromTo.toString();
                                                        }
                                                    }
                                                    else if (values[valueIndex] !== undefined) {
                                                        let value = values[valueIndex].toString();
                                                        if (value === '' && valueIndex === 0 && item.baseFrom) {
                                                            value = item.baseFrom;
                                                        }
                                                        return value;
                                                    }
                                                }
                                                return undefined;
                                            }
                                            for (let i = 0; i < propertyName.length; i++) {
                                                if (beforeValues && beforeValues[i]) {
                                                    fillBeforeData.values.push({
                                                        propertyName: propertyName[i],
                                                        duration: '0',
                                                        repeatCount: '0',
                                                        valueType,
                                                        valueTo: beforeValues[i]
                                                    });
                                                }
                                                if (useKeyFrames && (!item.fromToType || transformOrigin || supportedKeyFrames && transforming)) {
                                                    if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                        const propertyValues = animatorMap.get(keyName) || [];
                                                        const keyframes: KeyFrame[] = [];
                                                        const originX: KeyFrame[] | undefined = transformOrigin && transformOrigin.length ? [] : undefined;
                                                        const originY: KeyFrame[] | undefined = originX ? [] : undefined;
                                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                                            const value = getValue(j, i);
                                                            if (value !== undefined) {
                                                                const fraction = item.keyTimes[j] === 0 && value === '' ? '' : item.keyTimes[j].toString();
                                                                let interpolator = j > 0 && value !== '' ? this.getPathInterpolator(item.keySplines, j - 1) : '';
                                                                keyframes.push({
                                                                    interpolator,
                                                                    fraction,
                                                                    value
                                                                });
                                                                if (transformOrigin && originX && originY) {
                                                                    if (transformOrigin[j]) {
                                                                        interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step']);
                                                                        originX.push({
                                                                            interpolator,
                                                                            fraction,
                                                                            value: transformOrigin[j].x.toString()
                                                                        });
                                                                        originY.push({
                                                                            interpolator,
                                                                            fraction,
                                                                            value: transformOrigin[j].y.toString()
                                                                        });
                                                                    }
                                                                    else {
                                                                        const emptyValue = { interpolator: '', fraction: '', value: '' };
                                                                        originX.push(emptyValue);
                                                                        originY.push(emptyValue);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (keyframes.length) {
                                                            propertyValues.push({
                                                                propertyName: propertyName[i],
                                                                keyframes
                                                            });
                                                            if (originX && originY) {
                                                                propertyValues.push({
                                                                    propertyName: 'translateX',
                                                                    keyframes: originX
                                                                });
                                                                propertyValues.push({
                                                                    propertyName: 'translateY',
                                                                    keyframes: originY
                                                                });
                                                                transformOrigin = [];
                                                            }
                                                            if (!animatorMap.has(keyName)) {
                                                                if (keyName !== '') {
                                                                    animatorMap.set(keyName, propertyValues);
                                                                }
                                                                animatorData.repeating.push({
                                                                    ...options,
                                                                    propertyValues
                                                                });
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        const propertyData: AnimatorTemplateData = {
                                                            ordering: 'sequentially',
                                                            fillBefore: false,
                                                            repeating: [],
                                                            indefinite: false,
                                                            fillAfter: false
                                                        };
                                                        const translateData: AnimatorTemplateData = {
                                                            ordering: 'sequentially',
                                                            fillBefore: false,
                                                            repeating: [],
                                                            indefinite: false,
                                                            fillAfter: false
                                                        };
                                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                                            const propertyOptions: TemplateData = {
                                                                ...options,
                                                                propertyName: propertyName[i],
                                                                startOffset: j === 0 ? (item.begin + (item.keyTimes[j] > 0 ? item.keyTimes[j] * item.duration : 0)).toString() : '',
                                                                propertyValues: false
                                                            };
                                                            const valueTo = getValue(j, i);
                                                            if (valueTo) {
                                                                if (options.valueType === 'pathType') {
                                                                    const pathData = j === 0 ? group.pathData : getValue(j - 1, i);
                                                                    if (pathData) {
                                                                        propertyOptions.valueFrom = pathData;
                                                                    }
                                                                    else {
                                                                        continue;
                                                                    }
                                                                }
                                                                const duration = j === 0 ? 0 : Math.round((item.keyTimes[j] - (j > 0 ? item.keyTimes[j - 1] : 0)) * item.duration);
                                                                if (transformOrigin && transformOrigin[j]) {
                                                                    let direction: string | undefined;
                                                                    let translateTo = 0;
                                                                    if (propertyName[i].endsWith('X')) {
                                                                        direction = 'translateX';
                                                                        translateTo = transformOrigin[j].x;
                                                                    }
                                                                    else if (propertyName[i].endsWith('Y')) {
                                                                        direction = 'translateY';
                                                                        translateTo = transformOrigin[j].y;
                                                                    }
                                                                    if (direction) {
                                                                        translateData.repeating.push({
                                                                            propertyName: direction,
                                                                            interpolator: createPathInterpolator($constS.KEYSPLINE_NAME['step']),
                                                                            duration: duration.toString(),
                                                                            repeatCount: '0',
                                                                            valueType: 'floatType',
                                                                            valueTo: translateTo.toString()
                                                                        });
                                                                    }
                                                                }
                                                                propertyOptions.interpolator = j > 0 ? this.getPathInterpolator(item.keySplines, j - 1) : '';
                                                                propertyOptions.duration = duration.toString();
                                                                propertyOptions.valueTo = valueTo;
                                                                propertyData.repeating.push(propertyOptions);
                                                            }
                                                        }
                                                        if (requireFill) {
                                                            const fillAfter = getFillAfter(propertyName[i]);
                                                            if (fillAfter) {
                                                                if (fillAfter.length === 1) {
                                                                    propertyData.repeating.push(fillAfter[0]);
                                                                }
                                                                else {
                                                                    propertyData.fillAfter = [{ values: fillAfter }];
                                                                }
                                                            }
                                                        }
                                                        if (translateData.repeating.length) {
                                                            setData.AA.push(translateData);
                                                        }
                                                        setData.AA.push(propertyData);
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    const propertyOptions: TemplateData = {
                                                        ...options,
                                                        propertyName: propertyName[i],
                                                        interpolator: item.duration > 1 ? this.getPathInterpolator(item.keySplines, 0) : ''
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
                                                            valueFrom = item.from;
                                                            propertyOptions.valueTo = item.to;
                                                        }
                                                        if (valueFrom) {
                                                            propertyOptions.valueFrom = valueFrom;
                                                        }
                                                        else if (options.valueType === 'pathType') {
                                                            propertyOptions.valueFrom = group.pathData || propertyOptions.valueTo;
                                                        }
                                                        else if (item.baseFrom) {
                                                            propertyOptions.valueFrom = item.baseFrom;
                                                        }
                                                        if (options.valueType !== 'pathType' && propertyOptions.valueFrom === propertyOptions.valueTo) {
                                                            propertyOptions.valueFrom = '';
                                                        }
                                                    }
                                                    if (propertyOptions.valueTo) {
                                                        propertyOptions.propertyValues = false;
                                                        animatorData.repeating.push(propertyOptions);
                                                    }
                                                }
                                                if (requireFill) {
                                                    const fillAfter = getFillAfter(propertyName[i]);
                                                    if (fillAfter) {
                                                        fillAfterData.values.push(...fillAfter);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (indefinite.length) {
                                    const pathArray = animatorData.repeating.length ? indefiniteData.values : animatorData.repeating;
                                    for (const item of indefinite) {
                                        const valueType = getValueType(item.attributeName);
                                        if (valueType !== undefined) {
                                            let propertyName: string[] | undefined;
                                            let valueFrom: string[] | undefined;
                                            let valueTo: string[] | undefined;
                                            if ($SvgBuild.asAnimateTransform(item)) {
                                                propertyName = getTransformPropertyName(item.type);
                                                const values = getTransformValues(item);
                                                if (values && values.length) {
                                                    valueTo = [];
                                                    if (values.length > 1) {
                                                        valueFrom = [];
                                                        for (const value of values[0]) {
                                                            valueFrom.push(value.toString());
                                                        }
                                                    }
                                                    for (const value of values[values.length - 1]) {
                                                        valueTo.push(value.toString());
                                                    }
                                                }
                                            }
                                            else {
                                                const attribute = getAttributePropertyName(item.attributeName, false);
                                                if (attribute) {
                                                    propertyName = [attribute];
                                                    valueFrom = [item.from];
                                                    valueTo = [item.to];
                                                }
                                            }
                                            if (propertyName && valueTo) {
                                                for (let i = 0; i < propertyName.length; i++) {
                                                    pathArray.push({
                                                        propertyName: propertyName[i],
                                                        interpolator: item.duration > 1 ? this.getPathInterpolator(item.keySplines, 0) : '',
                                                        startOffset: item.begin > 0 ? item.begin.toString() : '',
                                                        duration: item.duration.toString(),
                                                        repeatCount: '0',
                                                        valueType,
                                                        valueFrom: valueFrom ? valueFrom[i] : '',
                                                        valueTo: valueTo[i]
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                                if (animatorData.repeating.length && animatorData.fillBefore) {
                                    switch (fillBeforeData.values.length) {
                                        case 0:
                                            animatorData.fillBefore = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.unshift(fillBeforeData.values[0]);
                                            break;
                                        default:
                                            animatorData.fillBefore.push(fillBeforeData);
                                            break;
                                    }
                                }
                                if (animatorData.indefinite) {
                                    switch (indefiniteData.values.length) {
                                        case 0:
                                            animatorData.indefinite = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.push(indefiniteData.values[0]);
                                            break;
                                        default:
                                            animatorData.indefinite.push(indefiniteData);
                                            break;
                                    }
                                }
                                if (animatorData.repeating.length && animatorData.fillAfter) {
                                    switch (fillAfterData.values.length) {
                                        case 0:
                                            animatorData.fillAfter = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.push(fillAfterData.values[0]);
                                            break;
                                        default:
                                            animatorData.fillAfter.push(fillAfterData);
                                            break;
                                    }
                                }
                                if (animatorData.repeating.length || animatorData.indefinite && animatorData.indefinite.length) {
                                    setData.AA.push(animatorData);
                                }
                            }
                            if ($util.isArray(setData.AA)) {
                                targetSetData.A.push(setData);
                            }
                        });
                        if (targetSetData.A.length) {
                            STORED.animators.set(targetData.animationName, $xml.createTemplate(TEMPLATES.SET_OBJECTANIMATOR, targetSetData));
                            data.A.push(targetData);
                        }
                    }
                    if (data.A.length) {
                        const xml = $xml.createTemplate(TEMPLATES.ANIMATED, data);
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = getFilename('animation');
                            STORED.drawables.set(vectorName, xml);
                        }
                    }
                }
                if (this.IMAGE_DATA.length) {
                    const imageD: StringMap[] = [];
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
                        imageD.push(data);
                    }
                    let xml = $xml.createTemplate(TEMPLATES.LAYER_LIST, <TemplateDataA> {
                        A: [],
                        B: false,
                        C: [{ src: vectorName }],
                        D: imageD,
                        E: false,
                        F: false
                    });
                    xml = $xml.formatTemplate(xml);
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
                    node.android('src', `@drawable/${drawable}`);
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
            if ($SvgBuild.asShape(item)) {
                if (item.visible && item.path && item.path.value) {
                    CCC.push(this.createPath(item, item.path));
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
                    item.extract(this.options.excludeFromTransform.image);
                    if (item.visible || item.rotateAngle !== undefined) {
                        this.IMAGE_DATA.push(item);
                    }
                }
                continue;
            }
            else if ($SvgBuild.asContainer(item)) {
                if (item.visible && item.length) {
                    this.parseVectorData(<SvgGroup> item);
                    DDD.push({ templateName: item.name });
                }
                else {
                    continue;
                }
            }
            groupData.BB.push({ CCC, DDD });
        }
        this.VECTOR_DATA.set(group.name, groupData);
    }

    private createGroup(target: SvgGroup) {
        const group: TransformData[][] = [[]];
        const clipGroup: StringMap[] = [];
        const result: GroupTemplateData = {
            group,
            clipGroup,
            BB: []
        };
        if (this.SVG_INSTANCE !== target) {
            const [transformHost, transformClient] = segmentTransforms(target.element, target.transform);
            let groupName: string;
            if ($SvgBuild.asShapePattern(target) || $SvgBuild.asUsePattern(target)) {
                this.createClipPath(target, clipGroup, target.clipRegion);
                groupName = getVectorName(target, 'pattern');
            }
            else {
                if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util.hasValue(target.clipPath)) {
                    this.createClipPath(target, clipGroup, target.clipPath);
                }
                groupName = getVectorName(target, 'group');
            }
            if (!this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
                groupName = '';
            }
            const baseData: TransformData = {
                groupName,
                ...createTransformData(transformClient)
            };
            if (($SvgBuild.asSvg(target) || $SvgBuild.asUseSymbol(target) || $SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
                baseData.translateX = (parseFloat(baseData.translateX || '0') + target.x).toString();
                baseData.translateY = (parseFloat(baseData.translateY || '0') + target.y).toString();
            }
            group[0].push(baseData);
            if (transformHost.length) {
                const transformed: SvgTransform[] = [];
                for (let i = 0; i < transformHost.length; i++) {
                    group[0].push(createTransformData(transformHost[i]));
                    transformed.push(...transformHost[i]);
                }
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(target: $SvgShape, path: $SvgPath) {
        const render: TransformData[][] = [[]];
        const clipElement: StringMap[] = [];
        const result: PathTemplateData = {
            name: target.name,
            render,
            clipElement,
            fillPattern: false
        };
        const pathData = path.value;
        if ($SvgBuild.asUse(target) && $util.hasValue(target.clipPath)) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if ($util.hasValue(path.clipPath)) {
            const shape = new $SvgShape(path.element);
            shape.build(this.options.excludeFromTransform, partitionTransforms);
            shape.synchronize(this.SYNCHRONIZE_MODE);
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
            for (let i = 0; i < path.transformResidual.length; i++) {
                render[0].push(createTransformData(path.transformResidual[i]));
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
                        value = (parseFloat(value || '1') * opacity).toString();
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
        ['fill', 'stroke'].forEach(attr => {
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
            }
            const colorName = Resource.addColor(result[attr]);
            if (colorName !== '') {
                result[attr] = `@color/${colorName}`;
            }
            result[pattern] = false;
        });
        const replaceMap = new Map<number, FillReplace>();
        const transformResult: $SvgAnimate[] = [];
        const replaceResult: $SvgAnimate[] = [];
        let previousPathData = pathData;
        let index = 0;
        target.animation.forEach(item => {
            if ($SvgBuild.asAnimateTransform(item)) {
                if (!item.additiveSum && item.transformFrom) {
                    let time = Math.max(0, item.begin - 1);
                    replaceMap.set(time, {
                        index,
                        time,
                        to: item.transformFrom as string,
                        reset: false,
                        animate: item
                    });
                    if (item.repeatCount !== -1 && item.fillReplace) {
                        time = item.begin + item.repeatCount * item.duration;
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
        });
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
                                    const next = replaceData[k];
                                    if (next.index === item.index) {
                                        break invalid;
                                    }
                                    else if (next.index === previous.index) {
                                        valid = false;
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
                            const initialValue = $utilS.getTransformInitialValue(type).split(' ');
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
        if (!this.queueAnimations(target, target.name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
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
                    g.build(this.options.excludeFromTransform, partitionTransforms);
                    g.synchronize(this.SYNCHRONIZE_MODE);
                    g.each((child: $SvgShape) => {
                        if (child.path && child.path.value) {
                            let clipName = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                            if (!this.queueAnimations(child, clipName, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), child.path.value)) {
                                clipName = '';
                            }
                            clipArray.push({
                                clipName,
                                clipPathData: child.path.value
                            });
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
                clipArray.push({
                    clipName,
                    clipPathData: value
                });
                result++;
            }
        });
        return result > 0;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, void>, pathData = '') {
        const animate = svg.animation.filter(predicate).filter(item => !item.paused && (item.duration > 0 || $SvgBuild.asSet(item)));
        if (animate.length) {
            this.ANIMATE_DATA.set(name, {
                element: svg.element,
                animate,
                pathData
            });
            return true;
        }
        return false;
    }

    private getPathInterpolator(keySplines: string[] | undefined, index: number) {
        if (keySplines && keySplines[index]) {
            return INTERPOLATOR_ANDROID[keySplines[index]] || createPathInterpolator(keySplines[index]);
        }
        return this.options.vectorAnimateInterpolator;
    }
}