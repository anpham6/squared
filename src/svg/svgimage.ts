import { SvgTransform } from './types/object';

import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY, getTransform } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgElement implements squared.svg.SvgImage {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public href = '';

    private _transform: SvgTransform[] | undefined;
    private _transformed = false;

    constructor(public readonly element: SVGImageElement) {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
        this.href =  $util.resolvePath(element.href.baseVal);
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

    get drawable() {
        return false;
    }

    set transform(value) {
        this._transform = value;
    }
    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgBuild.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }

    set transformed(value) {
        this._transformed = value;
        if (!value) {
            this._transform = undefined;
        }
        else {
            if (this._transform !== undefined) {
                this._transform.length = 0;
            }
        }
    }
    get transformed() {
        return this._transformed;
    }
}