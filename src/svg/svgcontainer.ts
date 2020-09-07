import type SvgUseSymbol from './svgusesymbol';

import SvgBuild from './svgbuild';

import { SVG, getAttribute, getDOMRect, getTargetElement } from './lib/util';

type Svg = squared.svg.Svg;
type SvgGroup = squared.svg.SvgGroup;
type SvgView = squared.svg.SvgView;

const { STRING } = squared.lib.regex;

const { cloneObject, iterateArray } = squared.lib.util;

const REGEXP_LENGTHPERCENTAGE = new RegExp(STRING.LENGTH_PERCENTAGE);

function setAspectRatio(parent: Undef<Svg | SvgUseSymbol>, group: SvgGroup, viewBox?: DOMRect, element?: SvgViewBoxElement) {
    if (parent) {
        const aspectRatio = group.aspectRatio;
        const parentAspectRatio = parent.aspectRatio;
        if (viewBox && element) {
            cloneObject((viewBox as unknown) as PlainObject, { target: aspectRatio });
            const { width, height } = aspectRatio;
            if (width > 0 && height > 0) {
                const ratio = width / height;
                let parentWidth = parentAspectRatio.width || parent.viewBox.width,
                    parentHeight = parentAspectRatio.height || parent.viewBox.height,
                    boxWidth = NaN,
                    boxHeight = NaN,
                    unknownViewBox: Undef<boolean>;
                if (parentWidth === 0 && parentHeight === 0) {
                    ({ width: parentWidth, height: parentHeight } = getDOMRect(parent.element));
                    parentAspectRatio.width = parentWidth;
                    parentAspectRatio.height = parentHeight;
                    unknownViewBox = true;
                }
                const parentRatio = parentWidth / parentHeight;
                const ratioWidth = parentWidth / width;
                const ratioHeight = parentHeight / height;
                const w = getAttribute(element, 'width');
                const h = getAttribute(element, 'height');
                if (unknownViewBox) {
                    boxWidth = parentWidth;
                    boxHeight = parentHeight;
                }
                else {
                    if (SVG.svg(element)) {
                        try {
                            boxWidth = element.width.baseVal.value;
                            boxHeight = element.height.baseVal.value;
                        }
                        catch {
                        }
                    }
                    if (!boxWidth && !boxHeight) {
                        boxWidth = parseFloat(w);
                        boxHeight = parseFloat(h);
                    }
                }
                const hasWidth = hasLength(w);
                const hasHeight = hasLength(h);
                const boxRatioWidth = boxWidth / width;
                const boxRatioHeight = boxHeight / height;
                let resizeUnit = hasWidth && hasHeight;
                if (boxWidth >= width && boxHeight >= height) {
                    aspectRatio.unit = Math.min(boxRatioWidth, boxRatioHeight);
                    resizeUnit = false;
                }
                else if (ratioWidth !== ratioHeight || unknownViewBox) {
                    aspectRatio.unit = Math.min(ratioWidth, ratioHeight);
                }
                if (hasWidth || hasHeight) {
                    if (boxWidth && boxHeight) {
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
                else if (parentRatio > ratio) {
                    aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                }
                else if (parentRatio < ratio) {
                    aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
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

function getViewport(container: SvgContainer): Undef<Svg> {
    do {
        if (SvgBuild.asSvg(container) && container.documentRoot) {
            return container;
        }
        container = container.parent as SvgContainer;
    }
    while (container);
}

function getNearestViewBox(container: SvgContainer): Undef<Svg | SvgUseSymbol> {
    do {
        if (container.hasViewBox()) {
            return container;
        }
        container = container.parent as SvgContainer;
    }
    while (container);
}

const hasLength = (value: string) => REGEXP_LENGTHPERCENTAGE.test(value);

export default class SvgContainer extends squared.lib.base.Container<SvgView> implements squared.svg.SvgContainer {
    public parent: Null<SvgContainer> = null;
    public viewport?: Svg;
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_CONTAINER;
    public readonly aspectRatio: SvgAspectRatio = {
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

    private _clipRegion: string[] = [];

    constructor(public readonly element: SvgContainerElement) {
        super();
    }

    public add(item: SvgView, viewport?: Svg) {
        item.parent = this;
        item.viewport = viewport || getViewport(this);
        return super.add(item);
    }

    public build(options?: SvgBuildOptions) {
        let initialize = true,
            element: SVGSVGElement | SvgUseElement,
            precision: Undef<number>;
        if (options) {
            element = options.targetElement || this.element;
            precision = options.precision;
            options = { ...options };
            if ('targetElement' in options) {
                delete options.targetElement;
            }
            if (options.initialize === false) {
                initialize = false;
            }
        }
        else {
            element = this.element;
        }
        const viewport = getViewport(this);
        let rootElement: Undef<SVGSVGElement>,
            contentMap: Null<StringMap> = null;
        if (viewport) {
            ({ element: rootElement, contentMap } = viewport);
            if (precision === undefined) {
                precision = viewport.precision;
            }
        }
        const parent = getNearestViewBox(this);
        const aspectRatio = this.aspectRatio;
        let requireClip: Undef<boolean>;
        this.clear();
        iterateArray(element.children, (item: SVGElement) => {
            let svg: Undef<SvgView>;
            if (SVG.svg(item)) {
                svg = new squared.svg.Svg(item, false);
                setAspectRatio(parent, svg as SvgGroup, item.viewBox.baseVal, item);
                requireClip = true;
            }
            else if (SVG.g(item)) {
                svg = new squared.svg.SvgG(item);
                setAspectRatio(parent, svg as SvgGroup);
            }
            else if (SVG.use(item)) {
                const target = getTargetElement(item, rootElement, contentMap);
                if (target) {
                    if (SVG.symbol(target)) {
                        svg = new squared.svg.SvgUseSymbol(target, item);
                        setAspectRatio(parent, svg as SvgGroup, target.viewBox.baseVal, target);
                        requireClip = true;
                    }
                    else if (SVG.g(target)) {
                        svg = new squared.svg.SvgUseG(target, item);
                        setAspectRatio(parent, svg as SvgGroup);
                    }
                    else if (SVG.image(target)) {
                        svg = new squared.svg.SvgImage(item, target);
                    }
                    else if (SVG.shape(target)) {
                        const pattern = viewport && viewport.findFill(item);
                        if (pattern) {
                            svg = new squared.svg.SvgUseShapePattern(target, item, pattern);
                            setAspectRatio(parent, svg as SvgGroup);
                        }
                        else {
                            svg = new squared.svg.SvgUseShape(target, item, initialize);
                        }
                    }
                }
            }
            else if (SVG.image(item)) {
                svg = new squared.svg.SvgImage(item);
            }
            else if (SVG.shape(item)) {
                const target = viewport && viewport.findFill(item);
                if (target) {
                    svg = new squared.svg.SvgShapePattern(item, target);
                    setAspectRatio(parent, svg as SvgGroup);
                }
                else {
                    svg = new squared.svg.SvgShape(item, initialize);
                }
            }
            if (svg) {
                this.add(svg, viewport);
                svg.build(options);
            }
        });
        if (SvgBuild.asSvg(this) && (this.documentRoot || aspectRatio.meetOrSlice)) {
            if (this.documentRoot) {
                if (aspectRatio.x < 0 || aspectRatio.y < 0) {
                    this.clipViewBox(aspectRatio.x, aspectRatio.y, aspectRatio.width, aspectRatio.height, precision, true);
                }
            }
            else {
                const { x, y } = this.parent!.aspectRatio;
                this.clipViewBox(x, y, this.width + x, this.height + y, precision, true);
            }
        }
        else if (requireClip && this.hasViewBox() && (aspectRatio.x !== 0 || aspectRatio.y !== 0)) {
            const { left, top } = SvgBuild.boxRectOf(this.getPathAll(false));
            const x = this.refitX(aspectRatio.x);
            const y = this.refitY(aspectRatio.y);
            if (left < x || top < y) {
                this.clipViewBox(left, top, this.refitSize(aspectRatio.width), this.refitSize(aspectRatio.height), precision);
            }
        }
    }

    public hasViewBox(): this is Svg | SvgUseSymbol {
        return SvgBuild.asSvg(this) && (!!this.element.viewBox.baseVal || this.documentRoot) || SvgBuild.asUseSymbol(this) && !!this.symbolElement.viewBox.baseVal;
    }

    public clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot?: boolean) {
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
        const unit = this.aspectRatio.unit;
        const length = values.length;
        for (let i = 0; i < length; ++i) {
            const pt = values[i];
            pt.x = this.refitX(pt.x);
            pt.y = this.refitY(pt.y);
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= unit;
                pt.ry *= unit;
            }
        }
        if (SvgBuild.asSvg(this) && this.aspectRatio.meetOrSlice) {
            const { align, alignX, alignY, parent } = this.aspectRatio;
            const { width, height } = this;
            const { top, right, bottom, left } = SvgBuild.minMaxOf(values, true);
            let x1 = 0,
                y1 = 0;
            if (alignX) {
                x1 = parent.x * -1;
            }
            if (alignY) {
                y1 = parent.y * -1;
            }
            let x = x1,
                y = y1;
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
            for (let i = 0; i < length; ++i) {
                const pt = values[i];
                pt.x += x;
                pt.y += y;
            }
        }
        return values;
    }

    public getPathAll(cascade = true) {
        const result: string[] = [];
        for (const item of cascade ? this.cascade() : this.children) {
            if (SvgBuild.isShape(item)) {
                const value = item.path?.value;
                if (value) {
                    result.push(value);
                }
            }
        }
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
}