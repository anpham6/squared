import { SvgLinearGradient, SvgRadialGradient, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';

import { SVG, getTargetElement } from './lib/util';

type SvgElement = squared.svg.SvgElement;
type SvgG = squared.svg.SvgG;
type SvgUseSymbol = squared.svg.SvgUseSymbol;
type SvgAnimation = squared.svg.SvgAnimation;

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public static instance(object: SvgElement): object is Svg {
        return object.element.tagName === 'svg';
    }

    public static instanceOfContainer(object: SvgElement): object is Svg | SvgG | SvgUseSymbol {
        return Svg.instance(object) || Svg.instanceOfG(object) || Svg.instanceOfUseSymbol(object);
    }

    public static instanceOfElement(object: SvgElement): object is SvgElement {
        return Svg.instanceOfShape(object) || Svg.instanceOfImage(object) || Svg.instanceOfUse(object) && !Svg.instanceOfUseSymbol(object);
    }

    public static instanceOfG(object: SvgElement): object is SvgG {
        return object.element.tagName === 'g';
    }

    public static instanceOfUseSymbol(object: SvgElement): object is SvgUseSymbol {
        return Svg.instanceOfUse(object) && object['symbolElement'] !== undefined;
    }

    public static instanceOfShape(object: SvgElement): object is squared.svg.SvgShape {
        return (Svg.instanceOfUse(object) || SVG.shape(object.element)) && object['path'] !== undefined;
    }

    public static instanceOfImage(object: SvgElement): object is squared.svg.SvgImage {
        return Svg.instanceOfUse(object) && object['imageElement'] !== undefined || object.element.tagName === 'image';
    }

    public static instanceOfUse(object: SvgElement): object is squared.svg.SvgUse {
        return object.element.tagName === 'use';
    }

    public static instanceOfSet(object: SvgAnimation) {
        return object.element.tagName === 'set';
    }

    public static instanceOfAnimate(object: SvgAnimation): object is squared.svg.SvgAnimate {
        return object.element.tagName === 'animate' && object.attributeName !== 'transform';
    }

    public static instanceOfAnimateTransform(object: SvgAnimation): object is squared.svg.SvgAnimateTransform {
        return object.element.tagName === 'animateTransform' || object.element.tagName === 'animate' && object.attributeName === 'transform';
    }

    public static instanceOfAnimateMotion(object: SvgAnimation): object is squared.svg.SvgAnimateMotion {
        return object.element.tagName === 'animateMotion';
    }

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
        if (!this.documentRoot && this.animate.length) {
            this.merge(this.getAnimateViewRect(), useKeyTime);
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
                            colorStop: SvgBuild.toColorStopList(pattern)
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