import { SvgAspectRatio, SvgBuildOptions, SvgPoint, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getAttribute, getParentAttribute, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgGroup = squared.svg.SvgGroup;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgView = squared.svg.SvgView;

const $lib = squared.lib;

const { STRING } = $lib.regex;
const { extractURL } = $lib.css;
const { cloneObject, iterateArray } = $lib.util;

const REGEX_LENGTHPERCENTAGE = new RegExp(STRING.LENGTH_PERCENTAGE);

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
    const value = extractURL(getParentAttribute(element, 'fill'));
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

function setAspectRatio(parent: Svg | SvgUseSymbol | undefined, group: SvgGroup, viewBox?: DOMRect, element?: SVGSVGElement | SVGSymbolElement) {
    if (parent) {
        const aspectRatio = group.aspectRatio;
        const parentAspectRatio = parent.aspectRatio;
        if (viewBox && element) {
            cloneObject(viewBox, aspectRatio);
            const { width, height } = aspectRatio;
            if (width > 0 && height > 0) {
                const ratio = width / height;
                const parentWidth = parentAspectRatio.width || parent.viewBox.width;
                const parentHeight = parentAspectRatio.height || parent.viewBox.height;
                const parentRatio = parentWidth / parentHeight;
                const ratioWidth = parentWidth / width;
                const ratioHeight = parentHeight / height;
                const w = getAttribute(element, 'width');
                const h = getAttribute(element, 'height');
                let boxWidth: number;
                let boxHeight: number;
                if (SVG.svg(element)) {
                    boxWidth = element.width.baseVal.value;
                    boxHeight = element.height.baseVal.value;
                }
                else {
                    boxWidth = parseFloat(w);
                    boxHeight = parseFloat(h);
                }
                const hasWidth = isLength(w);
                const hasHeight = isLength(h);
                const boxRatioWidth = boxWidth / width;
                const boxRatioHeight = boxHeight / height;
                let resizeUnit = hasWidth && hasHeight;
                if (boxWidth >= width && boxHeight >= height) {
                    aspectRatio.unit = Math.min(boxRatioWidth, boxRatioHeight);
                    resizeUnit = false;
                }
                else if (ratioWidth !== ratioHeight) {
                    aspectRatio.unit = Math.min(ratioWidth, ratioHeight);
                }
                if (hasWidth || hasHeight) {
                    if (!isNaN(boxWidth) && !isNaN(boxHeight)) {
                        const { align, meetOrSlice } = element.preserveAspectRatio.baseVal;
                        if (boxRatioWidth === boxRatioHeight) {
                            if (resizeUnit) {
                                aspectRatio.unit *= boxRatioWidth;
                            }
                            aspectRatio.align = SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN;
                            if (width > height) {
                                aspectRatio.alignX = true;
                            }
                            else {
                                aspectRatio.alignY = true;
                            }
                        }
                        else {
                            switch (meetOrSlice) {
                                case SVGPreserveAspectRatio.SVG_MEETORSLICE_MEET:
                                    if (boxRatioHeight < boxRatioWidth) {
                                        if (resizeUnit) {
                                            if (height >= width && height >= parentHeight) {
                                                aspectRatio.unit = boxRatioHeight;
                                            }
                                            else {
                                                aspectRatio.unit *= boxRatioHeight;
                                            }
                                        }
                                        aspectRatio.alignX = true;
                                    }
                                    else {
                                        if (resizeUnit) {
                                            if (width >= height && width >= parentWidth) {
                                                aspectRatio.unit = boxRatioWidth;
                                            }
                                            else {
                                                aspectRatio.unit *= boxRatioWidth;
                                            }
                                        }
                                        aspectRatio.alignY = true;
                                    }
                                    break;
                                case SVGPreserveAspectRatio.SVG_MEETORSLICE_SLICE:
                                    if (boxRatioHeight > boxRatioWidth) {
                                        if (resizeUnit) {
                                            if (height >= width && height >= parentHeight) {
                                                aspectRatio.unit = boxRatioHeight;
                                            }
                                            else {
                                                aspectRatio.unit *= boxRatioHeight;
                                            }
                                        }
                                        aspectRatio.alignX = true;
                                        aspectRatio.alignY = height > parentHeight;
                                    }
                                    else {
                                        if (resizeUnit) {
                                            if (width >= height && width >= parentWidth) {
                                                aspectRatio.unit = boxRatioWidth;
                                            }
                                            else {
                                                aspectRatio.unit *= boxRatioWidth;
                                            }
                                        }
                                        aspectRatio.alignX = width > parentWidth;
                                        aspectRatio.alignY = true;
                                    }
                                    break;
                            }
                            aspectRatio.align = align;
                        }
                        aspectRatio.meetOrSlice = meetOrSlice;
                    }
                }
                else {
                    if (parentRatio > ratio) {
                        aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                    }
                    else if (parentRatio < ratio) {
                        aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
                    }
                }
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

const getViewport = (container: SvgContainer): Undef<Svg> => container.viewport || SvgBuild.asSvg(container) && container || undefined;
const isLength = (value: string) => REGEX_LENGTHPERCENTAGE.test(value);

export default class SvgContainer extends squared.lib.base.Container<SvgView> implements squared.svg.SvgContainer {
    public aspectRatio: SvgAspectRatio = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        position: { x: 0, y: 0 },
        parent: { x: 0, y: 0 },
        unit: 1,
        meetOrSlice: SVGPreserveAspectRatio.SVG_MEETORSLICE_UNKNOWN,
        align: SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN,
        alignX: false,
        alignY: false
    };
    public parent?: SvgContainer;
    public viewport?: Svg;

    private _clipRegion: string[] = [];

    constructor(public readonly element: SVGSVGElement | SVGGElement | SVGUseElement) {
        super();
    }

    public append(item: SvgView, viewport?: Svg) {
        item.parent = this;
        item.viewport = viewport || getViewport(this);
        return super.append(item);
    }

    public build(options?: SvgBuildOptions) {
        let element: SVGGraphicsElement | SVGSymbolElement, precision: Undef<number>;
        if (options) {
            element = options.symbolElement || options.patternElement || options.element || this.element;
            precision = options.precision;
            options = { ...options, symbolElement: undefined, patternElement: undefined, element: undefined };
        }
        else {
            element = this.element;
        }
        const initialize = options?.initialize === false;
        const viewport = getViewport(this);
        const container = getNearestViewBox(this);
        const aspectRatio = this.aspectRatio;
        let requireClip = false;
        this.clear();
        iterateArray(element.children, (item: SVGElement) => {
            let svg: Undef<SvgView>;
            if (SVG.svg(item)) {
                svg = new squared.svg.Svg(item, false);
                setAspectRatio(container, <SvgGroup> svg, item.viewBox.baseVal, item);
                requireClip = true;
            }
            else if (SVG.g(item)) {
                svg = new squared.svg.SvgG(item);
                setAspectRatio(container, <SvgGroup> svg);
            }
            else if (SVG.use(item)) {
                const target = getTargetElement(item);
                if (target) {
                    if (SVG.symbol(target)) {
                        svg = new squared.svg.SvgUseSymbol(item, target);
                        setAspectRatio(container, <SvgGroup> svg, target.viewBox.baseVal, target);
                        requireClip = true;
                    }
                    else if (SVG.image(target)) {
                        svg = new squared.svg.SvgImage(item, target);
                    }
                    else if (SVG.shape(target)) {
                        const pattern = getFillPattern(item, viewport);
                        if (pattern) {
                            svg = new squared.svg.SvgUsePattern(item, target, pattern);
                            setAspectRatio(container, <SvgGroup> svg);
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
                    setAspectRatio(container, <SvgGroup> svg);
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
        if (SvgBuild.asSvg(this) && (this.documentRoot || aspectRatio.meetOrSlice)) {
            if (this.documentRoot) {
                const { x, y } = aspectRatio;
                if (x < 0 || y < 0) {
                    this.clipViewBox(x, y, aspectRatio.width, aspectRatio.height, precision, true);
                }
            }
            else {
                const { x, y } = (<SvgContainer> this.parent).aspectRatio;
                this.clipViewBox(x, y, this.width + x, this.height + y, precision, true);
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
            if (SvgBuild.asSvg(this) && this.documentRoot) {
                x = x < 0 ? x * -1 : 0;
                y = y < 0 ? y * -1 : 0;
            }
            else {
                x = x * -1;
                y = y * -1;
            }
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
        const { unit, meetOrSlice } = this.aspectRatio;
        const length = values.length;
        let i = 0;
        while (i < length) {
            const pt = values[i++];
            pt.x = this.refitX(pt.x);
            pt.y = this.refitY(pt.y);
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= unit;
                pt.ry *= unit;
            }
        }
        if (meetOrSlice && SvgBuild.asSvg(this)) {
            const { align, alignX, alignY, parent } = this.aspectRatio;
            const { width, height } = this;
            const [left, top, right, bottom] = SvgBuild.minMaxPoints(values, true);
            let x1 = 0, y1 = 0;
            if (alignX) {
                x1 = parent.x * -1;
            }
            if (alignY) {
                y1 = parent.y * -1;
            }
            let x = x1, y = y1;
            const xMid = () => (width / 2) - ((right + left) / 2);
            const xMax = () => (width - left) - right + x1;
            const yMid = () => (height / 2) - ((top + bottom) / 2);
            const yMax = () => (height - top) - bottom + y1;
            switch (align) {
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN:
                    if (alignX) {
                        x -= x1;
                    }
                    if (alignY) {
                        y -= y1;
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMID:
                    if (alignX) {
                        x -= x1;
                    }
                    if (alignY) {
                        y += yMid();
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMAX:
                    if (alignX) {
                        x -= x1;
                    }
                    if (alignY) {
                        y += yMax();
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMIN:
                    if (alignX) {
                        x += xMid();
                    }
                    if (alignY) {
                        y -= y1;
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE:
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMID:
                    if (alignX) {
                        x += xMid();
                    }
                    if (alignY) {
                        y += yMid();
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMIDYMAX:
                    if (alignX) {
                        x += xMid();
                    }
                    if (alignY) {
                        y += yMax();
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMIN:
                    if (alignX) {
                        x += xMax();
                    }
                    if (alignY) {
                        y -= y1;
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMID:
                    if (alignX) {
                        x += xMax();
                    }
                    if (alignY) {
                        y += yMid();
                    }
                    break;
                case SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMAXYMAX:
                    if (alignX) {
                        x += xMax();
                    }
                    if (alignY) {
                        y += yMax();
                    }
                    break;
            }
            i = 0;
            while (i < length) {
                const pt = values[i++];
                pt.x += x;
                pt.y += y;
            }
        }
        return values;
    }

    public getPathAll(cascade = true) {
        const result: string[] = [];
        (cascade ? this.cascade() : this.children).forEach(item => {
            if (SvgBuild.isShape(item)) {
                const value = item.path?.value;
                if (value) {
                    result.push(value);
                }
            }
        });
        return result;
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
        return this._clipRegion.join(';');
    }

    get requireRefit() {
        const aspectRatio = this.aspectRatio;
        return aspectRatio.x !== 0 || aspectRatio.y !== 0 || aspectRatio.unit !== 1 || aspectRatio.position.x !== 0 || aspectRatio.position.y !== 0 || aspectRatio.parent.x !== 0 || aspectRatio.parent.y !== 0;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_CONTAINER;
    }
}