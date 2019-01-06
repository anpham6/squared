import { SvgPoint } from './@types/object';

import SvgViewRect$MX from './svgviewrect-mx';
import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgViewRect$MX(SvgElement) implements squared.svg.SvgImage {
    public rotateOrigin?: SvgPoint;

    private _href = '';

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        href?: string)
    {
        super(element);
        if (href) {
            this._href = href;
        }
        this.setRect();
    }

    public build(exclusions?: number[]) {
        const transform = this.transformFilter(exclusions);
        if (transform.length) {
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;
            transform.reverse();
            for (let i = 0; i < transform.length; i++) {
                const item = transform[i];
                const m = item.matrix;
                const localX = x;
                x = applyMatrixX(m, localX, y);
                y = applyMatrixY(m, localX, y);
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        width *= m.a;
                        height *= m.d;
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.angle !== 0) {
                            if (m.a < 0) {
                                x += m.a * width;
                            }
                            if (m.c < 0) {
                                x += m.c * width;
                            }
                            if (m.b < 0) {
                                y += m.b * height;
                            }
                            if (m.d < 0) {
                                y += m.d * height;
                            }
                            if (this.rotateOrigin === undefined) {
                                this.rotateOrigin = {
                                    angle: item.angle,
                                    x: 0,
                                    y: 0
                                };
                            }
                            else {
                                this.rotateOrigin.angle = (this.rotateOrigin.angle || 0) + item.angle;
                            }
                        }
                        break;
                }
            }
            Object.assign(this.baseValue, {
                x,
                y,
                width,
                height,
                transform
            });
        }
    }

    set href(value) {
        this._href = value;
        if (this.element instanceof SVGImageElement) {
            this.element.href.baseVal = value;
        }
    }
    get href() {
        if (this.element instanceof SVGUseElement) {
            return this._href;
        }
        else {
            return $util.resolvePath(this.element.href.baseVal) || this._href;
        }
    }
}