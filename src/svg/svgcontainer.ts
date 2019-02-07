import { SvgAspectRatio, SvgPoint, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { REGEXP_SVG, SVG, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgView = squared.svg.SvgView;

const $dom = squared.lib.dom;

function getNearestViewBox(instance: SvgContainer | undefined) {
    while (instance) {
        if (SvgBuild.asSvg(instance) || SvgBuild.asUseSymbol(instance)) {
            return instance;
        }
        instance = instance.parent;
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
        positionX: 0,
        positionY: 0,
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
                        const pattern = getFillPattern(item, viewport);
                        if (pattern) {
                            svg = new squared.svg.SvgUsePattern(item, target, pattern);
                            this.setAspectRatio(<squared.svg.SvgUsePattern> svg);
                        }
                        else {
                            svg = new squared.svg.SvgUse(item, target);
                        }
                    }
                }
            }
            else if (SVG.image(item)) {
                svg = new squared.svg.SvgImage(item);
            }
            else if (SVG.shape(item)) {
                const target = getFillPattern(item, viewport);
                if (target) {
                    svg = new squared.svg.SvgShapePattern(item, target);
                    this.setAspectRatio(<squared.svg.SvgShapePattern> svg);
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

    public synchronize(useKeyTime = 0) {
        this.each(item => item.synchronize(useKeyTime));
    }

    public refitX(value: number) {
        return (value - this.aspectRatio.x) * this.aspectRatio.unit + this.aspectRatio.positionX;
    }

    public refitY(value: number) {
        return (value - this.aspectRatio.y) * this.aspectRatio.unit + this.aspectRatio.positionY;
    }

    public refitSize(value: number) {
        return value * this.aspectRatio.unit;
    }

    public refitPoints(values: SvgPoint[]) {
        for (const pt of values) {
            pt.x = this.refitX(pt.x);
            pt.y = this.refitY(pt.y);
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= this.aspectRatio.unit;
                pt.ry *= this.aspectRatio.unit;
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

    private setAspectRatio(svg: squared.svg.SvgGroup, target?: SVGSVGElement | SVGSymbolElement) {
        const parent = getNearestViewBox(this);
        if (parent) {
            const aspectRatio = svg.aspectRatio;
            if (target) {
                const viewBox = target.viewBox.baseVal;
                if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
                    const widthA = viewBox.width;
                    const heightA = viewBox.height;
                    const widthB = parent.viewBox.width;
                    const heightB = parent.viewBox.height;
                    const ratio = widthA / heightA;
                    const nearestRatio = widthB / heightB;
                    aspectRatio.x = viewBox.x;
                    aspectRatio.y = viewBox.y;
                    if (nearestRatio > ratio) {
                        aspectRatio.positionX += (widthB - (heightB * widthA / heightA)) / 2;
                    }
                    else if (nearestRatio < ratio) {
                        aspectRatio.positionY += (widthB - (widthB * heightA / widthA)) / 2;
                    }
                    aspectRatio.unit = Math.min(widthB / widthA, heightB / heightA);
                }
            }
            aspectRatio.x += parent.aspectRatio.x * parent.aspectRatio.unit;
            aspectRatio.y += parent.aspectRatio.y * parent.aspectRatio.unit;
            aspectRatio.positionX *= parent.aspectRatio.unit;
            aspectRatio.positionX += parent.aspectRatio.positionX;
            aspectRatio.positionY *= parent.aspectRatio.unit;
            aspectRatio.positionY += parent.aspectRatio.positionY;
            aspectRatio.unit *= parent.aspectRatio.unit;
        }
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_CONTAINER;
    }
}