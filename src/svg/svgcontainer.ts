import { SvgTransformExclusions } from './@types/object';

import { getHrefTargetElement, isSvgImage, isSvgShape } from './lib/util';

export default class SvgContainer extends squared.lib.base.Container<squared.svg.SvgViewable> implements squared.svg.SvgContainer {
    constructor(public readonly element: SVGGElement | SVGSVGElement | SVGUseElement) {
        super();
    }

    public build(residual = false, exclusions?: SvgTransformExclusions) {
        this.clear();
        for (let i = 0; i < this.element.children.length; i++) {
            const item = this.element.children[i];
            let svg: squared.svg.SvgViewable | undefined;
            if (item instanceof SVGSVGElement) {
                svg = new squared.svg.Svg(item, false);
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
                svg.build(residual, exclusions);
                this.append(svg);
            }
        }
    }

    public synchronize(useKeyTime = false) {
        this.each(item => item.synchronize(useKeyTime));
    }
}