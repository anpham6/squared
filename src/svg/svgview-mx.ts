import type SvgElement from './svgelement';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { CACHE_VIEWNAME, PATTERN_CUBICBEZIER, TRANSFORM, calculateStyle, getAttribute } from './lib/util';

type AttributeMap = ObjectMap<AttributeData[]>;

interface AttributeData extends NumberValue {
    transformOrigin?: Point;
}

const { STRING } = squared.lib.regex;

const { asPercent, hasCalc, isAngle, hasCustomProperty, parseAngle, parseVar } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { convertCamelCase, convertWord, iterateArray, splitEnclosing, splitPairEnd, spliceString, startsWith } = squared.lib.util;

const { getKeyframesRules } = squared.base.lib.css;

const ANIMATION_DEFAULT = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};

const REGEXP_PERCENT = new RegExp(STRING.PERCENT, 'g');
const REGEXP_TIMINGFUNCTION = new RegExp(`(ease|ease-(?:in|out|in-out)|linear|step-(?:start|end)|steps\\(\\d+,\\s*(?:start|end|jump-(?:start|end|both|none))\\)|cubic-bezier\\(${PATTERN_CUBICBEZIER}\\))\\s*,?`, 'g');

function parseAttribute(element: SVGElement, attr: string) {
    const value = getAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        const result: string[] = [];
        let match: Null<RegExpExecArray>;
        while (match = REGEXP_TIMINGFUNCTION.exec(value)) {
            result.push(match[1]);
        }
        REGEXP_TIMINGFUNCTION.lastIndex = 0;
        return result;
    }
    return value.split(/\s*,\s*/);
}

function convertRotate(value: string) {
    if (startsWith(value, 'reverse')) {
        const angle = splitPairEnd(value, ' ');
        return `auto ${angle ? isAngle(angle) ? 180 + parseAngle(angle, 0) : '0' : '180'}deg`;
    }
    return value;
}

function getKeyframeOrigin(attrData: AttributeMap, element: SVGGraphicsElement, order: number) {
    const origin = attrData['transform-origin']?.find(item => item.key === order);
    if (origin) {
        return TRANSFORM.origin(element, origin.value);
    }
}

function getTextContent(element: SVGElement, attr: string, lang?: string) {
    if (lang) {
        const child = element.querySelector(`:scope > ${attr}[lang="${lang}"]`);
        if (child) {
            return child.textContent!.trim() || '';
        }
    }
    return element.querySelector(`:scope > ${attr}`)?.textContent!.trim() || '';
}

const sortAttribute = (value: NumberValue[]) => value.sort((a, b) => a.key - b.key);

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed: Null<SvgTransform[]> = null;

        protected _transforms: Null<SvgTransform[]> = null;
        protected _animations: Null<SvgAnimation[]> = null;

        private _name = '';

        public getTransforms(element = this.element) {
            return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
        }

        public getAnimations(element = this.element) {
            const result: SvgAnimation[] = [];
            let id = 0;
            const addAnimation = (item: SvgAnimation, delay: number, name = '') => {
                if (!name) {
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
                    let times: number[];
                    if (begin) {
                        if ((times = SvgAnimation.getClockTimes(begin)).length === 0) {
                            return;
                        }
                    }
                    else {
                        times = [0];
                    }
                    const precision = this.viewport?.precision;
                    switch (item.tagName.toLowerCase()) {
                        case 'set':
                            times.forEach(time => addAnimation(new SvgAnimation(element, item), time));
                            break;
                        case 'animate':
                            times.forEach(time => addAnimation(new SvgAnimate(element, item as SVGAnimateElement), time));
                            break;
                        case 'animatetransform':
                            for (const time of times) {
                                const animate = new SvgAnimateTransform(element, item as SVGAnimateTransformElement);
                                if (SvgBuild.isShape(this) && this.path) {
                                    animate.transformFrom = SvgBuild.drawRefit(element, this.parent, precision);
                                }
                                addAnimation(animate, time);
                            }
                            break;
                        case 'animatemotion':
                            for (const time of times) {
                                const animate = new SvgAnimateMotion(element, item as SVGAnimateMotionElement);
                                const motionPathElement = animate.motionPathElement;
                                if (motionPathElement) {
                                    animate.path = SvgBuild.drawRefit(motionPathElement, this.parent, precision);
                                }
                                addAnimation(animate, time);
                            }
                            break;
                    }
                }
            });
            const animationName = parseAttribute(element, 'animation-name');
            const length = animationName.length;
            if (length === 0) {
                return result;
            }
            const keyframesMap = this.viewport?.keyframesMap || getKeyframesRules();
            const cssData: ObjectMap<string[]> = {};
            const groupName: SvgAnimate[] = [];
            const groupOrdering: SvgAnimationAttribute[] = [];
            for (const name in ANIMATION_DEFAULT) {
                const values = parseAttribute(element, name);
                if (values.length === 0) {
                    values.push(ANIMATION_DEFAULT[name]);
                }
                while (values.length < length) {
                    values.push(...values.slice(0));
                }
                values.length = length;
                cssData[name] = values;
            }
            for (let i = 0, duration: number; i < length; ++i) {
                const clockTime = cssData['animation-duration']![i];
                if (!clockTime) {
                    continue;
                }
                const keyframes = keyframesMap.get(animationName[i]);
                if (keyframes && (duration = SvgAnimation.parseClockTime(clockTime)) > 0) {
                    ++id;
                    const attrData: AttributeMap = {};
                    const keyframeData: AttributeMap = {};
                    const paused = cssData['animation-play-state']![i] === 'paused';
                    const delay = SvgAnimation.parseClockTime(cssData['animation-delay']![i]) || 0;
                    const iterationCount = cssData['animation-iteration-count']![i];
                    const fillMode = cssData['animation-fill-mode']![i];
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
                        const key = asPercent(percent);
                        const data = keyframes[percent];
                        for (const attr in data) {
                            let value = data[attr]!;
                            if (value.indexOf('%') !== -1) {
                                const segments = splitEnclosing(value);
                                let match: Null<RegExpExecArray>;
                                for (let j = 0; j < segments.length; j += 2) {
                                    let current = segments[j];
                                    while (match = REGEXP_PERCENT.exec(current)) {
                                        const calc = `calc(${match[0]})`;
                                        current = spliceString(current, match.index, match[0].length, calc);
                                        REGEXP_PERCENT.lastIndex = match.index + calc.length;
                                    }
                                    segments[j] = current;
                                    REGEXP_PERCENT.lastIndex = 0;
                                }
                                value = segments.join('');
                            }
                            if (hasCalc(value)) {
                                value = calculateStyle(element, convertCamelCase(attr), value);
                            }
                            else if (hasCustomProperty(value)) {
                                value = parseVar(element, value);
                            }
                            if (value) {
                                const map = ANIMATION_DEFAULT[attr] ? keyframeData : attrData;
                                (map[attr] ||= []).push({ key, value });
                            }
                        }
                    }
                    if (attrData.transform) {
                        for (const { key, value: transform } of sortAttribute(attrData.transform)) {
                            const items = TRANSFORM.parse(element, transform);
                            if (!items) {
                                continue;
                            }
                            const origin = getKeyframeOrigin(attrData, element, key) || TRANSFORM.origin(element);
                            for (let j = 0, q = items.length; j < q; ++j) {
                                const item = items[j];
                                const m = item.matrix;
                                let name: string,
                                    value: string,
                                    transformOrigin: Undef<Point>;
                                switch (item.type) {
                                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                        name = 'translate';
                                        value = m.e + ' ' + m.f;
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SCALE:
                                        name = 'scale';
                                        value = m.a + ' ' + m.d + ' ' + origin.x + ' ' + origin.y;
                                        if (origin.x !== 0 || origin.y !== 0) {
                                            transformOrigin = {
                                                x: origin.x * (1 - m.a),
                                                y: origin.y * (1 - m.d)
                                            };
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                                        name = 'rotate';
                                        value = item.angle + ' ' + origin.x + ' ' + origin.y;
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                                        name = 'skewX';
                                        value = item.angle.toString();
                                        if (origin.y !== 0) {
                                            transformOrigin = {
                                                x: origin.y * m.c * -1,
                                                y: 0
                                            };
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                                        name = 'skewY';
                                        value = item.angle.toString();
                                        if (origin.x !== 0) {
                                            transformOrigin = {
                                                x: 0,
                                                y: origin.x * m.b * -1
                                            };
                                        }
                                        break;
                                    default:
                                        continue;
                                }
                                const itemData = attrData[name] ||= [];
                                const index = itemData.findIndex(previous => previous.key === key);
                                if (index !== -1) {
                                    const indexData = itemData[index];
                                    indexData.value = value;
                                    indexData.transformOrigin = transformOrigin;
                                }
                                else {
                                    itemData.push({ key, value, transformOrigin });
                                }
                            }
                        }
                        delete attrData.transform;
                        delete attrData['transform-origin'];
                    }
                    if (getAttribute(element, 'offset-path') === 'none') {
                        delete attrData['offset-distance'];
                        delete attrData['offset-rotate'];
                    }
                    else if (attrData['offset-rotate']) {
                        const offsetRotate = attrData['offset-rotate'];
                        if (attrData['offset-distance'] || !attrData.rotate) {
                            let rotate = getAttribute(element, 'offset-rotate');
                            if (!rotate || rotate === 'auto') {
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
                                    const previousAuto = startsWith(previousValue, 'auto');
                                    const auto = startsWith(itemValue, 'auto');
                                    if (previousAuto && !auto || !previousAuto && auto) {
                                        const key = (previous.key + item.key) / 2;
                                        offsetRotate.splice(j++, 0, { key, value: previousValue });
                                        offsetRotate.splice(j++, 0, { key, value: itemValue });
                                    }
                                }
                            }
                            if (!attrData['offset-distance']) {
                                const animate = new SvgAnimateMotion(element);
                                animate.duration = 0;
                                animate.iterationCount = 1;
                                animate.fillForwards = true;
                                animate.addKeyPoint({ key: 0, value: animate.distance });
                                addAnimation(animate, delay, keyframeIndex);
                                for (let j = 0, q = offsetRotate.length; j < q; ++j) {
                                    const item = offsetRotate[j];
                                    item.value = (parseAngle(item.value.split(' ').pop()!, 0) + (startsWith(item.value, 'auto') ? 90 : 0)) + ' 0 0';
                                }
                                attrData.rotate = offsetRotate;
                                delete attrData['offset-rotate'];
                                includeKeySplines = false;
                            }
                        }
                        else {
                            delete attrData['offset-rotate'];
                        }
                    }
                    for (const name in attrData) {
                        let animate: SvgAnimate;
                        switch (name) {
                            case 'offset-rotate':
                                continue;
                            case 'offset-distance':
                                animate = new SvgAnimateMotion(element);
                                (animate as SvgAnimateMotion).rotateData = attrData['offset-rotate'];
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
                        const animation = attrData[name]!;
                        const direction = cssData['animation-direction']![i];
                        const timingFunction = cssData['animation-timing-function']![i];
                        const q = animation.length;
                        sortAttribute(animation);
                        if (name === 'offset-distance') {
                            const animateMotion = animate as SvgAnimateMotion;
                            if (animation[0].key !== 0) {
                                animateMotion.addKeyPoint({ key: 0, value: animateMotion.distance });
                            }
                            for (let j = 0; j < q; ++j) {
                                animateMotion.addKeyPoint(animation[j]);
                            }
                            if ((animation.pop() as NumberValue).key !== 1) {
                                animateMotion.addKeyPoint({ key: 1, value: animateMotion.distance });
                            }
                            if (timingFunction) {
                                animateMotion.timingFunction = timingFunction;
                            }
                        }
                        else {
                            attributes.push(name);
                            const keySplines: string[] = [];
                            const keyTimes: number[] = new Array(q);
                            const values: string[] = new Array(q);
                            for (let j = 0; j < q; ++j) {
                                const item = animation[j];
                                const { key, value } = item;
                                keyTimes[j] = key;
                                values[j] = value;
                                if (includeKeySplines && j < q - 1) {
                                    keySplines.push(keyframeData['animation-timing-function']?.find(timing => timing.key === key)?.value || timingFunction);
                                }
                                const transformOrigin = item.transformOrigin;
                                if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                    (animate.transformOrigin ||= [])[j] = transformOrigin;
                                }
                            }
                            if (includeKeySplines && !keySplines.every(value => value === 'linear')) {
                                const keyTimesData: number[] = [];
                                const valuesData: string[] = [];
                                const keySplinesData: string[] = [];
                                for (let j = 0, r = keyTimes.length; j < r; ++j) {
                                    const time = keyTimes[j];
                                    const value = values[j];
                                    if (j < r - 1) {
                                        const keySpline = keySplines[j];
                                        if (value && startsWith(keySpline, 'step')) {
                                            const stepData = SvgAnimate.fromStepTimingFunction(element, name, keySpline, keyTimes, values, j);
                                            if (stepData) {
                                                const [stepTime, stepValue] = stepData;
                                                const stepDuration = (keyTimes[j + 1] - time) * duration;
                                                const s = stepTime.length - (keyTimes[j + 1] === 1 ? 1 : 0);
                                                for (let k = 0; k < s; ++k) {
                                                    let keyTime = (time + stepTime[k] * stepDuration) / duration;
                                                    if (keyTimesData.includes(keyTime)) {
                                                        keyTime += 1 / 1000;
                                                    }
                                                    keyTimesData.push(keyTime);
                                                    valuesData.push(stepValue[k]);
                                                    keySplinesData.push(SvgAnimate.KEYSPLINE_NAME[keySpline.indexOf('start') !== -1 ? 'step-start' : 'step-end']);
                                                }
                                                continue;
                                            }
                                        }
                                        keySplinesData.push(SvgAnimate.findTimingFunction(keySpline));
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
                        animate.iterationCount = iterationCount !== 'infinite' ? +iterationCount : -1;
                        animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                        animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                        animate.reverse = direction.endsWith('reverse');
                        animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && startsWith(direction, 'alternate');
                        groupName.push(animate);
                    }
                }
            }
            groupOrdering.reverse();
            for (let i = 0, q = groupName.length; i < q; ++i) {
                groupName[i].setGroupOrdering(groupOrdering);
            }
            return result;
        }

        public getTitle(lang?: string) {
            return getTextContent(this.element, 'title', lang);
        }

        public getDesc(lang?: string) {
            return !lang && getNamedItem(this.element, 'aria-describedby') || getTextContent(this.element, 'desc', lang);
        }

        public hasAnimations() {
            return this.animations.length > 0;
        }

        public hasTransforms() {
            return this.transforms.length > 0;
        }

        set name(value) {
            this._name = value;
        }
        get name() {
            let result = this._name;
            if (!result) {
                const element = this.element;
                let id = element.id.trim(),
                    value: Undef<string>,
                    tagName: Undef<string>;
                if (id) {
                    id = convertWord(id);
                    if (!CACHE_VIEWNAME.has(id)) {
                        value = id;
                    }
                    tagName = id;
                }
                else {
                    tagName = element.tagName.toLowerCase();
                }
                let index = CACHE_VIEWNAME.get(tagName) || 0;
                if (value) {
                    CACHE_VIEWNAME.set(value, index);
                    result = value;
                }
                else {
                    CACHE_VIEWNAME.set(tagName, ++index);
                    result = tagName + '_' + index;
                }
                this._name = result;
            }
            return result;
        }

        get transforms() {
            return this._transforms ||= this.getTransforms();
        }

        get animations() {
            return this._animations ||= this.getAnimations();
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