import { SvgAnimationGroup } from './@types/object';

import { INSTANCE_TYPE } from './lib/constant';
import { TRANSFORM, convertClockTime } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public element: SVGAnimationElement | null = null;
    public attributeName = '';
    public paused = false;
    public synchronizeState = 0;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;
    public baseFrom?: string;

    private _duration = -1;
    private _delay = 0;
    private _to = '';
    private _group?: SvgAnimationGroup;

    constructor(element?: SVGAnimationElement) {
        if (element) {
            this.element = element;
            this.setAttribute('attributeName');
            this.setAttribute('to');
            const dur = $dom.getNamedItem(element, 'dur');
            if (dur !== '' && dur !== 'indefinite') {
                this.duration = convertClockTime(dur);
            }
            if (this.attributeName === 'transform') {
                this.baseFrom = TRANSFORM.typeAsValue($dom.getNamedItem(element, 'type'));
            }
            else if (element.parentElement) {
                this.baseFrom = $util.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.valueAsString`) || $dom.cssInheritAttribute(element.parentElement, this.attributeName);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
        const value = $dom.getNamedItem(this.element, attr);
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