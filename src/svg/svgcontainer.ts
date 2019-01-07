import { SvgTransformExclusions } from './@types/object';

import { getHrefTargetElement, isSvgImage, isSvgShape } from './lib/util';

export default class SvgContainer extends squared.lib.base.Container<squared.svg.SvgViewable> implements squared.svg.SvgContainer {
    public static createUseTarget(element: SVGUseElement, parentElement?: SVGGraphicsElement | HTMLElement) {
        const target = getHrefTargetElement(element, parentElement);
        if (target) {
            if (target instanceof SVGSymbolElement) {
                return new squared.svg.SvgGroupRect(element, target);
            }
            else if (isSvgImage(target)) {
                return new squared.svg.SvgImage(element, target.href.baseVal);
            }
            else if (isSvgShape(target)) {
                return new squared.svg.SvgUse(element, target);
            }
        }
        return undefined;
    }

    public namespaceElement?: SVGSVGElement;

    constructor(public readonly element: SVGGElement | SVGSVGElement | SVGUseElement) {
        super();
    }

    public build(residual = false, exclusions?: SvgTransformExclusions) {
        this.clear();
        const element = this.element;
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            let svg: squared.svg.SvgViewable | undefined;
            if (item instanceof SVGGElement) {
                svg = new squared.svg.SvgGroupPaint(item);
            }
            else if (item instanceof SVGSVGElement) {
                svg = new squared.svg.SvgGroupRect(item);
            }
            else if (item instanceof SVGUseElement) {
                svg = SvgContainer.createUseTarget(item, this.namespaceElement);
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