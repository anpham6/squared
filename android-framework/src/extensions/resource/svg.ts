import { TemplateData, TemplateDataA, TemplateDataAA, TemplateDataAAA } from '../../../../src/base/@types/application';
import { SvgPoint, SvgTransform } from '../../../../src/svg/@types/object';
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
type SvgView = squared.svg.SvgView;

interface AnimateGroup {
    element: SVGGraphicsElement;
    animate: SvgAnimation[];
    pathData?: string;
}

interface AnimatedTargetData extends TemplateDataAA {
    name: string;
    animationName: string;
}

interface SetOrdering {
    ordering: string;
}

interface AnimatedSetData extends SetOrdering, TemplateDataAAA {
    name: string;
    repeating: TemplateData[];
    indefinite: TemplateData[];
    fill: TemplateData[];
}

interface FillReplaceData extends SetOrdering, TemplateData {
    replace: TemplateData[];
}

interface IndefiniteData extends SetOrdering, TemplateData {
    name: string;
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
    clipPaths: StringMap[];
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

const $color = squared.lib.color;
const $dom = squared.lib.dom;
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

const INTERPOLATOR_XML = `
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
    'value': 'pathData'
};

const TEMPLATES: ObjectMap<StringMap> = {};
const STORED = Resource.STORED as ResourceStoredMapAndroid;

function getGroupName(svg: SvgView, suffix: string) {
    return `${svg.name}_${suffix}`;
}

function createPathInterpolator(keySplines: string[] | undefined, index: number) {
    if (keySplines && keySplines[index]) {
        if (INTERPOLATOR_ANDROID[keySplines[index]]) {
            return INTERPOLATOR_ANDROID[keySplines[index]];
        }
        else {
            const interpolatorName = `path_interpolator_${$util.convertWord(keySplines[index])}`;
            if (!STORED.animators.has(interpolatorName)) {
                const xml = $util.formatString(INTERPOLATOR_XML, ...keySplines[index].split(' '));
                STORED.animators.set(interpolatorName, xml);
            }
            return `@anim/${interpolatorName}`;
        }
    }
    return '';
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
        const rotations = transform[0].css ? [] : $utilS.getTransformRotate(element);
        rotations.reverse();
        const partition = transform.slice(0).reverse();
        const typeIndex = new Set<number>();
        let current: SvgTransform[] = [];
        function restart(item?: SvgTransform) {
            if (current.length) {
                current.reverse();
                host.push(current);
                current = [];
                if (item) {
                    current.push(item);
                }
                typeIndex.clear();
            }
        }
        for (let i = 0; i < partition.length; i++) {
            const item = partition[i];
            let prerotate = host.length === 0 && current.length === 0;
            if (!prerotate && typeIndex.has(item.type)) {
                const previous = current[current.length - 1];
                if (item.type === previous.type) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            previous.matrix.e += item.matrix.e;
                            previous.matrix.f += item.matrix.f;
                            continue;
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            previous.matrix.a *= item.matrix.a;
                            previous.matrix.d *= item.matrix.d;
                            continue;
                    }
                }
                restart(item);
            }
            else {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        if (prerotate) {
                            client.push(item);
                        }
                        else {
                            current.push(item);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (prerotate) {
                            client.push(item);
                        }
                        else {
                            current.push(item);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_MATRIX:
                        if (prerotate && item.matrix.b === 0 && item.matrix.c === 0) {
                            client.push(item);
                        }
                        else {
                            current.push(item);
                            prerotate = false;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (rotations.length) {
                            const origin = rotations.shift() as SvgPoint;
                            if (origin.angle === item.angle) {
                                item.origin = origin;
                            }
                        }
                        if (prerotate && rx === ry && (i === 0 || client[client.length - 1].type === SVGTransform.SVG_TRANSFORM_ROTATE)) {
                            client.push(item);
                        }
                        else {
                            if (!prerotate) {
                                restart();
                            }
                            current.push(item);
                            continue;
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        current.push(item);
                        prerotate = false;
                        break;
                }
            }
            if (!prerotate) {
                typeIndex.add(item.type);
            }
        }
        restart();
        return [host, client];
    }
    return [[], transform];
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
        vectorAnimateInterpolator: INTERPOLATOR_ANDROID.LINEAR,
        vectorAnimateAlwaysUseKeyframes: true
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
                        viewportWidth: svg.viewBox.width > 0 ? svg.viewBox.width.toString() : false,
                        viewportHeight: svg.viewBox.height > 0 ? svg.viewBox.height.toString() : false,
                        alpha: parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : false,
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
                                    let values = transformMap.get(sequential.value);
                                    if (values === undefined) {
                                        values = [];
                                        transformMap.set(sequential.value, values);
                                    }
                                    values.push(item);
                                }
                                else {
                                    let values = sequentialMap.get(sequential.value);
                                    if (values === undefined) {
                                        values = [];
                                        sequentialMap.set(sequential.value, values);
                                    }
                                    values.push(item);
                                }
                            }
                            else if (item.repeatCount === -1 || item.fillMode < $constS.FILL_MODE.FORWARDS) {
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
                            const subData: TemplateDataAA = {
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
                                    ordering = $dom.getDataSet(group.element, 'android').ordering || this.options.vectorAnimateOrdering || 'together';
                                }
                                const setData: AnimatedSetData = {
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
                                const fillData: FillReplaceData = {
                                    ordering: 'together',
                                    replace: []
                                };
                                const [indefinite, repeating] = sequential ? $util.partitionArray(items, animate => animate.repeatCount === -1) : [[], items];
                                if (indefinite.length === 1) {
                                    repeating.push(indefinite[0]);
                                    indefinite.length = 0;
                                }
                                for (const item of repeating) {
                                    const options: TemplateData = {
                                        startOffset: item.begin.length && item.begin[0] > 0 ? item.begin[0].toString() : '',
                                        duration: item.duration.toString()
                                    };
                                    if ($SvgBuild.instanceOfSet(item)) {
                                        if (item.to) {
                                            options.propertyName = ATTRIBUTE_ANDROID[item.attributeName];
                                            if (options.propertyName) {
                                                options.propertyValues = false;
                                                if (item.duration === 0) {
                                                    options.duration = '1';
                                                }
                                                options.repeatCount = '0';
                                                options.valueTo = item.to.toString();
                                                setData.repeating.push(options);
                                            }
                                        }
                                    }
                                    else {
                                        options.repeatCount = item.repeatCount !== -1 ? Math.ceil(item.repeatCount - 1).toString() : '-1';
                                        if (item.alternate) {
                                            options.repeatMode = 'reverse';
                                        }
                                        const dataset = item.element ? $dom.getDataSet(item.element, 'android') : {};
                                        let propertyName: string[] | undefined;
                                        let values: string[] | (null[] | number[])[] | undefined;
                                        switch (item.attributeName) {
                                            case 'transform':
                                            case 'fill':
                                            case 'stroke':
                                                break;
                                            case 'opacity':
                                            case 'stroke-opacity':
                                            case 'fill-opacity':
                                                options.valueType = 'floatType';
                                                break;
                                            case 'stroke-width':
                                                options.valueType = 'intType';
                                                break;
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
                                                options.valueType = 'pathType';
                                                break;
                                            default:
                                                continue;
                                        }
                                        if ($SvgBuild.instanceOfAnimateTransform(item)) {
                                            switch (item.type) {
                                                case SVGTransform.SVG_TRANSFORM_ROTATE: {
                                                    values = $SvgAnimateTransform.toRotateList(item.values);
                                                    propertyName = ['rotation', 'pivotX', 'pivotY'];
                                                    break;
                                                }
                                                case SVGTransform.SVG_TRANSFORM_SCALE: {
                                                    values = $SvgAnimateTransform.toScaleList(item.values);
                                                    propertyName = ['scaleX', 'scaleY'];
                                                    break;
                                                }
                                                case SVGTransform.SVG_TRANSFORM_TRANSLATE: {
                                                    values = $SvgAnimateTransform.toTranslateList(item.values);
                                                    propertyName = ['translateX', 'translateY'];
                                                    break;
                                                }
                                            }
                                            options.valueType = 'floatType';
                                        }
                                        else {
                                            const attribute: string = ATTRIBUTE_ANDROID[item.attributeName];
                                            switch (options.valueType) {
                                                case 'intType': {
                                                    values = item.values.map(value => $util.convertInt(value).toString());
                                                    if (attribute) {
                                                        propertyName = [attribute];
                                                    }
                                                }
                                                case 'floatType': {
                                                    values = item.values.map(value => $util.convertFloat(value).toString());
                                                    if (attribute) {
                                                        propertyName = [attribute];
                                                    }
                                                    break;
                                                }
                                                case 'pathType': {
                                                    if (group.pathData) {
                                                        pathType: {
                                                            values = item.values.slice(0);
                                                            if (item.attributeName === 'points') {
                                                                for (let i = 0; i < values.length; i++) {
                                                                    const value = values[i];
                                                                    if (value !== '') {
                                                                        const points = $SvgBuild.fromNumberList($SvgBuild.toNumberList(value));
                                                                        if (points.length) {
                                                                            values[i] = item.parent && item.parent.element.tagName === 'polygon' ? $SvgPath.getPolygon(points) : $SvgPath.getPolyline(points);
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
                                                                            const commandStart = pathPoints[0];
                                                                            const commandEnd = pathPoints[pathPoints.length - 1];
                                                                            const [firstPoint, lastPoint] = [commandStart.points[0], commandEnd.points[commandEnd.points.length - 1]];
                                                                            let recalibrate = false;
                                                                            if (x !== undefined) {
                                                                                switch (item.attributeName) {
                                                                                    case 'x':
                                                                                        x -= firstPoint.x;
                                                                                        recalibrate = true;
                                                                                        break;
                                                                                    case 'x1':
                                                                                    case 'cx':
                                                                                        firstPoint.x = x;
                                                                                        commandStart.coordinates[0] = x;
                                                                                        break;
                                                                                    case 'x2':
                                                                                        lastPoint.x = x;
                                                                                        commandEnd.coordinates[0] = x;
                                                                                        break;
                                                                                }
                                                                            }
                                                                            if (y !== undefined) {
                                                                                switch (item.attributeName) {
                                                                                    case 'y':
                                                                                        y -= firstPoint.y;
                                                                                        recalibrate = true;
                                                                                        break;
                                                                                    case 'y1':
                                                                                    case 'cy':
                                                                                        firstPoint.y = y;
                                                                                        commandStart.coordinates[1] = y;
                                                                                        break;
                                                                                    case 'y2':
                                                                                        lastPoint.y = y;
                                                                                        commandEnd.coordinates[1] = y;
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
                                                }
                                                default: {
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
                                                }
                                            }
                                        }
                                        if (values && propertyName) {
                                            if (item.keySplines === undefined) {
                                                options.interpolator = dataset.interpolator ? INTERPOLATOR_ANDROID[dataset.interpolator] || dataset.interpolator : this.options.vectorAnimateInterpolator;
                                            }
                                            const keyName = index !== 1 ? JSON.stringify(options) : '';
                                            for (let i = 0; i < propertyName.length; i++) {
                                                const propertyOptions = { ...options };
                                                let valueEnd = '';
                                                if (node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW && propertyOptions.valueType !== 'pathType' && item.sequential === undefined && item.keyTimes.length > 1 && (this.options.vectorAnimateAlwaysUseKeyframes || !item.fromToType)) {
                                                    const propertyValues = animatorMap.get(keyName) || [];
                                                    const keyframes: KeyFrame[] = [];
                                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                                        let value: string | undefined;
                                                        if (Array.isArray(values[j])) {
                                                            const fromTo = values[j][i];
                                                            if (fromTo !== undefined) {
                                                                value = fromTo !== null ? fromTo.toString() : '';
                                                            }
                                                        }
                                                        else {
                                                            value = values[j].toString();
                                                        }
                                                        if (value !== undefined) {
                                                            const interpolator = createPathInterpolator(item.keySplines, j - 1);
                                                            if (item.keyTimes[j] === 0 && value === '') {
                                                                keyframes.push({
                                                                    interpolator,
                                                                    fraction: '',
                                                                    value: ''
                                                                });
                                                            }
                                                            else {
                                                                keyframes.push({
                                                                    interpolator,
                                                                    fraction: item.keyTimes[j].toString(),
                                                                    value
                                                                });
                                                            }
                                                        }
                                                    }
                                                    if (keyframes.length) {
                                                        propertyValues.push({
                                                            propertyName: propertyName[i],
                                                            keyframes
                                                        });
                                                        if (!animatorMap.has(keyName)) {
                                                            if (keyName !== '') {
                                                                animatorMap.set(keyName, propertyValues);
                                                            }
                                                            propertyOptions.propertyValues = propertyValues;
                                                            setData.repeating.push(propertyOptions);
                                                        }
                                                        valueEnd = keyframes[keyframes.length - 1].value;
                                                    }
                                                }
                                                else {
                                                    propertyOptions.propertyName = propertyName[i];
                                                    propertyOptions.interpolator = createPathInterpolator(item.keySplines, 0);
                                                    if (Array.isArray(values[0])) {
                                                        let to: string | number | null = null;
                                                        if (item.duration > 0) {
                                                            if (values.length > 1) {
                                                                const from = values[0][i];
                                                                if (from !== null) {
                                                                    propertyOptions.valueFrom = from.toString();
                                                                    valueEnd = propertyOptions.valueFrom;
                                                                }
                                                            }
                                                            to = values[values.length - 1][i];
                                                        }
                                                        else if (item.duration === 0 && item.keyTimes[0] === 0) {
                                                            to = values[0][i];
                                                            propertyOptions.repeatCount = '0';
                                                        }
                                                        if (to !== null) {
                                                            propertyOptions.valueTo = to.toString();
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                    }
                                                    else {
                                                        if (item.duration > 0) {
                                                            if (values.length > 1) {
                                                                propertyOptions.valueFrom = values[0].toString();
                                                            }
                                                            propertyOptions.valueTo = values[values.length - 1].toString();
                                                        }
                                                        else if (item.duration === 0 && item.keyTimes[0] === 0) {
                                                            propertyOptions.valueTo = values[0].toString();
                                                            propertyOptions.repeatCount = '0';
                                                        }
                                                        else {
                                                            continue;
                                                        }
                                                        valueEnd = propertyOptions.valueTo;
                                                    }
                                                    propertyOptions.propertyValues = false;
                                                    setData.repeating.push(propertyOptions);
                                                }
                                                if (item.fillMode < $constS.FILL_MODE.FORWARDS && item.sequential === undefined) {
                                                    const parent = item.parent;
                                                    if (parent) {
                                                        let valueTo: string | undefined;
                                                        if ($SvgBuild.instanceOfAnimateTransform(item)) {
                                                            switch (propertyName[i]) {
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
                                                        else if ($SvgBuild.instanceOfShape(parent) && parent.path) {
                                                            let css = '';
                                                            for (const attr in ATTRIBUTE_ANDROID) {
                                                                if (ATTRIBUTE_ANDROID[attr] === propertyName[i]) {
                                                                    css = $util.convertCamelCase(attr);
                                                                    break;
                                                                }
                                                            }
                                                            if (css !== '') {
                                                                valueTo = parent.path[css];
                                                            }
                                                        }
                                                        if ($util.hasValue(valueTo)) {
                                                            fillData.replace.push({
                                                                propertyName: propertyName[i],
                                                                repeatCount: '0',
                                                                duration: '1',
                                                                valueType: options.valueType || '',
                                                                valueFrom: options.valueType === 'pathType' ? valueEnd : '',
                                                                valueTo: (valueTo as string).toString()
                                                            });
                                                        }
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
                                            interpolator: createPathInterpolator(item.keySplines, 0),
                                            startOffset: item.begin.length && item.begin[0] > 0 ? item.begin[0].toString() : '',
                                            duration: item.duration.toString(),
                                            repeatCount: '0',
                                            valueType: 'pathType',
                                            valueFrom: item.from,
                                            valueTo: item.to
                                        });
                                    }
                                }
                                if (setData.repeating.length) {
                                    if (fillData.replace.length) {
                                        if (subData.ordering === 'sequentially') {
                                            setData.fill.push(fillData);
                                        }
                                        else {
                                            setData.repeating.push(...fillData.replace);
                                        }
                                    }
                                    if (indefiniteData.repeat.length) {
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
        const groupData = this.createGroup(group, svg !== group);
        for (let i = 0; i < group.children.length; i++) {
            const item = group.children[i];
            const CCC: ExternalData[] = [];
            const DDD: TemplateData[] = [];
            if ($SvgBuild.instanceOfShape(item)) {
                if (item.visible && item.path && item.path.value) {
                    CCC.push(this.createPath(node, svg, item, item.path));
                }
                else {
                    continue;
                }
            }
            else if ($SvgBuild.instanceOfImage(item)) {
                item.extract(this.options.excludeFromTransform.image);
                if (item.visible || item.rotateOrigin) {
                    this.IMAGE_DATA.push(item);
                }
                continue;
            }
            else if ($SvgBuild.instanceOfContainer(item)) {
                if (item.length) {
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

    private createGroup(target: SvgGroup, transformable = false) {
        const group: TransformData[][] = [[]];
        const result: GroupData = {
            group,
            BB: []
        };
        if (transformable) {
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
        const clipPaths: StringMap[] = [];
        const result: PathData = {
            name: path.name,
            render,
            clipPaths,
            fillPattern: false
        };
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
        const groupName = `group_${target.name}`;
        if (this.queueAnimations(target, groupName, item => $SvgBuild.instanceOfAnimateTransform(item))) {
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
        const opacity = $SvgBuild.getContainerOpacity(target);
        result.fillOpacity = (parseFloat(result.fillOpacity || '1') * opacity).toString();
        result.strokeOpacity = (parseFloat(result.strokeOpacity || '1') * opacity).toString();
        if (path.clipPath) {
            const clipPath = svg.patterns.clipPath.get(path.clipPath);
            if (clipPath) {
                const g = new $SvgG(clipPath);
                g.build(this.options.excludeFromTransform, partitionTransforms);
                g.synchronize();
                g.each((child: SvgShape) => {
                    if (child.path && child.path.value) {
                        clipPaths.push({
                            clipPathName: child.name,
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
            }
        }
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
            item => $SvgBuild.instanceOfAnimate(item),
            result.value
        );
        return result;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, void>, pathData = '') {
        const animate = svg.animation.filter(predicate).filter(item => !item.paused && item.begin.length > 0 && item.duration >= 0);
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
}