import SvgBaseVal$MX from './svgbaseval-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { INSTANCE_TYPE } from './lib/constant';
import { MATRIX, SVG } from './lib/util';

const { resolvePath } = squared.lib.util;

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
            for (const item of transforms) {
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
                            if (this.rotateAngle) {
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
        const { parent, translationOffset } = this;
        if (parent) {
            x = parent.refitX(x);
            y = parent.refitY(y);
            width = parent.refitSize(width);
            height = parent.refitSize(height);
        }
        if (translationOffset) {
            x += translationOffset.x;
            y += translationOffset.y;
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
        const result = super.x;
        if (result === 0) {
            const imageElement = this.imageElement;
            if (imageElement) {
                return imageElement.x.baseVal.value;
            }
        }
        return result;
    }

    set y(value) {
        super.y = value;
    }
    get y() {
        const result = super.y;
        if (result === 0) {
            const imageElement = this.imageElement;
            if (imageElement) {
                return imageElement.y.baseVal.value;
            }
        }
        return result;
    }

    set width(value) {
        super.width = value;
    }
    get width() {
        const result = super.width;
        if (result === 0) {
            const imageElement = this.imageElement;
            if (imageElement) {
                return imageElement.width.baseVal.value;
            }
        }
        return result;
    }

    set height(value) {
        super.height = value;
    }
    get height() {
        const result = super.height;
        if (result === 0) {
            const imageElement = this.imageElement;
            if (imageElement) {
                return imageElement.height.baseVal.value;
            }
        }
        return result;
    }

    get href() {
        const element = this.imageElement || this.element;
        if (SVG.image(element)) {
            return resolvePath(element.href.baseVal);
        }
        return '';
    }

    get transforms() {
        let result = super.transforms;
        if (!this.__get_transforms) {
            const imageElement = this.imageElement;
            if (imageElement) {
                result = result.concat(this.getTransforms(imageElement));
                this._transforms = result;
            }
            this.__get_transforms = true;
        }
        return result;
    }

    get animations() {
        let result = super.animations;
        if (!this.__get_animations) {
            const imageElement = this.imageElement;
            if (imageElement) {
                result = result.concat(this.getAnimations(imageElement));
                this._animations = result;
            }
            this.__get_animations = true;
        }
        return result;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_IMAGE;
    }
}