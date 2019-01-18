import { SvgGradient, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { SVG, getTargetElement } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;

function getColorStop(element: SVGGradientElement) {
    const result: ColorStop[] = [];
    Array.from(element.getElementsByTagName('stop')).forEach(item => {
        const color = $color.parseRGBA($dom.cssAttribute(item, 'stop-color'), $dom.cssAttribute(item, 'stop-opacity'));
        if (color) {
            result.push({
                color: color.valueRGBA,
                offset: $dom.cssAttribute(item, 'offset'),
                opacity: color.alpha
            });
        }
    });
    return result;
}

function getBaseValue(element: SVGGradientElement, ...attrs: string[]) {
    const result: ObjectMap<string | number> = {};
    for (const attr of attrs) {
        if (element[attr]) {
            result[attr] = element[attr].baseVal.value;
            result[`${attr}AsString`] = element[attr].baseVal.valueAsString;
        }
    }
    return result;
}

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public readonly patterns = {
        clipPath: new Map<string, SVGClipPathElement>(),
        gradient: new Map<string, SvgGradient>()
    };

    constructor(
        public readonly element: SVGSVGElement,
        public readonly documentRoot = true)
    {
        super(element);
        this.init();
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        this.setRect();
        super.build(exclusions, residual);
    }

    public synchronize(useKeyTime = false) {
        if (!this.documentRoot && this.animation.length) {
            this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    private init() {
        [this.element, ...Array.from(this.element.querySelectorAll('defs'))].forEach(item => {
            item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((animation: SVGAnimationElement) => {
                const target = getTargetElement(animation, this.element);
                if (target) {
                    if (animation.parentElement) {
                        animation.parentElement.removeChild(animation);
                    }
                    target.appendChild(animation);
                }
            });
            item.querySelectorAll('clipPath, linearGradient, radialGradient').forEach((pattern: SVGElement) => {
                if (pattern.id) {
                    const id = `#${pattern.id}`;
                    if (SVG.clipPath(pattern)) {
                        this.patterns.clipPath.set(id, pattern);
                    }
                    else if (SVG.linearGradient(pattern)) {
                        this.patterns.gradient.set(id, {
                            element: pattern,
                            type: 'linear',
                            colorStop: getColorStop(pattern),
                            ...getBaseValue(pattern, 'x1', 'x2', 'y1', 'y2')
                        });
                    }
                    else if (SVG.radialGradient(pattern)) {
                        this.patterns.gradient.set(id, {
                            element: pattern,
                            type: 'radial',
                            colorStop: getColorStop(pattern),
                            ...getBaseValue(pattern, 'cx', 'cy', 'r', 'fx', 'fy')
                        });
                    }
                }
            });
        });
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }
}