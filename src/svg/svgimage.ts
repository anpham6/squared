import { SvgPoint } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { SVG, applyMatrixX, applyMatrixY } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) implements squared.svg.SvgImage {
    public rotateOrigin?: SvgPoint;
    public readonly imageElement: SVGImageElement | null = null;

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        imageElement?: SVGImageElement)
    {
        super(element);
        if (imageElement) {
            this.imageElement = imageElement;
        }
    }

    public build() {
        this.setRect();
    }

    public extract(exclude?: number[]) {
        const transform = SvgBuild.filterTransforms(this.transform, exclude);
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;
        if (transform.length) {
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
                            if (this.rotateOrigin) {
                                this.rotateOrigin.angle = (this.rotateOrigin.angle || 0) + item.angle;
                            }
                            else {
                                this.rotateOrigin = { angle: item.angle, x: 0, y: 0 };
                            }
                        }
                        break;
                }
            }
            this.transformed = transform;
        }
        if (this.parent) {
            x = this.parent.refitX(x);
            y = this.parent.refitY(y);
            width = this.parent.refitSize(width);
            height = this.parent.refitSize(height);
        }
        if (this.translationOffset) {
            x += this.translationOffset.x;
            y += this.translationOffset.y;
        }
        this.setBaseValue('x', x);
        this.setBaseValue('y', y);
        this.setBaseValue('width', width);
        this.setBaseValue('height', height);
    }

    set x(value) {
        super.x = value;
    }
    get x() {
        const value = super.x;
        if (value === 0 && this.imageElement) {
            return this.imageElement.x.baseVal.value;
        }
        return value;
    }

    set y(value) {
        super.y = value;
    }
    get y() {
        const value = super.y;
        if (value === 0 && this.imageElement) {
            return this.imageElement.y.baseVal.value;
        }
        return value;
    }

    set width(value) {
        super.width = value;
    }
    get width() {
        const value = super.width;
        if (value === 0 && this.imageElement) {
            return this.imageElement.width.baseVal.value;
        }
        return value;
    }

    set height(value) {
        super.height = value;
    }
    get height() {
        const value = super.height;
        if (value === 0 && this.imageElement) {
            return this.imageElement.height.baseVal.value;
        }
        return value;
    }

    get href() {
        const element = this.imageElement || this.element;
        if (SVG.image(element)) {
            return $util.resolvePath(element.href.baseVal);
        }
        return '';
    }
}