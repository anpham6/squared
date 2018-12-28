import SvgGroupViewBox from './svggroupviewbox';
import SvgPath from './svgpath';

export default class SvgUse extends SvgGroupViewBox implements squared.svg.SvgUse {
    public path: SvgPath | undefined;

    constructor(public readonly element: SVGUseElement) {
        super(element);
    }

    public setPath(value: SvgPath) {
        this.path = new SvgPath(this.element, value.d);
    }
}