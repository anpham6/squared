import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import { getHrefTargetElement, isSvgImage, isSvgShape } from './lib/util';

type SvgViewable = squared.svg.SvgViewable;

export default class SvgContainer extends squared.lib.base.Container<SvgViewable> implements squared.svg.SvgContainer {
    constructor(public readonly element: SVGGElement | SVGSVGElement | SVGUseElement) {
        super();
    }

    public append(item: SvgViewable) {
        item.parent = this;
        return super.append(item);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        this.clear();
        for (let i = 0; i < this.element.children.length; i++) {
            const item = this.element.children[i];
            let svg: SvgViewable | undefined;
            if (item instanceof SVGSVGElement) {
                svg = new squared.svg.Svg(item);
            }
            else if (item instanceof SVGGElement) {
                svg = new squared.svg.SvgG(item);
            }
            else if (item instanceof SVGUseElement) {
                const target = getHrefTargetElement(item, item.parentElement);
                if (target) {
                    if (target instanceof SVGSymbolElement) {
                        svg = new squared.svg.SvgUseSymbol(item, target);
                    }
                    else if (isSvgImage(target)) {
                        svg = new squared.svg.SvgImage(item, target);
                    }
                    else if (isSvgShape(target)) {
                        svg = new squared.svg.SvgUse(item, target);
                    }
                }
            }
            else if (isSvgImage(item)) {
                svg = new squared.svg.SvgImage(item);
            }
            else if (isSvgShape(item)) {
                svg = new squared.svg.SvgShape(item);
            }
            if (svg) {
                this.append(svg);
                svg.build(exclusions, residual);
            }
        }
    }

    public synchronize(useKeyTime = false) {
        this.each(item => item.synchronize(useKeyTime));
    }
}