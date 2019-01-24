import { TemplateData, TemplateDataA, TemplateDataAA, TemplateDataAAA } from '../../../../src/base/@types/application';
import { SvgPoint, SvgTransform, SvgMatrix } from '../../../../src/svg/@types/object';
import { ResourceStoredMapAndroid } from '../../@types/application';
import { ResourceSvgOptions } from '../../@types/extension';

import { BUILD_ANDROID } from '../../lib/enumeration';

import ANIMATEDVECTOR_TMPL from '../../template/resource/embedded/animated-vector';
import LAYERLIST_TMPL from '../../template/resource/embedded/layer-list';
import SETOBJECTANIMATOR_TMPL from '../../template/resource/embedded/set-objectanimator';
import VECTOR_TMPL from '../../template/resource/embedded/vector';

import Resource from '../../resource';
import View from '../../view';

import { getXmlNs } from '../../lib/util';

if (!squared.svg) {
    squared.svg = { lib: {} } as any;
}

import $Svg = squared.svg.Svg;
import $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import $SvgBuild = squared.svg.SvgBuild;
import $SvgG = squared.svg.SvgG;
import $SvgPath = squared.svg.SvgPath;

type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;
type SvgShape = squared.svg.SvgShape;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

interface AnimatedTargetData extends TemplateDataAA {
    name: string;
    animationName: string;
}

interface SetOrdering {
    name: string;
    ordering: string;
}

interface SetData extends SetOrdering, TemplateDataAA {
    AA: ObjectAnimatorData[];
}

interface ObjectAnimatorData extends SetOrdering, TemplateDataAAA {
    repeating: TemplateData[];
    indefinite: TemplateData[] | false;
    fill: TemplateData[] | false;
}

interface FillAfterData extends SetOrdering, TemplateData {
    after: TemplateData[];
}

interface IndefiniteData extends SetOrdering, TemplateData {
    repeat: TemplateData[];
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

interface GroupData extends TemplateDataAA {
    group: TransformData[][];
    BB: TemplateData[];
}

interface PathData extends Partial<$SvgPath> {
    name: string;
    render: TransformData[][];
    clipElement: StringMap[];
    fillPattern: any;
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

interface AnimateGroup {
    element: SVGGraphicsElement;
    animate: SvgAnimation[];
    pathData?: string;
}

const $color = squared.lib.color;
const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $constS = squared.svg.lib.constant;
const $utilS = squared.svg.lib.util;

const INTERPOLATOR_ANDROID = {
    ACCELERATE_DECELERATE: '@android:anim/accelerate_decelerate_interpolator',
    ACCELERATE:	'@android:anim/accelerate_interpolator',
    ANTICIPATE:	'@android:anim/anticipate_interpolator',
    ANTICIPATE_OVERSHOOT: '@android:anim/anticipate_overshoot_interpolator',
    BOUNCE:	'@android:anim/bounce_interpolator',
    CYCLE: '@android:anim/cycle_interpolator',
    DECELERATE:	'@android:anim/decelerate_interpolator',
    LINEAR: '@android:anim/linear_interpolator',
    OVERSHOOT: '@android:anim/overshoot_interpolator'
};

if ($constS) {
    Object.assign(INTERPOLATOR_ANDROID, {
        [$constS.KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.ACCELERATE,
        [$constS.KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.DECELERATE,
        [$constS.KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.ACCELERATE_DECELERATE,
        [$constS.KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.LINEAR
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
    'd': 'pathData'
};

const TEMPLATES: ObjectMap<StringMap> = {};
const STORED = Resource.STORED as ResourceStoredMapAndroid;

function getGroupName(svg: SvgView, suffix: string) {
    return `${svg.name}_${suffix}`;
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
            return segmentTransforms(element, transform, rx, ry);
        }
    }
    return [[], transform];
}

function segmentTransforms(element: SVGGraphicsElement, transform: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
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
        case 'transform':
        case 'fill':
        case 'stroke':
            return '';
        case 'opacity':
        case 'stroke-opacity':
        case 'fill-opacity':
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
            return undefined;
    }
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
        vectorAnimateOrdering: 'together',
        vectorAnimateInterpolator: INTERPOLATOR_ANDROID.LINEAR
    };

    public readonly eventOnly = true;

    private VECTOR_DATA = new Map<string, GroupData>();
    private ANIMATE_DATA = new Map<string, AnimateGroup>();
    private IMAGE_DATA: SvgImage[] = [];
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
                const templateName = $util.convertWord(`${node.tagName.toLowerCase()}_${node.controlId}_viewbox`, true);
                const getFilename = (prefix = '', suffix = '') => {
                    return templateName + (prefix !== '' ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix !== '' ? `_${suffix}` : '');
                };
                this.VECTOR_DATA.clear();
                this.ANIMATE_DATA.clear();
                this.IMAGE_DATA.length = 0;
                this.NAMESPACE_AAPT = false;
                svg.build(this.options.excludeFromTransform, partitionTransforms);
                svg.synchronize();
                this.parseVectorData(node, svg, svg);
                this.queueAnimations(
                    svg,
                    svg.name,
                    item => item.attributeName === 'opacity'
                );
                let drawable = '';
                let vectorName = '';
                {
                    const template = $xml.parseTemplate(VECTOR_TMPL);
                    let xml = $xml.createTemplate(template, <TemplateDataA> {
                        namespace: this.NAMESPACE_AAPT ? getXmlNs('aapt') : '',
                        name: svg.name,
                        width: $util.formatPX(svg.width),
                        height: $util.formatPX(svg.height),
                        viewportWidth: svg.viewBox.width > 0 ? svg.viewBox.width.toString() : '',
                        viewportHeight: svg.viewBox.height > 0 ? svg.viewBox.height.toString() : '',
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
                        const sequentialMap = new Map<string, SvgAnimate[]>();
                        const transformMap = new Map<string, $SvgAnimateTransform[]>();
                        const together: SvgAnimate[] = [];
                        const isolated: SvgAnimate[] = [];
                        const togetherTargets: SvgAnimate[][] = [];
                        const isolatedTargets: SvgAnimate[][][] = [];
                        const transformTargets: SvgAnimate[][] = [];
                        for (const item of group.animate as SvgAnimate[]) {
                            const sequential = item.sequential;
                            if (sequential) {
                                if ($SvgBuild.instanceOfAnimateTransform(item)) {
                                    const values = transformMap.get(sequential.value) || [];
                                    values.push(item);
                                    transformMap.set(sequential.value, values);
                                }
                                else {
                                    const values = sequentialMap.get(sequential.value) || [];
                                    values.push(item);
                                    sequentialMap.set(sequential.value, values);
                                }
                            }
                            else if (item.repeatCount === -1) {
                                isolated.push(item);
                            }
                            else if ((!item.fromToType || $SvgBuild.instanceOfAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
                                togetherTargets.push([item]);
                            }
                            else if (item.fillMode < $constS.FILL_MODE.FORWARDS) {
                                isolated.push(item);
                            }
                            else {
                                together.push(item);
                            }
                        }
                        if (together.length) {
                            togetherTargets.push(together);
                        }
                        for (const item of sequentialMap.values()) {
                            togetherTargets.push(item.sort((a, b) => a.sequential && b.sequential && a.sequential.ordinal >= b.sequential.ordinal ? 1 : -1));
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort((a, b) => a.sequential && b.sequential && a.sequential.ordinal >= b.sequential.ordinal ? 1 : -1));
                        }
                        for (const item of isolated) {
                            isolatedTargets.push([[item]]);
                        }
                        [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                            const subData: SetData = {
                                name: `${name}_${index + 1}`,
                                ordering: index === 0 ? 'together' : 'sequentially',
                                AA: []
                            };
                            animatorMap.clear();
                            for (const items of targets) {
                                let ordering: string;
                                let sequential = false;
                                if (index > 1) {
                                    ordering = 'together';
                                }
                                else if (items.some(item => item.sequential !== undefined)) {
                                    ordering = index === 0 ? 'sequentially' : 'together';
                                    sequential = true;
                                }
                                else {
                                    ordering = this.options.vectorAnimateOrdering || 'together';
                                }
                                const setData: ObjectAnimatorData = {
                                    name: `${subData.name}_repeat`,
                                    ordering,
                                    repeating: [],
                                    indefinite: [],
                                    fill: []
                                };
                                const indefiniteData: IndefiniteData = {
                                    name: `${subData.name}_infinite`,
                                    ordering: 'sequentially',
                                    repeat: []
                                };
                                const fillData: FillAfterData = {
                                    name: `${subData.name}_after`,
                                    ordering: 'together',
                                    after: []
                                };
                                const [indefinite, repeating] = sequential ? $util.partitionArray(items, animate => animate.repeatCount === -1) : [[], items];
                                if (indefinite.length === 1) {
                                    repeating.push(indefinite[0]);
                                    indefinite.length = 0;
                                }
                                for (const item of repeating) {
                                    const options: TemplateData = {
                                        startOffset: item.delay > 0 ? item.delay.toString() : ''
                                    };
                                    const valueType = getValueType(item.attributeName);
                                    if ($SvgBuild.instanceOfSet(item)) {
                                        if ($util.hasValue(item.to)) {
                                            options.propertyName = ATTRIBUTE_ANDROID[item.attributeName];
                                            if (options.propertyName) {
                                                Object.assign(options, {
                                                    valueType: valueType || '',
                                                    propertyValues: false,
                                                    duration: Math.max(item.duration, 1).toString(),
                                                    repeatCount: '0',
                                                    valueTo: item.to.toString()
                                                });
                                                setData.repeating.push(options);
                                            }
                                        }
                                    }
                                    else {
                                        if (valueType === undefined) {
                                            continue;
                                        }
                                        Object.assign(options, {
                                            valueType,
                                            duration: item.duration.toString(),
                                            repeatCount: item.repeatCount !== -1 ? Math.ceil(item.repeatCount - 1).toString() : '-1'
                                        });
                                        if (!sequential) {
                                            if ($util.hasBit(item.fillMode, $constS.FILL_MODE.BACKWARDS)) {
                                                options.fillEnabled = 'true';
                                                options.fillBefore = 'true';
                                            }
                                            if (item.alternate) {
                                                options.repeatMode = 'reverse';
                                            }
                                        }
                                        let propertyName: string[] | undefined;
                                        let values: string[] | (number[] | null[])[] | undefined;
                                        let transformOrigin: Point[] | undefined;
                                        let animateTransform = false;
                                        if ($SvgBuild.instanceOfAnimateTransform(item)) {
                                            animateTransform = true;
                                            switch (item.type) {
                                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                    values = $SvgAnimateTransform.toRotateList(item.values);
                                                    propertyName = ['rotation', 'pivotX', 'pivotY'];
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                                    values = $SvgAnimateTransform.toScaleList(item.values);
                                                    propertyName = ['scaleX', 'scaleY'];
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                    values = $SvgAnimateTransform.toTranslateList(item.values);
                                                    propertyName = ['translateX', 'translateY'];
                                                    break;
                                            }
                                            options.valueType = 'floatType';
                                            transformOrigin = item.transformOrigin;
                                        }
                                        else {
                                            const attribute: string = ATTRIBUTE_ANDROID[item.attributeName];
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
                                                                        const points = $SvgBuild.fromNumberList($SvgBuild.toNumberList(value));
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
                                                    values = item.values.slice(0);
                                                    if (attribute) {
                                                        propertyName = [attribute];
                                                    }
                                                    if (propertyName) {
                                                        for (let i = 0; i < values.length; i++) {
                                                            const color = $color.parseRGBA(values[i]);
                                                            if (color) {
                                                                values[i] = `@color/${Resource.addColor(color)}`;
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        if (values && propertyName) {
                                            const keyName = index !== 1 ? JSON.stringify(options) : '';
                                            let valueFrom = '';
                                            function getValue(valueIndex: number, propertyIndex: number) {
                                                if (values) {
                                                    if (Array.isArray(values[valueIndex])) {
                                                        const fromTo = values[valueIndex][propertyIndex];
                                                        if (fromTo !== undefined) {
                                                            return fromTo !== null ? fromTo.toString() : '';
                                                        }
                                                    }
                                                    else {
                                                        return values[valueIndex].toString();
                                                    }
                                                }
                                                return undefined;
                                            }
                                            const getFillAfter = (afterName: string) => {
                                                if (!sequential && item.fillMode < $constS.FILL_MODE.FORWARDS) {
                                                    let valueTo: string | undefined;
                                                    if (animateTransform) {
                                                        switch (afterName) {
                                                            case 'rotation':
                                                            case 'pivotX':
                                                            case 'pivotY':
                                                            case 'translateX':
                                                            case 'translateY':
                                                                valueTo = '0';
                                                                break;
                                                            case 'scaleX':
                                                            case 'scaleY':
                                                                valueTo = '1';
                                                                break;
                                                        }
                                                    }
                                                    else if ($SvgBuild.instanceOfShape(item.parent) && item.parent.path) {
                                                        let css: string | undefined;
                                                        if (afterName === 'pathData') {
                                                            css = 'value';
                                                        }
                                                        else {
                                                            for (const attr in ATTRIBUTE_ANDROID) {
                                                                if (ATTRIBUTE_ANDROID[attr] === afterName) {
                                                                    css = $util.convertCamelCase(attr);
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        if (css) {
                                                            valueTo = item.parent.path[css];
                                                        }
                                                    }
                                                    const result: TemplateData[] = [];
                                                    if ($util.hasValue(valueTo)) {
                                                        result.push({
                                                            propertyName: afterName,
                                                            duration: '1',
                                                            repeatCount: '0',
                                                            valueType,
                                                            valueFrom: valueType === 'pathType' ? valueFrom : '',
                                                            valueTo: (valueTo as string).toString()
                                                        });
                                                    }
                                                    if (transformOrigin) {
                                                        let translateName: string | undefined;
                                                        if (afterName.endsWith('X')) {
                                                            translateName = 'translateX';
                                                        }
                                                        else if (afterName.endsWith('Y')) {
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
                                            };
                                            for (let i = 0; i < propertyName.length; i++) {
                                                valueFrom = '';
                                                if (!sequential && (!item.fromToType || transformOrigin)) {
                                                    if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                        const propertyValues = animatorMap.get(keyName) || [];
                                                        const keyframes: KeyFrame[] = [];
                                                        const originX: KeyFrame[] | undefined = transformOrigin && transformOrigin.length ? [] : undefined;
                                                        const originY: KeyFrame[] | undefined = originX ? [] : undefined;
                                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                                            const value = getValue(j, i);
                                                            if (value !== undefined) {
                                                                const fraction = item.keyTimes[j] === 0 && value === '' ? '' : item.keyTimes[j].toString();
                                                                let interpolator = value !== '' ? this.getPathInterpolator(item.keySplines, j - 1) : '';
                                                                keyframes.push({
                                                                    interpolator,
                                                                    fraction,
                                                                    value
                                                                });
                                                                if (transformOrigin && originX && originY) {
                                                                    if (transformOrigin[j]) {
                                                                        interpolator = createPathInterpolator($constS.KEYSPLINE_NAME.step);
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
                                                                        originX.push({ interpolator: '', fraction: '', value: '' });
                                                                        originY.push({ interpolator: '', fraction: '', value: '' });
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
                                                                setData.repeating.push({
                                                                    ...options,
                                                                    propertyValues
                                                                });
                                                            }
                                                            valueFrom = keyframes[keyframes.length - 1].value;
                                                        }
                                                    }
                                                    else {
                                                        const propertyData: ObjectAnimatorData = {
                                                            name: `${subData.name}_${propertyName[i]}`,
                                                            ordering: 'sequentially',
                                                            repeating: [],
                                                            indefinite: false,
                                                            fill: false
                                                        };
                                                        const translateData: ObjectAnimatorData = {
                                                            name: `${propertyData.name}_origin`,
                                                            ordering: 'sequentially',
                                                            repeating: [],
                                                            indefinite: false,
                                                            fill: false
                                                        };
                                                        for (let j = 0; j < item.keyTimes.length - 1; j++) {
                                                            const propertyOptions: TemplateData = {
                                                                ...options,
                                                                propertyName: propertyName[i],
                                                                startOffset: j === 0 && item.keyTimes[j] > 0 ? (item.keyTimes[j] * item.duration).toString() : '',
                                                                propertyValues: false
                                                            };
                                                            let value = getValue(j, i);
                                                            const valueTo = getValue(j + 1, i);
                                                            if (valueTo) {
                                                                if (!$util.hasValue(value) && options.valueType === 'pathType' && group.pathData) {
                                                                    value = group.pathData;
                                                                }
                                                                else {
                                                                    continue;
                                                                }
                                                                propertyOptions.valueFrom = value || '';
                                                                const duration = (item.keyTimes[j + 1] - item.keyTimes[j]) * item.duration;
                                                                if (transformOrigin && transformOrigin[j]) {
                                                                    let translateName: string | undefined;
                                                                    let translateTo = 0;
                                                                    if (propertyName[i].endsWith('X')) {
                                                                        translateName = 'translateX';
                                                                        translateTo = transformOrigin[j].x;
                                                                    }
                                                                    else if (propertyName[i].endsWith('Y')) {
                                                                        translateName = 'translateY';
                                                                        translateTo = transformOrigin[j].y;
                                                                    }
                                                                    if (translateName) {
                                                                        translateData.repeating.push({
                                                                            propertyName: translateName,
                                                                            interpolator: createPathInterpolator($constS.KEYSPLINE_NAME.step),
                                                                            duration: duration.toString(),
                                                                            repeatCount: '0',
                                                                            valueType: 'floatType',
                                                                            valueTo: translateTo.toString()
                                                                        });
                                                                    }
                                                                }
                                                                propertyOptions.interpolator = this.getPathInterpolator(item.keySplines, j);
                                                                propertyOptions.duration = duration.toString();
                                                                propertyOptions.valueTo = valueTo;
                                                                propertyData.repeating.push(propertyOptions);
                                                            }
                                                        }
                                                        const fillAfter = getFillAfter(propertyName[i]);
                                                        if (fillAfter) {
                                                            propertyData.repeating.push(...fillAfter);
                                                        }
                                                        if (subData.AA) {
                                                            if (translateData.repeating.length) {
                                                                subData.AA.push(translateData);
                                                            }
                                                            subData.AA.push(propertyData);
                                                        }
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    const propertyOptions: TemplateData = {
                                                        ...options,
                                                        propertyName: propertyName[i],
                                                        interpolator: this.getPathInterpolator(item.keySplines, 0)
                                                    };
                                                    if (Array.isArray(values[0])) {
                                                        if (values.length > 1) {
                                                            const from = values[0][i];
                                                            if (from !== null) {
                                                                propertyOptions.valueFrom = from.toString();
                                                                valueFrom = propertyOptions.valueFrom;
                                                            }
                                                        }
                                                        const to = values[values.length - 1][i];
                                                        if (to !== null) {
                                                            propertyOptions.valueTo = to.toString();
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    else {
                                                        if (values.length > 1) {
                                                            propertyOptions.valueFrom = values[0].toString();
                                                            propertyOptions.valueTo = values[values.length - 1].toString();
                                                        }
                                                        else {
                                                            propertyOptions.valueFrom = item.from;
                                                            propertyOptions.valueTo = item.to;
                                                        }
                                                        valueFrom = propertyOptions.valueTo;
                                                    }
                                                    if (propertyOptions.valueTo) {
                                                        propertyOptions.propertyValues = false;
                                                        setData.repeating.push(propertyOptions);
                                                    }
                                                }
                                                {
                                                    const fillAfter = getFillAfter(propertyName[i]);
                                                    if (fillAfter) {
                                                        fillData.after.push(...fillAfter);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (indefinite.length) {
                                    const pathArray = setData.repeating.length ? indefiniteData.repeat : setData.repeating;
                                    for (const item of indefinite) {
                                        pathArray.push({
                                            propertyName: 'pathData',
                                            interpolator: this.getPathInterpolator(item.keySplines, 0),
                                            startOffset: item.delay > 0 ? item.delay.toString() : '',
                                            duration: item.duration.toString(),
                                            repeatCount: '0',
                                            valueType: 'pathType',
                                            valueFrom: item.from,
                                            valueTo: item.to
                                        });
                                    }
                                }
                                if (setData.repeating.length) {
                                    if (fillData.after.length) {
                                        if (setData.fill && subData.ordering === 'sequentially') {
                                            setData.fill.push(fillData);
                                        }
                                        else {
                                            setData.repeating.push(...fillData.after);
                                        }
                                    }
                                    if (setData.indefinite && indefiniteData.repeat.length) {
                                        setData.indefinite.push(indefiniteData);
                                    }
                                    if (subData.AA) {
                                        subData.AA.push(setData);
                                    }
                                }
                            }
                            if ($util.isArray(subData.AA)) {
                                targetSetData.A.push(subData);
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
                        if (item.rotateOrigin && item.rotateOrigin.angle) {
                            data.rotate.push({
                                src: data.src,
                                fromDegrees: item.rotateOrigin.angle.toString(),
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

    private parseVectorData(node: T, svg: $Svg, group: SvgGroup) {
        const groupData = this.createGroup(svg, group);
        for (const item of group) {
            const CCC: ExternalData[] = [];
            const DDD: StringMap[] = [];
            if ($SvgBuild.instanceOfShape(item)) {
                if (item.visible && item.path && item.path.value) {
                    CCC.push(this.createPath(node, svg, item, item.path));
                }
                else {
                    continue;
                }
            }
            else if ($SvgBuild.instanceOfImage(item)) {
                if (item.width === 0 || item.height === 0) {
                    const image = this.application.session.image.get(item.href);
                    if (image && image.width > 0 && image.height > 0) {
                        item.width = image.width;
                        item.height = image.height;
                        item.setRect();
                    }
                }
                item.extract(this.options.excludeFromTransform.image);
                if (item.visible || item.rotateOrigin) {
                    this.IMAGE_DATA.push(item);
                }
                continue;
            }
            else if ($SvgBuild.instanceOfContainer(item)) {
                if (item.visible && item.length) {
                    this.parseVectorData(node, svg, <SvgGroup> item);
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

    private createGroup(svg: $Svg, target: SvgGroup) {
        const group: TransformData[][] = [[]];
        const clipGroup: StringMap[] = [];
        const result: GroupData = {
            group,
            clipGroup,
            BB: []
        };
        if (svg !== target) {
            const name = target.name;
            const [transformHost, transformClient] = segmentTransforms(target.element, target.transform);
            if (transformHost.length) {
                const transformed: SvgTransform[] = [];
                for (let i = 0; i < transformHost.length; i++) {
                    group[0].push({
                        groupName: getGroupName(target, `transform_${i + 1}`),
                        ...createTransformData(transformHost[i])
                    });
                    transformed.push(...transformHost[i]);
                }
                target.transformed = transformed.reverse();
            }
            if (($SvgBuild.instanceOfG(target) || $SvgBuild.instanceOfUseSymbol(target)) && $util.hasValue(target.clipPath)) {
                this.createClipPath(svg, target, clipGroup, target.clipPath);
            }
            const groupName = `group_${name}`;
            this.queueAnimations(target, groupName, item => $SvgBuild.instanceOfAnimateTransform(item));
            group[0].push({
                groupName,
                ...createTransformData(transformClient)
            });
            if (($SvgBuild.instance(target) || $SvgBuild.instanceOfUse(target)) && (target.x !== 0 || target.y !== 0)) {
                group[0].push({
                    groupName: getGroupName(target, 'translate'),
                    translateX: target.x.toString(),
                    translateY: target.y.toString()
                });
            }
        }
        return result;
    }

    private createPath(node: T, svg: $Svg, target: SvgShape, path: $SvgPath) {
        const render: TransformData[][] = [[]];
        const clipElement: StringMap[] = [];
        const result: PathData = {
            name: path.name,
            render,
            clipElement,
            fillPattern: false
        };
        let clipped = false;
        if (path.transformResidual) {
            for (let i = 0; i < path.transformResidual.length; i++) {
                render[0].push({
                    groupName: getGroupName(target, `transform_${i + 1}`),
                    ...createTransformData(path.transformResidual[i])
                });
            }
        }
        if (path.rotateOrigin && (path.rotateOrigin.angle !== undefined || path.rotateOrigin.x !== 0 || path.rotateOrigin.y !== 0)) {
            render[0].push({
                groupName: getGroupName(target, 'rotate'),
                rotation: (path.rotateOrigin.angle || 0).toString(),
                pivotX: path.rotateOrigin.x.toString(),
                pivotY: path.rotateOrigin.y.toString()
            });
        }
        if ($util.hasValue(path.clipPath)) {
            clipped = this.createClipPath(svg, target, clipElement, path.clipPath);
        }
        const groupName = `group_${target.name}`;
        if (this.queueAnimations(target, groupName, item => $SvgBuild.instanceOfAnimateTransform(item)) || clipped) {
            render[0].push({ groupName });
        }
        if ($SvgBuild.instanceOfUse(target) && (target.x !== 0 || target.y !== 0)) {
            render[0].push({
                groupName: getGroupName(target, 'translate'),
                translateX: target.x.toString(),
                translateY: target.y.toString()
            });
        }
        for (const attr in path) {
            if ($util.isString(path[attr])) {
                result[attr] = path[attr];
            }
        }
        const opacity = getOuterOpacity(target);
        result.fillOpacity = (parseFloat(result.fillOpacity || '1') * opacity).toString();
        result.strokeOpacity = (parseFloat(result.strokeOpacity || '1') * opacity).toString();
        ['fill', 'stroke'].forEach(attr => {
            const pattern = `${attr}Pattern`;
            const value = result[pattern];
            if (value) {
                const gradient = svg.patterns.gradient.get(value);
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
                            const gradients = Resource.createBackgroundGradient(node, [gradient], path);
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
                if (!result[attr]) {
                    result[attr] = result.color;
                }
            }
            const colorName = Resource.addColor(result[attr]);
            if (colorName !== '') {
                result[attr] = `@color/${colorName}`;
            }
            result[pattern] = false;
        });
        switch (result.fillRule) {
            case 'evenodd':
                result.fillRule = 'evenOdd';
                break;
            case 'nonzero':
                result.fillRule = 'nonZero';
                break;
        }
        this.queueAnimations(
            target,
            target.name,
            item => $SvgBuild.instanceOfAnimate(item) && item.attributeName !== 'clip-path',
            result.value
        );
        return result;
    }

    private createClipPath(svg: $Svg, target: SvgGroup | SvgShape | SvgUseSymbol, clip: StringMap[], clipPath: string) {
        if (clipPath.charAt(0) === '#') {
            const element = svg.patterns.clipPath.get(clipPath);
            if (element) {
                const g = new $SvgG(element);
                g.build(this.options.excludeFromTransform, partitionTransforms);
                g.synchronize();
                g.each((child: SvgShape) => {
                    if (child.path && child.path.value) {
                        clip.push({
                            clipName: child.name,
                            clipPathData: child.path.value
                        });
                        this.queueAnimations(
                            child,
                            child.name,
                            item => $SvgBuild.instanceOfAnimate(item),
                            child.path.value
                        );
                    }
                });
                return true;
            }
        }
        else {
            const clipName = `clip_path_${target.name}`;
            clip.push({
                clipName,
                clipPathData: clipPath
            });
            this.queueAnimations(
                target,
                clipName,
                item => $SvgBuild.instanceOfAnimate(item) && item.attributeName === 'clip-path',
                clipPath
            );
            return true;
        }
        return false;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, void>, pathData = '') {
        const animate = svg.animation.filter(predicate).filter(item => !item.paused && item.begin.length > 0 && (item.duration > 0 || $SvgBuild.instanceOfSet(item) && item.duration === 0));
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
        return this.options.vectorAnimateInterpolator || INTERPOLATOR_ANDROID.LINEAR;
    }
}