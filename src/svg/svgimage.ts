import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgElement implements squared.svg.SvgImage {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public href: string;

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        href = '')
    {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
        this.href = element instanceof SVGUseElement ? href : $util.resolvePath(element.href.baseVal);
    }

    public transformRect() {
        const transform = this.transform;
        if (transform.length) {
            let x = this.x;
            let y = this.y;
            const [skewXY, transformable] = $util.partitionArray(transform, item => item.type === SVGTransform.SVG_TRANSFORM_SKEWX || item.type === SVGTransform.SVG_TRANSFORM_SKEWY);
            transformable.reverse();
            for (let i = 0; i < transformable.length; i++) {
                const item = transformable[i];
                const matrix = item.matrix;
                switch (item.type) {
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
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        x += matrix.e;
                        y += matrix.f;
                        break;
                }
            }
            this.x = x;
            this.y = y;
            this.transform = skewXY;
            this.transformed = skewXY.length === 0;
        }
    }
}