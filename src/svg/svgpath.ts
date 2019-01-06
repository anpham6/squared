import { SvgPathBaseValue, SvgPoint, SvgTransform } from './@types/object';

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

    public static getPolygon(points: SvgPoint[] | DOMPoint[]) {
        const value = SvgPath.getPolyline(points);
        return value !== '' ? value + ' Z' : '';
    }

    public static getPolyline(points: SvgPoint[] | DOMPoint[]) {
        return points.length ? `M${(points as SvgPoint[]).map(item => `${item.x},${item.y}`).join(' ')}` : '';
    }

    public name!: string;
    public animatable = false;
    public opacity = 1;
    public color = '';
    public fill!: string;
    public fillPattern = '';
    public fillOpacity = '';
    public fillRule = '';
    public stroke!: string;
    public strokeWidth = '';
    public strokePattern = '';
    public strokeOpacity = '';
    public strokeLinecap = '';
    public strokeLinejoin = '';
    public strokeMiterlimit = '';
    public clipPath = '';
    public clipRule = '';
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
    public transformHost?: SvgTransform[][];

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
            this[`${attr}Pattern`] = match[1];
            value = '';
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

    public build(exclusions?: number[], save = true) {
        const element = this.element;
        let d = '';
        if (element instanceof SVGPathElement) {
            d = this.baseValue.d || $dom.cssAttribute(element, 'd');
            this.baseValue.transformed = null;
            const transform = this.transformFilter(exclusions);
            if (transform.length) {
                let commands = SvgBuild.toPathCommandList(d);
                if (commands.length) {
                    const points = SvgBuild.toAbsolutePointList(commands);
                    const result = this.transformPoints(transform, points);
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
            this.baseValue.transformed = null;
            const transform = this.transformFilter(exclusions);
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
            this.baseValue.transformed = null;
            let transform = this.transformFilter(exclusions);
            if (transform.length) {
                const points: SvgPoint[] = [
                    { x: cx, y: cy, rx, ry }
                ];
                const index = transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
                if (index !== -1 && (rx !== ry || transform.length > 1 && transform.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                    [this.transformHost, transform] = SvgBuild.partitionTransforms(this.element, transform, true);
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
            this.baseValue.transformed = null;
            const transform = this.transformFilter(exclusions);
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
            const transform = this.transformFilter(exclusions);
            this.baseValue.transformed = null;
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