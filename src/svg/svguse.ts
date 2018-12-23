import SvgGroupViewBox from './svggroupviewbox';
import SvgPath from './svgpath';

export default class SvgUse extends SvgGroupViewBox implements squared.svg.SvgUse {
    public path: SvgPath | undefined;

    constructor(
        public readonly element: SVGUseElement,
        d?: string)
    {
        super(element);
        if (d) {
            this.setPath(d);
        }
    }

    public setPath(value: string) {
        this.path = new SvgPath(this.element, value);
    }
}