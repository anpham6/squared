import { SvgAnimationGroup } from './@types/object';

import { INSTANCE_TYPE } from './lib/constant';
import { TRANSFORM, convertClockTime } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public attributeName = '';
    public paused = false;
    public synchronizeState = 0;
    public element?: SVGAnimationElement;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;
    public baseFrom?: string;

    private _duration = -1;
    private _begin = 0;
    private _to = '';
    private _group?: SvgAnimationGroup;

    constructor(element?: SVGAnimationElement) {
        if (element) {
            this.element = element;
            this.setAttribute('attributeName');
            this.setAttribute('to');
            const dur = this.getAttribute('dur');
            if (dur !== '' && dur !== 'indefinite') {
                this.duration = convertClockTime(dur);
            }
            if (this.attributeName === 'transform') {
                this.baseFrom = TRANSFORM.valueAsInitial(this.getAttribute('type'));
            }
            else if (element.parentElement) {
                this.baseFrom = $util.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.valueAsString`) || $dom.cssInheritAttribute(element.parentElement, this.attributeName);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
        const value = this.getAttribute(attr);
        if (value !== '') {
            if (equality !== undefined) {
                this[attr + $util.capitalize(equality)] = value === equality;
            }
            else {
                this[attr] = value;
            }
        }
    }

    public getAttribute(attr: string) {
        const item = this.element && this.element.attributes.getNamedItem(attr);
        return item ? item.value.trim() : '';
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

    set begin(value) {
        this._begin = value;
    }
    get begin() {
        return this._begin;
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