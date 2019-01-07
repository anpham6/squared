import { SvgLinearGradient, SvgRadialGradient } from './@types/object';

import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';

import { getHrefTargetElement } from './lib/util';

const $dom = squared.lib.dom;

export default class Svg extends SvgView$MX(SvgContainer) implements squared.svg.Svg {
    public readonly patterns = {
        clipPath: new Map<string, SVGClipPathElement>(),
        gradient: new Map<string, Gradient>()
    };

    private _width: number | undefined;
    private _height: number | undefined;

    constructor(public readonly element: SVGSVGElement) {
        super(element);
        this.init();
    }

    private init() {
        this.element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((animation: SVGAnimationElement) => {
            const target = getHrefTargetElement(animation, this.element);
            if (target) {
                if (animation.parentElement) {
                    animation.parentElement.removeChild(animation);
                }
                target.appendChild(animation);
            }
        });
        this.element.querySelectorAll('clipPath, linearGradient, radialGradient').forEach((pattern: SVGElement) => {
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
    }

    set width(value) {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            this._width = value;
        }
        else {
            this.element.width.baseVal.value = value;
        }
    }
    get width() {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            if (this._width !== undefined) {
                return this._width;
            }
            else {
                const bounds = this.element.getBoundingClientRect();
                return bounds.width;
            }
        }
        else {
            return this.element.width.baseVal.value;
        }
    }

    set height(value) {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            this._height = value;
        }
        else {
            this.element.height.baseVal.value = value;
        }
    }
    get height() {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            if (this._height !== undefined) {
                return this._height;
            }
            else {
                const bounds = this.element.getBoundingClientRect();
                return bounds.height;
            }
        }
        else {
            return this.element.height.baseVal.value;
        }
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }
}