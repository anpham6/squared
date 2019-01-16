import { SvgLinearGradient, SvgRadialGradient, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

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

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public readonly patterns = {
        clipPath: new Map<string, SVGClipPathElement>(),
        gradient: new Map<string, Gradient>()
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
                        this.patterns.gradient.set(id, <SvgLinearGradient> {
                            type: 'linear',
                            x1: pattern.x1.baseVal.value,
                            x2: pattern.x2.baseVal.value,
                            y1: pattern.y1.baseVal.value,
                            y2: pattern.y2.baseVal.value,
                            x1AsString: pattern.x1.baseVal.valueAsString,
                            x2AsString: pattern.x2.baseVal.valueAsString,
                            y1AsString: pattern.y1.baseVal.valueAsString,
                            y2AsString: pattern.y2.baseVal.valueAsString,
                            colorStop: getColorStop(pattern)
                        });
                    }
                    else if (SVG.radialGradient(pattern)) {
                        this.patterns.gradient.set(id, <SvgRadialGradient> {
                            type: 'radial',
                            cx: pattern.cx.baseVal.value,
                            cy: pattern.cy.baseVal.value,
                            r: pattern.r.baseVal.value,
                            cxAsString: pattern.cx.baseVal.valueAsString,
                            cyAsString: pattern.cy.baseVal.valueAsString,
                            rAsString: pattern.r.baseVal.valueAsString,
                            fx: pattern.fx.baseVal.value,
                            fy: pattern.fy.baseVal.value,
                            fxAsString: pattern.fx.baseVal.valueAsString,
                            fyAsString: pattern.fy.baseVal.valueAsString,
                            colorStop: getColorStop(pattern)
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