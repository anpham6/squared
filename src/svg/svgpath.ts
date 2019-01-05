import { SvgPathBaseVal, SvgTransform } from './@types/object';

import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgPath extends SvgElement implements squared.svg.SvgPath {
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

    public static getPolygon(points: Point[] | DOMPoint[]) {
        const value = SvgPath.getPolyline(points);
        return value !== '' ? value + ' Z' : '';
    }

    public static getPolyline(points: Point[] | DOMPoint[]) {
        return points.length ? `M${(points as Point[]).map(item => `${item.x},${item.y}`).join(' ')}` : '';
    }

    public animatable = false;
    public opacity = 1;
    public color = '';
    public fillRule = '';
    public fill!: string;
    public fillOpacity = '';
    public stroke!: string;
    public strokeWidth = '';
    public strokeOpacity = '';
    public strokeLinecap = '';
    public strokeLinejoin = '';
    public strokeMiterlimit = '';
    public clipPath = '';
    public clipRule = '';
    public baseVal: SvgPathBaseVal = {
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
    public rotateOrigin?: PointR;
    public transformResidual?: SvgTransform[];

    constructor(
        public readonly element: SVGGraphicsElement,
        public d = '')
    {
        super(element);
        this.init();
    }

    public setColor(attr: string) {
        let value = $dom.cssAttribute(this.element, attr);
        const match = $util.REGEX_PATTERN.CSS_URL.exec(value);
        if (match) {
            value = `@${match[1]}`;
        }
        else if (value !== '') {
            switch (value.toLowerCase()) {
                case 'none':
                case 'transparent':
                case 'rgba(0, 0, 0, 0)':
                    value = '';
                    break;
                case 'currentcolor': {
                    const color = $color.parseRGBA($dom.cssAttribute(this.element, 'color', true));
                    value = color ? color.valueRGB : '#000000';
                    break;
                }
                default: {
                    const color = $color.parseRGBA(value);
                    if (color) {
                        value = color.valueRGB;
                    }
                    break;
                }
            }
        }
        else {
            if (attr === 'fill' && !(this.element.parentElement instanceof SVGGElement)) {
                value = '#000000';
            }
        }
        this[attr] = value;
    }

    public setOpacity(attr: string) {
        const opacity = $dom.cssAttribute(this.element, `${attr}-opacity`);
        this[`${attr}Opacity`] = opacity ? (parseFloat(opacity) * this.opacity).toString() : this.opacity.toString();
    }

    public build(exclusions?: number[], savePath = true) {
        const element = this.element;
        let d = '';
        if (element instanceof SVGPathElement) {
            d = this.baseVal.d || $dom.cssAttribute(element, 'd');
            const transform = this.filterTransform(exclusions);
            if (transform.length) {
                let commands = SvgBuild.toPathCommandList(d);
                if (commands.length) {
                    const points = SvgBuild.toAbsolutePointList(commands);
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        commands = SvgBuild.fromAbsolutePointList(commands, result);
                        if (commands.length) {
                            d = SvgBuild.fromPathCommandList(commands);
                            this.transformed = true;
                            this.baseVal.transformed = transform;
                        }
                    }
                }
            }
        }
        else if (element instanceof SVGLineElement) {
            const x1 = this.baseVal.x1 !== null ? this.baseVal.x1 : element.x1.baseVal.value;
            const y1 = this.baseVal.y1 !== null ? this.baseVal.y1 : element.y1.baseVal.value;
            const x2 = this.baseVal.x2 !== null ? this.baseVal.x2 : element.x2.baseVal.value;
            const y2 = this.baseVal.y2 !== null ? this.baseVal.y2 : element.y2.baseVal.value;
            const transform = this.filterTransform(exclusions);
            if (transform.length) {
                const points: Point[] = [
                    { x: x1, y: y1 },
                    { x: x2, y: y2 }
                ];
                const result = this.transformPoints(transform, points);
                if (result.length) {
                    d = SvgPath.getPolyline(result);
                    this.transformed = true;
                    this.baseVal.transformed = transform;
                }
            }
            if (d === '') {
                d = SvgPath.getLine(x1, y1, x2, y2);
            }
        }
        else if (element instanceof SVGCircleElement || element instanceof SVGEllipseElement) {
            const cx = this.baseVal.cx !== null ? this.baseVal.cx : element.cx.baseVal.value;
            const cy = this.baseVal.cy !== null ? this.baseVal.cy : element.cy.baseVal.value;
            let rx = 0;
            let ry = 0;
            if (element instanceof SVGCircleElement) {
                rx = this.baseVal.r !== null ? this.baseVal.r : element.r.baseVal.value;
                ry = rx;
            }
            else if (element instanceof SVGEllipseElement) {
                rx = this.baseVal.rx !== null ? this.baseVal.rx : element.rx.baseVal.value;
                ry = this.baseVal.ry !== null ? this.baseVal.ry : element.ry.baseVal.value;
            }
            const transform = this.filterTransform(exclusions);
            if (transform.length) {
                const points: PointR[] = [
                    { x: cx, y: cy, rx, ry }
                ];
                const index = transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
                this.transformResidual = index > 0 ? transform.splice(0, index) : undefined;
                const center: Point | undefined = index !== -1 && (rx !== ry || transform.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d)) ? { x: cx, y: cy } : undefined;
                const result = this.transformPoints(transform, points, center);
                if (result.length) {
                    const pt = <Required<PointR>> result[0];
                    d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                    if (center) {
                        this.rotateOrigin = center;
                    }
                    this.transformed = true;
                    this.baseVal.transformed = transform;
                }
            }
            if (d === '') {
                d = SvgPath.getEllipse(cx, cy, rx, ry);
            }
        }
        else if (element instanceof SVGRectElement) {
            const x = this.baseVal.x !== null ? this.baseVal.x : element.x.baseVal.value;
            const y = this.baseVal.y !== null ? this.baseVal.y : element.y.baseVal.value;
            const width = this.baseVal.width !== null ? this.baseVal.width : element.width.baseVal.value;
            const height = this.baseVal.height !== null ? this.baseVal.height : element.height.baseVal.value;
            const transform = this.filterTransform(exclusions);
            if (transform.length) {
                const points: Point[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                const result = this.transformPoints(transform, points);
                if (result.length) {
                    d = SvgPath.getPolygon(result);
                    this.transformed = true;
                    this.baseVal.transformed = transform;
                }
            }
            if (d === '') {
                d = SvgPath.getRect(width, height, x, y);
            }
        }
        else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
            let points = this.baseVal.points !== null ? this.baseVal.points : SvgBuild.toPointList(element.points);
            const transform = this.filterTransform(exclusions);
            if (transform.length) {
                const result = this.transformPoints(transform, points);
                if (result.length) {
                    points = result;
                    this.transformed = true;
                    this.baseVal.transformed = transform;
                }
            }
            d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
        }
        if (savePath) {
            this.d = d;
        }
        return d;
    }

    private init() {
        const element = this.element;
        if (element instanceof SVGPathElement) {
            this.baseVal.d = $dom.cssAttribute(element, 'd');
        }
        else if (element instanceof SVGLineElement) {
            this.baseVal.x1 = element.x1.baseVal.value;
            this.baseVal.y1 = element.y1.baseVal.value;
            this.baseVal.x2 = element.x2.baseVal.value;
            this.baseVal.y2 = element.y2.baseVal.value;
        }
        else if (element instanceof SVGRectElement) {
            this.baseVal.x = element.x.baseVal.value;
            this.baseVal.y = element.y.baseVal.value;
            this.baseVal.width = element.width.baseVal.value;
            this.baseVal.height = element.height.baseVal.value;
        }
        else if (element instanceof SVGCircleElement) {
            this.baseVal.cx = element.cx.baseVal.value;
            this.baseVal.cy = element.cy.baseVal.value;
            this.baseVal.r = element.r.baseVal.value;
        }
        else if (element instanceof SVGEllipseElement) {
            this.baseVal.cx = element.cx.baseVal.value;
            this.baseVal.cy = element.cy.baseVal.value;
            this.baseVal.rx = element.rx.baseVal.value;
            this.baseVal.ry = element.ry.baseVal.value;
        }
        else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
            this.baseVal.points = SvgBuild.toPointList(element.points);
        }
        const clipPath = $util.REGEX_PATTERN.CSS_URL.exec($dom.cssAttribute(element, 'clip-path'));
        if (clipPath) {
            this.clipPath = clipPath[1];
            this.clipRule = $dom.cssAttribute(element, 'clip-rule', true);
        }
        const opacity = $dom.cssAttribute(element, 'opacity');
        if (opacity !== '') {
            this.opacity = Math.min(parseFloat(opacity), 1);
        }
        this.setColor('fill');
        if (this.fill !== '') {
            this.setOpacity('fill');
            this.fillRule = $dom.cssAttribute(element, 'fill-rule', true);
        }
        this.setColor('stroke');
        if (this.stroke !== '') {
            this.setOpacity('stroke');
            this.strokeWidth = $dom.cssAttribute(element, 'stroke-width') || '1';
            this.strokeLinecap = $dom.cssAttribute(element, 'stroke-linecap', true);
            this.strokeLinejoin = $dom.cssAttribute(element, 'stroke-linejoin', true);
            this.strokeMiterlimit = $dom.cssAttribute(element, 'stroke-miterlimit', true);
        }
    }
}