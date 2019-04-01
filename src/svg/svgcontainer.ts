import { SvgAspectRatio, SvgBuildOptions, SvgPoint, SvgSynchronizeOptions } from './@types/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getParentAttribute, getTargetElement, parseAttributeUrl } from './lib/util';

type Svg = squared.svg.Svg;
type SvgGroup = squared.svg.SvgGroup;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

const $util = squared.lib.util;

function getNearestViewBox(instance: SvgContainer | undefined) {
    while (instance) {
        if (instance.hasViewBox()) {
            return instance;
        }
        instance = instance.parent;
    }
    return undefined;
}

function getFillPattern(element: SVGGraphicsElement, viewport?: Svg): SVGPatternElement | undefined {
    const value = parseAttributeUrl(getParentAttribute(element, 'fill'));
    if (value !== '') {
        if (viewport && viewport.definitions.pattern.has(value)) {
            return viewport.definitions.pattern.get(value);
        }
        else {
            const target = document.getElementById(value.substring(1));
            if (target instanceof SVGPatternElement) {
                return target;
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
        let precision: number | undefined;
        let initPath = true;
        if (options) {
            options = { ...options };
            element = options.symbolElement || options.patternElement || options.element || this.element;
            precision = options.precision;
            if (options.initPath === false) {
                initPath = false;
            }
            options.symbolElement = undefined;
            options.patternElement = undefined;
            options.element = undefined;
        }
        else {
            element = this.element;
        }
        this.clear();
        const viewport = this.getViewport();
        let requireClip = false;
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            let svg: SvgView | undefined;
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
                            svg = new squared.svg.SvgUse(item, target, initPath);
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
                    svg = new squared.svg.SvgShape(item, initPath);
                }
            }
            if (svg) {
                this.append(svg, viewport);
                svg.build(options);
            }
        }
        if (SvgBuild.asSvg(this) && this.documentRoot) {
            if (this.aspectRatio.x < 0 || this.aspectRatio.y < 0) {
                this.clipViewBox(this.aspectRatio.x, this.aspectRatio.y, this.aspectRatio.width, this.aspectRatio.height, precision, true);
            }
        }
        else if (requireClip && this.hasViewBox() && (this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0)) {
            const boxRect = SvgBuild.parseBoxRect(this.getPathAll(false));
            const x = this.refitX(this.aspectRatio.x);
            const y = this.refitY(this.aspectRatio.y);
            if (boxRect.left < x || boxRect.top < y) {
                this.clipViewBox(boxRect.left, boxRect.top, this.refitSize(this.aspectRatio.width), this.refitSize(this.aspectRatio.height), precision);
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
        return (value - this.aspectRatio.x) * this.aspectRatio.unit - this.aspectRatio.parent.x + this.aspectRatio.position.x;
    }

    public refitY(value: number) {
        return (value - this.aspectRatio.y) * this.aspectRatio.unit - this.aspectRatio.parent.y + this.aspectRatio.position.y;
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

    public requireRefit() {
        return this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0 || this.aspectRatio.position.x !== 0 || this.aspectRatio.position.y !== 0 || this.aspectRatio.parent.x !== 0 || this.aspectRatio.parent.y !== 0 || this.aspectRatio.unit !== 1;
    }

    public getPathAll(cascade = true) {
        const result: string[] = [];
        for (const item of (cascade ? this.cascade() : this)) {
            if (SvgBuild.isShape(item) && item.path && item.path.value) {
                result.push(item.path.value);
            }
        }
        return result;
    }

    private getViewport(): Svg | undefined {
        return this.viewport || SvgBuild.asSvg(this) && this || undefined;
    }

    private setAspectRatio(group: SvgGroup, viewBox?: DOMRect) {
        const parent = getNearestViewBox(this);
        if (parent) {
            const aspectRatio = group.aspectRatio;
            if (viewBox) {
                $util.cloneObject(viewBox, aspectRatio);
                if (aspectRatio.width > 0 && aspectRatio.height > 0) {
                    const ratio = aspectRatio.width / aspectRatio.height;
                    const parentWidth = parent.aspectRatio.width || parent.viewBox.width;
                    const parentHeight = parent.aspectRatio.height || parent.viewBox.height;
                    const parentRatio = parentWidth / parentHeight;
                    if (parentRatio > ratio) {
                        aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                    }
                    else if (parentRatio < ratio) {
                        aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
                    }
                    aspectRatio.unit = Math.min(parentWidth / aspectRatio.width, parentHeight / aspectRatio.height);
                }
            }
            aspectRatio.parent.x = parent.aspectRatio.x + parent.aspectRatio.x * (parent.aspectRatio.unit - 1);
            aspectRatio.position.x *= parent.aspectRatio.unit;
            aspectRatio.position.x += parent.aspectRatio.position.x - parent.aspectRatio.parent.x;
            aspectRatio.parent.y = parent.aspectRatio.y + parent.aspectRatio.y * (parent.aspectRatio.unit - 1);
            aspectRatio.position.y *= parent.aspectRatio.unit;
            aspectRatio.position.y += parent.aspectRatio.position.y - parent.aspectRatio.parent.y;
            aspectRatio.unit *= parent.aspectRatio.unit;
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