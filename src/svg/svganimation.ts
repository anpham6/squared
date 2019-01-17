import { convertClockTime, sortNumber } from './lib/util';

const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public attributeName = '';
    public to = '';
    public begin = [0];
    public duration = -1;
    public paused = false;
    public element?: SVGAnimationElement;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;

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
            if (dur && dur !== 'indefinite') {
                this.duration = convertClockTime(dur);
            }
        }
    }

    public setAttribute(attr: string, equality?: string) {
        const value = this.getAttribute(attr);
        if (value) {
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

    get instanceType() {
        return 0;
    }
}