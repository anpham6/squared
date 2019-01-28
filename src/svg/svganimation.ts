import { INSTANCE_TYPE } from './lib/constant';
import { convertClockTime, getTransformInitialValue, sortNumber } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public attributeName = '';
    public to = '';
    public begin = [0];
    public duration = -1;
    public paused = false;
    public element?: SVGAnimationElement;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;
    public baseFrom?: string;

    constructor(element?: SVGAnimationElement) {
        if (element) {
            this.element = element;
            this.setAttribute('attributeName');
            this.setAttribute('to');
            const begin = this.getAttribute('begin');
            if (begin === 'indefinite') {
                this.begin.length = 0;
            }
            else if (/^[a-zA-Z]+$/.test(begin)) {
                this.paused = true;
            }
            else if (begin !== '') {
                this.begin = sortNumber(begin.split(';').map(value => convertClockTime(value)));
            }
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

    set delay(value) {
        this.begin[0] = value;
    }
    get delay() {
        return this.begin[0] || 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATION;
    }
}