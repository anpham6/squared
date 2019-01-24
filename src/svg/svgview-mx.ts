import { SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { FILL_MODE, KEYSPLINE_NAME } from './lib/constant';
import { REGEXP_SVG, convertClockTime, getFontSize, getHostDPI, getTransform, getTransformInitialValue, getTransformOrigin, isVisible, setOpacity, setVisible } from './lib/util';

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
const REGEXP_CUBICBEZIER = new RegExp(`cubic-bezier\\(${REGEXP_SVG.ZERO_ONE}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.ZERO_ONE}, ${REGEXP_SVG.DECIMAL}\\)`);

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
        return $util.flatMap(value.split(/,/), item => item.trim());
    }
}

function sortAttribute(value: NumberValue<string>[]) {
    return value.sort((a, b) => a.ordinal >= b.ordinal ? 1 : -1);
}

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed: SvgTransform[] | null = null;
        public translationOffset?: Point;

        private _name?: string;
        private _animation?: SvgAnimation[];
        private _transform?: SvgTransform[];

        private getAnimations(element: SVGElement) {
            const result: SvgAnimation[] = [];
            const animationName = parseAttribute(element, 'animation-name');
            if (animationName.length) {
                const cssData: ObjectMap<string[]> = {};
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
                animationName.forEach((className, index) => {
                    const keyframes = KEYFRAME_NAME.get(className);
                    if (keyframes) {
                        const attrMap: AttributeMap = {};
                        const keyframeMap: AttributeMap = {};
                        for (const percent in keyframes) {
                            const ordinal = parseInt(percent) / 100;
                            for (const name in keyframes[percent]) {
                                const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                if (map[name] === undefined) {
                                    map[name] = [];
                                }
                                map[name].push({
                                    ordinal,
                                    value: keyframes[percent][name]
                                });
                            }
                        }
                        if (attrMap['transform']) {
                            function getKeyframeOrigin(ordinal: number) {
                                const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.ordinal === ordinal);
                                if (origin) {
                                    return getTransformOrigin(element, origin.value);
                                }
                                return undefined;
                            }
                            sortAttribute(attrMap['transform']).forEach(item => {
                                const transforms = getTransform(element, item.value);
                                if (transforms) {
                                    const origin = getKeyframeOrigin(item.ordinal);
                                    transforms.forEach(transform => {
                                        const m = transform.matrix;
                                        let name: string;
                                        let value: string;
                                        let transformOrigin: Point | undefined;
                                        switch (transform.type) {
                                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                name = 'translate';
                                                value = `${m.e} ${m.f}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                                name = 'scale';
                                                value = `${m.a} ${m.d}`;
                                                if (origin && (item.ordinal !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                    transformOrigin = {
                                                        x: origin.x * (1 - m.a),
                                                        y: origin.y * (1 - m.d)
                                                    };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                name = 'rotate';
                                                value = `${transform.angle} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                name = 'skewX';
                                                value = transform.angle.toString();
                                                if (origin && (item.ordinal !== 0 || origin.y !== 0)) {
                                                    transformOrigin = {
                                                        x: origin.y * m.c * -1,
                                                        y: 0
                                                    };
                                                }
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                name = 'skewY';
                                                value = transform.angle.toString();
                                                if (origin && (item.ordinal !== 0 || origin.x !== 0)) {
                                                    transformOrigin = {
                                                        x: 0,
                                                        y: origin.x * m.b * -1,
                                                    };
                                                }
                                                break;
                                            default:
                                                return;
                                        }
                                        if (attrMap[name] === undefined) {
                                            attrMap[name] = [];
                                        }
                                        const previousIndex = attrMap[name].findIndex(subitem => subitem.ordinal === item.ordinal);
                                        if (previousIndex !== -1) {
                                            attrMap[name][previousIndex].value = value;
                                            attrMap[name][previousIndex].transformOrigin = transformOrigin;
                                        }
                                        else {
                                            attrMap[name].push({
                                                ordinal: item.ordinal,
                                                value,
                                                transformOrigin
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        delete attrMap['transform'];
                        delete attrMap['transform-origin'];
                        for (const name in attrMap) {
                            const animation = attrMap[name];
                            sortAttribute(animation);
                            let animate: SvgAnimate;
                            switch (name) {
                                case 'rotate':
                                case 'scale':
                                case 'skewX':
                                case 'skewY':
                                case 'translate':
                                    const animateTransform = new SvgAnimateTransform();
                                    animateTransform.attributeName = 'transform';
                                    animateTransform.setType(name);
                                    animate = animateTransform;
                                    if (animation[0].ordinal !== 0) {
                                        animation.unshift({
                                            ordinal: 0,
                                            value: getTransformInitialValue(name)
                                        });
                                    }
                                    break;
                                default:
                                    animate = new SvgAnimate();
                                    animate.attributeName = name;
                                    if (animation[0].ordinal !== 0) {
                                        animation.unshift({
                                            ordinal: 0,
                                            value: $dom.cssAttribute(element, name)
                                        });
                                    }
                                    break;
                            }
                            animate.paused = cssData['animation-play-state'][index] === 'paused';
                            animate.delay = convertClockTime(cssData['animation-delay'][index]);
                            animate.duration = convertClockTime(cssData['animation-duration'][index]);
                            const iterationCount = cssData['animation-iteration-count'][index];
                            const timingFunction = cssData['animation-timing-function'][index];
                            const direction = cssData['animation-direction'][index];
                            const fillMode = cssData['animation-fill-mode'][index];
                            const keyTimes: number[] = [];
                            const values: string[] = [];
                            const keySplines: string[] = [];
                            for (let i = 0; i < animation.length; i++) {
                                keyTimes.push(animation[i].ordinal);
                                values.push(animation[i].value);
                                if (i < animation.length - 1) {
                                    const spline = keyframeMap['animation-timing-function'] ? keyframeMap['animation-timing-function'].find(item => item.ordinal === animation[i].ordinal) : undefined;
                                    keySplines.push(spline ? spline.value : timingFunction);
                                }
                                const transformOrigin = animation[i].transformOrigin;
                                if (transformOrigin && animate instanceof SvgAnimateTransform) {
                                    if (animate.transformOrigin === undefined) {
                                        animate.transformOrigin = [];
                                    }
                                    animate.transformOrigin[i] = transformOrigin;
                                }
                            }
                            if (!keySplines.every(spline => spline === 'linear')) {
                                const keyTimesData: number[] = [];
                                const valuesData: string[] = [];
                                const keySplinesData: string[] = [];
                                for (let i = 0; i < keySplines.length; i++) {
                                    if (KEYSPLINE_NAME[keySplines[i]]) {
                                        keySplines[i] = KEYSPLINE_NAME[keySplines[i]];
                                    }
                                    else if (keySplines[i].startsWith('steps')) {
                                        const steps = SvgAnimate.toStepFractionList(name, keySplines[i], i, keyTimes, values, getHostDPI(), getFontSize(element));
                                        if (steps) {
                                            keyTimesData.push(...steps[0]);
                                            valuesData.push(...steps[1]);
                                            steps[0].forEach(() => keySplinesData.push(KEYSPLINE_NAME.step));
                                            continue;
                                        }
                                        keySplines[i] = KEYSPLINE_NAME.linear;
                                    }
                                    else {
                                        const match = REGEXP_CUBICBEZIER.exec(keySplines[i]);
                                        keySplines[i] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                    }
                                    keyTimesData.push(keyTimes[i]);
                                    valuesData.push(values[i]);
                                    keySplinesData.push(keySplines[i]);
                                }
                                keyTimesData.push(keyTimes.pop() as number);
                                valuesData.push(values.pop() as string);
                                animate.keyTimes = keyTimesData;
                                animate.values = valuesData;
                                animate.keySplines = keySplinesData;
                            }
                            else {
                                animate.keyTimes = keyTimes;
                                animate.values = values;
                            }
                            animate.repeatCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                            if (fillMode === 'forwards' || fillMode === 'both') {
                                animate.fillMode |= FILL_MODE.FORWARDS;
                            }
                            if (fillMode === 'backwards' || fillMode === 'both') {
                                animate.fillMode |= FILL_MODE.BACKWARDS;
                            }
                            animate.reverse = direction.endsWith('reverse');
                            animate.alternate = (animate.repeatCount === -1 || animate.repeatCount > 1) && direction.startsWith('alternate');
                            result.push(animate);
                        }
                    }
                });
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                switch (item.tagName) {
                    case 'set':
                        result.push(new SvgAnimation(<SVGAnimationElement> item));
                        break;
                    case 'animate':
                        result.push(new SvgAnimate(<SVGAnimateElement> item));
                        break;
                    case 'animateTransform':
                        result.push(new SvgAnimateTransform(<SVGAnimateTransformElement> item));
                        break;
                    case 'animateMotion':
                        result.push(new SvgAnimateMotion(<SVGAnimateMotionElement> item));
                        break;
                }
            }
            result.forEach(item => item.parent = this);
            return result;
        }

        get name() {
            if (this._name === undefined) {
                this._name = SvgBuild.setName(this.element);
            }
            return this._name;
        }

        get transform() {
            if (this._transform === undefined) {
                this._transform = getTransform(this.element) || SvgBuild.convertTransformList(this.element.transform.baseVal);
            }
            return this._transform;
        }

        get animation() {
            if (this._animation === undefined) {
                this._animation = this.getAnimations(this.element);
            }
            return this._animation;
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