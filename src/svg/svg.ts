import { SvgGradient, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
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
                const target = getTargetElement(animation, this.documentRoot ? this.element : undefined);
                if (target) {
                    if (animation.parentElement) {
                        animation.parentElement.removeChild(animation);
                    }
                    target.appendChild(animation);
                }
            });
            item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((definition: SVGElement) => {
                if (definition.id) {
                    const id = `#${definition.id}`;
                    if (SVG.clipPath(definition)) {
                        this.definitions.clipPath.set(id, definition);
                    }
                    else if (SVG.pattern(definition)) {
                        this.definitions.pattern.set(id, definition);
                    }
                    else if (SVG.linearGradient(definition)) {
                        this.definitions.gradient.set(id, {
                            element: definition,
                            type: 'linear',
                            colorStop: getColorStop(definition),
                            ...getBaseValue(definition, 'x1', 'x2', 'y1', 'y2')
                        });
                    }
                    else if (SVG.radialGradient(definition)) {
                        this.definitions.gradient.set(id, {
                            element: definition,
                            type: 'radial',
                            colorStop: getColorStop(definition),
                            ...getBaseValue(definition, 'cx', 'cy', 'r', 'fx', 'fy')
                        });
                    }
                }
            });
        });
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG;
    }
}