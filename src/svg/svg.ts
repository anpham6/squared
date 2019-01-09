import { SvgLinearGradient, SvgRadialGradient } from './@types/object';

import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';

import { getHrefTargetElement } from './lib/util';

export default class Svg extends SvgViewRect$MX(SvgView$MX(SvgContainer)) implements squared.svg.Svg {
    public readonly documentRoot: boolean;

    public readonly patterns = {
        clipPath: new Map<string, SVGClipPathElement>(),
        gradient: new Map<string, Gradient>()
    };

    constructor(public readonly element: SVGSVGElement) {
        super(element);
        this.documentRoot = element.parentElement instanceof HTMLElement;
        this.init();
        this.setRect();
    }

    public synchronize(useKeyTime = false) {
        if (!this.documentRoot && this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
        }
        super.synchronize(useKeyTime);
    }

    private init() {
        [this.element, ...Array.from(this.element.querySelectorAll(':scope > defs'))].forEach(item => {
            item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((animation: SVGAnimationElement) => {
                const target = getHrefTargetElement(animation, this.element);
                if (target) {
                    if (animation.parentElement) {
                        animation.parentElement.removeChild(animation);
                    }
                    target.appendChild(animation);
                }
            });
            item.querySelectorAll(':scope > clipPath, :scope > linearGradient, :scope > radialGradient').forEach((pattern: SVGElement) => {
                if (pattern.id) {
                    const id = `#${pattern.id}`;
                    if (pattern instanceof SVGClipPathElement) {
                        this.patterns.clipPath.set(id, pattern);
                    }
                    else if (pattern instanceof SVGLinearGradientElement) {
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
                            colorStop: SvgBuild.toColorStopList(pattern)
                        });
                    }
                    else if (pattern instanceof SVGRadialGradientElement) {
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
                            colorStop: SvgBuild.toColorStopList(pattern)
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