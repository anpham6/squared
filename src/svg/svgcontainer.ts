import { SvgAspectRatio, SvgBuildOptions, SvgPoint, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getAttributeURL, getParentAttribute, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgGroup = squared.svg.SvgGroup;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

const { cloneObject, iterateArray } = squared.lib.util;

function getNearestViewBox(instance: Undef<SvgContainer>) {
    while (instance) {
        if (instance.hasViewBox()) {
            return instance;
        }
        instance = instance.parent;
    }
    return undefined;
}

function getFillPattern(element: SVGGraphicsElement, viewport?: Svg): Undef<SVGPatternElement> {
    const value = getAttributeURL(getParentAttribute(element, 'fill'));
    if (value !== '') {
        if (viewport) {
            const pattern = viewport.definitions.pattern.get(value);
            if (pattern) {
                return pattern;
            }
        }
        const target = document.getElementById(value.substring(1));
        if (target instanceof SVGPatternElement) {
            return target;
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

    constructor(public readonly element: SVGSVGElement | SVGGElement | SVGUseElement) {
        super();
    }

    public append(item: SvgView, viewport?: Svg) {
        item.parent = this;
        item.viewport = viewport || this.getViewport();
        return super.append(item);
    }

    public build(options?: SvgBuildOptions) {
        let element: SVGGraphicsElement | SVGSymbolElement;
        let precision: Undef<number>;
        let initialize = true;
        if (options) {
            element = options.symbolElement || options.patternElement || options.element || this.element;
            precision = options.precision;
            options = { ...options, symbolElement: undefined, patternElement: undefined, element: undefined };
            if (options.initialize === false) {
                initialize = false;
            }
        }
        else {
            element = this.element;
        }
        this.clear();
        let requireClip = false;
        const viewport = this.getViewport();
        iterateArray(element.children, (item: SVGElement) => {
            let svg: Undef<SvgView>;
            if (SVG.svg(item)) {
                svg = new squared.svg.Svg(item, false);
                this.setAspectRatio(<SvgGroup> svg, item.viewBox.baseVal);
                requireClip = true;
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
                        requireClip = true;
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
                            svg = new squared.svg.SvgUse(item, target, initialize);
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
                    svg = new squared.svg.SvgShape(item, initialize);
                }
            }
            if (svg) {
                this.append(svg, viewport);
                svg.build(options);
            }
        });
        const aspectRatio = this.aspectRatio;
        if (SvgBuild.asSvg(this) && this.documentRoot) {
            if (aspectRatio.x < 0 || aspectRatio.y < 0) {
                this.clipViewBox(aspectRatio.x, aspectRatio.y, aspectRatio.width, aspectRatio.height, precision, true);
            }
        }
        else if (requireClip && this.hasViewBox() && (aspectRatio.x !== 0 || aspectRatio.y !== 0)) {
            const { left, top } = SvgBuild.getBoxRect(this.getPathAll(false));
            const x = this.refitX(aspectRatio.x);
            const y = this.refitY(aspectRatio.y);
            if (left < x || top < y) {
                this.clipViewBox(left, top, this.refitSize(aspectRatio.width), this.refitSize(aspectRatio.height), precision);
            }
        }
    }

    public hasViewBox(): this is Svg | SvgUseSymbol {
        return SvgBuild.asSvg(this) && !!this.element.viewBox.baseVal || SvgBuild.asUseSymbol(this) && !!this.symbolElement.viewBox.baseVal;
    }

    public clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot = false) {
        if (documentRoot) {
            width -= x;
            height -= y;
            x = x < 0 ? x * -1 : 0;
            y = y < 0 ? y * -1 : 0;
        }
        this.clipRegion = SvgBuild.drawRect(width, height, x, y, precision);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        this.each(item => item.synchronize(options));
    }

    public refitX(value: number) {
        const aspectRatio = this.aspectRatio;
        return (value - aspectRatio.x) * aspectRatio.unit - aspectRatio.parent.x + aspectRatio.position.x;
    }

    public refitY(value: number) {
        const aspectRatio = this.aspectRatio;
        return (value - aspectRatio.y) * aspectRatio.unit - aspectRatio.parent.y + aspectRatio.position.y;
    }

    public refitSize(value: number) {
        return value * this.aspectRatio.unit;
    }

    public refitPoints(values: SvgPoint[]) {
        const unit = this.aspectRatio.unit;
        for (const pt of values) {
            pt.x = this.refitX(pt.x);
            pt.y = this.refitY(pt.y);
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= unit;
                pt.ry *= unit;
            }
        }
        return values;
    }

    public getPathAll(cascade = true) {
        const result: string[] = [];
        for (const item of (cascade ? this.cascade() : this)) {
            if (SvgBuild.isShape(item)) {
                const value = item.path?.value;
                if (value) {
                    result.push(value);
                }
            }
        }
        return result;
    }

    private getViewport(): Undef<Svg> {
        return this.viewport || SvgBuild.asSvg(this) && this || undefined;
    }

    private setAspectRatio(group: SvgGroup, viewBox?: DOMRect) {
        const parent = getNearestViewBox(this);
        if (parent) {
            const aspectRatio = group.aspectRatio;
            const parentAspectRatio = parent.aspectRatio;
            if (viewBox) {
                cloneObject(viewBox, aspectRatio);
                const { width, height } = aspectRatio;
                if (width > 0 && height > 0) {
                    const ratio = width / height;
                    const parentWidth = parentAspectRatio.width || parent.viewBox.width;
                    const parentHeight = parentAspectRatio.height || parent.viewBox.height;
                    const parentRatio = parentWidth / parentHeight;
                    if (parentRatio > ratio) {
                        aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                    }
                    else if (parentRatio < ratio) {
                        aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
                    }
                    aspectRatio.unit = Math.min(parentWidth / width, parentHeight / height);
                }
            }
            const { parent: parentOffset, position, unit, x, y } = parentAspectRatio;
            aspectRatio.parent.x = x + x * (unit - 1);
            aspectRatio.position.x *= parentAspectRatio.unit;
            aspectRatio.position.x += position.x - parentOffset.x;
            aspectRatio.parent.y = y + y * (unit - 1);
            aspectRatio.position.y *= unit;
            aspectRatio.position.y += position.y - parentOffset.y;
            aspectRatio.unit *= unit;
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
        const clipRegion = this._clipRegion;
        return clipRegion.length ? clipRegion.join(';') : '';
    }

    get requireRefit() {
        const aspectRatio = this.aspectRatio;
        return aspectRatio.x !== 0 || aspectRatio.y !== 0 || aspectRatio.position.x !== 0 || aspectRatio.position.y !== 0 || aspectRatio.parent.x !== 0 || aspectRatio.parent.y !== 0 || aspectRatio.unit !== 1;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_CONTAINER;
    }
}