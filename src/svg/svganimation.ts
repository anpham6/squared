import { INSTANCE_TYPE } from './lib/constant';
import { convertClockTime, getTransformInitialValue } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public attributeName = '';
    public to = '';
    public paused = false;
    public element?: SVGAnimationElement;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;
    public baseFrom?: string;

    private _duration = -1;
    private _begin = 0;

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
                this.baseFrom = getTransformInitialValue(this.getAttribute('type'));
            }
            else if (element.parentElement) {
                this.baseFrom = $util.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`) || $dom.cssInheritAttribute(element.parentElement, this.attributeName);
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

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATION;
    }
}