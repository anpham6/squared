import { SvgPathBaseValue, SvgPoint, SvgTransform } from './@types/object';

import SvgPaint$MX from './svgpaint-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { getTransformOrigin } from './lib/util';

const $dom = squared.lib.dom;

export default class SvgPath extends SvgPaint$MX(SvgElement) implements squared.svg.SvgPath {
    public static getLine(x1: number, y1: number, x2 = 0, y2 = 0) {
        return `M${x1},${y1} L${x2},${y2}`;
    }

    public static getCircle(cx: number, cy: number, r: number) {
        return SvgPath.getEllipse(cx, cy, r, r);
    }

    public static getEllipse(cx: number, cy: number, rx: number, ry: number) {
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
        return points.length ? `M${(points as SvgPoint[]).map(item => `${item.x},${item.y}`).join(' ')}` : '';
    }

    public nested = true;
    public d = '';
    public name!: string;
    public baseValue: SvgPathBaseValue = {
        d: null,
        cx: null,
        cy: null,
        r: null,
        rx: null,
        ry: null,
        x1: null,
        x2: null,
        y1: null,
        y2: null,
        x: null,
        y: null,
        width: null,
        height: null,
        points: null,
        transformed: null
    };
    public transformResidual?: SvgTransform[][];

    constructor(
        public readonly element: SVGGraphicsElement,
        public readonly parentElement?: SVGGraphicsElement)
    {
        super(element);
        if (parentElement === undefined && element.parentElement instanceof SVGGElement) {
            this.parentElement = element.parentElement;
        }
        this.init();
    }

    public build(exclusions?: number[], save = true, residual = true) {
        const element = this.element;
        let d = '';
        if (save) {
            this.baseValue.transformed = null;
        }
        if (element instanceof SVGPathElement) {
            d = this.baseValue.d || $dom.cssAttribute(element, 'd');
            const transform = SvgBuild.filterTransforms(this.transform, exclusions);
            if (transform.length) {
                let commands = SvgBuild.toPathCommandList(d);
                if (commands.length) {
                    const result = this.transformPoints(transform, SvgBuild.toAbsolutePointList(commands));
                    if (result.length) {
                        commands = SvgBuild.fromAbsolutePointList(commands, result);
                        if (commands.length) {
                            d = SvgBuild.fromPathCommandList(commands);
                            this.baseValue.transformed = transform;
                        }
                    }
                }
            }
        }
        else if (element instanceof SVGLineElement) {
            const x1 = this.baseValue.x1 !== null ? this.baseValue.x1 : element.x1.baseVal.value;
            const y1 = this.baseValue.y1 !== null ? this.baseValue.y1 : element.y1.baseVal.value;
            const x2 = this.baseValue.x2 !== null ? this.baseValue.x2 : element.x2.baseVal.value;
            const y2 = this.baseValue.y2 !== null ? this.baseValue.y2 : element.y2.baseVal.value;
            const transform = SvgBuild.filterTransforms(this.transform, exclusions);
            if (transform.length) {
                const points: SvgPoint[] = [
                    { x: x1, y: y1 },
                    { x: x2, y: y2 }
                ];
                const result = this.transformPoints(transform, points);
                if (result.length) {
                    d = SvgPath.getPolyline(result);
                    this.baseValue.transformed = transform;
                }
            }
            if (d === '') {
                d = SvgPath.getLine(x1, y1, x2, y2);
            }
        }
        else if (element instanceof SVGCircleElement || element instanceof SVGEllipseElement) {
            const cx = this.baseValue.cx !== null ? this.baseValue.cx : element.cx.baseVal.value;
            const cy = this.baseValue.cy !== null ? this.baseValue.cy : element.cy.baseVal.value;
            let rx = 0;
            let ry = 0;
            if (element instanceof SVGCircleElement) {
                rx = this.baseValue.r !== null ? this.baseValue.r : element.r.baseVal.value;
                ry = rx;
            }
            else if (element instanceof SVGEllipseElement) {
                rx = this.baseValue.rx !== null ? this.baseValue.rx : element.rx.baseVal.value;
                ry = this.baseValue.ry !== null ? this.baseValue.ry : element.ry.baseVal.value;
            }
            let transform = SvgBuild.filterTransforms(this.transform, exclusions);
            if (transform.length) {
                const points: SvgPoint[] = [
                    { x: cx, y: cy, rx, ry }
                ];
                if (residual) {
                    const index = transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
                    if (index !== -1 && (rx !== ry || transform.length > 1 && transform.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                        [this.transformResidual, transform] = SvgBuild.partitionTransforms(this.element, transform, true);
                    }
                }
                if (transform.length) {
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        const pt = <Required<SvgPoint>> result[0];
                        d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                        this.baseValue.transformed = transform;
                    }
                }
            }
            if (d === '') {
                d = SvgPath.getEllipse(cx, cy, rx, ry);
            }
        }
        else if (element instanceof SVGRectElement) {
            const x = this.baseValue.x !== null ? this.baseValue.x : element.x.baseVal.value;
            const y = this.baseValue.y !== null ? this.baseValue.y : element.y.baseVal.value;
            const width = this.baseValue.width !== null ? this.baseValue.width : element.width.baseVal.value;
            const height = this.baseValue.height !== null ? this.baseValue.height : element.height.baseVal.value;
            const transform = SvgBuild.filterTransforms(this.transform, exclusions);
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
                    this.baseValue.transformed = transform;
                }
            }
            if (d === '') {
                d = SvgPath.getRect(width, height, x, y);
            }
        }
        else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
            let points = this.baseValue.points !== null ? this.baseValue.points : SvgBuild.toPointList(element.points);
            const transform = SvgBuild.filterTransforms(this.transform, exclusions);
            if (transform.length) {
                const result = this.transformPoints(transform, points);
                if (result.length) {
                    points = result;
                    this.baseValue.transformed = transform;
                }
            }
            d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
        }
        if (save) {
            this.d = d;
        }
        return d;
    }

    public transformPoints(transform: SvgTransform[], points: Point[], center?: Point) {
        return SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element), center);
    }

    private init() {
        const element = this.element;
        if (element instanceof SVGPathElement) {
            this.baseValue.d = $dom.cssAttribute(element, 'd');
        }
        else if (element instanceof SVGLineElement) {
            this.baseValue.x1 = element.x1.baseVal.value;
            this.baseValue.y1 = element.y1.baseVal.value;
            this.baseValue.x2 = element.x2.baseVal.value;
            this.baseValue.y2 = element.y2.baseVal.value;
        }
        else if (element instanceof SVGRectElement) {
            this.baseValue.x = element.x.baseVal.value;
            this.baseValue.y = element.y.baseVal.value;
            this.baseValue.width = element.width.baseVal.value;
            this.baseValue.height = element.height.baseVal.value;
        }
        else if (element instanceof SVGCircleElement) {
            this.baseValue.cx = element.cx.baseVal.value;
            this.baseValue.cy = element.cy.baseVal.value;
            this.baseValue.r = element.r.baseVal.value;
        }
        else if (element instanceof SVGEllipseElement) {
            this.baseValue.cx = element.cx.baseVal.value;
            this.baseValue.cy = element.cy.baseVal.value;
            this.baseValue.rx = element.rx.baseVal.value;
            this.baseValue.ry = element.ry.baseVal.value;
        }
        else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
            this.baseValue.points = SvgBuild.toPointList(element.points);
        }
        this.setPaint();
    }
}