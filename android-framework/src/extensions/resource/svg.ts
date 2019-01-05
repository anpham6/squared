import { TemplateData, TemplateDataA, TemplateDataAA, TemplateDataAAA } from '../../../../src/base/@types/application';
import { SvgTransform } from '../../../../src/svg/@types/object';
import { ResourceStoredMapAndroid } from '../../@types/application';

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

import $SvgAnimate = squared.svg.SvgAnimate;
import $SvgAnimateMotion = squared.svg.SvgAnimateMotion;
import $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import $SvgAnimation = squared.svg.SvgAnimation;
import $SvgBuild = squared.svg.SvgBuild;
import $SvgCreate = squared.svg.SvgCreate;
import $SvgGroup = squared.svg.SvgGroup;
import $SvgGroupViewBox = squared.svg.SvgGroupViewBox;
import $SvgImage = squared.svg.SvgImage;
import $SvgPath = squared.svg.SvgPath;
import $SvgShape = squared.svg.SvgShape;
import $SvgUse = squared.svg.SvgUse;
import $utilS = squared.svg.lib.util;

interface ResourceSvgOptions {
    exludeFromTransform: number[];
    vectorAnimateOrdering: string;
    vectorAnimateInterpolator: string;
    vectorAnimateAlwaysUseKeyframes: boolean;
}

type AnimateGroup = {
    element: SVGGraphicsElement;
    animate: $SvgAnimation[];
    pathData?: string;
};

type AnimatedTargetData = {
    name: string;
    animationName: string;
};

type AnimatedSetData = {
    ordering: string;
    repeating: TemplateData[],
    indefinite: TemplateData[],
    fill: TemplateData[] | boolean
};

interface TransformBase<T> {
    translateX?: T;
    translateY?: T;
    scaleX?: T;
    scaleY?: T;
    rotation?: T;
    pivotX?: T;
    pivotY?: T;
}

interface TransformData extends Required<TransformBase<number>> {
    operations: number[];
}

interface GroupData extends TemplateDataAA, TransformBase<string> {
    name: string;
    AA: any[];
}

interface PropertyValue {
    propertyName: string;
    keyframes: KeyFrame[];
}

interface KeyFrame {
    fraction: string;
    value: string;
}

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

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

function queueAnimations(map: Map<string, AnimateGroup>, name: string, svg: squared.svg.SvgBase, predicate: IteratorPredicate<$SvgAnimation, void>, pathData = '') {
    const animate = svg.animate.filter(predicate).filter(item => item.begin.length > 0);
    if (animate.length) {
        map.set(name, {
            element: svg.element,
            animate,
            pathData
        });
        return true;
    }
    return false;
}

function createTransformData(element: SVGGraphicsElement, transform?: SvgTransform[]) {
    const result: TransformData = {
        operations: [],
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        pivotX: 0,
        pivotY: 0,
        translateX: 0,
        translateY: 0
    };
    if (transform === undefined) {
        transform = $utilS.getTransform(element) || [];
    }
    for (const item of transform) {
        if (!result.operations.includes(item.type)) {
            const m = item.matrix;
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    if (m.a !== 1 || m.d !== 1) {
                        result.scaleX = m.a;
                        result.scaleY = m.d;
                        result.operations.push(item.type);
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    if (item.angle !== 0) {
                        result.rotation = item.angle;
                        const origin = $utilS.getRotateOrigin(element);
                        result.pivotX = origin.x;
                        result.pivotY = origin.y;
                        result.operations.push(item.type);
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    if (m.e !== 0 || m.f !== 0) {
                        result.translateX = m.e;
                        result.translateY = m.f;
                        result.operations.push(item.type);
                    }
                    break;
            }
        }
    }
    return result;
}

function getSvgOffset(element: SVGGraphicsElement, outerParent: SVGSVGElement) {
    let parent = element.parentElement;
    let x = 0;
    let y = 0;
    while (parent instanceof SVGSVGElement && parent !== outerParent) {
        const transform = createTransformData(parent);
        x += parent.x.baseVal.value + transform.translateX;
        y += parent.y.baseVal.value + transform.translateY;
        parent = parent.parentElement;
    }
    return { x, y };
}

export default class ResourceSvg<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceSvgOptions = {
        exludeFromTransform: [],
        vectorAnimateOrdering: 'together',
        vectorAnimateInterpolator: INTERPOLATOR_ANDROID.LINEAR,
        vectorAnimateAlwaysUseKeyframes: true
    };

    public readonly eventOnly = true;

    public beforeInit() {
        if (Object.keys(TEMPLATES).length === 0) {
            TEMPLATES.ANIMATED = $xml.parseTemplate(ANIMATEDVECTOR_TMPL);
            TEMPLATES.LAYER_LIST = $xml.parseTemplate(LAYERLIST_TMPL);
            TEMPLATES.SET_OBJECTANIMATOR = $xml.parseTemplate(SETOBJECTANIMATOR_TMPL);
            TEMPLATES.VECTOR = $xml.parseTemplate(VECTOR_TMPL);
        }
        if ($SvgBuild) {
            $SvgCreate.setName();
        }
        this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement) {
                const svg = new squared.svg.Svg(<SVGSVGElement> node.element);
                const namespace = new Set<string>();
                const animateMap = new Map<string, AnimateGroup>();
                const templateName = `${node.tagName.toLowerCase()}_${node.controlId}_viewbox`;
                const images: $SvgImage[] = [];
                let drawable = '';
                let vectorName = '';
                if (svg.length) {
                    const createGroup = (group: $SvgGroup | $SvgShape, transformable = false, rotateOrigin?: PointR) => {
                        const name = `group_${group.element === svg.element ? $SvgCreate.setName(group.element) : group.name}`;
                        const data: GroupData = {
                            name,
                            AA: []
                        };
                        let x = 0;
                        let y = 0;
                        let viewBox = false;
                        if (group instanceof $SvgGroupViewBox) {
                            x = group.x;
                            y = group.y;
                            viewBox = true;
                        }
                        if (transformable) {
                            const transform = createTransformData(group.element);
                            if (transform.operations.length) {
                                if (transform.scaleX !== 1) {
                                    data.scaleX = transform.scaleX.toString();
                                }
                                if (transform.scaleY !== 1) {
                                    data.scaleY = transform.scaleY.toString();
                                }
                                if (transform.rotation !== 0) {
                                    data.rotation = transform.rotation.toString();
                                    data.pivotX = transform.pivotX.toString();
                                    data.pivotY = transform.pivotY.toString();
                                }
                                x += transform.translateX;
                                y += transform.translateY;
                            }
                        }
                        else if (rotateOrigin && rotateOrigin.angle !== undefined) {
                            data.rotation = rotateOrigin.angle.toString();
                            data.pivotX = rotateOrigin.x.toString();
                            data.pivotY = rotateOrigin.y.toString();
                        }
                        if (x !== 0) {
                            data.translateX = x.toString();
                        }
                        if (y !== 0) {
                            data.translateY = y.toString();
                        }
                        queueAnimations(
                            animateMap,
                            name,
                            group,
                            item => item instanceof $SvgAnimateTransform || viewBox && (item.attributeName === 'x' || item.attributeName === 'y')
                        );
                        return data;
                    };
                    const createPath = (target: $SvgShape, path: $SvgPath) => {
                        const name = path.name;
                        const clipPaths: StringMap[] = [];
                        const useTarget = target instanceof $SvgUse;
                        if (path.clipPath !== '') {
                            const clipPath = svg.defs.clipPath.get(path.clipPath);
                            if (clipPath) {
                                clipPath.each((child: $SvgShape) => {
                                    if (child.path) {
                                        if (child.path.d === '') {
                                            child.path.build(this.options.exludeFromTransform);
                                        }
                                        clipPaths.push({ name: child.name, d: child.path.d });
                                        queueAnimations(
                                            animateMap,
                                            child.name,
                                            child,
                                            item => !(item instanceof $SvgAnimateTransform || item instanceof $SvgAnimateMotion),
                                            child.path.d
                                        );
                                    }
                                });
                            }
                        }
                        const groupName = `group_${target.name}`;
                        const data: TransformBase<string> & StringMap = { name: groupName };
                        const dataResidual: TransformBase<string> & StringMap = { name: `residual_${target.name}` };
                        const exclusions = useTarget ? ['x', 'y'] : [];
                        let groupGuard = queueAnimations(
                            animateMap,
                            groupName,
                            target,
                            item => item instanceof $SvgAnimateTransform || useTarget && (item.attributeName === 'x' || item.attributeName === 'y')
                        );
                        let residualGuard = false;
                        if (target instanceof $SvgUse && (target.x !== 0 || target.y !== 0)) {
                            data.translateX = target.x.toString();
                            data.translateY = target.y.toString();
                            groupGuard = true;
                        }
                        if (path.rotateOrigin && (path.rotateOrigin.angle !== undefined || path.rotateOrigin.x !== 0 || path.rotateOrigin.y !== 0)) {
                            data.rotation = (path.rotateOrigin.angle || 0).toString();
                            data.pivotX = path.rotateOrigin.x.toString();
                            data.pivotY = path.rotateOrigin.y.toString();
                            groupGuard = true;
                        }
                        if (path.transformResidual) {
                            const transform = createTransformData(path.element, path.transformResidual);
                            for (const attr in transform) {
                                if (typeof transform[attr] === 'number' && transform[attr] !== 0) {
                                    dataResidual[attr] = transform[attr].toString();
                                }
                            }
                            residualGuard = true;
                        }
                        const result: $SvgPath = {
                            name,
                            fillGradient: false,
                            BBB: clipPaths,
                            CCC: groupGuard ? [data] : false,
                            DDD: groupGuard ? [{ name: data.name }] : false,
                            EEE: residualGuard ? [dataResidual] : false,
                            FFF: residualGuard ? [{ name: dataResidual.name }] : false
                        } as any;
                        for (const attr in path) {
                            if ($util.isString(path[attr])) {
                                result[attr] = path[attr];
                            }
                        }
                        ['fill', 'stroke'].forEach(attr => {
                            if ($util.isString(result[attr])) {
                                if (result[attr].charAt(0) === '@') {
                                    const gradient = svg.defs.gradient.get(result[attr]);
                                    if (gradient) {
                                        switch (path.element.tagName) {
                                            case 'path':
                                                if (!/[zZ]\s*$/.test(result.d)) {
                                                    break;
                                                }
                                            case 'rect':
                                            case 'polygon':
                                            case 'polyline':
                                            case 'circle':
                                            case 'ellipse':
                                                const gradients = Resource.createBackgroundGradient(node, [gradient], path);
                                                result[attr] = '';
                                                result[`${attr}Gradient`] = [{ gradients }];
                                                namespace.add('aapt');
                                                return;
                                        }
                                    }
                                    else {
                                        result[attr] = result.color;
                                    }
                                }
                                const colorName = Resource.addColor(result[attr]);
                                if (colorName !== '') {
                                    result[attr] = `@color/${colorName}`;
                                }
                            }
                        });
                        if (result.fillRule !== '') {
                            switch (result.fillRule) {
                                case 'evenodd':
                                    result.fillRule = 'evenOdd';
                                    break;
                                default:
                                    result.fillRule = 'nonZero';
                                    break;
                            }
                        }
                        queueAnimations(
                            animateMap,
                            name,
                            target,
                            item => !(item instanceof $SvgAnimateTransform || item instanceof $SvgAnimateMotion) && !exclusions.includes(item.attributeName),
                            result.d
                        );
                        return result;
                    };
                    queueAnimations(
                        animateMap,
                        svg.name,
                        svg,
                        item => item.attributeName === 'opacity'
                    );
                    let groups: GroupData[] = [];
                    let groupData: GroupData | undefined;
                    for (let i = 0; i < svg.children.length; i++) {
                        const group = svg.children[i];
                        if (group.element !== svg.element) {
                            group.synchronize(false);
                            groupData = createGroup(group, true);
                        }
                        else {
                            groupData = createGroup(group);
                        }
                        groups.push(groupData);
                        for (const item of group.children) {
                            if (item instanceof $SvgImage) {
                                item.build(this.options.exludeFromTransform);
                                if (item.visible || item.rotateOrigin) {
                                    images.push(item);
                                }
                            }
                            else if (item instanceof $SvgShape && item.visible) {
                                item.build(this.options.exludeFromTransform);
                                if (item.path && item.path.d !== '') {
                                    item.synchronize(false);
                                    groupData.AA.push(createPath(item, item.path));
                                }
                            }
                        }
                    }
                    groups = groups.filter(item => item.AA.length > 0);
                    if (groups.length) {
                        const xml = $xml.createTemplate(TEMPLATES.VECTOR, <TemplateDataA> {
                            namespace: namespace.size ? getXmlNs(...Array.from(namespace)) : '',
                            name: svg.name,
                            width: $util.formatPX(svg.width),
                            height: $util.formatPX(svg.height),
                            viewportWidth: svg.viewBoxWidth > 0 ? svg.viewBoxWidth.toString() : false,
                            viewportHeight: svg.viewBoxHeight > 0 ? svg.viewBoxHeight.toString() : false,
                            alpha: svg.opacity < 1 ? svg.opacity.toString() : false,
                            A: groups
                        });
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = templateName + (images.length ? '_vector' : '');
                            STORED.drawables.set(vectorName, xml);
                        }
                        if (animateMap.size) {
                            function getAnimatedFilenamePrefix(suffix = '') {
                                return `${templateName}_animation${(images.length ? '_vector' : '') + (suffix !== '' ? `_${suffix}` : '')}`;
                            }
                            const data: TemplateDataA = {
                                vectorName,
                                A: []
                            };
                            for (const [name, group] of animateMap.entries()) {
                                const targetData: AnimatedTargetData = {
                                    name,
                                    animationName: getAnimatedFilenamePrefix(name)
                                };
                                const targetSetData: TemplateDataA = { A: [] };
                                const animatorMap = new Map<string, PropertyValue[]>();
                                const sequentialMap = new Map<string, $SvgAnimate[]>();
                                const together: $SvgAnimation[] = [];
                                const fillReplace: $SvgAnimation[] = [];
                                const transformMap = new Map<string, $SvgAnimateTransform[]>();
                                const togetherTargets: $SvgAnimation[][] = [];
                                const fillReplaceTargets: $SvgAnimation[][] = [];
                                const transformTargets: $SvgAnimation[][] = [];
                                for (const item of group.animate as $SvgAnimate[]) {
                                    if (item.sequential) {
                                        if (item instanceof $SvgAnimateTransform) {
                                            let values = transformMap.get(item.sequential.name);
                                            if (values === undefined) {
                                                values = [];
                                                transformMap.set(item.sequential.name, values);
                                            }
                                            values.push(item);
                                        }
                                        else {
                                            let values = sequentialMap.get(item.sequential.name);
                                            if (values === undefined) {
                                                values = [];
                                                sequentialMap.set(item.sequential.name, values);
                                            }
                                            values.push(item);
                                        }
                                    }
                                    else if (!item.fillFreeze) {
                                        fillReplace.push(item);
                                    }
                                    else {
                                        together.push(item);
                                    }
                                }
                                if (together.length) {
                                    togetherTargets.push(together);
                                }
                                for (const item of sequentialMap.values()) {
                                    togetherTargets.push(item.sort((a, b) => a.sequential && b.sequential && a.sequential.value >= b.sequential.value ? 1 : -1));
                                }
                                for (const item of transformMap.values()) {
                                    transformTargets.push(item.sort((a, b) => a.sequential && b.sequential && a.sequential.value >= b.sequential.value ? 1 : -1));
                                }
                                for (const item of fillReplace) {
                                    fillReplaceTargets.push([item]);
                                }
                                [togetherTargets, fillReplaceTargets, transformTargets].forEach((targets, index) => {
                                    const subData: TemplateDataAA = {
                                        ordering: index === 2 ? 'sequentially' : 'together',
                                        AA: []
                                    };
                                    for (const items of targets) {
                                        let ordering: string;
                                        let sequential = false;
                                        if (index === 1) {
                                            if (items.some(item => item instanceof $SvgAnimateTransform)) {
                                                subData.ordering = 'sequentially';
                                                ordering = 'together';
                                                sequential = true;
                                            }
                                            else {
                                                ordering = 'sequentially';
                                            }
                                        }
                                        else if (items.some((item: $SvgAnimate) => item.sequential !== undefined)) {
                                            ordering = index === 2 ? 'together' : 'sequentially';
                                            sequential = true;
                                        }
                                        else {
                                            ordering = $dom.getDataSet(group.element, 'android').ordering || this.options.vectorAnimateOrdering;
                                        }
                                        const setData: AnimatedSetData & TemplateDataAAA = {
                                            ordering,
                                            repeating: [],
                                            indefinite: [],
                                            fill: false
                                        };
                                        const indefiniteData: TemplateData = {
                                            ordering: 'sequentially',
                                            repeat: []
                                        };
                                        const fillData: TemplateData = {
                                            ordering: 'together',
                                            replace: []
                                        };
                                        const [indefinite, repeating] = sequential ? $util.partitionArray(items, (animate: $SvgAnimate) => animate.repeatCount === -1) : [[], items];
                                        if (indefinite.length === 1) {
                                            repeating.push(indefinite[0]);
                                            indefinite.length = 0;
                                        }
                                        for (const item of repeating) {
                                            const options: TemplateData = {
                                                startOffset: item.begin.length && item.begin[0] > 0 ? item.begin[0].toString() : '',
                                                duration: item.duration !== -1 ? item.duration.toString() : ''
                                            };
                                            if (item instanceof $SvgAnimate) {
                                                options.repeatCount = item instanceof $SvgAnimate ? item.repeatCount !== -1 ? Math.ceil(item.repeatCount - 1).toString() : '-1' : '0';
                                                const dataset = $dom.getDataSet(item.element, 'android');
                                                let propertyName: string[] | undefined;
                                                let values: string[] | (null[] | number[])[] | undefined;
                                                switch (item.attributeName) {
                                                    case 'transform':
                                                    case 'stroke':
                                                    case 'fill':
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
                                                if (item instanceof $SvgAnimateTransform) {
                                                    let fillBefore = dataset.fillbefore === 'true' || dataset.fillBefore === 'true';
                                                    let fillAfter = dataset.fillafter === 'true' || dataset.fillAfter === 'true';
                                                    if (fillBefore && fillAfter) {
                                                        const fillEnabled = !(dataset.fillenabled === 'false' || dataset.fillEnabled === 'false');
                                                        fillBefore = fillEnabled;
                                                        fillAfter = !fillEnabled;
                                                    }
                                                    if (fillBefore) {
                                                        options.fillBefore = 'true';
                                                    }
                                                    if (fillAfter) {
                                                        options.fillAfter = 'true';
                                                    }
                                                    switch (item.attributeName) {
                                                        case 'transform': {
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
                                                            break;
                                                        }
                                                    }
                                                }
                                                else {
                                                    const attribute = ATTRIBUTE_ANDROID[item.attributeName];
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
                                                                    values = item.values.slice();
                                                                    if (item.attributeName === 'points') {
                                                                        for (let i = 0; i < values.length; i++) {
                                                                            const value = values[i];
                                                                            if (value !== '') {
                                                                                const points = $SvgBuild.fromNumberList($SvgBuild.toCoordinateList(value));
                                                                                if (points.length) {
                                                                                    values[i] = item.parentElement.tagName === 'polygon' ? $SvgPath.getPolygon(points) : $SvgPath.getPolyline(points);
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
                                                            values = item.values.slice();
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
                                                    if ($util.convertInt(options.repeatCount) !== 0) {
                                                        switch (dataset.repeatmode || dataset.repeatMode) {
                                                            case 'restart':
                                                                options.repeatMode = 'restart';
                                                                break;
                                                            case 'reverse':
                                                                options.repeatMode = 'reverse';
                                                                break;
                                                        }
                                                    }
                                                    options.interpolator = dataset.interpolator ? INTERPOLATOR_ANDROID[dataset.interpolator] || dataset.interpolator : this.options.vectorAnimateInterpolator;
                                                    const keyName = index !== 1 ? JSON.stringify(options) : '';
                                                    for (let i = 0; i < propertyName.length; i++) {
                                                        const propertyOptions = { ...options };
                                                        let valueEnd = '';
                                                        if (node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW && propertyOptions.valueType !== 'pathType' && item.sequential === undefined && item.keyTimes.length > 1 && item.duration > 0 && (this.options.vectorAnimateAlwaysUseKeyframes || item.keyTimes.join('-') !== '0-1')) {
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
                                                                    keyframes.push({
                                                                        fraction: item.keyTimes[j].toString(),
                                                                        value
                                                                    });
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
                                                        if (!item.fillFreeze && item.sequential === undefined) {
                                                            let valueTo: string | undefined;
                                                            if (item.parentPath) {
                                                                let css = '';
                                                                for (const attr in ATTRIBUTE_ANDROID) {
                                                                    if (ATTRIBUTE_ANDROID[attr] === propertyName[i]) {
                                                                        css = $util.convertCamelCase(attr);
                                                                        break;
                                                                    }
                                                                }
                                                                if (css !== '') {
                                                                    valueTo = item.parentPath[css];
                                                                }
                                                            }
                                                            else if (item instanceof $SvgAnimateTransform) {
                                                                const transform = createTransformData(item.parentElement);
                                                                switch (item.type) {
                                                                    case SVGTransform.SVG_TRANSFORM_ROTATE: {
                                                                        switch (propertyName[i]) {
                                                                            case 'rotation':
                                                                                valueTo = transform.rotation.toString();
                                                                                break;
                                                                            case 'pivotX':
                                                                                valueTo = transform.pivotX.toString();
                                                                                break;
                                                                            case 'pivotY':
                                                                                valueTo = transform.pivotY.toString();
                                                                                break;
                                                                        }
                                                                        break;
                                                                    }
                                                                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                                                                        switch (propertyName[i]) {
                                                                            case 'scaleX':
                                                                                valueTo = transform.scaleX.toString();
                                                                                break;
                                                                            case 'scaleY':
                                                                                valueTo = transform.scaleY.toString();
                                                                                break;
                                                                        }
                                                                        break;
                                                                    }
                                                                    case SVGTransform.SVG_TRANSFORM_TRANSLATE: {
                                                                        switch (propertyName[i]) {
                                                                            case 'translateX':
                                                                                valueTo = transform.translateX.toString();
                                                                                break;
                                                                            case 'translateY':
                                                                                valueTo = transform.translateY.toString();
                                                                                break;
                                                                        }
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                            if (valueTo !== undefined && Array.isArray(fillData.replace)) {
                                                                fillData.replace.push({
                                                                    propertyName: propertyName[i],
                                                                    repeatCount: '0',
                                                                    duration: '1',
                                                                    valueType: options.valueType || '',
                                                                    valueFrom: options.valueType === 'pathType' ? valueEnd : '',
                                                                    valueTo
                                                                });
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else if (item.to) {
                                                options.propertyName = ATTRIBUTE_ANDROID[item.attributeName];
                                                if (options.propertyName) {
                                                    options.propertyValues = false;
                                                    if (item.duration === -1) {
                                                        options.duration = '1';
                                                    }
                                                    options.repeatCount = '0';
                                                    options.valueTo = item.to.toString();
                                                    setData.repeating.push(options);
                                                }
                                            }
                                        }
                                        if (indefinite.length) {
                                            const pathArray = setData.repeating.length ? indefiniteData.repeat as ExternalData[] : setData.repeating;
                                            for (const item of indefinite as $SvgAnimate[]) {
                                                pathArray.push({
                                                    propertyName: 'pathData',
                                                    repeatCount: '0',
                                                    duration: item.duration.toString(),
                                                    valueType: 'pathType',
                                                    valueFrom: item.from,
                                                    valueTo: item.to
                                                });
                                            }
                                        }
                                        if (setData.repeating.length) {
                                            if ($util.isArray(fillData.replace)) {
                                                if (subData.ordering === 'sequentially') {
                                                    setData.fill = [fillData];
                                                }
                                                else {
                                                    setData.repeating.push(...fillData.replace);
                                                }
                                            }
                                            if ($util.isArray(indefiniteData.repeat)) {
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
                                const animatedXml = $xml.createTemplate(TEMPLATES.ANIMATED, data);
                                vectorName = Resource.getStoredName('drawables', animatedXml);
                                if (vectorName === '') {
                                    vectorName = getAnimatedFilenamePrefix();
                                    STORED.drawables.set(vectorName, animatedXml);
                                }
                            }
                        }
                    }
                }
                if (images.length) {
                    const rotate: StringMap[] = [];
                    const normal: StringMap[] = [];
                    for (const item of images) {
                        const scaleX = svg.width / svg.viewBoxWidth;
                        const scaleY = svg.height / svg.viewBoxHeight;
                        let x = item.x * scaleX;
                        let y = item.y * scaleY;
                        const offsetParent = getSvgOffset(item.element, <SVGSVGElement> svg.element);
                        x += offsetParent.x;
                        y += offsetParent.y;
                        item.width *= scaleX;
                        item.height *= scaleY;
                        const data: StringMap = {
                            width: item.width > 0 ? $util.formatPX(item.width) : '',
                            height: item.height > 0 ? $util.formatPX(item.height) : '',
                            left: x !== 0 ? $util.formatPX(x) : '',
                            top: y !== 0 ? $util.formatPX(y) : '',
                            src: Resource.addImage({ mdpi: item.href })
                        };
                        if (item.rotateOrigin !== undefined && item.rotateOrigin.angle) {
                            data.fromDegrees = item.rotateOrigin.angle.toString();
                            data.visible = item.visible ? 'true' : 'false';
                            rotate.push(data);
                        }
                        else if (data.visible) {
                            normal.push(data);
                        }
                    }
                    const xml = $xml.createTemplate(TEMPLATES.LAYER_LIST, <TemplateDataA> {
                        A: [],
                        B: false,
                        C: [{ vectorName }],
                        D: rotate,
                        E: normal,
                        F: false,
                        G: false
                    });
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
}