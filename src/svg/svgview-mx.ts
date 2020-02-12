import { SvgAnimationAttribute, SvgTransform } from '../../@types/svg/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { KEYSPLINE_NAME, STRING_CUBICBEZIER } from './lib/constant';
import { TRANSFORM, getAttribute } from './lib/util';

type SvgElement = squared.svg.SvgElement;

const $lib = squared.lib;

const { calculateVar, isAngle, isCalc, isCustomProperty, getFontSize, getKeyframeRules, parseAngle, parseVar } = $lib.css;
const { isWinEdge } = $lib.client;
const { getNamedItem } = $lib.dom;
const { XML } = $lib.regex;
const { isString, replaceMap, sortNumber } = $lib.util;

type AttributeMap = ObjectMap<AttributeData[]>;

interface AttributeData extends NumberValue {
    transformOrigin?: Point;
}

const ANIMATION_DEFAULT = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};
const KEYFRAME_MAP = getKeyframeRules();
const REGEX_TIMINGFUNCTION = new RegExp(`(ease|ease-in|ease-out|ease-in-out|linear|step-(?:start|end)|steps\\(\\d+, (?:start|end)\\)|${STRING_CUBICBEZIER}),?\\s*`, 'g');
const REGEX_AUTO = /^auto/;

function parseAttribute(element: SVGElement, attr: string) {
    const value = getAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        const result: string[] = [];
        let match: Null<RegExpMatchArray>;
        while ((match = REGEX_TIMINGFUNCTION.exec(value)) !== null) {
            result.push(match[1]);
        }
        REGEX_TIMINGFUNCTION.lastIndex = 0;
        return result;
    }
    return value.split(XML.SEPARATOR);
}

function isVisible(element: SVGElement) {
    const value = getAttribute(element, 'visibility');
    return value !== 'hidden' && value !== 'collapse' && getAttribute(element, 'display') !== 'none';
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
    else if (/^reverse /.test(value)) {
        const angle = value.split(' ')[1];
        return 'auto ' + (isAngle(angle) ? 180 + parseAngle(angle) : '0') + 'deg';
    }
    return value;
}

function getKeyframeOrigin(attrMap: AttributeMap, element: SVGGraphicsElement, order: number) {
    const origin = attrMap['transform-origin']?.find(item => item.key === order);
    if (origin) {
        return TRANSFORM.origin(element, origin.value);
    }
    return undefined;
}

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed?: SvgTransform[];
        public translationOffset?: Point;

        protected _transforms?: SvgTransform[];
        protected _animations?: SvgAnimation[];

        private _name?: string;

        public getTransforms(element?: SVGGraphicsElement) {
            if (element === undefined) {
                element = this.element;
            }
            return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
        }

        public getAnimations(element?: SVGGraphicsElement) {
            const result: SvgAnimation[] = [];
            if (!isWinEdge()) {
                if (element === undefined) {
                    element = this.element;
                }
                let id = 0;
                const addAnimation = (item: SvgAnimation, delay: number, name = '') => {
                    if (name === '') {
                        id++;
                    }
                    item.delay = delay;
                    item.group = { id, name };
                    item.parent = this;
                    result.push(item);
                };
                const children = element.children;
                let length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item instanceof SVGAnimationElement) {
                        const begin = getNamedItem(item, 'begin');
                        if (/^[a-zA-Z]+$/.test(begin)) {
                            continue;
                        }
                        const times = begin ? sortNumber(replaceMap<string, number>(begin.split(';'), value => SvgAnimation.convertClockTime(value))) : [0];
                        if (times.length) {
                            switch (item.tagName) {
                                case 'set':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimation(element, item), time);
                                    }
                                    break;
                                case 'animate':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimate(element, <SVGAnimateElement> item), time);
                                    }
                                    break;
                                case 'animateTransform':
                                    for (const time of times) {
                                        const animate = new SvgAnimateTransform(element, <SVGAnimateTransformElement> item);
                                        if (SvgBuild.isShape(this) && this.path) {
                                            animate.transformFrom = SvgBuild.drawRefit(element, this.parent, this.viewport?.precision);
                                        }
                                        addAnimation(animate, time);
                                    }
                                    break;
                                case 'animateMotion':
                                    for (const time of times) {
                                        const animate = new SvgAnimateMotion(element, <SVGAnimateMotionElement> item);
                                        const motionPathElement = animate.motionPathElement;
                                        if (motionPathElement) {
                                            animate.path = SvgBuild.drawRefit(motionPathElement, this.parent, this.viewport?.precision);
                                        }
                                        addAnimation(animate, time);
                                    }
                                    break;
                            }
                        }
                    }
                }
                const animationName = parseAttribute(element, 'animation-name');
                length = animationName.length;
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
                    for (let i = 0; i < length; i++) {
                        const keyframes = KEYFRAME_MAP[animationName[i]];
                        const duration = SvgAnimation.convertClockTime(cssData['animation-duration'][i]);
                        if (keyframes && duration > 0) {
                            id++;
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
                                for (const name in data) {
                                    let value: Undef<string | number> = data[name];
                                    if (value) {
                                        if (isCalc(value)) {
                                            value = calculateVar(element, value, name);
                                        }
                                        else if (isCustomProperty(value)) {
                                            value = parseVar(element, value);
                                        }
                                        if (value !== undefined) {
                                            const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                            let section = map[name];
                                            if (section === undefined) {
                                                section = [];
                                                map[name] = section;
                                            }
                                            section.push({ key, value: value.toString() });
                                        }
                                    }
                                }
                            }
                            if (attrMap['transform']) {
                                for (const transform of sortAttribute(attrMap['transform'])) {
                                    const transforms = TRANSFORM.parse(element, transform.value);
                                    if (transforms) {
                                        const key = transform.key;
                                        const origin = getKeyframeOrigin(attrMap, element, key);
                                        for (const item of transforms) {
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
                                                    continue;
                                            }
                                            let attrData = attrMap[name];
                                            if (attrData === undefined) {
                                                attrData = [];
                                                attrMap[name] = attrData;
                                            }
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
                                        }
                                    }
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
                                if (attrMap['offset-distance'] || attrMap['rotate'] === undefined) {
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
                                    for (let j = 1; j < offsetRotate.length; j++) {
                                        const previous = offsetRotate[j - 1];
                                        const item = offsetRotate[j];
                                        const previousValue = convertRotate(previous.value);
                                        const itemValue = convertRotate(item.value);
                                        previous.value = previousValue;
                                        item.value = itemValue;
                                        if (previousValue.split(' ').pop() !== itemValue.split(' ').pop()) {
                                            const previousAuto = REGEX_AUTO.test(previousValue);
                                            const auto = REGEX_AUTO.test(itemValue);
                                            if (previousAuto && !auto || !previousAuto && auto) {
                                                const key = (previous.key + item.key) / 2;
                                                offsetRotate.splice(j++, 0, { key, value: previousValue });
                                                offsetRotate.splice(j++, 0, { key, value: itemValue });
                                            }
                                        }
                                    }
                                    if (attrMap['offset-distance'] === undefined) {
                                        const animate = new SvgAnimateMotion(element);
                                        animate.duration = 0;
                                        animate.iterationCount = 1;
                                        animate.fillForwards = true;
                                        animate.addKeyPoint({ key: 0, value: animate.distance });
                                        addAnimation(animate, delay, keyframeIndex);
                                        for (const item of offsetRotate) {
                                            const value = item.value;
                                            let angle = parseAngle(value.split(' ').pop() as string);
                                            if (REGEX_AUTO.test(value)) {
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
                                        (<SvgAnimateMotion> animate).rotateData = attrMap['offset-rotate'];
                                        break;
                                    case 'rotate':
                                    case 'scale':
                                    case 'skewX':
                                    case 'skewY':
                                    case 'translate':
                                        animate = new SvgAnimateTransform(element);
                                        (<SvgAnimateTransform> animate).setType(name);
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
                                    const animateMotion = <SvgAnimateMotion> animate;
                                    if (animation[0].key !== 0) {
                                        animateMotion.addKeyPoint({ key: 0, value: animateMotion.distance });
                                    }
                                    for (const item of animation) {
                                        animateMotion.addKeyPoint(item);
                                    }
                                    if ((<NumberValue> animation.pop()).key !== 1) {
                                        animateMotion.addKeyPoint({ key: 1, value: animateMotion.distance });
                                    }
                                    if (isString(timingFunction)) {
                                        animateMotion.timingFunction = timingFunction;
                                    }
                                }
                                else {
                                    attributes.push(name);
                                    const keyTimes: number[] = [];
                                    const values: string[] = [];
                                    const keySplines: string[] = [];
                                    const lengthA = animation.length;
                                    for (let j = 0; j < lengthA; j++) {
                                        const item = animation[j];
                                        const { key, value } = item;
                                        keyTimes.push(key);
                                        values.push(value);
                                        if (includeKeySplines && j < lengthA - 1) {
                                            const spline = keyframeMap['animation-timing-function']?.find(timing => timing.key === key);
                                            keySplines.push(spline?.value || timingFunction);
                                        }
                                        const transformOrigin = item.transformOrigin;
                                        if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                            let origin = animate.transformOrigin;
                                            if (origin === undefined) {
                                                origin = [];
                                                animate.transformOrigin = origin;
                                            }
                                            origin[j] = transformOrigin;
                                        }
                                    }
                                    if (includeKeySplines && !keySplines.every(value => value === 'linear')) {
                                        const keyTimesData: number[] = [];
                                        const valuesData: string[] = [];
                                        const keySplinesData: string[] = [];
                                        const lengthB = keyTimes.length;
                                        for (let j = 0; j < lengthB; j++) {
                                            const time = keyTimes[j];
                                            const value = values[j];
                                            if (j < lengthB - 1) {
                                                const keySpline = keySplines[j];
                                                if (value !== '' && /^step/.test(keySpline)) {
                                                    const steps = SvgAnimate.convertStepTimingFunction(name, keySpline, keyTimes, values, j, getFontSize(element));
                                                    if (steps) {
                                                        const [stepTime, stepValue] = steps;
                                                        const stepDuration = (keyTimes[j + 1] - time) * duration;
                                                        const offset = keyTimes[j + 1] === 1 ? 1 : 0;
                                                        const lengthC = stepTime.length;
                                                        for (let k = 0; k < lengthC - offset; k++) {
                                                            let keyTime = (time + stepTime[k] * stepDuration) / duration;
                                                            if (keyTimesData.includes(keyTime)) {
                                                                keyTime += 1 / 1000;
                                                            }
                                                            keyTimesData.push(keyTime);
                                                            valuesData.push(stepValue[k]);
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
                                animate.reverse = /reverse$/.test(direction);
                                animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && /^alternate/.test(direction);
                                groupName.push(animate);
                            }
                        }
                    }
                    groupOrdering.reverse();
                    for (const item of groupName) {
                        item.setGroupOrdering(groupOrdering);
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
            return isVisible(this.element);
        }

        get opacity() {
            return getAttribute(this.element, 'opacity') || '1';
        }
    };
};