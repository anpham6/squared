import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY } from './lib/util';

import $util = squared.lib.util;

export default class SvgImage extends SvgElement implements squared.svg.SvgImage {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public uri = '';

    constructor(public readonly element: SVGImageElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
        this.uri =  $util.resolvePath(element.href.baseVal);
    }

    public setExternal() {
        const transform = this.element.transform.baseVal;
        if (transform.numberOfItems) {
            let x = this.x;
            let y = this.y;
            for (let i = transform.numberOfItems - 1; i >= 0; i--) {
                const item = transform.getItem(i);
                const matrix = item.matrix;
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        x += matrix.e;
                        y += matrix.f;
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        x *= matrix.a;
                        y *= matrix.d;
                        this.width *= matrix.a;
                        this.height *= matrix.d;
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        x = applyMatrixX(matrix, x, x);
                        y = applyMatrixY(matrix, y, y);
                        if (matrix.a < 0) {
                            x += matrix.a * this.width;
                        }
                        if (matrix.c < 0) {
                            x += matrix.c * this.width;
                        }
                        if (matrix.b < 0) {
                            y += matrix.b * this.height;
                        }
                        if (matrix.d < 0) {
                            y += matrix.d * this.height;
                        }
                        break;
                }
            }
            this.x = x;
            this.y = y;
        }
    }

    get drawable() {
        return false;
    }
}