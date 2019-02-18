import { SvgAnimateAttribute, SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { KEYSPLINE_NAME } from './lib/constant';
import { TRANSFORM, convertClockTime, getFontSize, isVisible, setOpacity, setVisible, sortNumber } from './lib/util';

interface AttributeData extends NumberValue<string> {
    transformOrigin?: Point;
}

type AttributeMap = ObjectMap<AttributeData[]>;

const $dom = squared.lib.dom;
const $util = squared.lib.util;

const KEYFRAME_NAME = $dom.getKeyframeRules();
const ANIMATION_DEFAULT: StringMap = {
    'animation-delay': '0s',
    'animation-duration': '0s',
    'animation-iteration-count': '1',
    'animation-play-state': 'running',
    'animation-direction': 'normal',
    'animation-fill-mode': 'none',
    'animation-timing-function': 'ease'
};
const REGEXP_0_1 = '(0(?:\\.\\d+)?|1(?:\\.0+)?)';
const REGEXP_CUBICBEZIER = new RegExp(`cubic-bezier\\(${REGEXP_0_1}, ${$util.REGEXP_STRING.DECIMAL}, ${REGEXP_0_1}, ${$util.REGEXP_STRING.DECIMAL}\\)`);

function parseAttribute(element: SVGElement, attr: string) {
    let value = $dom.cssAttribute(element, attr);
    if (attr === 'animation-timing-function') {
        const result: string[] = [];
        while (value !== '') {
            let index = value.indexOf(',');
            if (index !== -1) {
                let segment = value.substring(0, index);
                if (segment.startsWith('steps') || segment.startsWith('cubic-bezier')) {
                    const nextIndex = value.indexOf(')', index) + 1;
                    segment += value.substring(index, nextIndex);
                    index = nextIndex;
                }
                result.push(segment);
                value = value.substring(index + 1).trim();
            }
            else {
                result.push(value);
                break;
            }
        }
        return result;
    }
    else {
        return $util.flatMap(value.split(','), item => item.trim());
    }
}

function sortAttribute(value: NumberValue<string>[]) {
    return value.sort((a, b) => a.index >= b.index ? 1 : -1);
}

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed: SvgTransform[] | null = null;
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
                    const times = begin ? sortNumber($util.replaceMap<string, number>(begin.value.split(';'), value => convertClockTime(value))) : [0];
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
                                        animate.transformFrom = this.path.draw(undefined, undefined, true);
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
                const groupSiblings: SvgAnimateAttribute[] = [];
                for (const name in ANIMATION_DEFAULT) {
                    const values = parseAttribute(element, name);
                    if (values.length === 0) {
                        values.push(ANIMATION_DEFAULT[name]);
                    }
                    while (values.length < animationName.length) {
                        values.push(...values.slice(0));
                    }
                    values.length = animationName.length;
                    cssData[name] = values;
                }
                for (let i = 0; i < animationName.length; i++) {
                    const keyframes = KEYFRAME_NAME.get(animationName[i]);
                    const duration = convertClockTime(cssData['animation-duration'][i]);
                    if (keyframes && duration > 0) {
                        id++;
                        const attrMap: AttributeMap = {};
                        const keyframeMap: AttributeMap = {};
                        const paused = cssData['animation-play-state'][i] === 'paused';
                        const delay = convertClockTime(cssData['animation-delay'][i]);
                        const iterationCount = cssData['animation-iteration-count'][i];
                        const fillMode = cssData['animation-fill-mode'][i];
                        const keyframeIndex = `${animationName[i]}_${i}`;
                        const attributes: string[] = [];
                        groupSiblings.push({
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
                                map[name].push({ index: fraction, value: keyframes[percent][name] });
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
                            addAnimation(animate, delay, keyframeIndex);
                            animate.paused = paused;
                            animate.duration = duration;
                            if (!keySplines.every(spline => spline === 'linear')) {
                                const keyTimesData: number[] = [];
                                const valuesData: string[] = [];
                                const keySplinesData: string[] = [];
                                for (let j = 0; j < keySplines.length; j++) {
                                    if (KEYSPLINE_NAME[keySplines[j]]) {
                                        keySplines[j] = KEYSPLINE_NAME[keySplines[j]];
                                    }
                                    else if (keySplines[j].startsWith('step')) {
                                        if (j === 0 && values[j] === '' && animate.baseFrom) {
                                            values[j] = animate.baseFrom;
                                        }
                                        const steps = SvgAnimate.toStepFractionList(name, keyTimes, values, keySplines[j], j, getFontSize(element));
                                        if (steps) {
                                            keyTimesData.push(...steps[0]);
                                            valuesData.push(...steps[1]);
                                            steps[0].forEach(() => keySplinesData.push(KEYSPLINE_NAME['step']));
                                            continue;
                                        }
                                        keySplines[j] = KEYSPLINE_NAME.linear;
                                    }
                                    else {
                                        const match = REGEXP_CUBICBEZIER.exec(keySplines[j]);
                                        keySplines[j] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                    }
                                    keyTimesData.push(keyTimes[j]);
                                    valuesData.push(values[j]);
                                    keySplinesData.push(keySplines[j]);
                                }
                                keyTimesData.push(keyTimes.pop() as number);
                                valuesData.push(values.pop() as string);
                                animate.values = valuesData;
                                animate.keyTimes = keyTimesData;
                                animate.keySplines = keySplinesData;
                            }
                            else {
                                animate.values = values;
                                animate.keyTimes = keyTimes;
                            }
                            if (animate.keyTimes[0] !== 0 && $util.isString(animate.baseFrom)) {
                                animate.keyTimes.unshift(0);
                                animate.values.unshift(animate.baseFrom);
                                if (animate.keySplines) {
                                    animate.keySplines.unshift(timingFunction);
                                }
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
                groupSiblings.reverse();
                for (const item of groupName) {
                    item.setGroupSiblings(groupSiblings);
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
            return $dom.cssAttribute(this.element, 'opacity') || '1';
        }
    };
};