import { SvgAnimationGroup } from './@types/object';

import { FILL_MODE, INSTANCE_TYPE } from './lib/constant';
import { convertClockTime, getFontSize } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public element: SVGGraphicsElement | null = null;
    public animationElement: SVGAnimationElement | null = null;
    public paused = false;
    public fillMode = 0;
    public synchronizeState = 0;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;
    public baseFrom?: string;
    public id?: number;

    private _attributeName = '';
    private _duration = -1;
    private _delay = 0;
    private _to = '';
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
                this.duration = convertClockTime(dur);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
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
        if (value !== 'transform') {
            const baseElement = this.animationElement && this.animationElement.parentElement || this.element;
            if (baseElement) {
                this.baseFrom = $util.optionalAsString(baseElement, `${value}.baseVal.valueAsString`) || $dom.cssInheritAttribute(baseElement, value);
                if ($util.isUnit(this.baseFrom)) {
                    this.baseFrom = parseFloat($util.convertPX(this.baseFrom, getFontSize(<SVGGraphicsElement> baseElement))).toString();
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