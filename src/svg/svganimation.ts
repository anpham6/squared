export default class SvgAnimation implements squared.svg.SvgAnimation {
    public static convertClockTime(value: string): [number, number] {
        let s = 0;
        let ms = 0;
        if (/\d+ms$/.test(value)) {
            ms = parseInt(value);
        }
        else if (/\d+s$/.test(value)) {
            s = parseInt(value);
        }
        else if (/\d+min$/.test(value)) {
            s = parseInt(value) * 60;
        }
        else if (/\d+(.\d+)?h$/.test(value)) {
            s = parseFloat(value) * 60 * 60;
        }
        else {
            const match = /^(?:(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/.exec(value);
            if (match) {
                if (match[1]) {
                    s += parseInt(match[1]) * 60 * 60;
                }
                if (match[2]) {
                    s += parseInt(match[2]) * 60;
                }
                if (match[3]) {
                    s += parseInt(match[3]);
                }
                if (match[4]) {
                    ms = parseInt(match[4]) * (match[4].length < 3 ? Math.pow(10, 3 - match[4].length) : 1);
                }
            }
        }
        return [s, ms];
    }

    public attributeName = '';
    public attributeType = '';
    public to = '';

    private _begin = 0;
    private _beginMS = 0;
    private _duration = 0;
    private _durationMS = 0;

    constructor(
        public element: SVGAnimationElement,
        public parentElement: SVGGraphicsElement)
    {
        this.init();
    }

    private init() {
        const element = this.element;
        const attributeName = element.attributes.getNamedItem('attributeName');
        if (attributeName) {
            this.attributeName = attributeName.value.trim();
        }
        const attributeType = element.attributes.getNamedItem('attributeType');
        if (attributeType) {
            this.attributeType = attributeType.value.trim();
        }
        const to = element.attributes.getNamedItem('to');
        if (to) {
            this.to = to.value.trim();
        }
        const begin = element.attributes.getNamedItem('begin');
        const dur = element.attributes.getNamedItem('dur');
        if (begin) {
            if (begin.value === 'indefinite') {
                this._begin = -1;
            }
            else {
                [this._begin, this._beginMS] = SvgAnimation.convertClockTime(begin.value);
            }
        }
        if (dur) {
            if (dur.value === 'indefinite') {
                this._duration = -1;
            }
            else {
                [this._duration, this._durationMS] = SvgAnimation.convertClockTime(dur.value);
            }
        }
    }

    get duration() {
        return this._duration !== -1 ? this._duration * 1000 + this._durationMS : this._duration;
    }

    get begin() {
        return this._begin !== -1 ? this._begin * 1000 + this._beginMS : this._begin;
    }
}