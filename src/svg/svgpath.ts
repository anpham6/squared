import { SvgPathBaseVal } from './@types/object';

import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { getTransformOrigin } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class SvgPath extends SvgElement implements squared.svg.SvgPath {
    public static getLine(x1: number, y1: number, x2 = 0, y2 = 0, checkValid = false) {
        return x1 !== 0 || y1 !== 0 || x2 !== 0 || y2 !== 0 || !checkValid ? `M${x1},${y1} L${x2},${y2}` : '';
    }

    public static getRect(width: number, height: number, x = 0, y = 0, checkValid = false) {
        return width > 0 && height > 0 || !checkValid ? `M${x},${y} h${width} v${height} h${-width} Z` : '';
    }

    public static getPolyline(points: Point[], checkValid = false) {
        return points.length || !checkValid ? `M${points.map(item => `${item.x},${item.y}`).join(' ')}` : '';
    }

    public static getPolygon(points: Point[]) {
        const value = SvgPath.getPolyline(points);
        return value !== '' ? value + ' Z' : '';
    }

    public static getCircle(cx: number, cy: number, r: number, checkValid = false) {
        return r > 0 || !checkValid ? SvgPath.getEllipse(cx, cy, r, r) : '';
    }

    public static getEllipse(cx: number, cy: number, rx: number, ry: number, checkValid = false) {
        return rx > 0 && ry > 0 || !checkValid ? `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0` : '';
    }

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
        points: null
    };

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

    private init() {
        const element = this.element;
        if (this.d === '') {
            switch (element.tagName) {
                case 'path': {
                    this.baseVal.d = $dom.cssAttribute(element, 'd');
                    const transform = this.transform;
                    if (transform.length) {
                        let commands = SvgBuild.toPathCommandList(this.baseVal.d);
                        if (commands.length) {
                            const points = SvgBuild.toAbsolutePointList(commands);
                            const [transformable, skewXY] = SvgBuild.canTransformSkew(commands) ? [transform, []] : SvgBuild.filterTransformSkew(transform);
                            const result = SvgBuild.applyTransforms(transformable, points, getTransformOrigin(element));
                            if (result.length) {
                                commands = SvgBuild.fromAbsolutePointList(commands, result);
                                if (commands.length) {
                                    this.d = SvgBuild.fromPathCommandList(commands);
                                    if (skewXY.length === 0) {
                                        this.transformed = true;
                                    }
                                    else {
                                        this.transform = skewXY;
                                    }
                                }
                            }
                        }
                    }
                    if (this.d === '') {
                        this.d = this.baseVal.d;
                    }
                    break;
                }
                case 'circle':
                case 'ellipse': {
                    let rx = 0;
                    let ry = 0;
                    if (element instanceof SVGCircleElement) {
                        this.baseVal.cx = element.cx.baseVal.value;
                        this.baseVal.cy = element.cy.baseVal.value;
                        this.baseVal.r = element.r.baseVal.value;
                        rx = this.baseVal.r;
                        ry = rx;
                    }
                    else if (element instanceof SVGEllipseElement) {
                        this.baseVal.cx = element.cx.baseVal.value;
                        this.baseVal.cy = element.cy.baseVal.value;
                        this.baseVal.rx = element.rx.baseVal.value;
                        this.baseVal.ry = element.ry.baseVal.value;
                        rx = this.baseVal.rx;
                        ry = this.baseVal.ry;
                    }
                    else {
                        return;
                    }
                    const transform = this.transform;
                    if (transform.length) {
                        const points: Required<PointR>[] = [
                            { x: this.baseVal.cx, y: this.baseVal.cy, rx, ry }
                        ];
                        const [transformable, skewXY] = SvgBuild.filterTransformSkew(transform);
                        const result = SvgBuild.applyTransforms(transformable, points, getTransformOrigin(element));
                        if (result.length) {
                            const pt = <Required<PointR>> result[0];
                            this.d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry, true);
                            if (skewXY.length === 0) {
                                this.transformed = true;
                            }
                            else {
                                this.transform = skewXY;
                            }
                        }
                    }
                    if (this.d === '') {
                        this.d = SvgPath.getEllipse(this.baseVal.cx, this.baseVal.cy, rx, ry, true);
                    }
                    break;
                }
                case 'line': {
                    const line = <SVGLineElement> element;
                    this.baseVal.x1 = line.x1.baseVal.value;
                    this.baseVal.y1 = line.y1.baseVal.value;
                    this.baseVal.x2 = line.x2.baseVal.value;
                    this.baseVal.y2 = line.y2.baseVal.value;
                    const transform = this.transform;
                    if (transform.length) {
                        const points: Point[] = [
                            { x: this.baseVal.x1, y: this.baseVal.y1 },
                            { x: this.baseVal.x2, y: this.baseVal.y2 }
                        ];
                        this.d = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                        this.transformed = true;
                    }
                    else {
                        this.d = SvgPath.getLine(this.baseVal.x1, this.baseVal.y1, this.baseVal.x2, this.baseVal.y2, true);
                    }
                    break;
                }
                case 'rect': {
                    const rect = <SVGRectElement> element;
                    this.baseVal.x = rect.x.baseVal.value;
                    this.baseVal.y = rect.y.baseVal.value;
                    this.baseVal.width = rect.width.baseVal.value;
                    this.baseVal.height = rect.height.baseVal.value;
                    const transform = this.transform;
                    if (transform.length) {
                        const points: Point[] = [
                            { x: this.baseVal.x, y: this.baseVal.y },
                            { x: this.baseVal.x + this.baseVal.width, y: this.baseVal.y },
                            { x: this.baseVal.x + this.baseVal.width, y: this.baseVal.y + this.baseVal.height },
                            { x: this.baseVal.x, y: this.baseVal.y + this.baseVal.height }
                        ];
                        this.d = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                        this.transformed = true;
                    }
                    else {
                        this.d = SvgPath.getRect(this.baseVal.width, this.baseVal.height, this.baseVal.x, this.baseVal.y, true);
                    }
                    break;
                }
                case 'polyline':
                case 'polygon': {
                    const polygon = <SVGPolygonElement> element;
                    this.baseVal.points = polygon.points;
                    let points: Point[] = SvgBuild.toPointList(polygon.points);
                    const transform = this.transform;
                    if (transform.length) {
                        points = SvgBuild.applyTransforms(transform, points, getTransformOrigin(element));
                        this.transformed = true;
                    }
                    this.d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
                    break;
                }
            }
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