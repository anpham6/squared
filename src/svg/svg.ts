import { SvgBuildOptions, SvgGradient, SvgSynchronizeOptions } from '../../@types/svg/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getDOMRect, getTargetElement } from './lib/util';

const {
    color: $color,
    dom: $dom,
    util: $util
} = squared.lib;

function getColorStop(element: SVGGradientElement) {
    const result: ColorStop[] = [];
    const stops = element.getElementsByTagName('stop');
    const length = stops.length;
    for (let i = 0; i < length; i++) {
        const item = stops[i];
        const color = $color.parseColor($dom.getNamedItem(item, 'stop-color'), $util.convertFloat($dom.getNamedItem(item, 'stop-opacity') || '1'));
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
        const item = element[attr];
        if (item) {
            const baseVal = item.baseVal;
            result[attr] = baseVal.value;
            result[attr + 'AsString'] = baseVal.valueAsString;
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
        const element = this.element;
        if (this.documentRoot) {
            $util.cloneObject(element.viewBox.baseVal, this.aspectRatio);
            element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((animation: SVGAnimationElement) => {
                const target = getTargetElement(animation, element);
                if (target) {
                    const parentElement = animation.parentElement;
                    if (parentElement) {
                        parentElement.removeChild(animation);
                    }
                    target.appendChild(animation);
                }
            });
        }
        this.setDefinitions(element);
        element.querySelectorAll('defs').forEach(def => this.setDefinitions(def));
    }

    private setDefinitions(item: SVGElement) {
        const definitions = this.definitions;
        item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element: SVGElement) => {
            if (element.id) {
                const id = '#' + element.id;
                if (SVG.clipPath(element)) {
                    definitions.clipPath.set(id, element);
                }
                else if (SVG.pattern(element)) {
                    definitions.pattern.set(id, element);
                }
                else if (SVG.linearGradient(element)) {
                    definitions.gradient.set(id, {
                        type: 'linear',
                        element,
                        spreadMethod: element.spreadMethod.baseVal,
                        colorStops: getColorStop(element),
                        ...getBaseValue(element, 'x1', 'x2', 'y1', 'y2')
                    });
                }
                else if (SVG.radialGradient(element)) {
                    definitions.gradient.set(id, {
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