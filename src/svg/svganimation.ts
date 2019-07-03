import { SvgAnimationGroup } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

import { FILL_MODE, INSTANCE_TYPE } from './lib/constant';
import { getAttribute } from './lib/util';

const {
    css: $css,
    dom: $dom,
    util: $util
} = squared.lib;

const CACHE_PATTERN = {
    MS: /-?\d+ms$/,
    S: /-?\d+s$/,
    MIN: /-?\d+min$/,
    H: /-?\d+(.\d+)?h$/,
    CLOCK: /^(?:(-?)(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/
};

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public static convertClockTime(value: string) {
        let s = 0;
        let ms = 0;
        if ($util.isNumber(value)) {
            s = parseInt(value);
        }
        else {
            if (CACHE_PATTERN.MS.test(value)) {
                ms = parseFloat(value);
            }
            else if (CACHE_PATTERN.S.test(value)) {
                s = parseFloat(value);
            }
            else if (CACHE_PATTERN.MIN.test(value)) {
                s = parseFloat(value) * 60;
            }
            else if (CACHE_PATTERN.H.test(value)) {
                s = parseFloat(value) * 60 * 60;
            }
            else {
                const match = CACHE_PATTERN.CLOCK.exec(value);
                if (match) {
                    if (match[2]) {
                        s += parseInt(match[2]) * 60 * 60;
                    }
                    if (match[3]) {
                        s += parseInt(match[3]) * 60;
                    }
                    if (match[4]) {
                        s += parseInt(match[4]);
                    }
                    if (match[5]) {
                        ms = parseInt(match[5]) * (match[5].length < 3 ? Math.pow(10, 3 - match[5].length) : 1);
                    }
                    if (match[1]) {
                        s *= -1;
                        ms *= -1;
                    }
                }
            }
        }
        return s * 1000 + ms;
    }

    public element: SVGGraphicsElement | null = null;
    public animationElement: SVGAnimationElement | null = null;
    public paused = false;
    public fillMode = 0;
    public synchronizeState = 0;
    public baseValue?: string;
    public replaceValue?: string;
    public id?: number;
    public companion?: NumberValue<SvgAnimation>;

    private _attributeName = '';
    private _duration = -1;
    private _delay = 0;
    private _to = '';
    private _parent?: squared.svg.SvgView | squared.svg.SvgPath;
    private _group?: SvgAnimationGroup;

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement) {
        if (element) {
            this.element = element;
        }
        if (animationElement) {
            this.animationElement = animationElement;
            this.setAttribute('attributeName');
            this.setAttribute('to');
            this.setAttribute('fill', 'freeze');
            const dur = $dom.getNamedItem(animationElement, 'dur');
            if (dur !== '' && dur !== 'indefinite') {
                this.duration = SvgAnimation.convertClockTime(dur);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
        if (this.animationElement) {
            const value = $dom.getNamedItem(this.animationElement, attr);
            if (value !== '') {
                if (equality !== undefined) {
                    this[attr + $util.capitalize(equality)] = value === equality;
                }
                else {
                    this[attr] = value;
                }
            }
        }
    }

    public addState(...values: number[]) {
        for (const value of values) {
            if (!$util.hasBit(this.synchronizeState, value)) {
                this.synchronizeState |= value;
            }
        }
    }

    public removeState(...values: number[]) {
        for (const value of values) {
            if ($util.hasBit(this.synchronizeState, value)) {
                this.synchronizeState ^= value;
            }
        }
    }

    public hasState(...values: number[]) {
        return values.some(value => $util.hasBit(this.synchronizeState, value));
    }

    private setFillMode(mode: boolean, value: number) {
        const hasBit = $util.hasBit(this.fillMode, value);
        if (mode) {
            if (!hasBit) {
                this.fillMode |= value;
            }
        }
        else {
            if (hasBit) {
                this.fillMode ^= value;
            }
        }
    }

    set attributeName(value) {
        if (!$util.isString(this.baseValue) && value !== 'transform') {
            if (this.element) {
                switch (value) {
                    case 'opacity':
                    case 'stroke-opacity':
                    case 'fill-opacity':
                        this.baseValue = getAttribute(this.element, value, false) || '1';
                        break;
                    default:
                        this.baseValue = getAttribute(this.element, value);
                        break;
                }
            }
            if (!$util.isString(this.baseValue) && this.animationElement) {
                this.baseValue = $util.optionalAsString(this.animationElement.parentElement, `${value}.baseVal.valueAsString`);
                if ($css.isLength(this.baseValue)) {
                    this.baseValue = $css.parseUnit(this.baseValue, $css.getFontSize(this.animationElement.parentElement)).toString();
                }
            }
        }
        this._attributeName = value;
    }
    get attributeName() {
        return this._attributeName;
    }

    set delay(value) {
        this._delay = value;
    }
    get delay() {
        return this._delay;
    }

    set duration(value) {
        this._duration = Math.round(value);
    }
    get duration() {
        return this._duration;
    }

    set to(value) {
        this._to = value;
    }
    get to() {
        return this._to;
    }

    set fillBackwards(value) {
        this.setFillMode(value, FILL_MODE.BACKWARDS);
    }
    get fillBackwards() {
        return $util.hasBit(this.fillMode, FILL_MODE.BACKWARDS);
    }

    set fillForwards(value) {
        this.setFillMode(value, FILL_MODE.FORWARDS);
    }
    get fillForwards() {
        return $util.hasBit(this.fillMode, FILL_MODE.FORWARDS);
    }

    set fillFreeze(value) {
        this.setFillMode(value, FILL_MODE.FREEZE);
    }
    get fillFreeze() {
        return $util.hasBit(this.fillMode, FILL_MODE.FREEZE);
    }

    get fillReplace() {
        return this.fillMode === 0 || this.fillMode === FILL_MODE.BACKWARDS;
    }

    get parentContainer() {
        let result = <squared.svg.SvgContainer | undefined> this._parent;
        while (result && !SvgBuild.isContainer(result)) {
            result = result.parent;
        }
        return result;
    }

    set parent(value) {
        this._parent = value;
    }
    get parent() {
        return this._parent;
    }

    set group(value) {
        this._group = value;
     }
    get group() {
        return this._group || { id: Number.NEGATIVE_INFINITY, name: '' };
    }

    set setterType(value) {}
    get setterType() {
        return true;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATION;
    }
}