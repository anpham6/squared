import { SvgAspectRatio, SvgPoint, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { REGEXP_SVG, SVG, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgGroup = squared.svg.SvgGroup;
type SvgView = squared.svg.SvgView;

const $dom = squared.lib.dom;
const $util = squared.lib.util;

function getNearestViewBox(instance: SvgContainer | undefined) {
    while (instance) {
        if ((SvgBuild.asSvg(instance) || SvgBuild.asUseSymbol(instance)) && (<SVGSVGElement> instance.element).viewBox.baseVal) {
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
        width: 0,
        height: 0,
        position: { x: 0, y: 0 },
        parent: { x: 0, y: 0 },
        unit: 1
    };
    public parent?: SvgContainer;
    public viewport?: Svg;

    private _clipRegion: string[] = [];

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
                this.setAspectRatio(<SvgGroup> svg, item.viewBox.baseVal);
            }
            else if (SVG.g(item)) {
                svg = new squared.svg.SvgG(item);
                this.setAspectRatio(<SvgGroup> svg);
            }
            else if (SVG.use(item)) {
                const target = getTargetElement(item);
                if (target) {
                    if (SVG.symbol(target)) {
                        svg = new squared.svg.SvgUseSymbol(item, target);
                        this.setAspectRatio(<SvgGroup> svg, target.viewBox.baseVal);
                    }
                    else if (SVG.image(target)) {
                        svg = new squared.svg.SvgImage(item, target);
                    }
                    else if (SVG.shape(target)) {
                        const pattern = getFillPattern(item, viewport);
                        if (pattern) {
                            svg = new squared.svg.SvgUsePattern(item, target, pattern);
                            this.setAspectRatio(<SvgGroup> svg);
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
                    this.setAspectRatio(<SvgGroup> svg);
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

    public clipViewBox(x: number, y: number, width: number, height: number) {
        if (x < 0 || y < 0) {
            this.clipRegion = SvgBuild.drawRect(width - x, height - y, x < 0 ? x * -1 : 0, y < 0 ? y * -1 : 0);
        }
    }

    public synchronize(useKeyTime = 0) {
        this.each(item => item.synchronize(useKeyTime));
    }

    public refitX(value: number) {
        return this.aspectRatio.unit * (value - this.aspectRatio.x) + this.aspectRatio.position.x - this.aspectRatio.parent.x;
    }

    public refitY(value: number) {
        return this.aspectRatio.unit * (value - this.aspectRatio.y) + this.aspectRatio.position.y - this.aspectRatio.parent.y;
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

    public getPathAll(cascade = true) {
        const result: string[] = [];
        for (const item of (cascade ? this.cascade() : this)) {
            if (SvgBuild.asShape(item) && item.path && item.path.value) {
                result.push(item.path.value);
            }
        }
        return result;
    }

    private getViewport(): Svg | undefined {
        return this.viewport || (SvgBuild.asSvg(this) ? this as any : undefined);
    }

    private setAspectRatio(group: SvgGroup, viewBox?: DOMRect) {
        const parent = getNearestViewBox(this);
        if (parent) {
            const aspectRatio = group.aspectRatio;
            if (viewBox) {
                $util.cloneObject(viewBox, aspectRatio);
                if (aspectRatio.width > 0 && aspectRatio.height > 0) {
                    const parentWidth = parent.aspectRatio.width || parent.viewBox.width;
                    const parentHeight = parent.aspectRatio.height || parent.viewBox.height;
                    const ratioA = aspectRatio.width / aspectRatio.height;
                    const ratioB = parentWidth / parentHeight;
                    if (ratioB > ratioA) {
                        aspectRatio.position.x = (parentWidth - (parentHeight * ratioA)) / 2;
                    }
                    else if (ratioB < ratioA) {
                        aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratioA))) / 2;
                    }
                    aspectRatio.unit = Math.min(parentWidth / aspectRatio.width, parentHeight / aspectRatio.height);
                }
            }
            aspectRatio.parent.x = parent.aspectRatio.x;
            aspectRatio.position.x *= parent.aspectRatio.unit;
            aspectRatio.position.x += parent.aspectRatio.position.x;
            aspectRatio.parent.y = parent.aspectRatio.y;
            aspectRatio.position.y *= parent.aspectRatio.unit;
            aspectRatio.position.y += parent.aspectRatio.position.y;
            aspectRatio.unit *= parent.aspectRatio.unit;
            if (aspectRatio.width > 0 && aspectRatio.height > 0) {
                group.clipViewBox(parent.refitSize(aspectRatio.x) + parent.aspectRatio.x, parent.refitSize(aspectRatio.y) + parent.aspectRatio.y, group.refitSize(aspectRatio.width), group.refitSize(aspectRatio.height));
            }
        }
    }

    set clipRegion(value) {
        if (value !== '') {
            this._clipRegion.push(value);
        }
        else {
            this._clipRegion.length = 0;
        }
    }
    get clipRegion() {
        return this._clipRegion.length ? this._clipRegion.join(';') : '';
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_CONTAINER;
    }
}