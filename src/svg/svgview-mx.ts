import { SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';

import { REGEX_UNIT, convertClockTime, getFontSize, getHostDPI, getTransform, getTransformOrigin, isVisible, setOpacity, setVisible } from './lib/util';

type AttributeMap = ObjectMap<NumberValue<string>[]>;

const $color = squared.lib.color;
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

function parseAttribute(element: SVGElement, attr: string) {
    if (attr === 'animation-timing-function') {
        const value = $dom.cssAttribute(element, attr);
        return value !== '' ? [value] : [];
    }
    else {
        return $util.flatMap($dom.cssAttribute(element, attr).split(','), value => value.trim());
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
            const result: squared.svg.SvgAnimation[] = [];
            const animationName = parseAttribute(element, 'animation-name');
            if (animationName.length) {
                const animationMap: ObjectMap<string[]> = {
                    'animation-delay': ['0s'],
                    'animation-duration': ['0s'],
                    'animation-iteration-count': ['1'],
                    'animation-play-state': ['running'],
                    'animation-direction': ['normal'],
                    'animation-fill-mode': ['none'],
                    'animation-timing-function': ['ease']
                };
                for (const name in animationMap) {
                    let values = parseAttribute(element, name);
                    if (values.length) {
                        animationMap[name] = values;
                    }
                    else {
                        values = animationMap[name];
                    }
                    while (values.length < animationName.length) {
                        values.push(...values.slice());
                    }
                    values.length = animationName.length;
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
                                        let name: string;
                                        let value: string;
                                        switch (transform.type) {
                                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                name = 'translate';
                                                value = `${transform.matrix.e} ${transform.matrix.f}`;
                                                break;
                                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                                name = 'scale';
                                                value = `${transform.matrix.a} ${transform.matrix.d}`;
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
                                        const previousIndex = attrMap[name].findIndex(subitem => subitem.ordinal === item.ordinal);
                                        if (previousIndex !== -1) {
                                            attrMap[name][previousIndex].value = value;
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
                                    if (animation[0].ordinal !== 0) {
                                        const transforms = getTransform(element);
                                        let initialValue = '';
                                        if (transforms) {
                                            const transform = transforms.reverse().find(item => item.type === animateTransform.type);
                                            if (transform) {
                                                switch (name) {
                                                    case 'rotate':
                                                        const origin = getTransformOrigin(element);
                                                        initialValue = `${transform.angle} ${origin.x} ${origin.y}`;
                                                        break;
                                                    case 'scale':
                                                        initialValue = `${transform.matrix.a} ${transform.matrix.d}`;
                                                        break;
                                                    case 'skewX':
                                                    case 'skewY':
                                                        initialValue = transform.angle.toString();
                                                        break;
                                                    case 'translate':
                                                        initialValue = `${transform.matrix.e} ${transform.matrix.f}`;
                                                        break;
                                                }
                                            }
                                        }
                                        if (initialValue === '') {
                                            switch (name) {
                                                case 'rotate':
                                                    initialValue = '0 0 0';
                                                    break;
                                                case 'scale':
                                                    initialValue = '1 1';
                                                    break;
                                                case 'skewX':
                                                case 'skewY':
                                                    initialValue = '0';
                                                    break;
                                                case 'translate':
                                                    initialValue = '0 0';
                                                    break;
                                            }
                                        }
                                        animation.unshift({ ordinal: 0, value: initialValue });
                                    }
                                    break;
                                default:
                                    animate = new SvgAnimate();
                                    animate.attributeName = name;
                                    if (animation[0].ordinal !== 0) {
                                        animation.unshift({ ordinal: 0, value: $dom.cssAttribute(element, name) });
                                    }
                                    break;
                            }
                            animate.paused = animationMap['animation-play-state'][index] === 'paused';
                            const iterationCount = animationMap['animation-iteration-count'][index];
                            const timingFunction = animationMap['animation-timing-function'][index];
                            const direction = animationMap['animation-direction'][index];
                            const fillMode = animationMap['animation-fill-mode'][index];
                            const delay = convertClockTime(animationMap['animation-delay'][index]);
                            const duration = convertClockTime(animationMap['animation-duration'][index]);
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
                            const keyTimes = animation.map(item => item.ordinal);
                            const values = animation.map(item => item.value);
                            if (!keySplines.every(spline => spline === 'linear')) {
                                const keyTimesData: number[] = [];
                                const valuesData: string[] = [];
                                const keySplinesData: string[] = [];
                                for (let i = 0; i < keySplines.length; i++) {
                                    let modified = false;
                                    if (keySplines[i].startsWith('steps')) {
                                        let currentValue: any[] | undefined;
                                        let nextValue: any[] | undefined;
                                        switch (name) {
                                            case 'fill':
                                            case 'stroke':
                                                const colorStart = $color.parseRGBA(values[i]);
                                                const colorEnd = $color.parseRGBA(values[i + 1]);
                                                if (colorStart && colorEnd) {
                                                    currentValue = [colorStart];
                                                    nextValue = [colorEnd];
                                                }
                                                break;
                                            case 'points':
                                                currentValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[i]));
                                                nextValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[i + 1]));
                                                break;
                                            case 'rotate':
                                            case 'scale':
                                            case 'translate':
                                                currentValue = values[i].split(' ').map(value => parseFloat(value));
                                                nextValue = values[i + 1].split(' ').map(value => parseFloat(value));
                                                break;
                                            default:
                                                if ($util.isNumber(values[i])) {
                                                    currentValue = [parseFloat(values[i])];
                                                }
                                                else if ($util.isUnit(values[i])) {
                                                    currentValue = [parseFloat($util.convertPX(values[i], getHostDPI(), getFontSize(element)))];
                                                }
                                                if ($util.isNumber(values[i + 1])) {
                                                    nextValue = [parseFloat(values[i + 1])];
                                                }
                                                else if ($util.isUnit(values[i + 1])) {
                                                    currentValue = [parseFloat($util.convertPX(values[i + 1], getHostDPI(), getFontSize(element)))];
                                                }
                                                break;
                                        }
                                        if (currentValue && nextValue && currentValue.length > 0 && currentValue.length === nextValue.length) {
                                            switch (keySplines[i])  {
                                                case 'steps-start':
                                                    keySplines[i] = 'steps(1, start)';
                                                    break;
                                                case 'steps-end':
                                                    keySplines[i] = 'steps(1, end)';
                                                    break;
                                            }
                                            const match = /steps\((\d+)(?:, (start|end))?\)/.exec(keySplines[i]);
                                            if (match) {
                                                modified = true;
                                                const keyTimeTotal = keyTimes[i + 1] - keyTimes[i];
                                                const step = parseInt(match[1]);
                                                const interval = 100 / step;
                                                const splitTimes: number[] = [];
                                                const splitValues: string[] = [];
                                                for (let j = 0, k = match[2] === 'start' ? 1 : 0; j < step; j++) {
                                                    const percent = (k > 0 && j === step - 1 ? 100 : interval * (j + k)) / 100;
                                                    const time = keyTimes[i] + keyTimeTotal * (j / step);
                                                    const value: string[] = [];
                                                    switch (name) {
                                                        case 'fill':
                                                        case 'stroke': {
                                                            const current = <ColorData> currentValue[0];
                                                            const next = <ColorData> nextValue[0];
                                                            const r = $color.convertHex(current.rgba.r + (next.rgba.r - current.rgba.r) * percent);
                                                            const g = $color.convertHex(current.rgba.g + (next.rgba.g - current.rgba.g) * percent);
                                                            const b = $color.convertHex(current.rgba.b + (next.rgba.b - current.rgba.b) * percent);
                                                            const a = $color.convertHex(current.rgba.a + (next.rgba.a - current.rgba.a) * percent);
                                                            value.push(`#${r + g + b + (a !== 'FF' ? a : '')}`);
                                                            break;
                                                        }
                                                        case 'points': {
                                                            for (let l = 0; l < currentValue.length; l++) {
                                                                const current = <Point> currentValue[l];
                                                                const next = <Point> nextValue[l];
                                                                const x = current.x + (next.x - current.x) * percent;
                                                                const y = current.y + (next.y - current.y) * percent;
                                                                value.push(`${x},${y}`);
                                                            }
                                                            break;
                                                        }
                                                        default: {
                                                            for (let l = 0; l < currentValue.length; l++) {
                                                                const current = currentValue[l] as number;
                                                                const next = nextValue[l] as number;
                                                                value.push((current + (next - current) * percent).toString());
                                                            }
                                                            break;
                                                        }
                                                    }
                                                    if (value.length) {
                                                        splitTimes.push(time);
                                                        splitValues.push(value.join(' '));
                                                    }
                                                    else {
                                                        modified = false;
                                                        break;
                                                    }
                                                }
                                                if (modified) {
                                                    keyTimesData.push(...splitTimes);
                                                    valuesData.push(...splitValues);
                                                    splitTimes.forEach(() => keySplinesData.push('linear'));
                                                }
                                            }
                                        }
                                    }
                                    else if (KEYSPLINE_DATA[keySplines[i]]) {
                                        keySplines[i] = KEYSPLINE_DATA[keySplines[i]];
                                    }
                                    else {
                                        const match = new RegExp(`cubic-bezier\\(${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}\\)`).exec(keySplines[i]);
                                        keySplines[i] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : 'linear';
                                    }
                                    if (!modified) {
                                        keyTimesData.push(keyTimes[i]);
                                        valuesData.push(values[i]);
                                        keySplinesData.push(keySplines[i]);
                                    }
                                }
                                keyTimesData.push(keyTimes[keyTimes.length - 1]);
                                valuesData.push(values[values.length - 1]);
                                animate.keyTimes = keyTimesData;
                                animate.values = valuesData;
                                animate.keySplines = keySplinesData;
                            }
                            else {
                                animate.keyTimes = keyTimes;
                                animate.values = values;
                            }
                            animate.begin[0] = delay;
                            animate.duration = duration;
                            if (iterationCount !== 'infinite') {
                                animate.repeatCount = parseFloat(iterationCount);
                                animate.fillFreeze = fillMode === 'forwards' || fillMode === 'both';
                            }
                            else {
                                animate.repeatCount = -1;
                            }
                            if (direction.endsWith('reverse')) {
                                animate.values.reverse();
                                if (animate.keySplines) {
                                    animate.keySplines.reverse();
                                }
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