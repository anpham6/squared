import { SvgPoint, SvgTransform, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgElement from './svgelement';
import SvgBuild from './svgbuild';

import { SVG, getTransform, getTransformOrigin } from './lib/util';

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static getLine(x1: number, y1: number, x2 = 0, y2 = 0) {
        return `M${x1},${y1} L${x2},${y2}`;
    }

    public static getCircle(cx: number, cy: number, r: number) {
        return SvgPath.getEllipse(cx, cy, r);
    }

    public static getEllipse(cx: number, cy: number, rx: number, ry?: number) {
        if (ry === undefined) {
            ry = rx;
        }
        return `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0`;
    }

    public static getRect(width: number, height: number, x = 0, y = 0) {
        return `M${x},${y} h${width} v${height} h${-width} Z`;
    }

    public static getPolygon(points: SvgPoint[] | DOMPoint[]) {
        const value = SvgPath.getPolyline(points);
        return value !== '' ? value + ' Z' : '';
    }

    public static getPolyline(points: SvgPoint[] | DOMPoint[]) {
        return points.length ? `M${(points as SvgPoint[]).map(pt => `${pt.x},${pt.y}`).join(' ')}` : '';
    }

    public name = '';
    public value = '';
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    private _transform?: SvgTransform[];

    constructor(
        public readonly element: SVGGraphicsElement,
        parentElement?: SVGGraphicsElement)
    {
        super(element);
        if (parentElement) {
            this.parentElement = parentElement;
        }
        else if (SVG.g(element.parentElement) || SVG.use(element.parentElement)) {
            this.parentElement = element.parentElement;
        }
        this.init();
    }

    public draw(transform?: SvgTransform[], residual?: SvgTransformResidual, save = true) {
        const element = this.element;
        let d = '';
        if (save) {
            this.transformed = null;
        }
        const parent = this.parent;
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (parent && parent.aspectRatio.unit !== 1 || transform && transform.length) {
                const commands = SvgBuild.toPathCommandList(d);
                if (commands.length) {
                    let points = SvgBuild.getAbsolutePoints(commands);
                    if (points.length) {
                        if (transform && transform.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transform] = residual.call(this, element, transform);
                            }
                            if (transform.length) {
                                points = this.transformPoints(transform, points);
                                this.transformed = transform;
                            }
                        }
                        if (parent) {
                            parent.refitPoints(points);
                        }
                        d = SvgBuild.fromPathCommandList(SvgBuild.mergeAbsolutePoints(commands, points));
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (parent) {
                parent.refitPoints(points);
            }
            d = SvgPath.getPolyline(points);
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            let rx: number;
            let ry: number;
            if (SVG.ellipse(element)) {
                rx = this.getBaseValue('rx');
                ry = this.getBaseValue('ry');
            }
            else {
                rx = this.getBaseValue('r');
                ry = rx;
            }
            let points: SvgPoint[] = [
                { x: this.getBaseValue('cx'), y: this.getBaseValue('cy'), rx, ry }
            ];
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform, rx, ry);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (parent) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (transform && transform.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                d = SvgPath.getPolygon(points);
            }
            else {
                if (parent) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                d = SvgPath.getRect(width, height, x, y);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (parent) {
                parent.refitPoints(points);
            }
            d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
        }
        if (save) {
            this.value = d;
        }
        return d;
    }

    public transformPoints(transform: SvgTransform[], points: Point[], center?: Point) {
        return SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element), center);
    }

    private init() {
        const element = this.element;
        if (SVG.path(element)) {
            this.setBaseValue('d');
        }
        else if (SVG.line(element)) {
            this.setBaseValue('x1');
            this.setBaseValue('y1');
            this.setBaseValue('x2');
            this.setBaseValue('y2');
        }
        else if (SVG.rect(element)) {
            this.setBaseValue('x');
            this.setBaseValue('y');
            this.setBaseValue('width');
            this.setBaseValue('height');
        }
        else if (SVG.circle(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('r');
        }
        else if (SVG.ellipse(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('rx');
            this.setBaseValue('ry');
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            this.setBaseValue('points', SvgBuild.clonePoints(element.points));
        }
        this.setPaint();
    }

    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgBuild.convertTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }
}