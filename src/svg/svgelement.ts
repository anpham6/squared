import { SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgCreate from './svgcreate';

import { getTransform, isSvgVisible, getRotateOrigin, getTransformOrigin } from './lib/util';

function getTransformRotate(transform: SvgTransform[]) {
    if (transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE && item.method.x && item.method.y) === 0) {
        return transform.shift();
    }
    return undefined;
}

export default abstract class SvgElement implements squared.svg.SvgElement {
    public animatable = true;
    public animate: SvgAnimation[];
    public visible: boolean;

    public readonly name: string;

    private _transformed = false;
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgCreate.setName(element);
        this.animate = this.animatable ? SvgCreate.toAnimateList(element) : [];
        this.visible = isSvgVisible(element);
    }

    public abstract build(): string;

    public filterTransform(exclusions?: number[]) {
        return (exclusions ? this.transform.filter(item => !exclusions.includes(item.type)) : this.transform).filter(item => !(item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a === 1 && item.matrix.d === 1));
    }

    public transformPoints(transform: SvgTransform[], points: Point[], center?: PointR) {
        let result: PointR[];
        if (center) {
            const rotate = getTransformRotate(transform);
            result = SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element), center);
            if (rotate) {
                Object.assign(center, { angle: rotate.angle, ...getRotateOrigin(this.element) });
                transform.unshift(rotate);
            }
        }
        else {
            result = SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element));
        }
        return result;
    }

    set transform(value) {
        this._transform = value;
    }
    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgCreate.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }

    set transformed(value) {
        this._transformed = value;
    }
    get transformed() {
        return this._transformed;
    }
}