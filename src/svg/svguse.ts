import SvgPath from './svgpath';
import SvgShape from './svgshape';

export default class SvgUse extends SvgShape implements squared.svg.SvgUse {
    public x: number;
    public y: number;

    private _path: SvgPath | undefined;

    constructor(public readonly element: SVGUseElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
    }

    public setPath(value: SvgPath) {
        this._path = value;
    }

    public build(exclusions?: number[]) {
        let d = '';
        if (this._path) {
            d = this._path.build(exclusions, false);
            const path = new SvgPath(this.element, d);
            super.setPath(path);
        }
        return d;
    }
}