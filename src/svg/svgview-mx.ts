import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { KEYSPLINE_NAME, STRING_CUBICBEZIER } from './lib/constant';
import { TRANSFORM, calculateStyle, getAttribute } from './lib/util';

type SvgElement = squared.svg.SvgElement;
type AttributeMap = ObjectMap<AttributeData[]>;

interface AttributeData extends NumberValue {
    transformOrigin?: Point;
}

const { getFontSize, getKeyframesRules, isAngle, isCustomProperty, hasCalc, parseAngle, parseVar } = squared.lib.css;
const { isWinEdge } = squared.lib.client;
const { getNamedItem } = squared.lib.dom;
const { isString, iterateArray, replaceMap, safeNestedArray, sortNumber } = squared.lib.util;

const ANIMATION_DEFAULT = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};

const KEYFRAME_MAP = getKeyframesRules();
const REGEX_TIMINGFUNCTION = new RegExp(`(ease|ease-in|ease-out|ease-in-out|linear|step-(?:start|end)|steps\\(\\d+,\\s+(?:start|end)\\)|${STRING_CUBICBEZIER}),?\\s*`, 'g');

function parseAttribute(element: SVGElement, attr: string) {
    const value = getAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        REGEX_TIMINGFUNCTION.lastIndex = 0;
        const result: string[] = [];
        let match: Null<RegExpMatchArray>;
        while ((match = REGEX_TIMINGFUNCTION.exec(value)) !== null) {
            result.push(match[1]);
        }
        return result;
    }
    return value.trim().split(/\s*,\s*/);
}

function sortAttribute(value: NumberValue[]) {
    return value.sort((a, b) => {
        if (a.key !== b.key) {
            return a.key < b.key ? -1 : 1;
        }
        return 0;
    });
}

function convertRotate(value: string) {
    if (value === 'reverse') {
        return 'auto 180deg';
    }
    else if (/^reverse\s+/.test(value)) {
        const angle = value.split(' ')[1];
        return 'auto ' + (isAngle(angle) ? 180 + parseAngle(angle, 0) : '0') + 'deg';
    }
    return value;
}

function getKeyframeOrigin(attrMap: AttributeMap, element: SVGGraphicsElement, order: number) {
    const origin = attrMap['transform-origin']?.find(item => item.key === order);
    return origin ? TRANSFORM.origin(element, origin.value) : undefined;
}

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed?: SvgTransform[];

        protected _transforms?: SvgTransform[];
        protected _animations?: SvgAnimation[];

        private _name?: string;

        public getTransforms(element?: SVGGraphicsElement) {
            if (!element) {
                element = this.element;
            }
            return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
        }

        public getAnimations(element?: SVGGraphicsElement) {
            const result: SvgAnimation[] = [];
            if (!isWinEdge()) {
                if (!element) {
                    element = this.element;
                }
                let id = 0;
                const addAnimation = (item: SvgAnimation, delay: number, name = '') => {
                    if (name === '') {
                        ++id;
                    }
                    item.delay = delay;
                    item.group = { id, name };
                    item.parent = this;
                    result.push(item);
                };
                iterateArray(element.children, (item: SVGElement) => {
                    if (item instanceof SVGAnimationElement) {
                        const begin = getNamedItem(item, 'begin');
                        if (/^[a-zA-Z]+$/.test(begin)) {
                            return;
                        }
                        const times = begin !== '' ? sortNumber(replaceMap(begin.split(';'), (value: string) => SvgAnimation.convertClockTime(value))) : [0];
                        if (times.length) {
                            switch (item.tagName) {
                                case 'set':
                                    for (let i = 0; i < times.length; ++i) {
                                        addAnimation(new SvgAnimation(element, item), times[i]);
                                    }
                                    break;
                                case 'animate':
                                    for (let i = 0; i < times.length; ++i) {
                                        addAnimation(new SvgAnimate(element, item as SVGAnimateElement), times[i]);
                                    }
                                    break;
                                case 'animateTransform':
                                    for (let i = 0; i < times.length; ++i) {
                                        const animate = new SvgAnimateTransform(element, item as SVGAnimateTransformElement);
                                        if (SvgBuild.isShape(this) && this.path) {
                                            animate.transformFrom = SvgBuild.drawRefit(element as SVGGraphicsElement, this.parent, this.viewport?.precision);
                                        }
                                        addAnimation(animate, times[i]);
                                    }
                                    break;
                                case 'animateMotion':
                                    for (let i = 0; i < times.length; ++i) {
                                        const animate = new SvgAnimateMotion(element, item as SVGAnimateMotionElement);
                                        const motionPathElement = animate.motionPathElement;
                                        if (motionPathElement) {
                                            animate.path = SvgBuild.drawRefit(motionPathElement, this.parent, this.viewport?.precision);
                                        }
                                        addAnimation(animate, times[i]);
                                    }
                                    break;
                            }
                        }
                    }
                });
                const animationName = parseAttribute(element, 'animation-name');
                const length = animationName.length;
                if (length) {
                    const cssData: ObjectMap<string[]> = {};
                    const groupName: SvgAnimate[] = [];
                    const groupOrdering: SvgAnimationAttribute[] = [];
                    for (const name in ANIMATION_DEFAULT) {
                        let values = parseAttribute(element, name);
                        if (values.length === 0) {
                            values.push(ANIMATION_DEFAULT[name]);
                        }
                        while (values.length < length) {
                            values = values.concat(values.slice(0));
                        }
                        values.length = length;
                        cssData[name] = values;
                    }
                    for (let i = 0; i < length; ++i) {
                        const keyframes = KEYFRAME_MAP[animationName[i]];
                        const duration = SvgAnimation.convertClockTime(cssData['animation-duration'][i]);
                        if (keyframes && duration > 0) {
                            ++id;
                            const attrMap: AttributeMap = {};
                            const keyframeMap: AttributeMap = {};
                            const paused = cssData['animation-play-state'][i] === 'paused';
                            const delay = SvgAnimation.convertClockTime(cssData['animation-delay'][i]);
                            const iterationCount = cssData['animation-iteration-count'][i];
                            const fillMode = cssData['animation-fill-mode'][i];
                            const keyframeIndex = animationName[i] + '_' + i;
                            const attributes: string[] = [];
                            let includeKeySplines = true;
                            groupOrdering.push({
                                name: keyframeIndex,
                                attributes,
                                paused,
                                delay,
                                duration,
                                iterationCount,
                                fillMode
                            });
                            for (const percent in keyframes) {
                                const key = parseFloat(percent) / 100;
                                const data = keyframes[percent];
                                for (const attr in data) {
                                    let value: string = data[attr];
                                    if (hasCalc(value)) {
                                        value = calculateStyle(element, attr, value);
                                    }
                                    else if (isCustomProperty(value)) {
                                        value = parseVar(element, value);
                                    }
                                    if (value) {
                                        safeNestedArray(ANIMATION_DEFAULT[attr] ? keyframeMap : attrMap, attr).push({ key, value });
                                    }
                                }
                            }
                            if (attrMap['transform']) {
                                const transforms = sortAttribute(attrMap['transform']);
                                const q = transforms.length;
                                let j = 0;
                                while (j < q) {
                                    const transform = transforms[j++];
                                    const key = transform.key;
                                    const origin = getKeyframeOrigin(attrMap, element, key);
                                    TRANSFORM.parse(element, transform.value)?.forEach(item => {
                                        const m = item.matrix;
                                        let name: string;
                                        let value: string;
                                        let transformOrigin: Undef<Point>;
                                        switch (item.type) {
                                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                name = 'translate';
                                                value = m.e + ' ' + m.f;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                                name = 'scale';
                                                value = m.a + ' ' + m.d + ' ' + (origin ? origin.x + ' ' + origin.y : '0 0');
                                                if (origin && (key !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                    transformOrigin = { x: origin.x * (1 - m.a), y: origin.y * (1 - m.d) };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                name = 'rotate';
                                                value = item.angle + ' ' + (origin ? origin.x + ' ' + origin.y : '0 0');
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                name = 'skewX';
                                                value = item.angle.toString();
                                                if (origin && (key !== 0 || origin.y !== 0)) {
                                                    transformOrigin = { x: origin.y * m.c * -1, y: 0 };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                name = 'skewY';
                                                value = item.angle.toString();
                                                if (origin && (key !== 0 || origin.x !== 0)) {
                                                    transformOrigin = { x: 0, y: origin.x * m.b * -1 };
                                                }
                                                break;
                                            default:
                                                return;
                                        }
                                        const attrData = safeNestedArray(attrMap, name);
                                        const index = attrData.findIndex(previous => previous.key === key);
                                        if (index !== -1) {
                                            const indexData = attrData[index];
                                            indexData.value = value;
                                            indexData.transformOrigin = transformOrigin;
                                        }
                                        else {
                                            attrData.push({
                                                key,
                                                value,
                                                transformOrigin
                                            });
                                        }
                                    });
                                }
                                delete attrMap['transform'];
                                delete attrMap['transform-origin'];
                            }
                            if (getAttribute(element, 'offset-path') === 'none') {
                                delete attrMap['offset-distance'];
                                delete attrMap['offset-rotate'];
                            }
                            else if (attrMap['offset-rotate']) {
                                const offsetRotate = attrMap['offset-rotate'];
                                if (attrMap['offset-distance'] || !attrMap['rotate']) {
                                    let rotate = getAttribute(element, 'offset-rotate');
                                    if (rotate === '' || rotate === 'auto') {
                                        rotate = 'auto 0deg';
                                    }
                                    sortAttribute(offsetRotate);
                                    const from = offsetRotate[0];
                                    const to = offsetRotate[offsetRotate.length - 1];
                                    if (from.key !== 0) {
                                        offsetRotate.unshift({ key: 0, value: rotate });
                                    }
                                    if (to.key !== 1) {
                                        offsetRotate.push({ key: 1, value: rotate });
                                    }
                                    for (let j = 1; j < offsetRotate.length; ++j) {
                                        const previous = offsetRotate[j - 1];
                                        const item = offsetRotate[j];
                                        const previousValue = convertRotate(previous.value);
                                        const itemValue = convertRotate(item.value);
                                        previous.value = previousValue;
                                        item.value = itemValue;
                                        if (previousValue.split(' ').pop() !== itemValue.split(' ').pop()) {
                                            const previousAuto =  previousValue.startsWith('auto');
                                            const auto = itemValue.startsWith('auto');
                                            if (previousAuto && !auto || !previousAuto && auto) {
                                                const key = (previous.key + item.key) / 2;
                                                offsetRotate.splice(j++, 0, { key, value: previousValue });
                                                offsetRotate.splice(j++, 0, { key, value: itemValue });
                                            }
                                        }
                                    }
                                    if (!attrMap['offset-distance']) {
                                        const animate = new SvgAnimateMotion(element);
                                        animate.duration = 0;
                                        animate.iterationCount = 1;
                                        animate.fillForwards = true;
                                        animate.addKeyPoint({ key: 0, value: animate.distance });
                                        addAnimation(animate, delay, keyframeIndex);
                                        const q = offsetRotate.length;
                                        let j = 0;
                                        while (j < q) {
                                            const item = offsetRotate[j++];
                                            const value = item.value;
                                            let angle = parseAngle(value.split(' ').pop() as string, 0);
                                            if (value.startsWith('auto')) {
                                                angle += 90;
                                            }
                                            item.value = angle + ' 0 0';
                                        }
                                        attrMap['rotate'] = offsetRotate;
                                        delete attrMap['offset-rotate'];
                                        includeKeySplines = false;
                                    }
                                }
                                else {
                                    delete attrMap['offset-rotate'];
                                }
                            }
                            for (const name in attrMap) {
                                let animate: SvgAnimate;
                                switch (name) {
                                    case 'offset-rotate':
                                        continue;
                                    case 'offset-distance':
                                        animate = new SvgAnimateMotion(element);
                                        (animate as SvgAnimateMotion).rotateData = attrMap['offset-rotate'];
                                        break;
                                    case 'rotate':
                                    case 'scale':
                                    case 'skewX':
                                    case 'skewY':
                                    case 'translate':
                                        animate = new SvgAnimateTransform(element);
                                        (animate as SvgAnimateTransform).setType(name);
                                        break;
                                    default:
                                        animate = new SvgAnimate(element);
                                        animate.attributeName = name;
                                        break;
                                }
                                addAnimation(animate, delay, keyframeIndex);
                                const animation = attrMap[name];
                                const direction = cssData['animation-direction'][i];
                                const timingFunction = cssData['animation-timing-function'][i];
                                sortAttribute(animation);
                                if (name === 'offset-distance') {
                                    const animateMotion = animate as SvgAnimateMotion;
                                    if (animation[0].key !== 0) {
                                        animateMotion.addKeyPoint({ key: 0, value: animateMotion.distance });
                                    }
                                    for (let j = 0; j < animation.length; ++j) {
                                        animateMotion.addKeyPoint(animation[j]);
                                    }
                                    if ((animation.pop() as NumberValue).key !== 1) {
                                        animateMotion.addKeyPoint({ key: 1, value: animateMotion.distance });
                                    }
                                    if (isString(timingFunction)) {
                                        animateMotion.timingFunction = timingFunction;
                                    }
                                }
                                else {
                                    attributes.push(name);
                                    const keySplines: string[] = [];
                                    let q = animation.length;
                                    const keyTimes: number[] = new Array(q);
                                    const values: string[] = new Array(q);
                                    for (let j = 0; j < q; ++j) {
                                        const item = animation[j];
                                        const { key, value } = item;
                                        keyTimes[j] = key;
                                        values[j] = value;
                                        if (includeKeySplines && j < q - 1) {
                                            const spline = keyframeMap['animation-timing-function']?.find(timing => timing.key === key);
                                            keySplines.push(spline?.value || timingFunction);
                                        }
                                        const transformOrigin = item.transformOrigin;
                                        if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                            safeNestedArray(animate as StandardMap, 'transformOrigin')[j] = transformOrigin;
                                        }
                                    }
                                    if (includeKeySplines && !keySplines.every(value => value === 'linear')) {
                                        const keyTimesData: number[] = [];
                                        const valuesData: string[] = [];
                                        const keySplinesData: string[] = [];
                                        q = keyTimes.length;
                                        for (let j = 0; j < q; ++j) {
                                            const time = keyTimes[j];
                                            const value = values[j];
                                            if (j < q - 1) {
                                                const keySpline = keySplines[j];
                                                if (value !== '' && keySpline.startsWith('step')) {
                                                    const steps = SvgAnimate.convertStepTimingFunction(name, keySpline, keyTimes, values, j, getFontSize(element));
                                                    if (steps) {
                                                        const [stepTime, stepValue] = steps;
                                                        const stepDuration = (keyTimes[j + 1] - time) * duration;
                                                        const s = stepTime.length - (keyTimes[j + 1] === 1 ? 1 : 0);
                                                        let k = 0;
                                                        while (k < s) {
                                                            let keyTime = (time + stepTime[k] * stepDuration) / duration;
                                                            if (keyTimesData.includes(keyTime)) {
                                                                keyTime += 1 / 1000;
                                                            }
                                                            keyTimesData.push(keyTime);
                                                            valuesData.push(stepValue[k++]);
                                                            keySplinesData.push(KEYSPLINE_NAME[keySpline.includes('start') ? 'step-start' : 'step-end']);
                                                        }
                                                        continue;
                                                    }
                                                }
                                                keySplinesData.push(SvgAnimate.convertTimingFunction(keySpline));
                                            }
                                            keyTimesData.push(time);
                                            valuesData.push(value);
                                        }
                                        animate.values = valuesData;
                                        animate.keyTimes = keyTimesData;
                                        animate.keySplines = keySplinesData;
                                    }
                                    else {
                                        animate.values = values;
                                        animate.keyTimes = keyTimes;
                                        if (includeKeySplines) {
                                            animate.keySplines = keySplines;
                                        }
                                        else {
                                            animate.timingFunction = timingFunction;
                                        }
                                    }
                                }
                                animate.paused = paused;
                                animate.duration = duration;
                                animate.iterationCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                                animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                                animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                                animate.reverse = direction.endsWith('reverse');
                                animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && direction.startsWith('alternate');
                                groupName.push(animate);
                            }
                        }
                    }
                    groupOrdering.reverse();
                    for (let i = 0; i < groupName.length; ++i) {
                        groupName[i].setGroupOrdering(groupOrdering);
                    }
                }
            }
            return result;
        }

        set name(value) {
            this._name = value;
        }
        get name() {
            let result = this._name;
            if (result === undefined) {
                result = SvgBuild.setName(this.element);
                this._name = result;
            }
            return result;
        }

        get transforms() {
            let result = this._transforms;
            if (result === undefined) {
                result = this.getTransforms();
                this._transforms = result;
            }
            return result;
        }

        get animations() {
            let result = this._animations;
            if (result === undefined) {
                result = this.getAnimations();
                this._animations = result;
            }
            return result;
        }

        get visible() {
            const value = getAttribute(this.element, 'visibility');
            return value !== 'hidden' && value !== 'collapse' && getAttribute(this.element, 'display') !== 'none';
        }

        get opacity() {
            return getAttribute(this.element, 'opacity') || '1';
        }
    };
};