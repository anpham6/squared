import { SvgAspectRatio, SvgPoint, SvgTransform, SvgTransformResidual } from './@types/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgBaseVal from './svgbaseval';
import SvgBuild from './svgbuild';

import { SVG, getTransformOrigin } from './lib/util';

export default class SvgPath extends SvgPaint$MX(SvgBaseVal) implements squared.svg.SvgPath {
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
    public aspectRatio: SvgAspectRatio = {
        x: 0,
        y: 0,
        unit: 1
    };
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    constructor(
        public readonly element: SVGGraphicsElement,
        parentElement?: SVGGraphicsElement)
    {
        super(element);
        if (parentElement) {
            this.parentElement = parentElement;
        }
        else if (!parentElement && (SVG.g(element.parentElement) || SVG.use(element.parentElement))) {
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
        if (SVG.path(element)) {
            const value = this.getBaseValue('d');
            const aspectRatio = this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0 || this.aspectRatio.unit !== 1;
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    let commands = SvgBuild.toPathCommandList(value);
                    if (commands.length) {
                        const result = this.transformPoints(transform, aspectRatio ? this.applyAspectRatioPoints(SvgBuild.toAbsolutePointList(commands)) : SvgBuild.toAbsolutePointList(commands));
                        if (result.length) {
                            commands = SvgBuild.fromAbsolutePointList(commands, result);
                            if (commands.length) {
                                d = SvgBuild.fromPathCommandList(commands);
                                this.transformed = transform;
                            }
                        }
                    }
                }
            }
            if (aspectRatio && d === '') {
                let commands = SvgBuild.toPathCommandList(value);
                if (commands.length) {
                    const result = this.applyAspectRatioPoints(SvgBuild.toAbsolutePointList(commands));
                    if (result.length) {
                        commands = SvgBuild.fromAbsolutePointList(commands, result);
                        if (commands.length) {
                            d = SvgBuild.fromPathCommandList(commands);
                        }
                    }
                }
            }
            if (d === '') {
                d = value;
            }
        }
        else if (SVG.line(element)) {
            const x1 = this.applyAspectRatio(this.getBaseValue('x1')) + this.aspectRatio.x;
            const y1 = this.applyAspectRatio(this.getBaseValue('y1')) + this.aspectRatio.y;
            const x2 = this.applyAspectRatio(this.getBaseValue('x2')) + this.aspectRatio.x;
            const y2 = this.applyAspectRatio(this.getBaseValue('y2')) + this.aspectRatio.y;
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    const points: SvgPoint[] = [
                        { x: x1, y: y1 },
                        { x: x2, y: y2 }
                    ];
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        d = SvgPath.getPolyline(result);
                        this.transformed = transform;
                    }
                }
            }
            if (d === '') {
                d = SvgPath.getLine(x1, y1, x2, y2);
            }
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            let rx: number;
            let ry: number;
            if (SVG.circle(element)) {
                rx = this.applyAspectRatio(this.getBaseValue('r'));
                ry = rx;
            }
            else if (SVG.ellipse(element)) {
                rx = this.applyAspectRatio(this.getBaseValue('rx'));
                ry = this.applyAspectRatio(this.getBaseValue('ry'));
            }
            else {
                return '';
            }
            const cx = this.applyAspectRatio(this.getBaseValue('cx')) + this.aspectRatio.x;
            const cy = this.applyAspectRatio(this.getBaseValue('cy')) + this.aspectRatio.y;
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform, rx, ry);
                }
                if (transform.length) {
                    const points: SvgPoint[] = [
                        { x: cx, y: cy, rx, ry }
                    ];
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        const pt = <Required<SvgPoint>> result[0];
                        d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                        this.transformed = transform;
                    }
                }
            }
            if (d === '') {
                d = SvgPath.getEllipse(cx, cy, rx, ry);
            }
        }
        else if (SVG.rect(element)) {
            const x = this.applyAspectRatio(this.getBaseValue('x')) + this.aspectRatio.x;
            const y = this.applyAspectRatio(this.getBaseValue('y')) + this.aspectRatio.y;
            const width = this.applyAspectRatio(this.getBaseValue('width'));
            const height = this.applyAspectRatio(this.getBaseValue('height'));
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    const points: SvgPoint[] = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ];
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        d = SvgPath.getPolygon(result);
                        this.transformed = transform;
                    }
                }
            }
            if (d === '') {
                d = SvgPath.getRect(width, height, x, y);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            this.applyAspectRatioPoints(points);
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        points = result;
                        this.transformed = transform;
                    }
                }
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
            this.setBaseValue('points', SvgBuild.toPointList(element.points));
        }
        this.setPaint();
    }

    private applyAspectRatio(value = 0) {
        return value * this.aspectRatio.unit;
    }

    private applyAspectRatioPoints(values: SvgPoint[]) {
        for (const pt of values) {
            pt.x = this.applyAspectRatio(pt.x) + this.aspectRatio.x;
            pt.y = this.applyAspectRatio(pt.y) + this.aspectRatio.y;
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx = this.applyAspectRatio(pt.rx);
                pt.ry = this.applyAspectRatio(pt.ry);
            }
        }
        return values;
    }
}