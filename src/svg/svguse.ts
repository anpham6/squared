import SvgGroup from './svggroup';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgShape implements squared.svg.SvgUse {
    private _hrefPath?: SvgPath;
    private _hrefGroup?: SvgGroup;

    constructor(public readonly element: SVGUseElement) {
        super(element);
    }

    public setPath(value: SvgPath) {
        this._hrefPath = value;
        this._hrefGroup = undefined;
    }

    public build(exclusions?: number[]) {
        let d = '';
        if (this._hrefPath) {
            d = this._hrefPath.build(exclusions, false);
            const path = new SvgPath(this.element, d);
            super.path = path;
        }
        return d;
    }

    set group(value) {
        this._hrefGroup = value;
        super.path = undefined;
    }
    get group() {
        return this._hrefGroup;
    }

    set x(value) {
        this.element.x.baseVal.value = value;
    }
    get x() {
        return this.element.x.baseVal.value;
    }

    set y(value) {
        this.element.y.baseVal.value = value;
    }
    get y() {
        return this.element.y.baseVal.value;
    }
}