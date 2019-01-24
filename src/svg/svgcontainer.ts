import { SvgAspectRatio, SvgPoint, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBuild from './svgbuild';

import { SVG, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgView = squared.svg.SvgView;

function getNearestViewBox(instance: SvgContainer) {
    let current = instance as any;
    while (current) {
        switch (current.element.tagName) {
            case 'svg':
            case 'symbol':
                return <Svg> current;
            default:
                current = current.parent;
        }
    }
    return undefined;
}

export default class SvgContainer extends squared.lib.base.Container<SvgView> implements squared.svg.SvgContainer {
    public aspectRatio: SvgAspectRatio = {
        x: 0,
        y: 0,
        unit: 1
    };

    constructor(public readonly element: SvgGroup) {
        super();
    }

    public append(item: SvgView) {
        item.parent = this;
        return super.append(item);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        this.clear();
        for (let i = 0; i < this.element.children.length; i++) {
            const item = this.element.children[i];
            let svg: SvgView | undefined;
            if (SVG.svg(item)) {
                svg = new squared.svg.Svg(item, false);
                this.setAspectRatio(<squared.svg.Svg> svg, item);
            }
            else if (SVG.g(item)) {
                svg = new squared.svg.SvgG(item);
                this.setAspectRatio(<squared.svg.SvgG> svg);
            }
            else if (SVG.use(item)) {
                const target = getTargetElement(item);
                if (target) {
                    if (SVG.symbol(target)) {
                        svg = new squared.svg.SvgUseSymbol(item, target);
                        this.setAspectRatio(<squared.svg.SvgUseSymbol> svg, target);
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

    public refitX(value: number) {
        return value * this.aspectRatio.unit + this.aspectRatio.x;
    }

    public refitY(value: number) {
        return value * this.aspectRatio.unit + this.aspectRatio.y;
    }

    public refitSize(value: number) {
        return value * this.aspectRatio.unit;
    }

    public refitPoints(values: SvgPoint[]) {
        const aspectRatio = this.aspectRatio;
        for (const pt of values) {
            pt.x = pt.x * aspectRatio.unit + aspectRatio.x;
            pt.y = pt.y * aspectRatio.unit + aspectRatio.y;
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= aspectRatio.unit;
                pt.ry *= aspectRatio.unit;
            }
        }
        return values;
    }

    public getPathAll() {
        const result: string[] = [];
        for (const item of this.cascade()) {
            if (SvgBuild.instanceOfShape(item) && item.path) {
                result.push(item.path.value);
            }
        }
        return result;
    }

    private setAspectRatio(svg: squared.svg.SvgGroup, element?: SVGSVGElement | SVGSymbolElement) {
        const parent = getNearestViewBox(this);
        if (parent) {
            const aspectRatio = svg.aspectRatio;
            if (element) {
                const viewBox = element.viewBox.baseVal;
                if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
                    const ratio = viewBox.width / viewBox.height;
                    const outerViewBox = parent.viewBox;
                    const outerRatio = outerViewBox.width / outerViewBox.height;
                    if (outerRatio > ratio) {
                        aspectRatio.x = (outerViewBox.width - (outerViewBox.height * viewBox.width / viewBox.height)) / 2;
                    }
                    else if (outerRatio < ratio) {
                        aspectRatio.y = (outerViewBox.height - (outerViewBox.width * viewBox.height / viewBox.width)) / 2;
                    }
                    aspectRatio.unit = Math.min(outerViewBox.width / viewBox.width, outerViewBox.height / viewBox.height);
                }
            }
            aspectRatio.x *= parent.aspectRatio.unit;
            aspectRatio.x += parent.aspectRatio.x;
            aspectRatio.y *= parent.aspectRatio.unit;
            aspectRatio.y += parent.aspectRatio.y;
            aspectRatio.unit *= parent.aspectRatio.unit;
        }
    }
}