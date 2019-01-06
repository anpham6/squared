import { SvgTransform } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';

import { createTransform } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;

const NAME_GRAPHICS = new Map<string, number>();

export default class SvgCreate implements squared.svg.SvgCreate {
    public static setName(element?: SVGElement) {
        if (element) {
            let result = '';
            let tagName: string | undefined;
            if (element.id) {
                if (!NAME_GRAPHICS.has(element.id)) {
                    result = element.id;
                }
                tagName = element.id;
            }
            else {
                tagName = element.tagName;
            }
            let index = NAME_GRAPHICS.get(tagName) || 0;
            if (result !== '') {
                NAME_GRAPHICS.set(tagName, index);
                return result;
            }
            else {
                NAME_GRAPHICS.set(tagName, ++index);
                return `${tagName}_${index}`;
            }
        }
        else {
            NAME_GRAPHICS.clear();
            return '';
        }
    }

    public static toColorStopList(element: SVGGradientElement) {
        const result: ColorStop[] = [];
        for (const stop of Array.from(element.getElementsByTagName('stop'))) {
            const color = $color.parseRGBA($dom.cssAttribute(stop, 'stop-color'), $dom.cssAttribute(stop, 'stop-opacity'));
            if (color && color.visible) {
                result.push({
                    color: color.valueRGBA,
                    offset: $dom.cssAttribute(stop, 'offset'),
                    opacity: color.alpha
                });
            }
        }
        return result;
    }

    public static toAnimateList(element: SVGElement) {
        const result: SvgAnimation[] = [];
        if (element instanceof SVGGraphicsElement) {
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGAnimationElement) {
                    if (item instanceof SVGAnimateTransformElement) {
                        result.push(new SvgAnimateTransform(item));
                    }
                    else if (item instanceof SVGAnimateMotionElement) {
                        result.push(new SvgAnimateMotion(item));
                    }
                    else if (item instanceof SVGAnimateElement) {
                        result.push(new SvgAnimate(item));
                    }
                    else {
                        result.push(new SvgAnimation(item));
                    }
                }
            }
        }
        return result;
    }

    public static toTransformList(transform: SVGTransformList) {
        const result: SvgTransform[] = [];
        for (let i = 0; i < transform.numberOfItems; i++) {
            const item = transform.getItem(i);
            result.push(createTransform(item.type, item.matrix, item.angle));
        }
        return result;
    }
}