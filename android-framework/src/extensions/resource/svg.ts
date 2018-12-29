import { BUILD_ANDROID } from '../../lib/enumeration';

import ANIMATEDVECTOR_TMPL from '../../template/resource/animated-vector';
import LAYERLIST_TMPL from '../../template/resource/layer-list';
import SETSEQUENTIALLY_TMPL from '../../template/resource/set-sequentially';
import VECTOR_TMPL from '../../template/resource/vector';

import Resource from '../../resource';
import View from '../../view';

import { getXmlNs } from '../../lib/util';

import $color = squared.lib.color;
import $dom = squared.lib.dom;
import $util = squared.lib.util;
import $xml = squared.lib.xml;

if (squared.svg === undefined) {
    squared.svg = { lib: {} } as any;
}

import $Svg = squared.svg.Svg;
import $SvgAnimate = squared.svg.SvgAnimate;
import $SvgAnimateMotion = squared.svg.SvgAnimateMotion;
import $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import $SvgAnimation = squared.svg.SvgAnimation;
import $SvgBuild = squared.svg.SvgBuild;
import $SvgElement = squared.svg.SvgElement;
import $SvgGroup = squared.svg.SvgGroup;
import $SvgGroupViewBox = squared.svg.SvgGroupViewBox;
import $SvgImage = squared.svg.SvgImage;
import $SvgPath = squared.svg.SvgPath;
import $SvgUse = squared.svg.SvgUse;
import $util_svg = squared.svg.lib.util;

type AnimateGroup = {
    element: SVGGraphicsElement;
    animate: $SvgAnimation[];
    pathData?: string;
};

type AnimatedTargetData = {
    name: string;
    animationName: string;
};

type AnimateSetData = {
    ordering: string;
    objectAnimators: ExternalData[];
};

type PropertyValue = {
    propertyName: string;
    keyframes: KeyFrame[];
};

type KeyFrame = {
    fraction: string;
    value: string;
};

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

function queueAnimations(animateMap: Map<string, AnimateGroup>, name: string, svg: $Svg | $SvgGroup | $SvgElement, predicate: IteratorPredicate<$SvgAnimation, void>, pathData = '') {
    const animate = svg.animate.filter(predicate).filter(item => item.begin.length > 0);
    if (animate.length) {
        animateMap.set(name, {
            element: svg.element,
            animate,
            pathData
        });
    }
}

function createGroup(animateMap: Map<string, AnimateGroup>, group: $SvgGroup | $SvgElement, inclusions: string[] = []) {
    const name = `group_${group.name}`;
    const data: ExternalData = {
        name,
        '2': []
    };
    let x = group instanceof $SvgGroupViewBox ? group.x : 0;
    let y = group instanceof $SvgGroupViewBox ? group.y : 0;
    if (group.transform.numberOfItems) {
        const transform = $util_svg.createTransformData(group.element);
        if (transform.operations.length) {
            x += transform.translateX;
            y += transform.translateY;
            if (transform.scaleX !== 1) {
                data.scaleX = transform.scaleX.toString();
            }
            if (transform.scaleY !== 1) {
                data.scaleY = transform.scaleY.toString();
            }
            if (transform.rotateAngle !== 0) {
                data.rotation = transform.rotateAngle.toString();
            }
            let pivotX = transform.rotateOriginX || 0;
            let pivotY = transform.rotateOriginY || 0;
            if (transform.origin) {
                pivotX += transform.origin.x;
                pivotY += transform.origin.y;
            }
            if (pivotX !== 0) {
                data.pivotX = pivotX.toString();
            }
            if (pivotY !== 0) {
                data.pivotY = pivotY.toString();
            }
        }
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
        item => item instanceof $SvgAnimateTransform || inclusions.includes(item.attributeName),
        group instanceof $SvgUse && group.path ? group.path.d : ''
    );
    return data;
}

function getSvgOffset(element: SVGGraphicsElement, outerParent: SVGSVGElement) {
    let parent = element.parentElement;
    let x = 0;
    let y = 0;
    while (parent instanceof SVGSVGElement && parent !== outerParent) {
        const transform = $util_svg.createTransformData(parent);
        x += parent.x.baseVal.value + transform.translateX;
        y += parent.y.baseVal.value + transform.translateY;
        parent = parent.parentElement;
    }
    return { x, y };
}

export default class ResourceSvg<T extends View> extends squared.base.Extension<T> {
    public readonly options = {
        vectorAnimateOrdering: 'together',
        vectorAnimateInterpolator: INTERPOLATOR_ANDROID.LINEAR,
        vectorAnimateAlwaysUseKeyframes: true
    };

    public readonly eventOnly = true;

    public beforeInit() {
        this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement) {
                const svg = new squared.svg.Svg(<SVGSVGElement> node.element);
                const namespace = new Set<string>();
                const animateMap = new Map<string, AnimateGroup>();
                const templateName = `${node.tagName.toLowerCase()}_${node.controlId}`;
                const images: $SvgImage[] = [];
                let drawable = '';
                let vectorName = '';
                if (svg.length) {
                    function createPath(target: $SvgElement | $SvgUse, path: $SvgPath, exclusions: string[] = []) {
                        const name = target.name;
                        const clipPaths: ExternalData[] = [];
                        if (path.clipPath !== '') {
                            const clipPath = svg.defs.clipPath.get(path.clipPath);
                            if (clipPath) {
                                clipPath.each(child => {
                                    if (child.path) {
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
                        const result = Object.assign({}, path, { name, clipPaths });
                        ['fill', 'stroke'].forEach(attr => {
                            if ($util.isString(result[attr])) {
                                if (result[attr].charAt(0) === '@') {
                                    const gradient = svg.defs.gradient.get(result[attr]);
                                    if (gradient) {
                                        switch (target.element.tagName) {
                                            case 'path':
                                                if (!/[zZ]\s*$/.test(result.d)) {
                                                    break;
                                                }
                                            case 'rect':
                                            case 'polygon':
                                            case 'polyline':
                                            case 'circle':
                                            case 'ellipse':
                                                const gradients = Resource.createBackgroundGradient(node, [gradient], result);
                                                result[attr] = [{ gradients }];
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
                        if (result.fillRule) {
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
                    }
                    queueAnimations(
                        animateMap,
                        svg.name,
                        svg,
                        item => item.attributeName === 'opacity'
                    );
                    let groups: StringMap[] = [];
                    let groupData: ExternalData | undefined;
                    for (let i = 0; i < svg.children.length; i++) {
                        const group = svg.children[i];
                        if (i > 0) {
                            group.synchronize(false);
                            groupData = createGroup(animateMap, group, group instanceof $SvgGroupViewBox ? ['x', 'y'] : []);
                        }
                        if (group instanceof $SvgUse) {
                            if (groupData && group.path) {
                                groupData['2'].push(createPath(group, group.path, ['x', 'y', 'width', 'height']));
                            }
                        }
                        else {
                            for (const item of group.children) {
                                if (item instanceof $SvgImage) {
                                    item.externalize();
                                    images.push(item);
                                }
                                else if (item.visible && item.path) {
                                    let newGroup = false;
                                    item.synchronize(false);
                                    if (i === 0) {
                                        if (item.transform.numberOfItems > 0 && !item.path.transformed || item.animate.some(animate => animate instanceof $SvgAnimateTransform)) {
                                            groupData = createGroup(animateMap, item);
                                            groups.push(groupData);
                                            newGroup = true;
                                        }
                                        if (groupData === undefined) {
                                            groupData = createGroup(animateMap, group);
                                            groups.push(groupData);
                                        }
                                    }
                                    if (groupData) {
                                        groupData['2'].push(createPath(item, item.path));
                                    }
                                    if (newGroup) {
                                        groupData = undefined;
                                    }
                                }
                            }
                        }
                        if (i > 0 && groupData) {
                            groups.push(groupData);
                        }
                    }
                    groups = groups.filter(group => group['2'].length > 0);
                    if (groups.length) {
                        let xml = $xml.createTemplate($xml.parseTemplate(VECTOR_TMPL), {
                            namespace: namespace.size ? getXmlNs(...Array.from(namespace)) : '',
                            name: svg.name,
                            width: $util.formatPX(svg.width),
                            height: $util.formatPX(svg.height),
                            viewportWidth: svg.viewBoxWidth > 0 ? svg.viewBoxWidth.toString() : false,
                            viewportHeight: svg.viewBoxHeight > 0 ? svg.viewBoxHeight.toString() : false,
                            alpha: svg.opacity < 1 ? svg.opacity.toString() : false,
                            '1': groups
                        });
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = templateName + (images.length ? '_vector' : '');
                            Resource.STORED.drawables.set(vectorName, xml);
                        }
                        if (animateMap.size) {
                            function getAnimatedFilenamePrefix(suffix = '') {
                                return `${templateName}_animated${images.length ? '_vector' : ''}${suffix !== '' ? `_${suffix}` : ''}`;
                            }
                            const data: ExternalData = {
                                vectorName,
                                '1': []
                            };
                            for (const [name, group] of animateMap.entries()) {
                                const targetData: AnimatedTargetData = {
                                    name,
                                    animationName: getAnimatedFilenamePrefix(name)
                                };
                                const targetSetData: ExternalData = {
                                    '1': []
                                };
                                const animatorMap = new Map<string, PropertyValue[]>();
                                const together: $SvgAnimation[] = [];
                                const fillReplace: $SvgAnimation[] = [];
                                const sequentialMap = new Map<string, $SvgAnimate[]>();
                                const targets: $SvgAnimation[][] = [];
                                for (const item of group.animate as $SvgAnimate[]) {
                                    if (item.sequential) {
                                        let values = sequentialMap.get(item.sequential.name);
                                        if (values === undefined) {
                                            values = [];
                                            sequentialMap.set(item.sequential.name, values);
                                        }
                                        values.push(item);
                                    }
                                    else if (!item.fillFreeze) {
                                        fillReplace.push(item);
                                    }
                                    else {
                                        together.push(item);
                                    }
                                }
                                if (together.length) {
                                    targets.push(together);
                                }
                                for (const item of fillReplace) {
                                    targets.push([item]);
                                }
                                for (const item of sequentialMap.values()) {
                                    targets.push(item.sort((a, b) => a.sequential && b.sequential && a.sequential.index >= b.sequential.index ? 1 : -1));
                                }
                                for (const set of targets) {
                                    let ordering: string;
                                    if (set.some(animate => animate instanceof $SvgAnimateTransform && animate.sequential !== undefined) ||
                                        set.some(animate => animate instanceof $SvgAnimate && (animate.sequential !== undefined || !animate.fillFreeze)))
                                    {
                                        ordering = 'together';
                                    }
                                    else {
                                        ordering = $dom.getDataSet(group.element, 'android').ordering || this.options.vectorAnimateOrdering;
                                    }
                                    const setData: AnimateSetData = {
                                        ordering,
                                        objectAnimators: []
                                    };
                                    const replaceData: AnimateSetData = {
                                        ordering: 'together',
                                        objectAnimators: []
                                    };
                                    for (const item of set) {
                                        const options: ExternalData = {
                                            startOffset: item.begin.length && item.begin[0] > 0 ? item.begin[0].toString() : '',
                                            duration: item.duration !== -1 ? item.duration.toString() : '1'
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
                                                                            const points = $SvgBuild.fromCoordinateList($SvgBuild.toCoordinateList(value));
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
                                                const keyName = JSON.stringify(options);
                                                for (let i = 0; i < propertyName.length; i++) {
                                                    const propertyOptions = Object.assign({}, options);
                                                    let valueEnd = '';
                                                    if (node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW && propertyOptions.valueType !== 'pathType' && item.sequential === undefined && item.keyTimes.length > 1 && item.duration > 0 && (this.options.vectorAnimateAlwaysUseKeyframes || item.keyTimes.join('-') !== '0-1')) {
                                                        const propertyValues: PropertyValue[] = animatorMap.get(keyName) || [];
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
                                                        propertyValues.push({
                                                            propertyName: propertyName[i],
                                                            keyframes
                                                        });
                                                        if (!animatorMap.has(keyName)) {
                                                            animatorMap.set(keyName, propertyValues);
                                                            propertyOptions.propertyValues = propertyValues;
                                                            setData.objectAnimators.push(propertyOptions);
                                                        }
                                                        valueEnd = keyframes[keyframes.length - 1].value;
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
                                                        setData.objectAnimators.push(propertyOptions);
                                                    }
                                                    if (item instanceof $SvgAnimate && !item.fillFreeze && item.sequential === undefined) {
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
                                                            const transform = $util_svg.createTransformData(item.parentElement);
                                                            switch (item.type) {
                                                                case SVGTransform.SVG_TRANSFORM_ROTATE: {
                                                                    switch (propertyName[i]) {
                                                                        case 'rotation':
                                                                            valueTo = transform.rotateAngle.toString();
                                                                            break;
                                                                        case 'pivotX':
                                                                            valueTo = (transform.rotateOriginX || 0).toString();
                                                                            break;
                                                                        case 'pivotY':
                                                                            valueTo = (transform.rotateOriginX || 0).toString();
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
                                                        if (valueTo !== undefined) {
                                                            replaceData.objectAnimators.push({
                                                                propertyName: propertyName[i],
                                                                valueType: options.valueType,
                                                                duration: '1',
                                                                repeatCount: '0',
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
                                                options.repeatCount = '0';
                                                options.valueTo = item.to.toString();
                                                setData.objectAnimators.push(options);
                                            }
                                        }
                                    }
                                    if (setData.objectAnimators.length) {
                                        targetSetData['1'].push(setData);
                                    }
                                    if (replaceData.objectAnimators.length) {
                                        targetSetData['1'].push(replaceData);
                                    }
                                }
                                if (targetSetData['1'].length) {
                                    Resource.STORED.animators.set(targetData.animationName, $xml.createTemplate($xml.parseTemplate(SETSEQUENTIALLY_TMPL), targetSetData));
                                    data['1'].push(targetData);
                                }
                            }
                            if (data['1'].length) {
                                xml = $xml.createTemplate($xml.parseTemplate(ANIMATEDVECTOR_TMPL), data);
                                vectorName = Resource.getStoredName('drawables', xml);
                                if (vectorName === '') {
                                    vectorName = getAnimatedFilenamePrefix();
                                    Resource.STORED.drawables.set(vectorName, xml);
                                }
                            }
                        }
                    }
                }
                if (images.length) {
                    const rotate: ExternalData = [];
                    const normal: ExternalData = [];
                    for (const item of images) {
                        const scaleX = svg.width / svg.viewBoxWidth;
                        const scaleY = svg.height / svg.viewBoxHeight;
                        let x = (item.x || 0) * scaleX;
                        let y = (item.y || 0) * scaleY;
                        item.width *= scaleX;
                        item.height *= scaleY;
                        const offsetParent = getSvgOffset(item.element, <SVGSVGElement> svg.element);
                        x += offsetParent.x;
                        y += offsetParent.y;
                        const data: ExternalData = {
                            width: item.width > 0 ? $util.formatPX(item.width) : '',
                            height: item.height > 0 ? $util.formatPX(item.height) : '',
                            left: x !== 0 ? $util.formatPX(x) : '',
                            top: y !== 0 ? $util.formatPX(y) : '',
                            src: Resource.addImage({ mdpi: item.uri })
                        };
                        const transform = $util_svg.createTransformData(item.element);
                        if (transform.rotateAngle !== 0) {
                            data.fromDegrees = transform.rotateAngle.toString();
                            data.visible = item.visible ? 'true' : 'false';
                            rotate.push(data);
                        }
                        else {
                            normal.push(data);
                        }
                    }
                    const xml = $xml.createTemplate($xml.parseTemplate(LAYERLIST_TMPL), {
                        '1': false,
                        '2': false,
                        '3': [{ vectorName }],
                        '4': rotate,
                        '5': normal,
                        '6': false,
                        '7': false
                    });
                    drawable = Resource.getStoredName('drawables', xml);
                    if (drawable === '') {
                        drawable = templateName;
                        Resource.STORED.drawables.set(drawable, xml);
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