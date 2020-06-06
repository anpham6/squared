import SvgBuild from './svgbuild';

import { FILL_MODE, INSTANCE_TYPE } from './lib/constant';
import { getAttribute } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgView = squared.svg.SvgView;
type SvgPath = squared.svg.SvgPath;

const { getFontSize, isLength, parseUnit } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { capitalize, hasBit, isString } = squared.lib.util;

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
        value = value.trim();
        if (value !== '') {
            let match = /^(-)?(\d+(?:\.\d+)?)(ms|s|min|h)?$/.exec(value);
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
                match = /^(-)?(?:(\d+):)?(?:([0-5][0-9]):)?([0-5][0-9])(?:\.(\d{1,3}))?$/.exec(value);
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
        }
        return NaN;
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
                const value = SvgAnimation.convertClockTime(dur);
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
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            if (!hasBit(this.synchronizeState, value)) {
                this.synchronizeState |= value;
            }
        }
    }

    public removeState(...values: number[]) {
        for (let i = 0; i < values.length; ++i) {
            const value = values[i];
            if (hasBit(this.synchronizeState, value)) {
                this.synchronizeState ^= value;
            }
        }
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
                    if (baseValue === '') {
                        const animationElement = this.animationElement;
                        if (animationElement && getComputedStyle(element).animationPlayState === 'paused') {
                            const parentElement = animationElement.parentElement;
                            baseValue = parentElement?.[value]?.baseVal?.valueAsString;
                            if (baseValue && isLength(baseValue)) {
                                this.baseValue = parseUnit(baseValue, getFontSize(parentElement!)).toString();
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
    get setterType() {
        return true;
    }

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
        let result = this._parent as Undef<SvgContainer>;
        while (result && !SvgBuild.isContainer(result)) {
            result = result.parent;
        }
        return result;
    }

    get dataset() {
        return this._dataset;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATION;
    }
}