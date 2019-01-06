import { SvgBaseValue, SvgLinearGradient, SvgRadialGradient, SvgRect, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgCreate from './svgcreate';
import SvgElement from './svgelement';
import SvgShape from './svgshape';
import SvgGroup from './svggroup';
import SvgGroupRect from './svggrouprect';
import SvgSymbol from './svgsymbol';
import SvgImage from './svgimage';
import SvgUse from './svguse';

import { getHrefTarget, getTransform, isSvgImage, isSvgShape, isSvgVisible } from './lib/util';

const $dom = squared.lib.dom;

function setChildren(group: SvgGroup | SvgSymbol) {
    for (const item of Array.from(group.element.children)) {
        if (isSvgShape(item)) {
            const shape = new SvgShape(item);
            if (shape.path) {
                group.append(shape);
            }
        }
        else if (isSvgImage(item)) {
            group.append(new SvgImage(item));
        }
    }
}

export default class Svg extends squared.lib.base.Container<SvgGroup> implements squared.svg.Svg {
    public name: string;
    public animate: SvgAnimation[];
    public visible: boolean;
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly defs = {
        symbol: new Map<string, SvgSymbol>(),
        clipPath: new Map<string, SvgGroup>(),
        gradient: new Map<string, Gradient>(),
    };

    private _width!: number;
    private _height!: number;
    private _viewBox!: SvgRect;
    private _opacity!: number;
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGSVGElement) {
        super();
        this.name = SvgCreate.setName(element);
        this.animate = SvgCreate.toAnimateList(element);
        this.visible = isSvgVisible(element);
        this.init();
    }

    public setDimensions(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    public setViewBox(value: SvgRect) {
        this._viewBox = value;
    }

    public setOpacity(value: string | number) {
        value = parseFloat(value.toString());
        this._opacity = !isNaN(value) && value < 1 ? value : 1;
    }

    private init() {
        const element = this.element;
        this.setViewBox(element.viewBox.baseVal);
        this.setOpacity($dom.cssAttribute(element, 'opacity'));
        this.setDimensions(element.width.baseVal.value, element.height.baseVal.value);
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            const bounds = element.getBoundingClientRect();
            if (bounds.width > this.width && bounds.height > this.height) {
                this.setDimensions(bounds.width, bounds.height);
            }
        }
        element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((svg: SVGAnimationElement) => {
            const href = svg.attributes.getNamedItem('href');
            if (href && href.value !== '') {
                const target = getHrefTarget(svg);
                if (svg.parentElement) {
                    svg.parentElement.removeChild(svg);
                }
                if (target) {
                    target.appendChild(svg);
                }
            }
        });
        element.querySelectorAll('symbol, clipPath, linearGradient, radialGradient').forEach((svg: SVGElement) => {
            if (svg.id) {
                const id = `#${svg.id}`;
                if (svg instanceof SVGSymbolElement) {
                    const symbol = new SvgSymbol(svg);
                    setChildren(symbol);
                    if (symbol.length) {
                        this.defs.symbol.set(id, symbol);
                    }
                }
                else if (svg instanceof SVGClipPathElement) {
                    const group = new SvgGroup(svg);
                    setChildren(group);
                    if (group.length) {
                        this.defs.clipPath.set(id, group);
                    }
                }
                else if (svg instanceof SVGLinearGradientElement) {
                    this.defs.gradient.set(id, <SvgLinearGradient> {
                        type: 'linear',
                        x1: svg.x1.baseVal.value,
                        x2: svg.x2.baseVal.value,
                        y1: svg.y1.baseVal.value,
                        y2: svg.y2.baseVal.value,
                        x1AsString: svg.x1.baseVal.valueAsString,
                        x2AsString: svg.x2.baseVal.valueAsString,
                        y1AsString: svg.y1.baseVal.valueAsString,
                        y2AsString: svg.y2.baseVal.valueAsString,
                        colorStop: SvgCreate.toColorStopList(svg)
                    });
                }
                else if (svg instanceof SVGRadialGradientElement) {
                    this.defs.gradient.set(id, <SvgRadialGradient> {
                        type: 'radial',
                        cx: svg.cx.baseVal.value,
                        cy: svg.cy.baseVal.value,
                        r: svg.r.baseVal.value,
                        cxAsString: svg.cx.baseVal.valueAsString,
                        cyAsString: svg.cy.baseVal.valueAsString,
                        rAsString: svg.r.baseVal.valueAsString,
                        fx: svg.fx.baseVal.value,
                        fy: svg.fy.baseVal.value,
                        fxAsString: svg.fx.baseVal.valueAsString,
                        fyAsString: svg.fy.baseVal.valueAsString,
                        colorStop: SvgCreate.toColorStopList(svg)
                    });
                }
            }
        });
        const useMap = new Map<string, SvgElement>();
        let currentGroup: SvgGroup | undefined;
        function groupAppend(group: SvgGroup, item: Element) {
            if (item instanceof SVGUseElement) {
                group.append(new SvgUse(item));
            }
            else {
                let shape: SvgElement | undefined;
                if (isSvgShape(item)) {
                    shape = new SvgShape(item);
                }
                else if (isSvgImage(item)) {
                    shape = new SvgImage(item);
                }
                if (shape) {
                    group.append(shape);
                    if (item.id) {
                        useMap.set(`#${item.id}`, shape);
                    }
                }
            }
        }
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            if (item instanceof SVGSVGElement) {
                currentGroup = new SvgGroupRect(item);
                this.append(currentGroup);
            }
            else if (item instanceof SVGGElement) {
                currentGroup = new SvgGroup(item);
                this.append(currentGroup);
            }
            else {
                if (currentGroup === undefined) {
                    currentGroup = new SvgGroup(element);
                    this.append(currentGroup);
                }
                groupAppend(currentGroup, item);
                continue;
            }
            for (let j = 0; j < item.children.length; j++) {
                groupAppend(currentGroup, item.children[j]);
            }
            currentGroup = undefined;
        }
        this.each(group => {
            for (let i = 0; i < group.children.length; i++) {
                const item = group.children[i];
                if (item instanceof SvgUse) {
                    const shape = useMap.get(item.element.href.baseVal);
                    if (shape) {
                        if (shape instanceof SvgShape) {
                            if (shape.path) {
                                item.setPath(shape.path);
                                continue;
                            }
                        }
                        else if (shape instanceof SvgImage) {
                            group.children[i] = new SvgImage(item.element, shape.href);
                            continue;
                        }
                    }
                    item.visible = false;
                }
            }
        });
        this.retain(this.filter(item => item.length > 0));
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }

    get viewBox() {
        return this._viewBox;
    }

    get opacity() {
        return this._opacity;
    }

    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgCreate.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }
}