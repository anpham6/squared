import { SvgAspectRatio, SvgPoint, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { REGEXP_SVG, SVG, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgView = squared.svg.SvgView;

const $dom = squared.lib.dom;

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

function getFillPattern(element: SVGGraphicsElement, viewport?: Svg) {
    if (viewport) {
        const value = $dom.cssInheritAttribute(element, 'fill');
        if (value !== '') {
            const match = REGEXP_SVG.URL.exec(value);
            if (match) {
                return viewport.definitions.pattern.get(match[1]);
            }
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
    public parent?: SvgContainer;
    public viewport?: Svg;

    constructor(public readonly element: SVGContainerElement) {
        super();
    }

    public append(item: SvgView, viewport?: Svg) {
        item.parent = this;
        item.viewport = viewport || this.getViewport();
        return super.append(item);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual, element?: Element) {
        if (element === undefined) {
            element = this.element;
        }
        this.clear();
        const viewport = this.getViewport();
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
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
                const target = getFillPattern(item, viewport);
                if (target) {
                    svg = new squared.svg.SvgPatternShape(item, target);
                }
                else {
                    svg = new squared.svg.SvgShape(item);
                }
            }
            if (svg) {
                this.append(svg, viewport);
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
            if (SvgBuild.asShape(item) && item.path && item.path.value) {
                result.push(item.path.value);
            }
        }
        return result;
    }

    private getViewport(): Svg | undefined {
        return this.viewport || (SvgBuild.asSvg(this) ? this as any : undefined);
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

    get instanceType() {
        return INSTANCE_TYPE.SVG_CONTAINER;
    }
}