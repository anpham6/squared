import { SvgAspectRatio, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import { SVG, getHrefTargetElement, getParentViewBox } from './lib/util';

type Svg = squared.svg.Svg;
type SvgViewable = squared.svg.SvgViewable;

export default class SvgContainer extends squared.lib.base.Container<SvgViewable> implements squared.svg.SvgContainer {
    public aspectRatio: SvgAspectRatio = {
        x: 0,
        y: 0,
        unit: 1
    };

    constructor(public readonly element: SvgGroup) {
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
            if (SVG.svg(item)) {
                svg = new squared.svg.Svg(item, false);
                this.setAspectRatio(<Svg> svg);
            }
            else if (SVG.g(item)) {
                svg = new squared.svg.SvgG(item);
                this.setAspectRatio(<squared.svg.SvgG> svg);
            }
            else if (SVG.use(item)) {
                const target = getHrefTargetElement(item, item.parentElement);
                if (target) {
                    if (SVG.symbol(target)) {
                        svg = new squared.svg.SvgUseSymbol(item, target);
                        this.setAspectRatio(<squared.svg.SvgUseSymbol> svg);
                    }
                    else if (SVG.image(target)) {
                        svg = new squared.svg.SvgImage(item, target);
                    }
                    else if (SVG.shape(target)) {
                        svg = new squared.svg.SvgUse(item, target);
                    }
                }
            }
            else if (SVG.image(item)) {
                svg = new squared.svg.SvgImage(item);
            }
            else if (SVG.shape(item)) {
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

    private setAspectRatio(item: squared.svg.SvgGroup) {
        const svg = getParentViewBox(this.element);
        if (svg) {
            let current = <Svg> (this as unknown);
            while (current) {
                if (current.element === svg) {
                    break;
                }
                current = <Svg> current.parent;
            }
            if (current) {
                const aspectRatio = item.aspectRatio;
                if (!SVG.g(item.element)) {
                    const viewBox = (<Svg> item).viewBox;
                    if (viewBox.width > 0 && viewBox.height > 0) {
                        const viewBoxParent = svg.viewBox.baseVal;
                        const ratioParent = viewBoxParent.width / viewBoxParent.height;
                        const ratioCurrent = viewBox.width / viewBox.height;
                        if (ratioParent > ratioCurrent) {
                            aspectRatio.x = (viewBoxParent.width - (viewBoxParent.height * viewBox.width / viewBox.height)) / 2;
                        }
                        else if (ratioParent < ratioCurrent) {
                            aspectRatio.y = (viewBoxParent.height - (viewBoxParent.width * viewBox.height / viewBox.width)) / 2;
                        }
                        aspectRatio.unit = Math.min(viewBoxParent.width / viewBox.width, viewBoxParent.height / viewBox.height);
                    }
                }
                aspectRatio.x *= current.aspectRatio.unit;
                aspectRatio.x += current.aspectRatio.x;
                aspectRatio.y *= current.aspectRatio.unit;
                aspectRatio.y += current.aspectRatio.y;
                aspectRatio.unit *= current.aspectRatio.unit;
            }
        }
    }
}