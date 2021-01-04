import SvgBaseVal$MX from './svgbaseval-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { MATRIX, SVG } from './lib/util';

const { resolvePath } = squared.lib.util;

export default class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) implements squared.svg.SvgImage {
    public rotateAngle?: number;
    public readonly imageElement: Null<SVGImageElement> = null;
    public readonly instanceType = squared.svg.constant.INSTANCE_TYPE.SVG_IMAGE;

    constructor(
        public readonly element: SVGImageElement | SVGUseElement,
        imageElement?: SVGImageElement)
    {
        super(element);
        if (imageElement) {
            this.imageElement = imageElement;
            this.rectElement = imageElement;
        }
    }

    public build() {
        this.setRect();
    }

    public renderStatic(exclude?: number[]) {
        let { x, y, width, height, parent: container } = this;
        const transforms = exclude ? SvgBuild.filterTransforms(this.transforms, exclude) : this.transforms;
        const length = transforms.length;
        if (length) {
            transforms.reverse();
            for (let i = 0; i < length; ++i) {
                const item = transforms[i];
                const m = item.matrix;
                const localX = x;
                x = MATRIX.applyX(m, localX, y);
                y = MATRIX.applyY(m, localX, y);
                let angle = this.rotateAngle;
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
                            if (angle) {
                                angle += item.angle;
                            }
                            else {
                                angle = item.angle;
                            }
                        }
                        break;
                }
                this.rotateAngle = angle;
            }
            this.transformed = transforms;
        }
        if (container) {
            if (this.imageElement) {
                const element = this.element as SVGUseElement;
                x += element.x.baseVal.value;
                y += element.y.baseVal.value;
            }
            x = container.refitX(x);
            y = container.refitY(y);
            width = container.refitSize(width);
            height = container.refitSize(height);
            do {
                if (SvgBuild.asSvg(container) || SvgBuild.isUse(container)) {
                    const { x: offsetX, y: offsetY } = container;
                    if (container = container.parent) {
                        if (offsetX !== 0) {
                            x += container.refitX(offsetX);
                        }
                        if (offsetY !== 0) {
                            y += container.refitY(offsetY);
                        }
                    }
                }
                else {
                    container = container.parent;
                }
            }
            while (container);
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
        return super.x || this.imageElement?.x.baseVal.value || 0;
    }

    set y(value) {
        super.y = value;
    }
    get y() {
        return super.y || this.imageElement?.y.baseVal.value || 0;
    }

    set width(value) {
        super.width = value;
    }
    get width() {
        return super.width || this.imageElement?.width.baseVal.value || 0;
    }

    set height(value) {
        super.height = value;
    }
    get height() {
        return super.height || this.imageElement?.height.baseVal.value || 0;
    }

    get href() {
        const element = this.imageElement || this.element;
        return SVG.image(element) ? resolvePath(element.href.baseVal) : '';
    }

    get transforms() {
        return !this._transforms ? this._transforms = this.imageElement ? super.transforms.concat(this.getTransforms(this.imageElement)) : super.transforms : this._transforms;
    }

    get animations() {
        return !this._animations ? this._animations = this.imageElement ? super.animations.concat(this.getAnimations(this.imageElement)) : super.animations : this._animations;
    }
}