import SvgGroup from './svggroup';
import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgShape implements squared.svg.SvgUse {
    public x: number;
    public y: number;

    private _hrefPath?: SvgPath;
    private _hrefGroup?: SvgGroup;

    constructor(public readonly element: SVGUseElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
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
}