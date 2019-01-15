import { SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimation';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { convertClockTime, getTransform, isVisible, setOpacity, setVisible } from './lib/util';

type AttributeMap = ObjectMap<NumberValue<string>[]>;

const $dom = squared.lib.dom;
const $util = squared.lib.util;

const KEYFRAME_NAME = $dom.getKeyframeRules();
const KEYSPLINE_DATA = {
    'linear': '0.0 0.0 1.0 1.0',
    'ease': '0.25 0.1 0.25 1.0',
    'ease-in': '0.42 0.0 1.0 1.0',
    'ease-in-out': '0.42 0.0 0.58 1.0',
    'ease-out': '0.0 0.0 0.58 1.0'
};

function parseAttribute(element: SVGElement, attr: string, length = 0) {
    const values = $util.flatMap($dom.cssAttribute(element, attr).split(','), value => value.trim());
    if (length) {
        while (values.length < length) {
            values.push(...values.slice());
        }
        values.length = length;
    }
    return values;
}

export default <T extends Constructor<squared.svg.SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed: SvgTransform[] | null = null;
        public translationOffset?: Point;

        private _name?: string;
        private _animation?: SvgAnimation[];
        private _transform?: SvgTransform[];

        private getAnimations(element: SVGElement) {
            const result: squared.svg.SvgAnimation[] = [];
            const animationName = parseAttribute(element, 'animation-name');
            if (animationName.length) {
                const animationMap: ObjectMap<string[]> = {
                    'animation-delay': null,
                    'animation-duration': null,
                    'animation-iteration-count': null,
                    'animation-play-state': null,
                    'animation-direction': null,
                    'animation-fill-mode': null,
                    'animation-timing-function': null
                } as any;
                for (const name in animationMap) {
                    animationMap[name] = parseAttribute(element, name, animationName.length);
                }
                animationName.forEach((value, index) => {
                    const keyframes = KEYFRAME_NAME.get(value);
                    if (keyframes) {
                        const attrMap: AttributeMap = {};
                        const keyframeMap: AttributeMap = {};
                        for (const percent in keyframes) {
                            const ordinal = parseInt(percent) / 100;
                            for (const name in keyframes[percent]) {
                                const targetMap = animationMap[name] ? keyframeMap : attrMap;
                                if (targetMap[name] === undefined) {
                                    targetMap[name] = [];
                                }
                                targetMap[name].push({
                                    ordinal,
                                    value: keyframes[percent][name]
                                });
                            }
                        }
                        for (const name in attrMap) {
                            const animation = attrMap[name];
                            if (animation.length > 1) {
                                animation.sort((a, b) => a.ordinal >= b.ordinal ? 1 : -1);
                                const animate = new SvgAnimate();
                                animate.attributeName = name;
                                const paused = animationMap['animation-play-state'][index] === 'paused';
                                const iterationCount = animationMap['animation-iteration-count'][index];
                                const timingFunction = animationMap['animation-timing-function'][index];
                                let delay = convertClockTime(animationMap['animation-delay'][index]);
                                let duration = convertClockTime(animationMap['animation-duration'][index]);
                                const keySplines: string[] = [];
                                if (keyframeMap['animation-timing-function']) {
                                    for (let i = 0; i < animation.length - 1; i++) {
                                        const spline = keyframeMap[name].find(item => item.ordinal === animation[i].ordinal);
                                        if (spline) {
                                            keySplines.push(spline.value);
                                        }
                                        else {
                                            keySplines.push(timingFunction);
                                        }
                                    }
                                }
                                else {
                                    for (let i = 0; i < animation.length - 1; i++) {
                                        keySplines.push(timingFunction);
                                    }
                                }
                                if (animation.length === 2 && animation[0].ordinal === 0 && animation[1].ordinal === 1) {
                                    animate.from = animation[0].value;
                                    animate.to = animation[1].value;
                                }
                                else {
                                    animate.keyTimes = animation.map(item => item.ordinal);
                                    animate.values = animation.map(item => item.value);
                                }
                                if (iterationCount !== 'infinite') {
                                    animate.repeatCount = parseFloat(iterationCount);
                                }
                                if (keySplines.every(spline => spline === 'linear')) {
                                    animate.calcMode = 'linear';
                                }
                                else if (keySplines.length === 1 && (keySplines[0] === 'step-start' || keySplines[0] === 'steps(1, start)')) {
                                    animate.calcMode = 'discrete';
                                }
                                else if (keySplines.length === 1 && (keySplines[0] === 'step-end' || keySplines[0] === 'steps(1, end)')) {
                                    animate.calcMode = 'discrete';
                                    delay += duration - 1;
                                    duration = 1;
                                }
                                else {
                                    for (let i = 0; i < keySplines.length; i++) {
                                        if (KEYSPLINE_DATA[keySplines[i]]) {
                                            keySplines[i] = KEYSPLINE_DATA[keySplines[i]];
                                        }
                                        else {
                                            const match = /cubic-bezier\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/.exec(keySplines[i]);
                                            keySplines[i] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_DATA.ease;
                                        }
                                    }
                                    animate.calcMode = 'spline';
                                    animate.keySplines = keySplines;
                                }
                                if (paused) {
                                    animate.begin.length = 0;
                                }
                                else if (delay > 0) {
                                    animate.begin[0] = delay;
                                }
                                animate.duration = duration;
                                result.push(animate);
                            }
                        }
                    }
                });
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                switch (item.tagName) {
                    case 'animateTransform':
                        result.push(new SvgAnimateTransform(<SVGAnimateTransformElement> item));
                        break;
                    case 'animateMotion':
                        result.push(new SvgAnimateMotion(<SVGAnimateMotionElement> item));
                        break;
                    case 'animate':
                        result.push(new SvgAnimate(<SVGAnimateElement> item));
                        break;
                    case 'set':
                        result.push(new SvgAnimation(<SVGAnimationElement> item));
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