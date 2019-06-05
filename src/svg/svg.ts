import { SvgBuildOptions, SvgGradient, SvgSynchronizeOptions } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getDOMRect, getTargetElement } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function getColorStop(element: SVGGradientElement) {
    const result: ColorStop[] = [];
    const stops = element.getElementsByTagName('stop');
    const length = stops.length;
    for (let i = 0; i < length; i++) {
        const item = stops[i];
        const color = $color.parseColor($dom.getNamedItem(item, 'stop-color'), $dom.getNamedItem(item, 'stop-opacity'));
        if (color) {
            result.push({
                color,
                offset: parseFloat($dom.getNamedItem(item, 'offset')) / 100
            });
        }
    }
    return result;
}

function getBaseValue(element: SVGElement, ...attrs: string[]) {
    const result: ObjectMap<any> = {};
    for (const attr of attrs) {
        if (element[attr]) {
            result[attr] = element[attr].baseVal.value;
            result[`${attr}AsString`] = element[attr].baseVal.valueAsString;
        }
    }
    return result;
}

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public precision?: number;
    public readonly definitions = {
        clipPath: new Map<string, SVGClipPathElement>(),
        pattern: new Map<string, SVGPatternElement>(),
        gradient: new Map<string, SvgGradient>()
    };

    constructor(
        public readonly element: SVGSVGElement,
        public readonly documentRoot = true)
    {
        super(element);
        this.init();
    }

    public build(options: SvgBuildOptions) {
        this.precision = options && options.precision;
        this.setRect();
        super.build(options);
    }

    public synchronize(options?: SvgSynchronizeOptions) {
        if (!this.documentRoot && this.animations.length) {
            this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
        }
        super.synchronize(options);
    }

    private init() {
        if (this.documentRoot) {
            $util.cloneObject(this.element.viewBox.baseVal, this.aspectRatio);
            this.element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((element: SVGAnimationElement) => {
                const target = getTargetElement(element, this.element);
                if (target) {
                    if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }
                    target.appendChild(element);
                }
            });
        }
        this.setDefinitions(this.element);
        this.element.querySelectorAll('defs').forEach(element => this.setDefinitions(element));
    }

    private setDefinitions(item: SVGElement) {
        item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element: SVGElement) => {
            if (element.id) {
                const id = `#${element.id}`;
                if (SVG.clipPath(element)) {
                    this.definitions.clipPath.set(id, element);
                }
                else if (SVG.pattern(element)) {
                    this.definitions.pattern.set(id, element);
                }
                else if (SVG.linearGradient(element)) {
                    this.definitions.gradient.set(id, {
                        type: 'linear',
                        element,
                        spreadMethod: element.spreadMethod.baseVal,
                        colorStops: getColorStop(element),
                        ...getBaseValue(element, 'x1', 'x2', 'y1', 'y2')
                    });
                }
                else if (SVG.radialGradient(element)) {
                    this.definitions.gradient.set(id, {
                        type: 'radial',
                        element,
                        spreadMethod: element.spreadMethod.baseVal,
                        colorStops: getColorStop(element),
                        ...getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr')
                    });
                }
            }
        });
    }

    get viewBox() {
        return this.element.viewBox.baseVal || getDOMRect(this.element);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG;
    }
}