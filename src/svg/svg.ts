import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getParentAttribute, getTargetElement } from './lib/util';

const { parseColor } = squared.lib.color;
const { extractURL } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { cloneObject } = squared.lib.util;

function getColorStop(element: SVGGradientElement) {
    const result: ColorStop[] = [];
    const stops = element.getElementsByTagName('stop');
    const length = stops.length;
    let i = 0;
    while (i < length) {
        const item = stops[i++];
        const color = parseColor(getNamedItem(item, 'stop-color'), parseFloat(getNamedItem(item, 'stop-opacity') || '1'));
        if (color) {
            result.push({ color, offset: parseFloat(getNamedItem(item, 'offset')) / 100 });
        }
    }
    return result;
}

function getBaseValue(element: SVGElement, ...attrs: string[]) {
    const result: ObjectMap<any> = {};
    for (let i = 0; i < attrs.length; ++i) {
        const attr = attrs[i];
        const item = element[attr];
        if (item) {
            result[attr] = item.baseVal.value;
            result[attr + 'AsString'] = item.baseVal.valueAsString;
        }
    }
    return result;
}

function createLinearGradient(element: SVGLinearGradientElement): SvgGradient {
    return {
        type: 'linear',
        element,
        spreadMethod: element.spreadMethod.baseVal,
        colorStops: getColorStop(element),
        ...getBaseValue(element, 'x1', 'x2', 'y1', 'y2')
    };
}

function createRadialGradient(element: SVGRadialGradientElement): SvgGradient {
    return {
        type: 'radial',
        element,
        spreadMethod: element.spreadMethod.baseVal,
        colorStops: getColorStop(element),
        ...getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr')
    };
}

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public precision?: number;
    public readonly definitions: SvgDefinitions = {
        clipPath: new Map<string, SVGClipPathElement>(),
        pattern: new Map<string, SVGPatternElement>(),
        gradient: new Map<string, SvgGradient>()
    };

    constructor(
        public readonly element: SVGSVGElement,
        public readonly documentRoot = true)
    {
        super(element);
        if (documentRoot) {
            this.viewport = this;
        }
        this.init();
    }

    public build(options: SvgBuildOptions) {
        this.precision = options?.precision;
        this.setRect();
        super.build(options);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (!this.documentRoot && this.animations.length > 0) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    public findFill(value: string | SVGGraphicsElement): Undef<SVGPatternElement> {
        if (typeof value !== 'string') {
            value = extractURL(getParentAttribute(value, 'fill')) || '';
        }
        if (value !== '') {
            const result = this.definitions.pattern.get(value);
            if (result) {
                return result;
            }
            const element = document.getElementById(value.substring(1));
            if (element instanceof SVGPatternElement) {
                return element;
            }
        }
        return undefined;
    }

    public findFillPattern(value: string | SVGGraphicsElement): Undef<SvgGradient> {
        if (typeof value !== 'string') {
            value = extractURL(getParentAttribute(value, 'fillPattern')) || '';
        }
        let result: Undef<SvgGradient>;
        if (value !== '') {
            result = this.definitions.gradient.get(value);
            if (!result) {
                const element = document.getElementById(value.substring(1));
                if (element) {
                    if (SVG.linearGradient(element)) {
                        result = createLinearGradient(element);
                    }
                    else if (SVG.radialGradient(element)) {
                        result = createRadialGradient(element);
                    }
                    if (result) {
                        this.definitions.gradient.set(value, result);
                    }
                }
            }
        }
        return result;
    }

    protected init() {
        const element = this.element;
        if (this.documentRoot) {
            cloneObject(element.viewBox.baseVal, this.aspectRatio);
            element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((animation: SVGAnimationElement) => {
                const target = getTargetElement(animation, element);
                if (target) {
                    animation.parentElement?.removeChild(animation);
                    target.appendChild(animation);
                }
            });
        }
        this.setDefinitions(element);
        element.querySelectorAll('defs').forEach(def => this.setDefinitions(def));
    }

    protected setDefinitions(item: SVGSVGElement | SVGDefsElement) {
        const definitions = this.definitions;
        item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element: SVGElement) => {
            let id = element.id.trim();
            if (id !== '') {
                id = '#' + id;
                if (SVG.clipPath(element)) {
                    if (!definitions.clipPath.has(id)) {
                        definitions.clipPath.set(id, element);
                    }
                }
                else if (SVG.pattern(element)) {
                    if (!definitions.pattern.has(id)) {
                        definitions.pattern.set(id, element);
                    }
                }
                else if (SVG.linearGradient(element)) {
                    if (!definitions.gradient.has(id)) {
                        definitions.gradient.set(id, createLinearGradient(element));
                    }
                }
                else if (SVG.radialGradient(element)) {
                    if (!definitions.gradient.has(id)) {
                        definitions.gradient.set(id, createRadialGradient(element));
                    }
                }
            }
        });
    }

    set contentMap(value) {
        this.definitions.contentMap = value;
    }
    get contentMap() {
        return this.definitions.contentMap;
    }

    get viewBox() {
        return this.element.viewBox.baseVal || { x: 0, y: 0, width: 0, height: 0 };
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG;
    }
}