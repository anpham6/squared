import { SvgAnimationAttribute, SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { KEYSPLINE_NAME } from './lib/constant';
import { TRANSFORM } from './lib/util';

interface AttributeData extends NumberValue<string> {
    transformOrigin?: Point;
}

type AttributeMap = ObjectMap<AttributeData[]>;

const $css = squared.lib.css;
const $util = squared.lib.util;

const KEYFRAME_NAME = $css.getKeyframeRules();
const ANIMATION_DEFAULT: StringMap = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};

const REGEXP_CUBICBEZIER = `cubic-bezier\\((${$util.REGEXP_STRING.ZERO_ONE}), (${$util.REGEXP_STRING.DECIMAL}), (${$util.REGEXP_STRING.ZERO_ONE}), (${$util.REGEXP_STRING.DECIMAL})\\)`;
const REGEXP_TIMINGFUNCTION = `(ease|ease-in|ease-out|ease-in-out|linear|step-(?:start|end)|steps\\(\\d+, (?:start|end)\\)|${REGEXP_CUBICBEZIER}),?\\s*`;

function setAttribute(element: SVGElement, attr: string, value: string) {
    element.style[attr] = value;
    element.setAttribute(attr, value);
}

function parseAttribute(element: SVGElement, attr: string) {
    const value = $css.getAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        const pattern = new RegExp(REGEXP_TIMINGFUNCTION, 'g');
        let match: RegExpMatchArray | null;
        const result: string[] = [];
        while ((match = pattern.exec(value)) !== null) {
            result.push(match[1]);
        }
        return result;
    }
    else {
        return value.split($util.REGEXP_COMPILED.SEPARATOR);
    }
}

function sortAttribute(value: NumberValue<string>[]) {
    return value.sort((a, b) => a.index >= b.index ? 1 : -1);
}

function setVisible(element: SVGGraphicsElement, value: boolean) {
    setAttribute(element, 'display', value ? 'block' : 'none');
    setAttribute(element, 'visibility', value ? 'visible' : 'hidden');
}

function isVisible(element: Element) {
    const value = $css.getAttribute(element, 'visibility', true);
    return value !== 'hidden' && value !== 'collapse' && $css.getAttribute(element, 'display', true) !== 'none';
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
        element.style.opacity = opacity.toString();
        element.setAttribute('opacity', opacity.toString());
    }
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
            function addAnimation(item: SvgAnimation, delay: number, name = '') {
                if (name === '') {
                    id++;
                }
                item.delay = delay;
                item.group = { id, name };
                result.push(item);
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGAnimationElement) {
                    const begin = item.attributes.getNamedItem('begin');
                    if (begin && /^[a-zA-Z]+$/.test(begin.value.trim())) {
                        continue;
                    }
                    const times = begin ? $util.sortNumber($util.replaceMap<string, number>(begin.value.split(';'), value => SvgAnimation.convertClockTime(value))) : [0];
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
                                    addAnimation(new SvgAnimateMotion(element, <SVGAnimateMotionElement> item), time);
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
                    const keyframes = KEYFRAME_NAME.get(animationName[i]);
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
                            const fraction = parseInt(percent) / 100;
                            for (const name in keyframes[percent]) {
                                const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                if (map[name] === undefined) {
                                    map[name] = [];
                                }
                                let value: string | number | undefined = keyframes[percent][name];
                                if ($util.isCalc(value)) {
                                    value = $css.calculateVar(element, value, name);
                                }
                                if (value !== undefined) {
                                    map[name].push({
                                        index: fraction,
                                        value: value.toString()
                                    });
                                }
                            }
                        }
                        if (attrMap['transform']) {
                            function getKeyframeOrigin(order: number) {
                                const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.index === order);
                                if (origin) {
                                    return TRANSFORM.origin(element, origin.value);
                                }
                                return undefined;
                            }
                            for (const transform of sortAttribute(attrMap['transform'])) {
                                const transforms = TRANSFORM.parse(element, transform.value);
                                if (transforms) {
                                    const origin = getKeyframeOrigin(transform.index);
                                    transforms.forEach(item => {
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
                                                if (origin && (transform.index !== 0 || origin.x !== 0 || origin.y !== 0)) {
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
                                                if (origin && (transform.index !== 0 || origin.y !== 0)) {
                                                    transformOrigin = {
                                                        x: origin.y * m.c * -1,
                                                        y: 0
                                                    };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                name = 'skewY';
                                                value = item.angle.toString();
                                                if (origin && (transform.index !== 0 || origin.x !== 0)) {
                                                    transformOrigin = {
                                                        x: 0,
                                                        y: origin.x * m.b * -1
                                                    };
                                                }
                                                break;
                                            default:
                                                return;
                                        }
                                        if (attrMap[name] === undefined) {
                                            attrMap[name] = [];
                                        }
                                        const previousIndex = attrMap[name].findIndex(subitem => subitem.index === transform.index);
                                        if (previousIndex !== -1) {
                                            attrMap[name][previousIndex].value = value;
                                            attrMap[name][previousIndex].transformOrigin = transformOrigin;
                                        }
                                        else {
                                            attrMap[name].push({
                                                index: transform.index,
                                                value,
                                                transformOrigin
                                            });
                                        }
                                    });
                                }
                            }
                        }
                        delete attrMap['transform'];
                        delete attrMap['transform-origin'];
                        for (const name in attrMap) {
                            attributes.push(name);
                            const animation = attrMap[name];
                            let animate: SvgAnimate;
                            switch (name) {
                                case 'rotate':
                                case 'scale':
                                case 'skewX':
                                case 'skewY':
                                case 'translate':
                                    animate = new SvgAnimateTransform(element);
                                    animate.attributeName = 'transform';
                                    (<SvgAnimateTransform> animate).setType(name);
                                    break;
                                default:
                                    animate = new SvgAnimate(element);
                                    animate.attributeName = name;
                                    break;
                            }
                            const timingFunction = cssData['animation-timing-function'][i];
                            const direction = cssData['animation-direction'][i];
                            const keyTimes: number[] = [];
                            const values: string[] = [];
                            const keySplines: string[] = [];
                            sortAttribute(animation);
                            for (let j = 0; j < animation.length; j++) {
                                keyTimes.push(animation[j].index);
                                values.push(animation[j].value);
                                if (j < animation.length - 1) {
                                    const spline = keyframeMap['animation-timing-function'] && keyframeMap['animation-timing-function'].find(item => item.index === animation[j].index);
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
                            addAnimation(animate, delay, keyframeIndex);
                            animate.paused = paused;
                            animate.duration = duration;
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
                                            const match = new RegExp(REGEXP_CUBICBEZIER).exec(keySplines[j]);
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
                            }
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
            for (const item of result) {
                item.parent = this;
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
            return $css.getAttribute(this.element, 'opacity') || '1';
        }
    };
};