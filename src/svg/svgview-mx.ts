import { SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { convertClockTime, getTransform, getTransformOrigin, isVisible, setOpacity, setVisible } from './lib/util';

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
                animationName.forEach((className, index) => {
                    const keyframes = KEYFRAME_NAME.get(className);
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
                                targetMap[name].push({ ordinal, value: keyframes[percent][name] });
                            }
                        }
                        if (attrMap['transform']) {
                            function getKeyframeOrigin(ordinal: number) {
                                if (attrMap['transform-origin']) {
                                    const origin = attrMap['transform-origin'].find(item => item.ordinal === ordinal);
                                    if (origin) {
                                        return getTransformOrigin(element, origin.value);
                                    }
                                }
                                return getTransformOrigin(element);
                            }
                            sortAttribute(attrMap['transform']).forEach(item => {
                                const transforms = getTransform(element, item.value);
                                if (transforms) {
                                    const origin = getKeyframeOrigin(item.ordinal);
                                    transforms.forEach(transform => {
                                        const m = transform.matrix;
                                        let name: string;
                                        let value: string;
                                        switch (transform.type) {
                                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                name = 'translate';
                                                value = `${m.e} ${m.f}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                                name = 'scale';
                                                value = `${m.a} ${m.d}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                name = 'rotate';
                                                value = `${transform.angle} ${origin.x} ${origin.y}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                name = 'skewX';
                                                value = transform.angle.toString();
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                name = 'skewY';
                                                value = transform.angle.toString();
                                                break;
                                            default:
                                                return;
                                        }
                                        if (attrMap[name] === undefined) {
                                            attrMap[name] = [];
                                        }
                                        const transformIndex = attrMap[name].findIndex(subitem => subitem.ordinal === item.ordinal);
                                        if (transformIndex !== -1) {
                                            attrMap[name][transformIndex].value = value;
                                        }
                                        else {
                                            attrMap[name].push({ ordinal: item.ordinal, value });
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
                                    break;
                                default:
                                    animate = new SvgAnimate();
                                    animate.attributeName = name;
                                    break;
                            }
                            if (animation[0].ordinal !== 0) {
                                animation.unshift({ ordinal: 0, value: '' });
                            }
                            animate.paused = animationMap['animation-play-state'][index] === 'paused';
                            const iterationCount = animationMap['animation-iteration-count'][index];
                            const timingFunction = animationMap['animation-timing-function'][index];
                            const direction = animationMap['animation-direction'][index];
                            const fillMode = animationMap['animation-fill-mode'][index];
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
                            }
                            animate.keySplines = keySplines;
                            animate.begin[0] = delay;
                            animate.duration = duration;
                            animate.fillFreeze = fillMode === 'forwards' || fillMode === 'both';
                            if (direction.endsWith('reverse')) {
                                animate.values.reverse();
                                animate.keySplines.reverse();
                            }
                            animate.alternate = direction.startsWith('alternate');
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