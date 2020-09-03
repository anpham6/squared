import FILL_MODE = squared.svg.lib.enumeration.FILL_MODE;

import type SvgPath from './svgpath';

import SvgBuild from './svgbuild';

import { getAttribute } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgView = squared.svg.SvgView;

const { getFontSize, hasEm, isLength, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { capitalize, hasBit, isString } = squared.lib.util;

const REGEXP_TIME = /^(-)?(\d+(?:\.\d+)?)(ms|s|min|h)?$/;
const REGGXP_TIMEDELIMITED = /^(-)?(?:(\d+):)?(?:([0-5][0-9]):)?([0-5][0-9])(?:\.(\d{1,3}))?$/;

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
    public static parseClockTime(value: string) {
        value = value.trim();
        let match = REGEXP_TIME.exec(value);
        if (match) {
            let time = parseFloat(match[2]) * (match[1] ? -1 : 1);
            switch (match[3]) {
                case 'ms':
                    break;
                case 'h':
                    time *= 60;
                case 'min':
                    time *= 60;
                default:
                    time *= 1000;
                    break;
            }
            return Math.round(time);
        }
        else {
            match = REGGXP_TIMEDELIMITED.exec(value);
            if (match) {
                const ms = match[5];
                let time = parseInt(match[4]) * (match[1] ? -1 : 1);
                if (match[1]) {
                    time += parseInt(match[2]) * 60 * 60;
                }
                if (match[2]) {
                    time += parseInt(match[3]) * 60;
                }
                return time * 1000 + (ms ? parseInt(ms) * (ms.length < 3 ? Math.pow(10, 3 - ms.length) : 1) : 0);
            }
        }
        return NaN;
    }

    public element: Null<SVGGraphicsElement> = null;
    public fillMode = 0;
    public synchronizeState = 0;
    public paused = false;
    public replaceValue?: string;
    public id?: number;
    public baseValue?: string;
    public companion?: NumberValue<SvgAnimation>;
    public readonly animationElement: Null<SVGAnimationElement> = null;
    public readonly instanceType = squared.svg.lib.enumeration.INSTANCE_TYPE.SVG_ANIMATION;

    protected _to = '';
    protected _duration = -1;
    protected _delay = 0;
    protected _parent: Null<SvgView | SvgPath> = null;

    private _attributeName = '';
    private _dataset: SvgDataSet = {};
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
                const value = SvgAnimation.parseClockTime(dur);
                this.duration = !isNaN(value) && value > 0 ? value : 0;
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
        for (const value of values) {
            if (!hasBit(this.synchronizeState, value)) {
                this.synchronizeState |= value;
            }
        }
    }

    public removeState(...values: number[]) {
        for (const value of values) {
            this.synchronizeState &= ~value;
        }
    }

    public hasState(...values: number[]) {
        return values.some(value => hasBit(this.synchronizeState, value));
    }

    set attributeName(value) {
        if (value !== 'transform' && !this.baseValue) {
            let baseValue = this._dataset.baseValue?.[value];
            if (baseValue !== undefined) {
                this.baseValue = baseValue.toString().trim();
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
                    if (baseValue === '') {
                        const animationElement = this.animationElement;
                        if (animationElement && getComputedStyle(element).animationPlayState === 'paused') {
                            const parentElement = animationElement.parentElement;
                            if (parentElement) {
                                const valueAsString: Undef<string> = parentElement[value]?.baseVal?.valueAsString;
                                if (valueAsString && isLength(valueAsString)) {
                                    this.baseValue = parseUnit(valueAsString, hasEm(valueAsString) ? { fontSize: getFontSize(parentElement) } : undefined).toString();
                                }
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
        setFillMode.call(this, value, FILL_MODE.BACKWARDS);
    }
    get fillBackwards() {
        return hasBit(this.fillMode, FILL_MODE.BACKWARDS);
    }

    set fillForwards(value) {
        setFillMode.call(this, value, FILL_MODE.FORWARDS);
    }
    get fillForwards() {
        return hasBit(this.fillMode, FILL_MODE.FORWARDS);
    }

    set fillFreeze(value) {
        setFillMode.call(this, value, FILL_MODE.FREEZE);
    }
    get fillFreeze() {
        return hasBit(this.fillMode, FILL_MODE.FREEZE);
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
        return this._group || { id: -Infinity, name: '' };
    }

    set setterType(value) {}
    get setterType() { return true; }

    get fillReplace() {
        switch (this.fillMode) {
            case 0:
            case FILL_MODE.BACKWARDS:
                return true;
            default:
                return false;
        }
    }

    get parentContainer() {
        let result = this._parent as Null<SvgContainer>;
        while (result && !SvgBuild.isContainer(result)) {
            result = result.parent;
        }
        return result;
    }

    get dataset() {
        return this._dataset;
    }
}