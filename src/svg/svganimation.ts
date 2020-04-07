import type { SvgAnimationGroup } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

import { FILL_MODE, INSTANCE_TYPE } from './lib/constant';
import { getAttribute } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgView = squared.svg.SvgView;
type SvgPath = squared.svg.SvgPath;

const $lib = squared.lib;

const { getFontSize, isLength, parseUnit } = $lib.css;
const { getNamedItem } = $lib.dom;
const { capitalize, hasBit, isNumber, isString } = $lib.util;

const REGEX_MS = /-?\d+ms$/;
const REGEX_S = /-?\d+s$/;
const REGEX_MIN = /-?\d+min$/;
const REGEX_H = /-?\d+(.\d+)?h$/;
const REGEX_CLOCK = /^(?:(-?)(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/;

function setFillMode(this: SvgAnimation, mode: boolean, value: number) {
    const valid = hasBit(this.fillMode, value);
    if (mode) {
        if (!valid) {
            this.fillMode |= value;
        }
    }
    else if (valid) {
        this.fillMode ^= value;
    }
}

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public static convertClockTime(value: string) {
        let s = 0;
        let ms = 0;
        if (isNumber(value)) {
            s = parseInt(value);
        }
        else {
            if (REGEX_MS.test(value)) {
                ms = parseFloat(value);
            }
            else if (REGEX_S.test(value)) {
                s = parseFloat(value);
            }
            else if (REGEX_MIN.test(value)) {
                s = parseFloat(value) * 60;
            }
            else if (REGEX_H.test(value)) {
                s = parseFloat(value) * 60 * 60;
            }
            else {
                const match = REGEX_CLOCK.exec(value);
                if (match) {
                    const hr = match[2];
                    const mt = match[3];
                    const sec = match[4];
                    const mil = match[5];
                    if (hr) {
                        s += parseInt(hr) * 60 * 60;
                    }
                    if (mt) {
                        s += parseInt(mt) * 60;
                    }
                    if (sec) {
                        s += parseInt(sec);
                    }
                    if (mil) {
                        ms = parseInt(mil) * (mil.length < 3 ? Math.pow(10, 3 - mil.length) : 1);
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

    public element: Null<SVGGraphicsElement> = null;
    public baseValue = '';
    public fillMode = 0;
    public synchronizeState = 0;
    public paused = false;
    public replaceValue?: string;
    public id?: number;
    public companion?: NumberValue<SvgAnimation>;
    public readonly animationElement: Null<SVGAnimationElement> = null;

    private _attributeName = '';
    private _duration = -1;
    private _delay = 0;
    private _to = '';
    private _dataset: ObjectMap<ObjectMap<any>> = {};
    private _parent?: SvgView | SvgPath;
    private _group?: SvgAnimationGroup;

    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement) {
        if (element) {
            const dataset = element.dataset;
            for (const name in dataset) {
                const value = dataset[name];
                if (isString(value)) {
                    try {
                        this._dataset[name] = JSON.parse(value);
                    }
                    catch {
                    }
                }
            }
            this.element = element;
        }
        if (animationElement) {
            this.animationElement = animationElement;
            this.setAttribute('attributeName');
            this.setAttribute('to');
            this.setAttribute('fill', 'freeze');
            const dur = getNamedItem(animationElement, 'dur');
            if (dur !== '' && dur !== 'indefinite') {
                this.duration = SvgAnimation.convertClockTime(dur);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
        const animationElement = this.animationElement;
        if (animationElement) {
            const value = getNamedItem(animationElement, attr);
            if (value !== '') {
                if (isString(equality)) {
                    equality = equality.trim();
                    this[attr + capitalize(equality)] = value === equality;
                }
                else {
                    this[attr] = value;
                }
            }
        }
    }

    public addState(...values: number[]) {
        values.forEach(value => {
            if (!hasBit(this.synchronizeState, value)) {
                this.synchronizeState |= value;
            }
        });
    }

    public removeState(...values: number[]) {
        values.forEach(value => {
            if (hasBit(this.synchronizeState, value)) {
                this.synchronizeState ^= value;
            }
        });
    }

    public hasState(...values: number[]) {
        return values.some(value => hasBit(this.synchronizeState, value));
    }

    set attributeName(value) {
        if (value !== 'transform' && !isString(this.baseValue)) {
            let baseValue: Undef<string> = this._dataset.baseValue?.[value]?.toString().trim();
            if (baseValue) {
                this.baseValue = baseValue;
            }
            else {
                const element = this.element;
                if (element) {
                    switch (value) {
                        case 'opacity':
                        case 'stroke-opacity':
                        case 'fill-opacity':
                            baseValue = getAttribute(element, value) || '1';
                            break;
                        default:
                            baseValue = getAttribute(element, value);
                            break;
                    }
                    if (!isString(baseValue)) {
                        const animationElement = this.animationElement;
                        if (animationElement && getComputedStyle(element).animationPlayState === 'paused') {
                            const parentElement = animationElement.parentElement;
                            baseValue = parentElement?.[value]?.baseVal?.valueAsString;
                            if (baseValue && isLength(baseValue)) {
                                this.baseValue = parseUnit(baseValue, getFontSize(parentElement)).toString();
                            }
                        }
                    }
                    else {
                        this.baseValue = baseValue;
                    }
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
        setFillMode.bind(this, value, FILL_MODE.BACKWARDS)();
    }
    get fillBackwards() {
        return hasBit(this.fillMode, FILL_MODE.BACKWARDS);
    }

    set fillForwards(value) {
        setFillMode.bind(this, value, FILL_MODE.FORWARDS)();
    }
    get fillForwards() {
        return hasBit(this.fillMode, FILL_MODE.FORWARDS);
    }

    set fillFreeze(value) {
        setFillMode.bind(this, value, FILL_MODE.FREEZE)();
    }
    get fillFreeze() {
        return hasBit(this.fillMode, FILL_MODE.FREEZE);
    }

    get fillReplace() {
        const fillMode = this.fillMode;
        return fillMode === 0 || fillMode === FILL_MODE.BACKWARDS;
    }

    get parentContainer() {
        let result = <Undef<SvgContainer>> this._parent;
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

    get dataset() {
        return this._dataset;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATION;
    }
}