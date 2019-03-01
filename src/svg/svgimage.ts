import SvgBaseVal$MX from './svgbaseval-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { INSTANCE_TYPE } from './lib/constant';
import { MATRIX, SVG } from './lib/util';

const $util = squared.lib.util;

export default class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) implements squared.svg.SvgImage {
    public rotateAngle?: number;
    public readonly imageElement: SVGImageElement | null = null;

    private __get_transforms = false;
    private __get_animations = false;

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
        const transforms = exclude ? SvgBuild.filterTransforms(this.transforms, exclude) : this.transforms;
        let { x, y, width, height } = this;
        if (transforms.length) {
            transforms.reverse();
            for (let i = 0; i < transforms.length; i++) {
                const item = transforms[i];
                const m = item.matrix;
                const localX = x;
                x = MATRIX.applyX(m, localX, y);
                y = MATRIX.applyY(m, localX, y);
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
                            if (this.rotateAngle !== undefined) {
                                this.rotateAngle += item.angle;
                            }
                            else {
                                this.rotateAngle = item.angle;
                            }
                        }
                        break;
                }
            }
            this.transformed = transforms;
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

    get transforms() {
        const transforms = super.transforms;
        if (!this.__get_transforms) {
            if (this.imageElement) {
                transforms.push(...this.getTransforms(this.imageElement));
            }
            this.__get_transforms = true;
        }
        return transforms;
    }

    get animations() {
        const animations = super.animations;
        if (!this.__get_animations) {
            if (this.imageElement) {
                animations.push(...this.getAnimations(this.imageElement));
            }
            this.__get_animations = true;
        }
        return animations;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_IMAGE;
    }
}