import { SvgPoint } from './@types/object';

import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgViewRect$MX(SvgView$MX(SvgElement)) implements squared.svg.SvgImage {
    public rotateOrigin?: SvgPoint;

    public readonly imageElement: SVGImageElement | null;

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        imageElement?: SVGImageElement)
    {
        super(element);
        this.imageElement = imageElement || null;
        this.setRect();
    }

    public extract(exclude?: number[]) {
        const transform = SvgBuild.filterTransforms(this.transform, exclude);
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

    get x() {
        const value = super.x;
        if (value === 0 && this.imageElement) {
            return this.imageElement.x.baseVal.value;
        }
        return value;
    }

    get y() {
        const value = super.y;
        if (value === 0 && this.imageElement) {
            return this.imageElement.y.baseVal.value;
        }
        return value;
    }

    get width() {
        const value = super.width;
        if (value === 0 && this.imageElement) {
            return this.imageElement.width.baseVal.value;
        }
        return value;
    }

    get height() {
        const value = super.height;
        if (value === 0 && this.imageElement) {
            return this.imageElement.height.baseVal.value;
        }
        return value;
    }

    set href(value) {
        const element = this.imageElement || this.element;
        if (element instanceof SVGImageElement) {
            element.href.baseVal = value;
        }
    }
    get href() {
        const element = this.imageElement || this.element;
        if (element instanceof SVGImageElement) {
            return $util.resolvePath(element.href.baseVal);
        }
        return '';
    }
}