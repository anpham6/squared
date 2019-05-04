import { SvgAnimationAttribute, SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { KEYSPLINE_NAME } from './lib/constant';
import { TRANSFORM, getAttribute } from './lib/util';

interface AttributeData extends NumberValue {
    transformOrigin?: Point;
}

type AttributeMap = ObjectMap<AttributeData[]>;

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $util = squared.lib.util;

const STRING_CUBICBEZIER = `cubic-bezier\\(([\\d.]+), ([\\d.]+), ([\\d.]+), ([\\d.]+)\\)`;

const REGEXP_TIMINGFUNCTION = new RegExp(`(ease|ease-in|ease-out|ease-in-out|linear|step-(?:start|end)|steps\\(\\d+, (?:start|end)\\)|${STRING_CUBICBEZIER}),?\\s*`, 'g');

const KEYFRAME_MAP = $css.getKeyframeRules();
const ANIMATION_DEFAULT = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};

function setAttribute(element: SVGElement, attr: string, value: string) {
    element.style[attr] = value;
    element.setAttribute(attr, value);
}

function parseAttribute(element: SVGElement, attr: string) {
    const value = getAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        const result: string[] = [];
        let match: RegExpMatchArray | null;
        while ((match = REGEXP_TIMINGFUNCTION.exec(value)) !== null) {
            result.push(match[1]);
        }
        return result;
    }
    else {
        return value.split($regex.XML.SEPARATOR);
    }
}

function setVisible(element: SVGGraphicsElement, value: boolean) {
    setAttribute(element, 'display', value ? 'block' : 'none');
    setAttribute(element, 'visibility', value ? 'visible' : 'hidden');
}

function isVisible(element: Element) {
    const value = getAttribute(element, 'visibility');
    return value !== 'hidden' && value !== 'collapse' && getAttribute(element, 'display') !== 'none';
}

function setOpacity(element: SVGGraphicsElement, value: string) {
    if ($util.isNumber(value)) {
        let opacity = parseFloat(value.toString());
        if (opacity <= 0) {
            opacity = 0;
        }
        else if (opacity >= 1) {
            opacity = 1;
        }
        element.style.setProperty('opacity', opacity.toString());
        element.setAttribute('opacity', opacity.toString());
    }
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
    else if (value.startsWith('reverse ')) {
        const angle = value.split(' ')[1];
        if ($css.isAngle(angle)) {
            return `auto ${180 + $css.parseAngle(angle)}deg`;
        }
        return 'auto 0deg';
    }
    return value;
}

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed?: SvgTransform[];
        public translationOffset?: Point;

        private _name?: string;
        private _transforms?: SvgTransform[];
        private _animations?: SvgAnimation[];

        public getTransforms(companion?: SVGGraphicsElement) {
            const element = companion || this.element;
            return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
        }

        public getAnimations(companion?: SVGGraphicsElement) {
            const element = companion || this.element;
            const result: SvgAnimation[] = [];
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
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGAnimationElement) {
                    const begin = $dom.getNamedItem(item, 'begin');
                    if (begin !== '' && /^[a-zA-Z]+$/.test(begin)) {
                        continue;
                    }
                    const times = begin ? $util.sortNumber($util.replaceMap<string, number>(begin.split(';'), value => SvgAnimation.convertClockTime(value))) : [0];
                    if (times.length) {
                        switch (item.tagName) {
                            case 'set':
                                for (const time of times) {
                                    addAnimation(new SvgAnimation(element, <SVGAnimationElement> item), time);
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
                                        animate.transformFrom = SvgBuild.drawRefit(element, this.parent, this.viewport && this.viewport.precision);
                                    }
                                    addAnimation(animate, time);
                                }
                                break;
                            case 'animateMotion':
                                for (const time of times) {
                                    const animate = new SvgAnimateMotion(element, <SVGAnimateMotionElement> item);
                                    if (animate.motionPathElement) {
                                        animate.path = SvgBuild.drawRefit(animate.motionPathElement, this.parent, this.viewport && this.viewport.precision);
                                    }
                                    addAnimation(animate, time);
                                }
                                break;
                        }
                    }
                }
            }
            const animationName = parseAttribute(element, 'animation-name');
            if (animationName.length) {
                const cssData: ObjectMap<string[]> = {};
                const groupName: SvgAnimate[] = [];
                const groupOrdering: SvgAnimationAttribute[] = [];
                for (const name in ANIMATION_DEFAULT) {
                    const values = parseAttribute(element, name);
                    if (values.length === 0) {
                        values.push(ANIMATION_DEFAULT[name]);
                    }
                    while (values.length < animationName.length) {
                        $util.concatArray(values, values.slice(0));
                    }
                    values.length = animationName.length;
                    cssData[name] = values;
                }
                for (let i = 0; i < animationName.length; i++) {
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
                        const keyframeIndex = `${animationName[i]}_${i}`;
                        const attributes: string[] = [];
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
                            for (const name in keyframes[percent]) {
                                const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                if (map[name] === undefined) {
                                    map[name] = [];
                                }
                                let value: any = keyframes[percent][name];
                                if (value) {
                                    if ($css.isCalc(value)) {
                                        value = $css.calculateVar(element, value, name);
                                    }
                                    else if ($css.isCustomProperty(value)) {
                                        value = $css.parseVar(element, value);
                                    }
                                    if (value !== undefined) {
                                        map[name].push({ key, value: value.toString() });
                                    }
                                }
                            }
                        }
                        if (attrMap['transform']) {
                            function getKeyframeOrigin(order: number) {
                                const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.key === order);
                                if (origin) {
                                    return TRANSFORM.origin(element, origin.value);
                                }
                                return undefined;
                            }
                            for (const transform of sortAttribute(attrMap['transform'])) {
                                const transforms = TRANSFORM.parse(element, transform.value);
                                if (transforms) {
                                    const origin = getKeyframeOrigin(transform.key);
                                    for (const item of transforms) {
                                        const m = item.matrix;
                                        let name: string;
                                        let value: string;
                                        let transformOrigin: Point | undefined;
                                        switch (item.type) {
                                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                name = 'translate';
                                                value = `${m.e} ${m.f}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                                name = 'scale';
                                                value = `${m.a} ${m.d} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                if (origin && (transform.key !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                    transformOrigin = {
                                                        x: origin.x * (1 - m.a),
                                                        y: origin.y * (1 - m.d)
                                                    };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                name = 'rotate';
                                                value = `${item.angle} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                name = 'skewX';
                                                value = item.angle.toString();
                                                if (origin && (transform.key !== 0 || origin.y !== 0)) {
                                                    transformOrigin = {
                                                        x: origin.y * m.c * -1,
                                                        y: 0
                                                    };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                name = 'skewY';
                                                value = item.angle.toString();
                                                if (origin && (transform.key !== 0 || origin.x !== 0)) {
                                                    transformOrigin = {
                                                        x: 0,
                                                        y: origin.x * m.b * -1
                                                    };
                                                }
                                                break;
                                            default:
                                                continue;
                                        }
                                        if (attrMap[name] === undefined) {
                                            attrMap[name] = [];
                                        }
                                        const index = attrMap[name].findIndex(previous => previous.key === transform.key);
                                        if (index !== -1) {
                                            attrMap[name][index].value = value;
                                            attrMap[name][index].transformOrigin = transformOrigin;
                                        }
                                        else {
                                            attrMap[name].push({
                                                key: transform.key,
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
                                let distance = getAttribute(element, 'offset-rotate', false);
                                if (distance === '' || distance === 'auto') {
                                    distance = 'auto 0deg';
                                }
                                sortAttribute(offsetRotate);
                                const from = offsetRotate[0];
                                const to = offsetRotate[offsetRotate.length - 1];
                                if (from.key !== 0) {
                                    offsetRotate.unshift({ key: 0, value: distance });
                                }
                                if (to.key !== 1) {
                                    offsetRotate.push({ key: 1, value: distance });
                                }
                                for (let j = 1; j < offsetRotate.length; j++) {
                                    const previous = offsetRotate[j - 1];
                                    const item = offsetRotate[j];
                                    previous.value = convertRotate(previous.value);
                                    item.value = convertRotate(item.value);
                                    if (previous.value.split(' ').pop() !== item.value.split(' ').pop()) {
                                        const previousAuto = previous.value.startsWith('auto');
                                        const auto = item.value.startsWith('auto');
                                        if (previousAuto && !auto || !previousAuto && auto) {
                                            const key = (previous.key + item.key) / 2;
                                            offsetRotate.splice(j++, 0, { key, value: previous.value });
                                            offsetRotate.splice(j++, 0, { key, value: item.value });
                                        }
                                    }
                                }
                                if (attrMap['offset-distance'] === undefined) {
                                    const animate = new SvgAnimateMotion(element);
                                    animate.duration = 0;
                                    animate.iterationCount = 1;
                                    animate.fillForwards = true;
                                    animate.addKeyPoint({ key: 0, value: distance });
                                    addAnimation(animate, delay, keyframeIndex);
                                    for (const item of offsetRotate) {
                                        let angle = $css.parseAngle(item.value.split(' ').pop() as string);
                                        if (item.value.startsWith('auto')) {
                                            angle += 90;
                                        }
                                        item.value = `${angle} 0 0`;
                                    }
                                    attrMap['rotate'] = offsetRotate;
                                    delete attrMap['offset-rotate'];
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
                                if ($util.isString(timingFunction)) {
                                    animateMotion.timingFunction = timingFunction;
                                }
                            }
                            else {
                                attributes.push(name);
                                const keyTimes: number[] = [];
                                const values: string[] = [];
                                const keySplines: string[] = [];
                                for (let j = 0; j < animation.length; j++) {
                                    keyTimes.push(animation[j].key);
                                    values.push(animation[j].value);
                                    if (j < animation.length - 1) {
                                        const spline = keyframeMap['animation-timing-function'] && keyframeMap['animation-timing-function'].find(item => item.key === animation[j].key);
                                        keySplines.push(spline ? spline.value : timingFunction);
                                    }
                                    const transformOrigin = animation[j].transformOrigin;
                                    if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                        if (animate.transformOrigin === undefined) {
                                            animate.transformOrigin = [];
                                        }
                                        animate.transformOrigin[j] = transformOrigin;
                                    }
                                }
                                if (keyTimes[0] !== 0) {
                                    keyTimes.unshift(0);
                                    values.unshift(animate.baseValue || '');
                                    keySplines.unshift(timingFunction);
                                    animate.evaluateStart = true;
                                }
                                if (!keySplines.every(value => value === 'linear')) {
                                    const keyTimesData: number[] = [];
                                    const valuesData: string[] = [];
                                    const keySplinesData: string[] = [];
                                    for (let j = 0; j < keyTimes.length; j++) {
                                        if (j < keyTimes.length - 1) {
                                            const segDuration = (keyTimes[j + 1] - keyTimes[j]) * duration;
                                            if (KEYSPLINE_NAME[keySplines[j]]) {
                                                keySplines[j] = KEYSPLINE_NAME[keySplines[j]];
                                            }
                                            else if (keySplines[j].startsWith('step')) {
                                                if (values[j] !== '') {
                                                    const steps = SvgAnimate.convertStepTimingFunction(name, keySplines[j], keyTimes, values, j, $css.getFontSize(element));
                                                    if (steps) {
                                                        const offset = keyTimes[j + 1] === 1 ? 1 : 0;
                                                        for (let k = 0; k < steps[0].length - offset; k++) {
                                                            let keyTime = (keyTimes[j] + steps[0][k] * segDuration) / duration;
                                                            if (keyTimesData.includes(keyTime)) {
                                                                keyTime += 1 / 1000;
                                                            }
                                                            keyTimesData.push(keyTime);
                                                            valuesData.push(steps[1][k]);
                                                            keySplinesData.push(KEYSPLINE_NAME[keySplines[j].indexOf('start') !== -1 ? 'step-start' : 'step-end']);
                                                        }
                                                        continue;
                                                    }
                                                }
                                                keySplines[j] = KEYSPLINE_NAME.linear;
                                            }
                                            else {
                                                const match = new RegExp(STRING_CUBICBEZIER).exec(keySplines[j]);
                                                keySplines[j] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                            }
                                            keySplinesData.push(keySplines[j]);
                                        }
                                        keyTimesData.push(keyTimes[j]);
                                        valuesData.push(values[j]);
                                    }
                                    animate.values = valuesData;
                                    animate.keyTimes = keyTimesData;
                                    animate.keySplines = keySplinesData;
                                }
                                else {
                                    animate.values = values;
                                    animate.keyTimes = keyTimes;
                                    animate.keySplines = keySplines;
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
                for (const item of groupName) {
                    item.setGroupOrdering(groupOrdering);
                }
            }
            return result;
        }

        set name(value) {
            this._name = value;
        }
        get name() {
            if (this._name === undefined) {
                this._name = SvgBuild.setName(this.element);
            }
            return this._name;
        }

        get transforms() {
            if (this._transforms === undefined) {
                this._transforms = this.getTransforms();
            }
            return this._transforms;
        }

        get animations() {
            if (this._animations === undefined) {
                this._animations = this.getAnimations();
            }
            return this._animations;
        }

        set visible(value) {
            setVisible(this.element, value);
        }
        get visible() {
            return isVisible(this.element);
        }

        set opacity(value) {
            setOpacity(this.element, value);
        }
        get opacity() {
            return getAttribute(this.element, 'opacity') || '1';
        }
    };
};