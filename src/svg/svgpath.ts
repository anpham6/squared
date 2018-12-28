import { SvgPathBaseVal } from './types/svg';

import SvgBuild from './svgbuild';

import { getTransformOrigin } from './lib/util';

import $color = squared.lib.color;
import $dom = squared.lib.dom;
import $util = squared.lib.util;

export default class SvgPath implements squared.svg.SvgPath {
    public static getLine(x1: number, y1: number, x2 = 0, y2 = 0, checkValid = false) {
        return x1 !== 0 || y1 !== 0 || x2 !== 0 || y2 !== 0 || !checkValid ? `M${x1},${y1} L${x2},${y2}` : '';
    }

    public static getRect(width: number, height: number, x = 0, y = 0, checkValid = false) {
        return width > 0 && height > 0 || !checkValid ? `M${x},${y} h${width} v${height} h${-width} Z` : '';
    }

    public static getPolyline(points: Point[] | DOMPoint[] | SVGPointList, checkValid = false) {
        points = points instanceof SVGPointList ? SvgBuild.toPointList(points) : points;
        return points.length || !checkValid ? `M${points.map(item => `${item.x},${item.y}`).join(' ')}` : '';
    }

    public static getPolygon(points: Point[] | DOMPoint[] | SVGPointList) {
        const value = SvgPath.getPolyline(points);
        return value !== '' ? value + ' Z' : '';
    }

    public static getCircle(cx: number, cy: number, r: number, checkValid = false) {
        return r > 0 || !checkValid ? SvgPath.getEllipse(cx, cy, r, r) : '';
    }

    public static getEllipse(cx: number, cy: number, rx: number, ry: number, checkValid = false) {
        return rx > 0 && ry > 0 || !checkValid ? `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0` : '';
    }

    public transformed = false;
    public opacity = 1;
    public color = '';
    public fillRule = '';
    public fill = '';
    public fillOpacity = '';
    public stroke = '';
    public strokeWidth = '';
    public strokeOpacity = '';
    public strokeLinecap = '';
    public strokeLinejoin = '';
    public strokeMiterlimit = '';
    public clipPath = '';
    public clipRule = '';
    public baseVal: SvgPathBaseVal = {
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
            const transform = element.transform.baseVal;
            switch (element.tagName) {
                case 'path': {
                    this.d = $dom.cssAttribute(element, 'd');
                    break;
                }
                case 'circle': {
                    const circle = <SVGCircleElement> element;
                    this.baseVal.cx = circle.cx.baseVal.value;
                    this.baseVal.cy = circle.cy.baseVal.value;
                    this.baseVal.r = circle.r.baseVal.value;
                    this.d = SvgPath.getCircle(this.baseVal.cx, this.baseVal.cy, this.baseVal.r, true);
                    break;
                }
                case 'ellipse': {
                    const ellipse = <SVGEllipseElement> element;
                    this.baseVal.cx = ellipse.cx.baseVal.value;
                    this.baseVal.cy = ellipse.cy.baseVal.value;
                    this.baseVal.rx = ellipse.rx.baseVal.value;
                    this.baseVal.ry = ellipse.ry.baseVal.value;
                    this.d = SvgPath.getEllipse(this.baseVal.cx, this.baseVal.cy, this.baseVal.rx, this.baseVal.ry, true);
                    break;
                }
                case 'line': {
                    const line = <SVGLineElement> element;
                    this.baseVal.x1 = line.x1.baseVal.value;
                    this.baseVal.y1 = line.y1.baseVal.value;
                    this.baseVal.x2 = line.x2.baseVal.value;
                    this.baseVal.y2 = line.y2.baseVal.value;
                    if (transform.numberOfItems) {
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
                    if (transform.numberOfItems) {
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
                    this.baseVal.points = SvgBuild.toPointList(polygon.points);
                    if (transform.numberOfItems) {
                        this.baseVal.points = SvgBuild.applyTransforms(transform, this.baseVal.points, getTransformOrigin(element));
                        this.transformed = true;
                    }
                    this.d = element.tagName === 'polygon' ? SvgPath.getPolygon(this.baseVal.points) : SvgPath.getPolyline(this.baseVal.points);
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