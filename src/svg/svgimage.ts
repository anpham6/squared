import { SvgImageBaseValue, SvgPoint } from './@types/object';

import SvgElement from './svgelement';

import { applyMatrixX, applyMatrixY } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgElement implements squared.svg.SvgImage {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public href: string;
    public baseValue: SvgImageBaseValue = {
        x: null,
        y: null,
        width: null,
        height: null,
        transformed: null
    };
    public rotateOrigin?: SvgPoint;

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        href = '')
    {
        super(element);
        this.x = element.x.baseVal.value;
        this.y = element.y.baseVal.value;
        this.width = element.width.baseVal.value;
        this.height = element.height.baseVal.value;
        if (element instanceof SVGUseElement) {
            this.href = href;
        }
        else {
            this.href = $util.resolvePath(element.href.baseVal) || href;
        }
        this.init();
    }

    public build(exclusions?: number[]) {
        const transform = this.transformFilter(exclusions);
        if (transform.length) {
            let x = this.x;
            let y = this.y;
            transform.reverse();
            for (let i = 0; i < transform.length; i++) {
                const item = transform[i];
                const m = item.matrix;
                const localX = x;
                x = applyMatrixX(m, localX, y);
                y = applyMatrixY(m, localX, y);
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        this.width *= m.a;
                        this.height *= m.d;
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.angle !== 0) {
                            if (m.a < 0) {
                                x += m.a * this.width;
                            }
                            if (m.c < 0) {
                                x += m.c * this.width;
                            }
                            if (m.b < 0) {
                                y += m.b * this.height;
                            }
                            if (m.d < 0) {
                                y += m.d * this.height;
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
            this.x = x;
            this.y = y;
            this.baseValue.transformed = transform;
        }
    }

    private init() {
        this.baseValue.x = this.x;
        this.baseValue.y = this.y;
        this.baseValue.width = this.width;
        this.baseValue.height = this.height;
    }
}